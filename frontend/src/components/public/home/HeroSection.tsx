import React from 'react';
import Link from 'next/link';
import { Calendar, ShieldCheck, PhoneCall, Stethoscope, Activity, HeartPulse } from 'lucide-react';
import { Container } from '../../ui/Container';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white pt-12 sm:pt-16 pb-20 overflow-hidden border-b border-slate-800">
      
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none"></div>

      <Container className="relative z-10 space-y-12">
        
        {/* Main Hero Header */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-teal-400" />
            <span>Leading Tertiary Care Hospital in Sargodha</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Advanced Medical Care for You & Your Family
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-normal">
            LALA Medical Complex provides world-class pediatric surgery, maternal healthcare, 24/7 ICU & emergency trauma care, state-of-the-art pathology labs, and digital radiology imaging.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/book-appointment"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-md shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Book Appointment Online</span>
            </Link>

            <Link
              href="/departments"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-md transition-all flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4 text-teal-400" />
              <span>Explore Departments</span>
            </Link>

            <a
              href="tel:+923001234567"
              className="px-4 py-3 text-amber-400 hover:text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Emergency: +92 300 1234567</span>
            </a>
          </div>
        </div>

        {/* 3 Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">24/7 Emergency & ICU</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Round-the-clock trauma care, advanced pediatric ICU, and emergency surgery response.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Board-Certified Specialists</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Senior professors, FCPS consultants, gynecologists, and pediatric surgeons.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">PACS & Lab Diagnostics</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Fully digital pathology report delivery and high-definition X-Ray & Ultrasound PACS.
              </p>
            </div>
          </div>
        </div>

      </Container>
    </section>
  );
};
