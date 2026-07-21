import { api } from './api-client';

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderUrgency {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  STAT = 'STAT',
  ELECTIVE = 'ELECTIVE',
  EMERGENCY = 'EMERGENCY',
}

export enum RadiologyModality {
  X_RAY = 'X_RAY',
  ULTRASOUND = 'ULTRASOUND',
  CT_SCAN = 'CT_SCAN',
  MRI = 'MRI',
}

export enum AdmissionType {
  EMERGENCY = 'EMERGENCY',
  ELECTIVE = 'ELECTIVE',
  DAYCARE = 'DAYCARE',
}

export enum RecommendedWard {
  GENERAL_WARD = 'GENERAL_WARD',
  PRIVATE_ROOM = 'PRIVATE_ROOM',
  ICU = 'ICU',
  CCU = 'CCU',
  NEONATAL_ICU = 'NEONATAL_ICU',
}

export enum AnesthesiaType {
  GENERAL = 'GENERAL',
  SPINAL = 'SPINAL',
  LOCAL = 'LOCAL',
  SEDATION = 'SEDATION',
}

export interface LabOrderData {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  testName: string;
  category: string;
  urgency: OrderUrgency;
  clinicalNotes?: string | null;
  status: OrderStatus;
  createdAt: string;
}

export interface RadiologyOrderData {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  modality: RadiologyModality;
  procedureName: string;
  bodyPart?: string | null;
  urgency: OrderUrgency;
  clinicalNotes?: string | null;
  status: OrderStatus;
  createdAt: string;
}

export interface AdmissionOrderData {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  admissionType: AdmissionType;
  priority: OrderUrgency;
  recommendedWard: RecommendedWard;
  provisionalDiagnosis?: string | null;
  specialInstructions?: string | null;
  status: OrderStatus;
  createdAt: string;
}

export interface OperationOrderData {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  procedureName: string;
  proposedDate?: string | null;
  urgency: OrderUrgency;
  anesthesiaType: AnesthesiaType;
  specialNotes?: string | null;
  status: OrderStatus;
  createdAt: string;
}

export interface VisitOrdersSummary {
  labOrders: LabOrderData[];
  radiologyOrders: RadiologyOrderData[];
  admissionOrders: AdmissionOrderData[];
  operationOrders: OperationOrderData[];
}

// APIs
export async function createLabOrderApi(payload: {
  visitId: string;
  patientId: string;
  doctorId: string;
  testName: string;
  category?: string;
  urgency?: OrderUrgency;
  clinicalNotes?: string | null;
}): Promise<LabOrderData> {
  const res = await api.post('/orders/lab', payload);
  return res.data.data.order;
}

export async function createRadiologyOrderApi(payload: {
  visitId: string;
  patientId: string;
  doctorId: string;
  modality: RadiologyModality;
  procedureName: string;
  bodyPart?: string | null;
  urgency?: OrderUrgency;
  clinicalNotes?: string | null;
}): Promise<RadiologyOrderData> {
  const res = await api.post('/orders/radiology', payload);
  return res.data.data.order;
}

export async function createAdmissionOrderApi(payload: {
  visitId: string;
  patientId: string;
  doctorId: string;
  admissionType?: AdmissionType;
  priority?: OrderUrgency;
  recommendedWard?: RecommendedWard;
  provisionalDiagnosis?: string | null;
  specialInstructions?: string | null;
}): Promise<AdmissionOrderData> {
  const res = await api.post('/orders/admission', payload);
  return res.data.data.order;
}

export async function createOperationOrderApi(payload: {
  visitId: string;
  patientId: string;
  doctorId: string;
  procedureName: string;
  proposedDate?: string | null;
  urgency?: OrderUrgency;
  anesthesiaType?: AnesthesiaType;
  specialNotes?: string | null;
}): Promise<OperationOrderData> {
  const res = await api.post('/orders/operation', payload);
  return res.data.data.order;
}

export async function getOrdersByVisitApi(visitId: string): Promise<VisitOrdersSummary> {
  const res = await api.get(`/orders/visit/${visitId}`);
  return res.data.data.orders;
}

export async function updateOrderStatusApi(
  orderType: 'lab' | 'radiology' | 'admission' | 'operation',
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  const res = await api.patch(`/orders/${orderType}/${orderId}/status`, { status });
  return res.data.success;
}
