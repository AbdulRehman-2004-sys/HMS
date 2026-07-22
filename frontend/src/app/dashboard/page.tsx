'use client';

import React, { useEffect, useState } from 'react';
import PermissionGuard from './PermissionGuard';
import { Permission } from '../../lib/permissions';
import {
  getDashboardSummaryApi,
  DashboardSummaryData,
} from '../../lib/dashboard';

import {
  Users,
  UserCheck,
  CreditCard,
  TrendingUp,
  Clock,
  Calendar,
  FlaskConical,
  FileText,
  Activity,
  Bed,
  Stethoscope,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  UserPlus,
  Receipt,
  BarChart2,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [user, setUser] = useState<{ firstName: string; lastName: string; roles: string[] } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hms_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getDashboardSummaryApi();
      setData(summary);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const primaryRole = user?.roles?.[0] || 'Staff';

  return (
    <PermissionGuard permission={Permission.VIEW_DASHBOARD}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="h-7 w-7 text-teal-600" />
              Hospital Operational Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time operational indicators, daily performance metrics, and activity streams for LALA Medical Complex.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-bold rounded border border-slate-200 uppercase">
              Role: {primaryRole}
            </span>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-md shadow-sm transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
              Refresh Metrics
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !data && (
          <div className="flex h-64 items-center justify-center bg-white rounded-lg border border-slate-200">
            <div className="flex flex-col items-center gap-2">
              <Activity className="h-8 w-8 animate-spin text-teal-600" />
              <span className="text-xs font-semibold text-slate-500">Aggregating Operational Datastores...</span>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            
            {/* 1. Large KPI Cards Grid (11 Indicator Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              
              {/* Card 1: Total Patients */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Patients</span>
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-md">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900">{data.kpi.totalPatients.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Lifetime Registered</span>
                </div>
              </div>

              {/* Card 2: Today's Patients */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today Patients</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                    <UserCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-emerald-600">{data.kpi.todayPatients.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">New OPD Check-ins</span>
                </div>
              </div>

              {/* Card 3: Total Revenue */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-black text-slate-900">Rs. {data.kpi.totalRevenue.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Accumulated Income</span>
                </div>
              </div>

              {/* Card 4: Today's Revenue */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today Revenue</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-black text-emerald-600">Rs. {data.kpi.todayRevenue.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Collections Today</span>
                </div>
              </div>

              {/* Card 5: Pending Bills */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Bills</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-amber-600">{data.kpi.pendingBills.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Unpaid Encounters</span>
                </div>
              </div>

              {/* Card 6: Today's Appointments */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Appointments</span>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-purple-600">{data.kpi.todayAppointments.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Today Scheduled</span>
                </div>
              </div>

              {/* Card 7: Lab Tests Today */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lab Tests</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900">{data.kpi.labTestsToday.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Ordered Today</span>
                </div>
              </div>

              {/* Card 8: X-Ray Today */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">X-Ray Today</span>
                  <div className="p-2 bg-cyan-50 text-cyan-600 rounded-md">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900">{data.kpi.xrayToday.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Radiology Scans</span>
                </div>
              </div>

              {/* Card 9: Ultrasound Today */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ultrasound</span>
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-md">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900">{data.kpi.ultrasoundToday.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">USG Studies</span>
                </div>
              </div>

              {/* Card 10: Active Admissions */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active IPD</span>
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-md">
                    <Bed className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-rose-600">{data.kpi.activeAdmissions.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Ward Occupancy</span>
                </div>
              </div>

              {/* Card 11: Total Doctors */}
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Consultants</span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-md">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-900">{data.kpi.totalDoctors.toLocaleString()}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Doctors On Duty</span>
                </div>
              </div>

            </div>

            {/* 2. Simple Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Patients This Week (Simple SVG Bar Chart) */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Users className="h-4 w-4 text-teal-600" /> Patients This Week
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">7-Day Trend</span>
                </div>

                <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
                  {data.charts.patientsThisWeek.map((item, idx) => {
                    const maxVal = Math.max(...data.charts.patientsThisWeek.map((d) => d.count), 1);
                    const heightPct = Math.max(10, Math.round((item.count / maxVal) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.count}
                        </span>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full bg-teal-600 hover:bg-teal-700 rounded-t transition-all"
                        />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart 2: Revenue This Week (Simple Bar Chart) */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" /> Revenue This Week (PKR)
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">7-Day Collections</span>
                </div>

                <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
                  {data.charts.revenueThisWeek.map((item, idx) => {
                    const maxVal = Math.max(...data.charts.revenueThisWeek.map((d) => d.amount), 1);
                    const heightPct = Math.max(10, Math.round((item.amount / maxVal) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[9px] font-mono font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-[40px]">
                          {item.amount > 1000 ? `${(item.amount / 1000).toFixed(0)}k` : item.amount}
                        </span>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-t transition-all"
                        />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart 3: Laboratory Tests This Week */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-indigo-600" /> Laboratory Tests This Week
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">7-Day Volume</span>
                </div>

                <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
                  {data.charts.labTestsThisWeek.map((item, idx) => {
                    const maxVal = Math.max(...data.charts.labTestsThisWeek.map((d) => d.count), 1);
                    const heightPct = Math.max(10, Math.round((item.count / maxVal) * 100));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-mono font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.count}
                        </span>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-t transition-all"
                        />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">{item.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart 4: Doctor-wise Patient Count */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-teal-600" /> Doctor-wise Patient Consultation Count
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400">Active Consultants</span>
                </div>

                <div className="space-y-3 pt-2">
                  {data.charts.doctorPatientCount.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">No doctor consultations recorded yet.</p>
                  ) : (
                    data.charts.doctorPatientCount.map((doc) => {
                      const maxVal = Math.max(...data.charts.doctorPatientCount.map((d) => d.count), 1);
                      const widthPct = Math.max(8, Math.round((doc.count / maxVal) * 100));

                      return (
                        <div key={doc.doctorId} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-800">
                            <span>{doc.doctorName} <span className="text-[10px] font-normal text-slate-400">({doc.specialization})</span></span>
                            <span className="font-mono text-teal-700">{doc.count} Patients</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              style={{ width: `${widthPct}%` }}
                              className="bg-teal-600 h-full rounded-full transition-all"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* 3. Recent Activities Feed (Limit to last 10 records) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal-600" /> Recent Operational Activity Stream
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Showing latest 10 system actions across departments</p>
                </div>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">Real-Time Sync</span>
              </div>

              <div className="divide-y divide-slate-100">
                {data.recentActivities.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    No recent activities logged yet.
                  </div>
                ) : (
                  data.recentActivities.map((act) => (
                    <div key={act.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full mt-0.5 shrink-0 bg-slate-100 text-slate-600">
                          {act.type === 'PATIENT_REGISTRATION' && <UserPlus className="h-4 w-4 text-teal-600" />}
                          {act.type === 'LAB_REPORT' && <FlaskConical className="h-4 w-4 text-indigo-600" />}
                          {act.type === 'RADIOLOGY_REPORT' && <FileText className="h-4 w-4 text-cyan-600" />}
                          {act.type === 'ADMISSION' && <Bed className="h-4 w-4 text-rose-600" />}
                          {act.type === 'PAYMENT' && <Receipt className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{act.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{act.details}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Operator: <strong className="text-slate-600 font-medium">{act.operatorName}</strong>
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
