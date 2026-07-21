import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';
import { db } from '../../db/connection';
import { users } from '../../db/schema';
import { labOrders } from '../orders/orders.schema';
import { eq } from 'drizzle-orm';
import { LabRepository } from './lab.repository';
import {
  LabQueueSummaryDTO,
  LabReportResponseDTO,
  LabReportStatus,
  SaveLabReportDTO,
} from './lab.types';

export class LabService {
  // 1. Get Queue of Lab Orders
  public static async getLabQueue(statusFilter?: string, search?: string): Promise<LabQueueSummaryDTO> {
    return await LabRepository.getLabQueue(statusFilter, search);
  }

  // 2. Save or Finalize Lab Report
  public static async saveLabReport(
    data: SaveLabReportDTO,
    userId: string,
    ipAddress?: string
  ): Promise<LabReportResponseDTO> {
    const isDb = (global as any).authServiceDbConnected ?? false;

    // Check if order is cancelled
    if (isDb) {
      const [order] = await db
        .select()
        .from(labOrders)
        .where(eq(labOrders.id, data.labOrderId))
        .limit(1);

      if (!order) {
        throw new NotFoundError('Lab order not found.');
      }

      if (order.status === 'CANCELLED') {
        throw new BadRequestError('Cancelled lab orders cannot receive a report.');
      }

      // Check if report is already completed
      const existing = await LabRepository.getReportByOrderId(data.labOrderId);
      if (existing && existing.status === LabReportStatus.COMPLETED) {
        throw new BadRequestError('Completed lab reports are locked and cannot be edited.');
      }
    }

    // Get technician name
    let technicianName = 'Lab Technician';
    if (isDb) {
      const [techUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (techUser) {
        technicianName = `${techUser.firstName} ${techUser.lastName}`;
      }
    }

    const report = await LabRepository.saveLabReport(data, userId, technicianName);

    const actionText = data.status === LabReportStatus.COMPLETED ? 'FINALIZED_LAB_REPORT' : 'DRAFTED_LAB_REPORT';
    await logAudit({
      userId,
      action: actionText,
      module: 'Laboratory',
      details: `${data.status === LabReportStatus.COMPLETED ? 'Finalized' : 'Drafted'} Lab Report ${report.reportNumber} with ${data.items.length} test parameters`,
      ipAddress,
    });

    return report;
  }

  // 3. Get Reports By Visit ID (For Doctor EMR)
  public static async getReportsByVisit(visitId: string): Promise<LabReportResponseDTO[]> {
    return await LabRepository.getLabReportsByVisit(visitId);
  }

  // 4. Get Report By Order ID
  public static async getReportByOrderId(labOrderId: string): Promise<LabReportResponseDTO | null> {
    return await LabRepository.getReportByOrderId(labOrderId);
  }
}
