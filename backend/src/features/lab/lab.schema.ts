import { pgTable, uuid, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { patients, patientVisits } from '../patients/patients.schema';
import { labOrders } from '../orders/orders.schema';
import { users } from '../../db/schema';

// 1. Laboratory Reports Table
export const labReports = pgTable('lab_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  labOrderId: uuid('lab_order_id')
    .notNull()
    .references(() => labOrders.id, { onDelete: 'cascade' }),
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  technicianId: uuid('technician_id').references(() => users.id, { onDelete: 'set null' }),
  technicianName: varchar('technician_name', { length: 150 }).notNull().default('Lab Staff'),
  reportNumber: varchar('report_number', { length: 50 }).notNull().unique(),
  status: varchar('status', { length: 30 }).notNull().default('IN_PROGRESS'), // 'IN_PROGRESS' | 'COMPLETED'
  overallRemarks: text('overall_remarks'),
  technicianNotes: text('technician_notes'),
  resultDate: timestamp('result_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 2. Laboratory Report Items (Parameter Results) Table
export const labReportItems = pgTable('lab_report_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id')
    .notNull()
    .references(() => labReports.id, { onDelete: 'cascade' }),
  parameterName: varchar('parameter_name', { length: 255 }).notNull(), // e.g. "Hemoglobin (Hb)", "WBC Count"
  resultValue: varchar('result_value', { length: 255 }).notNull(), // e.g. "13.5", "8,000"
  unit: varchar('unit', { length: 50 }), // e.g. "g/dL", "/cmm", "U/L"
  referenceRange: varchar('reference_range', { length: 150 }), // e.g. "12.0 - 16.5", "4,000 - 11,000"
  isAbnormal: boolean('is_abnormal').notNull().default(false),
  remarks: text('remarks'),
  sequence: integer('sequence').notNull().default(1),
});
