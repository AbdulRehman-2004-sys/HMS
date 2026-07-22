'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2, Tag, Calendar, Users, Building2 } from 'lucide-react';

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  category: 'ALL' | 'BUILDING' | 'STAFF' | 'EVENTS' | 'FACILITIES' | 'SURGERY' | 'WARDS';
  categoryLabel: string;
  description: string;
}

const GALLERY_PHOTOS: GalleryItem[] = [
  {
    id: 'g-0',
    src: '/images/CEO.webp',
    title: 'Prof. Dr. M Zafar Iqbal — Chief Executive Officer (CEO)',
    category: 'STAFF',
    categoryLabel: 'Doctors & Staff',
    description: 'Prof. Dr. M Zafar Iqbal (Pediatric Surgeon & CEO) leading LALA Medical Complex clinical operations.',
  },
  {
    id: 'g-1',
    src: '/images/staff.jpeg',
    title: 'Senior Medical Faculty & Hospital Staff Team',
    category: 'STAFF',
    categoryLabel: 'Doctors & Staff',
    description: 'Prof. Dr. M Zafar Iqbal, Dr. Shumaila Irum, and our senior clinical consultants and nursing team.',
  },
  {
    id: 'g-2',
    src: '/images/CPSP visit 2025.webp',
    title: 'CPSP Inspection & Accreditation Visit 2025',
    category: 'EVENTS',
    categoryLabel: 'Events & Inspection',
    description: 'Official College of Physicians and Surgeons Pakistan (CPSP) inspection visit at LALA Medical Complex in 2025.',
  },
  {
    id: 'g-3',
    src: '/images/WhatsApp Image 2026-07-20 at 4.31.53 AM.jpeg',
    title: 'Main Hospital Building & Entrance Complex',
    category: 'BUILDING',
    categoryLabel: 'Hospital Building',
    description: 'Exterior view of the multi-story hospital complex on Main Airport Road.',
  },
  {
    id: 'g-4',
    src: '/images/WhatsApp Image 2026-07-20 at 4.31.54 AM.jpeg',
    title: 'Main Reception & Patient Registration Desk',
    category: 'FACILITIES',
    categoryLabel: 'Facilities',
    description: 'Computerized patient check-in reception, token queue, and cash counter.',
  },
  {
    id: 'g-5',
    src: '/images/WhatsApp Image 2026-07-20 at 4.31.58 AM.jpeg',
    title: 'Outpatient Waiting Lounge',
    category: 'FACILITIES',
    categoryLabel: 'Facilities',
    description: 'Air-conditioned patient waiting hall for OPD consultations.',
  },
  {
    id: 'g-6',
    src: '/images/WhatsApp Image 2026-07-20 at 4.31.58 AM (1).jpeg',
    title: 'Inpatient Private Ward Rooms',
    category: 'WARDS',
    categoryLabel: 'Inpatient Wards',
    description: 'Modern private inpatient rooms with attached washrooms and patient monitoring beds.',
  },
  {
    id: 'g-7',
    src: '/images/WhatsApp Image 2026-07-20 at 4.31.59 AM.jpeg',
    title: 'Main Operation Theatre Suite',
    category: 'SURGERY',
    categoryLabel: 'Operation Theatre',
    description: 'Fully equipped sterile surgical suite for laparoscopic and major pediatric surgeries.',
  },
  {
    id: 'g-8',
    src: '/images/WhatsApp Image 2026-07-20 at 4.32.00 AM.jpeg',
    title: 'Advanced Surgical Lighting & Anesthesia Suite',
    category: 'SURGERY',
    categoryLabel: 'Operation Theatre',
    description: 'Shadowless operating lights, general anesthesia workstations, and vital monitors.',
  },
  {
    id: 'g-9',
    src: '/images/WhatsApp Image 2026-07-20 at 4.32.02 AM.jpeg',
    title: 'Pathology & Diagnostic Testing Laboratory',
    category: 'FACILITIES',
    categoryLabel: 'Facilities',
    description: 'Automated blood chemistry, hematology analyzers, and microbiology testing bay.',
  },
  {
    id: 'g-10',
    src: '/images/WhatsApp Image 2026-07-20 at 4.32.03 AM.jpeg',
    title: 'Digital PACS Radiology & Ultrasound Suite',
    category: 'FACILITIES',
    categoryLabel: 'Facilities',
    description: 'Color Doppler ultrasound imaging and digital X-Ray PACS diagnostic room.',
  },
  {
    id: 'g-11',
    src: '/images/WhatsApp Image 2026-07-20 at 4.32.05 AM.jpeg',
    title: '24/7 Emergency & Triage Bay',
    category: 'FACILITIES',
    categoryLabel: 'Facilities',
    description: 'Round-the-clock emergency trauma response and resuscitation beds.',
  },
  {
    id: 'g-12',
    src: '/images/WhatsApp Image 2026-07-20 at 4.32.08 AM.jpeg',
    title: 'Neonatal ICU (NICU) & Infant Incubator Bay',
    category: 'WARDS',
    categoryLabel: 'Inpatient Wards',
    description: 'Specialized neonatal intensive care incubators and phototherapy units.',
  },
  {
    id: 'g-13',
    src: '/images/WhatsApp Image 2026-07-20 at 4.32.08 AM (1).jpeg',
    title: 'Hospital Campus & Parking Area',
    category: 'BUILDING',
    categoryLabel: 'Hospital Building',
    description: 'Convenient patient parking and accessible main hospital entrance.',
  },
];

