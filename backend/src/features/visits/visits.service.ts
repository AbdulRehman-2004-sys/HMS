import { VisitRepository } from './visits.repository';
import { PatientRepository } from '../patients/patients.repository';
import {
  CreateVisitDTO,
  EMRDetailsResponseDTO,
  UpdateVisitStatusDTO,
  VisitQueryDTO,
  VisitResponseDTO,
} from './visits.types';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';

export class VisitService {
  /**
   * Create Patient Visit & Queue Patient
   */
  public static async createVisit(
    data: CreateVisitDTO,
    creatorId: string,
    ipAddress?: string
  ): Promise<VisitResponseDTO> {
    // 1. Verify Patient exists
    const patient = await PatientRepository.findById(data.patientId);
    if (!patient) {
      throw new NotFoundError(`Patient with ID "${data.patientId}" not found`);
    }

    // 2. Create Visit Record
    const visit = await VisitRepository.create(data);

    // 3. Log Audit
    await logAudit({
      userId: creatorId,
      action: 'PATIENT_VISIT_CREATED',
      module: 'Clinical EHR & Queue',
      details: `Created visit ${visit.visitNumber} for patient ${visit.patientName} (MRN: ${visit.patientMrNumber}) assigned to ${visit.doctorName} (Token: Q-${String(visit.tokenNumber).padStart(3, '0')})`,
      ipAddress,
    });

    return visit;
  }

  /**
   * Get Today's Queue with counters and filters
   */
  public static async getTodayQueue(
    query: VisitQueryDTO,
    user: { id: string; roles: string[]; email?: string }
  ) {
    const isSuperAdmin = user.roles.includes('Super Admin');
    const isDoctor = user.roles.includes('Doctor');

    // If logged in as Doctor (and not Super Admin), force doctorId filter to own doctor profile
    if (isDoctor && !isSuperAdmin) {
      const doc = await VisitRepository.findDoctorByUserId(user.id);
      if (doc) {
        query.doctorId = doc.id;
      }
    }

    return await VisitRepository.findQueue(query);
  }

  /**
   * Get Single Visit & EMR Details
   */
  public static async getVisitDetails(
    visitId: string,
    user: { id: string; roles: string[] }
  ): Promise<EMRDetailsResponseDTO> {
    const emrData = await VisitRepository.findById(visitId);
    if (!emrData) {
      throw new NotFoundError(`Patient Visit record with ID "${visitId}" not found`);
    }

    const isSuperAdmin = user.roles.includes('Super Admin');
    const isReception = user.roles.includes('Receptionist');

    if (!isSuperAdmin && !isReception) {
      // Check if logged in doctor is assigned doctor
      const doc = await VisitRepository.findDoctorByUserId(user.id);
      if (doc && doc.id !== emrData.visit.doctorId) {
        throw new ForbiddenError('You are only authorized to open EMR records for your own assigned patients');
      }
    }

    return emrData;
  }

  /**
   * Update Queue Status (WAITING -> WITH_DOCTOR -> COMPLETED / CANCELLED)
   */
  public static async updateVisitStatus(
    visitId: string,
    data: UpdateVisitStatusDTO,
    user: { id: string; roles: string[] },
    ipAddress?: string
  ): Promise<VisitResponseDTO> {
    const emrData = await VisitRepository.findById(visitId);
    if (!emrData) {
      throw new NotFoundError(`Patient Visit record with ID "${visitId}" not found`);
    }

    const isSuperAdmin = user.roles.includes('Super Admin');

    if (!isSuperAdmin) {
      const doc = await VisitRepository.findDoctorByUserId(user.id);
      if (doc && doc.id !== emrData.visit.doctorId) {
        throw new ForbiddenError('You are only authorized to update status for your own assigned patients');
      }
    }

    const updated = await VisitRepository.updateStatus(visitId, data);
    if (!updated) {
      throw new NotFoundError(`Failed to update visit status`);
    }

    await logAudit({
      userId: user.id,
      action: 'PATIENT_VISIT_STATUS_UPDATED',
      module: 'Clinical EHR & Queue',
      details: `Updated visit ${updated.visitNumber} status to ${updated.status} for patient ${updated.patientName}`,
      ipAddress,
    });

    return updated;
  }
}
