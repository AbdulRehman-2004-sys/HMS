import { pgTable, uuid, varchar, text, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';
import { patients, patientVisits } from '../patients/patients.schema';
import { admissionOrders } from '../orders/orders.schema';
import { users } from '../../db/schema';

// 1. Patient Admissions Table
export const patientAdmissions = pgTable('patient_admissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  admissionOrderId: uuid('admission_order_id')
    .notNull()
    .references(() => admissionOrders.id, { onDelete: 'cascade' }),
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  admittedById: uuid('admitted_by_id').references(() => users.id, { onDelete: 'set null' }),
  admittedByName: varchar('admitted_by_name', { length: 150 }).notNull().default('Reception Staff'),
  admissionNumber: varchar('admission_number', { length: 50 }).notNull().unique(),
  roomName: varchar('room_name', { length: 150 }).notNull(), // e.g. "Private Room 101", "General Ward Bed 5"
  roomCharges: numeric('room_charges', { precision: 10, scale: 2 }).notNull().default('5000.00'),
  status: varchar('status', { length: 30 }).notNull().default('ADMITTED'), // 'ADMITTED' | 'DISCHARGED' | 'CANCELLED'
  notes: text('notes'),
  admissionDate: timestamp('admission_date').notNull().defaultNow(),
  dischargeDate: timestamp('discharge_date'),
  dischargedById: uuid('discharged_by_id').references(() => users.id, { onDelete: 'set null' }),
  dischargedByName: varchar('discharged_by_name', { length: 150 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 2. Billing Charges Entry Table (Auto-posted from Modules)
export const billingCharges = pgTable('billing_charges', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  sourceModule: varchar('source_module', { length: 50 }).notNull().default('ADMISSION'), // 'ADMISSION' | 'LAB' | 'RADIOLOGY' | 'OPD'
  sourceId: uuid('source_id').notNull(),
  itemDescription: varchar('item_description', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
