import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Stethoscope } from 'lucide-react';
import { Container } from '../../ui/Container';

export const CtaBanner: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-900/40 to-slate-900 pointer-events-none"></div>

      <Container className="relative z-10 text-center max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider">
          <Stethoscope className="h-4 w-4 text-teal-400" />
          <span>Easy Online Consultation Booking</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          Ready to Schedule Your Visit with Our Specialists?
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Skip long queues by booking your doctor consultation online. Choose your preferred specialist, date, and convenient time slot.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/book-appointment"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-md shadow-lg transition-colors flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Book Appointment Now</span>
          </Link>

          <Link
            href="/contact"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm rounded-md transition-colors flex items-center gap-2"
          >
            <span>Contact Helpline</span>
            <ArrowRight className="h-4 w-4 text-teal-400" />
          </Link>
        </div>
      </Container>
    </section>
  );
};
