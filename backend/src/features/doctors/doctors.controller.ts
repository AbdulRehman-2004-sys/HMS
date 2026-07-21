import { Router, Request, Response } from 'express';
import { authenticateUser, authorizeRoles } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler, ForbiddenError, NotFoundError } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { DoctorService } from './doctors.service';
import { 
  createDoctorSchema, 
  updateDoctorSchema, 
  updateDoctorStatusSchema,
  createAvailabilitySchema,
  updateAvailabilitySchema
} from './doctors.validation';

const router = Router();

// Apply global authentication to all doctor routes
router.use(authenticateUser);

// 1. Create Doctor Profile (Super Admin Only)
router.post(
  '/',
  authorizeRoles('Super Admin'),
  validate(createDoctorSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    const doctor = await DoctorService.createDoctor(req.body, creatorId, ipAddress);
    return sendResponse(res, 201, 'Doctor profile created successfully', { doctor });
  })
);

// 2. List Doctors (Super Admin, Receptionist, Doctor)
router.get(
  '/',
  authorizeRoles('Super Admin', 'Receptionist', 'Doctor'),

  asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const specialization = req.query.specialization as string | undefined;
    const isActiveParam = req.query.status as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;

    let isActive: boolean | undefined = undefined;
    if (isActiveParam === 'active') isActive = true;
    if (isActiveParam === 'inactive') isActive = false;

    const result = await DoctorService.getDoctors({
      search,
      specialization,
      isActive,
      page,
      limit,
    });

    return sendResponse(res, 200, 'Doctors roster retrieved successfully', result);
  })
);

// 3. Get Doctor Profile for Logged-In Doctor ("Doctor: View Own Profile Only")
router.get(
  '/me',
  authorizeRoles('Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const doctor = await DoctorService.getDoctorByUserId(userId);
    return sendResponse(res, 200, 'Doctor profile retrieved successfully', { doctor });
  })
);

// 4. Get Single Doctor Details by ID (Super Admin, Receptionist, or Own Doctor Profile)
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const isSuperAdmin = user.roles.includes('Super Admin');
    const isReceptionist = user.roles.includes('Receptionist');
    const isDoctor = user.roles.includes('Doctor');

    if (!isSuperAdmin && !isReceptionist && !isDoctor) {
      throw new ForbiddenError('You do not have permission to view doctor profiles');
    }

    const doctor = await DoctorService.getDoctorById(req.params.id);
    if (!doctor) {
      throw new NotFoundError('Doctor profile not found');
    }

    // Doctor role restricted to viewing own profile only
    if (isDoctor && !isSuperAdmin && !isReceptionist) {
      if (doctor.userId !== user.id) {
        throw new ForbiddenError('Doctors can only view their own profile');
      }
    }

    return sendResponse(res, 200, 'Doctor details retrieved successfully', { doctor });
  })
);

// 5. Update Doctor Details (Super Admin Only)
router.patch(
  '/:id',
  authorizeRoles('Super Admin'),
  validate(updateDoctorSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    const doctor = await DoctorService.updateDoctor(req.params.id, req.body, creatorId, ipAddress);
    return sendResponse(res, 200, 'Doctor profile updated successfully', { doctor });
  })
);

// 6. Toggle Active/Inactive Status (Super Admin Only)
router.patch(
  '/:id/status',
  authorizeRoles('Super Admin'),
  validate(updateDoctorStatusSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    const { isActive } = req.body;
    const doctor = await DoctorService.toggleDoctorStatus(req.params.id, isActive, creatorId, ipAddress);
    return sendResponse(res, 200, `Doctor profile ${isActive ? 'activated' : 'deactivated'} successfully`, { doctor });
  })
);

// 7. Soft Delete Doctor (Super Admin Only)
router.delete(
  '/:id',
  authorizeRoles('Super Admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    await DoctorService.softDeleteDoctor(req.params.id, creatorId, ipAddress);
    return sendResponse(res, 200, 'Doctor profile deleted successfully', null);
  })
);

// =========================================================================
// DOCTOR AVAILABILITY ENDPOINTS
// =========================================================================

// 8. Get Doctor Availability Slots
router.get(
  '/:id/availability',
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const doctorId = req.params.id;
    const isSuperAdmin = user.roles.includes('Super Admin');
    const isReceptionist = user.roles.includes('Receptionist');
    const isDoctor = user.roles.includes('Doctor');

    if (!isSuperAdmin && !isReceptionist && !isDoctor) {
      throw new ForbiddenError('You do not have permission to view doctor availability');
    }

    const doctor = await DoctorService.getDoctorById(doctorId);
    if (isDoctor && !isSuperAdmin && !isReceptionist && doctor.userId !== user.id) {
      throw new ForbiddenError('Doctors can only view their own availability schedule');
    }

    const availabilities = await DoctorService.getDoctorAvailabilities(doctorId);
    return sendResponse(res, 200, 'Doctor availability schedules retrieved successfully', { availabilities });
  })
);

// 9. Add Doctor Availability Slot (Super Admin, or Linked Doctor)
router.post(
  '/:id/availability',
  validate(createAvailabilitySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const doctorId = req.params.id;
    const isSuperAdmin = user.roles.includes('Super Admin');
    const isDoctor = user.roles.includes('Doctor');

    if (!isSuperAdmin && !isDoctor) {
      throw new ForbiddenError('You do not have permission to manage doctor availability');
    }

    const doctor = await DoctorService.getDoctorById(doctorId);
    if (isDoctor && !isSuperAdmin && doctor.userId !== user.id) {
      throw new ForbiddenError('Doctors can only manage their own availability schedule');
    }

    const slot = await DoctorService.addDoctorAvailability(doctorId, req.body, user.id, req.ip);
    return sendResponse(res, 201, 'Availability slot added successfully', { slot });
  })
);

// 10. Update Doctor Availability Slot (Super Admin, or Linked Doctor)
router.patch(
  '/:id/availability/:slotId',
  validate(updateAvailabilitySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const doctorId = req.params.id;
    const slotId = req.params.slotId;
    const isSuperAdmin = user.roles.includes('Super Admin');
    const isDoctor = user.roles.includes('Doctor');

    if (!isSuperAdmin && !isDoctor) {
      throw new ForbiddenError('You do not have permission to manage doctor availability');
    }

    const doctor = await DoctorService.getDoctorById(doctorId);
    if (isDoctor && !isSuperAdmin && doctor.userId !== user.id) {
      throw new ForbiddenError('Doctors can only manage their own availability schedule');
    }

    const slot = await DoctorService.updateDoctorAvailability(slotId, req.body, user.id, req.ip);
    return sendResponse(res, 200, 'Availability slot updated successfully', { slot });
  })
);

// 11. Delete Doctor Availability Slot (Super Admin, or Linked Doctor)
router.delete(
  '/:id/availability/:slotId',
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;
    const doctorId = req.params.id;
    const slotId = req.params.slotId;
    const isSuperAdmin = user.roles.includes('Super Admin');
    const isDoctor = user.roles.includes('Doctor');

    if (!isSuperAdmin && !isDoctor) {
      throw new ForbiddenError('You do not have permission to manage doctor availability');
    }

    const doctor = await DoctorService.getDoctorById(doctorId);
    if (isDoctor && !isSuperAdmin && doctor.userId !== user.id) {
      throw new ForbiddenError('Doctors can only manage their own availability schedule');
    }

    await DoctorService.deleteDoctorAvailability(slotId, user.id, req.ip);
    return sendResponse(res, 200, 'Availability slot deleted successfully', null);
  })
);

export const doctorsRouter = router;
