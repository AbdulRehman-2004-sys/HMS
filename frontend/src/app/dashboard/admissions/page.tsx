'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdmissionsSummaryApi,
  admitPatientApi,
  dischargePatientApi,
  AdmissionsSummaryData,
  PendingAdmissionOrderData,
  AdmissionRecordData,
  AdmissionStatus,
} from '../../../lib/admissions';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import {
  Bed,
  Clock,
  CheckCircle2,
  Search,
  RefreshCw,
  Plus,
  UserCheck,
  LogOut,
  X,
  Building,
  DollarSign,
  FileText,
  AlertCircle,
} from 'lucide-react';

const ROOM_PRESETS = [
  'General Male Ward - Bed 01',
  'General Male Ward - Bed 02',
  'General Female Ward - Bed 01',
  'Private Room 101 (Deluxe)',
  'Private Room 102 (Standard)',
  'VIP Suite Room 201',
  'ICU - Bed 01 (STAT)',
  'CCU - Bed 01 (STAT)',
];

export default function AdmissionsDashboardPage() {
  const [summary, setSummary] = useState<AdmissionsSummaryData>({
    pendingOrdersCount: 0,
    activeAdmissionsCount: 0,
    dischargedCount: 0,
    pendingOrders: [],
    activeAdmissions: [],
    dischargedAdmissions: [],
  });
  const [activeTab, setActiveTab] = useState<string>('PENDING_ORDERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Admit Modal State
  const [activeOrderToAdmit, setActiveOrderToAdmit] = useState<PendingAdmissionOrderData | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomCharges, setRoomCharges] = useState<string>('5000');
  const [notes, setNotes] = useState('');

  const [submittingAdmit, setSubmittingAdmit] = useState(false);

  // Discharge Modal State
  const [activeAdmissionToDischarge, setActiveAdmissionToDischarge] = useState<AdmissionRecordData | null>(null);
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [submittingDischarge, setSubmittingDischarge] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const data = await getAdmissionsSummaryApi(searchQuery);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load admissions summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [searchQuery]);

  const handleOpenAdmitModal = (order: PendingAdmissionOrderData) => {
    setActiveOrderToAdmit(order);
    const defaultRoom = order.recommendedWard ? order.recommendedWard.replace('_', ' ') : 'General Ward Bed 01';
    setRoomName(defaultRoom);
    setRoomCharges('5000'); // Default Rs. 5000 as per ticket rule
    setNotes('');
  };


  const handleConfirmAdmit = async () => {
    if (!activeOrderToAdmit) return;
    if (roomName.trim().length === 0) {
      alert('Please select or enter a valid room/ward name.');
      return;
    }

    try {
      setSubmittingAdmit(true);
      await admitPatientApi({
        admissionOrderId: activeOrderToAdmit.id,
        visitId: activeOrderToAdmit.visitId,
        patientId: activeOrderToAdmit.patientId,
        roomName,
        roomCharges: Number(roomCharges),
        notes: notes || null,
      });

      setToastMsg(`Patient ${activeOrderToAdmit.patientName} admitted to ${roomName}! Room charge (Rs. ${roomCharges}) posted to bill.`);
      setTimeout(() => setToastMsg(''), 5000);

      setActiveOrderToAdmit(null);
      await loadSummary();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to admit patient.');
    } finally {
      setSubmittingAdmit(false);
    }
  };

  const handleConfirmDischarge = async () => {
    if (!activeAdmissionToDischarge) return;

    try {
      setSubmittingDischarge(true);
      await dischargePatientApi(activeAdmissionToDischarge.id, {
        notes: dischargeNotes || null,
      });

      setToastMsg(`Patient ${activeAdmissionToDischarge.patientName} discharged successfully from ${activeAdmissionToDischarge.roomName}!`);
      setTimeout(() => setToastMsg(''), 5000);

      setActiveAdmissionToDischarge(null);
      setDischargeNotes('');
      await loadSummary();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to discharge patient.');
    } finally {
      setSubmittingDischarge(false);
    }
  };

  return (
    <PermissionGuard permission={Permission.ACCESS_RECEPTION}>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <Bed className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Inpatient Patient Admissions
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Process doctor admission orders, assign room allocations, set Rs. 5000 room charges, and manage discharges.
              </p>
            </div>
          </div>

          <button
            onClick={loadSummary}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {toastMsg && (
          <div className="bg-emerald-500 text-white text-center text-xs font-bold py-2.5 rounded-lg shadow">
            {toastMsg}
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Admission Orders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.pendingOrdersCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Recommended by doctors</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <Clock className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Active Admitted Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.activeAdmissionsCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Currently occupying rooms</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
              <Bed className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Discharged Patients</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.dischargedCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Successfully completed stay</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Content Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-100 pb-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { key: 'PENDING_ORDERS', label: `Pending Orders (${summary.pendingOrdersCount})` },
                { key: 'ACTIVE_ADMISSIONS', label: `Active Inpatients (${summary.activeAdmissionsCount})` },
                { key: 'DISCHARGED', label: `Discharged (${summary.dischargedCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg transition tracking-wide ${
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, MRN..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* TAB 1: PENDING ORDERS */}
          {activeTab === 'PENDING_ORDERS' && (
            <div>
              {isLoading ? (
                <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-amber-600" />
                  <span>Loading pending admission orders...</span>
                </div>
              ) : summary.pendingOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No pending doctor admission orders waiting for reception check-in.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-3 px-3">Token & Date</th>
                        <th className="py-3 px-3">Patient Info</th>
                        <th className="py-3 px-3">Recommended Ward</th>
                        <th className="py-3 px-3">Priority</th>
                        <th className="py-3 px-3">Doctor</th>
                        <th className="py-3 px-3">Provisional Diagnosis</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.pendingOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono">
                            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Q-#{String(ord.tokenNumber).padStart(3, '0')}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{ord.patientName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">MRN: {ord.patientMrNumber} ({ord.patientAge ? `${ord.patientAge}Y` : 'N/A'} / {ord.patientGender})</p>
                          </td>

                          <td className="py-3 px-3 font-bold text-slate-800">
                            {ord.recommendedWard.replace('_', ' ')}
                          </td>

                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              ord.admissionType === 'EMERGENCY' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {ord.admissionType}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-medium text-slate-700">
                            {ord.doctorName}
                          </td>

                          <td className="py-3 px-3 italic text-slate-600">
                            {ord.provisionalDiagnosis || 'Under Investigation'}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleOpenAdmitModal(ord)}
                              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5 ml-auto"
                            >
                              <Bed className="h-3.5 w-3.5" />
                              <span>Admit Patient</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE ADMISSIONS */}
          {activeTab === 'ACTIVE_ADMISSIONS' && (
            <div>
              {isLoading ? (
                <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                  <span>Loading active inpatients...</span>
                </div>
              ) : summary.activeAdmissions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No active inpatients currently admitted in rooms/wards.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-3 px-3">Admission #</th>
                        <th className="py-3 px-3">Patient Info</th>
                        <th className="py-3 px-3">Assigned Room / Ward</th>
                        <th className="py-3 px-3">Room Charge</th>
                        <th className="py-3 px-3">Admission Date</th>
                        <th className="py-3 px-3">Admitted By</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.activeAdmissions.map((adm) => (
                        <tr key={adm.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-indigo-700">
                            {adm.admissionNumber}
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{adm.patientName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">MRN: {adm.patientMrNumber}</p>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {adm.roomName}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-bold text-emerald-700">
                            Rs. {adm.roomCharges.toLocaleString()}
                          </td>

                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {new Date(adm.admissionDate).toLocaleString()}
                          </td>

                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {adm.admittedByName}
                          </td>

                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setActiveAdmissionToDischarge(adm)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded transition flex items-center gap-1.5 ml-auto"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              <span>Discharge</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DISCHARGED PATIENTS */}
          {activeTab === 'DISCHARGED' && (
            <div>
              {isLoading ? (
                <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                  <span>Loading discharged patients...</span>
                </div>
              ) : summary.dischargedAdmissions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No discharged patient records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-3 px-3">Admission #</th>
                        <th className="py-3 px-3">Patient Info</th>
                        <th className="py-3 px-3">Room Occupied</th>
                        <th className="py-3 px-3">Charge</th>
                        <th className="py-3 px-3">Admitted Date</th>
                        <th className="py-3 px-3">Discharged Date</th>
                        <th className="py-3 px-3">Discharged By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.dischargedAdmissions.map((adm) => (
                        <tr key={adm.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">
                            {adm.admissionNumber}
                          </td>

                          <td className="py-3 px-3">
                            <p className="font-bold text-slate-900">{adm.patientName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">MRN: {adm.patientMrNumber}</p>
                          </td>

                          <td className="py-3 px-3 font-medium text-slate-800">
                            {adm.roomName}
                          </td>

                          <td className="py-3 px-3 font-bold text-slate-700">
                            Rs. {adm.roomCharges.toLocaleString()}
                          </td>

                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {new Date(adm.admissionDate).toLocaleDateString()}
                          </td>

                          <td className="py-3 px-3 font-bold text-emerald-800 text-[11px]">
                            {adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleString() : 'N/A'}
                          </td>

                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {adm.dischargedByName || 'Staff'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ADMIT PATIENT MODAL OVERLAY */}
      {activeOrderToAdmit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 my-auto">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
                  <Bed className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Inpatient Admission Check-In
                  </h3>
                  <p className="text-xs text-slate-400">
                    Patient: <strong className="text-amber-300">{activeOrderToAdmit.patientName}</strong> ({activeOrderToAdmit.patientMrNumber})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveOrderToAdmit(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Doctor Recommendation Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <span className="font-bold text-[10px] uppercase block text-amber-800">Doctor Recommendation:</span>
                <p className="font-bold mt-0.5">Recommended Ward: {activeOrderToAdmit.recommendedWard.replace('_', ' ')} ({activeOrderToAdmit.admissionType})</p>
                {activeOrderToAdmit.provisionalDiagnosis && (
                  <p className="text-[11px] text-amber-800 mt-0.5 italic">Diagnosis: {activeOrderToAdmit.provisionalDiagnosis}</p>
                )}
              </div>

              {/* Room Presets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Quick Select Room / Ward:</label>
                <div className="flex flex-wrap gap-1.5">
                  {ROOM_PRESETS.map((rPreset) => (
                    <button
                      key={rPreset}
                      type="button"
                      onClick={() => setRoomName(rPreset)}
                      className={`px-2 py-1 text-[11px] font-semibold rounded border transition ${
                        roomName === rPreset
                          ? 'bg-slate-900 text-white border-slate-900 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      + {rPreset.split(' - ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Name Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Assigned Room / Ward Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Private Room 101 or General Ward Bed 5"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Room Charges Input (Default 5000, Editable) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Room Admission Charge (PKR) <span className="text-red-500">* (Default Rs. 5000, Editable)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    value={roomCharges}
                    onChange={(e) => setRoomCharges(e.target.value)}
                    min={0}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />

                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Note: This room charge will automatically be posted once to the patient's billing account.
                </p>
              </div>

              {/* Admission Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Admission Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Patient admitted accompanied by attendant..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none"
                />
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveOrderToAdmit(null)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAdmit}
                disabled={submittingAdmit}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
              >
                <Bed className="h-4 w-4" />
                <span>{submittingAdmit ? 'Admitting...' : `Confirm & Admit (Rs. ${roomCharges})`}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DISCHARGE CONFIRMATION MODAL OVERLAY */}
      {activeAdmissionToDischarge && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 my-auto text-center p-6 space-y-4">
            
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Discharge Patient?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-normal">
                Are you sure you want to discharge <strong className="text-slate-900 font-bold">{activeAdmissionToDischarge.patientName}</strong> from <strong className="text-slate-900 font-bold">{activeAdmissionToDischarge.roomName}</strong>?
              </p>
            </div>

            <div className="text-left">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Discharge Notes (Optional)</label>
              <textarea
                rows={2}
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
                placeholder="e.g. Discharged in stable condition with prescription..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveAdmissionToDischarge(null)}
                disabled={submittingDischarge}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition"
              >
                Keep Admitted
              </button>

              <button
                type="button"
                onClick={handleConfirmDischarge}
                disabled={submittingDischarge}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
              >
                {submittingDischarge ? 'Discharging...' : 'Confirm Discharge'}
              </button>
            </div>

          </div>
        </div>
      )}

    </PermissionGuard>
  );
}
