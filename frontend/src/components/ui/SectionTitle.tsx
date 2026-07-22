import React from 'react';

interface SectionTitleProps {
  tagline?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
  dark?: boolean;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  tagline,
  title,
  subtitle,
  align = 'center',
  className = '',
  dark = false,
}) => {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl space-y-2 mb-10 sm:mb-12 ${alignClass} ${className}`}>
      {tagline && (
        <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
          {tagline}
        </span>
      )}
      <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-xs sm:text-sm md:text-base leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
