import { db } from '../../db/connection';
import { invoices, invoiceItems } from './billing.schema';
import { patientAdmissions } from '../admissions/admissions.schema';
import { patientOperations } from '../operations/operations.schema';
import { labOrders } from '../orders/orders.schema';
import { radiologyOrders } from '../orders/orders.schema';
import { patientVisits, patients } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { eq, and, desc, ilike, or, ne } from 'drizzle-orm';

import {
  BillingSummaryDTO,
  GenerateInvoiceDTO,
  InvoiceDataDTO,
  InvoiceItemDataDTO,
  PaymentMethod,
  PaymentStatus,
  RecordPaymentDTO,
  ServiceCategory,
  UnbilledEncounterDTO,
} from './billing.types';

export class BillingRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  public static async generateBillNumber(): Promise<string> {
    const isDb = this.checkDb();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (isDb) {
      const [latest] = await db
        .select({ billNumber: invoices.billNumber })
        .from(invoices)
        .orderBy(desc(invoices.createdAt))
        .limit(1);

      if (!latest || !latest.billNumber) {
        return `INV-${todayStr}-0001`;
      }

      const parts = latest.billNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
      return `INV-${todayStr}-${String(nextSeq).padStart(4, '0')}`;
    } else {
      const count = mockInvoices.length + 1;
      return `INV-${todayStr}-${String(count).padStart(4, '0')}`;
    }
  }

  // 1. Get Billing Summary Dashboard
  public static async getBillingSummary(search?: string): Promise<BillingSummaryDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      const searchCondition = search && search.trim().length > 0
        ? or(
            ilike(patients.firstName, `%${search.trim()}%`),
            ilike(patients.lastName, `%${search.trim()}%`),
            ilike(patients.mrNumber, `%${search.trim()}%`),
            ilike(patientVisits.visitNumber, `%${search.trim()}%`)
          )
        : undefined;

      const encounters = await db
        .select({
          visitId: patientVisits.id,
          patientId: patientVisits.patientId,
          doctorId: patientVisits.doctorId,
          visitNumber: patientVisits.visitNumber,
          tokenNumber: patientVisits.tokenNumber,
          visitDate: patientVisits.visitDate,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
          patientAge: patients.age,
          patientGender: patients.gender,
          patientMobile: patients.mobileNumber,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
          consultationFee: doctors.consultationFee,
        })
        .from(patientVisits)
        .innerJoin(patients, eq(patientVisits.patientId, patients.id))
        .innerJoin(doctors, eq(patientVisits.doctorId, doctors.id))
        .where(searchCondition)
        .orderBy(desc(patientVisits.visitDate));

      const resultEncounters: UnbilledEncounterDTO[] = [];

      for (const enc of encounters) {
        // Check if invoice exists
        const [existingInvoice] = await db
          .select()
          .from(invoices)
          .where(eq(invoices.visitId, enc.visitId))
          .limit(1);

        // Count lab orders
        const labs = await db
          .select()
          .from(labOrders)
          .where(and(eq(labOrders.visitId, enc.visitId), ne(labOrders.status, 'CANCELLED')));

        // Count radiology orders
        const rads = await db
          .select()
          .from(radiologyOrders)
          .where(and(eq(radiologyOrders.visitId, enc.visitId), ne(radiologyOrders.status, 'CANCELLED')));

        // Check admission
        const [adm] = await db
          .select()
          .from(patientAdmissions)
          .where(and(eq(patientAdmissions.visitId, enc.visitId), ne(patientAdmissions.status, 'CANCELLED')))
          .limit(1);

        // Check operation
        const [opt] = await db
          .select()
          .from(patientOperations)
          .where(and(eq(patientOperations.visitId, enc.visitId), ne(patientOperations.status, 'CANCELLED')))
          .limit(1);

        const fee = Number(enc.consultationFee) || 1500;
        let estimatedTotal = fee;

        // Estimate lab total
        labs.forEach((l) => {
          const nameLower = l.testName.toLowerCase();
          if (nameLower.includes('cbc')) estimatedTotal += 1000;
          else if (nameLower.includes('lft')) estimatedTotal += 1500;
          else if (nameLower.includes('rft')) estimatedTotal += 1500;
          else if (nameLower.includes('fbs')) estimatedTotal += 300;
          else if (nameLower.includes('urine')) estimatedTotal += 500;
          else estimatedTotal += 800;
        });

        // Estimate rad total
        rads.forEach((r) => {
          if (r.modality === 'ULTRASOUND') estimatedTotal += 2500;
          else if (r.modality === 'CT') estimatedTotal += 8000;
          else if (r.modality === 'MRI') estimatedTotal += 12000;
          else estimatedTotal += 1200; // XRAY
        });

        if (adm) estimatedTotal += Number(adm.roomCharges) || 5000;
        if (opt) estimatedTotal += Number(opt.operationCharges) || 20000;

        resultEncounters.push({
          visitId: enc.visitId,
          patientId: enc.patientId,
          doctorId: enc.doctorId,
          visitNumber: enc.visitNumber,
          tokenNumber: enc.tokenNumber,
          visitDate: enc.visitDate,
          patientName: `${enc.patientFirstName} ${enc.patientLastName}`,
          patientMrNumber: enc.patientMrNumber,
          patientAge: enc.patientAge,
          patientGender: enc.patientGender,
          patientMobile: enc.patientMobile,
          doctorName: `${enc.doctorFirstName} ${enc.doctorLastName}`,
          consultationFee: fee,
          labOrdersCount: labs.length,
          radiologyOrdersCount: rads.length,
          hasAdmission: !!adm,
          hasOperation: !!opt,
          estimatedTotal: existingInvoice ? Number(existingInvoice.totalAmount) : estimatedTotal,
          invoiceId: existingInvoice?.id || null,
          billNumber: existingInvoice?.billNumber || null,
          paymentStatus: (existingInvoice?.paymentStatus as PaymentStatus) || null,
        });
      }

      // Summary totals
      const allInvoices = await db.select().from(invoices);
      const todayTotalInvoiced = allInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
      const todayRevenueCollected = allInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
      const pendingBillsCount = allInvoices.filter((inv) => inv.paymentStatus === 'PENDING').length;

      return {
        todayTotalInvoiced,
        todayRevenueCollected,
        pendingBillsCount,
        encounters: resultEncounters,
      };
    } else {
      return {
        todayTotalInvoiced: mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        todayRevenueCollected: mockInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
        pendingBillsCount: mockInvoices.filter((inv) => inv.paymentStatus === PaymentStatus.PENDING).length,
        encounters: mockUnbilledEncounters,
      };
    }
  }

  // 2. Auto-Generate Bill for Visit Encounter
  public static async generateInvoice(
    data: GenerateInvoiceDTO,
    receptionistId: string,
    receptionistName: string
  ): Promise<InvoiceDataDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      // Check if invoice already exists
      const existing = await this.getInvoiceByVisitId(data.visitId);
      if (existing) {
        return existing;
      }

      // Fetch visit encounter details
      const [visitInfo] = await db
        .select({
          visitId: patientVisits.id,
          patientId: patientVisits.patientId,
          doctorId: patientVisits.doctorId,
          visitNumber: patientVisits.visitNumber,
          tokenNumber: patientVisits.tokenNumber,
          visitDate: patientVisits.visitDate,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
          patientMobile: patients.mobileNumber,
          patientAge: patients.age,
          patientGender: patients.gender,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
          consultationFee: doctors.consultationFee,
        })
        .from(patientVisits)
        .innerJoin(patients, eq(patientVisits.patientId, patients.id))
        .innerJoin(doctors, eq(patientVisits.doctorId, doctors.id))
        .where(eq(patientVisits.id, data.visitId))
        .limit(1);

      if (!visitInfo) {
        throw new Error('Patient visit encounter not found.');
      }

      const billNumber = await this.generateBillNumber();

      // Collect itemized charges
      const itemsToInsert: {
        serviceCategory: ServiceCategory;
        itemDescription: string;
        unitPrice: number;
        quantity: number;
        totalPrice: number;
      }[] = [];

      // 1. Doctor Consultation Fee
      const docFee = Number(visitInfo.consultationFee) || 1500;
      itemsToInsert.push({
        serviceCategory: ServiceCategory.CONSULTATION,
        itemDescription: `Doctor Consultation Fee (${visitInfo.doctorFirstName} ${visitInfo.doctorLastName})`,
        unitPrice: docFee,
        quantity: 1,
        totalPrice: docFee,
      });

      // 2. Laboratory Test Orders
      const labs = await db
        .select()
        .from(labOrders)
        .where(and(eq(labOrders.visitId, data.visitId), ne(labOrders.status, 'CANCELLED')));

      labs.forEach((l) => {
        let price = 800;
        const nameLower = l.testName.toLowerCase();
        if (nameLower.includes('cbc')) price = 1000;
        else if (nameLower.includes('lft')) price = 1500;
        else if (nameLower.includes('rft')) price = 1500;
        else if (nameLower.includes('fbs')) price = 300;
        else if (nameLower.includes('urine')) price = 500;

        itemsToInsert.push({
          serviceCategory: ServiceCategory.LAB,
          itemDescription: `Laboratory Test: ${l.testName} (${l.category})`,
          unitPrice: price,
          quantity: 1,
          totalPrice: price,
        });
      });

      // 3. Radiology Imaging Orders
      const rads = await db
        .select()
        .from(radiologyOrders)
        .where(and(eq(radiologyOrders.visitId, data.visitId), ne(radiologyOrders.status, 'CANCELLED')));

      rads.forEach((r) => {
        let price = 1200; // XRAY
        if (r.modality === 'ULTRASOUND') price = 2500;
        else if (r.modality === 'CT') price = 8000;
        else if (r.modality === 'MRI') price = 12000;

        itemsToInsert.push({
          serviceCategory: ServiceCategory.RADIOLOGY,
          itemDescription: `Radiology Diagnostic Imaging: ${r.procedureName} (${r.modality})`,
          unitPrice: price,
          quantity: 1,
          totalPrice: price,
        });
      });

      // 4. Admission Room Charges
      const [adm] = await db
        .select()
        .from(patientAdmissions)
        .where(and(eq(patientAdmissions.visitId, data.visitId), ne(patientAdmissions.status, 'CANCELLED')))
        .limit(1);

      if (adm) {
        const roomCharge = Number(adm.roomCharges) || 5000;
        itemsToInsert.push({
          serviceCategory: ServiceCategory.ADMISSION,
          itemDescription: `Inpatient Room Admission Charge (${adm.roomName})`,
          unitPrice: roomCharge,
          quantity: 1,
          totalPrice: roomCharge,
        });
      }

      // 5. Operation Charges
      const [opt] = await db
        .select()
        .from(patientOperations)
        .where(and(eq(patientOperations.visitId, data.visitId), ne(patientOperations.status, 'CANCELLED')))
        .limit(1);

      if (opt) {
        const optCharge = Number(opt.operationCharges) || 20000;
        itemsToInsert.push({
          serviceCategory: ServiceCategory.OPERATION,
          itemDescription: `Surgical Operation Charge (${opt.operationName})`,
          unitPrice: optCharge,
          quantity: 1,
          totalPrice: optCharge,
        });
      }

      const totalAmount = itemsToInsert.reduce((sum, item) => sum + item.totalPrice, 0);

      // Create Invoice Master
      const [insertedInvoice] = await db
        .insert(invoices)
        .values({
          billNumber,
          visitId: data.visitId,
          patientId: visitInfo.patientId,
          doctorId: visitInfo.doctorId,
          receptionistId,
          receptionistName,
          subtotal: String(totalAmount),
          totalAmount: String(totalAmount),
          paidAmount: '0.00',
          remainingAmount: String(totalAmount),
          paymentStatus: 'PENDING',
          paymentMethod: 'CASH',
        })
        .returning();

      // Insert Invoice Items
      const createdItems: InvoiceItemDataDTO[] = [];
      for (const item of itemsToInsert) {
        const [insertedItem] = await db
          .insert(invoiceItems)
          .values({
            invoiceId: insertedInvoice.id,
            serviceCategory: item.serviceCategory,
            itemDescription: item.itemDescription,
            unitPrice: String(item.unitPrice),
            quantity: item.quantity,
            totalPrice: String(item.totalPrice),
          })
          .returning();

        createdItems.push({
          id: insertedItem.id,
          invoiceId: insertedItem.invoiceId,
          serviceCategory: insertedItem.serviceCategory as ServiceCategory,
          itemDescription: insertedItem.itemDescription,
          unitPrice: Number(insertedItem.unitPrice),
          quantity: insertedItem.quantity,
          totalPrice: Number(insertedItem.totalPrice),
          createdAt: insertedItem.createdAt,
        });
      }

      return {
        id: insertedInvoice.id,
        billNumber,
        visitId: insertedInvoice.visitId,
        patientId: insertedInvoice.patientId,
        doctorId: insertedInvoice.doctorId,
        receptionistId,
        receptionistName,
        subtotal: totalAmount,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CASH,
        paymentDate: null,
        patientName: `${visitInfo.patientFirstName} ${visitInfo.patientLastName}`,
        patientMrNumber: visitInfo.patientMrNumber,
        patientMobile: visitInfo.patientMobile,
        patientAge: visitInfo.patientAge,
        patientGender: visitInfo.patientGender,
        doctorName: `${visitInfo.doctorFirstName} ${visitInfo.doctorLastName}`,
        visitNumber: visitInfo.visitNumber,
        tokenNumber: visitInfo.tokenNumber,
        visitDate: visitInfo.visitDate,
        items: createdItems,
        createdAt: insertedInvoice.createdAt,
        updatedAt: insertedInvoice.updatedAt,
      };
    } else {
      const billNumber = await this.generateBillNumber();
      const items: InvoiceItemDataDTO[] = [
        {
          id: `item-1`,
          invoiceId: `inv-${Date.now()}`,
          serviceCategory: ServiceCategory.CONSULTATION,
          itemDescription: 'Doctor Consultation Fee (Dr. Zafar Iqbal)',
          unitPrice: 1500,
          quantity: 1,
          totalPrice: 1500,
          createdAt: new Date(),
        },
      ];
      const inv: InvoiceDataDTO = {
        id: `inv-${Date.now()}`,
        billNumber,
        visitId: data.visitId,
        patientId: 'mock-p-id',
        doctorId: 'mock-d-id',
        receptionistId,
        receptionistName,
        subtotal: 1500,
        totalAmount: 1500,
        paidAmount: 0,
        remainingAmount: 1500,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.CASH,
        patientName: 'Mock Patient',
        patientMrNumber: 'MRN-MOCK',
        patientMobile: '03001234567',
        patientAge: 30,
        patientGender: 'Male',
        doctorName: 'Dr. Zafar Iqbal',
        visitNumber: 'VISIT-001',
        tokenNumber: 1,
        visitDate: new Date(),
        items,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockInvoices.push(inv);
      return inv;
    }
  }

  // 3. Record Payment & Mark as PAID
  public static async recordPayment(
    invoiceId: string,
    data: RecordPaymentDTO,
    receptionistId: string,
    receptionistName: string
  ): Promise<InvoiceDataDTO> {
    const isDb = this.checkDb();
    const pMethod = data.paymentMethod || PaymentMethod.CASH;

    if (isDb) {
      const [existing] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .limit(1);

      if (!existing) {
        throw new Error('Invoice not found.');
      }

      const total = Number(existing.totalAmount);
      const paid = data.amountPaid !== undefined ? data.amountPaid : total;
      const remaining = Math.max(0, total - paid);
      const status = remaining === 0 ? 'PAID' : 'PENDING';

      await db
        .update(invoices)
        .set({
          paidAmount: String(paid),
          remainingAmount: String(remaining),
          paymentStatus: status,
          paymentMethod: pMethod,
          paymentDate: new Date(),
          receptionistId,
          receptionistName,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoiceId));

      return (await this.getInvoiceById(invoiceId))!;
    } else {
      const inv = mockInvoices.find((i) => i.id === invoiceId);
      if (inv) {
        inv.paidAmount = inv.totalAmount;
        inv.remainingAmount = 0;
        inv.paymentStatus = PaymentStatus.PAID;
        inv.paymentMethod = pMethod;
        inv.paymentDate = new Date();
      }
      return inv!;
    }
  }

  // 4. Get Invoice by Visit ID
  public static async getInvoiceByVisitId(visitId: string): Promise<InvoiceDataDTO | null> {
    const isDb = this.checkDb();
    if (isDb) {
      const [inv] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.visitId, visitId))
        .limit(1);

      if (!inv) return null;
      return await this.getInvoiceById(inv.id);
    } else {
      return mockInvoices.find((i) => i.visitId === visitId) || null;
    }
  }

  // 5. Get Invoice by ID
  public static async getInvoiceById(invoiceId: string): Promise<InvoiceDataDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [inv] = await db
        .select({
          id: invoices.id,
          billNumber: invoices.billNumber,
          visitId: invoices.visitId,
          patientId: invoices.patientId,
          doctorId: invoices.doctorId,
          receptionistId: invoices.receptionistId,
          receptionistName: invoices.receptionistName,
          subtotal: invoices.subtotal,
          totalAmount: invoices.totalAmount,
          paidAmount: invoices.paidAmount,
          remainingAmount: invoices.remainingAmount,
          paymentStatus: invoices.paymentStatus,
          paymentMethod: invoices.paymentMethod,
          paymentDate: invoices.paymentDate,
          createdAt: invoices.createdAt,
          updatedAt: invoices.updatedAt,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
          patientMobile: patients.mobileNumber,
          patientAge: patients.age,
          patientGender: patients.gender,
          doctorFirstName: doctors.firstName,
          doctorLastName: doctors.lastName,
          visitNumber: patientVisits.visitNumber,
          tokenNumber: patientVisits.tokenNumber,
          visitDate: patientVisits.visitDate,
        })
        .from(invoices)
        .innerJoin(patients, eq(invoices.patientId, patients.id))
        .innerJoin(patientVisits, eq(invoices.visitId, patientVisits.id))
        .innerJoin(doctors, eq(invoices.doctorId, doctors.id))
        .where(eq(invoices.id, invoiceId))
        .limit(1);

      if (!inv) return null;

      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, invoiceId));

      return {
        id: inv.id,
        billNumber: inv.billNumber,
        visitId: inv.visitId,
        patientId: inv.patientId,
        doctorId: inv.doctorId,
        receptionistId: inv.receptionistId,
        receptionistName: inv.receptionistName,
        subtotal: Number(inv.subtotal),
        totalAmount: Number(inv.totalAmount),
        paidAmount: Number(inv.paidAmount),
        remainingAmount: Number(inv.remainingAmount),
        paymentStatus: inv.paymentStatus as PaymentStatus,
        paymentMethod: inv.paymentMethod as PaymentMethod,
        paymentDate: inv.paymentDate,
        patientName: `${inv.patientFirstName} ${inv.patientLastName}`,
        patientMrNumber: inv.patientMrNumber,
        patientMobile: inv.patientMobile,
        patientAge: inv.patientAge,
        patientGender: inv.patientGender,
        doctorName: `${inv.doctorFirstName} ${inv.doctorLastName}`,
        visitNumber: inv.visitNumber,
        tokenNumber: inv.tokenNumber,
        visitDate: inv.visitDate,
        items: items.map((item) => ({
          id: item.id,
          invoiceId: item.invoiceId,
          serviceCategory: item.serviceCategory as ServiceCategory,
          itemDescription: item.itemDescription,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
          totalPrice: Number(item.totalPrice),
          createdAt: item.createdAt,
        })),
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      };
    } else {
      return mockInvoices.find((i) => i.id === invoiceId) || null;
    }
  }
}

export const mockInvoices: InvoiceDataDTO[] = [];
export const mockUnbilledEncounters: UnbilledEncounterDTO[] = [];
