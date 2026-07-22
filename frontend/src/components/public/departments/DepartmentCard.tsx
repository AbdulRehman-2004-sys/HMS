import React from 'react';
import Link from 'next/link';
import { PublicDepartment } from '../../../lib/public-doctors';
import {
  Baby,
  Users,
  Scissors,
  Activity,
  Ear,
  Heart,
  ShieldAlert,
  Syringe,
  FlaskConical,
  FileText,
  PhoneCall,
  ArrowRight,
  Stethoscope,
  CheckCircle2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Baby,
  Users,
  Scissors,
  Activity,
  Ear,
  Heart,
  ShieldAlert,
  Syringe,
  FlaskConical,
  FileText,
  PhoneCall,
};

interface DepartmentCardProps {
  department: PublicDepartment;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ department }) => {
  const IconComponent = ICON_MAP[department.iconName] || Stethoscope;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      
      {/* Top Accent Strip */}
      <div className="h-1.5 bg-teal-600 w-full"></div>

      <div className="p-6 space-y-4">
        
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <IconComponent className="h-6 w-6" />
          </div>

          <span className="px-2.5 py-1 bg-slate-900 text-teal-300 text-[10px] font-extrabold uppercase rounded-full font-mono shrink-0">
            {department.doctorCount} {department.doctorCount === 1 ? 'Doctor' : 'Doctors'}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-600 transition-colors">
            {department.name}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {department.shortDescription}
          </p>
        </div>

        {/* Clinical Services Pill Tags */}
        <div className="space-y-1 pt-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Key Services</span>
          <div className="flex flex-wrap gap-1">
            {department.services.slice(0, 3).map((service, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded border border-slate-200"
              >
                {service}
              </span>
            ))}
            {department.services.length > 3 && (
              <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded">
                +{department.services.length - 3} more
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Footer Link */}
      <div className="bg-slate-50 border-t border-slate-200 p-4">
        <Link
          href={`/departments/${department.slug}`}
          className="w-full py-2 bg-white hover:bg-teal-600 text-slate-900 hover:text-white text-xs font-bold rounded-lg border border-slate-200 hover:border-teal-600 transition-all flex items-center justify-center gap-1.5 shadow-sm group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600"
        >
          <span>Explore Department & Doctors</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

    </div>
  );
};
