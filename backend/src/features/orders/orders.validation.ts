import { z } from 'zod';
import { AdmissionType, AnesthesiaType, OrderStatus, OrderUrgency, RadiologyModality, RecommendedWard } from './orders.types';

export const createLabOrderSchema = z.object({
  visitId: z.string().uuid('Invalid Visit ID'),
  patientId: z.string().uuid('Invalid Patient ID'),
  doctorId: z.string().uuid('Invalid Doctor ID'),
  testName: z.string().min(1, 'Test name is required').max(255),
  category: z.string().max(100).optional().default('General'),
  urgency: z.nativeEnum(OrderUrgency).optional().default(OrderUrgency.ROUTINE),
  clinicalNotes: z.string().max(1000).optional().nullable(),
});

export const createRadiologyOrderSchema = z.object({
  visitId: z.string().uuid('Invalid Visit ID'),
  patientId: z.string().uuid('Invalid Patient ID'),
  doctorId: z.string().uuid('Invalid Doctor ID'),
  modality: z.nativeEnum(RadiologyModality),
  procedureName: z.string().min(1, 'Procedure name is required').max(255),
  bodyPart: z.string().max(100).optional().nullable(),
  urgency: z.nativeEnum(OrderUrgency).optional().default(OrderUrgency.ROUTINE),
  clinicalNotes: z.string().max(1000).optional().nullable(),
});

export const createAdmissionOrderSchema = z.object({
  visitId: z.string().uuid('Invalid Visit ID'),
  patientId: z.string().uuid('Invalid Patient ID'),
  doctorId: z.string().uuid('Invalid Doctor ID'),
  admissionType: z.nativeEnum(AdmissionType).optional().default(AdmissionType.EMERGENCY),
  priority: z.nativeEnum(OrderUrgency).optional().default(OrderUrgency.ROUTINE),
  recommendedWard: z.nativeEnum(RecommendedWard).optional().default(RecommendedWard.GENERAL_WARD),
  provisionalDiagnosis: z.string().max(1000).optional().nullable(),
  specialInstructions: z.string().max(1000).optional().nullable(),
});

export const createOperationOrderSchema = z.object({
  visitId: z.string().uuid('Invalid Visit ID'),
  patientId: z.string().uuid('Invalid Patient ID'),
  doctorId: z.string().uuid('Invalid Doctor ID'),
  procedureName: z.string().min(1, 'Operation procedure name is required').max(255),
  proposedDate: z.string().optional().nullable(),
  urgency: z.nativeEnum(OrderUrgency).optional().default(OrderUrgency.ELECTIVE),
  anesthesiaType: z.nativeEnum(AnesthesiaType).optional().default(AnesthesiaType.GENERAL),
  specialNotes: z.string().max(1000).optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});
