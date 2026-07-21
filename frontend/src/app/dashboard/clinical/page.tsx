'use client';

import React, { useEffect, useState, useCallback } from 'react';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import { api } from '../../../lib/api-client';
import {
  getTodayQueueApi,
  getEMRDetailsApi,
  updateVisitStatusApi,
  VisitRecord,
  VisitStatus,
  QueueSummary,
  EMRDetailsData,
} from '../../../lib/visits';
import { EMRScreen } from '../../../components/EMRScreen';
import {
  Stethoscope,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  UserCheck,
  FileText,
  Activity,
  User,
  Phone,
  Filter,
} from 'lucide-react';

interface DoctorItem {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  specialization: string;
}


export default function ClinicalQueuePage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; roles: string[]; firstName: string; lastName: string } | null>(null);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [statusFilter, setStatusFilter] = useState<VisitStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [queue, setQueue] = useState<VisitRecord[]>([]);
  const [summary, setSummary] = useState<QueueSummary>({
    total: 0,
    waiting: 0,
    withDoctor: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedEMR, setSelectedEMR] = useState<EMRDetailsData | null>(null);
  const [loadingEMR, setLoadingEMR] = useState(false);

  // Load User & Doctors and set default doctor selection BEFORE queue fetch
  useEffect(() => {
    const initPage = async () => {
      let savedUser: any = null;
      const saved = localStorage.getItem('hms_user');
      if (saved) {
        savedUser = JSON.parse(saved);
        setCurrentUser(savedUser);
      }

      let defaultDocId = 'all';
      try {
        const res = await api.get('/doctors', { params: { limit: 100 } });
        const fetchedDocs: DoctorItem[] = res.data?.data?.doctors || [];
        setDoctors(fetchedDocs);

        if (savedUser) {
          const matchDoc = fetchedDocs.find(
            (d) =>
              (d.userId && d.userId === savedUser.id) ||
              d.lastName?.toLowerCase().includes('iqbal') ||
              d.firstName?.toLowerCase().includes('zafar')
          );
          if (matchDoc) {
            defaultDocId = matchDoc.id;
          }
        }
      } catch (err) {
        console.error('Failed to load doctors list', err);
      } finally {
        setSelectedDoctorId(defaultDocId);
        setIsInitialized(true);
      }
    };

    initPage();
  }, []);

  const loadQueue = useCallback(async () => {
    if (!isInitialized) return;
    try {
      setLoading(true);
      const res = await getTodayQueueApi({
        doctorId: selectedDoctorId === 'all' ? undefined : selectedDoctorId,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery.trim() || undefined,
      });

      setQueue(res.queue);
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load today queue:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDoctorId, statusFilter, searchQuery, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      loadQueue();
    }
  }, [loadQueue, isInitialized]);


  const handleOpenEMR = async (visitId: string) => {
    try {
      setLoadingEMR(true);
      const data = await getEMRDetailsApi(visitId);
      setSelectedEMR(data);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to open patient EMR');
    } finally {
      setLoadingEMR(false);
    }
  };

  const handleQuickStatusChange = async (visitId: string, newStatus: VisitStatus) => {
    try {
      await updateVisitStatusApi(visitId, { status: newStatus });
      loadQueue();
      if (selectedEMR && selectedEMR.visit.id === visitId) {
        const updatedEMR = await getEMRDetailsApi(visitId);
        setSelectedEMR(updatedEMR);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update queue status');
    }
  };

  const isSuperAdmin = currentUser?.roles?.includes('Super Admin');
  const isDoctor = currentUser?.roles?.includes('Doctor');

  return (
    <PermissionGuard permission={Permission.ACCESS_CLINICAL}>
      <div className="space-y-6">
        {/* Dashboard Content (hidden during EMR print) */}
        <div className="no-print space-y-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-teal-600" />
                <span>Doctor OPD Queue & Clinical EHR</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Select a patient from today's assigned queue to open their medical chart and manage encounters.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Doctor Filter (Visible to Super Admin / Staff) */}
              {(isSuperAdmin || !isDoctor) && (
                <div className="flex items-center gap-2 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700">Queue For:</span>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="text-xs font-bold text-teal-700 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Doctors</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.firstName} {d.lastName} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={loadQueue}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Queue</span>
              </button>
            </div>
          </div>

          {/* Queue Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div
              onClick={() => setStatusFilter('ALL')}
              className={`cursor-pointer p-4 rounded-xl border transition shadow-sm ${
                statusFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-teal-500' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-xs font-semibold block text-slate-400">Total Today</span>
              <span className="text-2xl font-black">{summary.total}</span>
            </div>

            <div
              onClick={() => setStatusFilter(VisitStatus.WAITING)}
              className={`cursor-pointer p-4 rounded-xl border transition shadow-sm ${
                statusFilter === VisitStatus.WAITING ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-400' : 'bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold block">Waiting</span>
                <Clock className="h-4 w-4 opacity-75" />
              </div>
              <span className="text-2xl font-black">{summary.waiting}</span>
            </div>

            <div
              onClick={() => setStatusFilter(VisitStatus.WITH_DOCTOR)}
              className={`cursor-pointer p-4 rounded-xl border transition shadow-sm ${
                statusFilter === VisitStatus.WITH_DOCTOR ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-400' : 'bg-indigo-50/60 border-indigo-200 text-indigo-900 hover:bg-indigo-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold block">With Doctor</span>
                <Activity className="h-4 w-4 opacity-75" />
              </div>
              <span className="text-2xl font-black">{summary.withDoctor}</span>
            </div>

            <div
              onClick={() => setStatusFilter(VisitStatus.COMPLETED)}
              className={`cursor-pointer p-4 rounded-xl border transition shadow-sm ${
                statusFilter === VisitStatus.COMPLETED ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400' : 'bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold block">Completed</span>
                <CheckCircle2 className="h-4 w-4 opacity-75" />
              </div>
              <span className="text-2xl font-black">{summary.completed}</span>
            </div>

            <div
              onClick={() => setStatusFilter(VisitStatus.CANCELLED)}
              className={`cursor-pointer p-4 rounded-xl border transition shadow-sm ${
                statusFilter === VisitStatus.CANCELLED ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-400' : 'bg-red-50/60 border-red-200 text-red-900 hover:bg-red-100/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold block">Cancelled</span>
                <XCircle className="h-4 w-4 opacity-75" />
              </div>
              <span className="text-2xl font-black">{summary.cancelled}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search queue by Patient Name, MR Number, or Mobile Phone..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
            />
          </div>

          {/* Doctor OPD Queue Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-xl border border-slate-200"></div>
              ))}
            </div>
          ) : queue.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Patients in Queue</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                There are currently no patients matching your queue filters for today.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {queue.map((v) => (
                <div
                  key={v.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  {/* Card Top: Token & Status */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-900 text-teal-400 font-mono font-black text-base px-3 py-1 rounded-lg border border-slate-800 shadow-inner">
                        Q-{String(v.tokenNumber).padStart(3, '0')}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{v.patientName}</h3>
                        <p className="text-[11px] font-mono text-slate-500">{v.patientMrNumber}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      v.status === VisitStatus.WAITING ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      v.status === VisitStatus.WITH_DOCTOR ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                      v.status === VisitStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Patient Demographics & Complaint */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex flex-wrap items-center gap-4 text-[11px]">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {v.patientAge ? `${v.patientAge} Y` : 'Age N/A'} • {v.patientGender}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-mono">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {v.patientPhone}
                      </span>
                      <span className="text-slate-500 font-medium ml-auto">
                        Assigned: <strong className="text-slate-800">{v.doctorName}</strong>
                      </span>
                    </div>

                    {v.chiefComplaint && (
                      <div className="bg-amber-50/70 border border-amber-200/60 p-2 rounded text-amber-900 text-[11px]">
                        <strong className="font-semibold text-amber-950">Chief Complaint:</strong> {v.chiefComplaint}
                      </div>
                    )}

                    {/* Vitals Summary Line */}
                    {(v.bloodPressure || v.temperature || v.pulse || v.weight) && (
                      <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded flex items-center gap-3 text-[10px] font-medium text-slate-600">
                        {v.temperature && <span>Temp: <strong className="text-slate-800">{v.temperature}</strong></span>}
                        {v.pulse && <span>Pulse: <strong className="text-slate-800">{v.pulse}</strong></span>}
                        {v.bloodPressure && <span>BP: <strong className="text-slate-800">{v.bloodPressure}</strong></span>}
                        {v.weight && <span>Wt: <strong className="text-slate-800">{v.weight}</strong></span>}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <button
                      onClick={() => handleOpenEMR(v.id)}
                      disabled={loadingEMR}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow transition"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Open Patient EMR</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {v.status === VisitStatus.WAITING && (
                        <button
                          onClick={() => handleQuickStatusChange(v.id, VisitStatus.WITH_DOCTOR)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold rounded border border-indigo-200 transition"
                        >
                          Start Visit
                        </button>
                      )}
                      {v.status !== VisitStatus.COMPLETED && (
                        <button
                          onClick={() => handleQuickStatusChange(v.id, VisitStatus.COMPLETED)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded border border-emerald-200 transition"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* EMR Modal View (Rendered OUTSIDE no-print wrapper) */}
        {selectedEMR && (
          <EMRScreen
            emrData={selectedEMR}
            onClose={() => setSelectedEMR(null)}
            onStatusUpdated={loadQueue}
          />
        )}

      </div>
    </PermissionGuard>
  );
}


