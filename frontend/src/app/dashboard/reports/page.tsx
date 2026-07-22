'use client';

import React, { useState, useEffect } from 'react';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import { getReportDataApi, ReportType, ReportDataResponse } from '../../../lib/reports';

import {
  FileText,
  Users,
  Stethoscope,
  FlaskConical,
  Bed,
  CreditCard,
  TrendingUp,
  Filter,
  RefreshCw,
  Search,
  Activity,
  AlertCircle,
} from 'lucide-react';

const reportTabs: { type: ReportType; label: string; icon: any }[] = [
  { type: 'patient', label: 'Patient Report', icon: Users },
  { type: 'doctor', label: 'Doctor Report', icon: Stethoscope },
  { type: 'lab', label: 'Laboratory Report', icon: FlaskConical },
  { type: 'radiology', label: 'Radiology Report', icon: FileText },
  { type: 'admission', label: 'Admission Report', icon: Bed },
  { type: 'billing', label: 'Billing Report', icon: CreditCard },
  { type: 'revenue', label: 'Revenue Report', icon: TrendingUp },
];

const safeNumber = (val: any): string => {
  if (val === undefined || val === null) return '0';
  const num = Number(val);
  return isNaN(num) ? '0' : num.toLocaleString();
};

const safeDate = (val: any): string => {
  if (!val) return 'N/A';
  const d = new Date(val);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
};

const safeDateTime = (val: any): string => {
  if (!val) return 'N/A';
  const d = new Date(val);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
};

