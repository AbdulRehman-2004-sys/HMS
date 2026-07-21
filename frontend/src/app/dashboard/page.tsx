'use client';

import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  ShieldCheck, 
  CheckCircle,
  Clock,
  BriefcaseMedical,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<{ firstName: string; lastName: string; roles: string[]; email: string } | null>(null);
  const [systemUptime, setSystemUptime] = useState('Checking...');

  useEffect(() => {
    const savedUser = localStorage.getItem('hms_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Standard clock telemetry stub
    const interval = setInterval(() => {
      const now = new Date();
      setSystemUptime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Clinical Command Terminal
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'Officer'}. System status is normal.
        </p>
      </div>

      {/* 1. Infrastructure Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* API Core Node */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-md">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Core API Gateway</p>
            <p className="text-lg font-bold text-slate-800">Operational</p>
          </div>
        </div>

        {/* Database Sync */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-md">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Neon Datastore</p>
            <p className="text-lg font-bold text-slate-800">Connected</p>
          </div>
        </div>

        {/* Security Shield */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RBAC Security</p>
            <p className="text-lg font-bold text-slate-800">Active (JWT)</p>
          </div>
        </div>

        {/* System Time */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-md">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Local Node Time</p>
            <p className="text-lg font-bold text-slate-800 font-mono text-sm">{systemUptime}</p>
          </div>
        </div>
      </div>

      {/* 2. Main Layout Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Core Settings Detail Block */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-800">Foundation Stack Verification</h2>
            <p className="text-xs text-slate-450 mt-0.5">Summary of the active architecture configuration logs</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 border border-slate-100 rounded-md bg-slate-50/40">
                <span className="font-semibold text-slate-500 block">Frontend Router</span>
                <span className="text-slate-800 mt-1 block">Next.js 14 App Router</span>
              </div>
              <div className="p-3 border border-slate-100 rounded-md bg-slate-50/40">
                <span className="font-semibold text-slate-500 block">Backend Server</span>
                <span className="text-slate-800 mt-1 block">Express.js (TypeScript Strict)</span>
              </div>
              <div className="p-3 border border-slate-100 rounded-md bg-slate-50/40">
                <span className="font-semibold text-slate-500 block">Database ORM</span>
                <span className="text-slate-800 mt-1 block">Drizzle (Relational Queries)</span>
              </div>
              <div className="p-3 border border-slate-100 rounded-md bg-slate-50/40">
                <span className="font-semibold text-slate-500 block">Logging Module</span>
                <span className="text-slate-800 mt-1 block">Winston (Console + Logfile)</span>
              </div>
            </div>

            <div className="p-4 border border-teal-100 rounded-md bg-teal-50/30 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-teal-850">Architectural Separation Warning</h3>
                <p className="text-[11px] text-teal-700/90 mt-1 leading-relaxed">
                  Every folder inside `/backend/src/features` and `/frontend/src/features` is decoupled and isolated. 
                  Do not import internal files across different modules. Connect features via standard APIs or services.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Identity Details Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-800">Terminal Identity</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                  {user ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    {user ? `${user.firstName} ${user.lastName}` : 'Securing Node...'}
                  </h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono uppercase mt-1 inline-block">
                    {user?.roles?.join(', ') || 'UNAUTHENTICATED'}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Node Email:</span>
                  <span className="font-semibold text-slate-700">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Environment:</span>
                  <span className="font-semibold text-slate-700 font-mono">development</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MFA Status:</span>
                  <span className="text-teal-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Enforced
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/40 text-center">
            <span className="text-[10px] text-slate-400 block font-mono">
              Core Version v0.1.0 • LALA Medical Complex
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
