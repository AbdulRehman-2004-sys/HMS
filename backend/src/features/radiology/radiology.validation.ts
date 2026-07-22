import { z } from 'zod';
import { RadiologyReportStatus, RadiologyServiceType } from './radiology.types';

export const saveRadiologyReportSchema = z.object({
  radiologyOrderId: z.string().uuid('Invalid Radiology Order ID'),
  visitId: z.string().uuid('Invalid Visit ID'),
  patientId: z.string().uuid('Invalid Patient ID'),
  serviceType: z.nativeEnum(RadiologyServiceType),
  examination: z.string().min(2, 'Examination name is required').max(255),
  clinicalFindings: z.string().min(5, 'Clinical findings are required').max(5000),
  impression: z.string().min(3, 'Impression is required').max(3000),
  recommendation: z.string().max(2000).optional().nullable(),
  technicianNotes: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(RadiologyReportStatus),
});
