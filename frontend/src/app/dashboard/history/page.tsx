'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import {
  searchPatientHistoryApi,
  getPatientHistoryApi,
  CompletePatientHistoryData,
} from '../../../lib/history';
import { getHospitalSettingsApi, HospitalSettings } from '../../../lib/settings';

import {
  Search,
  History,
  User,
  Phone,
  Droplet,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  FileText,
  Bed,
  Activity,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  FileCheck,
  Building2,
  Scissors,
} from 'lucide-react';

export default function PatientHistoryPage() {
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings | null>(null);

  useEffect(() => {
    getHospitalSettingsApi()
      .then(setHospitalSettings)
      .catch(() => {});
  }, []);
  const searchParams = useSearchParams();
  const initialMr = searchParams.get('mrNumber') || '';
  const initialPatientId = searchParams.get('patientId') || '';

  const [mrNumberInput, setMrNumberInput] = useState(initialMr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<CompletePatientHistoryData | null>(null);
  const [expandedVisits, setExpandedVisits] = useState<Record<string, boolean>>({});

  // Auto-trigger search if query params are present
  useEffect(() => {
    if (initialMr) {
      handleSearch(initialMr);
    } else if (initialPatientId) {
      fetchByPatientId(initialPatientId);
    }
  }, [initialMr, initialPatientId]);

  const handleSearch = async (mrToSearch?: string) => {
    const targetMr = (mrToSearch || mrNumberInput).trim();
    if (!targetMr) {
      setError('Please enter a valid MR Number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchPatientHistoryApi(targetMr);
      setHistoryData(result);
      
      // Auto expand the most recent visit
      if (result.visits.length > 0) {
        setExpandedVisits({ [result.visits[0].visit.visitId]: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Patient history not found for MR Number.';
      setError(msg);
      setHistoryData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchByPatientId = async (patientId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPatientHistoryApi(patientId);
      setHistoryData(result);
      if (result.visits.length > 0) {
        setExpandedVisits({ [result.visits[0].visit.visitId]: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Patient history not found.';
      setError(msg);
      setHistoryData(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisitExpand = (visitId: string) => {
    setExpandedVisits((prev) => ({ ...prev, [visitId]: !prev[visitId] }));
  };

  const toggleExpandAll = () => {
    if (!historyData) return;
    const allExpanded = historyData.visits.every((v) => expandedVisits[v.visit.visitId]);
    if (allExpanded) {
      setExpandedVisits({});
    } else {
      const newMap: Record<string, boolean> = {};
      historyData.visits.forEach((v) => {
        newMap[v.visit.visitId] = true;
      });
      setExpandedVisits(newMap);
    }
  };

  const handlePrint = () => {
    if (historyData) {
      const allVisitsMap: Record<string, boolean> = {};
      historyData.visits.forEach((v) => {
        allVisitsMap[v.visit.visitId] = true;
      });
      setExpandedVisits(allVisitsMap);
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <PermissionGuard permission={Permission.VIEW_PATIENT_HISTORY}>
      <div className="space-y-6">
        {/* Page Header (No Print) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <History className="h-7 w-7 text-teal-600" />
              Patient Medical History
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Read-only chronological timeline of all previous patient encounters, diagnostics, treatments, and billing.
            </p>
          </div>

          {historyData && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Complete History
            </button>
          )}
        </div>

        {/* 1. Search Box Component (No Print) */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm no-print">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Search Patient by MR Number <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={mrNumberInput}
                onChange={(e) => setMrNumberInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter MR Number (e.g. MRN-20260721-0001)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 font-mono placeholder:font-sans focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs rounded-md shadow transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  Searching History...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Medical History
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* 2. Patient History Container */}
        {historyData && (
          <div className="space-y-6">
            {/* Printable Hospital Branding Header (Visible in Print View) */}
            <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3 mb-4">
              {hospitalSettings?.hospitalLogo && (
                <img src={hospitalSettings.hospitalLogo} alt="Logo" className="h-12 mx-auto object-contain mb-1" />
              )}
              <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
                {hospitalSettings?.hospitalName || 'LALA MEDICAL COMPLEX'}
              </h1>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {hospitalSettings?.address || 'Basti Amanat Ali, Airport Road, near Decent Bakers, Rahim Yar Khan, Punjab, Pakistan'} • Ph: {hospitalSettings?.contactNumber || '+92 300 6708300'}
              </p>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mt-1">
                CONFIDENTIAL PATIENT MEDICAL HISTORY REPORT
              </p>
            </div>

            {/* Patient Summary Card */}
            <div className="bg-slate-900 text-white rounded-lg p-6 shadow-md border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-teal-600/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      {historyData.patient.fullName}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Son/Daughter/Wife of: <strong className="text-slate-200">{historyData.patient.fatherHusbandName}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-teal-950 text-teal-300 font-mono font-bold text-xs rounded border border-teal-800">
                    MRN: {historyData.patient.mrNumber}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded font-medium border border-slate-700 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-400" /> Read-Only Record
                  </span>
                </div>
              </div>

              {/* Patient Bio Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age / Gender</span>
                  <span className="font-bold text-white mt-0.5 block">{historyData.patient.age || 'N/A'} Yrs / {historyData.patient.gender}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold flex items-center gap-1">
                    <Phone className="h-3 w-3 text-teal-400" /> Phone
                  </span>
                  <span className="font-mono font-bold text-white mt-0.5 block">{historyData.patient.mobileNumber}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold flex items-center gap-1">
                    <Droplet className="h-3 w-3 text-red-400" /> Blood Group
                  </span>
                  <span className="font-bold text-red-300 mt-0.5 block">{historyData.patient.bloodGroup || 'N/A'}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">CNIC</span>
                  <span className="font-mono font-semibold text-slate-200 mt-0.5 block">{historyData.patient.cnic || 'N/A'}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">City</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block truncate">{historyData.patient.city}</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded border border-slate-700/60 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Encounters</span>
                  <span className="font-bold text-teal-300 mt-0.5 block">{historyData.visits.length} Visit(s)</span>
                </div>
              </div>

              {/* Allergies & Chronic Diseases Warning Tags */}
              {(historyData.patient.allergies || historyData.patient.chronicDiseases) && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
                  {historyData.patient.allergies && (
                    <span className="px-2.5 py-1 bg-red-950/80 text-red-300 border border-red-800/60 rounded flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                      Allergies: {historyData.patient.allergies}
                    </span>
                  )}
                  {historyData.patient.chronicDiseases && (
                    <span className="px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-800/60 rounded flex items-center gap-1.5 font-medium">
                      <Activity className="h-3.5 w-3.5 text-amber-400" />
                      Chronic Diseases: {historyData.patient.chronicDiseases}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Controls Bar (No Print) */}
            <div className="flex items-center justify-between px-2 no-print">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Encounters Timeline</span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold text-[11px] rounded-full">
                  {historyData.visits.length}
                </span>
              </div>
              <button
                onClick={toggleExpandAll}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded border border-teal-200/80 transition-colors"
              >
                {historyData.visits.every((v) => expandedVisits[v.visit.visitId]) ? 'Collapse All Visits' : 'Expand All Visits'}
              </button>
            </div>

            {/* 3. Visit Timeline List */}
            {historyData.visits.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-sm">
                No previous clinical visits found for this patient.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-300 ml-4 pl-6 space-y-6">
                {historyData.visits.map((encounter, index) => {
                  const isExpanded = !!expandedVisits[encounter.visit.visitId];
                  const { visit, prescription, laboratory, radiology, admission, operation, billing } = encounter;

                  return (
                    <div key={visit.visitId} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className="absolute -left-[35px] top-1.5 h-6 w-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold shadow ring-4 ring-slate-50">
                        {historyData.visits.length - index}
                      </div>

                      {/* Visit Summary Card Header */}
                      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-all">
                        <div
                          onClick={() => toggleVisitExpand(visit.visitId)}
                          className="p-4 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-sm text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded">
                              {visit.visitNumber}
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-teal-600" />
                                {visit.doctorName}
                                <span className="text-xs font-medium text-slate-500">({visit.doctorDepartment})</span>
                              </h3>
                              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {new Date(visit.visitDate).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                visit.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : visit.status === 'WITH_DOCTOR'
                                  ? 'bg-amber-100 text-amber-800'
                                  : visit.status === 'CANCELLED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {visit.status}
                            </span>
                            <div className="text-slate-400 hover:text-slate-600">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Expanded Visit Content */}
                        {isExpanded && (
                          <div className="p-6 space-y-6 bg-white text-xs text-slate-700 divide-y divide-slate-100">
                            
                            {/* SECTION 1: Visit Information & Vitals */}
                            <div className="space-y-3">
                              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-teal-700">
                                <Stethoscope className="h-4 w-4 text-teal-600" /> Visit Information & Clinical Findings
                              </h4>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                                <div>
                                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Token Number</span>
                                  <p className="font-bold text-slate-800 mt-0.5">Token #{visit.tokenNumber}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[10px] uppercase font-semibold">BP / Temp</span>
                                  <p className="font-semibold text-slate-800 mt-0.5">{visit.bloodPressure || 'N/A'} | {visit.temperature || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Pulse / Weight</span>
                                  <p className="font-semibold text-slate-800 mt-0.5">{visit.pulse || 'N/A'} | {visit.weight || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500 text-[10px] uppercase font-semibold">Diagnosis</span>
                                  <p className="font-bold text-teal-700 mt-0.5">{visit.diagnosis || 'Recorded in Rx'}</p>
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                  <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1">Chief Complaint</span>
                                  <p className="text-slate-800 font-medium whitespace-pre-wrap">{visit.chiefComplaint || 'None specified'}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                  <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1">Doctor Consultation Notes</span>
                                  <p className="text-slate-800 whitespace-pre-wrap">{visit.clinicalNotes || 'None recorded'}</p>
                                </div>
                              </div>
                            </div>

                            {/* SECTION 2: Prescription History */}
                            <div className="pt-4 space-y-3">
                              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-teal-700">
                                <Pill className="h-4 w-4 text-teal-600" /> Electronic Prescription (e-Rx)
                              </h4>

                              {historyData.roleScope === 'LAB_ONLY' || historyData.roleScope === 'RAD_ONLY' ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available (Restricted to Clinical Department)
                                </div>
                              ) : !prescription ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available
                                </div>
                              ) : (
                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-md border border-slate-200">
                                  <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                                    <span className="font-mono font-bold text-slate-700">Rx #{prescription.prescriptionNumber}</span>
                                    <span className="text-slate-500">Status: <strong className="text-emerald-700 uppercase">{prescription.status}</strong></span>
                                  </div>

                                  {/* Medicines Table */}
                                  {prescription.items.length > 0 && (
                                    <div className="overflow-x-auto border border-slate-200 rounded">
                                      <table className="w-full text-left bg-white">
                                        <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase">
                                          <tr>
                                            <th className="p-2">#</th>
                                            <th className="p-2">Medicine Name</th>
                                            <th className="p-2">Dosage</th>
                                            <th className="p-2">Frequency</th>
                                            <th className="p-2">Duration</th>
                                            <th className="p-2">Instructions</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-xs">
                                          {prescription.items.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-slate-50">
                                              <td className="p-2 font-mono text-slate-400">{idx + 1}</td>
                                              <td className="p-2 font-bold text-slate-800">{item.medicineName}</td>
                                              <td className="p-2">{item.dosage}</td>
                                              <td className="p-2 font-medium text-teal-700">{item.frequency}</td>
                                              <td className="p-2">{item.duration}</td>
                                              <td className="p-2 text-slate-500">{item.instructions || '-'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}

                                  <div className="grid sm:grid-cols-2 gap-3 text-xs pt-1">
                                    {prescription.advice && (
                                      <div>
                                        <span className="text-slate-500 font-semibold block text-[10px] uppercase">Clinical Advice:</span>
                                        <p className="text-slate-800 bg-white p-2 rounded border border-slate-200">{prescription.advice}</p>
                                      </div>
                                    )}
                                    {prescription.followUpDate && (
                                      <div>
                                        <span className="text-slate-500 font-semibold block text-[10px] uppercase">Follow-up Date:</span>
                                        <p className="text-teal-800 font-semibold bg-white p-2 rounded border border-slate-200">
                                          {new Date(prescription.followUpDate).toLocaleDateString()}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* SECTION 3: Laboratory History */}
                            <div className="pt-4 space-y-3">
                              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-teal-700">
                                <FlaskConical className="h-4 w-4 text-teal-600" /> Laboratory Investigations & Reports
                              </h4>

                              {historyData.roleScope === 'RAD_ONLY' ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available (Restricted to Radiology Department)
                                </div>
                              ) : !laboratory || (laboratory.orders.length === 0 && laboratory.reports.length === 0) ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Ordered Tests List */}
                                  {laboratory.orders.length > 0 && (
                                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                      <span className="text-slate-600 font-bold text-[10px] uppercase tracking-wider block mb-2">Ordered Tests:</span>
                                      <div className="flex flex-wrap gap-2">
                                        {laboratory.orders.map((ord) => (
                                          <span
                                            key={ord.id}
                                            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 font-medium flex items-center gap-1.5"
                                          >
                                            <FlaskConical className="h-3.5 w-3.5 text-teal-600" />
                                            {ord.testName}
                                            <span className="text-[10px] text-slate-400 font-normal">({ord.category})</span>
                                            <span
                                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                                ord.status === 'COMPLETED'
                                                  ? 'bg-emerald-100 text-emerald-800'
                                                  : 'bg-amber-100 text-amber-800'
                                              }`}
                                            >
                                              {ord.status}
                                            </span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Released Reports */}
                                  {laboratory.reports.map((report) => (
                                    <div key={report.id} className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-sm">
                                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div>
                                          <span className="font-mono font-bold text-slate-800 text-xs">{report.reportNumber}</span>
                                          <span className="text-[10px] text-slate-500 ml-2">Technician: {report.technicianName}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                          Released: {new Date(report.resultDate).toLocaleString()}
                                        </span>
                                      </div>

                                      {/* Parameters Table */}
                                      {report.items.length > 0 && (
                                        <div className="overflow-x-auto border border-slate-200 rounded">
                                          <table className="w-full text-left bg-white text-xs">
                                            <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase">
                                              <tr>
                                                <th className="p-2">Parameter</th>
                                                <th className="p-2">Result</th>
                                                <th className="p-2">Unit</th>
                                                <th className="p-2">Reference Range</th>
                                                <th className="p-2">Flag</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                              {report.items.map((p) => (
                                                <tr key={p.id} className={p.isAbnormal ? 'bg-red-50/50 font-bold' : ''}>
                                                  <td className="p-2 text-slate-800">{p.parameterName}</td>
                                                  <td className={`p-2 font-mono ${p.isAbnormal ? 'text-red-700 font-bold' : 'text-slate-900'}`}>
                                                    {p.resultValue}
                                                  </td>
                                                  <td className="p-2 text-slate-500">{p.unit || '-'}</td>
                                                  <td className="p-2 text-slate-500 font-mono text-[11px]">{p.referenceRange || '-'}</td>
                                                  <td className="p-2">
                                                    {p.isAbnormal ? (
                                                      <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded">
                                                        HIGH / ABNORMAL
                                                      </span>
                                                    ) : (
                                                      <span className="text-slate-400 text-[10px]">Normal</span>
                                                    )}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}

                                      {report.overallRemarks && (
                                        <p className="text-slate-600 text-xs italic bg-slate-50 p-2 rounded">
                                          Remarks: {report.overallRemarks}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* SECTION 4: Radiology History */}
                            <div className="pt-4 space-y-3">
                              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-teal-700">
                                <FileText className="h-4 w-4 text-teal-600" /> Radiology Diagnostics (X-Ray & Ultrasound)
                              </h4>

                              {historyData.roleScope === 'LAB_ONLY' ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available (Restricted to Laboratory Department)
                                </div>
                              ) : !radiology || (radiology.orders.length === 0 && radiology.reports.length === 0) ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Ordered Scans */}
                                  {radiology.orders.length > 0 && (
                                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                      <span className="text-slate-600 font-bold text-[10px] uppercase tracking-wider block mb-2">Ordered Imaging:</span>
                                      <div className="flex flex-wrap gap-2">
                                        {radiology.orders.map((ord) => (
                                          <span
                                            key={ord.id}
                                            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 font-medium flex items-center gap-1.5"
                                          >
                                            <FileText className="h-3.5 w-3.5 text-teal-600" />
                                            {ord.procedureName} ({ord.modality})
                                            <span
                                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                                ord.status === 'COMPLETED'
                                                  ? 'bg-emerald-100 text-emerald-800'
                                                  : 'bg-amber-100 text-amber-800'
                                              }`}
                                            >
                                              {ord.status}
                                            </span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Released Reports */}
                                  {radiology.reports.map((report) => (
                                    <div key={report.id} className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-sm">
                                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-bold text-slate-800 text-xs">{report.reportNumber}</span>
                                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded uppercase">
                                            {report.serviceType}
                                          </span>
                                        </div>
                                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                          Released: {new Date(report.reportDate).toLocaleString()}
                                        </span>
                                      </div>

                                      <div>
                                        <h5 className="font-bold text-slate-900 text-xs">{report.examination}</h5>
                                      </div>

                                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                                          <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1">Clinical Findings</span>
                                          <p className="text-slate-800 whitespace-pre-wrap">{report.clinicalFindings}</p>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                                          <span className="text-slate-500 text-[10px] uppercase font-semibold block mb-1">Impression & Conclusion</span>
                                          <p className="text-slate-900 font-bold whitespace-pre-wrap">{report.impression}</p>
                                        </div>
                                      </div>

                                      {report.recommendation && (
                                        <div className="p-2 bg-amber-50 text-amber-900 border border-amber-200 rounded text-xs">
                                          <strong>Recommendation:</strong> {report.recommendation}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* SECTION 5: Inpatient Admission History */}
                            <div className="pt-4 space-y-3">
                              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-teal-700">
                                <Bed className="h-4 w-4 text-teal-600" /> Ward & Inpatient Admission
                              </h4>

                              {historyData.roleScope === 'LAB_ONLY' || historyData.roleScope === 'RAD_ONLY' ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available (Restricted to Admissions Department)
                                </div>
                              ) : !admission ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available
                                </div>
                              ) : (
                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3 text-xs">
                                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="font-mono font-bold text-slate-800">
                                      {admission.admissionNumber || 'Admission Request'}
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 font-bold text-[10px] rounded uppercase">
                                      {admission.status || 'ORDERED'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Room / Ward</span>
                                      <p className="font-bold text-slate-800 mt-0.5">{admission.roomName || admission.recommendedWard || 'General Ward'}</p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Room Charges</span>
                                      <p className="font-bold text-emerald-700 mt-0.5">Rs. {admission.roomCharges ? admission.roomCharges.toLocaleString() : '5,000'}</p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Admission Date</span>
                                      <p className="font-semibold text-slate-800 mt-0.5">
                                        {admission.admissionDate ? new Date(admission.admissionDate).toLocaleDateString() : 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Discharge Date</span>
                                      <p className="font-semibold text-slate-800 mt-0.5">
                                        {admission.dischargeDate ? new Date(admission.dischargeDate).toLocaleDateString() : 'Active / Discharged'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* SECTION 6: Surgical Operation History */}
                            <div className="pt-4 space-y-3">
                              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-teal-700">
                                <Scissors className="h-4 w-4 text-teal-600" /> Surgical Operation
                              </h4>

                              {historyData.roleScope === 'LAB_ONLY' || historyData.roleScope === 'RAD_ONLY' ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available (Restricted to OT Department)
                                </div>
                              ) : !operation ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available
                                </div>
                              ) : (
                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3 text-xs">
                                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="font-mono font-bold text-slate-800">
                                      {operation.operationNumber || 'Operation Request'}
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 font-bold text-[10px] rounded uppercase">
                                      {operation.status || 'ORDERED'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Operation Name</span>
                                      <p className="font-bold text-slate-800 mt-0.5">{operation.operationName || operation.proposedProcedure}</p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Surgeon / Doctor</span>
                                      <p className="font-semibold text-slate-800 mt-0.5">{operation.doctorName}</p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Urgency</span>
                                      <p className="font-bold text-amber-700 mt-0.5">{operation.urgency || 'ELECTIVE'}</p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Operation Charges</span>
                                      <p className="font-bold text-emerald-700 mt-0.5">Rs. {operation.operationCharges ? operation.operationCharges.toLocaleString() : '20,000'}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* SECTION 7: Billing History */}
                            <div className="pt-4 space-y-3">
                              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-teal-700">
                                <CreditCard className="h-4 w-4 text-teal-600" /> Billing & Cash Receipts
                              </h4>

                              {historyData.roleScope === 'LAB_ONLY' || historyData.roleScope === 'RAD_ONLY' ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available (Restricted to Cashier Department)
                                </div>
                              ) : !billing ? (
                                <div className="p-3 bg-slate-50 text-slate-400 italic rounded border border-slate-200">
                                  Not Available
                                </div>
                              ) : (
                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3 text-xs">
                                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="font-mono font-bold text-slate-800">
                                      Bill #{billing.billNumber}
                                    </span>
                                    <span
                                      className={`px-2.5 py-0.5 font-bold text-[10px] rounded uppercase ${
                                        billing.paymentStatus === 'PAID'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      Payment: {billing.paymentStatus}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Total Amount</span>
                                      <p className="font-bold text-slate-900 mt-0.5">Rs. {billing.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Paid Amount</span>
                                      <p className="font-bold text-emerald-700 mt-0.5">Rs. {billing.paidAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Payment Method</span>
                                      <p className="font-semibold text-slate-800 mt-0.5">{billing.paymentMethod || 'CASH'}</p>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[10px] uppercase font-semibold">Receipt Cashier</span>
                                      <p className="font-semibold text-slate-800 mt-0.5">{billing.receptionistName || 'Cashier'}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
