'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { api, setAccessToken } from '../../lib/api-client';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    } finally {
      setAccessToken(null);
      localStorage.removeItem('hms_user');
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-center">
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <ShieldAlert className="h-10 w-10 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">403 - Forbidden Access</h1>
          <p className="text-sm text-slate-500">
            Your terminal session does not possess the credentials or privileges required to access this node.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-md border border-slate-100 text-left text-xs space-y-2">
          <span className="font-semibold text-slate-700 block">Security Protocol Alert:</span>
          <p className="text-slate-500 leading-relaxed">
            All unauthorized access attempts are logged under security audit guidelines. If you believe this is an error, contact your clinical administrator.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center gap-2 h-10 w-full px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 h-10 w-full px-4 text-sm font-semibold text-red-600 hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
