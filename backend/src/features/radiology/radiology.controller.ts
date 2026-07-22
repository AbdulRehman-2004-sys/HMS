import { Router, Request, Response } from 'express';
import { authenticateUser, authorizeRoles } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { RadiologyService } from './radiology.service';
import { saveRadiologyReportSchema } from './radiology.validation';

const router = Router();

router.use(authenticateUser);

// 1. Get Radiology Orders Queue
router.get(
  '/orders',
  authorizeRoles('Super Admin', 'Radiology', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const serviceType = req.query.serviceType as string | undefined;
    const search = req.query.search as string | undefined;
    const queue = await RadiologyService.getRadiologyQueue(status, serviceType, search);
    return sendResponse(res, 200, 'Radiology orders queue retrieved successfully', { queue });
  })
);

// 2. Get Existing Radiology Report for Order
router.get(
  '/orders/:orderId/report',
  authorizeRoles('Super Admin', 'Radiology', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const report = await RadiologyService.getReportByOrderId(req.params.orderId);
    return sendResponse(res, 200, 'Radiology report details retrieved', { report });
  })
);

// 3. Save or Finalize Radiology Report
router.post(
  '/reports',
  authorizeRoles('Super Admin', 'Radiology'),
  validate(saveRadiologyReportSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const report = await RadiologyService.saveRadiologyReport(req.body, userId, ipAddress);
    return sendResponse(res, 201, `Radiology report ${req.body.status === 'COMPLETED' ? 'completed' : 'saved as draft'} successfully`, { report });
  })
);

// 4. Get Radiology Reports by Visit ID (Doctor EMR View)
router.get(
  '/reports/visit/:visitId',
  authorizeRoles('Super Admin', 'Radiology', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const reports = await RadiologyService.getReportsByVisit(req.params.visitId);
    return sendResponse(res, 200, 'Visit radiology reports retrieved', { reports });
  })
);

export const radiologyRouter = router;
