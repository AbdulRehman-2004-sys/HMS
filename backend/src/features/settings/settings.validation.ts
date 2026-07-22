import { z } from 'zod';

export const updateHospitalSettingsSchema = z.object({
  hospitalName: z.string().min(2, 'Hospital name must be at least 2 characters').max(255).optional(),
  hospitalLogo: z.string().nullable().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters').optional(),
  contactNumber: z.string().min(5, 'Contact number must be at least 5 characters').max(50).optional(),
  email: z.string().email('Invalid email address').nullable().or(z.literal('')).optional(),
});
