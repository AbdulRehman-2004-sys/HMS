import { Router, Request, Response } from 'express';
import { authenticateUser, authorizeRoles } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import { BillingService } from './billing.service';
import { generateInvoiceSchema, recordPaymentSchema } from './billing.validation';

const router = Router();

router.use(authenticateUser);

// 1. Get Billing Dashboard Summary & Queue
router.get(
  '/summary',
  authorizeRoles('Super Admin', 'Receptionist', 'Billing', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const summary = await BillingService.getBillingSummary(search);
    return sendResponse(res, 200, 'Billing summary retrieved successfully', { summary });
  })
);

// 2. Auto-Generate Invoice for Visit Encounter
router.post(
  '/generate',
  authorizeRoles('Super Admin', 'Receptionist', 'Billing'),
  validate(generateInvoiceSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const invoice = await BillingService.generateInvoice(req.body, userId, ipAddress);
    return sendResponse(res, 201, `Invoice #${invoice.billNumber} generated successfully`, { invoice });
  })
);

// 3. Record Payment & Mark as PAID
router.post(
  '/:id/pay',
  authorizeRoles('Super Admin', 'Receptionist', 'Billing'),
  validate(recordPaymentSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const ipAddress = req.ip;
    const invoice = await BillingService.recordPayment(req.params.id, req.body, userId, ipAddress);
    return sendResponse(res, 200, `Payment recorded successfully for Invoice #${invoice.billNumber}`, { invoice });
  })
);

// 4. Get Invoice by Visit ID
router.get(
  '/visit/:visitId',
  authorizeRoles('Super Admin', 'Receptionist', 'Billing', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const invoice = await BillingService.getInvoiceByVisitId(req.params.visitId);
    return sendResponse(res, 200, 'Visit invoice details retrieved', { invoice });
  })
);

// 5. Get Invoice by ID
router.get(
  '/:id',
  authorizeRoles('Super Admin', 'Receptionist', 'Billing', 'Doctor'),
  asyncHandler(async (req: Request, res: Response) => {
    const invoice = await BillingService.getInvoiceById(req.params.id);
    return sendResponse(res, 200, 'Invoice details retrieved', { invoice });
  })
);

export const billingRouter = router;
