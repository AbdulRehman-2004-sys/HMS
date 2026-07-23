import React from 'react';
import Link from 'next/link';
import { Calendar, ShieldCheck, PhoneCall, Stethoscope, Activity, CheckCircle2 } from 'lucide-react';
import { Container } from '../../ui/Container';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white pt-10 sm:pt-16 pb-12 sm:pb-16 overflow-hidden border-b border-slate-800">

      {/* Subtle Ambient Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-500/15 via-transparent to-transparent pointer-events-none"></div>

      <Container className="relative z-10 space-y-8 sm:space-y-12">

        {/* Main Hero 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>Leading Tertiary Care Hospital in Rahim Yar Khan</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Advanced Medical Care for You & Your Family
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
              LALA Medical Complex provides standard medical treatment for over 25 years. Specialized pediatric surgery, maternal healthcare, 24/7 ICU & emergency trauma care, pathology labs, and digital radiology imaging.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/book-appointment"
                className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-teal-500/25 transition-all flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Appointment Online</span>
              </Link>

              <Link
                href="/departments"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2"
              >
                <Stethoscope className="h-4 w-4 text-teal-400" />
                <span>Explore Departments</span>
              </Link>

              <a
                href="tel:+923006708300"
                className="px-4 py-3.5 text-amber-300 hover:text-amber-200 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>Emergency: +92 300 6708300</span>
              </a>
            </div>

            {/* Quick Feature Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span>Open 24 Hours / 7 Days</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span>25+ Years Treatment Experience</span>
              </span>
            </div>

          </div>

          {/* Right Column: Hero Image Anchored to Bottom with Gradient Edge Mask */}

          <div className='lg:col-span-6  w-[100%] h-[500px]'>
            <img src="images/hero.png" alt="LALA Medical Complex"
              className='object-contain object-bottom filter drop-shadow-2xl [mask-image:linear-gradient(to_bottom,black_75%,transparent_98%)]'
            />
          </div>
        </div>

        {/* 3 Bottom Value Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-800">
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
