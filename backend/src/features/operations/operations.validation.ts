import { z } from 'zod';

export const createOperationSchema = z.object({
  visitId: z.string().uuid('Invalid Visit ID'),
  patientId: z.string().uuid('Invalid Patient ID'),
  doctorId: z.string().uuid('Invalid Doctor ID'),
  operationName: z.string().min(2, 'Operation procedure name is required').max(255),
  operationCharges: z.number().min(0, 'Operation charges cannot be negative').optional().default(20000),
  urgency: z.enum(['ELECTIVE', 'URGENT', 'EMERGENCY']).optional().default('ELECTIVE'),
  notes: z.string().max(2000).optional().nullable(),
  operationOrderId: z.string().uuid('Invalid Operation Order ID').optional().nullable(),
});

export const cancelOperationSchema = z.object({
  reason: z.string().max(1000).optional().nullable(),
});
