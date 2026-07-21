export interface PrescriptionItemDTO {
  id?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  sequence?: number;
}

export interface CreatePrescriptionDTO {
  visitId?: string | null;
  patientId: string;
  doctorId: string;
  diagnosis?: string | null;
  advice?: string | null;
  followUpDate?: string | Date | null;
  items: PrescriptionItemDTO[];
}

export interface UpdatePrescriptionDTO {
  diagnosis?: string | null;
  advice?: string | null;
  followUpDate?: string | Date | null;
  status?: 'ACTIVE' | 'DISPENSED' | 'CANCELLED';
  items?: PrescriptionItemDTO[];
}

export interface PrescriptionResponseDTO {
  id: string;
  prescriptionNumber: string;
  visitId?: string | null;
  patientId: string;
  doctorId: string;
  diagnosis?: string | null;
  advice?: string | null;
  followUpDate?: Date | null;
  status: string;
  items: PrescriptionItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineOptionDTO {
  id: string;
  name: string;
  category: string; // 'Tablet' | 'Syrup' | 'Injection' | 'Capsule' | 'Drop' | 'Ointment'
  defaultDosage: string;
  defaultFrequency: string;
}
