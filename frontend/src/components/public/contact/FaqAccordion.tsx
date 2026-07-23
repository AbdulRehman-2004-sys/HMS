'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface FaqAccordionProps {
  items?: FaqItem[];
}

export const defaultFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Appointments',
    question: 'How can I book an appointment?',
    answer:
      'You can book an appointment online 24/7 by clicking the "Book Appointment" button on our website navigation, selecting your desired clinical department or doctor, picking an available date, and submitting your details. You will instantly receive a confirmation token (APT-YYYYMMDD-XXXX). Alternatively, you can call our reception desk at +92 300 6708300.',
  },
  {
    id: 'faq-2',
    category: 'General',
    question: 'What are the hospital timings?',
    answer:
      'Our Emergency Department, ICU, Inpatient Wards, Laboratory, and PACS Radiology imaging operate 24 hours a day, 7 days a week. OPD Specialist Clinics operate Monday through Saturday from 08:00 AM to 08:00 PM, and Sunday on-call from 10:00 AM to 02:00 PM.',
  },
  {
    id: 'faq-3',
    category: 'Doctors',
    question: 'How do I find a doctor?',
    answer:
      'Visit our "Doctors" page from the top menu to view our full clinical faculty directory. You can filter consultants by department, medical specialty, consultation fee (e.g. Rs. 500 for APWMO, Rs. 1000 for Senior Consultants), and view their weekly OPD schedule.',
  },
  {
    id: 'faq-4',
    category: 'Location',
    question: 'Where is the hospital located?',
    answer:
      'LALA Medical Complex is located at Basti Amanat Ali, Airport Road, near Decent Bakers, Rahim Yar Khan, Punjab, Pakistan. Ample parking is available on-site, and full wheelchair accessibility is provided throughout all floors and entrance ramps.',
  },
  {
    id: 'faq-5',
    category: 'Services',
    question: 'What clinical services are available?',
    answer:
      'We offer comprehensive healthcare services including 24/7 Emergency & Trauma Care, Pediatric Surgery & Child Health, Obstetrics & Gynecology, General & Laparoscopic Surgery, Orthopedics, Pathology Laboratory (CBC, LFT, RFT, FBS), Digital PACS Radiology (X-Ray & Ultrasound), IPD Inpatient Wards, and Operating Theatres.',
  },
  {
    id: 'faq-6',
    category: 'Appointments',
    question: 'What should I bring for my appointment?',
    answer:
      'Please bring your National Identity Card (CNIC / B-Form), previous medical records, past prescriptions, recent diagnostic laboratory or radiology reports, and your online appointment reference code if you booked via our website.',
  },
];

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ items = defaultFaqs }) => {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(id);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const contentId = `faq-content-${item.id}`;
        const headerId = `faq-header-${item.id}`;

        return (
          <div
            key={item.id}
            className={`border rounded-xl transition-all ${
              isOpen
                ? 'border-teal-500 bg-white shadow-md'
                : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
            }`}
          >
            <button
              id={headerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => toggleItem(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl"
            >
              <span className="flex items-center gap-3">
                <HelpCircle
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isOpen ? 'text-teal-600' : 'text-slate-400'
                  }`}
                />
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {item.question}
                </span>
              </span>

              <div className="flex items-center gap-2 shrink-0">
                {item.category && (
                  <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                    {item.category}
                  </span>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-teal-600' : ''
                  }`}
                />
              </div>
            </button>

            {isOpen && (
              <div
                id={contentId}
                role="region"
                aria-labelledby={headerId}
                className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100"
              >
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
