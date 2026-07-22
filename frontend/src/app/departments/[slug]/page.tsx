'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PublicLayout } from '../../../components/public/PublicLayout';
import { Container } from '../../../components/ui/Container';
import { Breadcrumbs } from '../../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { getPublicDepartmentBySlugApi, PublicDepartment } from '../../../lib/public-doctors';
import {
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Award,
  Stethoscope,
  Calendar,
  PhoneCall,
} from 'lucide-react';

export default function DepartmentDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [department, setDepartment] = useState<PublicDepartment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    getPublicDepartmentBySlugApi(slug)
      .then((data) => {
        setDepartment(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || `Department '${slug}' not found`);
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
              { label: 'Departments', href: '/departments' },
              { label: department ? department.name : 'Department Details' },
            ]}
          />
        </Container>
      </div>

      {/* Main Section */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner label="Loading department details from HMS API..." />
            </div>
          ) : error || !department ? (
            <EmptyState
              icon={<Building2 className="h-6 w-6" />}
              title="Department Not Found"
              description={`We could not find any active clinical department matching '${slug}'.`}
              actionLabel="Back to Departments"
              onAction={() => window.location.href = '/departments'}
            />
          ) : (
            <div className="space-y-12">
              
              {/* Department Header Banner */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="space-y-4 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                    <Building2 className="h-4 w-4 text-teal-400" />
                    <span>Clinical Specialty Division</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    {department.name} Department
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {department.fullDescription}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-teal-600 text-white font-mono font-bold text-xs rounded-md">
                      {department.doctorCount} Active Consultant Physicians & Surgeons
                    </span>
                  </div>
                </div>
              </div>

              {/* Department Services Grid */}
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" />
                  <span>Clinical Services & Diagnostic Capabilities</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {department.services.map((service, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-2 text-xs font-bold text-slate-800"
                    >
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Department Doctors List (HMS Dynamic Integration) */}
              <div className="space-y-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-teal-600" />
                      <span>Medical Faculty in {department.name}</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-normal">
                      Consultants dynamically loaded from the HMS database.
                    </p>
                  </div>

                  <Link
                    href="/doctors"
                    className="text-xs text-teal-600 hover:text-teal-700 font-bold inline-flex items-center gap-1"
                  >
                    <span>View All Hospital Doctors</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {department.doctors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {department.doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
                      >
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-900 border border-teal-600 shrink-0">
                          {doc.photoUrl ? (
                            <Image
                              src={doc.photoUrl}
                              alt={doc.fullName}
                              fill
                              sizes="64px"
                              className="object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-teal-400 font-bold text-lg">
                              {doc.fullName.slice(0, 2)}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {doc.fullName}
                          </h3>
                          <p className="text-xs text-slate-600 font-semibold line-clamp-1">
                            {doc.specialization}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono line-clamp-1">
                            {doc.qualification}
                          </p>

                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {doc.experience}+ Yrs Exp
                            </span>

                            <Link
                              href={`/doctors/${doc.slug}`}
                              className="text-xs font-bold text-slate-900 hover:text-teal-600 inline-flex items-center gap-1"
                            >
                              <span>Profile</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 font-medium">
                    No individual doctors currently listed in this department directory.
                  </div>
                )}
              </div>

            </div>
          )}
        </Container>
      </section>

    </PublicLayout>
  );
}
