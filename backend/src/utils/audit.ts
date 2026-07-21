import { db } from '../db/connection';
import { auditLogs } from '../db/schema';
import { lt } from 'drizzle-orm';
import { logger } from '../config/logger';

export interface MockAuditLog {
  id: string;
  userId: string | null;
  action: string;
  module: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export const mockAuditLogs: MockAuditLog[] = [];

/**
 * Centrally log audit events.
 * Filters for critical actions to save DB storage space,
 * and automatically prunes logs older than 15 days.
 */
export const logAudit = async (params: {
  userId: string | null;
  action: string;
  module: string;
  details: string;
  ipAddress?: string | null;
}) => {
  // Only track critical actions to avoid filling up the free tier DB storage
  const criticalActions = [
    'USER_LOGIN',
    'USER_REGISTERED',
    'USER_CREATED',
    'USER_ACTIVATED',
    'USER_DEACTIVATED',
    'USER_PASSWORD_RESET',
    'USER_DELETED',
    'PATIENT_REGISTERED',
    'PATIENT_UPDATED',
    'PATIENT_DELETED',
  ];

  if (!criticalActions.includes(params.action)) {
    return; // Skip logging non-critical actions
  }

  const isDb = (global as any).authServiceDbConnected ?? false;

  if (isDb) {
    try {
      await db.insert(auditLogs).values({
        userId: params.userId,
        action: params.action,
        module: params.module,
        details: params.details,
        ipAddress: params.ipAddress || null,
      });

      // Auto-clear logs older than 15 days asynchronously to limit size
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 15);
      db.delete(auditLogs)
        .where(lt(auditLogs.createdAt, cutoffDate))
        .catch((err) => {
          logger.error('Failed to auto-clear old audit logs:', err);
        });
    } catch (err) {
      logger.error('Failed to write audit log in database:', err);
    }
  } else {
    mockAuditLogs.push({
      id: `al-${Date.now()}`,
      userId: params.userId,
      action: params.action,
      module: params.module,
      ipAddress: params.ipAddress || null,
      details: params.details,
      createdAt: new Date(),
    });
  }
};
