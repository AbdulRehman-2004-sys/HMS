'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  getPublicDepartmentsApi,
  getPublicDoctorsApi,
  PublicDepartment,
  PublicDoctorProfile,
} from '../../lib/public-doctors';
import {
  bookOnlineAppointmentApi,
  AppointmentRecord,
} from '../../lib/appointments';
import {
  Calendar,
  User,
  Phone,
  MapPin,
  Stethoscope,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  X,
  Clock,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

function BookAppointmentForm() {
  const searchParams = useSearchParams();
  const doctorSlugParam = searchParams?.get('doctor') || '';

  const [departments, setDepartments] = useState<PublicDepartment[]>([]);
  const [allDoctors, setAllDoctors] = useState<PublicDoctorProfile[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form Fields
  const [department, setDepartment] = useState<string>('');
  const [doctorId, setDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [fatherHusbandName, setFatherHusbandName] = useState<string>('');
  const [age, setAge] = useState<number | string>('');
  const [gender, setGender] = useState<string>('Male');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');

  // Status & Confirmation Modal
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<AppointmentRecord | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptsData, docsData] = await Promise.all([
          getPublicDepartmentsApi(),
          getPublicDoctorsApi(),
        ]);

        setDepartments(deptsData);
        setAllDoctors(docsData);

        // Pre-select doctor if passed in query param
        if (doctorSlugParam) {
          const matchDoc = docsData.find(
            (d) => d.slug.toLowerCase() === doctorSlugParam.toLowerCase() || d.id === doctorSlugParam
          );
          if (matchDoc) {
            setDoctorId(matchDoc.id);
            setDepartment(matchDoc.departmentSlug || matchDoc.department);
          }
        }
      } catch (err) {
        console.error('Failed to load metadata', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();
    // Default appointment date to today
    setAppointmentDate(todayStr);
  }, [doctorSlugParam, todayStr]);

  // Filter doctors list based on selected department
  const filteredDoctors = department
    ? allDoctors.filter(
        (d) =>
          d.departmentSlug.toLowerCase() === department.toLowerCase() ||
          d.department.toLowerCase().includes(department.toLowerCase())
      )
    : allDoctors;

  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    // Reset selected doctor if not in new department
    if (newDept) {
      const matchInDept = allDoctors.find(
        (d) =>
          (d.departmentSlug.toLowerCase() === newDept.toLowerCase() ||
            d.department.toLowerCase().includes(newDept.toLowerCase())) &&
          d.id === doctorId
      );
      if (!matchInDept) {
        setDoctorId('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!department) {
      setFormError('Please select a clinical department');
      return;
    }
    if (!doctorId) {
      setFormError('Please select a specialist doctor');
      return;
    }
    if (!appointmentDate) {
      setFormError('Please select an appointment date');
      return;
    }
    if (appointmentDate < todayStr) {
      setFormError('Appointment date cannot be in the past');
      return;
    }
    if (!patientName.trim()) {
      setFormError('Please enter patient full name');
      return;
    }
    if (!fatherHusbandName.trim()) {
      setFormError('Please enter father or husband name');
      return;
    }
    if (!age || Number(age) <= 0) {
      setFormError('Please enter a valid age');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setFormError('Please enter a valid phone number (at least 10 digits)');
      return;
    }
    if (!address.trim()) {
      setFormError('Please enter patient residential address');
      return;
    }

    setSubmitting(true);
    try {
      const result = await bookOnlineAppointmentApi({
        department,
        doctorId,
        appointmentDate,
        patientName: patientName.trim(),
        fatherHusbandName: fatherHusbandName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        address: address.trim(),
        reasonForVisit: reasonForVisit.trim() || undefined,
      });

      setConfirmedAppointment(result);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctorObj = allDoctors.find((d) => d.id === doctorId);

  return (
    <div className="space-y-8">
      
      {loadingInitial ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner label="Initializing appointment booking system..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Booking Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                <span>Online Appointment Request Form</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill in patient details below. All appointments register instantly into our HMS Reception Dashboard.
              </p>
            </div>

            {formError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Department & Doctor Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-teal-600" />
                    <span>Clinical Department *</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                    <span>Specialist Doctor *</span>
                  </label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">-- Select Doctor --</option>
                    {filteredDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.fullName} ({doc.specialization}) - PKR {doc.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* 2. Appointment Date Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-teal-600" />
                  <span>Preferred Appointment Date *</span>
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>

              {/* 3. Patient Information Fields */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
                  Patient Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Patient Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Muhammad Ali"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Father / Husband Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq Mehmood"
                      value={fatherHusbandName}
                      onChange={(e) => setFatherHusbandName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Age (Years) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 35"
                      min="0"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-teal-600" />
                      <span>Phone Number *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="03001234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                  </div>

                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-teal-600" />
                    <span>Residential Address *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="House / Street #, Sector, City"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Reason for Visit / Symptoms (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your symptoms or reason for consulting the doctor..."
                    value={reasonForVisit}
                    onChange={(e) => setReasonForVisit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none"
                  />
                </div>

              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span>Submitting Appointment Request...</span>
                  ) : (
                    <>
                      <span>Confirm & Book Appointment</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Information & Doctor Card Preview */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Selected Doctor Summary Card */}
            {selectedDoctorObj ? (
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">Selected Physician</span>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-800 border border-teal-500/40 flex items-center justify-center font-bold text-teal-300 text-base shrink-0">
                    {selectedDoctorObj.firstName[0]}
                    {selectedDoctorObj.lastName[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">{selectedDoctorObj.fullName}</h4>
                    <p className="text-xs text-teal-300 font-semibold">{selectedDoctorObj.specialization}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{selectedDoctorObj.qualification}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Consultation Fee:</span>
                  <strong className="text-white font-black">PKR {selectedDoctorObj.consultationFee}</strong>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-slate-500 text-xs text-center space-y-2">
                <Stethoscope className="h-8 w-8 text-teal-600 mx-auto opacity-40" />
                <p className="font-bold text-slate-700">No Doctor Selected</p>
                <p>Select a department and specialist doctor from the form to view fee and schedule details.</p>
              </div>
            )}

            {/* How Online Appointment Works */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>How Online Appointment Works</span>
              </h3>

              <ul className="space-y-3 text-xs text-slate-600 leading-relaxed font-normal">
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center shrink-0 text-[10px]">1</span>
                  <span><strong>Submit Booking Form:</strong> Receive your unique Appointment Number (e.g. <code>APT-20260722-0001</code>).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center shrink-0 text-[10px]">2</span>
                  <span><strong>Arrive at Reception:</strong> Present your Appointment Number at the hospital main reception desk on your booking date.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center shrink-0 text-[10px]">3</span>
                  <span><strong>One-Click Check In:</strong> Receptionist verifies your arrival, generates your MR Number & Registration Slip, and assigns your Doctor Queue Token (<code>Q-001</code>).</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* Confirmation Modal */}
      {confirmedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 no-print">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden space-y-6 p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Appointment Booked!</h3>
                  <p className="text-xs text-slate-500">Registered in HMS Reception Dashboard</p>
                </div>
              </div>

              <button
                onClick={() => setConfirmedAppointment(null)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Appointment Number Highlight Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-1 border border-slate-800 shadow-inner">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Your Appointment Number</span>
              <strong className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white block">
                {confirmedAppointment.appointmentNumber}
              </strong>
              <span className="inline-block px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold uppercase rounded font-mono mt-1">
                STATUS: PENDING CHECK-IN
              </span>
            </div>

            {/* Appointment Summary Table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Patient Name:</span>
                <strong className="text-slate-900">{confirmedAppointment.patientName} ({confirmedAppointment.gender}, {confirmedAppointment.age} Yrs)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Father / Husband:</span>
                <strong className="text-slate-900">{confirmedAppointment.fatherHusbandName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Phone Number:</span>
                <strong className="text-slate-900 font-mono">{confirmedAppointment.phone}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Doctor:</span>
                <strong className="text-teal-700">{confirmedAppointment.doctorName || 'Consultant Doctor'}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Appointment Date:</span>
                <strong className="text-slate-900 font-mono">{confirmedAppointment.appointmentDate}</strong>
              </div>
            </div>

            {/* Instructions */}
            <p className="text-[11px] text-slate-600 leading-relaxed text-center bg-teal-50 p-3 rounded-xl border border-teal-100">
              Please present your Appointment Number <strong>{confirmedAppointment.appointmentNumber}</strong> at the main reception desk on your arrival date to complete your check-in and receive your queue token.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => {
                  setConfirmedAppointment(null);
                  setPatientName('');
                  setFatherHusbandName('');
                  setPhone('');
                  setAddress('');
                  setReasonForVisit('');
                }}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Book Appointment' }]} />
        </Container>
      </div>

      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container>
          <SectionTitle
            tagline="Patient OPD Scheduling"
            title="Book an Online Appointment"
            subtitle="Select your specialty department, doctor, and date. Your booking will automatically transfer to our HMS Reception Desk for rapid check-in."
            align="left"
          />

          <Suspense fallback={<LoadingSpinner label="Loading form..." />}>
            <BookAppointmentForm />
          </Suspense>

        </Container>
      </section>
    </PublicLayout>
  );
}
