import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/errors';
import { authenticateUser, authorizePermission } from '../../middleware/auth';
import { Permission } from '../../config/permissions';
import { searchPatientByMrSchema, patientIdParamSchema, visitIdParamSchema } from './history.validation';
import { HistoryService } from './history.service';

const router = Router();

router.use(authenticateUser);
router.use(authorizePermission(Permission.VIEW_PATIENT_HISTORY));

// 1. Search Patient History by MR Number
router.get(
  '/search',
  asyncHandler(async (req: Request, res: Response) => {
    const { mrNumber } = searchPatientByMrSchema.parse(req.query);
    const userRoles = req.user?.roles || [];
    const userId = req.user?.id;

    const data = await HistoryService.searchByMrNumber(mrNumber, userRoles, userId);

    res.json({
      success: true,
      data,
      message: 'Patient history retrieved successfully',
    });
  })
);

// 2. Get Complete Patient History by Patient ID
router.get(
  '/patient/:patientId',
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = patientIdParamSchema.parse(req.params);
    const userRoles = req.user?.roles || [];
    const userId = req.user?.id;

    const data = await HistoryService.getPatientHistory(patientId, userRoles, userId);

    res.json({
      success: true,
      data,
      message: 'Patient history retrieved successfully',
    });
  })
);

// 3. Get Specific Visit Encounter Details
router.get(
  '/visit/:visitId',
  asyncHandler(async (req: Request, res: Response) => {
    const { visitId } = visitIdParamSchema.parse(req.params);
    const userRoles = req.user?.roles || [];
    const userId = req.user?.id;

    const data = await HistoryService.getVisitDetails(visitId, userRoles, userId);

    res.json({
      success: true,
      data,
      message: 'Visit details retrieved successfully',
    });
  })
);

// 4. Get Prescription History for Patient
router.get(
  '/prescriptions/:patientId',
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = patientIdParamSchema.parse(req.params);
    const userRoles = req.user?.roles || [];
    const userId = req.user?.id;

    const history = await HistoryService.getPatientHistory(patientId, userRoles, userId);
    const prescriptions = history.visits
      .map((v) => v.prescription)
      .filter((rx) => rx !== null);

    res.json({
      success: true,
      data: {
        patient: history.patient,
        prescriptions,
      },
      message: 'Prescription history retrieved successfully',
    });
  })
);

// 5. Get Laboratory History for Patient
router.get(
  '/lab/:patientId',
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = patientIdParamSchema.parse(req.params);
    const userRoles = req.user?.roles || [];
    const userId = req.user?.id;

    const history = await HistoryService.getPatientHistory(patientId, userRoles, userId);
    const labHistory = history.visits
      .map((v) => v.laboratory)
      .filter((l) => l !== null);

    res.json({
      success: true,
      data: {
        patient: history.patient,
        labHistory,
      },
      message: 'Laboratory history retrieved successfully',
    });
  })
);

// 6. Get Radiology History for Patient
router.get(
  '/radiology/:patientId',
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = patientIdParamSchema.parse(req.params);
    const userRoles = req.user?.roles || [];
    const userId = req.user?.id;

    const history = await HistoryService.getPatientHistory(patientId, userRoles, userId);
    const radiologyHistory = history.visits
      .map((v) => v.radiology)
      .filter((r) => r !== null);

    res.json({
      success: true,
      data: {
        patient: history.patient,
        radiologyHistory,
      },
      message: 'Radiology history retrieved successfully',
    });
  })
);

// 7. Get Billing History for Patient
router.get(
  '/billing/:patientId',
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = patientIdParamSchema.parse(req.params);
    const userRoles = req.user?.roles || [];
    const userId = req.user?.id;

    const history = await HistoryService.getPatientHistory(patientId, userRoles, userId);
    const billingHistory = history.visits
      .map((v) => v.billing)
      .filter((b) => b !== null);

    res.json({
      success: true,
      data: {
        patient: history.patient,
        billingHistory,
      },
      message: 'Billing history retrieved successfully',
    });
  })
);

export const historyRouter = router;
