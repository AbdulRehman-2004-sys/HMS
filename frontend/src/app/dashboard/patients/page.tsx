'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import { RegistrationSlip } from '../../../components/RegistrationSlip';
import { CreateVisitModal } from '../../../components/CreateVisitModal';
import { 
  Search, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  X,
  CheckCircle,
  Plus,
  Phone,
  MapPin,
  Printer,
  Hash,
  Activity,
  User,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  getPendingCheckinAppointmentsApi,
  checkinOnlineAppointmentApi,
  AppointmentRecord,
} from '../../../lib/appointments';

interface PatientItem {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  fatherHusbandName: string;
  gender: string;
  dateOfBirth?: string | null;
  age?: number | null;
  maritalStatus?: string | null;
  mobileNumber: string;
  alternateMobileNumber?: string | null;
  address: string;
  city: string;
  cnic?: string | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  remarks?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PatientsApiResponse {
  success: boolean;
  data: {
    patients: PatientItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

export default function PatientsPage() {
  const queryClient = useQueryClient();

  // Tab state & Online Appointments Check-in state
  const [activeTab, setActiveTab] = useState<'registered' | 'online_pending'>('registered');
  const [onlineCheckinLoadingId, setOnlineCheckinLoadingId] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [printPatient, setPrintPatient] = useState<PatientItem | null>(null);
  const [checkInPatient, setCheckInPatient] = useState<PatientItem | null>(null);

  // Form error & loading states
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Query online pending appointments
  const {
    data: pendingAptsData,
    isLoading: pendingAptsLoading,
    refetch: refetchPendingApts,
  } = useQuery<AppointmentRecord[]>({
    queryKey: ['pending-appointments', searchTerm],
    queryFn: () => getPendingCheckinAppointmentsApi(searchTerm),
  });

  const pendingAppointmentsList = pendingAptsData || [];

  const handleOnlineCheckin = async (apt: AppointmentRecord) => {
    setOnlineCheckinLoadingId(apt.id);
    setFormError(null);
    setFormSuccess(null);

    try {
      const result = await checkinOnlineAppointmentApi(apt.id);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      refetchPendingApts();

      // Automatically open thermal registration slip modal for printout
      setPrintPatient({
        id: result.patient.id,
        mrNumber: result.patient.mrNumber,
        firstName: result.patient.fullName.split(' ')[0] || 'Patient',
        lastName: result.patient.fullName.split(' ').slice(1).join(' ') || '',
        fullName: result.patient.fullName,
        fatherHusbandName: apt.fatherHusbandName,
        gender: apt.gender,
        age: apt.age,
        mobileNumber: result.patient.phone || apt.phone,
        address: apt.address,
        city: 'Sargodha',
        isActive: true,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setFormSuccess(
        `Patient checked in successfully! Assigned MRN: ${result.patient.mrNumber}, Queue Token: ${result.visit.tokenNumber}`
      );
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || err.message || 'Failed to check in online appointment');
    } finally {
      setOnlineCheckinLoadingId(null);
    }
  };


  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherHusbandName, setFatherHusbandName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState<number | string>('');
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateMobileNumber, setAlternateMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Sargodha');
  const [cnic, setCnic] = useState('');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fetch current user details from localStorage
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('hms_user') : null;
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const isSuperAdmin = currentUser?.roles?.includes('Super Admin');
  const isReceptionist = currentUser?.roles?.includes('Receptionist');
  const canRegister = isSuperAdmin || isReceptionist;

  // Query list of patients
  const { data, isLoading, isError, error } = useQuery<PatientsApiResponse>({
    queryKey: ['patients', searchTerm, selectedGender, selectedStatus, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedGender) params.append('gender', selectedGender);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await api.get(`/patients?${params.toString()}`);
      return response.data;
    },
  });

  const patientsList = data?.data?.patients || [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, limit, pages: 1 };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setFatherHusbandName('');
    setGender('Male');
    setDateOfBirth('');
    setAge('');
    setMaritalStatus('Single');
    setMobileNumber('');
    setAlternateMobileNumber('');
    setAddress('');
    setCity('Sargodha');
    setCnic('');
    setBloodGroup('Unknown');
    setAllergies('');
    setChronicDiseases('');
    setRemarks('');
    setFormError(null);
    setFormSuccess(null);
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!firstName || !lastName || !fatherHusbandName || !mobileNumber || !address) {
      setFormError('Please fill in all required fields marked with *');
      return;
    }

    setCreateLoading(true);

    try {
      const response = await api.post('/patients', {
        firstName,
        lastName,
        fatherHusbandName,
        gender,
        dateOfBirth: dateOfBirth || undefined,
        age: age ? Number(age) : undefined,
        maritalStatus,
        mobileNumber,
        alternateMobileNumber: alternateMobileNumber || undefined,
        address,
        city: city || 'Sargodha',
        cnic: cnic || undefined,
        bloodGroup,
        allergies: allergies || undefined,
        chronicDiseases: chronicDiseases || undefined,
        remarks: remarks || undefined,
      });

      const newPatient = response.data?.data?.patient;

      setFormSuccess(`Patient registered successfully! MRN: ${newPatient?.mrNumber}`);
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      setTimeout(() => {
        setShowCreateModal(false);
        resetForm();
        if (newPatient) {
          setPrintPatient(newPatient);
        }
      }, 1000);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to register patient profile.');
    } finally {
      setCreateLoading(false);
    }
  };

  const triggerThermalPrint = () => {
    window.print();
  };

  return (
    <PermissionGuard permission={Permission.ACCESS_RECEPTION}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-teal-600" />
              <span>Patient Registry & Master Index</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Search permanent MR numbers, register new patients, and print thermal registration slips.
            </p>
          </div>

          {/* Action Button */}
          {canRegister && (
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-md transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Patient</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'registered'
                ? 'border-teal-600 text-teal-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            } rounded-t-lg flex items-center gap-2`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Master Patient Index ({pagination.total})</span>
          </button>

          <button
            onClick={() => setActiveTab('online_pending')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'online_pending'
                ? 'border-teal-600 text-teal-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            } rounded-t-lg flex items-center gap-2`}
          >
            <Calendar className="h-4 w-4 text-teal-600" />
            <span>Online Pending Check-ins</span>
            {pendingAppointmentsList.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-teal-600 text-white rounded-full">
                {pendingAppointmentsList.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'online_pending' ? (
          <div className="space-y-4">
            {/* Search Bar for Pending Appointments */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search appointment #, patient name, or phone..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-md outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Online bookings automatically sync into this queue for reception check-in.
              </div>
            </div>

            {/* Pending Appointments Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              {pendingAptsLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  <span className="text-xs font-medium">Loading online pending appointments...</span>
                </div>
              ) : pendingAppointmentsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3">Appointment #</th>
                        <th className="px-4 py-3">Patient Name / Father</th>
                        <th className="px-4 py-3">Age / Gender</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Doctor & Dept</th>
                        <th className="px-4 py-3">Appt Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {pendingAppointmentsList.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-teal-700">
                            {apt.appointmentNumber}
                          </td>
                          <td className="px-4 py-3">
                            <strong className="text-slate-900 block">{apt.patientName}</strong>
                            <span className="text-[11px] text-slate-500 block">S/O, W/O: {apt.fatherHusbandName}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {apt.age} Yrs / {apt.gender}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700">
                            {apt.phone}
                          </td>
                          <td className="px-4 py-3">
                            <strong className="text-slate-800 block">{apt.doctorName || 'Specialist'}</strong>
                            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-mono border border-teal-200 inline-block mt-0.5">
                              {apt.department}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700">
                            {apt.appointmentDate}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold rounded font-mono uppercase">
                              PENDING CHECK-IN
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleOnlineCheckin(apt)}
                              disabled={onlineCheckinLoadingId === apt.id}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md shadow-sm transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {onlineCheckinLoadingId === apt.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              <span>Check In</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs space-y-1">
                  <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-40" />
                  <p className="font-bold text-slate-800">No Online Pending Check-ins</p>
                  <p>When patients book online appointments from the public website, they will appear here instantly for one-click reception check-in.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by MR Number, Name, Phone, or CNIC..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-md outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Gender Filter */}
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white text-slate-700 font-medium"
            >
              <option value="">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white text-slate-700 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Terminal</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table Content Area */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <span className="text-xs font-medium">Fetching patient master records...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800">Failed to Load Patient Records</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                {(error as any)?.response?.data?.error?.message || 'A network error occurred while querying the server.'}
              </p>
            </div>
          ) : patientsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                <User className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No Patient Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {searchTerm || selectedGender || selectedStatus
                  ? 'No matching patient records were found for your current query filters.'
                  : 'There are currently no patient records registered in the system.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3">MR Number</th>
                      <th className="px-6 py-3">Patient Name</th>
                      <th className="px-6 py-3">Father / Husband</th>
                      <th className="px-6 py-3">Age / Gender</th>
                      <th className="px-6 py-3">Mobile Number</th>
                      <th className="px-6 py-3">City / Address</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {patientsList.map((pat) => (
                      <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-teal-700">
                          <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-xs">
                            <Hash className="h-3 w-3 text-teal-600" />
                            {pat.mrNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          <span className="block">{pat.fullName}</span>
                          {pat.cnic && (
                            <span className="text-[10px] font-mono text-slate-400 font-normal">CNIC: {pat.cnic}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{pat.fatherHusbandName}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {pat.age ? `${pat.age} Yrs` : 'N/A'} • {pat.gender}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {pat.mobileNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{pat.city} ({pat.address})</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canRegister && (
                              <button
                                onClick={() => setCheckInPatient(pat)}
                                className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-all shadow-sm"
                                title="Check In Patient to Doctor Queue"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Check In</span>
                              </button>
                            )}
                            <button
                              onClick={() => setPrintPatient(pat)}
                              className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-all"
                              title="Print Registration Slip"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Slip</span>
                            </button>
                            <Link
                              href={`/dashboard/patients/${pat.id}`}
                              className="inline-flex items-center justify-center gap-1 h-8 px-3 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-md transition-all"
                            >
                              View Details
                            </Link>
                          </div>
                        </td>
                      </tr>

                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-xs text-slate-500">
                  Showing <strong className="text-slate-700">{patientsList.length}</strong> of{' '}
                  <strong className="text-slate-700">{pagination.total}</strong> patient records
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-500 border border-slate-200 rounded bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-xs text-slate-600 font-semibold px-2">
                    Page {page} of {pagination.pages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                    disabled={page >= pagination.pages}
                    className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-500 border border-slate-200 rounded bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )}

        {/* Modal Drawer: Register New Patient */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-teal-600" />
                  <span>Register New Patient Demographics</span>
                </h3>
                <button
                  type="button"
                  disabled={createLoading}
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePatient} className="overflow-y-auto p-6 space-y-4 flex-1">
                {formError && (
                  <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-md font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 text-xs bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-md font-medium flex items-center gap-2 animate-pulse">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Personal Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">First Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Muhammad"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Last Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ali"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Father / Husband Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={fatherHusbandName}
                        onChange={(e) => setFatherHusbandName(e.target.value)}
                        placeholder="Tariq Mahmood"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Gender <span className="text-red-500">*</span></label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white"
                      >
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Date of Birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Age (Years)</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="35"
                        min={0}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Marital Status</label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white"
                      >
                        {MARITAL_STATUSES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact & ID */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact & Identification</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Mobile Number <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="03001234567"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Alternate Mobile</label>
                      <input
                        type="text"
                        value={alternateMobileNumber}
                        onChange={(e) => setAlternateMobileNumber(e.target.value)}
                        placeholder="03217654321"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">CNIC (Optional)</label>
                      <input
                        type="text"
                        value={cnic}
                        onChange={(e) => setCnic(e.target.value)}
                        placeholder="38403-1234567-1"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600">Street Address <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House #123, Street 4"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">City <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Sargodha"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medical Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white"
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Known Allergies</label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Penicillin, Dust"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Chronic Diseases</label>
                      <input
                        type="text"
                        value={chronicDiseases}
                        onChange={(e) => setChronicDiseases(e.target.value)}
                        placeholder="Diabetes, Hypertension"
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Special Remarks</label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Wheelchair access required, etc."
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Form Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={createLoading}
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex justify-center items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-55 rounded-md transition-colors"
                  >
                    {createLoading && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                    <span>{createLoading ? 'Registering...' : 'Register Patient'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Print Registration Slip */}
        {printPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Printer className="h-4 w-4 text-teal-600" />
                  <span>Registration Slip Preview</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setPrintPatient(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Thermal Print Slip Preview */}
              <div className="border border-slate-200 p-2 rounded bg-slate-50 overflow-hidden">
                <RegistrationSlip
                  patientName={printPatient.fullName}
                  mrNumber={printPatient.mrNumber}
                  age={printPatient.age}
                  gender={printPatient.gender}
                  mobileNumber={printPatient.mobileNumber}
                  registrationDate={printPatient.createdAt}
                  receptionistName={currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : 'Reception Desk'}
                  fatherHusbandName={printPatient.fatherHusbandName}
                  address={printPatient.address}
                  city={printPatient.city}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPrintPatient(null)}
                  className="px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded"
                >
                  Close
                </button>
                <button
                  onClick={triggerThermalPrint}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reception Check-In to Doctor Queue */}
        {checkInPatient && (
          <CreateVisitModal
            patient={checkInPatient}
            onClose={() => setCheckInPatient(null)}
            onSuccess={() => {
              setCheckInPatient(null);
              queryClient.invalidateQueries({ queryKey: ['patients'] });
            }}
          />
        )}
      </div>
    </PermissionGuard>
  );
}

