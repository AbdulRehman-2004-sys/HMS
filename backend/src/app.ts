import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './features/auth/auth.controller';
import { usersRouter } from './features/users/users.controller';
import { doctorsRouter } from './features/doctors/doctors.controller';
import { patientsRouter } from './features/patients/patients.controller';
import { visitController } from './features/visits/visits.controller';
import { prescriptionsRouter } from './features/prescriptions/prescriptions.controller';
import { ordersRouter } from './features/orders/orders.controller';
import { labRouter } from './features/lab/lab.controller';
import { radiologyRouter } from './features/radiology/radiology.controller';
import { admissionsRouter } from './features/admissions/admissions.controller';
import { operationsRouter } from './features/operations/operations.controller';
import { billingRouter } from './features/billing/billing.controller';
import { historyRouter } from './features/history/history.controller';
import { dashboardRouter } from './features/dashboard/dashboard.controller';
import { reportsRouter } from './features/reports/reports.controller';
import { settingsRouter } from './features/settings/settings.controller';
import { publicRouter } from './features/public/public.controller';
import { appointmentsRouter } from './features/appointments/appointments.controller';
import { sendResponse } from './utils/response';




import path from 'path';
import { NotFoundError } from './utils/errors';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS config
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Serve static uploaded files (hospital logos, reports, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this client session, please wait 15 minutes',
    },
  },
});
app.use('/api/', limiter);

// Health Check Route
app.get('/health', (_req, res) => {
  return sendResponse(res, 200, 'LALA Medical Complex HMS Core API is fully operational', {
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Auth, Users, Doctors, Patients & Visits Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/visits', visitController);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/lab', labRouter);
app.use('/api/radiology', radiologyRouter);
app.use('/api/admissions', admissionsRouter);
app.use('/api/operations', operationsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/history', historyRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/public', publicRouter);
app.use('/api/appointments', appointmentsRouter);









// Fallback Route for Undefined Handlers
app.use('*', (req, _res, next) => {
  next(new NotFoundError(`Requested path ${req.baseUrl} was not found on this server`));
});

// Centralized Error Boundary Middleware
app.use(errorHandler);

export default app;
export { app };
