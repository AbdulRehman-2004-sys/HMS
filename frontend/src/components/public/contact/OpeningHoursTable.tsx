'use client';

import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

export interface TimingRow {
  dayRange: string;
  opdHours: string;
  emergencyHours: string;
  status: 'Open 24/7' | '24 Hours';
}

const defaultTimings: TimingRow[] = [
  {
    dayRange: 'Monday',
    opdHours: 'Open 24 Hours',
    emergencyHours: 'Open 24 Hours',
    status: 'Open 24/7',
  },
  {
    dayRange: 'Tuesday',
    opdHours: 'Open 24 Hours',
    emergencyHours: 'Open 24 Hours',
    status: 'Open 24/7',
  },
  {
    dayRange: 'Wednesday',
    opdHours: 'Open 24 Hours',
    emergencyHours: 'Open 24 Hours',
    status: 'Open 24/7',
  },
  {
    dayRange: 'Thursday',
    opdHours: 'Open 24 Hours',
    emergencyHours: 'Open 24 Hours',
    status: 'Open 24/7',
  },
  {
    dayRange: 'Friday',
    opdHours: 'Open 24 Hours',
    emergencyHours: 'Open 24 Hours',
    status: 'Open 24/7',
  },
  {
    dayRange: 'Saturday',
    opdHours: 'Open 24 Hours',
    emergencyHours: 'Open 24 Hours',
    status: 'Open 24/7',
  },
  {
    dayRange: 'Sunday',
    opdHours: 'Open 24 Hours',
    emergencyHours: 'Open 24 Hours',
    status: 'Open 24/7',
  },
];

export const OpeningHoursTable: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-5 w-5 text-teal-600" />
          <span>Hospital Operating Hours (24 Hours Open)</span>
        </h3>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Open Now • 24/7 Service</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[11px] font-bold tracking-wider">
              <th className="py-3 px-4">Day</th>
              <th className="py-3 px-4">Hospital Timings</th>
              <th className="py-3 px-4">Emergency & IPD</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {defaultTimings.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{row.dayRange}</td>
                <td className="py-3 px-4 text-emerald-700 font-semibold">{row.opdHours}</td>
                <td className="py-3 px-4 text-teal-700 font-semibold">{row.emergencyHours}</td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
