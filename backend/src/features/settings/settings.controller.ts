import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../utils/errors';
import { authenticateUser, authorizePermission } from '../../middleware/auth';
import { Permission } from '../../config/permissions';
import { updateHospitalSettingsSchema } from './settings.validation';
import { SettingsService } from './settings.service';

const router = Router();

// 1. Get Hospital Settings (Public access for website header, footer, printing, patient slips)
router.get(
  '/hospital',
  asyncHandler(async (_req: Request, res: Response) => {
    const data = await SettingsService.getSettings();

    res.json({
      success: true,
      data,
      message: 'Hospital settings retrieved successfully',
    });
  })
);

// 2. Update Hospital Settings (Super Admin Only)
router.put(
  '/hospital',
  authenticateUser,
  authorizePermission(Permission.MANAGE_SETTINGS),
  asyncHandler(async (req: Request, res: Response) => {
    const payload = updateHospitalSettingsSchema.parse(req.body);
    const userId = req.user?.id;

    const data = await SettingsService.updateSettings(payload, userId);

    res.json({
      success: true,
      data,
      message: 'Hospital settings updated successfully',
    });
  })
);

export const settingsRouter = router;
