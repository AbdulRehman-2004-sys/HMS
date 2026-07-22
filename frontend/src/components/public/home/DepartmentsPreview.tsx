import React from 'react';
import Link from 'next/link';
import {
  Scissors,
  Baby,
  Stethoscope,
  Activity,
  FlaskConical,
  FileText,
  Bed,
  ArrowRight,
} from 'lucide-react';
import { Container } from '../../ui/Container';
import { SectionTitle } from '../../ui/SectionTitle';

const DEPARTMENTS = [
  {
    icon: Baby,
    title: 'Pediatric Surgery',
    desc: 'Advanced neonatal & pediatric surgical procedures led by Prof. Dr. M Zafar Iqbal.',
  },
  {
    icon: Stethoscope,
    title: 'Obstetrics & Gynecology',
    desc: 'Maternal care, antenatal clinics, laparoscopic gynecological procedures & delivery.',
  },
  {
    icon: Scissors,
    title: 'General & Laparoscopic Surgery',
    desc: 'Minimal access laparoscopic surgeries, hernia repairs, and abdominal procedures.',
  },
  {
    icon: Activity,
    title: 'Orthopedics & Joint Surgery',
    desc: 'Fracture trauma management, joint replacements, and bone reconstruction.',
  },
  {
    icon: FlaskConical,
    title: 'Pathology Laboratory',
    desc: '24/7 automated diagnostic lab for hematology, biochemistry, and microbiology.',
  },
  {
    icon: FileText,
    title: 'Radiology & PACS Imaging',
    desc: 'High-definition Digital X-Ray, Color Doppler Ultrasound, and CT Scan imaging.',
  },
];

export const DepartmentsPreview: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <Container>
        <SectionTitle
          tagline="Clinical Specializations"
          title="Hospital Departments & Services"
          subtitle="Explore our specialized clinical departments staffed by experienced consultants and equipped with modern technology."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept, index) => {
            const Icon = dept.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all duration-200 space-y-4 group"
              >
                <div className="h-12 w-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {dept.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {dept.desc}
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/departments"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    <span>View Department Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-10">
          <Link
            href="/departments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow transition-colors"
          >
            <span>View All Clinical Specializations</span>
            <ArrowRight className="h-4 w-4 text-teal-400" />
          </Link>
        </div>
      </Container>
    </section>
  );
};
