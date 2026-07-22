import { z } from 'zod';

export const generateInvoiceSchema = z.object({
  visitId: z.string().uuid('Invalid Visit ID'),
});

export const recordPaymentSchema = z.object({
  paymentMethod: z.enum(['CASH', 'CARD', 'ONLINE']).optional().default('CASH'),
  amountPaid: z.number().min(0, 'Payment amount cannot be negative').optional(),
});
