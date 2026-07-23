'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Menu,
  X,
  Lock,
  Activity,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { getHospitalSettingsApi, HospitalSettings } from '../../lib/settings';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Facilities', href: '/facilities' },
  { name: 'Photo Gallery', href: '/gallery' },
  { name: 'Doctors', href: '/doctors' },
  { name: 'Departments', href: '/departments' },
  { name: 'Book Appointment', href: '/book-appointment' },
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
];

export const PublicNavbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings | null>(null);

  useEffect(() => {
    getHospitalSettingsApi()
      .then(setHospitalSettings)
      .catch(() => { });
  }, []);

  const hospitalName = hospitalSettings?.hospitalName || 'LALA Medical Complex';
  const hospitalLogo = hospitalSettings?.hospitalLogo || null;
  const contactPhone = hospitalSettings?.contactNumber || '+92 300 6708300';
  const contactEmail = hospitalSettings?.email || 'info@lalamedical.com';
  const hospitalAddress = hospitalSettings?.address || 'Basti Amanat Ali, Airport Road, near Decent Bakers, Rahim Yar Khan, Punjab, Pakistan';

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80">
      {/* 1. Top Utility Header Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 hidden sm:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-teal-400" />
              <strong className="text-white font-mono">{contactPhone}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-teal-400" />
              <span>{contactEmail}</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 truncate max-w-xs">
              <MapPin className="h-3.5 w-3.5 text-teal-400 shrink-0" />
              <span className="truncate">{hospitalAddress}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-teal-300 font-semibold">
              <Clock className="h-3.5 w-3.5 text-teal-400" />
              <span>Emergency 24/7 Service</span>
            </span>
            <span className="text-slate-600">|</span>
            <Link
              href="/login"
              className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 transition-colors"
            >
              <Lock className="h-3 w-3" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Public Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">

        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          {hospitalLogo ? (
            <img
              src={hospitalLogo}
              alt={hospitalName}
              className="h-9 sm:h-11 max-w-[140px] object-contain"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:bg-teal-700 transition-colors">
              <Activity className="h-6 w-6" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-tight">
              {hospitalName}
            </span>
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest leading-none">
              Tertiary Care Hospital
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Tabs - Refined & Modern */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 bg-slate-100/60 p-1.5 rounded-xl border border-slate-200/60">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 text-xs xl:text-[13px] font-semibold rounded-lg transition-all duration-200 flex items-center gap-1 whitespace-nowrap ${isActive
                    ? 'bg-white text-teal-800 font-bold shadow-xs border border-slate-200/80'
                    : 'text-slate-700 hover:text-teal-700 hover:bg-white/70'
                  }`}
              >
                <span>{item.name}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <Link
            href="/book-appointment"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Appointment</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-teal-600 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-xl">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between ${isActive
                      ? 'text-teal-800 bg-teal-50/90 border-l-4 border-teal-600 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <span>{item.name}</span>
                  <ChevronRight className={`h-4 w-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/book-appointment"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Appointment</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
