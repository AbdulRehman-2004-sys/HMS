'use client';

import React, { useState, useEffect } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { EmptyState } from '../../components/ui/EmptyState';
import { DoctorCard } from '../../components/public/doctors/DoctorCard';
import { DoctorSearchFilter } from '../../components/public/doctors/DoctorSearchFilter';
import { DoctorsSkeleton } from '../../components/public/doctors/DoctorsSkeleton';
import {
  getPublicDoctorsApi,
  getPublicDepartmentsApi,
  PublicDoctorProfile,
  PublicDepartment,
  DoctorQueryFilter,
} from '../../lib/public-doctors';
import { UserCheck, Search } from 'lucide-react';

export default function DoctorsListingPage() {
  const [doctors, setDoctors] = useState<PublicDoctorProfile[]>([]);
  const [departments, setDepartments] = useState<PublicDepartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<DoctorQueryFilter>({
    search: '',
    department: 'ALL',
    availability: 'ALL',
    sortBy: 'experience_desc',
  });

  // Fetch departments for filter dropdown
  useEffect(() => {
    getPublicDepartmentsApi()
      .then(setDepartments)
      .catch(() => {});
  }, []);

  // Fetch doctors whenever filters change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getPublicDoctorsApi(filters)
      .then((data) => {
        if (isMounted) {
          setDoctors(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load doctors from HMS API');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      department: 'ALL',
      availability: 'ALL',
      sortBy: 'experience_desc',
    });
  };

  const departmentOptions = departments.map((d) => ({
    slug: d.slug,
    name: d.name,
  }));

  return (
    <PublicLayout>
      
      {/* 1. Breadcrumbs */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Medical Faculty & Doctors' }]} />
        </Container>
      </div>

      {/* 2. Hero & Filter Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="space-y-8">
          
          <SectionTitle
            tagline="Hospital Medical Staff"
            title="Our Senior Consultants & Surgeons"
            subtitle="Explore our certified professors, pediatric surgeons, gynecologists, orthopedic specialists, and cardiologists. All profiles are managed live via our HMS API."
            align="left"
          />

          {/* Search & Filter Bar */}
          <DoctorSearchFilter
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            departmentOptions={departmentOptions}
          />

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
            <span>
              Showing <strong className="text-slate-900">{doctors.length}</strong> {doctors.length === 1 ? 'doctor' : 'doctors'}
            </span>
            {(filters.search || filters.department !== 'ALL' || filters.availability !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="text-teal-600 hover:underline font-bold"
              >
                Clear all active filters
              </button>
            )}
          </div>

          {/* Doctors Grid / Loading / Empty State */}
          {loading ? (
            <DoctorsSkeleton />
          ) : error ? (
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-bold">
              {error}
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="No Doctors Found"
              description="No doctor profiles matched your search or department filter criteria. Try clearing filters or searching for a different specialty."
              actionLabel="Reset Search Filters"
              onAction={handleResetFilters}
            />
          )}

        </Container>
      </section>

    </PublicLayout>
  );
}