export default function ReportsDashboardPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('patient');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportDataResponse | null>(null);

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReportDataApi(activeTab, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        department: department || undefined,
      });
      setReportData(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || `Failed to generate ${activeTab} report.`);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setDepartment('');
    fetchReport();
  };

  return (
    <PermissionGuard permission={Permission.VIEW_REPORTS}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-7 w-7 text-teal-600" />
              Operational & Clinical Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Filterable system report logs for patient demographics, clinical consultations, diagnostics, admissions, and financial revenue.
            </p>
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Generate Report
          </button>
        </div>

        {/* 1. Report Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2. Filter Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            <Filter className="h-4 w-4 text-teal-600" /> Filter Criteria
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Department / Specialty</label>
              <input
                type="text"
                placeholder="e.g. Cardiology, OPD..."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={fetchReport}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" /> Apply
              </button>
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3. Report Results Display */}
        {loading ? (
          <div className="flex h-64 items-center justify-center bg-white rounded-lg border border-slate-200">
            <div className="flex flex-col items-center gap-2">
              <Activity className="h-8 w-8 animate-spin text-teal-600" />
              <span className="text-xs font-semibold text-slate-500">Executing Report Queries...</span>
            </div>
          </div>
        ) : reportData && (
          <div className="space-y-4">
            
            {/* Report Summary Cards Bar */}
            <div className="bg-slate-900 text-white rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-teal-400">{reportData.reportType} Report Summary</span>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-200 font-mono text-xs rounded">
                  {reportData.totalRecords || 0} Record(s) Found
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs flex-wrap">
                {reportData.summaryMetrics &&
                  Object.entries(reportData.summaryMetrics).map(([key, val]) => (
                    <div key={key} className="bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold block">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-bold text-white mt-0.5 block">
                        {typeof val === 'number' && key.toLowerCase().includes('revenue')
                          ? `Rs. ${safeNumber(val)}`
                          : typeof val === 'number'
                          ? safeNumber(val)
                          : String(val ?? 0)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Simple Data Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {/* 1. Patient Report Table */}
                {activeTab === 'patient' && (
                  <table className="w-full text-left bg-white text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">MR Number</th>
                        <th className="p-3">Patient Name</th>
                        <th className="p-3">Age / Gender</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">City</th>
                        <th className="p-3">Registration Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!reportData.rows || reportData.rows.length === 0 ? (
                        <tr><td colSpan={6} className="p-6 text-center text-slate-400 italic">No patient records found.</td></tr>
                      ) : (
                        reportData.rows.map((row: any) => (
                          <tr key={row.id || Math.random()} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-teal-700">{row.mrNumber || 'N/A'}</td>
                            <td className="p-3 font-bold text-slate-800">{row.fullName || 'Unnamed Patient'}</td>
                            <td className="p-3">{row.age || 'N/A'} Yrs / {row.gender || 'N/A'}</td>
                            <td className="p-3 font-mono text-slate-600">{row.mobileNumber || 'N/A'}</td>
                            <td className="p-3">{row.city || 'N/A'}</td>
                            <td className="p-3 text-slate-500">{safeDate(row.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 2. Doctor Report Table */}
                {activeTab === 'doctor' && (
                  <table className="w-full text-left bg-white text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Doctor Name</th>
                        <th className="p-3">Specialization</th>
                        <th className="p-3">Qualification</th>
                        <th className="p-3">Total Visits</th>
                        <th className="p-3">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!reportData.rows || reportData.rows.length === 0 ? (
                        <tr><td colSpan={5} className="p-6 text-center text-slate-400 italic">No doctor records found.</td></tr>
                      ) : (
                        reportData.rows.map((row: any) => (
                          <tr key={row.id || Math.random()} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">{row.doctorName || 'Doctor'}</td>
                            <td className="p-3 font-medium text-teal-700">{row.specialization || 'Consultant'}</td>
                            <td className="p-3 text-slate-600">{row.qualification || 'MBBS'}</td>
                            <td className="p-3 font-mono font-bold text-slate-900">{safeNumber(row.totalVisits)} Encounters</td>
                            <td className="p-3 font-mono font-bold text-emerald-700">Rs. {safeNumber(row.totalRevenue)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 3. Laboratory Report Table */}
                {activeTab === 'lab' && (
                  <table className="w-full text-left bg-white text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Report Number</th>
                        <th className="p-3">Patient Name</th>
                        <th className="p-3">MR Number</th>
                        <th className="p-3">Test Parameters</th>
                        <th className="p-3">Technician</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Result Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!reportData.rows || reportData.rows.length === 0 ? (
                        <tr><td colSpan={7} className="p-6 text-center text-slate-400 italic">No lab report records found.</td></tr>
                      ) : (
                        reportData.rows.map((row: any) => (
                          <tr key={row.id || Math.random()} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-800">{row.reportNumber || 'N/A'}</td>
                            <td className="p-3 font-semibold text-slate-900">{row.patientName || 'Patient'}</td>
                            <td className="p-3 font-mono text-teal-700">{row.mrNumber || 'N/A'}</td>
                            <td className="p-3">{safeNumber(row.testCount)} Parameters</td>
                            <td className="p-3 text-slate-600">{row.technicianName || 'Technician'}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                {row.status || 'COMPLETED'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">{safeDateTime(row.resultDate)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 4. Radiology Report Table */}
                {activeTab === 'radiology' && (
                  <table className="w-full text-left bg-white text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Report Number</th>
                        <th className="p-3">Patient Name</th>
                        <th className="p-3">MR Number</th>
                        <th className="p-3">Service Modality</th>
                        <th className="p-3">Examination</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Report Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!reportData.rows || reportData.rows.length === 0 ? (
                        <tr><td colSpan={7} className="p-6 text-center text-slate-400 italic">No radiology records found.</td></tr>
                      ) : (
                        reportData.rows.map((row: any) => (
                          <tr key={row.id || Math.random()} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-800">{row.reportNumber || 'N/A'}</td>
                            <td className="p-3 font-semibold text-slate-900">{row.patientName || 'Patient'}</td>
                            <td className="p-3 font-mono text-teal-700">{row.mrNumber || 'N/A'}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[10px] font-bold rounded uppercase">{row.serviceType || 'XRAY'}</span></td>
                            <td className="p-3 text-slate-800 font-medium">{row.examination || 'N/A'}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">{row.status || 'COMPLETED'}</span></td>
                            <td className="p-3 text-slate-500">{safeDateTime(row.reportDate)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 5. Admission Report Table */}
                {activeTab === 'admission' && (
                  <table className="w-full text-left bg-white text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Admission #</th>
                        <th className="p-3">Patient Name</th>
                        <th className="p-3">MR Number</th>
                        <th className="p-3">Room / Ward</th>
                        <th className="p-3">Room Charges</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Admission Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!reportData.rows || reportData.rows.length === 0 ? (
                        <tr><td colSpan={7} className="p-6 text-center text-slate-400 italic">No admission records found.</td></tr>
                      ) : (
                        reportData.rows.map((row: any) => (
                          <tr key={row.id || Math.random()} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-800">{row.admissionNumber || 'N/A'}</td>
                            <td className="p-3 font-semibold text-slate-900">{row.patientName || 'Patient'}</td>
                            <td className="p-3 font-mono text-teal-700">{row.mrNumber || 'N/A'}</td>
                            <td className="p-3 font-bold text-slate-800">{row.roomName || 'Ward'}</td>
                            <td className="p-3 font-mono font-bold text-emerald-700">Rs. {safeNumber(row.roomCharges)}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">{row.status || 'ADMITTED'}</span></td>
                            <td className="p-3 text-slate-500">{safeDate(row.admissionDate)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 6. Billing Report Table */}
                {activeTab === 'billing' && (
                  <table className="w-full text-left bg-white text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Bill Number</th>
                        <th className="p-3">Patient Name</th>
                        <th className="p-3">MR Number</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Paid Amount</th>
                        <th className="p-3">Payment Status</th>
                        <th className="p-3">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!reportData.rows || reportData.rows.length === 0 ? (
                        <tr><td colSpan={7} className="p-6 text-center text-slate-400 italic">No billing records found.</td></tr>
                      ) : (
                        reportData.rows.map((row: any) => (
                          <tr key={row.id || Math.random()} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-800">{row.billNumber || 'N/A'}</td>
                            <td className="p-3 font-semibold text-slate-900">{row.patientName || 'Patient'}</td>
                            <td className="p-3 font-mono text-teal-700">{row.mrNumber || 'N/A'}</td>
                            <td className="p-3 font-mono font-bold text-slate-900">Rs. {safeNumber(row.totalAmount)}</td>
                            <td className="p-3 font-mono font-bold text-emerald-700">Rs. {safeNumber(row.paidAmount)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 font-bold text-[10px] rounded uppercase ${row.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {row.paymentStatus || 'PENDING'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 font-semibold">{row.paymentMethod || 'CASH'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {/* 7. Revenue Report Table */}
                {activeTab === 'revenue' && (
                  <table className="w-full text-left bg-white text-xs">
                    <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Consultation</th>
                        <th className="p-3">Laboratory</th>
                        <th className="p-3">Radiology</th>
                        <th className="p-3">Admission</th>
                        <th className="p-3">Operation</th>
                        <th className="p-3">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {!reportData.rows || reportData.rows.length === 0 ? (
                        <tr><td colSpan={7} className="p-6 text-center text-slate-400 italic">No revenue data available.</td></tr>
                      ) : (
                        reportData.rows.map((row: any) => (
                          <tr key={row.id || Math.random()} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-slate-800">{row.dateStr || 'N/A'}</td>
                            <td className="p-3 font-mono">Rs. {safeNumber(row.consultationRevenue)}</td>
                            <td className="p-3 font-mono">Rs. {safeNumber(row.labRevenue)}</td>
                            <td className="p-3 font-mono">Rs. {safeNumber(row.radiologyRevenue)}</td>
                            <td className="p-3 font-mono">Rs. {safeNumber(row.admissionRevenue)}</td>
                            <td className="p-3 font-mono">Rs. {safeNumber(row.operationRevenue)}</td>
                            <td className="p-3 font-mono font-bold text-emerald-700">Rs. {safeNumber(row.totalDailyRevenue)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

              </div>
            </div>

          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
