import React from 'react';
import { Metadata } from 'next';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { GalleryGrid } from '../../components/public/info/GalleryGrid';

export const metadata: Metadata = {
  title: 'Hospital Photo Gallery | LALA Medical Complex',
  description: 'Explore high-resolution photographs of LALA Medical Complex, including operating theatres, diagnostic labs, inpatient wards, medical faculty, and CPSP accreditation visit.',
  openGraph: {
    title: 'Hospital Photo Gallery | LALA Medical Complex',
    description: 'Real photographs of hospital building, operating theatres, pathology lab, PACS radiology, and medical staff.',
    type: 'website',
  },
};

export default function GalleryPage() {
  return (
    <PublicLayout>
      
      {/* Breadcrumbs */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Photo Gallery' }]} />
        </Container>
      </div>

      {/* Main Gallery Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="space-y-10">
          <SectionTitle
            tagline="Visual Overview"
            title="LALA Medical Complex Photo Gallery"
            subtitle="Take a visual tour of our hospital building, operating theatre suites, diagnostic laboratories, inpatient wards, and clinical staff events."
            align="left"
          />

          <GalleryGrid />
        </Container>
      </section>

    </PublicLayout>
  );
}
