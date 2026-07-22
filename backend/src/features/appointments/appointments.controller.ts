import { Router, Request, Response } from 'express';
import { authenticateUser, authorizePermission } from '../../middleware/auth';
import { Permission } from '../../config/permissions';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { AppointmentService } from './appointments.service';

const router = Router();

// Apply Auth Middleware to all reception appointment endpoints
router.use(authenticateUser);

/**
 * @route   GET /api/appointments/pending
 * @desc    Get Pending Check-in Online Appointments for Receptionist
 * @access  Receptionist, Super Admin
 */
router.get(
  '/pending',
  authorizePermission(Permission.ACCESS_RECEPTION),
  asyncHandler(async (req: Request, res: Response) => {
    const { search } = req.query;
    const appointmentsList = await AppointmentService.getPendingAppointments(
      search ? String(search) : undefined
    );

    return sendResponse(res, 200, 'Pending check-in appointments retrieved successfully', appointmentsList);
  })
);

/**
 * @route   POST /api/appointments/:id/checkin
 * @desc    Reception Check In Online Appointment (reuses/creates MRN, issues Token Q-XXX, enters Doctor Queue)
 * @access  Receptionist, Super Admin
 */
router.post(
  '/:id/checkin',
  authorizePermission(Permission.ACCESS_RECEPTION),
  asyncHandler(async (req: Request, res: Response) => {
    const appointmentId = req.params.id;
    const creatorId = req.user!.id;
    const ipAddress = req.ip;

    const result = await AppointmentService.checkinAppointment(appointmentId, creatorId, ipAddress);

    return sendResponse(res, 200, 'Patient checked in successfully from online appointment', result);
  })
);

export const appointmentsRouter = router;
