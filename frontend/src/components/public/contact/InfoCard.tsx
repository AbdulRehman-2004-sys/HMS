'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface InfoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  linkHref?: string;
  linkLabel?: string;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  badge,
  linkHref,
  linkLabel = 'Learn More',
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between space-y-4 ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-600">
            {icon}
          </div>
          {badge && (
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-md">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>

      {linkHref && (
        <div className="pt-2 border-t border-slate-100">
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
          >
            <span>{linkLabel}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
