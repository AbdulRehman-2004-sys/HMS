import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { loginSchema, registerSchema } from './auth.schema';
import { validate } from '../../middleware/validate';
import { authenticateUser } from '../../middleware/auth';
import { asyncHandler } from '../../utils/errors';
import { sendResponse } from '../../utils/response';

const router = Router();
const COOKIE_NAME = 'jid';

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// 1. User Registration
router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = req.ip;
    const user = await AuthService.register(req.body, req.user?.id, ipAddress);
    return sendResponse(res, 201, 'User account registered successfully', user);
  })
);

// 2. User Login
router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = req.ip;
    const { user, accessToken, refreshToken } = await AuthService.login(req.body, ipAddress);
    
    setRefreshTokenCookie(res, refreshToken);
    
    return sendResponse(res, 200, 'Authentication successful', {
      user,
      accessToken,
    });
  })
);

// 3. Token Rotation (Refresh)
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies[COOKIE_NAME] || req.body.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Session session has expired' },
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = await AuthService.refresh(token);
    
    setRefreshTokenCookie(res, newRefreshToken);
    
    return sendResponse(res, 200, 'Token refreshed successfully', {
      accessToken,
    });
  })
);

// 4. User Logout
router.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies[COOKIE_NAME] || req.body.refreshToken;
    if (token) {
      await AuthService.logout(token);
    }
    
    res.clearCookie(COOKIE_NAME);
    return sendResponse(res, 200, 'Logged out successfully');
  })
);

// 5. Get Current User Info
router.get(
  '/me',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }
    const user = await AuthService.getUserById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User profile not found' },
      });
    }
    return sendResponse(res, 200, 'Current profile retrieved', { user });
  })
);

export const authRouter = router;
export default authRouter;
