import { pgTable, uuid, varchar, text, numeric, timestamp } from 'drizzle-orm/pg-core';
import { patients, patientVisits } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { operationOrders } from '../orders/orders.schema';

// Patient Operations Table
export const patientOperations = pgTable('patient_operations', {
  id: uuid('id').primaryKey().defaultRandom(),
  operationOrderId: uuid('operation_order_id').references(() => operationOrders.id, { onDelete: 'set null' }),
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'set null' }),
  doctorName: varchar('doctor_name', { length: 150 }).notNull(),
  operationNumber: varchar('operation_number', { length: 50 }).notNull().unique(),
  operationName: varchar('operation_name', { length: 255 }).notNull(), // e.g. "Appendectomy", "Cholecystectomy"
  operationCharges: numeric('operation_charges', { precision: 10, scale: 2 }).notNull().default('20000.00'),
  urgency: varchar('urgency', { length: 30 }).notNull().default('ELECTIVE'), // 'ELECTIVE' | 'URGENT' | 'EMERGENCY'
  status: varchar('status', { length: 30 }).notNull().default('PENDING'), // 'PENDING' | 'COMPLETED' | 'CANCELLED'
  notes: text('notes'),
  operationDate: timestamp('operation_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
