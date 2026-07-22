import { api } from './api-client';

export enum OperationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateOperationPayload {
  visitId: string;
  patientId: string;
  doctorId: string;
  operationName: string;
  operationCharges?: number;
  urgency?: string;
  notes?: string | null;
  operationOrderId?: string | null;
}

export interface OperationRecordData {
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
  operationDate: string;
  billingChargeId?: string | null;
  patientName?: string;
  patientMrNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// 1. Create Operation & Post Billing Charge Entry
export async function createOperationApi(payload: CreateOperationPayload): Promise<OperationRecordData> {
  const res = await api.post('/operations', payload);
  return res.data.data.operation;
}

// 2. Cancel Operation
export async function cancelOperationApi(operationId: string, reason?: string): Promise<OperationRecordData> {
  const res = await api.post(`/operations/${operationId}/cancel`, { reason });
  return res.data.data.operation;
}

// 3. Get Operation by Visit ID
export async function getOperationByVisitIdApi(visitId: string): Promise<OperationRecordData | null> {
  const res = await api.get(`/operations/visit/${visitId}`);
  return res.data.data.operation;
}
