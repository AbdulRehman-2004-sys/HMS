'use client';

import React, { useState, useEffect } from 'react';
import {
  getLabQueueApi,
  getLabReportByOrderIdApi,
  saveLabReportApi,
  LabOrderQueueItem,
  LabQueueSummary,
  LabReportItem,
  LabReportStatus,
} from '../../../lib/lab';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';


import {
  FlaskConical,
  Clock,
  CheckCircle2,
  Search,
  RefreshCw,
  FileEdit,
  Plus,
  Trash2,
  X,
  Save,
  Check,
  AlertTriangle,
  FileText,
  User,
  Activity,
} from 'lucide-react';

const COMMON_PRESETS: Record<string, LabReportItem[]> = {
  'CBC / Blood CP': [
    { parameterName: 'Hemoglobin (Hb)', resultValue: '13.5', unit: 'g/dL', referenceRange: '12.0 - 16.5', isAbnormal: false },
    { parameterName: 'TLC / WBC Count', resultValue: '8,200', unit: '/cmm', referenceRange: '4,000 - 11,000', isAbnormal: false },
    { parameterName: 'Platelet Count', resultValue: '260,000', unit: '/cmm', referenceRange: '150,000 - 450,000', isAbnormal: false },
    { parameterName: 'Hematocrit (HCT)', resultValue: '41.2', unit: '%', referenceRange: '37.0 - 48.0', isAbnormal: false },
    { parameterName: 'Neutrophils', resultValue: '62', unit: '%', referenceRange: '40 - 75', isAbnormal: false },
    { parameterName: 'Lymphocytes', resultValue: '30', unit: '%', referenceRange: '20 - 45', isAbnormal: false },
  ],
  'LFT (Liver Function Test)': [
    { parameterName: 'Serum Bilirubin Total', resultValue: '0.8', unit: 'mg/dL', referenceRange: '0.2 - 1.2', isAbnormal: false },
    { parameterName: 'ALT / SGPT', resultValue: '32', unit: 'U/L', referenceRange: '7 - 56', isAbnormal: false },
    { parameterName: 'AST / SGOT', resultValue: '28', unit: 'U/L', referenceRange: '10 - 40', isAbnormal: false },
    { parameterName: 'Alkaline Phosphatase (ALP)', resultValue: '85', unit: 'U/L', referenceRange: '44 - 147', isAbnormal: false },
  ],
  'RFT (Renal Function Test)': [
    { parameterName: 'Serum Creatinine', resultValue: '0.9', unit: 'mg/dL', referenceRange: '0.6 - 1.2', isAbnormal: false },
    { parameterName: 'Blood Urea', resultValue: '26', unit: 'mg/dL', referenceRange: '15 - 45', isAbnormal: false },
    { parameterName: 'Uric Acid', resultValue: '5.2', unit: 'mg/dL', referenceRange: '3.5 - 7.2', isAbnormal: false },
  ],
  'Fasting Blood Sugar (FBS)': [
    { parameterName: 'Fasting Blood Glucose', resultValue: '95', unit: 'mg/dL', referenceRange: '70 - 100', isAbnormal: false },
  ],
  'Urine Routine Examination (R/E)': [
    { parameterName: 'Color & Appearance', resultValue: 'Pale Yellow / Clear', unit: '', referenceRange: 'Pale Yellow', isAbnormal: false },
    { parameterName: 'Reaction (pH)', resultValue: '6.0', unit: 'pH', referenceRange: '4.6 - 8.0', isAbnormal: false },
    { parameterName: 'Protein / Albumin', resultValue: 'Nil', unit: '', referenceRange: 'Nil', isAbnormal: false },
    { parameterName: 'Sugar / Glucose', resultValue: 'Nil', unit: '', referenceRange: 'Nil', isAbnormal: false },
    { parameterName: 'Pus Cells (WBCs)', resultValue: '1 - 2', unit: '/HPF', referenceRange: '0 - 5', isAbnormal: false },
  ],
};

