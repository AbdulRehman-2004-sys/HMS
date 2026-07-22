import React from 'react';
import { Eye, Target, Heart, ShieldCheck } from 'lucide-react';

export const VisionMissionCard: React.FC = () => {
  return (
    <div className="space-y-8">
      
      {/* 1. Vision & Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Our Vision Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-teal-400 group-hover:scale-110 transition-transform">
            <Eye className="h-28 w-28" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <Eye className="h-4 w-4 text-teal-400" />
            <span>Our Vision • ہمارا نقطہ نظر</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Lighting New Ways in Healthcare
            </h3>
            <p className="text-sm sm:text-base font-semibold text-teal-300 font-serif text-right dir-rtl leading-relaxed">
              صحت کی دیکھ بھال میں نئے طریقوں کو اجاگر کرنا
            </p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
            We aspire to illuminate new paths in clinical excellence, medical technology, and patient-centered surgical outcomes across the region.
          </p>
        </div>

        {/* Our Mission Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-teal-400 group-hover:scale-110 transition-transform">
            <Target className="h-28 w-28" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider">
            <Target className="h-4 w-4 text-teal-400" />
            <span>Our Mission • ہمارا مشن</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              Working Together with our community to deliver innovative, safe and equitable healthcare
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-teal-300 font-serif text-right dir-rtl leading-relaxed">
              جدید، محفوظ اور مساوی صحت کی دیکھ بھال فراہم کرنے کے لیے اپنی کمیونٹی کے ساتھ مل کر کام کرنا
            </p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
            Committed to collaborative community health, rigorous safety standards, and equal access to specialized surgeries and diagnostics.
          </p>
        </div>

      </div>

      {/* 2. Core Values Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-teal-800/50 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">Our Core Values • ہماری اقدار</h4>
              <p className="text-xs text-slate-300">Guided by empathy, clinical rigor, and mutual respect.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <div className="flex items-center justify-between text-teal-300 font-bold text-sm">
              <span>Compassion</span>
              <span className="font-serif text-xs">ہمدردی</span>
            </div>
            <p className="text-[11px] text-slate-400">Treating every patient with warmth, kindness, and personal dignity.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <div className="flex items-center justify-between text-teal-300 font-bold text-sm">
              <span>Professionalism</span>
              <span className="font-serif text-xs">پیشہ ورانہ مہارت</span>
            </div>
            <p className="text-[11px] text-slate-400">Adhering strictly to international medical standards and evidence-based practice.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1">
            <div className="flex items-center justify-between text-teal-300 font-bold text-sm">
              <span>Respect</span>
              <span className="font-serif text-xs">احترام</span>
            </div>
            <p className="text-[11px] text-slate-400">Honoring patient privacy, diversity, and community trust in every interaction.</p>
          </div>

        </div>
      </div>

    </div>
  );
};
