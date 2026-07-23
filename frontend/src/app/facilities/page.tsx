import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { FacilityCard, FacilityItem } from '../../components/public/info/FacilityCard';
import {
  PhoneCall,
  Stethoscope,
  Bed,
  Scissors,
  FlaskConical,
  FileText,
  Activity,
  Truck,
  Pill,
  Calendar,
  Heart,
  Wind,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hospital Facilities & 13 Core Medical Services | LALA Medical Complex Rahim Yar Khan',
  description: 'Providing standard medical treatment for 25+ years in Rahim Yar Khan. Pediatric Surgery, General Surgery, Obstetrics, Gynaecology, ENT, Urology, Orthopedics, Pathology Lab, Digital X-Ray, ECG, Nebulization, VIP Rooms, and 24/7 Pharmacy.',
  openGraph: {
    title: 'Clinical Facilities & Medical Services | LALA Medical Complex',
    description: '25+ Years of Healthcare Excellence in Rahim Yar Khan. Open 24 Hours 7 Days a Week.',
    type: 'website',
  },
};

const FACILITIES_DATA: FacilityItem[] = [
  {
    id: 'f-1',
    icon: Scissors,
    title: '1. Pediatric Surgery',
    shortDesc: 'Specialized neonatal & child surgical procedures.',
    fullDesc: 'Led by senior pediatric surgical faculty with 25+ years of clinical excellence in congenital deformity correction, neonatal emergencies, and pediatric abdominal surgeries.',
    features: [
      'Neonatal & Infant Surgical Excellence',
      'Pediatric Laparoscopic Surgery',
      '24/7 Emergency Pediatric Intake',
    ],
    badgeText: 'Core Specialty',
  },
  {
    id: 'f-2',
    icon: Scissors,
    title: '2. General Surgery',
    shortDesc: 'Major & laparoscopic surgical procedures.',
    fullDesc: 'Sterile operation theatres equipped with laparoscopic towers for appendectomy, cholecystectomy, hernia repair, and emergency trauma surgery.',
    features: [
      'Laparoscopic Minimal Access Surgery',
      'Sterile OT Airflow & Monitoring',
      'Post-Operative Recovery Ward',
    ],
  },
  {
    id: 'f-3',
    icon: Stethoscope,
    title: '3. Obstetrics',
    shortDesc: 'Maternal health, pregnancy care & safe deliveries.',
    fullDesc: 'Comprehensive antenatal care, high-risk pregnancy monitoring, normal vaginal deliveries, and 24/7 emergency C-section facilities.',
    features: [
      'High-Risk Pregnancy Management',
      '24/7 Emergency C-Section Operating Unit',
      'Fetal Heart Rate Monitoring',
    ],
  },
  {
    id: 'f-4',
    icon: Stethoscope,
    title: '4. Gynaecology',
    shortDesc: 'Complete women’s reproductive healthcare.',
    fullDesc: 'Diagnosis and surgical management of gynecological disorders, pelvic pain, infertility consultations, and laparoscopic procedures.',
    features: [
      'Gynecological Consultation & Screening',
      'Hysterectomy & Fibroid Surgeries',
      'Female Healthcare Specialists',
    ],
  },
  {
    id: 'f-5',
    icon: Activity,
    title: '5. ENT (Ear, Nose & Throat)',
    shortDesc: 'Otolaryngology consultations & surgeries.',
    fullDesc: 'Comprehensive care for ear infections, sinus disorders, tonsillectomy, nasal septum correction, and throat ailments.',
    features: [
      'Diagnostic Otoscopy & Endoscopy',
      'Tonsil & Adenoid Surgeries',
      'Sinus & Hearing Evaluation',
    ],
  },
  {
    id: 'f-6',
    icon: Activity,
    title: '6. Urology',
    shortDesc: 'Kidney, bladder & urinary tract care.',
    fullDesc: 'Advanced treatment for kidney stones, prostate disorders, urinary infections, and endoscopic urological procedures.',
    features: [
      'Kidney Stone Treatment',
      'Prostate & Bladder Care',
      'Urinary Tract Diagnostics',
    ],
  },
  {
    id: 'f-7',
    icon: Activity,
    title: '7. Orthopedics',
    shortDesc: 'Bone, joint & trauma fracture surgery.',
    fullDesc: 'Expert orthopedic surgeons handling bone fracture fixations, joint pain management, sports injuries, and spine evaluation.',
    features: [
      'Emergency Fracture Plaster & Surgery',
      'Joint & Bone Trauma Care',
      'Orthopedic Rehabilitation Support',
    ],
  },
  {
    id: 'f-8',
    icon: FlaskConical,
    title: '8. Laboratory Services',
    shortDesc: 'Automated 24/7 computerized pathology lab.',
    fullDesc: 'Fully automated analyzers for Hematology (CBC), Biochemistry (LFT, RFT, FBS), Serology, Urine RE, and Blood Chemistry with immediate result entry to EMR.',
    features: [
      '24/7 Automated Blood & Urine Testing',
      'Strict Quality Control Standards',
      'Instant EMR Report Archiving',
    ],
    badgeText: 'Open 24/7',
  },
  {
    id: 'f-9',
    icon: FileText,
    title: '9. Digital X-Ray & Ultrasound',
    shortDesc: 'High-definition digital PACS diagnostic imaging.',
    fullDesc: 'High-frequency digital X-Ray (AP/PA views) and Color Doppler Ultrasound for abdominal, pelvic, and obstetric diagnostic evaluation.',
    features: [
      'Digital Radiography (X-Ray)',
      'Abdominal & Pelvic Ultrasound',
      'Instant PACS Radiologist Viewing',
    ],
    badgeText: 'PACS Imaging',
  },
  {
    id: 'f-10',
    icon: Heart,
    title: '10. ECG (Electrocardiogram)',
    shortDesc: 'Cardiac diagnostic tracing & heart evaluation.',
    fullDesc: '12-lead digital ECG recording for immediate cardiac evaluation, chest pain triage, and pre-operative cardiac clearance.',
    features: [
      '12-Lead Cardiac Tracing',
      'Immediate Physician Evaluation',
      '24/7 Cardiac Emergency Screening',
    ],
  },
  {
    id: 'f-11',
    icon: Wind,
    title: '11. Nebulization & Asthma Care',
    shortDesc: 'Respiratory airway & aerosol therapy.',
    fullDesc: 'Dedicated aerosol nebulization stations for pediatric and adult asthma, bronchitis, COPD, and acute respiratory distress.',
    features: [
      'Pediatric & Adult Airway Relief',
      'Oxygen Therapy Lines',
      '24/7 Acute Respiratory Triage',
    ],
  },
  {
    id: 'f-12',
    icon: Bed,
    title: '12. VIP Executive Rooms',
    shortDesc: 'Comfortable, private inpatient accommodation.',
    fullDesc: 'Air-conditioned VIP private rooms featuring attached washrooms, patient attendant seating, electric beds, and 24/7 nursing oversight.',
    features: [
      'Air-Conditioned VIP Suite Amenities',
      '24/7 Nurse Call System & Doctor Visits',
      'Attendant Seating & Quiet Environment',
    ],
    badgeText: 'VIP IPD',
  },
  {
    id: 'f-13',
    icon: Pill,
    title: '13. 24/7 Pharmacy',
    shortDesc: 'Authentic hospital medicine supply & dispensing.',
    fullDesc: 'Stocked with temperature-controlled pharmaceuticals, surgical consumables, pediatric formulations, and emergency emergency life support drugs 24 hours a day.',
    features: [
      '100% Authentic Controlled Medicines',
      '24/7 Dispensing Counter',
      'Surgical Consumables & Antibiotics',
    ],
    badgeText: 'Open 24/7',
  },
];

