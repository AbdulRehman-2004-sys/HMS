import { api } from './api-client';

export interface CreateOnlineAppointmentInput {
  department: string;
  doctorId: string;
  appointmentDate: string;
  patientName: string;
  fatherHusbandName: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  reasonForVisit?: string;
}

export interface AppointmentRecord {
  id: string;
  appointmentNumber: string;
  patientId: string | null;
  visitId: string | null;
  doctorId: string;
  doctorName?: string;
  doctorSpecialization?: string;
  department: string;
  appointmentDate: string;
  patientName: string;
  fatherHusbandName: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  reasonForVisit?: string | null;
  status: 'PENDING_CHECKIN' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface CheckinResultData {
  appointment: AppointmentRecord;
  patient: {
    id: string;
    mrNumber: string;
    fullName: string;
    phone: string;
    isNew: boolean;
  };
  visit: {
    id: string;
    tokenNumber: string;
    status: string;
    queueNumber: number;
  };
}

/**
 * Public: Book Online Appointment
 */
export async function bookOnlineAppointmentApi(
  data: CreateOnlineAppointmentInput
): Promise<AppointmentRecord> {
  const res = await api.post('/public/appointments', data);
  return res.data.data;
}

/**
 * Receptionist: Fetch Pending Online Check-in Appointments
 */
export async function getPendingCheckinAppointmentsApi(
  search?: string
): Promise<AppointmentRecord[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const res = await api.get(`/appointments/pending?${params.toString()}`);
  return res.data.data;
}

/**
 * Receptionist: Execute Check-in for Online Appointment
 */
export async function checkinOnlineAppointmentApi(
  appointmentId: string
): Promise<CheckinResultData> {
  const res = await api.post(`/appointments/${appointmentId}/checkin`);
  return res.data.data;
}
