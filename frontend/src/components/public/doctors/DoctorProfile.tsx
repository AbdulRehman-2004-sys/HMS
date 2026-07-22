import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicDoctorProfile } from '../../../lib/public-doctors';
import {
  Award,
  Calendar,
  Clock,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  FileText,
  UserCheck,
  Building2,
  HeartHandshake,
} from 'lucide-react';

interface DoctorProfileProps {
  doctor: PublicDoctorProfile;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor }) => {
  const isCeo = doctor.slug === 'dr-zafar-iqbal';

  return (
    <div className="space-y-10">
      
      {/* 1. Header Profile Banner Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Photo & Credentials */}
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-4 border-teal-500 shadow-2xl bg-slate-950 shrink-0">
              {doctor.photoUrl ? (
                <Image
                  src={doctor.photoUrl}
                  alt={doctor.fullName}
                  fill
                  sizes="(max-width: 640px) 192px, 224px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-950 text-teal-400 font-extrabold text-4xl">
                  {doctor.firstName[0]}
                  {doctor.lastName[0]}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>PMDC Reg #: {doctor.registrationNumber || '33791-P'}</span>
              </span>
            </div>
          </div>

          {/* Full Doctor Details */}
          <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3 py-1 bg-teal-600 text-white text-xs font-extrabold uppercase rounded-md font-mono">
                  {doctor.department}
                </span>
                {isCeo && (
                  <span className="px-3 py-1 bg-white text-slate-900 text-xs font-black uppercase rounded-md">
                    Chief Executive Officer (CEO)
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                {doctor.fullName}
              </h1>

              <p className="text-sm sm:text-base font-bold text-teal-300">
                {doctor.specialization}
              </p>

              <p className="text-xs sm:text-sm font-mono text-slate-300">
                {doctor.qualification}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-left">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Clinical Experience</span>
                <strong className="text-teal-400 font-black text-lg sm:text-xl block">{doctor.experience}+ Years</strong>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Consultation Fee</span>
                <strong className="text-white font-black text-lg sm:text-xl block">PKR {doctor.consultationFee}</strong>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">OPD Availability</span>
                <strong className="text-teal-300 font-bold text-xs sm:text-sm block mt-1">
                  {doctor.availabilities.length > 0 ? `${doctor.availabilities.length} Days / Week` : 'Daily OPD'}
                </strong>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link
                href={`/book-appointment?doctor=${doctor.slug}`}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Book OPD Appointment</span>
              </Link>
              <a
                href="tel:+923001234567"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <PhoneCall className="h-4 w-4 text-teal-400" />
                <span>Hospital Helpline</span>
              </a>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Biography & Clinical Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Biography & Services */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Professional Biography */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="h-5 w-5 text-teal-600" />
              <span>Professional Biography & Background</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {doctor.biography}
            </p>
          </div>

          {/* Clinical Services & Procedures */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Stethoscope className="h-5 w-5 text-teal-600" />
              <span>Specialized Clinical Services & Procedures</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctor.services.map((service, index) => (
                <div
                  key={index}
                  className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-800"
                >
                  <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Weekly Schedule Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm sticky top-24">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="h-5 w-5 text-teal-600" />
              <span>OPD Consultation Schedule</span>
            </h3>

            {doctor.availabilities.length > 0 ? (
              <div className="space-y-2.5">
                {doctor.availabilities.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-extrabold text-slate-900">{slot.dayOfWeek}</span>
                    <span className="font-mono text-teal-700 font-bold bg-teal-50 px-2 py-1 rounded border border-teal-200">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold">Daily OPD OPD Timings</p>
                <p>09:00 AM – 02:00 PM</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 text-center space-y-3">
              <span className="text-[11px] text-slate-500 font-medium block">
                Token allocation operates on a first-come, first-served basis at the main reception desk.
              </span>
              <Link
                href={`/book-appointment?doctor=${doctor.slug}`}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>Reserve Appointment Slot</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
