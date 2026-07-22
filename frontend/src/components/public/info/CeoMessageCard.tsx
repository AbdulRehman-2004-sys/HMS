import React from 'react';
import Image from 'next/image';
import { Quote, Award, CheckCircle2, ShieldCheck } from 'lucide-react';

export const CeoMessageCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Photo & Credentials */}
        <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-4 border-teal-600 shadow-xl bg-slate-900 group">
            <Image
              src="/images/CEO.webp"
              alt="Prof. Dr. Zafar Iqbal CEO"
              fill
              sizes="(max-width: 640px) 192px, 224px"
              className="object-cover object-top hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              Prof. Dr. Zafar Iqbal
            </h3>
            <p className="text-xs font-black text-teal-600 uppercase tracking-wider">
              Pediatric Surgeon / CEO
            </p>
            <p className="text-[11px] font-mono text-slate-500">
              MBBS, FCPS, MME • PMDC Reg #: 33791-P
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200 text-[11px] font-bold">
            <Award className="h-3.5 w-3.5 text-teal-600" />
            <span>20+ Years Clinical Leadership</span>
          </div>
        </div>

        {/* Right Welcome Address */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 text-teal-600">
            <Quote className="h-8 w-8 opacity-40 rotate-180" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700">
              Message From the Chief Executive Officer
            </span>
          </div>

          <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            "Welcome to LALA Medical Complex — Where Patient Care & Surgical Precision Come First."
          </h4>

          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            <p>
              Dear Patients and Honored Community Members,
            </p>
            <p>
              It gives me immense pride to welcome you to LALA Medical Complex. When we established this hospital, our vision was simple yet profound: to create a medical center where no family has to compromise on clinical quality, surgical safety, or compassionate care.
            </p>
            <p>
              Over the years, we have specialized in pediatric surgery, maternal health, and emergency trauma response. By integrating fully computerized Electronic Medical Records (EMR), automated pathology laboratories, and high-definition digital PACS radiology imaging, we ensure that every patient receives accurate, swift, and transparent medical attention.
            </p>
            <p>
              Our dedicated medical consultants, nursing staff, and technicians work tirelessly around the clock to uphold our motto: <em>Lighting New Ways in Healthcare</em>.
            </p>
          </div>

          {/* Signature Block */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-serif italic text-base font-bold text-slate-800 block">
                Prof. Dr. M Zafar Iqbal
              </span>
              <span className="text-[11px] text-slate-500 font-semibold block">
                Pediatric Surgeon / Chief Executive Officer
              </span>
            </div>

            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 text-xs font-bold shrink-0">
              <ShieldCheck className="h-4 w-4" />
              <span>Certified Healthcare Quality</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
