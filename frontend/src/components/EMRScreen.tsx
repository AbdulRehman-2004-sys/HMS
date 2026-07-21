'use client';

import React, { useState, useEffect } from 'react';
import { EMRDetailsData, updateVisitStatusApi, VisitStatus } from '../lib/visits';
import {
  createPrescriptionApi,
  getPrescriptionByVisitApi,
  searchMedicinesApi,
  PrescriptionItem,
  MedicineOption,
} from '../lib/prescriptions';
import {
  createLabOrderApi,
  createRadiologyOrderApi,
  createAdmissionOrderApi,
  createOperationOrderApi,
  getOrdersByVisitApi,
  updateOrderStatusApi,
  OrderStatus,
  OrderUrgency,
  RadiologyModality,
  AdmissionType,
  RecommendedWard,
  AnesthesiaType,
  VisitOrdersSummary,
} from '../lib/orders';
import { getLabReportsByVisitApi, LabReportData } from '../lib/lab';

import {
  Printer,
  X,
  CheckCircle2,
  Clock,
  FileText,
  FlaskConical,
  Activity,
  History,
  Pill,
  Save,
  Plus,
  Trash2,
  Calendar,
  ClipboardList,
  Bed,
  Scissors,
  AlertCircle,
  Ban,
} from 'lucide-react';

