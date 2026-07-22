import React from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ArrowRight, Building2, Users, HeartPulse } from 'lucide-react';
import { Container } from '../../ui/Container';
import { SectionTitle } from '../../ui/SectionTitle';

export const AboutPreview: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Highlight Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative bg-slate-900 text-white rounded-2xl p-8 shadow-xl border border-slate-800 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider">
                <Building2 className="h-4 w-4 text-teal-400" />
                <span>Established Excellence</span>
              </div>

              <h3 className="text-2xl font-black tracking-tight text-white leading-snug">
                Dedicated to Compassionate Healthcare & Medical Precision
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Founded with a mission to deliver accessible, high-quality specialist surgical and medical services, LALA Medical Complex stands as a cornerstone of healthcare in the region.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-center">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                  <span className="block text-2xl font-extrabold text-teal-400">11+</span>
                  <span className="text-[11px] font-medium text-slate-400">Senior Consultants</span>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700">
                  <span className="block text-2xl font-extrabold text-teal-400">24/7</span>
                  <span className="text-[11px] font-medium text-slate-400">Emergency & ICU</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Content */}
          <div className="lg:col-span-7 space-y-6">
            <SectionTitle
              tagline="About Our Hospital"
              title="State-of-the-Art Medical Care Built Around Patient Trust"
              subtitle="LALA Medical Complex combines modern healthcare infrastructure with top-tier medical specialists to ensure every patient receives personalized care."
              align="left"
              className="mb-6"
            />

            <div className="space-y-3">
              {[
                'Specialized Pediatric & Neonatal Surgical Units led by renowned professors.',
                'Comprehensive Maternal & Gynecological emergency operative care.',
                'Integrated Digital Health Records (EMR) for seamless patient tracking.',
                'Fully computerized Laboratory and high-resolution PACS Radiology.',
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 font-medium">{bullet}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md shadow transition-colors"
              >
                <span>Read Full Hospital Story</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};
