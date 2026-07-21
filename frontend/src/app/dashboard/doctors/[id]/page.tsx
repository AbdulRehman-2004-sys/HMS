'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client';
import PermissionGuard from '../../PermissionGuard';
import { Permission } from '../../../../lib/permissions';
import { 
  Stethoscope, 
  ArrowLeft, 
  Save, 
  Power, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  X, 
  ShieldAlert,
  Award,
  Briefcase,
  Clock,
  Calendar,
  Plus,
  Edit2,
  Loader2,
  Mail,
  Phone,
  Hash,
} from 'lucide-react';

interface DoctorItem {
  id: string;
  userId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: number;
  gender: string;
  consultationFee: number;
  registrationNumber?: string | null;
  signatureText?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AvailabilitySlot {
  id: string;
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DoctorApiResponse {
  success: boolean;
  data: {
    doctor: DoctorItem;
  };
}

interface AvailabilityApiResponse {
  success: boolean;
  data: {
    availabilities: AvailabilitySlot[];
  };
}

const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Radiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'General Surgery',
  'Dermatology',
  'Gynecology',
  'ENT',
  'APWMO / MS',
  'Consultant Surgeon',
  'Consultant Gynecologist',
  'Consultant General & Laparoscopic Surgeon',
  'Consultant ENT Surgeon',
  'Consultant Orthopedic Surgeon',
  'Consultant Oncologist',
  'Consultant Cardiologist',
  'Consultant Anesthetist',
  'Pediatric Surgeon / CEO',
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function DoctorDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

  // Dialog/Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [deletingSlotId, setDeletingSlotId] = useState<string | null>(null);

  // Status / Feedback alerts
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [slotFormLoading, setSlotFormLoading] = useState(false);

  // Doctor Edit fields
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editQualification, setEditQualification] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('General Medicine');
  const [editExperience, setEditExperience] = useState<number | string>(5);
  const [editGender, setEditGender] = useState('Male');
  const [editConsultationFee, setEditConsultationFee] = useState<number | string>(1000);
  const [editRegistrationNumber, setEditRegistrationNumber] = useState('');
  const [editSignatureText, setEditSignatureText] = useState('');

  // Availability slot form fields
  const [slotDay, setSlotDay] = useState('Monday');
  const [slotStartTime, setSlotStartTime] = useState('09:00 AM');
  const [slotEndTime, setSlotEndTime] = useState('02:00 PM');
  const [slotIsActive, setSlotIsActive] = useState(true);

  // Fetch current user details from localStorage
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('hms_user') : null;
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const isSuperAdmin = currentUser?.roles?.includes('Super Admin');
  const isDoctor = currentUser?.roles?.includes('Doctor');

