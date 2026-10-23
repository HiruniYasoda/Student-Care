import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { dbManager } from './database/connection-manager';

const server = app.listen(env.PORT, env.API_HOST, () => {
  logger.info(`Student Care API service running on http://${env.API_HOST}:${env.PORT}`, {
    environment: env.NODE_ENV,
    timezone: env.DEFAULT_TIMEZONE,
  });
});

async function handleShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await dbManager.closeAll();
    process.exit(0);
  });

  // Force exit if shutdown hangs beyond 10 seconds
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
