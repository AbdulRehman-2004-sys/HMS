'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-center">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-full animate-pulse">
            <HelpCircle className="h-10 w-10" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">404 - Node Not Found</h1>
          <p className="text-sm text-slate-500">
            The requested resource, record, or command route does not exist on this gateway terminal.
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
        </div>
      </div>
    </div>
  );
}
