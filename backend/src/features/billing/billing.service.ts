import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';
import { db } from '../../db/connection';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { BillingRepository } from './billing.repository';
import {
  BillingSummaryDTO,
  GenerateInvoiceDTO,
  InvoiceDataDTO,
  RecordPaymentDTO,
} from './billing.types';

export class BillingService {
  // 1. Get Billing Summary Dashboard
  public static async getBillingSummary(search?: string): Promise<BillingSummaryDTO> {
    return await BillingRepository.getBillingSummary(search);
  }

  // 2. Auto-Generate Invoice for Visit Encounter
  public static async generateInvoice(
    data: GenerateInvoiceDTO,
    userId: string,
    ipAddress?: string
  ): Promise<InvoiceDataDTO> {
    const isDb = (global as any).authServiceDbConnected ?? false;

    let receptionistName = 'Receptionist Staff';
    if (isDb) {
      const [u] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (u) {
        receptionistName = `${u.firstName} ${u.lastName}`;
      }
    }

    const invoice = await BillingRepository.generateInvoice(data, userId, receptionistName);

    await logAudit({
      userId,
      action: 'GENERATED_BILL',
      module: 'Billing',
      details: `Generated read-only invoice ${invoice.billNumber} for ${invoice.patientName} (${invoice.patientMrNumber}) total Rs. ${invoice.totalAmount}`,
      ipAddress,
    });

    return invoice;
  }

  // 3. Record Payment & Mark as PAID
  public static async recordPayment(
    invoiceId: string,
    data: RecordPaymentDTO,
    userId: string,
    ipAddress?: string
  ): Promise<InvoiceDataDTO> {
    const isDb = (global as any).authServiceDbConnected ?? false;

    if (isDb) {
      const existing = await BillingRepository.getInvoiceById(invoiceId);
      if (!existing) {
        throw new NotFoundError('Invoice record not found.');
      }
      if (existing.paymentStatus === 'PAID') {
        throw new BadRequestError('Invoice has already been marked as PAID.');
      }
    }

    let receptionistName = 'Receptionist Staff';
    if (isDb) {
      const [u] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (u) {
        receptionistName = `${u.firstName} ${u.lastName}`;
      }
    }

    const paidInvoice = await BillingRepository.recordPayment(invoiceId, data, userId, receptionistName);

    await logAudit({
      userId,
      action: 'RECORDED_PAYMENT',
      module: 'Billing',
      details: `Recorded payment of Rs. ${paidInvoice.paidAmount} via ${paidInvoice.paymentMethod} for Invoice #${paidInvoice.billNumber} (Status: ${paidInvoice.paymentStatus})`,
      ipAddress,
    });

    return paidInvoice;
  }

  // 4. Get Invoice by Visit ID
  public static async getInvoiceByVisitId(visitId: string): Promise<InvoiceDataDTO | null> {
    return await BillingRepository.getInvoiceByVisitId(visitId);
  }

  // 5. Get Invoice by ID
  public static async getInvoiceById(invoiceId: string): Promise<InvoiceDataDTO | null> {
    return await BillingRepository.getInvoiceById(invoiceId);
  }
}
