import { logAudit } from '../../utils/audit';
import { PrescriptionRepository } from './prescriptions.repository';
import { CreatePrescriptionDTO, MedicineOptionDTO, PrescriptionResponseDTO } from './prescriptions.types';

export class PrescriptionService {
  public static async createPrescription(
    data: CreatePrescriptionDTO,
    userId: string,
    ipAddress?: string
  ): Promise<PrescriptionResponseDTO> {
    const rx = await PrescriptionRepository.create(data);

    await logAudit({
      userId,
      action: 'CREATE_PRESCRIPTION',
      module: 'Prescriptions',
      details: `Issued e-Prescription ${rx.prescriptionNumber} for Patient ID: ${data.patientId} with ${data.items.length} medicines`,
      ipAddress,
    });

    return rx;
  }


  public static async getPrescriptionByVisit(visitId: string): Promise<PrescriptionResponseDTO | null> {
    return await PrescriptionRepository.findByVisitId(visitId);
  }

  public static async getPatientPrescriptions(patientId: string): Promise<PrescriptionResponseDTO[]> {
    return await PrescriptionRepository.findByPatientId(patientId);
  }

  public static async searchMedicines(query: string): Promise<MedicineOptionDTO[]> {
    return await PrescriptionRepository.searchMedicines(query);
  }
}
