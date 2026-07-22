import { Router, Request, Response } from 'express';
import { authenticateUser, authorizeRoles } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { AdmissionsService } from './admissions.service';
import { admitPatientSchema, dischargePatientSchema } from './admissions.validation';

const router = Router();

router.use(authenticateUser);

// 1. Get Admissions Summary & Queues
router.get(
  '/summary',
  authorizeRoles('Super Admin', 'Receptionist', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const summary = await AdmissionsService.getAdmissionsSummary(search);
    return sendResponse(res, 200, 'Admissions summary retrieved successfully', { summary });
  })
);

// 2. Admit Patient & Post Billing Entry
router.post(
  '/admit',
  authorizeRoles('Super Admin', 'Receptionist'),
  validate(admitPatientSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const admission = await AdmissionsService.admitPatient(req.body, userId, ipAddress);
    return sendResponse(res, 201, `Patient ${admission.patientName} admitted successfully to ${admission.roomName}`, { admission });
  })
);

// 3. Discharge Patient
router.post(
  '/:id/discharge',
  authorizeRoles('Super Admin', 'Receptionist'),
  validate(dischargePatientSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const discharged = await AdmissionsService.dischargePatient(req.params.id, req.body, userId, ipAddress);
    return sendResponse(res, 200, `Patient ${discharged.patientName} discharged successfully`, { admission: discharged });
  })
);

// 4. Get Admission by Visit ID
router.get(
  '/visit/:visitId',
  authorizeRoles('Super Admin', 'Receptionist', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const admission = await AdmissionsService.getAdmissionByVisitId(req.params.visitId);
    return sendResponse(res, 200, 'Visit admission record retrieved', { admission });
  })
);

export const admissionsRouter = router;
