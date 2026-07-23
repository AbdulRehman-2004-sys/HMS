'use client';

import React from 'react';
import { PhoneCall, Siren, Building } from 'lucide-react';

export interface EmergencyContact {
  title: string;
  number: string;
  description: string;
  badge?: string;
  icon: 'emergency' | 'ambulance' | 'reception';
}

const defaultContacts: EmergencyContact[] = [
  {
    title: 'Hospital Emergency Helpline',
    number: '+92 300 6708300',
    description: '24/7 immediate trauma, resuscitation & casualty desk',
    badge: '24/7 Available',
    icon: 'emergency',
  },
  {
    title: 'Ambulance & Dispatch',
    number: '+92 300 7654321',
    description: 'Rapid cardiac & pediatric intensive care transport unit',
    badge: 'Immediate Response',
    icon: 'ambulance',
  },
  {
    title: 'Hospital Reception Desk',
    number: '+92 48 3721000',
    description: 'General inquiries, OPD appointments & room bookings',
    badge: '08:00 AM - 08:00 PM',
    icon: 'reception',
  },
];

export const EmergencyNumbers: React.FC = () => {
  return (
    <div className="bg-red-950/10 border border-red-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200/60 pb-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 bg-red-600 text-white text-[11px] font-extrabold uppercase tracking-widest rounded-md mb-1">
            Urgent Care
          </span>
          <h3 className="text-xl font-extrabold text-red-950">
            Emergency & Direct Contact Hotlines
          </h3>
        </div>
        <p className="text-xs text-red-700 max-w-sm">
          Tap any phone number below to directly connect from your mobile device.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {defaultContacts.map((contact, index) => {
          const rawTel = contact.number.replace(/\s+/g, '');
          return (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
                    {contact.icon === 'emergency' && <PhoneCall className="h-5 w-5" />}
                    {contact.icon === 'ambulance' && <Siren className="h-5 w-5" />}
                    {contact.icon === 'reception' && <Building className="h-5 w-5" />}
                  </div>
                  {contact.badge && (
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      {contact.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-slate-900 text-sm">{contact.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{contact.description}</p>
              </div>

              <a
                href={`tel:${rawTel}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors text-center"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call {contact.number}</span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
