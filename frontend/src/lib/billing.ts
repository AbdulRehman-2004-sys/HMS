import { api } from './api-client';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  ONLINE = 'ONLINE',
}

export enum ServiceCategory {
  CONSULTATION = 'CONSULTATION',
  LAB = 'LAB',
  RADIOLOGY = 'RADIOLOGY',
  ADMISSION = 'ADMISSION',
  OPERATION = 'OPERATION',
}

export interface RecordPaymentPayload {
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
}

export interface InvoiceItemData {
  id: string;
  invoiceId: string;
  serviceCategory: ServiceCategory;
  itemDescription: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
}

export interface InvoiceData {
  id: string;
  billNumber: string;
  visitId: string;
  patientId: string;
  doctorId?: string | null;
  receptionistId?: string | null;
  receptionistName: string;
  subtotal: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  paymentDate?: string | null;
  patientName: string;
  patientMrNumber: string;
  patientMobile: string;
  patientAge?: number | null;
  patientGender: string;
  doctorName: string;
  visitNumber: string;
  tokenNumber: number;
  visitDate: string;
  items: InvoiceItemData[];
  createdAt: string;
  updatedAt: string;
}

export interface UnbilledEncounterData {
  visitId: string;
  patientId: string;
  doctorId: string;
  visitNumber: string;
  tokenNumber: number;
  visitDate: string;
  patientName: string;
  patientMrNumber: string;
  patientAge?: number | null;
  patientGender: string;
  patientMobile: string;
  doctorName: string;
  consultationFee: number;
  labOrdersCount: number;
  radiologyOrdersCount: number;
  hasAdmission: boolean;
  hasOperation: boolean;
  estimatedTotal: number;
  invoiceId?: string | null;
  billNumber?: string | null;
  paymentStatus?: PaymentStatus | null;
}

export interface BillingSummaryData {
  todayTotalInvoiced: number;
  todayRevenueCollected: number;
  pendingBillsCount: number;
  encounters: UnbilledEncounterData[];
}

// 1. Get Billing Summary Dashboard
export async function getBillingSummaryApi(search?: string): Promise<BillingSummaryData> {
  const res = await api.get('/billing/summary', { params: { search } });
  return res.data.data.summary;
}

// 2. Auto-Generate Invoice for Visit
export async function generateInvoiceApi(visitId: string): Promise<InvoiceData> {
  const res = await api.post('/billing/generate', { visitId });
  return res.data.data.invoice;
}

// 3. Record Payment & Mark as PAID
export async function recordPaymentApi(invoiceId: string, payload?: RecordPaymentPayload): Promise<InvoiceData> {
  const res = await api.post(`/billing/${invoiceId}/pay`, payload || {});
  return res.data.data.invoice;
}

// 4. Get Invoice by Visit ID
export async function getInvoiceByVisitIdApi(visitId: string): Promise<InvoiceData | null> {
  const res = await api.get(`/billing/visit/${visitId}`);
  return res.data.data.invoice;
}

// 5. Get Invoice by ID
export async function getInvoiceByIdApi(invoiceId: string): Promise<InvoiceData | null> {
  const res = await api.get(`/billing/${invoiceId}`);
  return res.data.data.invoice;
}
