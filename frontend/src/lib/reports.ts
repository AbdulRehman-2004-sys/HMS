import { api } from './api-client';

export type ReportType =
  | 'patient'
  | 'doctor'
  | 'lab'
  | 'radiology'
  | 'admission'
  | 'billing'
  | 'revenue';

export interface ReportFilterParams {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  department?: string;
}

export interface ReportDataResponse {
  reportType: ReportType;
  totalRecords: number;
  summaryMetrics: Record<string, any>;
  rows: any[];
}

export async function getReportDataApi(
  reportType: ReportType,
  params?: ReportFilterParams
): Promise<ReportDataResponse> {
  const res = await api.get(`/reports/${reportType}`, { params });
  return res.data.data;
}
