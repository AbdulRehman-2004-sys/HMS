'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client';
import PermissionGuard from '../../PermissionGuard';
import { Permission } from '../../../../lib/permissions';
import { RegistrationSlip } from '../../../../components/RegistrationSlip';
import { 
  User, 
  ArrowLeft, 
  Save, 
  Power, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  X, 
  ShieldAlert,
  Printer,
  Hash,
  Phone,
  MapPin,
  Activity,
  Calendar,
  CreditCard,
  HeartPulse,
} from 'lucide-react';

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

interface PatientApiResponse {
  success: boolean;
  data: {
    patient: PatientItem;
  };
}

const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

export default function PatientDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Status / Feedback alerts
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form edit fields
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editFatherHusbandName, setEditFatherHusbandName] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editDateOfBirth, setEditDateOfBirth] = useState('');
  const [editAge, setEditAge] = useState<number | string>('');
  const [editMaritalStatus, setEditMaritalStatus] = useState('Single');
  const [editMobileNumber, setEditMobileNumber] = useState('');
  const [editAlternateMobileNumber, setEditAlternateMobileNumber] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('Sargodha');
  const [editCnic, setEditCnic] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('Unknown');
  const [editAllergies, setEditAllergies] = useState('');
  const [editChronicDiseases, setEditChronicDiseases] = useState('');
  const [editRemarks, setEditRemarks] = useState('');

  // Fetch current user details from localStorage
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('hms_user') : null;
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const isSuperAdmin = currentUser?.roles?.includes('Super Admin');
  const isReceptionist = currentUser?.roles?.includes('Receptionist');
  const canManagePatient = isSuperAdmin || isReceptionist;

  // Query single patient
  const { data, isLoading, isError, error } = useQuery<PatientApiResponse>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    },
    retry: false,
  });

  const patient = data?.data?.patient;

  // Initialize edit fields
  useEffect(() => {
    if (patient) {
      setEditFirstName(patient.firstName);
      setEditLastName(patient.lastName);
      setEditFatherHusbandName(patient.fatherHusbandName);
      setEditGender(patient.gender);
      setEditDateOfBirth(patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : '');
      setEditAge(patient.age || '');
      setEditMaritalStatus(patient.maritalStatus || 'Single');
      setEditMobileNumber(patient.mobileNumber);
      setEditAlternateMobileNumber(patient.alternateMobileNumber || '');
      setEditAddress(patient.address);
      setEditCity(patient.city || 'Sargodha');
      setEditCnic(patient.cnic || '');
      setEditBloodGroup(patient.bloodGroup || 'Unknown');
      setEditAllergies(patient.allergies || '');
      setEditChronicDiseases(patient.chronicDiseases || '');
      setEditRemarks(patient.remarks || '');
    }
  }, [patient]);

  // 1. Mutation: Update Patient Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(null);

    if (!editFirstName || !editLastName || !editFatherHusbandName || !editMobileNumber || !editAddress) {
      setFeedbackError('Required fields cannot be empty');
      return;
    }

    setUpdateLoading(true);

    try {
      await api.patch(`/patients/${id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        fatherHusbandName: editFatherHusbandName,
        gender: editGender,
        dateOfBirth: editDateOfBirth || undefined,
        age: editAge ? Number(editAge) : undefined,
        maritalStatus: editMaritalStatus,
        mobileNumber: editMobileNumber,
        alternateMobileNumber: editAlternateMobileNumber || undefined,
        address: editAddress,
        city: editCity || 'Sargodha',
        cnic: editCnic || undefined,
        bloodGroup: editBloodGroup,
        allergies: editAllergies || undefined,
        chronicDiseases: editChronicDiseases || undefined,
        remarks: editRemarks || undefined,
      });

      setFeedbackSuccess('Patient profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    } catch (err: any) {
      setFeedbackError(
        err.response?.data?.error?.message || 
        'Failed to save profile changes. Verify parameters and try again.'
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // 2. Mutation: Toggle Patient Status (Active/Inactive)
  const handleToggleStatus = async () => {
    if (!patient) return;
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setStatusLoading(true);
    const targetStatus = !patient.isActive;

    try {
      await api.patch(`/patients/${id}`, { isActive: targetStatus });
      setFeedbackSuccess(`Patient status has been successfully ${targetStatus ? 'activated' : 'deactivated'}`);
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowStatusModal(false);
    } catch (err: any) {
      setFeedbackError(err.response?.data?.error?.message || 'Failed to toggle patient status.');
      setShowStatusModal(false);
    } finally {
      setStatusLoading(false);
    }
  };

  // 3. Mutation: Soft Delete Patient
  const handleDeletePatient = async () => {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setDeleteLoading(true);

    try {
      await api.delete(`/patients/${id}`);
      router.push('/dashboard/patients');
    } catch (err: any) {
      setFeedbackError(err.response?.data?.error?.message || 'Failed to delete patient profile.');
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const triggerThermalPrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <User className="h-10 w-10 animate-pulse text-teal-600" />
        <span className="text-xs font-semibold">Loading patient profile records...</span>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="mt-2 text-sm font-semibold text-slate-800">Patient Profile Not Found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          {(error as any)?.response?.data?.error?.message || 'The requested patient profile could not be retrieved.'}
        </p>
        <Link
          href="/dashboard/patients"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Patient Registry</span>
        </Link>
      </div>
    );
  }

  return (
    <PermissionGuard permission={Permission.ACCESS_RECEPTION}>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/dashboard/patients"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Patient Registry</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-base shrink-0">
                MR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight">{patient.fullName}</h1>
                  <span className="font-mono bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded text-xs font-bold">
                    {patient.mrNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>S/O, D/O, W/O: <strong className="text-slate-700">{patient.fatherHusbandName}</strong></span>
                  <span>•</span>
                  <span>{patient.age ? `${patient.age} Yrs` : 'Age N/A'} • {patient.gender}</span>
                  {patient.cnic && (
                    <>
                      <span>•</span>
                      <span>CNIC: <strong className="text-slate-700">{patient.cnic}</strong></span>
                    </>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-all shadow-sm"
              >
                <Printer className="h-4 w-4" />
                <span>Print Registration Slip</span>
              </button>
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded border ${
                  patient.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {patient.isActive ? 'Active Patient' : 'Inactive Record'}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback alerts */}
        {feedbackError && (
          <div className="p-4 text-xs bg-red-50 border border-red-200 text-red-600 rounded-md font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}
        {feedbackSuccess && (
          <div className="p-4 text-xs bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-md font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Main Grid View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Editable Patient Profile */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-teal-600" />
                  <span>Patient Demographics & Medical Profile</span>
                </h3>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded">
                  {canManagePatient ? 'Editable' : 'Read-Only'}
                </span>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                {/* Personal Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Personal Information</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">First Name</label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500">Last Name</label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500">Father / Husband Name</label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editFatherHusbandName}
                        onChange={(e) => setEditFatherHusbandName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Gender</label>
                      <select
                        disabled={!canManagePatient}
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white disabled:bg-slate-50 disabled:text-slate-600"
                      >
                        {GENDERS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500">Date of Birth</label>
                      <input
                        type="date"
                        disabled={!canManagePatient}
                        value={editDateOfBirth}
                        onChange={(e) => setEditDateOfBirth(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500">Age (Years)</label>
                      <input
                        type="number"
                        disabled={!canManagePatient}
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        min={0}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500">Marital Status</label>
                      <select
                        disabled={!canManagePatient}
                        value={editMaritalStatus}
                        onChange={(e) => setEditMaritalStatus(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white disabled:bg-slate-50 disabled:text-slate-600"
                      >
                        {MARITAL_STATUSES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact & Identification */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact & Identification</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Mobile Number
                      </label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editMobileNumber}
                        onChange={(e) => setEditMobileNumber(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500">Alternate Mobile</label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editAlternateMobileNumber}
                        onChange={(e) => setEditAlternateMobileNumber(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> CNIC
                      </label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editCnic}
                        onChange={(e) => setEditCnic(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Street Address
                      </label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500">City</label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="h-4 w-4 text-red-500" />
                    <span>Medical Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500">Blood Group</label>
                      <select
                        disabled={!canManagePatient}
                        value={editBloodGroup}
                        onChange={(e) => setEditBloodGroup(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white disabled:bg-slate-50 disabled:text-slate-600"
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500">Known Allergies</label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editAllergies}
                        onChange={(e) => setEditAllergies(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500">Chronic Diseases</label>
                      <input
                        type="text"
                        disabled={!canManagePatient}
                        value={editChronicDiseases}
                        onChange={(e) => setEditChronicDiseases(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Special Remarks</label>
                    <textarea
                      rows={2}
                      disabled={!canManagePatient}
                      value={editRemarks}
                      onChange={(e) => setEditRemarks(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                </div>

                {/* Form submit */}
                {canManagePatient && (
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-55 rounded-md transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>{updateLoading ? 'Saving changes...' : 'Save Patient Profile'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Column: Record Metadata & Status */}
          <div className="space-y-6">
            {/* Status Switch Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient Status Controls</h3>

              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${patient.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-450 font-medium block">Account Status</span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {patient.isActive ? 'Active Patient' : 'Inactive Record'}
                  </span>
                </div>
              </div>

              {canManagePatient ? (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className={`w-full flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold rounded-md transition-colors ${
                    patient.isActive 
                      ? 'text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200' 
                      : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250'
                  }`}
                >
                  <span>{patient.isActive ? 'Deactivate Patient' : 'Activate Patient'}</span>
                </button>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Status operations are restricted to Receptionists & Administrators.
                </p>
              )}
            </div>

            {/* Timestamps & Soft Delete Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Metadata</h3>

              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Registration Date:</span>
                  <span className="font-semibold text-slate-700">{new Date(patient.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Updated:</span>
                  <span className="font-semibold text-slate-700">{new Date(patient.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>MR Number:</span>
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {patient.mrNumber}
                  </span>
                </div>
              </div>

              {/* Danger Zone button */}
              {canManagePatient && (
                <div className="pt-3.5 border-t border-slate-100">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Soft-Delete Patient Record</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Deactivate/Activate Confirmation */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <ShieldAlert className="h-6 w-6" />
                <h3 className="text-sm font-semibold text-slate-800">
                  {patient.isActive ? 'Deactivate Patient Record?' : 'Activate Patient Record?'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {patient.isActive 
                  ? `Deactivating ${patient.fullName} (${patient.mrNumber}) will mark their master index as inactive.`
                  : `Activating ${patient.fullName} (${patient.mrNumber}) will restore their active status.`}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={statusLoading}
                  onClick={() => setShowStatusModal(false)}
                  className="px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={statusLoading}
                  className={`px-3 py-1.5 text-xs font-semibold text-white rounded disabled:opacity-55 flex items-center gap-1.5 ${
                    patient.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {statusLoading && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
                  {patient.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Soft Delete Confirmation */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <ShieldAlert className="h-6 w-6" />
                <h3 className="text-sm font-semibold text-slate-800">Soft-Delete Patient Record?</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The record for <strong className="text-slate-700">{patient.fullName}</strong> ({patient.mrNumber}) will be soft-deleted. Permanent historical logs will be preserved.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePatient}
                  disabled={deleteLoading}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-55 flex items-center gap-1.5"
                >
                  {deleteLoading && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Print Registration Slip */}
        {showPrintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Printer className="h-4 w-4 text-teal-600" />
                  <span>Registration Slip Preview</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Thermal Print Slip Preview */}
              <div className="border border-slate-200 p-2 rounded bg-slate-50 overflow-hidden">
                <RegistrationSlip
                  patientName={patient.fullName}
                  mrNumber={patient.mrNumber}
                  age={patient.age}
                  gender={patient.gender}
                  mobileNumber={patient.mobileNumber}
                  registrationDate={patient.createdAt}
                  receptionistName={currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : 'Reception Desk'}
                  fatherHusbandName={patient.fatherHusbandName}
                  address={patient.address}
                  city={patient.city}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
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
      </div>
    </PermissionGuard>
  );
}
