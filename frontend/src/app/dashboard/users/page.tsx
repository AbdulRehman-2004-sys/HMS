'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api-client';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import { 
  Search, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  X,
  CheckCircle,
} from 'lucide-react';

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  username: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

interface UsersApiResponse {
  success: boolean;
  data: {
    users: UserItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

const AVAILABLE_ROLES = ['Super Admin', 'Receptionist', 'Doctor', 'Laboratory', 'Radiology', 'Billing'];

export default function UsersPage() {
  const queryClient = useQueryClient();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [assignedRoles, setAssignedRoles] = useState<string[]>([]);

  // Query list of users
  const { data, isLoading, isError, error } = useQuery<UsersApiResponse>({
    queryKey: ['users', searchTerm, selectedRole, selectedStatus, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRole) params.append('role', selectedRole);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('page', String(page));
      params.append('limit', String(limit));
      
      const response = await api.get(`/users?${params.toString()}`);
      return response.data;
    },
  });

  const usersList = data?.data?.users || [];
  const pagination = data?.data?.pagination || { total: 0, page: 1, limit, pages: 1 };

  // Handle role checkbox change
  const handleRoleCheckbox = (role: string) => {
    if (assignedRoles.includes(role)) {
      setAssignedRoles(assignedRoles.filter((r) => r !== role));
    } else {
      setAssignedRoles([...assignedRoles, role]);
    }
  };

  // Reset form
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setPassword('');
    setAssignedRoles([]);
    setFormError(null);
    setFormSuccess(null);
  };

  // Submit create user form
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!firstName || !lastName || !email || !username || !password) {
      setFormError('Please fill in all required fields marked with *');
      return;
    }

    if (assignedRoles.length === 0) {
      setFormError('Please assign at least one role to this user account');
      return;
    }

    setCreateLoading(true);

    try {
      await api.post('/users', {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        username,
        password,
        roles: assignedRoles,
      });

      setFormSuccess('User account registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setTimeout(() => {
        setShowCreateModal(false);
        resetForm();
      }, 1000);
    } catch (err: any) {
      setFormError(
        err.response?.data?.error?.message || 
        'Failed to connect to users service. Please try again.'
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <PermissionGuard permission={Permission.MANAGE_SYSTEM}>
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage system operators, assign credentials, and audit clinical permissions.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2 h-10 px-4 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-md transition-colors shadow-sm font-sans shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Clinic Operator</span>
          </button>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 outline-none transition focus:border-teal-500"
            >
              <option value="">All Roles</option>
              {AVAILABLE_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 outline-none transition focus:border-teal-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Users Table Container */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <span className="text-xs text-slate-450 font-medium">Retrieving active operator terminal lists...</span>
            </div>
          ) : isError ? (
            <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800">Connection Failed</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">{(error as any)?.message || 'Failed to retrieve operator profiles from the gateway.'}</p>
            </div>
          ) : usersList.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-10 w-10 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-slate-700">No Users Found</h3>
              <p className="mt-1 text-xs text-slate-500">Try adjusting your search queries or adding a new operator node.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/80">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Operator Details</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Username / Phone</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned Roles</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">{user.firstName} {user.lastName}</span>
                            <span className="text-xs text-slate-400 block mt-0.5">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        <span className="text-slate-700 block font-semibold">{user.username}</span>
                        <span className="text-slate-455 block mt-0.5">{user.phone || 'No phone'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            user.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-md transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} operators total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 border border-slate-200 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-55 disabled:hover:bg-transparent rounded transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="p-1.5 border border-slate-200 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-55 disabled:hover:bg-transparent rounded transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create User Dialog Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Add Clinic Operator</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Define login credentials and clinical permissions</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateUser} className="overflow-y-auto p-6 space-y-4">
                {formError && (
                  <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-md font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 text-xs bg-emerald-50 border border-emerald-250 text-emerald-705 rounded-md font-medium flex items-center gap-2 animate-pulse">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* First Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">First Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Last Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@lalamedical.com"
                      className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Username <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="e.g. john.doe"
                      className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Security Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Assigned Roles Checkboxes */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-500">Assigned Roles <span className="text-red-500">*</span></label>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 pt-1">
                    {AVAILABLE_ROLES.map((role) => (
                      <label key={role} className="flex items-center gap-2 text-xs font-medium text-slate-655 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={assignedRoles.includes(role)}
                          onChange={() => handleRoleCheckbox(role)}
                          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span>{role}</span>
                      </label>
                    ))}
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
                    <span>{createLoading ? 'Registering...' : 'Register Operator'}</span>
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
