import React from 'react';
import { Metadata } from 'next';
import { PublicLayout } from '../components/public/PublicLayout';
import { HeroSection } from '../components/public/home/HeroSection';
import { AboutPreview } from '../components/public/home/AboutPreview';
import { DepartmentsPreview } from '../components/public/home/DepartmentsPreview';
import { DoctorsPreview } from '../components/public/home/DoctorsPreview';
import { WhyChooseUs } from '../components/public/home/WhyChooseUs';
import { EmergencyBanner } from '../components/public/home/EmergencyBanner';
import { CtaBanner } from '../components/public/home/CtaBanner';

export const metadata: Metadata = {
  title: 'LALA Medical Complex | Tertiary Care Hospital & Pediatric Surgery Center',
  description: 'LALA Medical Complex provides advanced pediatric surgery, maternal care, 24/7 ICU & emergency trauma care, computerized pathology labs, and digital PACS radiology imaging in Sargodha.',
  openGraph: {
    title: 'LALA Medical Complex | Tertiary Care Hospital',
    description: 'Advanced medical care, 24/7 emergency response, expert pediatric surgeons, and digital diagnostic imaging.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <AboutPreview />
      <DepartmentsPreview />
      <DoctorsPreview />
      <WhyChooseUs />
      <EmergencyBanner />
      <CtaBanner />
    </PublicLayout>
  );
}
