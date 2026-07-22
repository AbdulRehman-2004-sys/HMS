import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/errors';
import { authenticateUser, authorizePermission } from '../../middleware/auth';
import { Permission } from '../../config/permissions';
import { reportQuerySchema } from './reports.validation';
import { ReportsService } from './reports.service';
import { ReportType } from './reports.types';

const router = Router();

router.use(authenticateUser);
router.use(authorizePermission(Permission.VIEW_REPORTS));

// 1. Get Report Data by Type
router.get(
  '/:reportType',
  asyncHandler(async (req: Request, res: Response) => {
    const reportType = req.params.reportType as ReportType;
    const filters = reportQuerySchema.parse(req.query);
    const userRoles = req.user?.roles || [];
    const userId = req.user?.id;

    const data = await ReportsService.getReportData(reportType, filters, userRoles, userId);

    res.json({
      success: true,
      data,
      message: `${reportType.toUpperCase()} report generated successfully`,
    });
  })
);

export const reportsRouter = router;
