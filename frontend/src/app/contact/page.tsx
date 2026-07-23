import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { ContactCard } from '../../components/public/contact/ContactCard';
import { EmergencyNumbers } from '../../components/public/contact/EmergencyNumbers';
import { OpeningHoursTable } from '../../components/public/contact/OpeningHoursTable';
import { GoogleMapSection } from '../../components/public/contact/GoogleMapSection';
import { Calendar, HelpCircle, ShieldCheck, ArrowRight, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us & Emergency Helpline | LALA Medical Complex Rahim Yar Khan',
  description:
    'Contact LALA Medical Complex in Rahim Yar Khan, Pakistan. Access 24/7 emergency hotline numbers, hospital directions, Google Maps location, opening hours, and appointment links.',
  openGraph: {
    title: 'Contact Us & Emergency Helpline | LALA Medical Complex',
    description:
      'Official contact details, emergency telephone numbers, hospital location map, and department working hours for LALA Medical Complex, Rahim Yar Khan.',
    url: 'https://lalamedical.com/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <PublicLayout>
      {/* 1. Breadcrumbs Header */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Contact Us' }]} />
        </Container>
      </div>

      {/* 2. Main Contact Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <SectionTitle
              tagline="Get in Touch"
              title="Hospital Contact & Emergency Services"
              subtitle="Our emergency medical care desk and outpatient reception teams are available to assist you with medical inquiries, appointments, and admissions."
              align="left"
            />

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/book-appointment"
                className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Appointment Online</span>
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg border border-slate-300 transition-colors"
              >
                <HelpCircle className="h-4 w-4 text-teal-600" />
                <span>View FAQs</span>
              </Link>
            </div>
          </div>

          {/* Contact Details & Opening Hours Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5">
              <ContactCard />
            </div>
            <div className="lg:col-span-7">
              <OpeningHoursTable />
            </div>
          </div>

          {/* Emergency Numbers Banner */}
          {/* <EmergencyNumbers /> */}

          {/* Interactive Google Map */}
          <GoogleMapSection />

          {/* Quick Appointment Callout */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-2xl p-8 shadow-xl border border-teal-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-block px-3 py-1 bg-teal-800/80 text-teal-200 text-xs font-bold uppercase tracking-wider rounded-md">
                Fast Track OPD Access
              </span>
              <h3 className="text-2xl font-extrabold text-white">Need to consult a Specialist Doctor?</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Reserve your outpatient slot online in under 60 seconds with instant token confirmation, or visit our reception desk.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/book-appointment"
                className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-colors flex items-center gap-2"
              >
                <span>Schedule Consultation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
