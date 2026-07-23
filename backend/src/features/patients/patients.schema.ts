import { pgTable, uuid, varchar, text, integer, boolean, timestamp, date } from 'drizzle-orm/pg-core';
import { doctors } from '../doctors/doctors.schema';

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  mrNumber: varchar('mr_number', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  fatherHusbandName: varchar('father_husband_name', { length: 150 }).notNull(),
  gender: varchar('gender', { length: 20 }).notNull(), // 'Male' | 'Female' | 'Other'
  dateOfBirth: date('date_of_birth'),
  age: integer('age'),
  maritalStatus: varchar('marital_status', { length: 20 }), // 'Single' | 'Married' | 'Divorced' | 'Widowed'
  mobileNumber: varchar('mobile_number', { length: 20 }).notNull(),
  alternateMobileNumber: varchar('alternate_mobile_number', { length: 20 }),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull().default('Rahim Yar Khan'),
  cnic: varchar('cnic', { length: 20 }),
  bloodGroup: varchar('blood_group', { length: 10 }), // 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-' | 'Unknown'
  allergies: text('allergies'),
  chronicDiseases: text('chronic_diseases'),
  remarks: text('remarks'),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Clinical Encounter Module (Doctor Queue & Patient Visit)
export const patientVisits = pgTable('patient_visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id, { onDelete: 'cascade' }),
  visitNumber: varchar('visit_number', { length: 50 }).notNull().unique(),
  tokenNumber: integer('token_number').notNull().default(1),
  visitDate: timestamp('visit_date').notNull().defaultNow(),
  status: varchar('status', { length: 50 }).notNull().default('WAITING'), // 'WAITING' | 'WITH_DOCTOR' | 'COMPLETED' | 'CANCELLED'
  chiefComplaint: text('chief_complaint'),
  temperature: varchar('temperature', { length: 20 }),
  pulse: varchar('pulse', { length: 20 }),
  bloodPressure: varchar('blood_pressure', { length: 30 }),
  weight: varchar('weight', { length: 20 }),
  clinicalNotes: text('clinical_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

