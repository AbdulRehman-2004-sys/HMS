import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { patients, patientVisits } from '../patients/patients.schema';
import { radiologyOrders } from '../orders/orders.schema';
import { users } from '../../db/schema';

// 1. Radiology Reports Table
export const radiologyReports = pgTable('radiology_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  radiologyOrderId: uuid('radiology_order_id')
    .notNull()
    .references(() => radiologyOrders.id, { onDelete: 'cascade' }),
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  technicianId: uuid('technician_id').references(() => users.id, { onDelete: 'set null' }),
  technicianName: varchar('technician_name', { length: 150 }).notNull().default('Radiology Staff'),
  reportNumber: varchar('report_number', { length: 50 }).notNull().unique(),
  serviceType: varchar('service_type', { length: 50 }).notNull().default('XRAY'), // 'XRAY' | 'ULTRASOUND' | 'CT' | 'MRI'
  examination: varchar('examination', { length: 255 }).notNull(), // e.g. "Chest X-Ray PA View", "Ultrasound Abdomen & Pelvis"
  status: varchar('status', { length: 30 }).notNull().default('IN_PROGRESS'), // 'IN_PROGRESS' | 'COMPLETED'
  clinicalFindings: text('clinical_findings').notNull(),
  impression: text('impression').notNull(),
  recommendation: text('recommendation'),
  technicianNotes: text('technician_notes'),
  reportDate: timestamp('report_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
