import { Request, Response, NextFunction } from 'express';
import { Schema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: Schema, target: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new ValidationError('Validation constraints violated', issues));
      }
      next(error);
    }
  };
};

