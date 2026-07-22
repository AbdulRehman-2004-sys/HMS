'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PublicLayout } from '../../../components/public/PublicLayout';
import { Container } from '../../../components/ui/Container';
import { Breadcrumbs } from '../../../components/ui/Breadcrumbs';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { DoctorProfile } from '../../../components/public/doctors/DoctorProfile';
import { getPublicDoctorBySlugApi, PublicDoctorProfile } from '../../../lib/public-doctors';
import { UserX } from 'lucide-react';

export default function DoctorDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [doctor, setDoctor] = useState<PublicDoctorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    getPublicDoctorBySlugApi(slug)
      .then((data) => {
        setDoctor(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || `Doctor '${slug}' not found`);
        setLoading(false);
      });
  }, [slug]);

  return (
    <PublicLayout>
      
      {/* Breadcrumbs */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Doctors', href: '/doctors' },
              { label: doctor ? doctor.fullName : 'Doctor Details' },
            ]}
          />
        </Container>
      </div>

      {/* Main Content */}
      <section className="py-10 sm:py-14 bg-white">
        <Container>
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner label="Fetching doctor profile from HMS database..." />
            </div>
          ) : error || !doctor ? (
            <EmptyState
              icon={<UserX className="h-6 w-6" />}
              title="Doctor Profile Not Found"
              description={`We could not find any active physician profile for '${slug}'.`}
              actionLabel="Back to Doctors List"
              onAction={() => window.location.href = '/doctors'}
            />
          ) : (
            <DoctorProfile doctor={doctor} />
          )}
        </Container>
      </section>

    </PublicLayout>
  );
}
