import { z } from 'zod';

export const admitPatientSchema = z.object({
  admissionOrderId: z.string().uuid('Invalid Admission Order ID'),
  visitId: z.string().uuid('Invalid Visit ID'),
  patientId: z.string().uuid('Invalid Patient ID'),
  roomName: z.string().min(2, 'Room or ward name is required').max(150),
  roomCharges: z.number().min(0, 'Room charges cannot be negative').optional().default(5000),
  notes: z.string().max(2000).optional().nullable(),
});

export const dischargePatientSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
});
