import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, checkDatabaseConnection } from './connection';
import { logger } from '../config/logger';
import path from 'path';

const runMigrations = async () => {
  logger.info('Starting database migration process...');
  const connected = await checkDatabaseConnection();
  if (!connected) {
    logger.error('Aborting migrations: database unreachable');
    process.exit(1);
  }

  try {
    await migrate(db, { 
      migrationsFolder: path.join(__dirname, 'migrations') 
    });
    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error executing database migrations:', error);
    process.exit(1);
  }
};

runMigrations();
