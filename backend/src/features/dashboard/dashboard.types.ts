export interface KPICardsDTO {
  totalPatients: number;
  todayPatients: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingBills: number;
  todayAppointments: number;
  labTestsToday: number;
  xrayToday: number;
  ultrasoundToday: number;
  activeAdmissions: number;
  totalDoctors: number;
}

export interface DailySeriesItemDTO {
  day: string; // e.g. "Mon", "Tue", "Jul 21"
  dateStr: string; // e.g. "2026-07-21"
  count: number;
}

export interface DailyRevenueSeriesItemDTO {
  day: string;
  dateStr: string;
  amount: number;
}

export interface DoctorPatientCountItemDTO {
  doctorId: string;
  doctorName: string;
  specialization: string;
  count: number;
}

export interface WeeklyChartDataDTO {
  patientsThisWeek: DailySeriesItemDTO[];
  revenueThisWeek: DailyRevenueSeriesItemDTO[];
  labTestsThisWeek: DailySeriesItemDTO[];
  doctorPatientCount: DoctorPatientCountItemDTO[];
}

export interface RecentActivityDTO {
  id: string;
  timestamp: Date;
  type: 'PATIENT_REGISTRATION' | 'LAB_REPORT' | 'RADIOLOGY_REPORT' | 'ADMISSION' | 'PAYMENT';
  title: string;
  details: string;
  operatorName: string;
}

export interface DashboardSummaryResponseDTO {
  kpi: KPICardsDTO;
  charts: WeeklyChartDataDTO;
  recentActivities: RecentActivityDTO[];
  userRole: string;
}
