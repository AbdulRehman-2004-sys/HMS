import React from 'react';

export const DoctorsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-2xl bg-slate-200 shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-slate-100 rounded-lg"></div>
            <div className="h-10 bg-slate-100 rounded-lg"></div>
          </div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-10 bg-slate-200 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
};
