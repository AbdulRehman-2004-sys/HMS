import React from 'react';
import { Metadata } from 'next';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Patient Privacy Policy & Confidentiality | LALA Medical Complex',
  description: 'Read LALA Medical Complex policy on patient data privacy, Electronic Medical Records (EMR) security, and HIPAA-standard medical confidentiality.',
};

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
        </Container>
      </div>

      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="max-w-4xl space-y-8">
          <SectionTitle
            tagline="Data Protection"
            title="Patient Privacy Policy & Confidentiality"
            subtitle="LALA Medical Complex is committed to preserving the privacy, confidentiality, and security of patient health information."
            align="left"
          />

          <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-teal-600" />
                <span>1. Electronic Medical Record (EMR) Protection</span>
              </h3>
              <p className="text-slate-600">
                All patient health histories, diagnostic laboratory reports, radiology scans, and billing receipts are stored within our secure Electronic Medical Records (EMR) core system. Access is strictly controlled via Role-Based Access Control (RBAC) restricted to authorized medical personnel.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>2. Medical Confidentiality</span>
              </h3>
              <p className="text-slate-600">
                Medical information is never disclosed, shared, or transferred to unauthorized third parties without explicit consent from the patient or legal guardian, except as strictly required by healthcare regulatory bodies or law enforcement directives.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-600" />
                <span>3. Patient Rights</span>
              </h3>
              <p className="text-slate-600">
                Patients have the right to request physical copies of their medical history, laboratory parameters, and radiology reports at any time by visiting our medical records office with valid government identification (CNIC / MRN).
              </p>
            </div>
          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
