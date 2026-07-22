import React from 'react';
import { Metadata } from 'next';
import { PublicLayout } from '../../components/public/PublicLayout';
import { Container } from '../../components/ui/Container';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us & Emergency Helpline | LALA Medical Complex',
  description: 'Get in touch with LALA Medical Complex in Sargodha. View emergency helpline numbers, physical address, working hours, and location.',
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-100/70 border-b border-slate-200 py-3">
        <Container>
          <Breadcrumbs items={[{ label: 'Contact Us' }]} />
        </Container>
      </div>

      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <Container className="space-y-12">
          <SectionTitle
            tagline="Get in Touch"
            title="Hospital Contact & Emergency Helpline"
            subtitle="Our emergency department and reception desk are available to assist you with patient inquiries."
            align="left"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Info Cards Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800 shadow-lg">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
                  Hospital Contact Info
                </h3>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-bold mb-0.5">Physical Location:</strong>
                      <span>Main Stadium Road, Sargodha, Punjab, Pakistan</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-bold mb-0.5">Helpline Phone:</strong>
                      <span className="font-mono text-white font-bold">+92 300 1234567</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-bold mb-0.5">Official Email:</strong>
                      <span>info@lalamedical.com</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-bold mb-0.5">Operating Hours:</strong>
                      <span className="text-teal-300 font-semibold">Emergency & ICU: Open 24/7</span>
                      <p className="text-slate-400 text-xs mt-0.5">OPD Clinics: Mon - Sat (08:00 AM - 08:00 PM)</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Inquiry Form Preview Column */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Send className="h-5 w-5 text-teal-600" />
                <span>Send Us an Inquiry Message</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="text"
                    placeholder="+92 300 0000000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Inquiry Message *</label>
                  <textarea
                    rows={4}
                    placeholder="How can our hospital help you today?"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-md shadow transition-colors flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </div>

          </div>
        </Container>
      </section>
    </PublicLayout>
  );
}