export const GalleryGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Photos' },
    { id: 'BUILDING', label: 'Hospital Building' },
    { id: 'STAFF', label: 'Doctors & Medical Staff' },
    { id: 'EVENTS', label: 'Events & CPSP Visit' },
    { id: 'FACILITIES', label: 'Facilities & Diagnostics' },
    { id: 'SURGERY', label: 'Operation Theatres' },
    { id: 'WARDS', label: 'Inpatient Wards & NICU' },
  ];

  const filteredPhotos = activeTab === 'ALL'
    ? GALLERY_PHOTOS
    : GALLERY_PHOTOS.filter((p) => p.category === activeTab);

  const handlePrev = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev! > 0 ? prev! - 1 : filteredPhotos.length - 1
    );
  };

  const handleNext = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev! < filteredPhotos.length - 1 ? prev! + 1 : 0
    );
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-teal-700'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 2. Photo Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhotoIndex(index)}
            className="group relative bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-slate-200 flex flex-col justify-end min-h-[260px]"
          >
            {/* Image Background */}
            <Image
              src={photo.src}
              alt={photo.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
            />

            {/* Ambient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>

            {/* Hover Expand Icon */}
            <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="h-4 w-4" />
            </div>

            {/* Caption Overlay Content */}
            <div className="relative z-10 p-4 space-y-1">
              <span className="inline-block px-2 py-0.5 bg-teal-600 text-white text-[10px] font-extrabold uppercase rounded font-mono">
                {photo.categoryLabel}
              </span>
              <h3 className="text-sm font-bold text-white leading-snug drop-shadow-sm">
                {photo.title}
              </h3>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {photo.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Full-Screen Lightbox Modal */}
      {selectedPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 no-print">
          
          {/* Close Button */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-50 transition-colors"
            aria-label="Close Lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-50 transition-colors"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-50 transition-colors"
            aria-label="Next Photo"
          >
            <ChevronRight className="h-7 w-7" />
          </button>

          {/* Modal Active Photo Content */}
          <div className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="relative w-full h-[50vh] sm:h-[65vh] bg-black">
              <Image
                src={filteredPhotos[selectedPhotoIndex].src}
                alt={filteredPhotos[selectedPhotoIndex].title}
                fill
                className="object-contain"
              />
            </div>

            <div className="p-5 bg-slate-900 border-t border-slate-800 text-white space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold uppercase rounded">
                  {filteredPhotos[selectedPhotoIndex].categoryLabel}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedPhotoIndex + 1} of {filteredPhotos.length}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {filteredPhotos[selectedPhotoIndex].title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {filteredPhotos[selectedPhotoIndex].description}
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
