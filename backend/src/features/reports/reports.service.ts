import { ReportsRepository } from './reports.repository';
import { ReportType, ReportFilterDTO, ReportDataResponseDTO } from './reports.types';
import { ForbiddenError } from '../../utils/errors';
import { db } from '../../db/connection';
import { auditLogs } from '../../db/schema';

export class ReportsService {
  private static validateRoleAccess(reportType: ReportType, userRoles: string[]) {
    const isSuperAdmin = userRoles.includes('Super Admin');
    if (isSuperAdmin) return;

    const isReceptionist = userRoles.includes('Receptionist');
    if (isReceptionist && ['patient', 'billing', 'admission'].includes(reportType)) return;

    const isDoctor = userRoles.includes('Doctor');
    if (isDoctor && ['patient', 'doctor', 'lab', 'radiology'].includes(reportType)) return;

    const isLab = userRoles.includes('Laboratory');
    if (isLab && reportType === 'lab') return;

    const isRad = userRoles.includes('Radiology');
    if (isRad && reportType === 'radiology') return;

    const isBilling = userRoles.includes('Billing');
    if (isBilling && ['billing', 'revenue'].includes(reportType)) return;

    throw new ForbiddenError(`You do not have permission to access "${reportType}" reports.`);
  }

  private static async logAudit(userId: string | undefined, reportType: ReportType, filters: ReportFilterDTO) {
    try {
      const isDb = (global as any).authServiceDbConnected ?? false;
      if (isDb && userId) {
        await db.insert(auditLogs).values({
          userId,
          action: 'GENERATE_REPORT',
          module: 'REPORTS',
          details: `Generated "${reportType}" report with filters: ${JSON.stringify(filters)}`,
        });
      }
    } catch (err) {
      // Ignore audit failure
    }
  }

  public static async getReportData(
    reportType: ReportType,
    filters: ReportFilterDTO,
    userRoles: string[],
    userId?: string
  ): Promise<ReportDataResponseDTO> {
    this.validateRoleAccess(reportType, userRoles);

    const reportData = await ReportsRepository.getReportData(reportType, filters);
    await this.logAudit(userId, reportType, filters);

    return reportData;
  }
}
