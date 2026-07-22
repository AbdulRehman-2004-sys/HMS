import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';
import { db } from '../../db/connection';
import { users, doctors } from '../../db/schema';
import { patientOperations } from './operations.schema';
import { eq, and, ne } from 'drizzle-orm';
import { OperationsRepository } from './operations.repository';
import {
  CreateOperationDTO,
  OperationRecordDTO,
} from './operations.types';

export class OperationsService {
  // 1. Create Operation Record & Post Billing Entry
  public static async createOperation(
    data: CreateOperationDTO,
    userId: string,
    ipAddress?: string
  ): Promise<OperationRecordDTO> {
    const isDb = (global as any).authServiceDbConnected ?? false;

    // Check if visit already has an active (non-cancelled) operation
    if (isDb) {
      const [existing] = await db
        .select()
        .from(patientOperations)
        .where(and(eq(patientOperations.visitId, data.visitId), ne(patientOperations.status, 'CANCELLED')))
        .limit(1);

      if (existing) {
        throw new BadRequestError(`An active surgery operation (${existing.operationName}) is already recorded for this visit encounter.`);
      }
    }

    // Get doctor name
    let doctorName = 'Attending Surgeon';
    if (isDb) {
      const [doc] = await db
        .select()
        .from(doctors)
        .where(eq(doctors.id, data.doctorId))
        .limit(1);

      if (doc) {
        doctorName = `${doc.firstName} ${doc.lastName}`;
      } else {
        const [u] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);
        if (u) doctorName = `${u.firstName} ${u.lastName}`;
      }
    }

    const operation = await OperationsRepository.createOperation(data, doctorName);

    await logAudit({
      userId,
      action: 'CREATED_OPERATION',
      module: 'Operations',
      details: `Created surgery operation ${operation.operationName} (${operation.operationNumber}) with charge Rs. ${operation.operationCharges}`,
      ipAddress,
    });

    return operation;
  }

  // 2. Cancel Operation
  public static async cancelOperation(
    operationId: string,
    userId: string,
    reason?: string,
    ipAddress?: string
  ): Promise<OperationRecordDTO> {
    const isDb = (global as any).authServiceDbConnected ?? false;

    if (isDb) {
      const [existing] = await db
        .select()
        .from(patientOperations)
        .where(eq(patientOperations.id, operationId))
        .limit(1);

      if (!existing) {
        throw new NotFoundError('Surgery operation record not found.');
      }

      if (existing.status === 'COMPLETED') {
        throw new BadRequestError('Completed surgery operations are locked and cannot be cancelled.');
      }

      if (existing.status === 'CANCELLED') {
        throw new BadRequestError('Surgery operation is already cancelled.');
      }
    }

    const cancelled = await OperationsRepository.cancelOperation(operationId, reason);

    await logAudit({
      userId,
      action: 'CANCELLED_OPERATION',
      module: 'Operations',
      details: `Cancelled surgery operation ${cancelled.operationName} (${cancelled.operationNumber})`,
      ipAddress,
    });

    return cancelled;
  }

  // 3. Get Operation By Visit ID
  public static async getOperationByVisitId(visitId: string): Promise<OperationRecordDTO | null> {
    return await OperationsRepository.getOperationByVisitId(visitId);
  }
}
