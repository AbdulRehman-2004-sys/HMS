import { z } from 'zod';

export const prescriptionItemSchema = z.object({
  id: z.string().uuid().optional(),
  medicineName: z.string().min(1, 'Medicine name is required').max(255),
  dosage: z.string().min(1, 'Dosage is required').max(100),
  frequency: z.string().min(1, 'Frequency is required').max(100),
  duration: z.string().min(1, 'Duration is required').max(100),
  instructions: z.string().max(500).optional().nullable(),
  sequence: z.number().int().optional(),
});

export const createPrescriptionSchema = z.object({
  visitId: z.string().uuid().optional().nullable(),
  patientId: z.string().uuid('Invalid Patient ID'),
  doctorId: z.string().uuid('Invalid Doctor ID'),
  diagnosis: z.string().max(1000).optional().nullable(),
  advice: z.string().max(2000).optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one medicine is required'),
});

export const updatePrescriptionSchema = z.object({
  diagnosis: z.string().max(1000).optional().nullable(),
  advice: z.string().max(2000).optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'DISPENSED', 'CANCELLED']).optional(),
  items: z.array(prescriptionItemSchema).optional(),
});
