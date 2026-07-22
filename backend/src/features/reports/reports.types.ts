export type ReportType =
  | 'patient'
  | 'doctor'
  | 'lab'
  | 'radiology'
  | 'admission'
  | 'billing'
  | 'revenue';

export interface ReportFilterDTO {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  department?: string;
}

export interface PatientReportRowDTO {
  id: string;
  mrNumber: string;
  fullName: string;
  age: number | null;
  gender: string;
  mobileNumber: string;
  city: string;
  createdAt: Date;
}

export interface DoctorReportRowDTO {
  id: string;
  doctorName: string;
  specialization: string;
  qualification: string;
  totalVisits: number;
  totalRevenue: number;
}

export interface LabReportRowDTO {
  id: string;
  reportNumber: string;
  patientName: string;
  mrNumber: string;
  testCount: number;
  technicianName: string;
  status: string;
  resultDate: Date;
}

export interface RadiologyReportRowDTO {
  id: string;
  reportNumber: string;
  patientName: string;
  mrNumber: string;
  serviceType: string;
  examination: string;
  status: string;
  reportDate: Date;
}

export interface AdmissionReportRowDTO {
  id: string;
  admissionNumber: string;
  patientName: string;
  mrNumber: string;
  roomName: string;
  roomCharges: number;
  status: string;
  admissionDate: Date;
  dischargeDate: Date | null;
}

export interface BillingReportRowDTO {
  id: string;
  billNumber: string;
  patientName: string;
  mrNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentDate: Date | null;
}

export interface RevenueReportRowDTO {
  id: string;
  dateStr: string;
  consultationRevenue: number;
  labRevenue: number;
  radiologyRevenue: number;
  admissionRevenue: number;
  operationRevenue: number;
  totalDailyRevenue: number;
}

export interface ReportDataResponseDTO {
  reportType: ReportType;
  totalRecords: number;
  summaryMetrics: Record<string, any>;
  rows: any[];
}
