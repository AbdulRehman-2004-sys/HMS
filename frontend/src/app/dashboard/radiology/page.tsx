'use client';

import React, { useEffect, useState } from 'react';
import PermissionGuard from '../PermissionGuard';
import { Permission } from '../../../lib/permissions';
import { ShieldCheck } from 'lucide-react';

export default function RadiologyVerificationPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('hms_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <PermissionGuard permission={Permission.ACCESS_RADIOLOGY}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Radiology PACS Gate</h1>
          <p className="text-sm text-slate-500 mt-1">Verification workspace for radiologists.</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-teal-50/50 border border-teal-100 rounded-md">
            <ShieldCheck className="h-6 w-6 text-teal-600 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-teal-800 font-bold">Access Verification: GRANTED</h3>
              <p className="text-xs text-teal-650 mt-0.5">
                The terminal session possesses the `{Permission.ACCESS_RADIOLOGY}` permission node.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-slate-800">Terminal Context Details</h4>
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="p-3 border border-slate-100 rounded-md bg-slate-50/30">
                <span className="text-slate-400 block font-semibold">Active User</span>
                <span className="text-slate-800 mt-1 block font-mono">{user ? `${user.firstName} ${user.lastName}` : 'N/A'}</span>
              </div>
              <div className="p-3 border border-slate-100 rounded-md bg-slate-50/30">
                <span className="text-slate-400 block font-semibold">Authorized Roles</span>
                <span className="text-slate-800 mt-1 block font-mono">{user?.roles?.join(', ') || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
