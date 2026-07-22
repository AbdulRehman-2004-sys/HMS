import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { VisionMissionCard } from '../../components/public/info/VisionMissionCard';
import { CeoMessageCard } from '../../components/public/info/CeoMessageCard';
import { WhyChooseUs } from '../../components/public/home/WhyChooseUs';
import { CtaBanner } from '../../components/public/home/CtaBanner';
import { Building2, Award, Users, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | LALA Medical Complex Hospital',
  description: 'Learn about LALA Medical Complex history, clinical vision & mission, CEO address by Prof. Dr. M Zafar Iqbal, pediatric surgical leadership, and state-of-the-art medical facilities.',
  openGraph: {
    title: 'About LALA Medical Complex | Vision, Mission & Leadership',
    description: 'Lighting New Ways in Healthcare. Read our official vision, mission, CEO message, and clinical standards.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <PublicLayout>
      
      {/* 1. Breadcrumbs */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'About Us' }]} />
        </Container>
      </div>

      {/* 2. Hero Header Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="space-y-12">
          <SectionTitle
            tagline="Hospital Overview & Legacy"
            title="About LALA Medical Complex"
            subtitle="Providing high-precision tertiary care, specialized pediatric surgeries, maternal health, and computerized diagnostic healthcare to our community."
            align="left"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Main Hospital Introduction Text */}
            <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                <strong>LALA Medical Complex</strong> is an enterprise tertiary care hospital dedicated to clinical excellence, surgical precision, and patient safety. Built upon a strong legacy of medical leadership, our hospital offers multi-specialty OPD consultations, round-the-clock emergency trauma response, and modern inpatient wards.
              </p>
              <p>
                Under the leadership of <strong>Prof. Dr. M Zafar Iqbal</strong> (Pediatric Surgeon / CEO) and <strong>Dr. Shumaila Irum</strong> (Medical Superintendent), the complex has grown into a regional center for complex pediatric surgeries, maternal health, automated lab diagnostics, and digital PACS radiology imaging.
              </p>
              <p>
                Our hospital operates on an integrated Electronic Medical Records (EMR) system to ensure zero record loss, instant medical history retrieval, and transparent cashier billing.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/facilities"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md shadow transition-colors inline-flex items-center gap-2"
                >
                  <span>Explore Hospital Facilities</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/gallery"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md transition-colors inline-flex items-center gap-2"
                >
                  <span>View Hospital Photo Gallery</span>
                </Link>
              </div>
            </div>

            {/* Quick Statistics Banner */}
            <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <Building2 className="h-4 w-4" />
                <span>Established Excellence</span>
              </div>

              <h3 className="text-xl font-bold text-white leading-snug">
                Key Operational Milestones
              </h3>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  <span className="block text-2xl sm:text-3xl font-black text-teal-400">11+</span>
                  <span className="text-[11px] font-semibold text-slate-300 mt-1 block">Senior Consultants</span>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  <span className="block text-2xl sm:text-3xl font-black text-teal-400">24/7</span>
                  <span className="text-[11px] font-semibold text-slate-300 mt-1 block">Emergency & ICU</span>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  <span className="block text-2xl sm:text-3xl font-black text-teal-400">100%</span>
                  <span className="text-[11px] font-semibold text-slate-300 mt-1 block">Digital EMR System</span>
                </div>
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                  <span className="block text-2xl sm:text-3xl font-black text-teal-400">7+</span>
                  <span className="text-[11px] font-semibold text-slate-300 mt-1 block">Specialized Wards</span>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* 3. Official Vision & Mission Section (From Official Hospital Banner) */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <Container>
          <SectionTitle
            tagline="Guiding Principles"
            title="Vision, Mission & Core Values"
            subtitle="Extracted directly from our official hospital Charter & Quality Standards."
          />
          <VisionMissionCard />
        </Container>
      </section>

      {/* 4. CEO Message Section */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <Container>
          <CeoMessageCard />
        </Container>
      </section>

      {/* 5. Why Choose Us Section */}
      <WhyChooseUs />

      {/* 6. Call to Action Banner */}
      <CtaBanner />

    </PublicLayout>
  );
}
