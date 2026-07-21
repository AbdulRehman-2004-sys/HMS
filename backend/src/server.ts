import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { checkDatabaseConnection } from './db/connection';

const port = env.PORT;

const boot = async () => {
  logger.info('Initializing LALA Medical Complex HMS API Backend...');
  
  // Test connection to Neon Database
  await checkDatabaseConnection();

  const server = app.listen(port, () => {
    logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on http://localhost:${port}`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (reason: Error) => {
    logger.error(`💥 Unhandled Promise Rejection: ${reason.message}`, { stack: reason.stack });
    // Keep running in dev, shutdown safely in production
    if (env.NODE_ENV === 'production') {
      server.close(() => process.exit(1));
    }
  });

  // Handle Uncaught Exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error(`💥 Uncaught Exception: ${error.message}`, { stack: error.stack });
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
};

boot();
