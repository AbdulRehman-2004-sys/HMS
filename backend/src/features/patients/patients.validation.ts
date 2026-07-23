import { z } from 'zod';

export const GENDERS = ['Male', 'Female', 'Other'] as const;
export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'] as const;
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'] as const;

// Mobile number format regex (Pakistani format e.g. +923001234567 or 03001234567)
const mobileRegex = /^(\+92|0)?3\d{9}$/;

// CNIC format regex (13 digits or XXXXX-XXXXXXX-X)
const cnicRegex = /^$|^(\d{5}-\d{7}-\d{1}|\d{13})$/;

export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  fatherHusbandName: z.string().min(1, 'Father / Husband name is required'),
  gender: z.enum(GENDERS, {
    errorMap: () => ({ message: 'Please select a valid gender' }),
  }),
  dateOfBirth: z.string().optional().or(z.literal('')),
  age: z.coerce.number().min(0, 'Age must be a positive number').optional(),
  maritalStatus: z.enum(MARITAL_STATUSES).optional().or(z.literal('')),
  mobileNumber: z
    .string()
    .min(1, 'Mobile number is required')
    .refine((val) => mobileRegex.test(val.replace(/\s|-/g, '')), {
      message: 'Please enter a valid mobile number (e.g. 03001234567)',
    }),
  alternateMobileNumber: z.string().optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required').default('Rahim Yar Khan'),
  cnic: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || cnicRegex.test(val.replace(/\s/g, '')), {
      message: 'CNIC must be 13 digits (e.g. 38403-1234567-1)',
    }),
  bloodGroup: z.enum(BLOOD_GROUPS).optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  chronicDiseases: z.string().optional().or(z.literal('')),
  remarks: z.string().optional().or(z.literal('')),
});

export const updatePatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  fatherHusbandName: z.string().min(1, 'Father / Husband name is required').optional(),
  gender: z.enum(GENDERS).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
  age: z.coerce.number().min(0, 'Age must be a positive number').optional(),
  maritalStatus: z.enum(MARITAL_STATUSES).optional().or(z.literal('')),
  mobileNumber: z
    .string()
    .optional()
    .refine((val) => !val || mobileRegex.test(val.replace(/\s|-/g, '')), {
      message: 'Please enter a valid mobile number (e.g. 03001234567)',
    }),
  alternateMobileNumber: z.string().optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required').optional(),
  city: z.string().min(1, 'City is required').optional(),
  cnic: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || cnicRegex.test(val.replace(/\s/g, '')), {
      message: 'CNIC must be 13 digits (e.g. 38403-1234567-1)',
    }),
  bloodGroup: z.enum(BLOOD_GROUPS).optional().or(z.literal('')),
  allergies: z.string().optional().or(z.literal('')),
  chronicDiseases: z.string().optional().or(z.literal('')),
  remarks: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});
