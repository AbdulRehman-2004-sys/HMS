import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { patients, patientVisits } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';

// 1. Laboratory Orders Table
export const labOrders = pgTable('lab_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  testName: varchar('test_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull().default('General'), // 'Hematology', 'Biochemistry', 'Microbiology', 'Serology'
  urgency: varchar('urgency', { length: 50 }).notNull().default('ROUTINE'), // 'ROUTINE' | 'URGENT' | 'STAT'
  clinicalNotes: text('clinical_notes'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 2. Radiology Orders Table (X-Ray, Ultrasound, CT, MRI)
export const radiologyOrders = pgTable('radiology_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  modality: varchar('modality', { length: 50 }).notNull(), // 'X_RAY' | 'ULTRASOUND' | 'CT_SCAN' | 'MRI'
  procedureName: varchar('procedure_name', { length: 255 }).notNull(),
  bodyPart: varchar('body_part', { length: 100 }),
  urgency: varchar('urgency', { length: 50 }).notNull().default('ROUTINE'), // 'ROUTINE' | 'URGENT' | 'STAT'
  clinicalNotes: text('clinical_notes'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 3. Inpatient Admission Orders Table
export const admissionOrders = pgTable('admission_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  admissionType: varchar('admission_type', { length: 50 }).notNull().default('EMERGENCY'), // 'EMERGENCY' | 'ELECTIVE' | 'DAYCARE'
  priority: varchar('priority', { length: 50 }).notNull().default('ROUTINE'), // 'ROUTINE' | 'URGENT'
  recommendedWard: varchar('recommended_ward', { length: 100 }).notNull().default('GENERAL_WARD'), // 'GENERAL_WARD' | 'PRIVATE_ROOM' | 'ICU' | 'CCU' | 'NEONATAL_ICU'
  provisionalDiagnosis: text('provisional_diagnosis'),
  specialInstructions: text('special_instructions'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 4. Surgical Operation Orders Table
export const operationOrders = pgTable('operation_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  procedureName: varchar('procedure_name', { length: 255 }).notNull(),
  proposedDate: timestamp('proposed_date'),
  urgency: varchar('urgency', { length: 50 }).notNull().default('ELECTIVE'), // 'ELECTIVE' | 'URGENT' | 'EMERGENCY'
  anesthesiaType: varchar('anesthesia_type', { length: 50 }).notNull().default('GENERAL'), // 'GENERAL' | 'SPINAL' | 'LOCAL' | 'SEDATION'
  specialNotes: text('special_notes'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
