import { Router, Request, Response } from 'express';
import { asyncHandler, NotFoundError } from '../../utils/errors';
import { validate } from '../../middleware/validate';
import { PublicService } from './public.service';
import { AppointmentService } from '../appointments/appointments.service';
import { createAppointmentSchema } from '../appointments/appointments.validation';

const router = Router();

// 1. Get All Public Doctors (supports search, department, availability, sortBy)
router.get(
  '/doctors',
  asyncHandler(async (req: Request, res: Response) => {
    const { search, department, availability, sortBy } = req.query;

    const result = await PublicService.getDoctors({
      search: search ? String(search) : undefined,
      department: department ? String(department) : undefined,
      availability: availability ? String(availability) : undefined,
      sortBy: sortBy ? (String(sortBy) as any) : undefined,
    });

    res.json({
      success: true,
      data: result.doctors,
      meta: {
        total: result.total,
      },
      message: 'Public doctors retrieved successfully',
    });
  })
);

// 2. Get Single Doctor Details by ID or Slug
router.get(
  '/doctors/:idOrSlug',
  asyncHandler(async (req: Request, res: Response) => {
    const { idOrSlug } = req.params;
    const doctor = await PublicService.getDoctorByIdOrSlug(idOrSlug);

    if (!doctor) {
      throw new NotFoundError(`Doctor '${idOrSlug}' not found`);
    }

    res.json({
      success: true,
      data: doctor,
      message: 'Doctor details retrieved successfully',
    });
  })
);

// 3. Get All Public Departments
router.get(
  '/departments',
  asyncHandler(async (_req: Request, res: Response) => {
    const departments = await PublicService.getDepartments();

    res.json({
      success: true,
      data: departments,
      meta: {
        total: departments.length,
      },
      message: 'Public departments retrieved successfully',
    });
  })
);

// 4. Get Single Department Details by ID or Slug (with nested doctors)
router.get(
  '/departments/:idOrSlug',
  asyncHandler(async (req: Request, res: Response) => {
    const { idOrSlug } = req.params;
    const department = await PublicService.getDepartmentByIdOrSlug(idOrSlug);

    if (!department) {
      throw new NotFoundError(`Department '${idOrSlug}' not found`);
    }

    res.json({
      success: true,
      data: department,
      message: 'Department details retrieved successfully',
    });
  })
);

// 5. Public Online Appointment Booking
router.post(
  '/appointments',
  validate(createAppointmentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const appointment = await AppointmentService.createAppointment(req.body);

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Online appointment booked successfully. Please present your Appointment Number at reception upon arrival.',
    });
  })
);

export const publicRouter = router;
