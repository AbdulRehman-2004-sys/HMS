import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { ShieldCheck, Lock, FileText, Cookie, Server, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Patient Privacy Policy & Data Protection | LALA Medical Complex Rahim Yar Khan',
  description:
    'Read LALA Medical Complex policy on patient data privacy, Electronic Medical Records (EMR) security, HIPAA-standard medical confidentiality, cookies, and data retention.',
  openGraph: {
    title: 'Patient Privacy Policy & Confidentiality | LALA Medical Complex',
    description:
      'Official LALA Medical Complex policy governing patient medical record privacy, data safety, and health confidentiality.',
    url: 'https://lalamedical.com/privacy-policy',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      {/* 1. Breadcrumbs Header */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        </Container>
      </div>

      {/* 2. Main Privacy Policy Document */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="max-w-4xl space-y-10">
          <SectionTitle
            tagline="Confidentiality & Compliance"
            title="Patient Privacy Policy & Data Safeguards"
            subtitle="LALA Medical Complex is committed to preserving the privacy, confidentiality, and security of patient health information and digital interactions."
            align="left"
          />

          <div className="space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
            
            {/* Section 1: Information We Collect */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileText className="h-5 w-5 text-teal-600" />
                <span>1. Information We Collect</span>
              </h3>
              <p className="text-slate-600">
                When you visit LALA Medical Complex, register at reception, or book an appointment online, we collect demographic and clinical details necessary to deliver medical care. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700 font-medium">
                <li>Patient Identification: Full Name, CNIC / B-Form Number, Medical Record Number (MRN).</li>
                <li>Contact Details: Mobile Phone Number, Emergency Contact, Physical Residential Address.</li>
                <li>Clinical Data: Medical history, nursing vitals, clinical diagnostic orders, prescription details, laboratory parameters, and radiology scans.</li>
                <li>Online Booking Details: Selected doctor specialty, preferred appointment date, and status.</li>
              </ul>
            </div>

            {/* Section 2: How We Use Information */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-2">
                <ShieldCheck className="h-5 w-5 text-teal-600" />
                <span>2. How We Use Information</span>
              </h3>
              <p className="text-slate-600">
                We strictly process patient information to fulfill healthcare services, ensure clinical patient safety, and manage hospital operations. Uses include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700 font-medium">
                <li>Providing clinical diagnosis, treatment planning, surgical care, and issuing electronic prescriptions.</li>
                <li>Processing diagnostic laboratory tests, radiology reports, and inpatient ward admission records.</li>
                <li>Generating financial invoices, processing billing charges, and printing official cashier receipts.</li>
                <li>Notifying patients regarding appointment tokens, laboratory result readiness, or follow-up dates.</li>
              </ul>
            </div>

            {/* Section 3: Data Protection & EMR Security */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-2">
                <Lock className="h-5 w-5 text-teal-600" />
                <span>3. Data Protection & EMR Security</span>
              </h3>
              <p className="text-slate-600">
                All electronic medical records (EMR) are stored within encrypted core databases protected by strict Role-Based Access Control (RBAC). Only authorized hospital staff (Doctors, Receptionists, Laboratory Technicians, Radiologists, and Super Admins) can access records matching their explicit clinical permissions.
              </p>
              <p className="text-slate-600">
                All data transmission between web browsers and our hospital system is encrypted using TLS protocol standards.
              </p>
            </div>

            {/* Section 4: Cookies & Local Storage */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-2">
                <Cookie className="h-5 w-5 text-teal-600" />
                <span>4. Cookies & Local Storage</span>
              </h3>
              <p className="text-slate-600">
                Our public website and intranet application use essential session cookies and browser storage strictly to maintain secure staff authentication logins, user access tokens, and website preferences. We do not use tracking cookies for third-party advertising network profiling.
              </p>
            </div>

            {/* Section 5: Third-Party Services */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-200 pb-2">
                <Server className="h-5 w-5 text-teal-600" />
                <span>5. Third-Party Services</span>
              </h3>
              <p className="text-slate-600">
                We do not sell, rent, or trade patient medical records or personal details to commercial third parties. Disclosure of health records is restricted strictly to legal directives issued by government healthcare regulatory authorities or authorized court orders.
              </p>
            </div>

            {/* Section 6: Contact Information */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-md">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
                <Mail className="h-5 w-5 text-teal-400" />
                <span>6. Patient Rights & Privacy Contacts</span>
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm">
                Patients have the right to request physical copies of their medical history timeline, prescription summaries, and diagnostic reports by visiting our Medical Records Office with valid CNIC identification.
              </p>

              <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-400 shrink-0" />
                  <span className="font-mono text-white">+92 300 6708300</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>info@lalamedical.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>Main Stadium Road, Rahim Yar Khan</span>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
