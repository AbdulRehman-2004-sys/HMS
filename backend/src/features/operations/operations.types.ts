export enum OperationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateOperationDTO {
  visitId: string;
  patientId: string;
  doctorId: string;
  operationName: string;
  operationCharges?: number; // Defaults to 20000 if omitted
  urgency?: string; // 'ELECTIVE' | 'URGENT' | 'EMERGENCY'
  notes?: string | null;
  operationOrderId?: string | null;
}

export interface OperationRecordDTO {
  id: string;
  operationOrderId?: string | null;
  visitId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  operationNumber: string;
  operationName: string;
  operationCharges: number;
  urgency: string;
  status: OperationStatus;
  notes?: string | null;
  operationDate: Date;
  billingChargeId?: string | null;
  patientName?: string;
  patientMrNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}
