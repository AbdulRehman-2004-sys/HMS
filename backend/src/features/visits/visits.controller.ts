import { Router, Request, Response } from 'express';
import { authenticateUser, authorizePermission } from '../../middleware/auth';
import { Permission } from '../../config/permissions';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';
import {
  createVisitSchema,
  updateVisitStatusSchema,
  visitQuerySchema,
} from './visits.validation';
import { VisitService } from './visits.service';

const router = Router();

// Apply Authentication Middleware to all endpoints
router.use(authenticateUser);

/**
 * @route   POST /api/visits
 * @desc    Create Patient Visit & Queue Patient
 * @access  Receptionist, Super Admin
 */
router.post(
  '/',
  authorizePermission(Permission.ACCESS_RECEPTION),
  validate(createVisitSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    const visit = await VisitService.createVisit(req.body, creatorId, ipAddress);

    return sendResponse(res, 201, 'Patient visit created and added to doctor queue successfully', visit);
  })
);

/**
 * @route   GET /api/visits/queue
 * @desc    Get Today's Queue with counters and filters
 * @access  Doctor, Receptionist, Super Admin
 */
router.get(
  '/queue',
  validate(visitQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as any;
    const user = {
      id: req.user!.id,
      roles: req.user!.roles,
      email: req.user!.email,
    };

    const result = await VisitService.getTodayQueue(query, user);

    return sendResponse(res, 200, "Today's doctor queue retrieved successfully", result);
  })
);


/**
 * @route   GET /api/visits/:id
 * @desc    Get Visit Details & EMR Information
 * @access  Doctor, Receptionist, Super Admin
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const visitId = req.params.id;
    const user = {
      id: req.user!.id,
      roles: req.user!.roles,
    };

    const emrData = await VisitService.getVisitDetails(visitId, user);

    return sendResponse(res, 200, 'Patient EMR details retrieved successfully', emrData);
  })
);

/**
 * @route   PATCH /api/visits/:id/status
 * @desc    Update Queue Status (WAITING, WITH_DOCTOR, COMPLETED, CANCELLED) & Clinical Notes
 * @access  Doctor, Super Admin
 */
router.patch(
  '/:id/status',
  authorizePermission(Permission.ACCESS_CLINICAL),
  validate(updateVisitStatusSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const visitId = req.params.id;
    const user = {
      id: req.user!.id,
      roles: req.user!.roles,
    };
    const ipAddress = req.ip;

    const updated = await VisitService.updateVisitStatus(
      visitId,
      req.body,
      user,
      ipAddress
    );

    return sendResponse(res, 200, 'Queue status updated successfully', updated);
  })
);


export const visitController = router;
