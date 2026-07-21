import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '../config/env';
import { logger } from '../config/logger';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
});

export const db = drizzle(pool, { schema });

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    client.release();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('⚠️ Database connection failed. Please ensure DATABASE_URL is valid and PostgreSQL is running.');
    return false;
  }
};
