import { z } from 'zod';
import { LabReportStatus } from './lab.types';

export const labReportItemSchema = z.object({
  id: z.string().uuid().optional(),
  parameterName: z.string().min(1, 'Parameter name is required').max(255),
  resultValue: z.string().min(1, 'Result value is required').max(255),
  unit: z.string().max(50).optional().nullable(),
  referenceRange: z.string().max(150).optional().nullable(),
  isAbnormal: z.boolean().optional().default(false),
  remarks: z.string().max(500).optional().nullable(),
  sequence: z.number().int().optional(),
});

export const saveLabReportSchema = z.object({
  labOrderId: z.string().uuid('Invalid Lab Order ID'),
  visitId: z.string().uuid('Invalid Visit ID'),
  patientId: z.string().uuid('Invalid Patient ID'),
  technicianNotes: z.string().max(2000).optional().nullable(),
  overallRemarks: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(LabReportStatus),
  items: z.array(labReportItemSchema).min(1, 'At least one test result parameter is required'),
});
