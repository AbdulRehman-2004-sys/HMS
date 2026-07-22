'use client';

import React, { useState, useEffect } from 'react';
import { getHospitalSettingsApi, HospitalSettings } from '../../../lib/settings';
import {
  getBillingSummaryApi,
  generateInvoiceApi,
  recordPaymentApi,
  BillingSummaryData,
  UnbilledEncounterData,
  InvoiceData,
  PaymentStatus,
  PaymentMethod,
} from '../../../lib/billing';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import {
  CreditCard,
  Search,
  RefreshCw,
  Printer,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  Receipt,
  X,
  Building,
  User,
  ShieldCheck,
  Check,
  Stethoscope,
  FlaskConical,
  Bed,
  Scissors,
} from 'lucide-react';

export default function BillingDashboardPage() {
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings | null>(null);
  const [summary, setSummary] = useState<BillingSummaryData>({
    todayTotalInvoiced: 0,
    todayRevenueCollected: 0,
    pendingBillsCount: 0,
    encounters: [],
  });

  useEffect(() => {
    getHospitalSettingsApi()
      .then(setHospitalSettings)
      .catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Active Invoice View & Payment Modal
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [processingPayment, setProcessingPayment] = useState(false);

  // 80mm Thermal Receipt Printable Modal
  const [showThermalReceipt, setShowThermalReceipt] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const data = await getBillingSummaryApi(searchQuery);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load billing summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [searchQuery]);

  const handleGenerateInvoice = async (encounter: UnbilledEncounterData) => {
    try {
      setIsLoading(true);
      const inv = await generateInvoiceApi(encounter.visitId);
      setActiveInvoice(inv);
      setToastMsg(`Invoice #${inv.billNumber} generated successfully!`);
      setTimeout(() => setToastMsg(''), 4000);
      await loadSummary();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to generate invoice.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!activeInvoice) return;

    try {
      setProcessingPayment(true);
      const updated = await recordPaymentApi(activeInvoice.id, {
        paymentMethod,
        amountPaid: activeInvoice.totalAmount,
      });

      setActiveInvoice(updated);
      setToastMsg(`Payment of Rs. ${updated.paidAmount.toLocaleString()} recorded! Status: PAID`);
      setTimeout(() => setToastMsg(''), 5000);

      await loadSummary();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to record payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <PermissionGuard permission={Permission.ACCESS_BILLING}>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
              <CreditCard className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Billing, Invoicing & Cashier Counter
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Automatic charge collection (Consultation, Lab, Radiology, Admission, Operations), payment receipting, and 80mm thermal receipts.
              </p>
            </div>
          </div>

          <button
            onClick={loadSummary}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Billing Queue</span>
          </button>
        </div>

        {toastMsg && (
          <div className="bg-emerald-500 text-white text-center text-xs font-bold py-2.5 rounded-lg shadow">
            {toastMsg}
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Total Invoiced</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Rs. {summary.todayTotalInvoiced.toLocaleString()}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Aggregated hospital bills</p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
              <Receipt className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Collected Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Rs. {summary.todayRevenueCollected.toLocaleString()}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Payments cleared (PAID)</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Unpaid Bills</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.pendingBillsCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Awaiting cashier collection</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Encounters & Billing Queue Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Patient Encounters & Accounts Queue
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                One-click automatic bill generation collecting charges from OPD, Lab, Radiology, Admission, and Operations.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, MRN, Token..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
              <span>Loading patient billing accounts...</span>
            </div>
          ) : summary.encounters.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No patient encounter accounts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-3 px-3">Token & Date</th>
                    <th className="py-3 px-3">Patient Info</th>
                    <th className="py-3 px-3">Consultant Doctor</th>
                    <th className="py-3 px-3">Aggregated Services Breakdown</th>
                    <th className="py-3 px-3">Bill Total</th>
                    <th className="py-3 px-3">Payment Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.encounters.map((enc) => (
                    <tr key={enc.visitId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Q-#{String(enc.tokenNumber).padStart(3, '0')}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(enc.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{enc.patientName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">MRN: {enc.patientMrNumber} ({enc.patientAge ? `${enc.patientAge}Y` : 'N/A'} / {enc.patientGender})</p>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-700">
                        {enc.doctorName}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            OPD Fee (Rs. {enc.consultationFee})
                          </span>
                          {enc.labOrdersCount > 0 && (
                            <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200 flex items-center gap-0.5">
                              <FlaskConical className="h-3 w-3" />
                              <span>{enc.labOrdersCount} Lab Tests</span>
                            </span>
                          )}
                          {enc.radiologyOrdersCount > 0 && (
                            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 flex items-center gap-0.5">
                              <FileText className="h-3 w-3" />
                              <span>{enc.radiologyOrdersCount} Scans</span>
                            </span>
                          )}
                          {enc.hasAdmission && (
                            <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                              <Bed className="h-3 w-3" />
                              <span>Admission</span>
                            </span>
                          )}
                          {enc.hasOperation && (
                            <span className="bg-red-50 text-red-800 px-1.5 py-0.5 rounded border border-red-200 flex items-center gap-0.5">
                              <Scissors className="h-3 w-3" />
                              <span>Operation</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-black text-slate-900">
                        Rs. {enc.estimatedTotal.toLocaleString()}
                      </td>

                      <td className="py-3 px-3">
                        {enc.paymentStatus ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            enc.paymentStatus === PaymentStatus.PAID
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {enc.paymentStatus}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                            UNBILLED
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {enc.invoiceId ? (
                          <button
                            onClick={async () => {
                              const inv = await generateInvoiceApi(enc.visitId);
                              setActiveInvoice(inv);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5 ml-auto"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            <span>View Bill / Pay</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateInvoice(enc)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5 ml-auto"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Generate Bill</span>
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

      {/* READ-ONLY INVOICE & PAYMENT MODAL OVERLAY */}
      {activeInvoice && !showThermalReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 md:p-6">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 my-auto">
            
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Official Patient Invoice #{activeInvoice.billNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Read-only Bill • Token <strong className="text-emerald-300">#{String(activeInvoice.tokenNumber).padStart(3, '0')}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Patient & Billing Info Box */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                <span className="font-bold text-slate-900">{activeInvoice.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">MR Number</span>
                <span className="font-mono font-semibold text-slate-800">{activeInvoice.patientMrNumber}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Consultant Doctor</span>
                <span className="font-semibold text-slate-800">{activeInvoice.doctorName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Receptionist Staff</span>
                <span className="font-semibold text-slate-800">{activeInvoice.receptionistName}</span>
              </div>
            </div>

            {/* Itemized Services Breakdown Table */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[55vh]">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1">
                Automatically Aggregated Service Charges
              </h4>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-slate-600 uppercase tracking-wider font-bold text-[10px]">
                    <th className="py-2.5 px-3">Service Category</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeInvoice.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                          {item.serviceCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.itemDescription}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-mono">Rs. {item.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">Rs. {item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation Card */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs border border-slate-800">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono font-bold">Rs. {activeInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-bold text-sm border-t border-slate-800 pt-2">
                  <span className="uppercase tracking-wider">Total Bill Amount:</span>
                  <span className="font-mono font-black text-lg">Rs. {activeInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 border-t border-slate-800 pt-2 text-[11px]">
                  <span>Paid Amount: <strong className="text-white">Rs. {activeInvoice.paidAmount.toLocaleString()}</strong></span>
                  <span>Remaining Balance: <strong className="text-amber-400 font-bold">Rs. {activeInvoice.remainingAmount.toLocaleString()}</strong></span>
                </div>
              </div>

              {/* Payment Method Selector (If Pending) */}
              {activeInvoice.paymentStatus !== PaymentStatus.PAID && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-900 block text-[11px] uppercase">Select Payment Mode:</span>
                    <p className="text-[10px] text-amber-700">Cashier collection for immediate clearance</p>
                  </div>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="p-2 bg-white border border-amber-300 rounded font-bold text-slate-900 focus:outline-none"
                  >
                    <option value={PaymentMethod.CASH}>Cash Payment</option>
                    <option value={PaymentMethod.CARD}>Debit/Credit Card</option>
                    <option value={PaymentMethod.ONLINE}>Online Transfer / EasyPaisa</option>
                  </select>
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setActiveInvoice(null)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowThermalReceipt(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>80mm Thermal Receipt</span>
                </button>

                {activeInvoice.paymentStatus !== PaymentStatus.PAID && (
                  <button
                    onClick={handleRecordPayment}
                    disabled={processingPayment}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{processingPayment ? 'Processing...' : `Collect Rs. ${activeInvoice.remainingAmount.toLocaleString()} & Mark PAID`}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 80MM THERMAL RECEIPT PRINTABLE MODAL OVERLAY */}
      {activeInvoice && showThermalReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-4">
          <div className="bg-white w-full max-w-[340px] rounded-xl shadow-2xl p-4 flex flex-col my-auto border border-slate-300 text-slate-900 font-mono text-[11px]">
            
            {/* Non-Printable Header Control */}
            <div className="no-print pb-3 border-b border-slate-200 flex justify-between items-center mb-3">
              <span className="font-bold text-xs text-slate-700 uppercase">80mm Thermal Paper Preview</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleTriggerPrint}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded shadow flex items-center gap-1"
                >
                  <Printer className="h-3 w-3" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowThermalReceipt(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* THERMAL RECEIPT CONTENT AREA (Optimized for 80mm roll printer) */}
            <div className="space-y-3 text-center border p-3 border-dashed border-slate-300 bg-white shadow-inner">
              
              {/* Header */}
              <div>
                {hospitalSettings?.hospitalLogo && (
                  <div className="flex justify-center mb-1">
                    <img src={hospitalSettings.hospitalLogo} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                  </div>
                )}
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  {hospitalSettings?.hospitalName || 'LALA MEDICAL COMPLEX'}
                </h2>
                <p className="text-[10px] text-slate-600">
                  {hospitalSettings?.address || 'Main Stadium Road, Sargodha, Punjab'} • Ph: {hospitalSettings?.contactNumber || '+92 300 1234567'}
                </p>
                <p className="text-[10px] font-bold text-slate-800 border-t border-b border-slate-900 py-1 my-1 uppercase">
                  OFFICIAL PAYMENT RECEIPT
                </p>
              </div>

              {/* Patient Meta Details */}
              <div className="text-left text-[10px] space-y-0.5 border-b border-slate-300 pb-2">
                <p><strong>Bill #:</strong> {activeInvoice.billNumber}</p>
                <p><strong>Date:</strong> {new Date(activeInvoice.createdAt).toLocaleString()}</p>
                <p><strong>Patient:</strong> {activeInvoice.patientName} ({activeInvoice.patientGender})</p>
                <p><strong>MRN:</strong> {activeInvoice.patientMrNumber}</p>
                <p><strong>Doctor:</strong> {activeInvoice.doctorName}</p>
                <p><strong>Cashier:</strong> {activeInvoice.receptionistName}</p>
              </div>

              {/* Items Table */}
              <div className="text-left text-[10px]">
                <div className="flex justify-between border-b border-slate-800 font-bold pb-0.5 mb-1 uppercase">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>

                {activeInvoice.items.map((it) => (
                  <div key={it.id} className="flex justify-between py-0.5">
                    <span className="truncate pr-2">{it.itemDescription}</span>
                    <span className="font-bold">Rs.{it.totalPrice}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-800 pt-1.5 text-left text-[10px] space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>TOTAL AMOUNT:</span>
                  <span>Rs. {activeInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-800">
                  <span>PAID ({activeInvoice.paymentMethod || 'CASH'}):</span>
                  <span>Rs. {activeInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>REMAINING BAL:</span>
                  <span>Rs. {activeInvoice.remainingAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Box */}
              <div className="my-2 p-1.5 border border-slate-900 text-center font-black uppercase tracking-widest text-xs">
                *** {activeInvoice.paymentStatus} ***
              </div>

              {/* Footer */}
              <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-300">
                <p>Thank you for visiting {hospitalSettings?.hospitalName || 'LALA Medical Complex'}.</p>
                <p className="italic">Wish you good health!</p>
              </div>

            </div>

          </div>
        </div>
      )}

    </PermissionGuard>
  );
}
