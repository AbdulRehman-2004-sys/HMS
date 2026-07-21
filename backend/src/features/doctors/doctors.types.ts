export interface DoctorDTO {
  id: string;
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: number;
  gender: string;
  consultationFee: number;
  registrationNumber?: string | null;
  signatureText?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateDoctorDTO {
  userId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: number;
  gender: string;
  consultationFee?: number;
  registrationNumber?: string;
  signatureText?: string;
}

export interface UpdateDoctorDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  gender?: string;
  consultationFee?: number;
  registrationNumber?: string;
  signatureText?: string;
}

export interface DoctorQueryDTO {
  search?: string;
  specialization?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface DoctorAvailabilityDTO {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateAvailabilityDTO {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface UpdateAvailabilityDTO {
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}
