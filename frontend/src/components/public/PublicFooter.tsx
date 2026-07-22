'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Phone,
  Mail,
  MapPin,
  Clock,
  Lock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { getHospitalSettingsApi, HospitalSettings } from '../../lib/settings';

export const PublicFooter: React.FC = () => {
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings | null>(null);

  useEffect(() => {
    getHospitalSettingsApi()
      .then(setHospitalSettings)
      .catch(() => {});
  }, []);

  const hospitalName = hospitalSettings?.hospitalName || 'LALA Medical Complex';
  const hospitalLogo = hospitalSettings?.hospitalLogo || null;
  const contactPhone = hospitalSettings?.contactNumber || '+92 300 1234567';
  const contactEmail = hospitalSettings?.email || 'info@lalamedical.com';
  const hospitalAddress = hospitalSettings?.address || 'Main Stadium Road, Sargodha, Punjab, Pakistan';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t-4 border-teal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Hospital Branding */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              {hospitalLogo ? (
                <img
                  src={hospitalLogo}
                  alt={hospitalName}
                  className="h-10 max-w-[150px] object-contain bg-white/10 p-1 rounded"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Activity className="h-6 w-6" />
                </div>
              )}
              <span className="font-extrabold text-base text-white tracking-tight">
                {hospitalName}
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              Providing state-of-the-art tertiary medical care, advanced pediatric surgeries, maternal health, 24/7 ICU, emergency services, and PACS diagnostic imaging.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-teal-400">
              <ShieldCheck className="h-4 w-4 text-teal-500" />
              <span>Certified Healthcare Excellence</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white border-b border-slate-800 pb-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: 'Home Page', href: '/' },
                { name: 'About Hospital', href: '/about' },
                { name: 'Hospital Facilities', href: '/facilities' },
                { name: 'Photo Gallery', href: '/gallery' },
                { name: 'Find a Specialist', href: '/doctors' },
                { name: 'Medical Departments', href: '/departments' },
                { name: 'Book Appointment', href: '/book-appointment' },
                { name: 'Contact & Helpline', href: '/contact' },
                { name: 'Privacy Policy', href: '/privacy-policy' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronRight className="h-3 w-3 text-teal-500" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Clinical Specializations */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white border-b border-slate-800 pb-2">
              Clinical Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                <span>Pediatric Surgery & Child Health</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                <span>Obstetrics & Gynecology</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                <span>General & Laparoscopic Surgery</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                <span>Orthopedic & Joint Surgeries</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                <span>Pathology Laboratory Services</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                <span>Digital Radiology & PACS Scans</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white border-b border-slate-800 pb-2">
              Hospital Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{hospitalAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-teal-400 shrink-0" />
                <span className="font-mono text-white font-bold">{contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                <span>{contactEmail}</span>
              </li>
              <li className="flex items-center gap-2 text-teal-300">
                <Clock className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Emergency OPD & ICU: Open 24/7</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Staff Portal Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {hospitalName}. All Rights Reserved.</p>

          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href="/login"
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Staff Intranet Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
