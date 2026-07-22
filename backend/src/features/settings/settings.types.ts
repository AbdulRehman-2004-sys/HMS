export interface HospitalSettingsDTO {
  id: string;
  hospitalName: string;
  hospitalLogo: string | null;
  address: string;
  contactNumber: string;
  email: string | null;
  updatedAt: Date;
}

export interface UpdateHospitalSettingsDTO {
  hospitalName?: string;
  hospitalLogo?: string | null;
  address?: string;
  contactNumber?: string;
  email?: string | null;
}