  // Query single doctor
  const { data, isLoading, isError, error } = useQuery<DoctorApiResponse>({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    },
    retry: false,
  });

  const doctor = data?.data?.doctor;
  const canManageDoctor = isSuperAdmin || (isDoctor && doctor?.userId === currentUser?.id);

  // Query doctor availability schedules
  const { data: availabilityData, isLoading: slotsLoading } = useQuery<AvailabilityApiResponse>({
    queryKey: ['doctor-availabilities', id],
    queryFn: async () => {
      const response = await api.get(`/doctors/${id}/availability`);
      return response.data;
    },
    enabled: !!doctor,
  });

  const availabilities = availabilityData?.data?.availabilities || [];

  // Initialize edit fields
  useEffect(() => {
    if (doctor) {
      setEditFirstName(doctor.firstName);
      setEditLastName(doctor.lastName);
      setEditEmail(doctor.email);
      setEditPhone(doctor.phone);
      setEditQualification(doctor.qualification);
      setEditSpecialization(doctor.specialization);
      setEditExperience(doctor.experience);
      setEditGender(doctor.gender);
      setEditConsultationFee(doctor.consultationFee);
      setEditRegistrationNumber(doctor.registrationNumber || '');
      setEditSignatureText(doctor.signatureText || '');
    }
  }, [doctor]);

  // 1. Mutation: Update Doctor Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(null);

    if (!editFirstName || !editLastName || !editEmail || !editPhone || !editQualification || !editSpecialization) {
      setFeedbackError('Required profile fields cannot be empty');
      return;
    }

    setUpdateLoading(true);

    try {
      await api.patch(`/doctors/${id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        qualification: editQualification,
        specialization: editSpecialization,
        experience: Number(editExperience) || 0,
        gender: editGender,
        consultationFee: Number(editConsultationFee) || 1000,
        registrationNumber: editRegistrationNumber || undefined,
        signatureText: editSignatureText || undefined,
      });

      setFeedbackSuccess('Doctor profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['doctor', id] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    } catch (err: any) {
      setFeedbackError(
        err.response?.data?.error?.message || 
        'Failed to save profile changes. Verify parameters and try again.'
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // 2. Mutation: Toggle Doctor Status (Active/Inactive)
  const handleToggleStatus = async () => {
    if (!doctor) return;
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setStatusLoading(true);
    const targetStatus = !doctor.isActive;

    try {
      await api.patch(`/doctors/${id}/status`, { isActive: targetStatus });
      setFeedbackSuccess(`Doctor profile has been successfully ${targetStatus ? 'activated' : 'deactivated'}`);
      queryClient.invalidateQueries({ queryKey: ['doctor', id] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setShowStatusModal(false);
    } catch (err: any) {
      setFeedbackError(
        err.response?.data?.error?.message || 
        'Failed to toggle doctor activation status.'
      );
      setShowStatusModal(false);
    } finally {
      setStatusLoading(false);
    }
  };

  // 3. Mutation: Soft Delete Doctor
  const handleDeleteDoctor = async () => {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setDeleteLoading(true);

    try {
      await api.delete(`/doctors/${id}`);
      router.push('/dashboard/doctors');
    } catch (err: any) {
      setFeedbackError(
        err.response?.data?.error?.message || 
        'Failed to delete doctor profile.'
      );
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 4. Mutation: Add / Edit Availability Slot
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotFormLoading(true);
    setFeedbackError(null);

    try {
      if (editingSlot) {
        await api.patch(`/doctors/${id}/availability/${editingSlot.id}`, {
          dayOfWeek: slotDay,
          startTime: slotStartTime,
          endTime: slotEndTime,
          isActive: slotIsActive,
        });
        setFeedbackSuccess('Availability slot updated successfully');
      } else {
        await api.post(`/doctors/${id}/availability`, {
          dayOfWeek: slotDay,
          startTime: slotStartTime,
          endTime: slotEndTime,
          isActive: slotIsActive,
        });
        setFeedbackSuccess('Availability slot added successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['doctor-availabilities', id] });
      setShowAddSlotModal(false);
      setEditingSlot(null);
    } catch (err: any) {
      setFeedbackError(err.response?.data?.error?.message || 'Failed to save availability slot.');
    } finally {
      setSlotFormLoading(false);
    }
  };

  // 5. Mutation: Delete Availability Slot
  const handleDeleteSlot = async (slotId: string) => {
    setDeletingSlotId(slotId);
    setFeedbackError(null);

    try {
      await api.delete(`/doctors/${id}/availability/${slotId}`);
      setFeedbackSuccess('Availability slot deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['doctor-availabilities', id] });
    } catch (err: any) {
      setFeedbackError(err.response?.data?.error?.message || 'Failed to delete availability slot.');
    } finally {
      setDeletingSlotId(null);
    }
  };

  const openAddSlotModal = () => {
    setEditingSlot(null);
    setSlotDay('Monday');
    setSlotStartTime('09:00 AM');
    setSlotEndTime('02:00 PM');
    setSlotIsActive(true);
    setShowAddSlotModal(true);
  };

  const openEditSlotModal = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setSlotDay(slot.dayOfWeek);
    setSlotStartTime(slot.startTime);
    setSlotEndTime(slot.endTime);
    setSlotIsActive(slot.isActive);
    setShowAddSlotModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Stethoscope className="h-10 w-10 animate-pulse text-teal-600" />
        <span className="text-xs font-semibold">Loading doctor profile records...</span>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="mt-2 text-sm font-semibold text-slate-800">Doctor Profile Not Found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          {(error as any)?.response?.data?.error?.message || 'The requested doctor profile could not be retrieved.'}
        </p>
        <Link
          href="/dashboard/doctors"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Doctor Roster</span>
        </Link>
      </div>
    );
  }

  return (
    <PermissionGuard permission={Permission.ACCESS_CLINICAL}>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div>
          <Link
            href="/dashboard/doctors"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Doctor Roster</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-base shrink-0">
                Dr
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">{doctor.fullName}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Designation: <strong className="text-slate-700">{doctor.specialization}</strong></span>
                  <span>•</span>
                  <span>Qualification: <strong className="text-slate-700">{doctor.qualification}</strong></span>
                  <span>•</span>
                  <span>Reg No: <strong className="text-slate-700">{doctor.registrationNumber || 'N/A'}</strong></span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded border ${
                  doctor.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {doctor.isActive ? 'Active Terminal' : 'Suspended Profile'}
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
          {/* Left Column: Profile Information Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-teal-600" />
                  <span>Doctor Profile Information</span>
                </h3>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded">
                  {isSuperAdmin ? 'Editable' : 'Read-Only Mode'}
                </span>
              </div>

              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">First Name</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Last Name</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email Address
                    </label>
                    <input
                      type="email"
                      disabled={!isSuperAdmin}
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone Number
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Specialization / Designation
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={editSpecialization}
                      onChange={(e) => setEditSpecialization(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Award className="h-3 w-3" /> Qualifications
                    </label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={editQualification}
                      onChange={(e) => setEditQualification(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Hash className="h-3 w-3" /> Registration No.
                    </label>
                    <input
                      type="text"
                      disabled={!canManageDoctor}
                      value={editRegistrationNumber}
                      onChange={(e) => setEditRegistrationNumber(e.target.value)}
                      placeholder="33791-P"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Gender</label>
                    <select
                      disabled={!isSuperAdmin}
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white disabled:bg-slate-50 disabled:text-slate-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">Consultation Fee (Rs.)</label>
                    <input
                      type="number"
                      disabled={!isSuperAdmin}
                      value={editConsultationFee}
                      onChange={(e) => setEditConsultationFee(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-600"
                    />
                  </div>
                </div>

                {/* Form submit */}
                {canManageDoctor && (
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-55 rounded-md transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>{updateLoading ? 'Saving changes...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Doctor Availability Schedule Workspace */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span>Doctor Availability Schedule</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Define active consultation days, shift timings, and availability statuses.
                  </p>
                </div>

                {canManageDoctor && (
                  <button
                    onClick={openAddSlotModal}
                    className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-md transition-colors shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Slot</span>
                  </button>
                )}
              </div>

              <div className="p-6">
                {slotsLoading ? (
                  <div className="flex items-center justify-center p-8 text-slate-400 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                    <span className="text-xs font-medium">Loading availability schedule...</span>
                  </div>
                ) : availabilities.length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-slate-200 rounded-lg space-y-2">
                    <Clock className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No Availability Slots Configured</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Click &quot;Add Slot&quot; above to specify consultation days and available hours for Dr. {doctor.lastName}.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-2.5">Available Day</th>
                          <th className="px-4 py-2.5">Start Time</th>
                          <th className="px-4 py-2.5">End Time</th>
                          <th className="px-4 py-2.5">Slot Status</th>
                          {canManageDoctor && <th className="px-4 py-2.5 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {availabilities.map((slot) => (
                          <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span>{slot.dayOfWeek}</span>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-700">{slot.startTime}</td>
                            <td className="px-4 py-3 font-medium text-slate-700">{slot.endTime}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  slot.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {slot.isActive ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                            {canManageDoctor && (
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditSlotModal(slot)}
                                    className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded border border-slate-200 transition-colors"
                                    title="Edit Slot"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    disabled={deletingSlotId === slot.id}
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded border border-slate-200 transition-colors disabled:opacity-50"
                                    title="Delete Slot"
                                  >
                                    {deletingSlotId === slot.id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin text-red-600" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Operations & Status Controls (Super Admin Only) */}
          <div className="space-y-6">
            {/* Status Activation Switch Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor Account Operations</h3>

              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${doctor.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-450 font-medium block">Doctor Status</span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {doctor.isActive ? 'Active & Receiving' : 'Suspended Terminal'}
                  </span>
                </div>
              </div>

              {isSuperAdmin ? (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className={`w-full flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold rounded-md transition-colors ${
                    doctor.isActive 
                      ? 'text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200' 
                      : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250'
                  }`}
                >
                  <span>{doctor.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}</span>
                </button>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Status operations are restricted to Super Admin administrators.
                </p>
              )}
            </div>

            {/* Timestamps & Soft Delete Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profile Audit Metadata</h3>

              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Created At:</span>
                  <span className="font-semibold text-slate-700">{new Date(doctor.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Updated At:</span>
                  <span className="font-semibold text-slate-700">{new Date(doctor.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Linked User ID:</span>
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {doctor.userId || 'Unlinked Profile'}
                  </span>
                </div>
              </div>

              {/* Danger Zone button */}
              {isSuperAdmin && (
                <div className="pt-3.5 border-t border-slate-100">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Soft-Delete Doctor Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal: Add/Edit Availability Slot */}
        {showAddSlotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-600" />
                  <span>{editingSlot ? 'Edit Availability Slot' : 'Add Availability Slot'}</span>
                </h3>
                <button
                  type="button"
                  disabled={slotFormLoading}
                  onClick={() => setShowAddSlotModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSlot} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Day of Week <span className="text-red-500">*</span></label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Start Time <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={slotStartTime}
                      onChange={(e) => setSlotStartTime(e.target.value)}
                      placeholder="09:00 AM"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500">End Time <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={slotEndTime}
                      onChange={(e) => setSlotEndTime(e.target.value)}
                      placeholder="02:00 PM"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Slot Availability Status</label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={slotIsActive}
                      onChange={(e) => setSlotIsActive(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Active Slot (Receiving Patients)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={slotFormLoading}
                    onClick={() => setShowAddSlotModal(false)}
                    className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={slotFormLoading}
                    className="flex justify-center items-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-55 rounded-md transition-colors"
                  >
                    {slotFormLoading && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                    <span>{slotFormLoading ? 'Saving...' : editingSlot ? 'Update Slot' : 'Add Slot'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Deactivate/Activate Confirmation */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <ShieldAlert className="h-6 w-6" />
                <h3 className="text-sm font-semibold text-slate-800">
                  {doctor.isActive ? 'Deactivate Doctor Profile?' : 'Activate Doctor Profile?'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {doctor.isActive 
                  ? `Deactivating ${doctor.fullName} will suspend their profile and prevent them from receiving new patient appointments.`
                  : `Activating ${doctor.fullName} will restore their active status in the hospital directory.`}
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
                    doctor.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {statusLoading && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
                  {doctor.isActive ? 'Deactivate' : 'Activate'}
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
                <h3 className="text-sm font-semibold text-slate-800">Soft-Delete Doctor Profile?</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The doctor profile for <strong className="text-slate-700">{doctor.fullName}</strong> will be soft-deleted from the active roster. Existing historical records will be preserved for compliance.
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
                  onClick={handleDeleteDoctor}
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
      </div>
    </PermissionGuard>
  );
}
