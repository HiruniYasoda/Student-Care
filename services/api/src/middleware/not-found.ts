import { Request, Response } from 'express';
import { ApiResponse } from '@student-care/shared-types';

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.path}' does not exist on this server.`,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}
