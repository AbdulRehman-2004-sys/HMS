import { AppointmentStatusType } from './appointments.schema';

export interface AppointmentDTO {
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
  status: AppointmentStatusType;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateAppointmentDTO {
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

export interface CheckinResultDTO {
  appointment: AppointmentDTO;
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