export default function LabDashboardPage() {
  const [summary, setSummary] = useState<LabQueueSummary>({
    pendingCount: 0,
    inProgressCount: 0,
    completedTodayCount: 0,
    orders: [],
  });
  const [activeStatusTab, setActiveStatusTab] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order for Report Writing
  const [activeOrder, setActiveOrder] = useState<LabOrderQueueItem | null>(null);
  const [reportItems, setReportItems] = useState<LabReportItem[]>([]);
  const [overallRemarks, setOverallRemarks] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [savingReport, setSavingReport] = useState(false);
  const [existingStatus, setExistingStatus] = useState<LabReportStatus | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      const data = await getLabQueueApi(activeStatusTab, searchQuery);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load lab queue', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [activeStatusTab, searchQuery]);

  const handleOpenReportModal = async (order: LabOrderQueueItem) => {
    setActiveOrder(order);
    setOverallRemarks('');
    setTechnicianNotes('');
    setExistingStatus(null);

    try {
      const existing = await getLabReportByOrderIdApi(order.id);
      if (existing) {
        setExistingStatus(existing.status);
        setOverallRemarks(existing.overallRemarks || '');
        setTechnicianNotes(existing.technicianNotes || '');
        setReportItems(existing.items || []);
      } else {
        // Load default preset if matching test name
        const defaultPreset = COMMON_PRESETS[order.testName] || [
          { parameterName: order.testName, resultValue: '', unit: '', referenceRange: '', isAbnormal: false }
        ];
        setReportItems(defaultPreset);
      }
    } catch (err) {
      const defaultPreset = COMMON_PRESETS[order.testName] || [
        { parameterName: order.testName, resultValue: '', unit: '', referenceRange: '', isAbnormal: false }
      ];
      setReportItems(defaultPreset);
    }
  };

  const handleCloseReportModal = () => {
    setActiveOrder(null);
    setReportItems([]);
  };

  const handleItemChange = (index: number, field: keyof LabReportItem, value: any) => {
    const updated = [...reportItems];
    updated[index] = { ...updated[index], [field]: value };
    setReportItems(updated);
  };

  const handleAddParameterRow = () => {
    setReportItems([
      ...reportItems,
      { parameterName: '', resultValue: '', unit: '', referenceRange: '', isAbnormal: false },
    ]);
  };

  const handleRemoveParameterRow = (index: number) => {
    setReportItems(reportItems.filter((_, i) => i !== index));
  };

  const handleApplyPreset = (presetName: string) => {
    const preset = COMMON_PRESETS[presetName];
    if (preset) {
      setReportItems(preset);
    }
  };

  const handleSaveReport = async (status: LabReportStatus) => {
    if (!activeOrder) return;
    const validItems = reportItems.filter((i) => i.parameterName.trim().length > 0 && i.resultValue.trim().length > 0);

    if (validItems.length === 0) {
      alert('Please enter at least one valid parameter name and result value.');
      return;
    }

    try {
      setSavingReport(true);
      await saveLabReportApi({
        labOrderId: activeOrder.id,
        visitId: activeOrder.visitId,
        patientId: activeOrder.patientId,
        technicianNotes,
        overallRemarks,
        status,
        items: validItems,
      });

      setToastMsg(`Laboratory report ${status === LabReportStatus.COMPLETED ? 'finalized & completed' : 'saved as draft'}!`);
      setTimeout(() => setToastMsg(''), 4000);

      handleCloseReportModal();
      await loadQueue();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save laboratory report.');
    } finally {
      setSavingReport(false);
    }
  };

  return (
    <PermissionGuard permission={Permission.ACCESS_LAB}>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">

        
        {/* Header & Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/10 text-teal-600 rounded-xl border border-teal-500/20">
              <FlaskConical className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Laboratory Department Workspace
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Process diagnostic test orders, enter parameter results, and release completed lab reports.
              </p>
            </div>
          </div>

          <button
            onClick={loadQueue}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
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
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Orders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.pendingCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Awaiting sample testing</p>
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
              <p className="text-[11px] text-slate-500 mt-0.5">Final reports released</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Queue Table Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-100 pb-4">
            
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
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

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name, MRN, test..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Orders Queue Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-teal-600" />
              <span>Loading laboratory orders queue...</span>
            </div>
          ) : summary.orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No laboratory diagnostic orders found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-3 px-3">Token & Date</th>
                    <th className="py-3 px-3">Patient Info</th>
                    <th className="py-3 px-3">Test Ordered</th>
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
                        <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          Q-#{String(ord.tokenNumber).padStart(3, '0')}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{ord.patientName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">MRN: {ord.patientMrNumber} ({ord.patientAge ? `${ord.patientAge}Y` : 'N/A'} / {ord.patientGender})</p>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800">{ord.testName}</span>
                        <span className="text-[10px] text-slate-500 block font-medium">({ord.category})</span>
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
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5 ml-auto"
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

      {/* Structured Lab Report Entry Modal Overlay */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 my-auto">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Laboratory Diagnostic Report Entry
                  </h3>
                  <p className="text-xs text-slate-400">
                    Order: <strong className="text-teal-300">{activeOrder.testName}</strong> ({activeOrder.category})
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

            {/* Patient & Order Details Header Box */}
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
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Urgency / Date</span>
                <span className="font-bold text-teal-800">{activeOrder.urgency} ({new Date(activeOrder.createdAt).toLocaleDateString()})</span>
              </div>
            </div>

            {/* Parameter Entry Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[65vh]">
              
              {/* Presets Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Quick Test Parameter Presets:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Object.keys(COMMON_PRESETS).map((pName) => (
                    <button
                      key={pName}
                      onClick={() => handleApplyPreset(pName)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded border border-indigo-200 transition"
                    >
                      + {pName.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Structured Parameter Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Test Parameter Results ({reportItems.length})</h4>
                  {existingStatus !== LabReportStatus.COMPLETED && (
                    <button
                      onClick={handleAddParameterRow}
                      className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded border border-teal-200 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Parameter</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {reportItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                      
                      {/* Parameter Name */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Parameter Name</label>
                        <input
                          type="text"
                          value={item.parameterName}
                          disabled={existingStatus === LabReportStatus.COMPLETED}
                          onChange={(e) => handleItemChange(idx, 'parameterName', e.target.value)}
                          placeholder="e.g. Hemoglobin (Hb)"
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      {/* Result Value */}
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Result Value</label>
                        <input
                          type="text"
                          value={item.resultValue}
                          disabled={existingStatus === LabReportStatus.COMPLETED}
                          onChange={(e) => handleItemChange(idx, 'resultValue', e.target.value)}
                          placeholder="e.g. 13.5"
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs font-black text-slate-900 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      {/* Unit */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Unit</label>
                        <input
                          type="text"
                          value={item.unit || ''}
                          disabled={existingStatus === LabReportStatus.COMPLETED}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          placeholder="e.g. g/dL"
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none"
                        />
                      </div>

                      {/* Reference Range */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Ref. Range</label>
                        <input
                          type="text"
                          value={item.referenceRange || ''}
                          disabled={existingStatus === LabReportStatus.COMPLETED}
                          onChange={(e) => handleItemChange(idx, 'referenceRange', e.target.value)}
                          placeholder="e.g. 12.0 - 16.5"
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs focus:outline-none"
                        />
                      </div>

                      {/* Abnormal Flag & Remove */}
                      <div className="sm:col-span-2 flex items-center justify-between pt-3">
                        <label className="flex items-center gap-1 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.isAbnormal || false}
                            disabled={existingStatus === LabReportStatus.COMPLETED}
                            onChange={(e) => handleItemChange(idx, 'isAbnormal', e.target.checked)}
                            className="h-3.5 w-3.5 text-red-600 rounded cursor-pointer"
                          />
                          <span className={`text-[10px] font-bold uppercase ${item.isAbnormal ? 'text-red-600' : 'text-slate-500'}`}>
                            Abnormal
                          </span>
                        </label>

                        {existingStatus !== LabReportStatus.COMPLETED && (
                          <button
                            onClick={() => handleRemoveParameterRow(idx)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Remove Parameter"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Remarks & Technician Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Overall Diagnostic Remarks</label>
                  <textarea
                    rows={2}
                    value={overallRemarks}
                    disabled={existingStatus === LabReportStatus.COMPLETED}
                    onChange={(e) => setOverallRemarks(e.target.value)}
                    placeholder="e.g. Mild anemia noted. Repeat CBC after 2 weeks recommended..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Internal Technician Notes</label>
                  <textarea
                    rows={2}
                    value={technicianNotes}
                    disabled={existingStatus === LabReportStatus.COMPLETED}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    placeholder="e.g. Sample verified on Sysmex XN-550 analyzer..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleCloseReportModal}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition"
              >
                Close Window
              </button>

              {existingStatus !== LabReportStatus.COMPLETED && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveReport(LabReportStatus.IN_PROGRESS)}
                    disabled={savingReport}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingReport ? 'Saving...' : 'Save Draft (In Progress)'}</span>
                  </button>

                  <button
                    onClick={() => handleSaveReport(LabReportStatus.COMPLETED)}
                    disabled={savingReport}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{savingReport ? 'Finalizing...' : 'Finalize & Complete Report'}</span>
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
