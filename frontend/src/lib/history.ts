import { api } from './api-client';

export interface PatientSummaryData {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  fatherHusbandName: string;
  age: number | null;
  gender: string;
  mobileNumber: string;
  bloodGroup: string | null;
  cnic: string | null;
  allergies: string | null;
  chronicDiseases: string | null;
  city: string;
}

export interface VisitInfoData {
  visitId: string;
  visitNumber: string;
  visitDate: string;
  status: string;
  tokenNumber: number;
  doctorId: string;
  doctorName: string;
  doctorDepartment: string;
  chiefComplaint: string | null;
  temperature: string | null;
  pulse: string | null;
  bloodPressure: string | null;
  weight: string | null;
  clinicalNotes: string | null;
  diagnosis: string | null;
}

export interface PrescriptionItemData {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}

export interface PrescriptionHistoryData {
  prescriptionId: string;
  prescriptionNumber: string;
  diagnosis: string | null;
  advice: string | null;
  followUpDate: string | null;
  status: string;
  createdAt: string;
  items: PrescriptionItemData[];
}

export interface LabOrderItemData {
  id: string;
  testName: string;
  category: string;
  urgency: string;
  clinicalNotes: string | null;
  status: string;
  createdAt: string;
}

export interface LabReportParameterData {
  id: string;
  parameterName: string;
  resultValue: string;
  unit: string | null;
  referenceRange: string | null;
  isAbnormal: boolean;
  remarks: string | null;
}

export interface LabReportItemData {
  id: string;
  reportNumber: string;
  technicianName: string;
  status: string;
  overallRemarks: string | null;
  technicianNotes: string | null;
  resultDate: string;
  items: LabReportParameterData[];
}

export interface LabHistoryData {
  orders: LabOrderItemData[];
  reports: LabReportItemData[];
}

export interface RadiologyOrderItemData {
  id: string;
  modality: string;
  procedureName: string;
  bodyPart: string | null;
  urgency: string;
  clinicalNotes: string | null;
  status: string;
  createdAt: string;
}

export interface RadiologyReportItemData {
  id: string;
  reportNumber: string;
  serviceType: string;
  examination: string;
  status: string;
  clinicalFindings: string;
  impression: string;
  recommendation: string | null;
  technicianNotes: string | null;
  technicianName: string;
  reportDate: string;
}

export interface RadiologyHistoryData {
  orders: RadiologyOrderItemData[];
  reports: RadiologyReportItemData[];
}

export interface AdmissionHistoryData {
  orderId: string | null;
  admissionType: string | null;
  priority: string | null;
  recommendedWard: string | null;
  provisionalDiagnosis: string | null;
  admissionId: string | null;
  admissionNumber: string | null;
  roomName: string | null;
  roomCharges: number | null;
  status: string | null;
  notes: string | null;
  admissionDate: string | null;
  dischargeDate: string | null;
  admittedByName: string | null;
  dischargedByName: string | null;
}

export interface OperationHistoryData {
  orderId: string | null;
  proposedProcedure: string | null;
  proposedDate: string | null;
  anesthesiaType: string | null;
  operationId: string | null;
  operationNumber: string | null;
  operationName: string | null;
  operationCharges: number | null;
  urgency: string | null;
  status: string | null;
  notes: string | null;
  operationDate: string | null;
  doctorName: string | null;
}

export interface InvoiceLineItemData {
  id: string;
  serviceCategory: string;
  itemDescription: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface BillingHistoryData {
  invoiceId: string;
  billNumber: string;
  subtotal: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentDate: string | null;
  receptionistName: string | null;
  items: InvoiceLineItemData[];
}

export interface VisitEncounterHistoryData {
  visit: VisitInfoData;
  prescription: PrescriptionHistoryData | null;
  laboratory: LabHistoryData | null;
  radiology: RadiologyHistoryData | null;
  admission: AdmissionHistoryData | null;
  operation: OperationHistoryData | null;
  billing: BillingHistoryData | null;
}

export interface CompletePatientHistoryData {
  patient: PatientSummaryData;
  roleScope: 'FULL' | 'LAB_ONLY' | 'RAD_ONLY';
  visits: VisitEncounterHistoryData[];
}

// 1. Search Patient History by MR Number
export async function searchPatientHistoryApi(mrNumber: string): Promise<CompletePatientHistoryData> {
  const res = await api.get('/history/search', { params: { mrNumber } });
  return res.data.data;
}

// 2. Get Complete Patient History by Patient ID
export async function getPatientHistoryApi(patientId: string): Promise<CompletePatientHistoryData> {
  const res = await api.get(`/history/patient/${patientId}`);
  return res.data.data;
}

// 3. Get Specific Visit Encounter Details
export async function getVisitDetailsApi(visitId: string): Promise<VisitEncounterHistoryData> {
  const res = await api.get(`/history/visit/${visitId}`);
  return res.data.data;
}
