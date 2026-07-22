import { pgTable, uuid, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { patients, patientVisits } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';

export const APPOINTMENT_STATUSES = ['PENDING_CHECKIN', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'] as const;
export type AppointmentStatusType = (typeof APPOINTMENT_STATUSES)[number];

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentNumber: varchar('appointment_number', { length: 50 }).notNull().unique(), // e.g. APT-20260722-0001
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  visitId: uuid('visit_id').references(() => patientVisits.id, { onDelete: 'set null' }),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  department: varchar('department', { length: 100 }).notNull(),
  appointmentDate: varchar('appointment_date', { length: 20 }).notNull(), // YYYY-MM-DD
  patientName: varchar('patient_name', { length: 100 }).notNull(),
  fatherHusbandName: varchar('father_husband_name', { length: 100 }).notNull(),
  age: integer('age').notNull(),
  gender: varchar('gender', { length: 20 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address').notNull(),
  reasonForVisit: text('reason_for_visit'),
  status: varchar('status', { length: 30 }).notNull().default('PENDING_CHECKIN'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
