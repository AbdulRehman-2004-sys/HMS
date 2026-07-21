import { Router, Request, Response } from 'express';
import { authenticateUser, authorizeRoles } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { OrderService } from './orders.service';
import {
  createAdmissionOrderSchema,
  createLabOrderSchema,
  createOperationOrderSchema,
  createRadiologyOrderSchema,
  updateOrderStatusSchema,
} from './orders.validation';
import { OrderStatus } from './orders.types';

const router = Router();

router.use(authenticateUser);

// 1. Create Lab Order
router.post(
  '/lab',
  authorizeRoles('Super Admin', 'Doctor'),
  validate(createLabOrderSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const order = await OrderService.createLabOrder(req.body, userId, ipAddress);
    return sendResponse(res, 201, 'Laboratory order created successfully', { order });
  })
);

// 2. Create Radiology Order
router.post(
  '/radiology',
  authorizeRoles('Super Admin', 'Doctor'),
  validate(createRadiologyOrderSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const order = await OrderService.createRadiologyOrder(req.body, userId, ipAddress);
    return sendResponse(res, 201, 'Radiology order created successfully', { order });
  })
);

// 3. Create Admission Order
router.post(
  '/admission',
  authorizeRoles('Super Admin', 'Doctor'),
  validate(createAdmissionOrderSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const order = await OrderService.createAdmissionOrder(req.body, userId, ipAddress);
    return sendResponse(res, 201, 'Inpatient admission order created successfully', { order });
  })
);

// 4. Create Operation Order
router.post(
  '/operation',
  authorizeRoles('Super Admin', 'Doctor'),
  validate(createOperationOrderSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const order = await OrderService.createOperationOrder(req.body, userId, ipAddress);
    return sendResponse(res, 201, 'Surgical operation order created successfully', { order });
  })
);

// 5. Get All Orders By Visit ID
router.get(
  '/visit/:visitId',
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await OrderService.getOrdersByVisit(req.params.visitId);
    return sendResponse(res, 200, 'Visit orders retrieved successfully', { orders });
  })
);

// 6. Update Order Status / Cancel Order
router.patch(
  '/:orderType/:id/status',
  authorizeRoles('Super Admin', 'Doctor'),
  validate(updateOrderStatusSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { orderType, id } = req.params;
    const typeKey = orderType.toLowerCase() as 'lab' | 'radiology' | 'admission' | 'operation';
    const userId = req.user!.id;
    const ipAddress = req.ip;

    await OrderService.updateOrderStatus(typeKey, id, req.body.status as OrderStatus, userId, ipAddress);
    return sendResponse(res, 200, `Order status updated to ${req.body.status}`, { success: true });
  })
);

export const ordersRouter = router;
