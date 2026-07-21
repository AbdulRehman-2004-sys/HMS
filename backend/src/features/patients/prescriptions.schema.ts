import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { patients, patientVisits } from './patients.schema';
import { doctors } from '../doctors/doctors.schema';

export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitId: uuid('visit_id').references(() => patientVisits.id, { onDelete: 'set null' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  prescriptionNumber: varchar('prescription_number', { length: 50 }).notNull().unique(),
  diagnosis: text('diagnosis'),
  advice: text('advice'),
  followUpDate: timestamp('follow_up_date'),
  status: varchar('status', { length: 30 }).notNull().default('ACTIVE'), // 'ACTIVE' | 'DISPENSED' | 'CANCELLED'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const prescriptionItems = pgTable('prescription_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  prescriptionId: uuid('prescription_id')
    .notNull()
    .references(() => prescriptions.id, { onDelete: 'cascade' }),
  medicineName: varchar('medicine_name', { length: 255 }).notNull(),
  dosage: varchar('dosage', { length: 100 }).notNull(), // e.g. "1 Tablet", "2 Teaspoons", "1 Capsule"
  frequency: varchar('frequency', { length: 100 }).notNull(), // e.g. "1-0-1", "1-1-1", "Once daily", "SOS"
  duration: varchar('duration', { length: 100 }).notNull(), // e.g. "5 Days", "1 Week", "1 Month"
  instructions: text('instructions'), // e.g. "After meal", "Before meal", "At bedtime"
  sequence: integer('sequence').notNull().default(1),
});
