import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Calendar, ArrowRight, Award, Clock } from 'lucide-react';
import { Container } from '../../ui/Container';
import { SectionTitle } from '../../ui/SectionTitle';

const FEATURED_DOCTORS = [
  {
    name: 'Prof. Dr. Zafar Iqbal',
    specialization: 'Pediatric Surgeon / CEO',
    qualification: 'MBBS, FCPS, MME',
    experience: '20+ Years Experience',
    availability: 'Mon & Wed: 09:00 AM - 02:00 PM',
    image: '/images/CEO.webp',
  },
  {
    name: 'Dr. Shumaila Irum',
    specialization: 'APWMO / Medical Superintendent',
    qualification: 'MBBS, MME, M Phil (Physiology)',
    experience: '12+ Years Experience',
    availability: 'Tue & Thu: 09:00 AM - 02:00 PM',
  },
  {
    name: 'Dr. Noor Ahmed Niazi',
    specialization: 'Consultant General Surgeon',
    qualification: 'MBBS, FCPS',
    experience: '15+ Years Experience',
    availability: 'Mon & Fri: 11:00 AM - 04:00 PM',
  },
  {
    name: 'Dr. Afsheen Asif',
    specialization: 'Consultant Gynecologist',
    qualification: 'MBBS, MCPS',
    experience: '10+ Years Experience',
    availability: 'Mon & Wed: 10:00 AM - 03:00 PM',
  },
];

export const DoctorsPreview: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <Container>
        <SectionTitle
          tagline="Senior Medical Faculty"
          title="Meet Our Expert Doctors & Surgeons"
          subtitle="Our board-certified consultants and surgeons deliver compassionate, evidence-based medical treatment."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_DOCTORS.map((doc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-md hover:border-teal-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Doctor Avatar */}
                <div className="relative h-20 w-20 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold border-2 border-teal-500/40 mx-auto overflow-hidden shadow-sm">
                  {doc.image ? (
                    <Image src={doc.image} alt={doc.name} fill sizes="80px" className="object-cover object-top" />
                  ) : (
                    <User className="h-9 w-9" />
                  )}
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{doc.name}</h3>
                  <p className="text-xs font-bold text-teal-600">{doc.specialization}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{doc.qualification}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>{doc.experience}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{doc.availability}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/book-appointment"
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-teal-600 text-white font-bold text-xs rounded transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Book Consultation</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-10">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors"
          >
            <span>View Full Directory of 11+ Medical Consultants</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
};
