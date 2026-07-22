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

export interface GenerateInvoiceDTO {
  visitId: string;
}

export interface RecordPaymentDTO {
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
}

export interface InvoiceItemDataDTO {
  id: string;
  invoiceId: string;
  serviceCategory: ServiceCategory;
  itemDescription: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
}

export interface InvoiceDataDTO {
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
  paymentDate?: Date | null;
  patientName: string;
  patientMrNumber: string;
  patientMobile: string;
  patientAge?: number | null;
  patientGender: string;
  doctorName: string;
  visitNumber: string;
  tokenNumber: number;
  visitDate: Date;
  items: InvoiceItemDataDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UnbilledEncounterDTO {
  visitId: string;
  patientId: string;
  doctorId: string;
  visitNumber: string;
  tokenNumber: number;
  visitDate: Date;
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

export interface BillingSummaryDTO {
  todayTotalInvoiced: number;
  todayRevenueCollected: number;
  pendingBillsCount: number;
  encounters: UnbilledEncounterDTO[];
}
