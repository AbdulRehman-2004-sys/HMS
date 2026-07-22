export interface PatientSummaryDTO {
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

export interface VisitInfoDTO {
  visitId: string;
  visitNumber: string;
  visitDate: Date;
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

export interface PrescriptionItemDTO {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}

export interface PrescriptionHistoryDTO {
  prescriptionId: string;
  prescriptionNumber: string;
  diagnosis: string | null;
  advice: string | null;
  followUpDate: Date | null;
  status: string;
  createdAt: Date;
  items: PrescriptionItemDTO[];
}

export interface LabOrderItemDTO {
  id: string;
  testName: string;
  category: string;
  urgency: string;
  clinicalNotes: string | null;
  status: string;
  createdAt: Date;
}

export interface LabReportParameterDTO {
  id: string;
  parameterName: string;
  resultValue: string;
  unit: string | null;
  referenceRange: string | null;
  isAbnormal: boolean;
  remarks: string | null;
}

export interface LabReportItemDTO {
  id: string;
  reportNumber: string;
  technicianName: string;
  status: string;
  overallRemarks: string | null;
  technicianNotes: string | null;
  resultDate: Date;
  items: LabReportParameterDTO[];
}

export interface LabHistoryDTO {
  orders: LabOrderItemDTO[];
  reports: LabReportItemDTO[];
}

export interface RadiologyOrderItemDTO {
  id: string;
  modality: string;
  procedureName: string;
  bodyPart: string | null;
  urgency: string;
  clinicalNotes: string | null;
  status: string;
  createdAt: Date;
}

export interface RadiologyReportItemDTO {
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
  reportDate: Date;
}

export interface RadiologyHistoryDTO {
  orders: RadiologyOrderItemDTO[];
  reports: RadiologyReportItemDTO[];
}

export interface AdmissionHistoryDTO {
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
  admissionDate: Date | null;
  dischargeDate: Date | null;
  admittedByName: string | null;
  dischargedByName: string | null;
}

export interface OperationHistoryDTO {
  orderId: string | null;
  proposedProcedure: string | null;
  proposedDate: Date | null;
  anesthesiaType: string | null;
  operationId: string | null;
  operationNumber: string | null;
  operationName: string | null;
  operationCharges: number | null;
  urgency: string | null;
  status: string | null;
  notes: string | null;
  operationDate: Date | null;
  doctorName: string | null;
}

export interface InvoiceLineItemDTO {
  id: string;
  serviceCategory: string;
  itemDescription: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface BillingHistoryDTO {
  invoiceId: string;
  billNumber: string;
  subtotal: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentDate: Date | null;
  receptionistName: string | null;
  items: InvoiceLineItemDTO[];
}

export interface VisitEncounterHistoryDTO {
  visit: VisitInfoDTO;
  prescription: PrescriptionHistoryDTO | null;
  laboratory: LabHistoryDTO | null;
  radiology: RadiologyHistoryDTO | null;
  admission: AdmissionHistoryDTO | null;
  operation: OperationHistoryDTO | null;
  billing: BillingHistoryDTO | null;
}

export interface CompletePatientHistoryDTO {
  patient: PatientSummaryDTO;
  roleScope: 'FULL' | 'LAB_ONLY' | 'RAD_ONLY';
  visits: VisitEncounterHistoryDTO[];
}
