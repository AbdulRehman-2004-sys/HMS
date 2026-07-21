import { api } from './api-client';

export enum VisitStatus {
  WAITING = 'WAITING',
  WITH_DOCTOR = 'WITH_DOCTOR',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateVisitPayload {
  patientId: string;
  doctorId: string;
  chiefComplaint?: string;
  temperature?: string;
  pulse?: string;
  bloodPressure?: string;
  weight?: string;
  clinicalNotes?: string;
}

export interface UpdateVisitStatusPayload {
  status: VisitStatus;
  clinicalNotes?: string;
}

export interface VisitQuery {
  doctorId?: string;
  status?: VisitStatus;
  search?: string;
  page?: number;
  limit?: number;
  date?: string;
}

export interface VisitRecord {
  id: string;
  visitNumber: string;
  tokenNumber: number;
  visitDate: string;
  status: VisitStatus;
  chiefComplaint: string | null;
  temperature: string | null;
  pulse: string | null;
  bloodPressure: string | null;
  weight: string | null;
  clinicalNotes: string | null;
  patientId: string;
  patientName: string;
  patientMrNumber: string;
  patientAge: number | null;
  patientGender: string;
  patientPhone: string;
  patientFatherHusbandName: string | null;
  patientCnic: string | null;
  patientAllergies: string | null;
  patientChronicDiseases: string | null;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorQualification: string;
  doctorRegistrationNumber: string | null;
  doctorSignatureText: string | null;
  doctorHeaderText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PastVisitSummary {
  id: string;
  visitNumber: string;
  visitDate: string;
  doctorName: string;
  chiefComplaint: string | null;
  clinicalNotes: string | null;
  status: VisitStatus;
}

export interface EMRDetailsData {
  visit: VisitRecord;
  pastVisits: PastVisitSummary[];
  previousPrescriptions: unknown[];
  previousLabReports: unknown[];
  previousRadiologyReports: unknown[];
}

export interface QueueSummary {
  total: number;
  waiting: number;
  withDoctor: number;
  completed: number;
  cancelled: number;
}

export interface QueueApiResponse {
  queue: VisitRecord[];
  summary: QueueSummary;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const createVisitApi = async (payload: CreateVisitPayload): Promise<VisitRecord> => {
  const response = await api.post('/visits', payload);
  return response.data?.data;
};

export const getTodayQueueApi = async (query: VisitQuery): Promise<QueueApiResponse> => {
  const response = await api.get('/visits/queue', { params: query });
  return response.data?.data;
};

export const getEMRDetailsApi = async (visitId: string): Promise<EMRDetailsData> => {
  const response = await api.get(`/visits/${visitId}`);
  return response.data?.data;
};

export const updateVisitStatusApi = async (
  visitId: string,
  payload: UpdateVisitStatusPayload
): Promise<VisitRecord> => {
  const response = await api.patch(`/visits/${visitId}/status`, payload);
  return response.data?.data;
};
