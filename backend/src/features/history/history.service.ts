import { HistoryRepository } from './history.repository';
import { CompletePatientHistoryDTO, VisitEncounterHistoryDTO } from './history.types';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { db } from '../../db/connection';
import { auditLogs } from '../../db/schema';

export class HistoryService {
  public static determineRoleScope(userRoles: string[]): 'FULL' | 'LAB_ONLY' | 'RAD_ONLY' {
    const isFullAccess = userRoles.some((role) =>
      ['Super Admin', 'Doctor', 'Receptionist', 'Administrator'].includes(role)
    );

    if (isFullAccess) return 'FULL';

    const isLab = userRoles.includes('Laboratory');
    if (isLab) return 'LAB_ONLY';

    const isRad = userRoles.includes('Radiology');
    if (isRad) return 'RAD_ONLY';

    throw new ForbiddenError('You do not have permission to access patient medical history.');
  }

  private static async logAudit(userId: string | undefined, action: string, details: string) {
    try {
      const isDb = (global as any).authServiceDbConnected ?? false;
      if (isDb && userId) {
        await db.insert(auditLogs).values({
          userId,
          action,
          module: 'PATIENT_HISTORY',
          details,
        });
      }
    } catch (err) {
      // Ignore logging failures
    }
  }

  // 1. Search Patient by MR Number and Return Complete History
  public static async searchByMrNumber(
    mrNumber: string,
    userRoles: string[],
    userId?: string
  ): Promise<CompletePatientHistoryDTO> {
    const roleScope = this.determineRoleScope(userRoles);
    const patientSummary = await HistoryRepository.getPatientByMrNumber(mrNumber);

    if (!patientSummary) {
      throw new NotFoundError(`No patient found with MR Number "${mrNumber}".`);
    }

    const history = await HistoryRepository.getCompletePatientHistory(patientSummary.id, roleScope);
    if (!history) {
      throw new NotFoundError(`Medical history record not found for MR Number "${mrNumber}".`);
    }

    await this.logAudit(
      userId,
      'SEARCH_PATIENT_HISTORY',
      `Searched medical history for MR Number: ${mrNumber} (Patient: ${patientSummary.fullName}, Scope: ${roleScope})`
    );

    return history;
  }

  // 2. Get Complete Patient History by Patient ID
  public static async getPatientHistory(
    patientId: string,
    userRoles: string[],
    userId?: string
  ): Promise<CompletePatientHistoryDTO> {
    const roleScope = this.determineRoleScope(userRoles);
    const history = await HistoryRepository.getCompletePatientHistory(patientId, roleScope);

    if (!history) {
      throw new NotFoundError('Patient medical history record not found.');
    }

    await this.logAudit(
      userId,
      'VIEW_PATIENT_HISTORY',
      `Viewed full patient history for Patient ID: ${patientId} (Scope: ${roleScope})`
    );

    return history;
  }

  // 3. Get Visit Encounter Details
  public static async getVisitDetails(
    visitId: string,
    userRoles: string[],
    userId?: string
  ): Promise<VisitEncounterHistoryDTO> {
    const roleScope = this.determineRoleScope(userRoles);
    const visitDetails = await HistoryRepository.getVisitEncounter(visitId, roleScope);

    if (!visitDetails) {
      throw new NotFoundError('Patient visit encounter record not found.');
    }

    await this.logAudit(
      userId,
      'VIEW_VISIT_DETAILS',
      `Viewed visit details for Visit ID: ${visitId} (Scope: ${roleScope})`
    );

    return visitDetails;
  }
}
