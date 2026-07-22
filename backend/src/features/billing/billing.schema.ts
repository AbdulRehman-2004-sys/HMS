import { pgTable, uuid, varchar, numeric, integer, timestamp } from 'drizzle-orm/pg-core';
import { patients, patientVisits } from '../patients/patients.schema';
import { doctors } from '../doctors/doctors.schema';
import { users } from '../../db/schema';

// 1. Invoices Master Table
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  billNumber: varchar('bill_number', { length: 50 }).notNull().unique(), // e.g. "INV-20260721-0001"
  visitId: uuid('visit_id')
    .notNull()
    .references(() => patientVisits.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id').references(() => doctors.id, { onDelete: 'set null' }),
  receptionistId: uuid('receptionist_id').references(() => users.id, { onDelete: 'set null' }),
  receptionistName: varchar('receptionist_name', { length: 150 }).notNull().default('Receptionist Staff'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull().default('0.00'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  paidAmount: numeric('paid_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  remainingAmount: numeric('remaining_amount', { precision: 10, scale: 2 }).notNull().default('0.00'),
  paymentStatus: varchar('payment_status', { length: 30 }).notNull().default('PENDING'), // 'PENDING' | 'PAID'
  paymentMethod: varchar('payment_method', { length: 30 }).default('CASH'), // 'CASH' | 'CARD' | 'ONLINE'
  paymentDate: timestamp('payment_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// 2. Invoice Line Items Table
export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  serviceCategory: varchar('service_category', { length: 50 }).notNull(), // 'CONSULTATION' | 'LAB' | 'RADIOLOGY' | 'ADMISSION' | 'OPERATION'
  itemDescription: varchar('item_description', { length: 255 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
