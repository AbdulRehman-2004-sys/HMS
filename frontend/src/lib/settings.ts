import { api } from './api-client';

export interface HospitalSettings {
  id: string;
  hospitalName: string;
  hospitalLogo: string | null;
  address: string;
  contactNumber: string;
  email: string | null;
  updatedAt: string;
}

export interface UpdateHospitalSettingsInput {
  hospitalName?: string;
  hospitalLogo?: string | null;
  address?: string;
  contactNumber?: string;
  email?: string | null;
}

// Get Central Hospital Settings Profile
export async function getHospitalSettingsApi(): Promise<HospitalSettings> {
  const res = await api.get('/settings/hospital');
  return res.data.data;
}

// Update Central Hospital Settings Profile (Super Admin only)
export async function updateHospitalSettingsApi(
  data: UpdateHospitalSettingsInput
): Promise<HospitalSettings> {
  const res = await api.put('/settings/hospital', data);
  return res.data.data;
}
