import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;

    // Log user/validation warnings at WARN level, rather than ERROR level
    if (statusCode >= 400 && statusCode < 500) {
      logger.warn(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
    } else {
      logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
    }
  } else {
    // Unhandled application crash / library error
    logger.error(`💥 Unhandled Exception: ${err.message}`, { stack: err.stack });
    
    if (env.NODE_ENV === 'development') {
      message = err.message;
      details = err.stack;
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(details ? { details } : {}),
    },
  });
};
