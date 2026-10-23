import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { healthRouter } from './routes/health';
import { notFoundHandler } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';

export function createApp(): Application {
  const app = express();

  // Security and parsing middleware
  app.use(
    cors({
      origin: env.ALLOWED_ORIGINS,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/health', healthRouter);

  // Catch 404
  app.use(notFoundHandler);

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
