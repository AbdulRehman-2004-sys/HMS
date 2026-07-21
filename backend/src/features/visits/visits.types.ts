export enum VisitStatus {
  WAITING = 'WAITING',
  WITH_DOCTOR = 'WITH_DOCTOR',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateVisitDTO {
  patientId: string;
  doctorId: string;
  chiefComplaint?: string;
  temperature?: string;
  pulse?: string;
  bloodPressure?: string;
  weight?: string;
  clinicalNotes?: string;
}

export interface UpdateVisitStatusDTO {
  status: VisitStatus;
  clinicalNotes?: string;
}

export interface VisitQueryDTO {
  doctorId?: string;
  status?: VisitStatus;
  search?: string;
  page?: number;
  limit?: number;
  date?: string; // YYYY-MM-DD
}

export interface VisitResponseDTO {
  id: string;
  visitNumber: string;
  tokenNumber: number;
  visitDate: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface PastVisitSummary {
  id: string;
  visitNumber: string;
  visitDate: Date;
  doctorName: string;
  chiefComplaint: string | null;
  clinicalNotes: string | null;
  status: VisitStatus;
}

export interface EMRDetailsResponseDTO {
  visit: VisitResponseDTO;
  pastVisits: PastVisitSummary[];
  previousPrescriptions: unknown[]; // Placeholder for Ticket 7
  previousLabReports: unknown[];    // Placeholder for Lab Module
  previousRadiologyReports: unknown[]; // Placeholder for Rad Module
}

export interface QueueSummaryDTO {
  total: number;
  waiting: number;
  withDoctor: number;
  completed: number;
  cancelled: number;
}
