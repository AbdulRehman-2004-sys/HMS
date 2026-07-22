import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';
import { db } from '../../db/connection';
import { users } from '../../db/schema';
import { patientAdmissions } from './admissions.schema';
import { eq, and } from 'drizzle-orm';
import { AdmissionsRepository } from './admissions.repository';
import {
  AdmissionRecordDTO,
  AdmissionsSummaryDTO,
  AdmitPatientDTO,
  DischargePatientDTO,
} from './admissions.types';


export class AdmissionsService {
  // 1. Get Summary & Queues
  public static async getAdmissionsSummary(search?: string): Promise<AdmissionsSummaryDTO> {
    return await AdmissionsRepository.getAdmissionsSummary(search);
  }

  // 2. Admit Patient & Post Billing Charge Entry
  public static async admitPatient(
    data: AdmitPatientDTO,
    userId: string,
    ipAddress?: string
  ): Promise<AdmissionRecordDTO> {
    const isDb = (global as any).authServiceDbConnected ?? false;

    // Check if visit already has an active admission
    if (isDb) {
      const [existing] = await db
        .select()
        .from(patientAdmissions)
        .where(and(eq(patientAdmissions.visitId, data.visitId), eq(patientAdmissions.status, 'ADMITTED')))
        .limit(1);

      if (existing) {
        throw new BadRequestError(`Patient is already admitted in ${existing.roomName} (Admission #${existing.admissionNumber}).`);
      }
    }

    // Get staff name
    let staffName = 'Reception Staff';
    if (isDb) {
      const [staff] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (staff) {
        staffName = `${staff.firstName} ${staff.lastName}`;
      }
    }

    const admission = await AdmissionsRepository.admitPatient(data, userId, staffName);

    await logAudit({
      userId,
      action: 'ADMITTED_PATIENT',
      module: 'Admissions',
      details: `Admitted patient ${admission.patientName} (${admission.patientMrNumber}) to ${admission.roomName} with room charge Rs. ${admission.roomCharges}`,
      ipAddress,
    });

    return admission;
  }

  // 3. Discharge Patient
  public static async dischargePatient(
    admissionId: string,
    data: DischargePatientDTO,
    userId: string,
    ipAddress?: string
  ): Promise<AdmissionRecordDTO> {
    const isDb = (global as any).authServiceDbConnected ?? false;

    if (isDb) {
      const [existing] = await db
        .select()
        .from(patientAdmissions)
        .where(eq(patientAdmissions.id, admissionId))
        .limit(1);

      if (!existing) {
        throw new NotFoundError('Admission record not found.');
      }

      if (existing.status === 'DISCHARGED') {
        throw new BadRequestError('Patient has already been discharged.');
      }
    }

    let staffName = 'Reception Staff';
    if (isDb) {
      const [staff] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (staff) {
        staffName = `${staff.firstName} ${staff.lastName}`;
      }
    }

    const discharged = await AdmissionsRepository.dischargePatient(admissionId, userId, staffName, data.notes || undefined);

    await logAudit({
      userId,
      action: 'DISCHARGED_PATIENT',
      module: 'Admissions',
      details: `Discharged patient ${discharged.patientName} from ${discharged.roomName} (Admission #${discharged.admissionNumber})`,
      ipAddress,
    });

    return discharged;
  }

  // 4. Get Admission By Visit ID
  public static async getAdmissionByVisitId(visitId: string): Promise<AdmissionRecordDTO | null> {
    return await AdmissionsRepository.getAdmissionByVisitId(visitId);
  }
}
