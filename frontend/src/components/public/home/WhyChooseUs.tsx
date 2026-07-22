import React from 'react';
import { ShieldCheck, HeartPulse, Clock, FileCheck2, Cpu, Sparkles } from 'lucide-react';
import { Container } from '../../ui/Container';
import { SectionTitle } from '../../ui/SectionTitle';

const PILLARS = [
  {
    icon: Clock,
    title: '24/7 Emergency & ICU Response',
    desc: 'Round-the-clock emergency medical trauma response, neonatal ICU, and urgent surgical readiness.',
  },
  {
    icon: ShieldCheck,
    title: 'Board-Certified Specialists',
    desc: 'Senior FCPS surgeons, gynecologists, pediatric specialists, and dedicated medical consultants.',
  },
  {
    icon: Cpu,
    title: 'Modern PACS & Digital EMR',
    desc: 'Fully computerized patient medical records (EMR) and high-resolution digital X-Ray & Ultrasound PACS.',
  },
  {
    icon: HeartPulse,
    title: 'Patient-Centered Compassion',
    desc: 'Empathetic patient care, transparent billing, and rigorous clinical safety protocols.',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-slate-900 text-white border-b border-slate-800">
      <Container>
        <SectionTitle
          tagline="Our Clinical Standards"
          title="Why Choose LALA Medical Complex?"
          subtitle="We are committed to delivering safe, reliable, and evidence-based healthcare for every patient."
          dark
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 p-6 rounded-xl border border-slate-700 space-y-4 hover:border-teal-500/50 transition-all"
              >
                <div className="h-12 w-12 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">{pillar.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
