import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicDoctorProfile } from '../../../lib/public-doctors';
import { Award, Clock, ArrowRight, UserCheck, Calendar, CheckCircle2 } from 'lucide-react';

interface DoctorCardProps {
  doctor: PublicDoctorProfile;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const isCeo = doctor.slug === 'dr-zafar-iqbal';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      
      {/* Top Banner Accent */}
      <div className="h-2 bg-gradient-to-r from-teal-600 to-slate-900 w-full"></div>

      <div className="p-6 space-y-5">
        
        {/* Header: Photo & Basic Info */}
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-slate-900 border-2 border-teal-600 shadow-md shrink-0">
            {doctor.photoUrl ? (
              <Image
                src={doctor.photoUrl}
                alt={doctor.fullName}
                fill
                sizes="96px"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-teal-400 font-extrabold text-xl">
                {doctor.firstName[0]}
                {doctor.lastName[0]}
              </div>
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-extrabold uppercase rounded font-mono">
                {doctor.department}
              </span>
              {isCeo && (
                <span className="px-2 py-0.5 bg-slate-900 text-teal-300 text-[10px] font-extrabold uppercase rounded font-mono">
                  CEO / Leadership
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 truncate leading-snug group-hover:text-teal-600 transition-colors">
              {doctor.fullName}
            </h3>

            <p className="text-xs text-slate-600 font-semibold line-clamp-1">
              {doctor.specialization}
            </p>

            <p className="text-[11px] font-mono text-slate-500 line-clamp-1">
              {doctor.qualification}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
            <Award className="h-4 w-4 text-teal-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Experience</span>
              <strong className="text-slate-800 font-bold">{doctor.experience}+ Years</strong>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">PMDC Reg #</span>
              <strong className="text-slate-800 font-mono text-[11px]">{doctor.registrationNumber || 'Verified'}</strong>
            </div>
          </div>
        </div>

        {/* Availability Badges */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-teal-600" />
            <span>OPD Schedule & Days:</span>
          </span>

          {doctor.availabilities.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {doctor.availabilities.slice(0, 4).map((a) => (
                <span
                  key={a.id}
                  className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded border border-slate-200"
                >
                  {a.dayOfWeek.slice(0, 3)}: {a.startTime.split(' ')[0]}-{a.endTime.split(' ')[0]}
                </span>
              ))}
              {doctor.availabilities.length > 4 && (
                <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded">
                  +{doctor.availabilities.length - 4} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic block">
              Daily OPD by Appointment
            </span>
          )}
        </div>

      </div>

      {/* Footer Action Button */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
        <div className="text-xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">OPD Fee</span>
          <strong className="text-slate-900 font-black text-sm">PKR {doctor.consultationFee}</strong>
        </div>

        <Link
          href={`/doctors/${doctor.slug}`}
          className="px-4 py-2 bg-slate-900 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm group-hover:bg-teal-600"
        >
          <span>View Profile</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

    </div>
  );
};
