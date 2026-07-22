import { api } from './api-client';

export interface DoctorAvailability {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface PublicDoctorProfile {
  id: string;
  slug: string;
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  qualification: string;
  specialization: string;
  department: string;
  departmentSlug: string;
  experience: number;
  gender: string;
  consultationFee: number;
  registrationNumber?: string | null;
  photoUrl: string | null;
  biography: string;
  services: string[];
  isActive: boolean;
  availabilities: DoctorAvailability[];
}

export interface PublicDepartmentDoctorSummary {
  id: string;
  slug: string;
  fullName: string;
  qualification: string;
  specialization: string;
  experience: number;
  photoUrl: string | null;
}

export interface PublicDepartment {
  id: string;
  slug: string;
  name: string;
  iconName: string;
  shortDescription: string;
  fullDescription: string;
  services: string[];
  doctorCount: number;
  doctors: PublicDepartmentDoctorSummary[];
}

export interface DoctorQueryFilter {
  search?: string;
  department?: string;
  availability?: string;
  sortBy?: 'name_asc' | 'experience_desc' | 'experience_asc';
}

/**
 * Fetch all public doctors from HMS API with search, filtering, and sorting
 */
export async function getPublicDoctorsApi(filters: DoctorQueryFilter = {}): Promise<PublicDoctorProfile[]> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.department && filters.department !== 'ALL') params.append('department', filters.department);
  if (filters.availability && filters.availability !== 'ALL') params.append('availability', filters.availability);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);

  const res = await api.get(`/public/doctors?${params.toString()}`);
  return res.data.data;
}

/**
 * Fetch single doctor details by ID or Slug from HMS API
 */
export async function getPublicDoctorBySlugApi(idOrSlug: string): Promise<PublicDoctorProfile> {
  const res = await api.get(`/public/doctors/${idOrSlug}`);
  return res.data.data;
}

/**
 * Fetch all clinical departments from HMS API
 */
export async function getPublicDepartmentsApi(): Promise<PublicDepartment[]> {
  const res = await api.get('/public/departments');
  return res.data.data;
}

/**
 * Fetch single department details by ID or Slug from HMS API (with doctors)
 */
export async function getPublicDepartmentBySlugApi(idOrSlug: string): Promise<PublicDepartment> {
  const res = await api.get(`/public/departments/${idOrSlug}`);
  return res.data.data;
}
