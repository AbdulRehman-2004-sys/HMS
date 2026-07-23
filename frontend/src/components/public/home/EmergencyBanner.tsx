import React from 'react';
import { PhoneCall, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Container } from '../../ui/Container';

export const EmergencyBanner: React.FC = () => {
  return (
    <section className="bg-red-700 text-white py-8 border-y-2 border-red-800 shadow-md">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
              <PhoneCall className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-red-200 text-xs font-black uppercase tracking-wider">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>24/7 Medical Emergency & Ambulance Helpline</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Need Immediate Emergency Assistance?
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+923006708300"
              className="px-6 py-3 bg-white text-red-700 hover:bg-red-50 font-black text-sm rounded-md shadow-lg transition-colors flex items-center gap-2"
            >
              <PhoneCall className="h-4 w-4 text-red-700" />
              <span>Call +92 300 6708300</span>
            </a>
          </div>

        </div>
      </Container>
    </section>
  );
};
