export interface PatientDTO {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  fatherHusbandName: string;
  gender: string;
  dateOfBirth?: string | null;
  age?: number | null;
  maritalStatus?: string | null;
  mobileNumber: string;
  alternateMobileNumber?: string | null;
  address: string;
  city: string;
  cnic?: string | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  remarks?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  fatherHusbandName: string;
  gender: string;
  dateOfBirth?: string;
  age?: number;
  maritalStatus?: string;
  mobileNumber: string;
  alternateMobileNumber?: string;
  address: string;
  city?: string;
  cnic?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicDiseases?: string;
  remarks?: string;
}

export interface UpdatePatientDTO {
  firstName?: string;
  lastName?: string;
  fatherHusbandName?: string;
  gender?: string;
  dateOfBirth?: string;
  age?: number;
  maritalStatus?: string;
  mobileNumber?: string;
  alternateMobileNumber?: string;
  address?: string;
  city?: string;
  cnic?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicDiseases?: string;
  remarks?: string;
  isActive?: boolean;
}

export interface PatientQueryDTO {
  search?: string;
  gender?: string;
  city?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
