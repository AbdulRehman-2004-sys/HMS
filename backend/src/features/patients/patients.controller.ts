import { Router, Request, Response } from 'express';
import { authenticateUser, authorizeRoles } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { PatientService } from './patients.service';
import { createPatientSchema, updatePatientSchema } from './patients.validation';

const router = Router();

// Apply global authentication to all patient routes
router.use(authenticateUser);

// 1. Register New Patient (Super Admin, Receptionist)
router.post(
  '/',
  authorizeRoles('Super Admin', 'Receptionist'),
  validate(createPatientSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    const patient = await PatientService.registerPatient(req.body, creatorId, ipAddress);
    return sendResponse(res, 201, 'Patient registered successfully', { patient });
  })
);

// 2. List & Search Patients (Super Admin, Receptionist, Doctor)
router.get(
  '/',
  authorizeRoles('Super Admin', 'Receptionist', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const gender = req.query.gender as string | undefined;
    const city = req.query.city as string | undefined;
    const isActiveParam = req.query.status as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;

    let isActive: boolean | undefined = undefined;
    if (isActiveParam === 'active') isActive = true;
    if (isActiveParam === 'inactive') isActive = false;

    const result = await PatientService.getPatients({
      search,
      gender,
      city,
      isActive,
      page,
      limit,
    });

    return sendResponse(res, 200, 'Patients list retrieved successfully', result);
  })
);

// 3. Get Single Patient Details by ID (Super Admin, Receptionist, Doctor)
router.get(
  '/:id',
  authorizeRoles('Super Admin', 'Receptionist', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientService.getPatientById(req.params.id);
    return sendResponse(res, 200, 'Patient details retrieved successfully', { patient });
  })
);

// 4. Update Patient Profile (Super Admin, Receptionist)
router.patch(
  '/:id',
  authorizeRoles('Super Admin', 'Receptionist'),
  validate(updatePatientSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const updaterId = req.user!.id;
    const ipAddress = req.ip;
    const patient = await PatientService.updatePatient(req.params.id, req.body, updaterId, ipAddress);
    return sendResponse(res, 200, 'Patient profile updated successfully', { patient });
  })
);

// 5. Soft Delete Patient Profile (Super Admin, Receptionist)
router.delete(
  '/:id',
  authorizeRoles('Super Admin', 'Receptionist'),
  asyncHandler(async (req: Request, res: Response) => {
    const deleterId = req.user!.id;
    const ipAddress = req.ip;
    await PatientService.softDeletePatient(req.params.id, deleterId, ipAddress);
    return sendResponse(res, 200, 'Patient profile deleted successfully', null);
  })
);

export const patientsRouter = router;
