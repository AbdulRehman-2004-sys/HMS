export enum RadiologyReportStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum RadiologyServiceType {
  XRAY = 'XRAY',
  ULTRASOUND = 'ULTRASOUND',
  CT = 'CT',
  MRI = 'MRI',
}

export interface SaveRadiologyReportDTO {
  radiologyOrderId: string;
  visitId: string;
  patientId: string;
  serviceType: RadiologyServiceType;
  examination: string;
  clinicalFindings: string;
  impression: string;
  recommendation?: string | null;
  technicianNotes?: string | null;
  status: RadiologyReportStatus;
}

export interface RadiologyReportResponseDTO {
  id: string;
  radiologyOrderId: string;
  visitId: string;
  patientId: string;
  technicianId?: string | null;
  technicianName: string;
  reportNumber: string;
  serviceType: RadiologyServiceType;
  examination: string;
  status: RadiologyReportStatus;
  clinicalFindings: string;
  impression: string;
  recommendation?: string | null;
  technicianNotes?: string | null;
  reportDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RadiologyOrderQueueItemDTO {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  modality: string; // 'XRAY' | 'ULTRASOUND' | 'CT' | 'MRI'
  procedureName: string;
  urgency: string;
  clinicalNotes?: string | null;
  status: string; // 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  visitNumber: string;
  tokenNumber: number;
  visitDate: Date;
  patientName: string;
  patientMrNumber: string;
  patientAge?: number | null;
  patientGender: string;
  patientMobile: string;
  doctorName: string;
  reportId?: string | null;
  createdAt: Date;
}

export interface RadiologyQueueSummaryDTO {
  pendingCount: number;
  inProgressCount: number;
  completedTodayCount: number;
  orders: RadiologyOrderQueueItemDTO[];
}
