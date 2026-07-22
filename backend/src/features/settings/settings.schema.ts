import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const hospitalSettings = pgTable('hospital_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  hospitalName: varchar('hospital_name', { length: 255 }).notNull().default('LALA Medical Complex'),
  hospitalLogo: text('hospital_logo'), // Base64 or Image URL
  address: text('address').notNull().default('Main Stadium Road, Sargodha, Punjab, Pakistan'),
  contactNumber: varchar('contact_number', { length: 50 }).notNull().default('+92 300 1234567'),
  email: varchar('email', { length: 255 }).default('info@lalamedical.com'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
