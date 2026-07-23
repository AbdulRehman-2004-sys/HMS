import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { FaqAccordion, defaultFaqs } from '../../components/public/contact/FaqAccordion';
import { HelpCircle, PhoneCall, Calendar, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | LALA Medical Complex Rahim Yar Khan',
  description:
    'Find answers to common patient questions regarding appointment booking, hospital timings, OPD doctor availability, location directions, clinical services, and registration requirements.',
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | LALA Medical Complex',
    description:
      'Answers to patient queries on appointments, emergency services, timings, laboratory reports, and hospital location.',
    url: 'https://lalamedical.com/faq',
    type: 'website',
  },
};

export default function FaqPage() {
  return (
    <PublicLayout>
      {/* 1. Breadcrumbs Header */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'FAQ' }]} />
        </Container>
      </div>

      {/* 2. Main Content Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="max-w-4xl space-y-10">
          <SectionTitle
            tagline="Patient Knowledgebase"
            title="Frequently Asked Questions"
            subtitle="Have questions about visiting LALA Medical Complex? Browse through our answers below or contact our 24/7 patient helpline."
            align="center"
          />

          {/* Interactive Accordion */}
          <div className="bg-white p-2 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <FaqAccordion items={defaultFaqs} />
          </div>

          {/* Still Have Questions Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <HelpCircle className="h-5 w-5 text-teal-400" />
                <span>Still have unanswered questions?</span>
              </h3>
              <p className="text-xs text-slate-300">
                Our helpline team is available 24/7 to assist you with patient guidance and emergency inquiries.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="tel:+923006708300"
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-mono font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-2"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call +92 300 6708300</span>
              </a>
              <Link
                href="/contact"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>Contact Page</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
