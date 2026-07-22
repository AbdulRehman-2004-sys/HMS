import { BadRequestError, NotFoundError } from '../../utils/errors';
import { logAudit } from '../../utils/audit';
import { db } from '../../db/connection';
import { users } from '../../db/schema';
import { radiologyOrders } from '../orders/orders.schema';
import { eq } from 'drizzle-orm';
import { RadiologyRepository } from './radiology.repository';
import {
  RadiologyQueueSummaryDTO,
  RadiologyReportResponseDTO,
  RadiologyReportStatus,
  SaveRadiologyReportDTO,
} from './radiology.types';

export class RadiologyService {
  // 1. Get Queue of Radiology Orders
  public static async getRadiologyQueue(
    statusFilter?: string,
    serviceTypeFilter?: string,
    search?: string
  ): Promise<RadiologyQueueSummaryDTO> {
    return await RadiologyRepository.getRadiologyQueue(statusFilter, serviceTypeFilter, search);
  }

  // 2. Save or Finalize Radiology Report
  public static async saveRadiologyReport(
    data: SaveRadiologyReportDTO,
    userId: string,
    ipAddress?: string
  ): Promise<RadiologyReportResponseDTO> {
    const isDb = (global as any).authServiceDbConnected ?? false;

    // Check if order is cancelled
    if (isDb) {
      const [order] = await db
        .select()
        .from(radiologyOrders)
        .where(eq(radiologyOrders.id, data.radiologyOrderId))
        .limit(1);

      if (!order) {
        throw new NotFoundError('Radiology order not found.');
      }

      if (order.status === 'CANCELLED') {
        throw new BadRequestError('Cancelled radiology orders cannot receive a report.');
      }

      // Check if report is already completed
      const existing = await RadiologyRepository.getReportByOrderId(data.radiologyOrderId);
      if (existing && existing.status === RadiologyReportStatus.COMPLETED) {
        throw new BadRequestError('Completed radiology reports are locked and cannot be edited.');
      }
    }

    // Get technician name
    let technicianName = 'Radiology Technician';
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

    const report = await RadiologyRepository.saveRadiologyReport(data, userId, technicianName);

    const actionText =
      data.status === RadiologyReportStatus.COMPLETED
        ? 'FINALIZED_RADIOLOGY_REPORT'
        : 'DRAFTED_RADIOLOGY_REPORT';
    await logAudit({
      userId,
      action: actionText,
      module: 'Radiology',
      details: `${data.status === RadiologyReportStatus.COMPLETED ? 'Finalized' : 'Drafted'} Radiology Report ${report.reportNumber} (${data.serviceType}: ${data.examination})`,
      ipAddress,
    });

    return report;
  }

  // 3. Get Reports By Visit ID (For Doctor EMR)
  public static async getReportsByVisit(visitId: string): Promise<RadiologyReportResponseDTO[]> {
    return await RadiologyRepository.getRadiologyReportsByVisit(visitId);
  }

  // 4. Get Report By Order ID
  public static async getReportByOrderId(radiologyOrderId: string): Promise<RadiologyReportResponseDTO | null> {
    return await RadiologyRepository.getReportByOrderId(radiologyOrderId);
  }
}
