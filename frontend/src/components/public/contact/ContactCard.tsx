'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export interface ContactCardProps {
  address?: string;
  phone?: string;
  email?: string;
  emergencyHours?: string;
  opdHours?: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  address = 'Basti Amanat Ali, Airport Road, near Decent Bakers, Rahim Yar Khan, Punjab, Pakistan',
  phone = '+92 300 6708300',
  email = 'info@lalamedical.com',
  emergencyHours = 'Open 24/7 (Emergency, ICU & Ward Intake)',
  opdHours = 'Mon - Sat (08:00 AM - 08:00 PM)',
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800 shadow-lg">
      <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
        <span>Hospital Contact Details</span>
        <span className="text-xs text-teal-400 font-normal bg-teal-950/80 border border-teal-800 px-2.5 py-0.5 rounded-full">
          Official Intake
        </span>
      </h3>

      <ul className="space-y-5 text-xs sm:text-sm text-slate-300">
        <li className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-teal-900/50 border border-teal-700/50 text-teal-400 shrink-0 mt-0.5">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <strong className="block text-white font-bold text-sm mb-0.5">Physical Address:</strong>
            <span className="text-slate-300 leading-relaxed">{address}</span>
          </div>
        </li>

        <li className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-teal-900/50 border border-teal-700/50 text-teal-400 shrink-0 mt-0.5">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <strong className="block text-white font-bold text-sm mb-0.5">Main Helpline:</strong>
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="font-mono text-teal-300 font-bold hover:text-white transition-colors text-base"
            >
              {phone}
            </a>
          </div>
        </li>

        <li className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-teal-900/50 border border-teal-700/50 text-teal-400 shrink-0 mt-0.5">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <strong className="block text-white font-bold text-sm mb-0.5">Official Email:</strong>
            <a
              href={`mailto:${email}`}
              className="text-slate-300 hover:text-teal-300 transition-colors"
            >
              {email}
            </a>
          </div>
        </li>

        <li className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-teal-900/50 border border-teal-700/50 text-teal-400 shrink-0 mt-0.5">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <strong className="block text-white font-bold text-sm mb-0.5">Hospital Timings:</strong>
            <span className="text-teal-300 font-semibold block">{emergencyHours}</span>
            <span className="text-slate-400 text-xs mt-0.5 block">{opdHours}</span>
          </div>
        </li>
      </ul>
    </div>
  );
};
