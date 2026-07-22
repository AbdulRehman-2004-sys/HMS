'use client';

import React, { useState, useEffect } from 'react';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import {
  getHospitalSettingsApi,
  updateHospitalSettingsApi,
  HospitalSettings,
} from '../../../lib/settings';

import {
  Building2,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';

export default function HospitalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    hospitalName: '',
    hospitalLogo: '' as string | null,
    address: '',
    contactNumber: '',
    email: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: HospitalSettings = await getHospitalSettingsApi();
      setForm({
        hospitalName: data.hospitalName || '',
        hospitalLogo: data.hospitalLogo || null,
        address: data.address || '',
        contactNumber: data.contactNumber || '',
        email: data.email || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load hospital settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Logo image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, hospitalLogo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, hospitalLogo: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateHospitalSettingsApi({
        hospitalName: form.hospitalName,
        hospitalLogo: form.hospitalLogo,
        address: form.address,
        contactNumber: form.contactNumber,
        email: form.email || null,
      });

      setSuccess('Hospital profile settings updated successfully! Changes will take effect system-wide.');
      setForm({
        hospitalName: updated.hospitalName,
        hospitalLogo: updated.hospitalLogo,
        address: updated.address,
        contactNumber: updated.contactNumber,
        email: updated.email || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save hospital settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGuard permission={Permission.MANAGE_SETTINGS}>
      <div className="max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-7 w-7 text-teal-600" />
              Hospital Settings & Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Centralized branding, contact information, and logo configuration for LALA Medical Complex.
            </p>
          </div>

          <button
            onClick={fetchSettings}
            disabled={loading}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Reload Settings
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center bg-white rounded-lg border border-slate-200">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-7 w-7 animate-spin text-teal-600" />
              <span className="text-xs font-semibold text-slate-500">Loading Centralized Hospital Profile...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Logo Upload & Branding Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-teal-600" /> Hospital Branding Logo
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload your hospital's official logo. Used on prescriptions, billing receipts, registration slips, and reports.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                {/* Logo Preview Container */}
                <div className="w-36 h-36 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center bg-slate-50 p-2 relative overflow-hidden shrink-0">
                  {form.hospitalLogo ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={form.hospitalLogo}
                        alt="Hospital Logo Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400 text-center">
                      <Building2 className="h-8 w-8 stroke-1 text-slate-400" />
                      <span className="text-[10px] font-semibold">No Logo Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Upload Action Buttons */}
                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded cursor-pointer transition-colors inline-flex items-center gap-2">
                      <Upload className="h-4 w-4 text-teal-400" /> Choose Logo Image
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {form.hospitalLogo && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove Logo
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400">
                    Recommended: Transparent PNG or SVG vector format. Max file size: 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Basic Hospital Information Form */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-teal-600" /> General Hospital Details
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update primary hospital name, physical address, and contact details.
                </p>
              </div>

              <div className="space-y-4">
                {/* Hospital Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.hospitalName}
                    onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                    placeholder="e.g. LALA Medical Complex"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Physical Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> Physical Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Complete hospital street address, city, province..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Contact Phone & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                      placeholder="e.g. +92 300 1234567"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> Official Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="info@lalamedical.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 3. Action Controls */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md shadow-sm transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Saving Settings...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Hospital Settings
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </PermissionGuard>
  );
}
