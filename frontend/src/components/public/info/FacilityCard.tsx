import React from 'react';
import { LucideIcon, CheckCircle2 } from 'lucide-react';

export interface FacilityItem {
  id: string;
  icon: LucideIcon;
  title: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  badgeText?: string;
}

interface FacilityCardProps {
  facility: FacilityItem;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({ facility }) => {
  const Icon = facility.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all p-6 space-y-4 flex flex-col justify-between group">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shadow-sm">
            <Icon className="h-6 w-6" />
          </div>
          {facility.badgeText && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200">
              {facility.badgeText}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
            {facility.title}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
            {facility.shortDesc}
          </p>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
          {facility.fullDesc}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
          Key Capabilities
        </span>
        <ul className="space-y-1 text-xs text-slate-700">
          {facility.features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
