import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/appError';

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(error);

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: z.treeifyError(error),
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: 'Internal server error',
  });
}