export default function FacilitiesPage() {
  return (
    <PublicLayout>
      
      {/* Breadcrumbs */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Hospital Facilities & Services' }]} />
        </Container>
      </div>

      {/* Main Facilities Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="space-y-10">
          <SectionTitle
            tagline="Standard Treatment for 25+ Years"
            title="Hospital Facilities & 13 Core Medical Services"
            subtitle="Providing trusted, high-quality healthcare treatment in Rahim Yar Khan for over 25 years. Open 24 Hours, 7 Days a Week."
            align="left"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES_DATA.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>

          <div className="pt-8 text-center bg-slate-900 text-white rounded-2xl p-8 space-y-4 shadow-lg border border-slate-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              <span>Standard Treatment for 25+ Years</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">Open 24 Hours • 7 Days a Week</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Our hospital emergency, laboratory, digital X-Ray, VIP rooms, and pharmacy operate round-the-clock at Basti Amanat Ali, Airport Road, Rahim Yar Khan.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/book-appointment"
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow transition-colors inline-flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Book Appointment Online</span>
              </Link>
              <a
                href="tel:+923006708300"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <PhoneCall className="h-4 w-4 text-teal-400" />
                <span>Call Helpline: +92 300 6708300</span>
              </a>
            </div>
          </div>

        </Container>
      </section>

    </PublicLayout>
  );
}
