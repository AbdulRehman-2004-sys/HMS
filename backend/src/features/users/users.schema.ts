import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  roles: z.array(z.string()).min(1, 'At least one role must be assigned'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  roles: z.array(z.string()).min(1, 'At least one role must be assigned'),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'Status state isActive is required' }),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
