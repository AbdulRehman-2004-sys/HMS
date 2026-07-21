import { api } from './api-client';

export enum LabReportStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface LabReportItem {
  id?: string;
  parameterName: string;
  resultValue: string;
  unit?: string | null;
  referenceRange?: string | null;
  isAbnormal?: boolean;
  remarks?: string | null;
  sequence?: number;
}

export interface SaveLabReportPayload {
  labOrderId: string;
  visitId: string;
  patientId: string;
  technicianNotes?: string | null;
  overallRemarks?: string | null;
  status: LabReportStatus; // 'IN_PROGRESS' | 'COMPLETED'
  items: LabReportItem[];
}

export interface LabReportData {
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
  resultDate: string;
  items: LabReportItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LabOrderQueueItem {
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

export interface LabQueueSummary {
  pendingCount: number;
  inProgressCount: number;
  completedTodayCount: number;
  orders: LabOrderQueueItem[];
}

// 1. Get Queue of Lab Orders
export async function getLabQueueApi(status?: string, search?: string): Promise<LabQueueSummary> {
  const res = await api.get('/lab/orders', { params: { status, search } });
  return res.data.data.queue;
}

// 2. Get Report for a Lab Order
export async function getLabReportByOrderIdApi(orderId: string): Promise<LabReportData | null> {
  const res = await api.get(`/lab/orders/${orderId}/report`);
  return res.data.data.report;
}

// 3. Save / Finalize Lab Report
export async function saveLabReportApi(payload: SaveLabReportPayload): Promise<LabReportData> {
  const res = await api.post('/lab/reports', payload);
  return res.data.data.report;
}

// 4. Get Lab Reports by Visit ID (Doctor EMR View)
export async function getLabReportsByVisitApi(visitId: string): Promise<LabReportData[]> {
  const res = await api.get(`/lab/reports/visit/${visitId}`);
  return res.data.data.reports || [];
}
