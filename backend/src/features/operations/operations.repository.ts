import { db } from '../../db/connection';
import { patientOperations } from './operations.schema';
import { billingCharges } from '../admissions/admissions.schema';
import { patients } from '../patients/patients.schema';
import { eq, desc, sql } from 'drizzle-orm';

import {
  CreateOperationDTO,
  OperationRecordDTO,
  OperationStatus,
} from './operations.types';

export class OperationsRepository {
  private static checkDb(): boolean {
    return (global as any).authServiceDbConnected ?? false;
  }

  public static async generateOperationNumber(): Promise<string> {
    const isDb = this.checkDb();
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (isDb) {
      const [latest] = await db
        .select({ operationNumber: patientOperations.operationNumber })
        .from(patientOperations)
        .orderBy(desc(patientOperations.createdAt))
        .limit(1);

      if (!latest || !latest.operationNumber) {
        return `OPT-${todayStr}-0001`;
      }

      const parts = latest.operationNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;
      return `OPT-${todayStr}-${String(nextSeq).padStart(4, '0')}`;
    } else {
      const count = mockOperations.length + 1;
      return `OPT-${todayStr}-${String(count).padStart(4, '0')}`;
    }
  }

  // 1. Create Operation Record & Post Billing Entry
  public static async createOperation(
    data: CreateOperationDTO,
    doctorName: string
  ): Promise<OperationRecordDTO> {
    const isDb = this.checkDb();
    const operationChargesValue = data.operationCharges !== undefined ? data.operationCharges : 20000;
    const urgencyValue = data.urgency || 'ELECTIVE';

    if (isDb) {
      const operationNumber = await this.generateOperationNumber();

      const [inserted] = await db
        .insert(patientOperations)
        .values({
          operationOrderId: data.operationOrderId || null,
          visitId: data.visitId,
          patientId: data.patientId,
          doctorId: data.doctorId,
          doctorName,
          operationNumber,
          operationName: data.operationName,
          operationCharges: String(operationChargesValue),
          urgency: urgencyValue,
          status: 'PENDING',
          notes: data.notes || null,
          operationDate: new Date(),
        })
        .returning();

      // Post Billing Charge Entry (once)
      const [charge] = await db
        .insert(billingCharges)
        .values({
          visitId: data.visitId,
          patientId: data.patientId,
          sourceModule: 'OPERATION',
          sourceId: inserted.id,
          itemDescription: `Surgical Operation Charge (${data.operationName})`,
          amount: String(operationChargesValue),
          isPaid: false,
        })
        .returning();

      // Fetch patient info
      const [pat] = await db
        .select({
          firstName: patients.firstName,
          lastName: patients.lastName,
          mrNumber: patients.mrNumber,
        })
        .from(patients)
        .where(eq(patients.id, data.patientId))
        .limit(1);

      return {
        id: inserted.id,
        operationOrderId: inserted.operationOrderId,
        visitId: inserted.visitId,
        patientId: inserted.patientId,
        doctorId: inserted.doctorId,
        doctorName: inserted.doctorName,
        operationNumber,
        operationName: inserted.operationName,
        operationCharges: Number(inserted.operationCharges),
        urgency: inserted.urgency,
        status: OperationStatus.PENDING,
        notes: inserted.notes,
        operationDate: inserted.operationDate,
        billingChargeId: charge.id,
        patientName: pat ? `${pat.firstName} ${pat.lastName}` : 'Patient',
        patientMrNumber: pat?.mrNumber || '',
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      };
    } else {
      const operationNumber = await this.generateOperationNumber();
      const rec: OperationRecordDTO = {
        id: `opt-${Date.now()}`,
        operationOrderId: data.operationOrderId || null,
        visitId: data.visitId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        doctorName,
        operationNumber,
        operationName: data.operationName,
        operationCharges: operationChargesValue,
        urgency: urgencyValue,
        status: OperationStatus.PENDING,
        notes: data.notes || null,
        operationDate: new Date(),
        patientName: 'Mock Patient',
        patientMrNumber: 'MRN-MOCK',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOperations.push(rec);
      return rec;
    }
  }

  // 2. Cancel Operation
  public static async cancelOperation(
    operationId: string,
    reason?: string
  ): Promise<OperationRecordDTO> {
    const isDb = this.checkDb();

    if (isDb) {
      await db
        .update(patientOperations)
        .set({
          status: 'CANCELLED',
          notes: reason ? sql`concat(coalesce(${patientOperations.notes}, ''), ' | Cancelled: ', ${reason})` : undefined,
          updatedAt: new Date(),
        })
        .where(eq(patientOperations.id, operationId));

      const [r] = await db
        .select()
        .from(patientOperations)
        .where(eq(patientOperations.id, operationId))
        .limit(1);

      return {
        id: r.id,
        operationOrderId: r.operationOrderId,
        visitId: r.visitId,
        patientId: r.patientId,
        doctorId: r.doctorId,
        doctorName: r.doctorName,
        operationNumber: r.operationNumber,
        operationName: r.operationName,
        operationCharges: Number(r.operationCharges),
        urgency: r.urgency,
        status: r.status as OperationStatus,
        notes: r.notes,
        operationDate: r.operationDate,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    } else {
      const rec = mockOperations.find((o) => o.id === operationId);
      if (rec) {
        rec.status = OperationStatus.CANCELLED;
      }
      return rec!;
    }
  }

  // 3. Get Active Operation By Visit ID
  public static async getOperationByVisitId(visitId: string): Promise<OperationRecordDTO | null> {
    const isDb = this.checkDb();

    if (isDb) {
      const [r] = await db
        .select({
          id: patientOperations.id,
          operationOrderId: patientOperations.operationOrderId,
          visitId: patientOperations.visitId,
          patientId: patientOperations.patientId,
          doctorId: patientOperations.doctorId,
          doctorName: patientOperations.doctorName,
          operationNumber: patientOperations.operationNumber,
          operationName: patientOperations.operationName,
          operationCharges: patientOperations.operationCharges,
          urgency: patientOperations.urgency,
          status: patientOperations.status,
          notes: patientOperations.notes,
          operationDate: patientOperations.operationDate,
          createdAt: patientOperations.createdAt,
          updatedAt: patientOperations.updatedAt,
          patientFirstName: patients.firstName,
          patientLastName: patients.lastName,
          patientMrNumber: patients.mrNumber,
        })
        .from(patientOperations)
        .innerJoin(patients, eq(patientOperations.patientId, patients.id))
        .where(eq(patientOperations.visitId, visitId))
        .orderBy(desc(patientOperations.createdAt))
        .limit(1);

      if (!r) return null;

      return {
        id: r.id,
        operationOrderId: r.operationOrderId,
        visitId: r.visitId,
        patientId: r.patientId,
        doctorId: r.doctorId,
        doctorName: r.doctorName,
        operationNumber: r.operationNumber,
        operationName: r.operationName,
        operationCharges: Number(r.operationCharges),
        urgency: r.urgency,
        status: r.status as OperationStatus,
        notes: r.notes,
        operationDate: r.operationDate,
        patientName: `${r.patientFirstName} ${r.patientLastName}`,
        patientMrNumber: r.patientMrNumber,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    } else {
      return mockOperations.find((o) => o.visitId === visitId) || null;
    }
  }
}

export const mockOperations: OperationRecordDTO[] = [];
