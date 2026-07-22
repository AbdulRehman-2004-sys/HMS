import { z } from 'zod';

export const createAppointmentSchema = z.object({
  department: z.string().min(1, 'Please select a clinical department'),
  doctorId: z.string().uuid('Please select a valid doctor'),
  appointmentDate: z.string().min(1, 'Please select an appointment date').refine((val) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return val >= todayStr;
  }, { message: 'Appointment date cannot be in the past' }),
  patientName: z.string().min(2, 'Patient full name must be at least 2 characters'),
  fatherHusbandName: z.string().min(2, 'Father/Husband name is required'),
  age: z.coerce.number().int().min(0, 'Age must be 0 or greater').max(120, 'Please enter a valid age'),
  gender: z.enum(['Male', 'Female', 'Other'], { errorMap: () => ({ message: 'Please select a valid gender' }) }),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(3, 'Please enter patient address'),
  reasonForVisit: z.string().optional(),
});
