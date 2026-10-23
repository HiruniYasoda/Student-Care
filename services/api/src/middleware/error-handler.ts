import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@student-care/shared-types';
import { env } from '../config/env';
import { logger } from '../config/logger';

export function errorHandler(
  err: Error & { statusCode?: number; code?: string; details?: unknown },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode =
    err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  logger.error(`[${req.method}] ${req.path} - Error: ${err.message}`, {
    statusCode,
    code: errorCode,
    stack: env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: errorCode,
      message:
        statusCode === 500 && env.NODE_ENV === 'production'
          ? 'An internal server error occurred'
          : err.message,
      details: err.details ?? undefined,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}
