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

export interface CreateLabOrderDTO {
  visitId: string;
  patientId: string;
  doctorId: string;
  testName: string;
  category?: string;
  urgency?: OrderUrgency;
  clinicalNotes?: string | null;
}

export interface CreateRadiologyOrderDTO {
  visitId: string;
  patientId: string;
  doctorId: string;
  modality: RadiologyModality;
  procedureName: string;
  bodyPart?: string | null;
  urgency?: OrderUrgency;
  clinicalNotes?: string | null;
}

export interface CreateAdmissionOrderDTO {
  visitId: string;
  patientId: string;
  doctorId: string;
  admissionType?: AdmissionType;
  priority?: OrderUrgency;
  recommendedWard?: RecommendedWard;
  provisionalDiagnosis?: string | null;
  specialInstructions?: string | null;
}

export interface CreateOperationOrderDTO {
  visitId: string;
  patientId: string;
  doctorId: string;
  procedureName: string;
  proposedDate?: string | Date | null;
  urgency?: OrderUrgency;
  anesthesiaType?: AnesthesiaType;
  specialNotes?: string | null;
}

export interface LabOrderResponseDTO {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  testName: string;
  category: string;
  urgency: OrderUrgency;
  clinicalNotes: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RadiologyOrderResponseDTO {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  modality: RadiologyModality;
  procedureName: string;
  bodyPart: string | null;
  urgency: OrderUrgency;
  clinicalNotes: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdmissionOrderResponseDTO {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  admissionType: AdmissionType;
  priority: OrderUrgency;
  recommendedWard: RecommendedWard;
  provisionalDiagnosis: string | null;
  specialInstructions: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationOrderResponseDTO {
  id: string;
  visitId: string;
  patientId: string;
  doctorId: string;
  procedureName: string;
  proposedDate: Date | null;
  urgency: OrderUrgency;
  anesthesiaType: AnesthesiaType;
  specialNotes: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitOrdersSummaryDTO {
  labOrders: LabOrderResponseDTO[];
  radiologyOrders: RadiologyOrderResponseDTO[];
  admissionOrders: AdmissionOrderResponseDTO[];
  operationOrders: OperationOrderResponseDTO[];
}
