import { Router, Request, Response } from 'express';
import { ApiResponse, HealthCheckResponse } from '@student-care/shared-types';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  const healthData: HealthCheckResponse = {
    status: 'ok',
    service: 'student-care-api',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    timezone: env.DEFAULT_TIMEZONE,
  };

  const response: ApiResponse<HealthCheckResponse> = {
    success: true,
    data: healthData,
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
});
