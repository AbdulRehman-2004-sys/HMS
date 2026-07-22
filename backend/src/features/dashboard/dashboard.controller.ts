import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/errors';
import { authenticateUser, authorizePermission } from '../../middleware/auth';
import { Permission } from '../../config/permissions';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';

const router = Router();

router.use(authenticateUser);
router.use(authorizePermission(Permission.VIEW_DASHBOARD));

// 1. Get Complete Dashboard Summary (KPIs + Charts + Activities)
router.get(
  '/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const userRoles = req.user?.roles || [];
    const userId = req.user?.id;

    const data = await DashboardService.getDashboardSummary(userRoles, userId);

    res.json({
      success: true,
      data,
      message: 'Dashboard summary retrieved successfully',
    });
  })
);

// 2. Get Dashboard Charts Only
router.get(
  '/charts',
  asyncHandler(async (_req: Request, res: Response) => {
    const charts = await DashboardRepository.getWeeklyCharts();

    res.json({
      success: true,
      data: { charts },
      message: 'Dashboard charts data retrieved successfully',
    });
  })
);

// 3. Get Recent Activities Stream
router.get(
  '/activities',
  asyncHandler(async (_req: Request, res: Response) => {
    const recentActivities = await DashboardRepository.getRecentActivities();

    res.json({
      success: true,
      data: { recentActivities },
      message: 'Recent activities stream retrieved successfully',
    });
  })
);

export const dashboardRouter = router;
