import { Router, Request, Response } from 'express';
import { authenticateUser, authorizeRoles } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { LabService } from './lab.service';
import { saveLabReportSchema } from './lab.validation';

const router = Router();

router.use(authenticateUser);

// 1. Get Lab Orders Queue
router.get(
  '/orders',
  authorizeRoles('Super Admin', 'Laboratory', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const queue = await LabService.getLabQueue(status, search);
    return sendResponse(res, 200, 'Laboratory orders queue retrieved successfully', { queue });
  })
);

// 2. Get Existing Lab Report for Order
router.get(
  '/orders/:orderId/report',
  authorizeRoles('Super Admin', 'Laboratory', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const report = await LabService.getReportByOrderId(req.params.orderId);
    return sendResponse(res, 200, 'Lab report details retrieved', { report });
  })
);

// 3. Save or Finalize Lab Report
router.post(
  '/reports',
  authorizeRoles('Super Admin', 'Laboratory'),
  validate(saveLabReportSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const report = await LabService.saveLabReport(req.body, userId, ipAddress);
    return sendResponse(res, 201, `Lab report ${req.body.status === 'COMPLETED' ? 'completed' : 'saved as draft'} successfully`, { report });
  })
);

// 4. Get Lab Reports by Visit ID (Doctor EMR View)
router.get(
  '/reports/visit/:visitId',
  authorizeRoles('Super Admin', 'Laboratory', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const reports = await LabService.getReportsByVisit(req.params.visitId);
    return sendResponse(res, 200, 'Visit lab reports retrieved', { reports });
  })
);

export const labRouter = router;
