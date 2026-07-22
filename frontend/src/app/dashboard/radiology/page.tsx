'use client';

import React, { useState, useEffect } from 'react';
import {
  getRadiologyQueueApi,
  getRadiologyReportByOrderIdApi,
  saveRadiologyReportApi,
  RadiologyOrderQueueItem,
  RadiologyQueueSummary,
  RadiologyReportStatus,
  RadiologyServiceType,
} from '../../../lib/radiology';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import {
  FileText,
  Clock,
  CheckCircle2,
  Search,
  RefreshCw,
  FileEdit,
  X,
  Save,
  Activity,
  Zap,
  Layers,
} from 'lucide-react';

interface ReportPreset {
  title: string;
  serviceType: RadiologyServiceType;
  findings: string;
  impression: string;
  recommendation?: string;
}

const IMAGING_PRESETS: ReportPreset[] = [
  {
    title: 'Normal Chest X-Ray',
    serviceType: RadiologyServiceType.XRAY,
    findings: 'Lungs are clear bilaterally with no focal infiltrates, consolidation, or pleural effusion. Cardiomediastinal silhouette is within normal limits. Both costophrenic angles are clear and sharp. Osseous structures and soft tissues of the thoracic cage are intact.',
    impression: 'Normal chest radiograph (PA view). No acute cardiopulmonary pathology.',
  },
  {
    title: 'Normal Abdomen X-Ray',
    serviceType: RadiologyServiceType.XRAY,
    findings: 'Normal abdominal bowel gas pattern without abnormal dilatation or air-fluid levels. No free subdiaphragmatic air visualized. Bilateral psoas shadows and flank stripes are preserved. No radiopaque urinary or biliary calculi identified.',
    impression: 'Unremarkable plain abdominal radiograph (Erect/Plain).',
  },
  {
    title: 'Normal Abdomen & Pelvis USG',
    serviceType: RadiologyServiceType.ULTRASOUND,
    findings: 'Liver is normal in size and echotexture with no focal lesion. Gallbladder is well distended, thin-walled, and acalculous. Spleen and pancreas are normal. Both kidneys demonstrate normal corticomedullary differentiation without hydronephrosis or renal calculi. Urinary bladder is well distended with smooth mucosal margins.',
    impression: 'Normal sonographic examination of the abdomen and pelvis.',
  },
  {
    title: 'Normal KUB Ultrasound',
    serviceType: RadiologyServiceType.ULTRASOUND,
    findings: 'Right and left kidneys show normal size, outline, and cortical echogenicity. No renal calculus, mass, or hydronephrosis identified. Ureters non-dilated. Urinary bladder is well filled with smooth walls and minimal post-void residual volume.',
    impression: 'Unremarkable sonogram of Kidneys, Ureters, and Bladder (KUB).',
  },
];

