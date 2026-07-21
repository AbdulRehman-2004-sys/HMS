import { Router, Request, Response } from 'express';
import { UserService } from './users.service';
import { createUserSchema, updateUserSchema, updateStatusSchema, resetPasswordSchema } from './users.schema';
import { validate } from '../../middleware/validate';
import { authenticateUser, authorizePermission } from '../../middleware/auth';
import { Permission } from '../../config/permissions';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';

const router = Router();

// Apply auth protection & Super Admin gate globally to all User routes
router.use(authenticateUser);
router.use(authorizePermission(Permission.MANAGE_SYSTEM));

// 1. Get Users list (paginated, filtered, searched)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search ? String(req.query.search) : undefined;
    const role = req.query.role ? String(req.query.role) : undefined;
    const statusQuery = req.query.status;
    const status = statusQuery !== undefined ? statusQuery === 'active' : undefined;
    const page = req.query.page ? Math.max(1, Number(req.query.page)) : 1;
    const limit = req.query.limit ? Math.max(1, Number(req.query.limit)) : 10;

    const data = await UserService.getUsers({ search, role, status, page, limit });
    return sendResponse(res, 200, 'Users catalog retrieved successfully', {
      users: data.users,
      pagination: {
        total: data.total,
        page,
        limit,
        pages: Math.ceil(data.total / limit),
      },
    });
  })
);

// 2. Get Single User Details
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.getUser(req.params.id);
    return sendResponse(res, 200, 'User profile retrieved successfully', { user });
  })
);

// 3. Create User
router.post(
  '/',
  validate(createUserSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    const user = await UserService.createUser(req.body, creatorId, ipAddress);
    return sendResponse(res, 201, 'User account created successfully', { user });
  })
);

// 4. Update User Profile details
router.patch(
  '/:id',
  validate(updateUserSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    const user = await UserService.updateUser(req.params.id, req.body, creatorId, ipAddress);
    return sendResponse(res, 200, 'User profile updated successfully', { user });
  })
);

// 5. Toggle User Account Status (Activate/Deactivate)
router.patch(
  '/:id/status',
  validate(updateStatusSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    const { isActive } = req.body;
    const user = await UserService.toggleUserStatus(req.params.id, isActive, creatorId, ipAddress);
    return sendResponse(res, 200, `User account ${isActive ? 'activated' : 'deactivated'} successfully`, { user });
  })
);

// 6. Administrative Password Reset
router.patch(
  '/:id/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    const { password } = req.body;
    await UserService.resetUserPassword(req.params.id, password, creatorId, ipAddress);
    return sendResponse(res, 200, 'User account security password reset successfully');
  })
);

// 7. Delete User
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const creatorId = req.user!.id;
    const ipAddress = req.ip;
    await UserService.deleteUser(req.params.id, creatorId, ipAddress);
    return sendResponse(res, 200, 'User account deleted successfully');
  })
);

export const usersRouter = router;
export default usersRouter;
