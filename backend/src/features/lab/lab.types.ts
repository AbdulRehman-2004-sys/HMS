export enum LabReportStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface LabReportItemDTO {
  id?: string;
  parameterName: string;
  resultValue: string;
  unit?: string | null;
  referenceRange?: string | null;
  isAbnormal?: boolean;
  remarks?: string | null;
  sequence?: number;
}

export interface SaveLabReportDTO {
  labOrderId: string;
  visitId: string;
  patientId: string;
  technicianNotes?: string | null;
  overallRemarks?: string | null;
  status: LabReportStatus; // 'IN_PROGRESS' | 'COMPLETED'
  items: LabReportItemDTO[];
}

export interface LabReportResponseDTO {
  id: string;
  labOrderId: string;
  visitId: string;
  patientId: string;
  technicianId?: string | null;
  technicianName: string;
  reportNumber: string;
  status: LabReportStatus;
  overallRemarks?: string | null;
  technicianNotes?: string | null;
  resultDate: Date;
  items: LabReportItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LabOrderQueueItemDTO {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  testName: string;
  category: string;
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

export interface LabQueueSummaryDTO {
  pendingCount: number;
  inProgressCount: number;
  completedTodayCount: number;
  orders: LabOrderQueueItemDTO[];
}
