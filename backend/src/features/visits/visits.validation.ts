import { z } from 'zod';
import { VisitStatus } from './visits.types';

export const createVisitSchema = z.object({
  patientId: z.string().uuid({ message: 'Valid Patient ID is required' }),
  doctorId: z.string().uuid({ message: 'Valid Doctor ID is required' }),
  chiefComplaint: z.string().max(1000).optional(),
  temperature: z.string().max(20).optional(),
  pulse: z.string().max(20).optional(),
  bloodPressure: z.string().max(30).optional(),
  weight: z.string().max(20).optional(),
  clinicalNotes: z.string().max(5000).optional(),
});

export const updateVisitStatusSchema = z.object({
  status: z.nativeEnum(VisitStatus, {
    errorMap: () => ({ message: 'Status must be one of WAITING, WITH_DOCTOR, COMPLETED, CANCELLED' }),
  }),
  clinicalNotes: z.string().max(5000).optional(),
});

export const visitQuerySchema = z.object({
  doctorId: z.string().uuid().optional().or(z.literal('all')),
  status: z.nativeEnum(VisitStatus).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be YYYY-MM-DD format' }).optional(),
});
