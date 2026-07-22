import { z } from 'zod';

export const searchPatientByMrSchema = z.object({
  mrNumber: z
    .string()
    .min(1, 'MR Number is required.')
    .trim(),
});

export const patientIdParamSchema = z.object({
  patientId: z.string().uuid('Invalid Patient ID format.'),
});

export const visitIdParamSchema = z.object({
  visitId: z.string().uuid('Invalid Visit ID format.'),
});
