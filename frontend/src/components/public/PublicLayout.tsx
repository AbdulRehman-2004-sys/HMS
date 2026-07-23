import React from 'react';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { WhatsAppButton } from '../ui/WhatsAppButton';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-600 selection:text-white relative">
      <PublicNavbar />
      <main className="flex-1">
        {children}
      </main>
      <WhatsAppButton />
      <PublicFooter />
    </div>
  );
};
