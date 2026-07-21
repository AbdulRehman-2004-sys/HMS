'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import { 
  Search, 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  X,
  CheckCircle,
  Plus,
  Award,
  Briefcase,
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

interface DoctorsApiResponse {
  success: boolean;
  data: {
    doctors: DoctorItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
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

export default function DoctorsPage() {
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('General Medicine');
  const [experience, setExperience] = useState<number | string>(5);
  const [gender, setGender] = useState('Male');
  const [consultationFee, setConsultationFee] = useState<number | string>(1000);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [signatureText, setSignatureText] = useState('');

  // Fetch current user details from localStorage
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem('hms_user') : null;
  const currentUser = savedUser ? JSON.parse(savedUser) : null;
  const isSuperAdmin = currentUser?.roles?.includes('Super Admin');

  // Query list of doctors
  const { data, isLoading, isError, error } = useQuery<DoctorsApiResponse>({
    queryKey: ['doctors', searchTerm, selectedSpecialization, selectedStatus, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSpecialization) params.append('specialization', selectedSpecialization);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const response = await api.get(`/doctors?${params.toString()}`);
      return response.data;
    },
  });

  const doctorsList = data?.data?.doctors || [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, limit, pages: 1 };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setQualification('');
    setSpecialization('General Medicine');
    setExperience(5);
    setGender('Male');
    setConsultationFee(1000);
    setRegistrationNumber('');
    setSignatureText('');
    setFormError(null);
    setFormSuccess(null);
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!firstName || !lastName || !email || !phone || !qualification || !specialization) {
      setFormError('Please fill in all required fields marked with *');
      return;
    }

    setCreateLoading(true);

    try {
      await api.post('/doctors', {
        firstName,
        lastName,
        email,
        phone,
        qualification,
        specialization,
        experience: Number(experience) || 0,
        gender,
        consultationFee: Number(consultationFee) || 1000,
        registrationNumber: registrationNumber || undefined,
        signatureText: signatureText || undefined,
      });

      setFormSuccess('Doctor profile registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setTimeout(() => {
        setShowCreateModal(false);
        resetForm();
      }, 1200);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to register doctor profile.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <PermissionGuard permission={Permission.ACCESS_RECEPTION}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-teal-600" />
              <span>Doctor Roster Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Browse medical specialist profiles, qualifications, consultation rates, and active statuses.
            </p>
          </div>

          {/* Add Doctor Action Button (Super Admin Only) */}
          {isSuperAdmin && (
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-md transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Doctor</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, qualification, or email..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-md outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Specialization Filter */}
            <select
              value={selectedSpecialization}
              onChange={(e) => {
                setSelectedSpecialization(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white text-slate-700 font-medium"
            >
              <option value="">All Specializations</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            {/* Active Status Filter */}
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
              <option value="inactive">Suspended / Inactive</option>
            </select>
          </div>
        </div>

        {/* Table Content Area */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <span className="text-xs font-medium">Fetching doctor records from database...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800">Failed to Load Doctor Records</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                {(error as any)?.response?.data?.error?.message || 'A network error occurred while querying the server.'}
              </p>
            </div>
          ) : doctorsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="p-3 bg-slate-100 rounded-full text-slate-400">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No Doctor Profiles Found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {searchTerm || selectedSpecialization || selectedStatus
                  ? 'No matching doctor records were found for your current query filters.'
                  : 'There are currently no doctor profiles registered in the system.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Doctor Name</th>
                      <th className="px-6 py-3">Designation / Specialization</th>
                      <th className="px-6 py-3">Qualification</th>
                      <th className="px-6 py-3">Registration No.</th>
                      <th className="px-6 py-3">Fee Rate</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {doctorsList.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                              Dr
                            </div>
                            <div>
                              <span className="block">{doc.fullName}</span>
                              <span className="text-[11px] text-slate-400 font-normal">{doc.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          <span className="inline-flex items-start gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs">
                            <Briefcase className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span>{doc.specialization}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          <span className="inline-flex items-start gap-1.5">
                            <Award className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{doc.qualification}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-mono font-medium text-xs">
                          <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                            <Hash className="h-3 w-3 text-slate-400" />
                            {doc.registrationNumber || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          <span className="inline-flex items-center text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-xs">
                            Rs. {doc.consultationFee}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              doc.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {doc.isActive ? 'Active Terminal' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/doctors/${doc.id}`}
                            className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-md transition-all"
                          >
                            View Profile
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-xs text-slate-500">
                  Showing <strong className="text-slate-700">{doctorsList.length}</strong> of{' '}
                  <strong className="text-slate-700">{pagination.total}</strong> doctor records
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

        {/* Modal Drawer: Create Doctor Profile */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-teal-600" />
                  <span>Register Doctor Profile</span>
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

              <form onSubmit={handleCreateDoctor} className="overflow-y-auto p-6 space-y-4 flex-1">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">First Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Last Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@lalamedical.com"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+923001234567"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Specialization / Designation <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Consultant Surgeon"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Qualifications <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="MBBS, MD, FCPS"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Registration No.</label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="33791-P"
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Gender <span className="text-red-500">*</span></label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Consultation Fee (Rs.) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
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
                    <span>{createLoading ? 'Registering...' : 'Register Doctor'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
