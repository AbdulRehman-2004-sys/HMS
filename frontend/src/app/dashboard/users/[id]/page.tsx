'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../../lib/api-client';
import PermissionGuard from '../../PermissionGuard';
import { Permission } from '../../../../lib/permissions';
import { 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  ShieldAlert,
  User,
  Clock,
  Trash2,
  Lock,
  Power,
  Save,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserDetail {
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

interface UserApiResponse {
  success: boolean;
  data: {
    user: UserDetail;
  };
}

const AVAILABLE_ROLES = ['Super Admin', 'Receptionist', 'Doctor', 'Laboratory', 'Radiology', 'Billing'];

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();

  // Dialog/Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Status / Feedback alerts
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Password reset fields
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Profile Edit fields
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Query single user
  const { data, isLoading, isError, error } = useQuery<UserApiResponse>({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data;
    },
    retry: false,
  });

  const user = data?.data?.user;

  // Initialize edit fields
  useEffect(() => {
    if (user) {
      setEditFirstName(user.firstName);
      setEditLastName(user.lastName);
      setEditEmail(user.email);
      setEditPhone(user.phone || '');
      setEditUsername(user.username);
      setEditRoles(user.roles || []);
    }
  }, [user]);

  // Handle edit role checkboxes
  const handleEditRoleCheckbox = (role: string) => {
    if (editRoles.includes(role)) {
      setEditRoles(editRoles.filter((r) => r !== role));
    } else {
      setEditRoles([...editRoles, role]);
    }
  };

  // 1. Mutation: Update User Details
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackSuccess(null);

    if (!editFirstName || !editLastName || !editEmail || !editUsername) {
      setFeedbackError('Required fields cannot be empty');
      return;
    }

    if (editRoles.length === 0) {
      setFeedbackError('User must have at least one role assigned');
      return;
    }

    setUpdateLoading(true);

    try {
      await api.patch(`/users/${id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone || undefined,
        username: editUsername,
        roles: editRoles,
      });

      setFeedbackSuccess('Operator profile details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      setFeedbackError(
        err.response?.data?.error?.message || 
        'Failed to save profile changes. Verify parameters and try again.'
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // 2. Mutation: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }

    setResetLoading(true);

    try {
      await api.patch(`/users/${id}/reset-password`, { password: newPassword });
      setResetSuccess('Security password reset successfully');
      setTimeout(() => {
        setShowResetModal(false);
        setNewPassword('');
        setResetSuccess(null);
      }, 1000);
    } catch (err: any) {
      setResetError(
        err.response?.data?.error?.message || 
        'Administrative password reset failed.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  // 3. Mutation: Toggle status
  const handleToggleStatus = async () => {
    if (!user) return;
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setStatusLoading(true);
    const targetStatus = !user.isActive;

    try {
      await api.patch(`/users/${id}/status`, { isActive: targetStatus });
      setFeedbackSuccess(`Operator account has been successfully ${targetStatus ? 'activated' : 'deactivated'}`);
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowStatusModal(false);
    } catch (err: any) {
      setFeedbackError(
        err.response?.data?.error?.message || 
        'Failed to toggle account activation status.'
      );
      setShowStatusModal(false);
    } finally {
      setStatusLoading(false);
    }
  };

  // 4. Mutation: Delete account
  const handleDeleteAccount = async () => {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setDeleteLoading(true);

    try {
      await api.delete(`/users/${id}`);
      router.push('/dashboard/users');
    } catch (err: any) {
      setFeedbackError(
        err.response?.data?.error?.message || 
        'Deletions failed. You cannot delete your own session terminal user account.'
      );
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="text-xs text-slate-400 font-medium">Resolving clinical operator data...</span>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h3 className="mt-2 text-sm font-semibold text-slate-800">Operator Not Found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          {(error as any)?.message || 'The requested user profile does not exist or you lack sufficient access permissions.'}
        </p>
        <button
          onClick={() => router.push('/dashboard/users')}
          className="mt-4 flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Users List</span>
        </button>
      </div>
    );
  }

  return (
    <PermissionGuard permission={Permission.MANAGE_SYSTEM}>
      <div className="space-y-6">
        {/* Navigation back and header */}
        <div className="space-y-2">
          <button
            onClick={() => router.push('/dashboard/users')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Users List</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Operator Terminal: <span className="font-mono font-semibold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded text-xs">{user.username}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded border ${
                  user.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {user.isActive ? 'Active Node' : 'Suspended Node'}
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

        {/* Detail layout grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* 1. Main Profile Editor Form */}
          <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-800">Operator Details Configuration</h2>
              <p className="text-xs text-slate-400 mt-0.5">Edit credentials and system roles</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-550">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-550">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-550">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-550">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-550">Username *</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase())}
                  className="px-3 py-2 text-sm border border-slate-200 bg-white rounded-md outline-none focus:border-teal-500"
                />
              </div>

              {/* Roles Selection */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500">Authorized Roles *</label>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 pt-1">
                  {AVAILABLE_ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 text-xs font-medium text-slate-655 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editRoles.includes(role)}
                        onChange={() => handleEditRoleCheckbox(role)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form submit */}
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
            </form>
          </div>

          {/* 2. Side Panel - Security Locks & Audit Info */}
          <div className="space-y-6">
            {/* Status Activation Switch Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Operations</h3>
              
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-450 font-medium block">Active Operator Node</span>
                  <span className="text-sm font-bold text-slate-800 block">
                    {user.isActive ? 'Terminal Enabled' : 'Terminal Disabled'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowStatusModal(true)}
                className={`w-full flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold rounded-md transition-colors ${
                  user.isActive 
                    ? 'text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200' 
                    : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250'
                }`}
              >
                <span>{user.isActive ? 'Deactivate Operator' : 'Activate Operator'}</span>
              </button>
            </div>

            {/* Reset Security Password Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security Controls</h3>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-full">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-450 font-medium block">Password Reset Policy</span>
                  <span className="text-xs font-semibold text-slate-650 block mt-0.5">Enforced administrative overrides</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setResetError(null);
                  setResetSuccess(null);
                  setNewPassword('');
                  setShowResetModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
              >
                <span>Reset Operator Password</span>
              </button>
            </div>

            {/* Audit Logs Timestamps Card */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-3.5 text-xs text-slate-550">
              <h3 className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Telemetry Info</h3>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Node ID:</span>
                <span className="font-mono font-semibold text-slate-700 truncate max-w-[120px]">{user.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Created At:</span>
                <span className="font-semibold text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Updated At:</span>
                <span className="font-semibold text-slate-700">{new Date(user.updatedAt).toLocaleDateString()}</span>
              </div>

              {/* Danger Zone button */}
              <div className="pt-3.5 border-t border-slate-100">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Operator Node</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Modal Dialog: Reset Password */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Reset Operator Password</h3>
                <button onClick={() => setShowResetModal(false)} className="p-1 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                {resetError && (
                  <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-md font-medium flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}
                {resetSuccess && (
                  <div className="p-3 text-xs bg-emerald-50 border border-emerald-255 text-emerald-700 rounded-md font-medium flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">New Password *</label>
                  <div className="relative">
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 outline-none"
                    >
                      {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400">Password must be at least 6 characters.</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3 py-1.5 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-55 rounded"
                  >
                    {resetLoading ? 'Resetting...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Modal Dialog: Deactivate/Activate Confirmation */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-amber-605">
                <ShieldAlert className="h-6 w-6" />
                <h3 className="text-sm font-semibold text-slate-800">
                  {user.isActive ? 'Deactivate Operator Account?' : 'Activate Operator Account?'}
                </h3>
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                {user.isActive 
                  ? 'Deactivating this operator will immediately revoke all their terminal session keys and deny them gate access to clinical workspaces. Active connections will be terminated.'
                  : 'Activating this account will restore the operator\'s ability to log in and access guarded clinical terminals.'}
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
                    user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {statusLoading && <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />}
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Modal Dialog: Delete Confirmation */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <ShieldAlert className="h-6 w-6" />
                <h3 className="text-sm font-semibold text-slate-800">Delete Operator Account?</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action is irreversible. The account for <strong className="text-slate-750">{user.firstName} {user.lastName}</strong> will be permanently deleted from the registry, including their role mappings.
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
                  onClick={handleDeleteAccount}
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
