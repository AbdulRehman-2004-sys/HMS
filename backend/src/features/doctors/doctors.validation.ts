import { z } from 'zod';

export const createDoctorSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  experience: z.coerce.number().min(0, 'Experience must be a positive number'),
  gender: z.string().min(1, 'Gender is required'),
  consultationFee: z.coerce.number().min(0, 'Consultation fee must be a positive number').optional().default(500),
  registrationNumber: z.string().optional(),
  signatureText: z.string().optional(),
});

export const updateDoctorSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  qualification: z.string().min(1, 'Qualification is required').optional(),
  specialization: z.string().min(1, 'Specialization is required').optional(),
  experience: z.coerce.number().min(0, 'Experience must be a positive number').optional(),
  gender: z.string().min(1, 'Gender is required').optional(),
  consultationFee: z.coerce.number().min(0, 'Consultation fee must be a positive number').optional(),
  registrationNumber: z.string().optional(),
  signatureText: z.string().optional(),
});

export const updateDoctorStatusSchema = z.object({
  isActive: z.boolean(),
});

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const createAvailabilitySchema = z.object({
  dayOfWeek: z.enum(DAYS_OF_WEEK, {
    errorMap: () => ({ message: 'Please select a valid day of the week' }),
  }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  isActive: z.boolean().optional().default(true),
});

export const updateAvailabilitySchema = z.object({
  dayOfWeek: z.enum(DAYS_OF_WEEK).optional(),
  startTime: z.string().min(1, 'Start time is required').optional(),
  endTime: z.string().min(1, 'End time is required').optional(),
  isActive: z.boolean().optional(),
});
