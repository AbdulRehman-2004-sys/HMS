'use client';

import React, { useState, useEffect } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { DepartmentCard } from '../../components/public/departments/DepartmentCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { getPublicDepartmentsApi, PublicDepartment } from '../../lib/public-doctors';
import { Building2, Search } from 'lucide-react';

export default function DepartmentsListingPage() {
  const [departments, setDepartments] = useState<PublicDepartment[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPublicDepartmentsApi()
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load hospital departments');
        setLoading(false);
      });
  }, []);

  const filteredDepartments = departments.filter((dept) =>
    search === '' ||
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    dept.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
    dept.services.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PublicLayout>
      
      {/* 1. Breadcrumbs */}
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Clinical Departments' }]} />
        </Container>
      </div>

      {/* 2. Main Departments Grid Section */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="space-y-8">
          
          <SectionTitle
            tagline="Specialized Clinical Divisions"
            title="Hospital Departments & Services"
            subtitle="Explore our multi-specialty clinical units including Pediatric Surgery, Gynecology, Orthopedics, General Surgery, Pathology, PACS Radiology, and Emergency Care."
            align="left"
          />

          {/* Search Input */}
          <div className="max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search department name or medical service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Departments Grid */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner label="Loading clinical departments from HMS..." />
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-bold">
              {error}
            </div>
          ) : filteredDepartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((dept) => (
                <DepartmentCard key={dept.id} department={dept} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Building2 className="h-6 w-6" />}
              title="No Departments Found"
              description="No clinical department matches your search criteria."
              actionLabel="Clear Search"
              onAction={() => setSearch('')}
            />
          )}

        </Container>
      </section>

    </PublicLayout>
  );
}
