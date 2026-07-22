import { api } from './api-client';

export enum AdmissionStatus {
  PENDING = 'PENDING',
  ADMITTED = 'ADMITTED',
  DISCHARGED = 'DISCHARGED',
  CANCELLED = 'CANCELLED',
}

export interface AdmitPatientPayload {
  admissionOrderId: string;
  visitId: string;
  patientId: string;
  roomName: string;
  roomCharges?: number;
  notes?: string | null;
}

export interface DischargePatientPayload {
  notes?: string | null;
}

export interface AdmissionRecordData {
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
  admissionDate: string;
  dischargeDate?: string | null;
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
  createdAt: string;
  updatedAt: string;
}

export interface PendingAdmissionOrderData {
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
  visitDate: string;
  patientName: string;
  patientMrNumber: string;
  patientAge?: number | null;
  patientGender: string;
  patientMobile: string;
  doctorName: string;
  createdAt: string;
}

export interface AdmissionsSummaryData {
  pendingOrdersCount: number;
  activeAdmissionsCount: number;
  dischargedCount: number;
  pendingOrders: PendingAdmissionOrderData[];
  activeAdmissions: AdmissionRecordData[];
  dischargedAdmissions: AdmissionRecordData[];
}

// 1. Get Admissions Summary & Queues
export async function getAdmissionsSummaryApi(search?: string): Promise<AdmissionsSummaryData> {
  const res = await api.get('/admissions/summary', { params: { search } });
  return res.data.data.summary;
}

// 2. Admit Patient
export async function admitPatientApi(payload: AdmitPatientPayload): Promise<AdmissionRecordData> {
  const res = await api.post('/admissions/admit', payload);
  return res.data.data.admission;
}

// 3. Discharge Patient
export async function dischargePatientApi(
  admissionId: string,
  payload?: DischargePatientPayload
): Promise<AdmissionRecordData> {
  const res = await api.post(`/admissions/${admissionId}/discharge`, payload || {});
  return res.data.data.admission;
}

// 4. Get Admission by Visit ID
export async function getAdmissionByVisitIdApi(visitId: string): Promise<AdmissionRecordData | null> {
  const res = await api.get(`/admissions/visit/${visitId}`);
  return res.data.data.admission;
}
