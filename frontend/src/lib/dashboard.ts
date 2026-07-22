import { api } from './api-client';

export interface KPICardsData {
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

export interface DailySeriesItem {
  day: string;
  dateStr: string;
  count: number;
}

export interface DailyRevenueSeriesItem {
  day: string;
  dateStr: string;
  amount: number;
}

export interface DoctorPatientCountItem {
  doctorId: string;
  doctorName: string;
  specialization: string;
  count: number;
}

export interface WeeklyChartData {
  patientsThisWeek: DailySeriesItem[];
  revenueThisWeek: DailyRevenueSeriesItem[];
  labTestsThisWeek: DailySeriesItem[];
  doctorPatientCount: DoctorPatientCountItem[];
}

export interface RecentActivityData {
  id: string;
  timestamp: string;
  type: 'PATIENT_REGISTRATION' | 'LAB_REPORT' | 'RADIOLOGY_REPORT' | 'ADMISSION' | 'PAYMENT';
  title: string;
  details: string;
  operatorName: string;
}

export interface DashboardSummaryData {
  kpi: KPICardsData;
  charts: WeeklyChartData;
  recentActivities: RecentActivityData[];
  userRole: string;
}

// Get Complete Dashboard Summary
export async function getDashboardSummaryApi(): Promise<DashboardSummaryData> {
  const res = await api.get('/dashboard/summary');
  return res.data.data;
}

// Get Dashboard Charts
export async function getDashboardChartsApi(): Promise<WeeklyChartData> {
  const res = await api.get('/dashboard/charts');
  return res.data.data.charts;
}

// Get Recent Activities
export async function getRecentActivitiesApi(): Promise<RecentActivityData[]> {
  const res = await api.get('/dashboard/activities');
  return res.data.data.recentActivities;
}
