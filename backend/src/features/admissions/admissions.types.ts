export enum AdmissionStatus {
  PENDING = 'PENDING',
  ADMITTED = 'ADMITTED',
  DISCHARGED = 'DISCHARGED',
  CANCELLED = 'CANCELLED',
}

export interface AdmitPatientDTO {
  admissionOrderId: string;
  visitId: string;
  patientId: string;
  roomName: string;
  roomCharges?: number; // Defaults to 5000 if omitted
  notes?: string | null;
}

export interface DischargePatientDTO {
  admissionId: string;
  notes?: string | null;
}

export interface AdmissionRecordDTO {
  id: string;
  admissionOrderId: string;
  visitId: string;
  patientId: string;
  admittedById?: string | null;
  admittedByName: string;
  admissionNumber: string;
  roomName: string;
  roomCharges: number;
  status: AdmissionStatus;
  notes?: string | null;
  admissionDate: Date;
  dischargeDate?: Date | null;
  dischargedById?: string | null;
  dischargedByName?: string | null;
  patientName: string;
  patientMrNumber: string;
  patientAge?: number | null;
  patientGender: string;
  patientMobile: string;
  doctorName: string;
  recommendedWard: string;
  admissionType: string;
  provisionalDiagnosis?: string | null;
  billingChargeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PendingAdmissionOrderDTO {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  admissionType: string;
  recommendedWard: string;
  provisionalDiagnosis?: string | null;
  status: string; // 'PENDING' | 'COMPLETED' | 'CANCELLED'
  visitNumber: string;
  tokenNumber: number;
  visitDate: Date;
  patientName: string;
  patientMrNumber: string;
  patientAge?: number | null;
  patientGender: string;
  patientMobile: string;
  doctorName: string;
  createdAt: Date;
}

export interface AdmissionsSummaryDTO {
  pendingOrdersCount: number;
  activeAdmissionsCount: number;
  dischargedCount: number;
  pendingOrders: PendingAdmissionOrderDTO[];
  activeAdmissions: AdmissionRecordDTO[];
  dischargedAdmissions: AdmissionRecordDTO[];
}
