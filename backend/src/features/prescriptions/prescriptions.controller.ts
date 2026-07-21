import { Router, Request, Response } from 'express';
import { authenticateUser, authorizeRoles } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { PrescriptionService } from './prescriptions.service';
import { createPrescriptionSchema } from './prescriptions.validation';

const router = Router();

router.use(authenticateUser);

// 1. Search Common Hospital Medicines
router.get(
  '/medicines/search',
  asyncHandler(async (req: Request, res: Response) => {
    const query = (req.query.query as string) || '';
    const medicines = await PrescriptionService.searchMedicines(query);
    return sendResponse(res, 200, 'Medicines retrieved successfully', { medicines });
  })
);

// 2. Create e-Prescription
router.post(
  '/',
  authorizeRoles('Super Admin', 'Doctor'),
  validate(createPrescriptionSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const rx = await PrescriptionService.createPrescription(req.body, userId, ipAddress);
    return sendResponse(res, 201, 'e-Prescription issued successfully', { prescription: rx });
  })
);

// 3. Get e-Prescription by Visit ID
router.get(
  '/visit/:visitId',
  asyncHandler(async (req: Request, res: Response) => {
    const rx = await PrescriptionService.getPrescriptionByVisit(req.params.visitId);
    return sendResponse(res, 200, 'Prescription details retrieved', { prescription: rx });
  })
);

// 4. Get Patient's e-Prescriptions History
router.get(
  '/patient/:patientId',
  asyncHandler(async (req: Request, res: Response) => {
    const prescriptions = await PrescriptionService.getPatientPrescriptions(req.params.patientId);
    return sendResponse(res, 200, 'Patient prescription history retrieved', { prescriptions });
  })
);

export const prescriptionsRouter = router;
