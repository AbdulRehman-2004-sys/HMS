import { DashboardRepository } from './dashboard.repository';
import { DashboardSummaryResponseDTO, KPICardsDTO, WeeklyChartDataDTO, RecentActivityDTO } from './dashboard.types';
import { db } from '../../db/connection';
import { doctors } from '../doctors/doctors.schema';
import { eq } from 'drizzle-orm';

export class DashboardService {
  public static async getDashboardSummary(userRoles: string[], userId?: string): Promise<DashboardSummaryResponseDTO> {
    const isDoctor = userRoles.includes('Doctor') && !userRoles.includes('Super Admin');
    const primaryRole = userRoles[0] || 'Staff';

    let doctorIdFilter: string | undefined = undefined;

    if (isDoctor && userId) {
      const isDb = (global as any).authServiceDbConnected ?? false;
      if (isDb) {
        const [doc] = await db
          .select({ id: doctors.id })
          .from(doctors)
          .where(eq(doctors.userId, userId))
          .limit(1);

        if (doc) {
          doctorIdFilter = doc.id;
        }
      }
    }

    const kpi: KPICardsDTO = await DashboardRepository.getKPICards(doctorIdFilter);
    const charts: WeeklyChartDataDTO = await DashboardRepository.getWeeklyCharts(doctorIdFilter);
    const recentActivities: RecentActivityDTO[] = await DashboardRepository.getRecentActivities();

    return {
      kpi,
      charts,
      recentActivities,
      userRole: primaryRole,
    };
  }
}
