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
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hospital Facilities & Services | LALA Medical Complex',
  description: 'Explore 24/7 Emergency trauma bay, IPD private wards, major surgical operating suites, pathology labs, PACS radiology imaging, ICU/NICU, and ambulance services at LALA Medical Complex.',
  openGraph: {
    title: 'Clinical Facilities | LALA Medical Complex',
    description: '24/7 Emergency, Operation Theatres, Intensive Care Units, Pathology Lab & Digital PACS Radiology.',
    type: 'website',
  },
};

const FACILITIES_DATA: FacilityItem[] = [
  {
    id: 'f-1',
    icon: PhoneCall,
    title: '24/7 Emergency Care & Triage',
    shortDesc: 'Round-the-clock emergency trauma response & resuscitation beds.',
    fullDesc: 'Equipped with immediate resuscitation equipment, emergency surgery prep, and dedicated medical officers ready 24 hours a day, 7 days a week.',
    features: [
      '24/7 Emergency Medical Officers on Duty',
      'Trauma Resuscitation & Oxygen Lines',
      'Immediate Emergency Lab & Radiology Access',
    ],
    badgeText: 'Open 24/7',
  },
  {
    id: 'f-2',
    icon: Stethoscope,
    title: 'Outpatient Department (OPD Clinics)',
    shortDesc: 'Multi-specialty doctor consultation clinics.',
    fullDesc: 'Air-conditioned consultation chambers for senior professors, pediatric surgeons, gynecologists, orthopedic surgeons, and cardiologists.',
    features: [
      'Multi-Specialty Specialist OPD Clinics',
      'Computerized Token & Queue System',
      'Integrated Digital Prescription (e-Rx)',
    ],
  },
  {
    id: 'f-3',
    icon: Bed,
    title: 'Inpatient Wards & Private Rooms (IPD)',
    shortDesc: 'Comfortable inpatient private rooms & general care wards.',
    fullDesc: 'Equipped with patient monitoring beds, attached washrooms, dedicated nursing care, and round-the-clock doctor visits.',
    features: [
      'Private Executive Rooms & Wards',
      '24/7 Inpatient Nursing & Doctor Care',
      'Daily Vital Signs & Medication Rounds',
    ],
  },
  {
    id: 'f-4',
    icon: Scissors,
    title: 'Sterile Operation Theatre Suites (OT)',
    shortDesc: 'Advanced major & minor surgical operating suites.',
    fullDesc: 'Equipped with shadowless operating lights, laparoscopic surgical towers, general anesthesia workstations, and sterile airflow.',
    features: [
      'Laparoscopic Minimal Access Surgery',
      'Neonatal & Pediatric Surgery Readiness',
      'Autoclave & Sterilization Monitoring',
    ],
    badgeText: 'Surgical OT',
  },
  {
    id: 'f-5',
    icon: FlaskConical,
    title: 'Pathology & Diagnostic Laboratory',
    shortDesc: 'Automated 24/7 pathology laboratory testing.',
    fullDesc: 'Computerized analyzer systems for Hematology (CBC), Biochemistry (LFT/RFT), Urine RE, Blood Sugar, and Serology testing with fast turnaround times.',
    features: [
      '24/7 Automated Blood & Chemistry Testing',
      'Strict Quality Control & Standard Reference Ranges',
      'Electronic Lab Report Delivery to EMR',
    ],
  },
  {
    id: 'f-6',
    icon: FileText,
    title: 'Digital Radiology & PACS Imaging',
    shortDesc: 'High-definition Digital X-Ray & Ultrasound PACS.',
    fullDesc: 'Features digital X-Ray (PA/AP views), High-Frequency Color Doppler Ultrasound, and CT Scan imaging linked directly to doctor workstations.',
    features: [
      'High-Resolution Digital X-Ray',
      'Abdominal & Obstetric Color Doppler Ultrasound',
      'Instant PACS Image Archiving & Viewing',
    ],
  },
  {
    id: 'f-7',
    icon: Activity,
    title: 'Intensive Care Unit (ICU & Neonatal NICU)',
    shortDesc: 'Specialized intensive care & infant incubator bay.',
    fullDesc: 'High-dependency care unit equipped with cardiac monitors, oxygen delivery systems, and specialized incubators for newborn infants.',
    features: [
      'Neonatal Incubators & Phototherapy Units',
      'Continuous Multi-Para Cardiac Monitors',
      'Specialized ICU Nursing Ratio',
    ],
    badgeText: 'Critical Care',
  },
  {
    id: 'f-8',
    icon: Truck,
    title: 'Emergency Ambulance Service',
    shortDesc: 'Rapid patient transport & emergency transfer ambulance.',
    fullDesc: 'Available 24/7 for patient transfer, emergency home response, and inter-hospital transport equipped with basic life support gear.',
    features: [
      '24/7 Dispatch Hotline',
      'Oxygen & First Aid Life Support Onboard',
      'Rapid Response Urban & Highway Transport',
    ],
    badgeText: '24/7 Transport',
  },
  {
    id: 'f-9',
    icon: Pill,
    title: 'In-House Hospital Pharmacy',
    shortDesc: 'Authentic hospital medicine supply & dispensing counter.',
    fullDesc: 'Stocked with temperature-controlled pharmaceuticals, surgical consumables, antibiotics, and pediatric medication formulations.',
    features: [
      '100% Authentic Controlled Pharmaceuticals',
      'Direct Prescription Dispensing',
      'Inpatient Surgical Consumables Supply',
    ],
  },
];

export default function FacilitiesPage() {
  return (
    <PublicLayout>
      
      {/* Breadcrumbs */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Hospital Facilities' }]} />
        </Container>
      </div>

      {/* Main Facilities Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="space-y-10">
          <SectionTitle
            tagline="Clinical Infrastructure"
            title="Hospital Facilities & Diagnostic Services"
            subtitle="Designed for patient safety, rapid emergency care, advanced surgical precision, and accurate diagnostic testing."
            align="left"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES_DATA.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>

          <div className="pt-8 text-center bg-slate-900 text-white rounded-2xl p-8 space-y-4 shadow-lg">
            <h3 className="text-xl font-bold">Need More Information About Our Facilities?</h3>
            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
              Our patient helpdesk is available 24/7 to answer questions regarding ward availability, diagnostic lab operating hours, or surgical bookings.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/book-appointment"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-md shadow transition-colors inline-flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Book OPD Consultation</span>
              </Link>
              <a
                href="tel:+923001234567"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-md transition-colors inline-flex items-center gap-2"
              >
                <PhoneCall className="h-4 w-4 text-teal-400" />
                <span>Call Helpline: +92 300 1234567</span>
              </a>
            </div>
          </div>

        </Container>
      </section>

    </PublicLayout>
  );
}