export default function RadiologyDashboardPage() {
  const [summary, setSummary] = useState<RadiologyQueueSummary>({
    pendingCount: 0,
    inProgressCount: 0,
    completedTodayCount: 0,
    orders: [],
  });
  const [activeStatusTab, setActiveStatusTab] = useState<string>('PENDING');
  const [activeServiceType, setActiveServiceType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order for Report Entry
  const [activeOrder, setActiveOrder] = useState<RadiologyOrderQueueItem | null>(null);
  const [examination, setExamination] = useState('');
  const [serviceType, setServiceType] = useState<RadiologyServiceType>(RadiologyServiceType.XRAY);
  const [clinicalFindings, setClinicalFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [savingReport, setSavingReport] = useState(false);
  const [existingStatus, setExistingStatus] = useState<RadiologyReportStatus | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      const data = await getRadiologyQueueApi(activeStatusTab, activeServiceType, searchQuery);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load radiology queue', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [activeStatusTab, activeServiceType, searchQuery]);

  const handleOpenReportModal = async (order: RadiologyOrderQueueItem) => {
    setActiveOrder(order);
    setExamination(order.procedureName);
    setServiceType(
      order.modality === 'ULTRASOUND'
        ? RadiologyServiceType.ULTRASOUND
        : order.modality === 'CT'
        ? RadiologyServiceType.CT
        : order.modality === 'MRI'
        ? RadiologyServiceType.MRI
        : RadiologyServiceType.XRAY
    );
    setClinicalFindings('');
    setImpression('');
    setRecommendation('');
    setTechnicianNotes('');
    setExistingStatus(null);

    try {
      const existing = await getRadiologyReportByOrderIdApi(order.id);
      if (existing) {
        setExistingStatus(existing.status);
        setExamination(existing.examination);
        setServiceType(existing.serviceType);
        setClinicalFindings(existing.clinicalFindings);
        setImpression(existing.impression);
        setRecommendation(existing.recommendation || '');
        setTechnicianNotes(existing.technicianNotes || '');
      }
    } catch (err) {
      console.error('No existing report found');
    }
  };

  const handleCloseReportModal = () => {
    setActiveOrder(null);
  };

  const handleApplyPreset = (preset: ReportPreset) => {
    setClinicalFindings(preset.findings);
    setImpression(preset.impression);
    if (preset.recommendation) setRecommendation(preset.recommendation);
  };

  const handleSaveReport = async (status: RadiologyReportStatus) => {
    if (!activeOrder) return;
    if (clinicalFindings.trim().length === 0 || impression.trim().length === 0) {
      alert('Please fill out both Clinical Findings and Impression before saving.');
      return;
    }

    try {
      setSavingReport(true);
      await saveRadiologyReportApi({
        radiologyOrderId: activeOrder.id,
        visitId: activeOrder.visitId,
        patientId: activeOrder.patientId,
        serviceType,
        examination: examination || activeOrder.procedureName,
        clinicalFindings,
        impression,
        recommendation: recommendation || null,
        technicianNotes: technicianNotes || null,
        status,
      });

      setToastMsg(
        `Radiology report ${status === RadiologyReportStatus.COMPLETED ? 'finalized & released' : 'saved as draft'}!`
      );
      setTimeout(() => setToastMsg(''), 4000);

      handleCloseReportModal();
      await loadQueue();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save radiology report.');
    } finally {
      setSavingReport(false);
    }
  };

  return (
    <PermissionGuard permission={Permission.ACCESS_RADIOLOGY}>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Radiology PACS & Diagnostic Imaging
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Process X-Ray & Ultrasound diagnostic scans, record structured findings, and release official imaging reports.
              </p>
            </div>
          </div>

          <button
            onClick={loadQueue}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh PACS Queue</span>
          </button>
        </div>

        {toastMsg && (
          <div className="bg-emerald-500 text-white text-center text-xs font-bold py-2 rounded-lg shadow">
            {toastMsg}
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Imaging Orders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.pendingCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Awaiting scan acquisition</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.inProgressCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Draft reports in entry</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
              <FileEdit className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Completed Today</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.completedTodayCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Finalized radiology reports</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Queue Table Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-100 pb-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto">
              <div className="flex items-center gap-1">
                {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveStatusTab(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition uppercase tracking-wider ${
                      activeStatusTab === tab
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="h-4 w-[1px] bg-slate-300 hidden sm:block" />

              {/* Service Type Filter */}
              <div className="flex items-center gap-1">
                {['ALL', 'XRAY', 'ULTRASOUND'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setActiveServiceType(st)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded border transition ${
                      activeServiceType === st
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-extrabold'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'ALL' ? 'All Imaging' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, MRN, procedure..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Imaging Orders Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
              <span>Loading imaging scans queue...</span>
            </div>
          ) : summary.orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No radiology imaging orders found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-3 px-3">Token & Date</th>
                    <th className="py-3 px-3">Patient Info</th>
                    <th className="py-3 px-3">Modality & Procedure</th>
                    <th className="py-3 px-3">Ordering Doctor</th>
                    <th className="py-3 px-3">Urgency</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          Q-#{String(ord.tokenNumber).padStart(3, '0')}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{ord.patientName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">MRN: {ord.patientMrNumber} ({ord.patientAge ? `${ord.patientAge}Y` : 'N/A'} / {ord.patientGender})</p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {ord.modality}
                          </span>
                          <span className="font-bold text-slate-800">{ord.procedureName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-700">
                        {ord.doctorName}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          ord.urgency === 'STAT' || ord.urgency === 'EMERGENCY' ? 'bg-red-100 text-red-700 border border-red-200' :
                          ord.urgency === 'URGENT' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {ord.urgency}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          ord.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          ord.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                          ord.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {ord.status === 'COMPLETED' ? (
                          <button
                            onClick={() => handleOpenReportModal(ord)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded border border-emerald-200 transition flex items-center gap-1.5 ml-auto"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span>View Report</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenReportModal(ord)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5 ml-auto"
                          >
                            <FileEdit className="h-3.5 w-3.5" />
                            <span>{ord.status === 'IN_PROGRESS' ? 'Edit Draft' : 'Write Report'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* Structured Radiology Report Entry Modal Overlay */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 my-auto">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Radiology Imaging Diagnostic Report
                  </h3>
                  <p className="text-xs text-slate-400">
                    Procedure: <strong className="text-indigo-300">{activeOrder.procedureName}</strong> ({activeOrder.modality})
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseReportModal}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Patient Info Header Box */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                <span className="font-bold text-slate-900">{activeOrder.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">MR Number</span>
                <span className="font-mono font-semibold text-slate-800">{activeOrder.patientMrNumber}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ordering Doctor</span>
                <span className="font-semibold text-slate-800">{activeOrder.doctorName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Modality / Date</span>
                <span className="font-bold text-indigo-800">{activeOrder.modality} ({new Date(activeOrder.createdAt).toLocaleDateString()})</span>
              </div>
            </div>

            {/* Report Form Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[65vh]">
              
              {/* Quick Presets */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Quick Imaging Report Presets:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {IMAGING_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      disabled={existingStatus === RadiologyReportStatus.COMPLETED}
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded border border-indigo-200 transition disabled:opacity-50"
                    >
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service & Examination Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Service Type</label>
                  <select
                    value={serviceType}
                    disabled={existingStatus === RadiologyReportStatus.COMPLETED}
                    onChange={(e) => setServiceType(e.target.value as RadiologyServiceType)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value={RadiologyServiceType.XRAY}>X-Ray Radiography</option>
                    <option value={RadiologyServiceType.ULTRASOUND}>Ultrasound Sonography</option>
                    <option value={RadiologyServiceType.CT}>CT Scan</option>
                    <option value={RadiologyServiceType.MRI}>MRI Scan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Examination Title</label>
                  <input
                    type="text"
                    value={examination}
                    disabled={existingStatus === RadiologyReportStatus.COMPLETED}
                    onChange={(e) => setExamination(e.target.value)}
                    placeholder="e.g. Chest X-Ray PA View"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Clinical Findings */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Clinical Findings <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={clinicalFindings}
                  disabled={existingStatus === RadiologyReportStatus.COMPLETED}
                  onChange={(e) => setClinicalFindings(e.target.value)}
                  placeholder="Describe detailed radiological observation, tissue structure, densities, or organ measurements..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded text-xs font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Impression */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Radiological Impression / Conclusion <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={impression}
                  disabled={existingStatus === RadiologyReportStatus.COMPLETED}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="Summary diagnostic conclusion..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-xs font-black text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Recommendation & Technician Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Radiologist Recommendation</label>
                  <textarea
                    rows={2}
                    value={recommendation}
                    disabled={existingStatus === RadiologyReportStatus.COMPLETED}
                    onChange={(e) => setRecommendation(e.target.value)}
                    placeholder="e.g. Follow-up ultrasound after 4 weeks recommended..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Internal Technician Notes</label>
                  <textarea
                    rows={2}
                    value={technicianNotes}
                    disabled={existingStatus === RadiologyReportStatus.COMPLETED}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    placeholder="e.g. Scan acquired on Mindray DC-70 machine..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleCloseReportModal}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition"
              >
                Close Window
              </button>

              {existingStatus !== RadiologyReportStatus.COMPLETED && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveReport(RadiologyReportStatus.IN_PROGRESS)}
                    disabled={savingReport}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingReport ? 'Saving...' : 'Save Draft (In Progress)'}</span>
                  </button>

                  <button
                    onClick={() => handleSaveReport(RadiologyReportStatus.COMPLETED)}
                    disabled={savingReport}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{savingReport ? 'Finalizing...' : 'Finalize & Release Report'}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </PermissionGuard>
  );
}
