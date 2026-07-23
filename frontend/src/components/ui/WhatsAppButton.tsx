'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '+923006708300',
  message = 'Hello Lala Medical Complex, I would like to inquire about hospital services and doctor appointments.',
}) => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Floating Tooltip Pill */}
      <span className="hidden sm:inline-block mr-3 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-bold rounded-lg shadow-md backdrop-blur border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Chat on WhatsApp 💬
      </span>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Lala Medical Complex on WhatsApp"
        className="relative flex items-center justify-center h-13 w-13 sm:h-14 sm:w-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/40 focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
      >
        {/* Pulsing Ripple Effect */}
        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30 pointer-events-none"></span>

        {/* WhatsApp Icon */}
        <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8 fill-current stroke-1 text-white shrink-0" />
      </a>
    </div>
  );
};
