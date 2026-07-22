import { Router, Request, Response } from 'express';
import { authenticateUser, authorizeRoles } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { OperationsService } from './operations.service';
import { createOperationSchema, cancelOperationSchema } from './operations.validation';

const router = Router();

router.use(authenticateUser);

// 1. Create Surgery Operation & Post Billing Entry
router.post(
  '/',
  authorizeRoles('Super Admin', 'Doctor'),
  validate(createOperationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const operation = await OperationsService.createOperation(req.body, userId, ipAddress);
    return sendResponse(res, 201, `Surgery operation (${operation.operationName}) created successfully with charge Rs. ${operation.operationCharges}`, { operation });
  })
);

// 2. Cancel Surgery Operation
router.post(
  '/:id/cancel',
  authorizeRoles('Super Admin', 'Doctor'),
  validate(cancelOperationSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const cancelled = await OperationsService.cancelOperation(req.params.id, userId, req.body.reason, ipAddress);
    return sendResponse(res, 200, `Surgery operation (${cancelled.operationName}) cancelled successfully`, { operation: cancelled });
  })
);

// 3. Get Surgery Operation by Visit ID
router.get(
  '/visit/:visitId',
  authorizeRoles('Super Admin', 'Doctor', 'Receptionist'),
  asyncHandler(async (req: Request, res: Response) => {
    const operation = await OperationsService.getOperationByVisitId(req.params.visitId);
    return sendResponse(res, 200, 'Visit surgery operation record retrieved', { operation });
  })
);

export const operationsRouter = router;
