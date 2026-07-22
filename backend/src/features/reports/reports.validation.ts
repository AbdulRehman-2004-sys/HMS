import { z } from 'zod';

export const reportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  doctorId: z.string().optional(),
  department: z.string().optional(),
});