interface EMRScreenProps {
  emrData: EMRDetailsData;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

const COMMON_LAB_TESTS = [
  { name: 'CBC / Blood CP', category: 'Hematology' },
  { name: 'LFT (Liver Function Test)', category: 'Biochemistry' },
  { name: 'RFT (Renal Function Test)', category: 'Biochemistry' },
  { name: 'Serum Electrolytes', category: 'Biochemistry' },
  { name: 'Urine Routine Examination (R/E)', category: 'Microbiology' },
  { name: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry' },
  { name: 'Lipid Profile', category: 'Biochemistry' },
  { name: 'Typhoid / Widal Test', category: 'Serology' },
  { name: 'Blood Grouping & Rh Factor', category: 'Hematology' },
];

const COMMON_RADIOLOGY_TESTS = [
  { name: 'Chest X-Ray PA View', modality: RadiologyModality.X_RAY },
  { name: 'Abdomen X-Ray Erect/Plain', modality: RadiologyModality.X_RAY },
  { name: 'Skull X-Ray AP/Lat', modality: RadiologyModality.X_RAY },
  { name: 'Ultrasound Abdomen & Pelvis', modality: RadiologyModality.ULTRASOUND },
  { name: 'Ultrasound KUB (Kidney/Ureter/Bladder)', modality: RadiologyModality.ULTRASOUND },
  { name: 'Obstetric Ultrasound (Pregnancy)', modality: RadiologyModality.ULTRASOUND },
  { name: 'CT Scan Brain Plain', modality: RadiologyModality.CT_SCAN },
];

export const EMRScreen: React.FC<EMRScreenProps> = ({ emrData, onClose, onStatusUpdated }) => {
  const { visit, pastVisits } = emrData;
  const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'prescriptions' | 'lab' | 'radiology'>('orders');
  const [clinicalNotes, setClinicalNotes] = useState(visit.clinicalNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<VisitStatus>(visit.status);

  // e-Prescription State
  const [diagnosis, setDiagnosis] = useState(visit.chiefComplaint || '');
  const [advice, setAdvice] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { medicineName: 'Tab. Panadol Extra 500mg', dosage: '1 Tablet', frequency: '1-0-1', duration: '5 Days', instructions: 'After Meal' }
  ]);
  const [savingRx, setSavingRx] = useState(false);
  const [rxSuccessMsg, setRxSuccessMsg] = useState('');
  const [drugSuggestions, setDrugSuggestions] = useState<Record<number, MedicineOption[]>>({});

  // Doctor Orders State
  const [visitOrders, setVisitOrders] = useState<VisitOrdersSummary>({
    labOrders: [],
    radiologyOrders: [],
    admissionOrders: [],
    operationOrders: [],
  });
  const [visitLabReports, setVisitLabReports] = useState<LabReportData[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [selectedRads, setSelectedRads] = useState<Array<{ name: string; modality: RadiologyModality }>>([]);
  const [requestAdmission, setRequestAdmission] = useState(false);
  const [admissionWard, setAdmissionWard] = useState<RecommendedWard>(RecommendedWard.GENERAL_WARD);
  const [admissionType, setAdmissionType] = useState<AdmissionType>(AdmissionType.EMERGENCY);
  const [requestOperation, setRequestOperation] = useState(false);
  const [operationName, setOperationName] = useState('');
  const [operationUrgency, setOperationUrgency] = useState<OrderUrgency>(OrderUrgency.ELECTIVE);
  const [anesthesiaType, setAnesthesiaType] = useState<AnesthesiaType>(AnesthesiaType.GENERAL);
  const [submittingOrders, setSubmittingOrders] = useState(false);
  const [orderMsg, setOrderMsg] = useState('');

  // Custom Cancel Confirmation Modal State
  const [cancelTarget, setCancelTarget] = useState<{
    type: 'lab' | 'radiology' | 'admission' | 'operation';
    id: string;
    name: string;
  } | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  // Custom Alert Modal State
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  } | null>(null);

  // Doctor credentials check
  const isZafar = visit.doctorName.toLowerCase().includes('zafar');
  const isShumaila = visit.doctorName.toLowerCase().includes('shumaila');

  // Load Existing e-Prescription, Orders & Lab Reports
  useEffect(() => {
    async function loadData() {
      try {
        const [existingRx, ordersSummary, reports] = await Promise.all([
          getPrescriptionByVisitApi(visit.id),
          getOrdersByVisitApi(visit.id),
          getLabReportsByVisitApi(visit.id),
        ]);

        if (existingRx) {
          if (existingRx.diagnosis) setDiagnosis(existingRx.diagnosis);
          if (existingRx.advice) setAdvice(existingRx.advice);
          if (existingRx.followUpDate) {
            setFollowUpDate(new Date(existingRx.followUpDate).toISOString().slice(0, 10));
          }
          if (existingRx.items && existingRx.items.length > 0) {
            setPrescriptionItems(existingRx.items);
          }
        }

        if (ordersSummary) {
          setVisitOrders(ordersSummary);
        }

        if (reports) {
          setVisitLabReports(reports);
        }
      } catch (err) {
        console.error('Failed to load EMR data', err);
      }
    }
    loadData();
  }, [visit.id]);


  const refreshOrders = async () => {
    try {
      const [summary, reports] = await Promise.all([
        getOrdersByVisitApi(visit.id),
        getLabReportsByVisitApi(visit.id),
      ]);
      setVisitOrders(summary);
      setVisitLabReports(reports);
    } catch (err) {
      console.error('Failed to refresh orders and reports', err);
    }
  };


  const showAlert = (title: string, message: string) => {
    setCustomAlert({ isOpen: true, title, message });
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await updateVisitStatusApi(visit.id, {
        status: currentStatus,
        clinicalNotes,
      });
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      showAlert('Action Failed', 'Failed to save clinical notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSavePrescription = async () => {
    try {
      setSavingRx(true);
      setRxSuccessMsg('');
      const validItems = prescriptionItems.filter((it) => it.medicineName.trim().length > 0);
      if (validItems.length === 0) {
        showAlert('Prescription Warning', 'Please add at least one valid medication to save e-Prescription.');
        return;
      }

      await createPrescriptionApi({
        visitId: visit.id,
        patientId: visit.patientId,
        doctorId: visit.doctorId,
        diagnosis,
        advice,
        followUpDate: followUpDate || null,
        items: validItems,
      });

      setRxSuccessMsg('e-Prescription saved successfully!');
      setTimeout(() => setRxSuccessMsg(''), 4000);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      showAlert('Prescription Error', err.response?.data?.error?.message || 'Failed to save e-Prescription.');
    } finally {
      setSavingRx(false);
    }
  };

  const handleCreateOrders = async () => {
    try {
      setSubmittingOrders(true);
      setOrderMsg('');

      const promises: Promise<any>[] = [];

      // Create Selected Lab Orders
      selectedLabs.forEach((testName) => {
        const testObj = COMMON_LAB_TESTS.find((t) => t.name === testName);
        promises.push(
          createLabOrderApi({
            visitId: visit.id,
            patientId: visit.patientId,
            doctorId: visit.doctorId,
            testName,
            category: testObj?.category || 'General',
            urgency: OrderUrgency.ROUTINE,
          })
        );
      });

      // Create Selected Radiology Orders
      selectedRads.forEach((rad) => {
        promises.push(
          createRadiologyOrderApi({
            visitId: visit.id,
            patientId: visit.patientId,
            doctorId: visit.doctorId,
            modality: rad.modality,
            procedureName: rad.name,
            urgency: OrderUrgency.ROUTINE,
          })
        );
      });

      // Create Admission Order if requested
      if (requestAdmission) {
        promises.push(
          createAdmissionOrderApi({
            visitId: visit.id,
            patientId: visit.patientId,
            doctorId: visit.doctorId,
            admissionType,
            recommendedWard: admissionWard,
            provisionalDiagnosis: diagnosis || visit.chiefComplaint || 'Under Investigation',
          })
        );
      }

      // Create Operation Order if requested
      if (requestOperation && operationName.trim().length > 0) {
        promises.push(
          createOperationOrderApi({
            visitId: visit.id,
            patientId: visit.patientId,
            doctorId: visit.doctorId,
            procedureName: operationName,
            urgency: operationUrgency,
            anesthesiaType,
          })
        );
      }

      if (promises.length === 0) {
        showAlert('No Orders Selected', 'Please select at least one lab test, radiology scan, admission, or operation order to submit.');
        return;
      }

      await Promise.all(promises);
      setOrderMsg('Doctor orders issued successfully!');

      // Reset selection
      setSelectedLabs([]);
      setSelectedRads([]);
      setRequestAdmission(false);
      setRequestOperation(false);
      setOperationName('');

      await refreshOrders();
      setTimeout(() => setOrderMsg(''), 4000);
    } catch (err: any) {
      showAlert('Order Creation Error', err.response?.data?.error?.message || 'Failed to create orders.');
    } finally {
      setSubmittingOrders(false);
    }
  };

  const executeCancelOrder = async () => {
    if (!cancelTarget) return;
    try {
      setCancellingOrder(true);
      await updateOrderStatusApi(cancelTarget.type, cancelTarget.id, OrderStatus.CANCELLED);
      await refreshOrders();
      setCancelTarget(null);
    } catch (err: any) {
      showAlert('Cancellation Error', err.response?.data?.error?.message || 'Failed to cancel order.');
    } finally {
      setCancellingOrder(false);
    }

  };

  const handleStatusChange = async (newStatus: VisitStatus) => {
    try {
      setSavingNotes(true);
      const updated = await updateVisitStatusApi(visit.id, {
        status: newStatus,
        clinicalNotes,
      });
      setCurrentStatus(updated.status);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      showAlert('Status Error', 'Failed to update visit status.');
    } finally {
      setSavingNotes(false);
    }
  };


  const handlePrint = () => {
    window.print();
  };

  // Medicine Builder Handlers
  const handleAddMedicineRow = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicineName: '', dosage: '1 Tablet', frequency: '1-0-1', duration: '5 Days', instructions: 'After Meal' },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleItemChange = async (index: number, field: keyof PrescriptionItem, value: string) => {
    const updated = [...prescriptionItems];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionItems(updated);

    if (field === 'medicineName' && value.trim().length >= 1) {
      const suggestions = await searchMedicinesApi(value);
      setDrugSuggestions((prev) => ({ ...prev, [index]: suggestions }));
    } else if (field === 'medicineName') {
      setDrugSuggestions((prev) => ({ ...prev, [index]: [] }));
    }
  };

  const handleSelectDrugSuggestion = (index: number, drug: MedicineOption) => {
    const updated = [...prescriptionItems];
    updated[index] = {
      ...updated[index],
      medicineName: drug.name,
      dosage: drug.defaultDosage || updated[index].dosage,
      frequency: drug.defaultFrequency || updated[index].frequency,
    };
    setPrescriptionItems(updated);
    setDrugSuggestions((prev) => ({ ...prev, [index]: [] }));
  };

  const toggleLabTest = (testName: string) => {
    if (selectedLabs.includes(testName)) {
      setSelectedLabs(selectedLabs.filter((t) => t !== testName));
    } else {
      setSelectedLabs([...selectedLabs, testName]);
    }
  };

  const toggleRadTest = (test: { name: string; modality: RadiologyModality }) => {
    const exists = selectedRads.some((r) => r.name === test.name);
    if (exists) {
      setSelectedRads(selectedRads.filter((r) => r.name !== test.name));
    } else {
      setSelectedRads([...selectedRads, test]);
    }
  };

  const totalPendingOrdersCount =
    visitOrders.labOrders.length +
    visitOrders.radiologyOrders.length +
    visitOrders.admissionOrders.length +
    visitOrders.operationOrders.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-w-none print:rounded-none">
        
        {/* Top Control Bar (Non-Printable) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded-full font-bold">
              Token #{String(visit.tokenNumber).padStart(3, '0')}
            </span>
            <span className="text-sm font-semibold text-slate-200 truncate">
              {visit.patientName} ({visit.patientMrNumber})
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              currentStatus === VisitStatus.WAITING ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              currentStatus === VisitStatus.WITH_DOCTOR ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
              currentStatus === VisitStatus.COMPLETED ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {currentStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {currentStatus === VisitStatus.WAITING && (
              <button
                onClick={() => handleStatusChange(VisitStatus.WITH_DOCTOR)}
                disabled={savingNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow transition"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Start Visit</span>
              </button>
            )}

            {currentStatus !== VisitStatus.COMPLETED && (
              <button
                onClick={() => handleStatusChange(VisitStatus.COMPLETED)}
                disabled={savingNotes}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Completed</span>
              </button>
            )}

            <button
              onClick={handleSavePrescription}
              disabled={savingRx}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded shadow transition"
            >
              <Pill className="h-3.5 w-3.5" />
              <span>{savingRx ? 'Saving e-Rx...' : 'Save e-Prescription'}</span>
            </button>

            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 shadow transition"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{savingNotes ? 'Saving Notes...' : 'Save Notes'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded shadow transition"
            >
              <Printer className="h-3.5 w-3.5 text-teal-200" />
              <span>Print EMR Pad</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {rxSuccessMsg && (
          <div className="no-print bg-emerald-500 text-white text-center text-xs font-bold py-1.5">
            {rxSuccessMsg}
          </div>
        )}

        {/* EMR Prescription Pad Body (Exact Replica of Physical Prescription Pad) */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto bg-white flex flex-col justify-between space-y-4 print:p-0 print:overflow-visible">
          
          {/* Main Prescription Sheet Wrapper */}
          <div className="emr-print-pad bg-white border-2 border-slate-300 rounded-sm p-4 sm:p-6 shadow-md print:border-none print:shadow-none print:p-0 flex flex-col justify-between min-h-[850px] print:min-h-0">
            
            {/* 1. TOP HEADER BANNER (Full Clone) */}
            <div className="relative border-b-2 border-red-700 pb-3">
              
              {/* In Memory Of Line */}
              <div className="text-right pr-2 mb-1">
                <span className="text-[11px] font-serif italic font-medium text-red-700 tracking-wide">
                  In the Memory of Lala Muhammad Iqbal
                </span>
              </div>
              {/* Full Width Line directly below In Memory Of */}
              <div className="w-full border-b border-red-700 mb-2"></div>

              <div className="grid grid-cols-12 gap-2 items-start">
                
                {/* Header Left: Red Title Box & Urdu Address */}
                <div className="col-span-5 sm:col-span-4 flex flex-col">
                  <div className="bg-red-600 text-white p-2.5 sm:p-3 rounded-none shadow-sm flex flex-col justify-center items-center text-center">
                    <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-none uppercase font-sans">
                      LALA MEDICAL
                    </h1>
                    <h2 className="text-base sm:text-xl font-black tracking-wider leading-none uppercase mt-1 font-sans">
                      COMPLEX
                    </h2>
                  </div>
                  <div className="bg-slate-900 text-amber-300 text-[10px] sm:text-[11px] text-center font-bold py-1 px-1 tracking-wide mt-0.5">
                    ایئرپورٹ روڈ بستی امانت علی رحیم یار خان
                  </div>
                </div>

                {/* Header Center: Round Watermark Seal */}
                <div className="col-span-2 sm:col-span-3 flex justify-center pt-1">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-teal-500/40 flex flex-col items-center justify-center text-center p-1 bg-teal-50/40 shadow-inner">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 mb-0.5" />
                    <span className="text-[8px] sm:text-[9px] font-extrabold text-teal-900 leading-none">LALA MEDICAL</span>
                    <span className="text-[7px] sm:text-[8px] font-bold text-slate-600">COMPLEX</span>
                  </div>
                </div>

                {/* Header Right: Dynamic Doctor Header Credentials */}
                <div className="col-span-5 sm:col-span-5 text-right font-sans pl-1">
                  {isZafar ? (
                    <div className="space-y-0.5 text-slate-800">
                      <h3 className="text-base sm:text-lg font-black text-red-700 leading-snug">Prof. Dr. Zafar Iqbal</h3>
                      <p className="text-[10px] sm:text-xs font-semibold text-slate-700">MBBS (PB), FCPS (Paediatric Surgery), MME (UOL)</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-600 leading-tight">FCPS Paediatric Surgery Supervisor</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-600 leading-tight">Ex-Head Department of Paediatric Surgery</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-600 leading-tight">Ex-Prof. Children Hospital University Lahore</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-700 font-semibold leading-tight">Head Department of Paediatric Surgery</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-800 font-bold leading-tight">Nishtar Medical University Multan</p>
                    </div>
                  ) : isShumaila ? (
                    <div className="space-y-0.5 text-slate-800">
                      <h3 className="text-base sm:text-lg font-black text-red-700 leading-snug">Dr. Shumaila Irum</h3>
                      <p className="text-[10px] sm:text-xs font-semibold text-slate-700">MBBS, MME (UOL), M.Phil (Physiology)</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium">Physiology APWMO</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-600">Assistant Director Medical Education</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-800 font-bold">Sheikh Zayed Medical College/Hospital</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-700 font-semibold">Rahim Yar Khan</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5 text-slate-800">
                      <h3 className="text-base sm:text-lg font-black text-red-700 leading-snug">{visit.doctorName}</h3>
                      <p className="text-[10px] sm:text-xs font-semibold text-slate-700">{visit.doctorQualification}</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium">{visit.doctorSpecialization}</p>
                      {visit.doctorRegistrationNumber && (
                        <p className="text-[9px] sm:text-[10px] text-slate-600">PMDC Reg No: {visit.doctorRegistrationNumber}</p>
                      )}
                      {visit.doctorHeaderText && (
                        <p className="text-[9px] sm:text-[10px] text-slate-700 font-medium">{visit.doctorHeaderText}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. BODY SECTION: 2-COLUMN LAYOUT (Patient Left / Notebook Right) */}
            <div className="grid grid-cols-12 gap-4 mt-3 flex-1">
              
              {/* Left Column: Patient Information & Intake Vitals */}
              <div className="col-span-5 space-y-3.5 pr-2 border-r border-slate-300">
                
                <div className="space-y-2.5 text-xs font-semibold text-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                    <span><strong className="text-indigo-900">M.R. NO.</strong> <span className="font-mono">{visit.patientMrNumber}</span></span>
                    <span><strong className="text-indigo-900">Date:</strong> {new Date(visit.visitDate).toLocaleDateString()}</span>
                  </div>

                  <div className="border-b border-slate-300 pb-1">
                    <strong className="text-indigo-900">Patient Name:</strong> <span className="text-slate-900 font-bold">{visit.patientName}</span>
                  </div>

                  <div className="border-b border-slate-300 pb-1">
                    <strong className="text-indigo-900">Father/Husband Name:</strong> {visit.patientFatherHusbandName || '__________________'}
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                    <span><strong className="text-indigo-900">Age/Sex:</strong> {visit.patientAge ? `${visit.patientAge} Y` : '___'} / {visit.patientGender}</span>
                    <span><strong className="text-indigo-900">Weight:</strong> {visit.weight || '_______'}</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-slate-300 pb-1 text-[11px]">
                    <span><strong className="text-indigo-900">Temp:</strong> {visit.temperature || '___'}</span>
                    <span><strong className="text-indigo-900">Pulse:</strong> {visit.pulse || '___'}</span>
                    <span><strong className="text-indigo-900">B.P:</strong> {visit.bloodPressure || '___'}</span>
                  </div>
                </div>

                {/* Big Rx Symbol & Allergies */}
                <div className="pt-2">
                  <span className="text-5xl font-serif font-black text-indigo-900 italic tracking-tighter">Rx</span>
                  {visit.patientAllergies && (
                    <div className="mt-2 bg-red-50 text-red-700 text-[10px] px-2 py-1 rounded border border-red-200 font-bold">
                      ⚠️ Allergy: {visit.patientAllergies}
                    </div>
                  )}
                </div>

                {/* Printed e-Prescription Medicines Summary (For Physical Printout) */}
                {prescriptionItems.some(i => i.medicineName.trim().length > 0) && (
                  <div className="pt-2 border-t border-slate-200 font-sans text-xs space-y-1.5">
                    {diagnosis && (
                      <p className="text-[11px] font-semibold text-slate-800">
                        <strong className="text-indigo-900">Dx:</strong> {diagnosis}
                      </p>
                    )}
                    {advice && (
                      <p className="text-[11px] text-slate-700 leading-tight">
                        <strong className="text-indigo-900">Advice:</strong> {advice}
                      </p>
                    )}
                    {followUpDate && (
                      <p className="text-[11px] font-bold text-teal-800 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-teal-600" />
                        <span>Follow-up: {new Date(followUpDate).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Clinical Notes / Structured e-Prescription Pad */}
              <div className="col-span-7 flex flex-col h-full pl-2">
                
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider">Clinical Notes & e-Prescription:</h4>
                  <span className="no-print text-[10px] text-slate-400 italic">Editable OPD Pad</span>
                </div>

                {/* Chief Complaint Badge (if recorded by Reception) */}
                {visit.chiefComplaint && (
                  <div className="mb-2 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded text-xs text-amber-950 font-medium">
                    <strong>Chief Complaint:</strong> {visit.chiefComplaint}
                  </div>
                )}

                {/* PRINT VIEW: Structured e-Prescription Table + Notebook Ruled Lines */}
                <div className="flex-1 w-full h-[520px] min-h-[500px] print:h-[560px] print:min-h-[540px] relative font-sans text-sm text-slate-900 leading-[32px] tracking-wide">
                  
                  {/* Prescribed Medicines Structured Table overlay */}
                  {prescriptionItems.some(i => i.medicineName.trim().length > 0) ? (
                    <div className="mb-4 bg-white border border-slate-300 rounded p-3 shadow-sm text-xs leading-normal">
                      <h5 className="font-extrabold text-indigo-900 border-b border-indigo-100 pb-1.5 mb-2 uppercase tracking-wide flex items-center justify-between">
                        <span>Prescribed Medications (e-Rx)</span>
                        <span className="text-[10px] text-slate-500 lowercase font-normal">Rx List</span>
                      </h5>

                      <div className="space-y-2">
                        {prescriptionItems.filter(i => i.medicineName.trim().length > 0).map((med, idx) => (
                          <div key={idx} className="flex flex-col border-b border-slate-100 pb-1.5 last:border-none">
                            <div className="flex justify-between items-center font-bold text-slate-900 text-xs">
                              <span>{idx + 1}. {med.medicineName}</span>
                              <span className="text-teal-700 font-mono text-[11px]">{med.dosage} ({med.frequency})</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-600 mt-0.5 pl-3">
                              <span>Duration: <strong>{med.duration}</strong></span>
                              {med.instructions && <span className="italic text-slate-500">Instructions: {med.instructions}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Freehand Notebook Ruled Lines Textarea */}
                  <div 
                    className="w-full h-full min-h-[300px] relative"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #94a3b8 31px, #94a3b8 32px)',
                      backgroundAttachment: 'local',
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    }}
                  >
                    <textarea
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="Type clinical notes, examination details, diagnosis, and additional notes here..."
                      className="w-full h-full min-h-[300px] bg-transparent resize-none focus:outline-none leading-[32px] pt-[2px] px-1 font-medium text-slate-900"
                      style={{ lineHeight: '32px' }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 3. BOTTOM FOOTER BANNERS (Full Clone) */}
            <div className="mt-4 pt-2 border-t-2 border-red-700 font-sans">
              
              {/* Not Valid For Court Red Stripe */}
              <div className="bg-red-700 text-white text-center text-[10px] font-black py-0.5 tracking-widest uppercase">
                Not Valid for Court
              </div>

              <div className="grid grid-cols-12 text-white mt-0.5">
                
                {/* Left Navy Blue Box */}
                <div className="col-span-6 bg-slate-900 p-2 sm:p-2.5 flex flex-col justify-center text-xs border-r border-slate-800">
                  <p className="text-amber-300 font-bold text-center mb-0.5 text-[11px] leading-tight">
                    الٹرا ساؤنڈ، ایکس رے اور ای سی جی کی سہولت موجود ہے
                  </p>
                  <div className="text-[10px] text-slate-200 space-y-0.5 leading-tight">
                    <p>📞 <strong>Ph:</strong> 068-5878300, <strong>Mob:</strong> 0300-6708300</p>
                    <p>📍 <strong>Airport Road</strong> (Basti Amanat Ali), Rahim Yar Khan</p>
                    <p>💬 <strong>WhatsApp:</strong> 0301-8778300</p>
                  </div>
                </div>

                {/* Right Bright Red Box */}
                <div className="col-span-6 bg-red-700 p-2 sm:p-2.5 flex flex-col justify-center text-center text-xs">
                  <h4 className="font-black text-xs sm:text-sm text-white mb-0.5 leading-tight">
                    بلکل مفت علاج بذریعہ انشورنس کمپنی کارڈ
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-red-100 font-semibold leading-snug">
                    جوائلی انشورنس - اسٹیٹ لائف انشورنس - IGI انشورنس - کشف فاؤنڈیشن - حبیب انشورنس - کریسنٹ کیئر انشورنس
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Electronic Prescription Builder & Clinical Tabs (Non-Printable) */}
          <div className="no-print bg-white rounded-lg border border-slate-200 p-4 shadow-sm mt-4">
            
            {/* e-Prescription (e-Rx) Interactive Builder Section */}
            <div className="mb-6 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-teal-600" />
                  <span>Digital e-Prescription Builder (Medicines, Advice & Follow-Up)</span>
                </h3>
                <button
                  onClick={handleSavePrescription}
                  disabled={savingRx}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded shadow transition"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingRx ? 'Saving e-Rx...' : 'Save e-Prescription'}</span>
                </button>
              </div>

              {/* Diagnosis, Advice & Follow-Up Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Clinical Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Acute Gastroenteritis, Upper Respiratory Infection..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Advice & Instructions</label>
                  <input
                    type="text"
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    placeholder="e.g. Bed rest, avoid cold fluids, drink warm water..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Medication Table Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Prescribed Medications</h4>
                  <button
                    onClick={handleAddMedicineRow}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded border border-indigo-200 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {prescriptionItems.map((item, idx) => (
                    <div key={idx} className="relative bg-white border border-slate-200 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2 items-center shadow-sm">
                      
                      {/* Medicine Name with Auto-Complete */}
                      <div className="sm:col-span-4 relative">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Medicine Name</label>
                        <input
                          type="text"
                          value={item.medicineName}
                          onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                          placeholder="Type medicine name (Panadol, Augmentin...)"
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-semibold focus:bg-white focus:outline-none focus:border-teal-500"
                        />

                        {/* Drug Suggestions Dropdown */}
                        {drugSuggestions[idx] && drugSuggestions[idx].length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded shadow-lg z-20 max-h-36 overflow-y-auto">
                            {drugSuggestions[idx].map((drug) => (
                              <div
                                key={drug.id}
                                onClick={() => handleSelectDrugSuggestion(idx, drug)}
                                className="px-3 py-1.5 hover:bg-teal-50 cursor-pointer text-xs flex justify-between items-center border-b border-slate-100 last:border-none"
                              >
                                <span className="font-bold text-slate-800">{drug.name}</span>
                                <span className="text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">{drug.category}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Dosage */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Dosage</label>
                        <select
                          value={item.dosage}
                          onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none"
                        >
                          <option value="1 Tablet">1 Tablet</option>
                          <option value="2 Tablets">2 Tablets</option>
                          <option value="1 Capsule">1 Capsule</option>
                          <option value="1 Teaspoon">1 Teaspoon</option>
                          <option value="2 Teaspoons">2 Teaspoons</option>
                          <option value="5ml">5 ml</option>
                          <option value="10ml">10 ml</option>
                          <option value="1 Injection">1 Injection</option>
                          <option value="2 Drops">2 Drops</option>
                        </select>
                      </div>

                      {/* Frequency */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Frequency</label>
                        <select
                          value={item.frequency}
                          onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none font-semibold text-teal-700"
                        >
                          <option value="1-0-1">1-0-1 (Morning & Night)</option>
                          <option value="1-1-1">1-1-1 (TDS)</option>
                          <option value="0-0-1">0-0-1 (Night only)</option>
                          <option value="1-0-0">1-0-0 (Morning only)</option>
                          <option value="Once daily">Once daily</option>
                          <option value="SOS">SOS (As needed)</option>
                        </select>
                      </div>

                      {/* Duration */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Duration</label>
                        <select
                          value={item.duration}
                          onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:outline-none"
                        >
                          <option value="3 Days">3 Days</option>
                          <option value="5 Days">5 Days</option>
                          <option value="7 Days">7 Days</option>
                          <option value="10 Days">10 Days</option>
                          <option value="15 Days">15 Days</option>
                          <option value="1 Month">1 Month</option>
                        </select>
                      </div>

                      {/* Delete Action */}
                      <div className="sm:col-span-2 flex justify-end pt-3">
                        <button
                          onClick={() => handleRemoveMedicineRow(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                          title="Remove Medicine"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Diagnostics, Orders & Reports Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === 'orders'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Clinical Orders ({totalPendingOrdersCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === 'history'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>Previous Visits ({pastVisits.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === 'prescriptions'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Pill className="h-3.5 w-3.5" />
                <span>Previous Prescriptions</span>
              </button>
              <button
                onClick={() => setActiveTab('lab')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === 'lab'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Lab Reports ({visitOrders.labOrders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('radiology')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === 'radiology'
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Radiology Reports ({visitOrders.radiologyOrders.length})</span>
              </button>
            </div>

            {/* TAB 1: CLINICAL ORDERS BUILDER & LIST */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orderMsg && (
                  <div className="bg-emerald-500 text-white text-center text-xs font-bold py-1.5 rounded">
                    {orderMsg}
                  </div>
                )}

                {/* One-Click Fast Orders Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wide flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-indigo-600" />
                      <span>Issue New Clinical Orders for Patient Encounter</span>
                    </h4>
                    <button
                      onClick={handleCreateOrders}
                      disabled={submittingOrders}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow transition"
                    >
                      {submittingOrders ? 'Issuing Orders...' : 'Submit Medical Orders'}
                    </button>
                  </div>

                  {/* 1. Laboratory Test Orders */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <FlaskConical className="h-3.5 w-3.5 text-teal-600" />
                      <span>Laboratory Diagnostic Orders</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {COMMON_LAB_TESTS.map((t) => {
                        const isChecked = selectedLabs.includes(t.name);
                        return (
                          <div
                            key={t.name}
                            onClick={() => toggleLabTest(t.name)}
                            className={`p-2 rounded border text-xs cursor-pointer select-none transition flex items-center gap-2 ${
                              isChecked
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="h-3.5 w-3.5 text-indigo-600 rounded"
                            />
                            <span className="truncate">{t.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Radiology Diagnostic Orders (X-Ray & Ultrasound) */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Radiology Imaging Orders (X-Ray & Ultrasound)</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {COMMON_RADIOLOGY_TESTS.map((r) => {
                        const isChecked = selectedRads.some((item) => item.name === r.name);
                        return (
                          <div
                            key={r.name}
                            onClick={() => toggleRadTest(r)}
                            className={`p-2 rounded border text-xs cursor-pointer select-none transition flex items-center gap-2 ${
                              isChecked
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="h-3.5 w-3.5 text-indigo-600 rounded"
                            />
                            <span className="truncate">{r.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Inpatient Admission & Surgery Requests */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                    
                    {/* Admission Request */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                          <Bed className="h-4 w-4 text-amber-600" />
                          <span>Inpatient Ward Admission</span>
                        </label>
                        <input
                          type="checkbox"
                          checked={requestAdmission}
                          onChange={(e) => setRequestAdmission(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 rounded cursor-pointer"
                        />
                      </div>
                      
                      {requestAdmission && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Ward / Room</label>
                            <select
                              value={admissionWard}
                              onChange={(e) => setAdmissionWard(e.target.value as RecommendedWard)}
                              className="w-full p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
                            >
                              <option value={RecommendedWard.GENERAL_WARD}>General Ward</option>
                              <option value={RecommendedWard.PRIVATE_ROOM}>Private Room</option>
                              <option value={RecommendedWard.ICU}>ICU (Intensive Care Unit)</option>
                              <option value={RecommendedWard.CCU}>CCU (Coronary Care Unit)</option>
                              <option value={RecommendedWard.NEONATAL_ICU}>Neonatal ICU</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Priority</label>
                            <select
                              value={admissionType}
                              onChange={(e) => setAdmissionType(e.target.value as AdmissionType)}
                              className="w-full p-1.5 border border-slate-300 rounded text-xs bg-slate-50 font-semibold text-red-700"
                            >
                              <option value={AdmissionType.EMERGENCY}>Emergency Admission</option>
                              <option value={AdmissionType.ELECTIVE}>Elective Admission</option>
                              <option value={AdmissionType.DAYCARE}>Daycare Procedure</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Surgical Operation Request */}
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                          <Scissors className="h-4 w-4 text-red-600" />
                          <span>Surgical Operation Order</span>
                        </label>
                        <input
                          type="checkbox"
                          checked={requestOperation}
                          onChange={(e) => setRequestOperation(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 rounded cursor-pointer"
                        />
                      </div>

                      {requestOperation && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Proposed Surgery Name</label>
                            <input
                              type="text"
                              value={operationName}
                              onChange={(e) => setOperationName(e.target.value)}
                              placeholder="e.g. Laparoscopic Appendectomy"
                              className="w-full p-1.5 border border-slate-300 rounded text-xs bg-slate-50 font-medium"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Urgency</label>
                              <select
                                value={operationUrgency}
                                onChange={(e) => setOperationUrgency(e.target.value as OrderUrgency)}
                                className="w-full p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
                              >
                                <option value={OrderUrgency.ELECTIVE}>Elective</option>
                                <option value={OrderUrgency.URGENT}>Urgent</option>
                                <option value={OrderUrgency.EMERGENCY}>Emergency (STAT)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Anesthesia</label>
                              <select
                                value={anesthesiaType}
                                onChange={(e) => setAnesthesiaType(e.target.value as AnesthesiaType)}
                                className="w-full p-1.5 border border-slate-300 rounded text-xs bg-slate-50"
                              >
                                <option value={AnesthesiaType.GENERAL}>General (GA)</option>
                                <option value={AnesthesiaType.SPINAL}>Spinal (SA)</option>
                                <option value={AnesthesiaType.LOCAL}>Local (LA)</option>
                                <option value={AnesthesiaType.SEDATION}>Sedation</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Display Active Issued Orders for this Encounter */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-200 pb-1 flex justify-between items-center">
                    <span>Active Encounter Medical Orders ({totalPendingOrdersCount})</span>
                    <span className="text-[10px] text-slate-500 font-normal">Task Queue for Departments</span>
                  </h4>

                  {totalPendingOrdersCount === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded border border-dashed border-slate-200">
                      No clinical orders issued yet for this visit encounter. Use the order checkboxes above to issue pending tasks.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      
                      {/* Lab Orders */}
                      {visitOrders.labOrders.map((ord) => (
                        <div key={ord.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="h-4 w-4 text-teal-600" />
                            <div>
                              <span className="font-bold text-slate-900">{ord.testName}</span>
                              <span className="text-[10px] text-slate-500 ml-2 font-mono">({ord.category})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              ord.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              ord.status === OrderStatus.IN_PROGRESS ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                              ord.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {ord.status}
                            </span>
                            {ord.status === OrderStatus.PENDING && (
                              <button
                                onClick={() => setCancelTarget({ type: 'lab', id: ord.id, name: ord.testName })}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Cancel Order"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Radiology Orders */}
                      {visitOrders.radiologyOrders.map((ord) => (
                        <div key={ord.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-600" />
                            <div>
                              <span className="font-bold text-slate-900">{ord.procedureName}</span>
                              <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded ml-2 border border-indigo-200 font-bold">{ord.modality}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              ord.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              ord.status === OrderStatus.IN_PROGRESS ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                              ord.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {ord.status}
                            </span>
                            {ord.status === OrderStatus.PENDING && (
                              <button
                                onClick={() => setCancelTarget({ type: 'radiology', id: ord.id, name: `${ord.modality}: ${ord.procedureName}` })}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Cancel Order"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Admission Orders */}
                      {visitOrders.admissionOrders.map((ord) => (
                        <div key={ord.id} className="p-2.5 bg-amber-50/50 border border-amber-200 rounded flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-amber-700" />
                            <div>
                              <span className="font-bold text-amber-950">Admission Request: {ord.recommendedWard.replace('_', ' ')}</span>
                              <span className="text-[10px] text-amber-800 ml-2 font-semibold">({ord.admissionType})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              ord.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              ord.status === OrderStatus.IN_PROGRESS ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                              ord.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {ord.status}
                            </span>
                            {ord.status === OrderStatus.PENDING && (
                              <button
                                onClick={() => setCancelTarget({ type: 'admission', id: ord.id, name: `Ward Admission (${ord.recommendedWard.replace('_', ' ')})` })}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Cancel Order"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Operation Orders */}
                      {visitOrders.operationOrders.map((ord) => (
                        <div key={ord.id} className="p-2.5 bg-red-50/50 border border-red-200 rounded flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <Scissors className="h-4 w-4 text-red-700" />
                            <div>
                              <span className="font-bold text-red-950">Surgery Order: {ord.procedureName}</span>
                              <span className="text-[10px] text-red-800 ml-2 font-semibold">({ord.anesthesiaType} Anesthesia - {ord.urgency})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              ord.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              ord.status === OrderStatus.IN_PROGRESS ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                              ord.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {ord.status}
                            </span>
                            {ord.status === OrderStatus.PENDING && (
                              <button
                                onClick={() => setCancelTarget({ type: 'operation', id: ord.id, name: `Surgery (${ord.procedureName})` })}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Cancel Order"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}


                    </div>
                  )}
                </div>

              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {pastVisits.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    No previous hospital visits recorded for this patient.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pastVisits.map((pv) => (
                      <div key={pv.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex flex-col gap-1 text-xs">
                        <div className="flex justify-between items-center font-bold text-slate-800">
                          <span>{pv.visitNumber} ({new Date(pv.visitDate).toLocaleDateString()})</span>
                          <span className="text-teal-700">{pv.doctorName}</span>
                        </div>
                        {pv.chiefComplaint && (
                          <p className="text-slate-600"><strong className="text-slate-700">Complaint:</strong> {pv.chiefComplaint}</p>
                        )}
                        {pv.clinicalNotes && (
                          <p className="text-slate-600"><strong className="text-slate-700">Notes:</strong> {pv.clinicalNotes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="text-center py-6 bg-slate-50 rounded border border-dashed border-slate-200">
                <Pill className="h-6 w-6 text-teal-600 mx-auto mb-2" />
                <p className="text-xs text-slate-700 font-bold">Digital e-Prescriptions Active</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Use the Digital e-Prescription Builder above to issue and save medications for this visit.</p>
              </div>
            )}

            {activeTab === 'lab' && (
              <div className="space-y-4">
                {visitOrders.labOrders.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded border border-dashed border-slate-200">
                    <FlaskConical className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No laboratory diagnostic orders found for this visit.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Orders Status List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {visitOrders.labOrders.map((l) => (
                        <div key={l.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between items-center">
                          <div>
                            <strong className="text-slate-900">{l.testName}</strong>
                            <span className="text-[10px] text-slate-500 ml-1">({l.category})</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            l.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            l.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {l.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Completed Laboratory Reports Display */}
                    {visitLabReports.length > 0 && (
                      <div className="pt-2 space-y-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-200 pb-1">
                          Released Diagnostic Reports ({visitLabReports.length})
                        </h4>

                        {visitLabReports.map((report) => (
                          <div key={report.id} className="bg-white border border-teal-200 rounded-xl shadow-sm overflow-hidden text-xs">
                            {/* Report Header */}
                            <div className="bg-teal-50 border-b border-teal-100 p-3 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-900 text-sm">Report #{report.reportNumber}</span>
                                <p className="text-[10px] text-teal-800 font-medium">
                                  Released on {new Date(report.resultDate).toLocaleString()} by <strong className="text-slate-900">{report.technicianName}</strong>
                                </p>
                              </div>

                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {report.status}
                              </span>
                            </div>

                            {/* Parameter Table */}
                            <div className="p-3">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                                    <th className="py-1.5 px-2">Parameter</th>
                                    <th className="py-1.5 px-2">Result</th>
                                    <th className="py-1.5 px-2">Unit</th>
                                    <th className="py-1.5 px-2">Ref. Range</th>
                                    <th className="py-1.5 px-2 text-right">Flag</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {report.items.map((item, idx) => (
                                    <tr key={idx} className={item.isAbnormal ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                                      <td className="py-2 px-2 font-bold text-slate-900">{item.parameterName}</td>
                                      <td className={`py-2 px-2 font-black ${item.isAbnormal ? 'text-red-600 font-black' : 'text-slate-900'}`}>
                                        {item.resultValue}
                                      </td>
                                      <td className="py-2 px-2 text-slate-600">{item.unit || '-'}</td>
                                      <td className="py-2 px-2 font-mono text-[11px] text-slate-500">{item.referenceRange || '-'}</td>
                                      <td className="py-2 px-2 text-right">
                                        {item.isAbnormal ? (
                                          <span className="bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase border border-red-200">
                                            ABNORMAL
                                          </span>
                                        ) : (
                                          <span className="text-[10px] text-slate-400 font-medium">Normal</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              {/* Remarks */}
                              {report.overallRemarks && (
                                <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                                  <span className="font-bold text-slate-700 block text-[10px] uppercase">Pathology Diagnostic Remarks:</span>
                                  <p className="text-slate-800 italic mt-0.5">{report.overallRemarks}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}


            {activeTab === 'radiology' && (
              <div className="space-y-2">
                {visitOrders.radiologyOrders.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded border border-dashed border-slate-200">
                    <FileText className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">No radiology imaging orders found for this visit.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {visitOrders.radiologyOrders.map((r) => (
                      <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between items-center">
                        <div>
                          <strong className="text-slate-900">{r.procedureName}</strong> ({r.modality})
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Custom Cancel Confirmation Modal Overlay (Centered) */}

      {cancelTarget && (
        <div className="no-print fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cancel Medical Order?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-normal">
                Are you sure you want to cancel the pending order for{' '}
                <strong className="text-slate-900 font-bold">{cancelTarget.name}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancellingOrder}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
              >
                Keep Order
              </button>
              <button
                onClick={executeCancelOrder}
                disabled={cancellingOrder}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-md transition flex items-center gap-1.5"
              >
                {cancellingOrder ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal Overlay */}
      {customAlert?.isOpen && (
        <div className="no-print fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{customAlert.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-normal">
                {customAlert.message}
              </p>
            </div>
            <div className="flex items-center justify-center pt-2">
              <button
                onClick={() => setCustomAlert(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow transition"
              >
                Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS Print Isolation for EMR Prescription Pad */}

      <style jsx global>{`
        @media print {
          /* Force Chrome, Firefox, Safari to print background colors and images */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Hide sidebar, top navigation, background dashboard shell, and modal action controls */
          aside,
          header,
          .no-print,
          .no-print * {
            display: none !important;
          }

          /* Reset page body background and overflow */
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          /* Convert fixed modal overlay into static document flow for print */
          .fixed {
            position: static !important;
            inset: auto !important;
            background: transparent !important;
            overflow: visible !important;
            padding: 0 !important;
          }

          /* Clean full-width prescription pad printing */
          .emr-print-pad {
            width: 100% !important;
            max-width: 100% !important;
            height: 275mm !important;
            max-height: 275mm !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
          }

          @page {
            size: A4 portrait;
            margin: 5mm;
          }
        }
      `}</style>
    </div>
  );
};
