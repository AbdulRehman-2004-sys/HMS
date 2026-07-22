import { api } from './api-client';

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

export interface SaveRadiologyReportPayload {
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

export interface RadiologyReportData {
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
  reportDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface RadiologyOrderQueueItem {
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
  visitDate: string;
  patientName: string;
  patientMrNumber: string;
  patientAge?: number | null;
  patientGender: string;
  patientMobile: string;
  doctorName: string;
  reportId?: string | null;
  createdAt: string;
}

export interface RadiologyQueueSummary {
  pendingCount: number;
  inProgressCount: number;
  completedTodayCount: number;
  orders: RadiologyOrderQueueItem[];
}

// 1. Get Queue of Radiology Orders
export async function getRadiologyQueueApi(
  status?: string,
  serviceType?: string,
  search?: string
): Promise<RadiologyQueueSummary> {
  const res = await api.get('/radiology/orders', { params: { status, serviceType, search } });
  return res.data.data.queue;
}

// 2. Get Report for a Radiology Order
export async function getRadiologyReportByOrderIdApi(orderId: string): Promise<RadiologyReportData | null> {
  const res = await api.get(`/radiology/orders/${orderId}/report`);
  return res.data.data.report;
}

// 3. Save / Finalize Radiology Report
export async function saveRadiologyReportApi(payload: SaveRadiologyReportPayload): Promise<RadiologyReportData> {
  const res = await api.post('/radiology/reports', payload);
  return res.data.data.report;
}

// 4. Get Radiology Reports by Visit ID (Doctor EMR View)
export async function getRadiologyReportsByVisitApi(visitId: string): Promise<RadiologyReportData[]> {
  const res = await api.get(`/radiology/reports/visit/${visitId}`);
  return res.data.data.reports || [];
}
