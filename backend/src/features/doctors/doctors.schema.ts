import { pgTable, uuid, varchar, integer, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { users } from '../../db/schema';

export const doctors = pgTable('doctors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // nullable link to user login credentials
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  qualification: text('qualification').notNull(),
  specialization: varchar('specialization', { length: 100 }).notNull(),
  experience: integer('experience').notNull(), // Years of experience
  gender: varchar('gender', { length: 20 }).notNull(),
  consultationFee: integer('consultation_fee').notNull().default(1000),
  registrationNumber: varchar('registration_number', { length: 100 }), // Optional PMDC Reg No.
  signatureText: text('signature_text'), // Optional signature text
  headerText: text('header_text'), // Optional prescription header text
  footerText: text('footer_text'), // Optional prescription footer text
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false), // Soft delete flag
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const doctorAvailabilities = pgTable('doctor_availabilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  doctorId: uuid('doctor_id').notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  dayOfWeek: varchar('day_of_week', { length: 20 }).notNull(), // Monday - Sunday
  startTime: varchar('start_time', { length: 20 }).notNull(), // e.g. '09:00 AM'
  endTime: varchar('end_time', { length: 20 }).notNull(), // e.g. '02:00 PM'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
