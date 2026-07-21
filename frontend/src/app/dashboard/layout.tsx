'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api, setAccessToken, getAccessToken, getRefreshToken } from '../../lib/api-client';
import { Permission } from '../../lib/permissions';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FlaskConical,
  FileText,
  CreditCard,
  LogOut,
  Menu,
  X,
  User,
  Activity,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard, permission: null },
  { name: 'User Management', href: '/dashboard/users', icon: ShieldCheck, permission: Permission.MANAGE_SYSTEM },
  { name: 'Doctor Management', href: '/dashboard/doctors', icon: Stethoscope, permission: Permission.ACCESS_RECEPTION },
  { name: 'Patient Registration', href: '/dashboard/patients', icon: Users, permission: Permission.ACCESS_RECEPTION },
  { name: 'Clinical EHR', href: '/dashboard/clinical', icon: UserCheck, permission: Permission.ACCESS_CLINICAL },
  { name: 'Laboratory', href: '/dashboard/lab', icon: FlaskConical, permission: Permission.ACCESS_LAB },

  { name: 'Radiology PACS', href: '/dashboard/radiology', icon: FileText, permission: Permission.ACCESS_RADIOLOGY },
  { name: 'Billing & Cashier', href: '/dashboard/billing', icon: CreditCard, permission: Permission.ACCESS_BILLING },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ firstName: string; lastName: string; roles: string[]; email: string; permissions: string[] } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const savedUser = localStorage.getItem('hms_user');
      if (!savedUser) {
        router.push('/login');
        return;
      }

      // Bootstrap token if empty in cache
      if (!getAccessToken()) {
        try {
          const token = await getRefreshToken();
          if (token) {
            setAccessToken(token);
            // Fetch live profile to sync permissions
            const profileRes = await api.get('/auth/me');
            const freshUser = profileRes.data?.data?.user;
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('hms_user', JSON.stringify(freshUser));
            } else {
              setUser(JSON.parse(savedUser));
            }
          } else {
            throw new Error('Refresh failed');
          }
        } catch (err) {
          setAccessToken(null);
          localStorage.removeItem('hms_user');
          router.push('/login?expired=true');
          return;
        }
      } else {
        setUser(JSON.parse(savedUser));
      }
      setAuthChecking(false);
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      localStorage.removeItem('hms_user');
      router.push('/login');
    }
  };

  const visibleNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    if (!user) return false;
    return user.permissions?.includes(item.permission);
  });

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-8 w-8 animate-pulse text-teal-600" />
          <span className="text-sm font-semibold text-slate-500">Securing Session Terminal...</span>
        </div>
      </div>
    );
  }

  const primaryRole = user?.roles?.[0] || 'Clinical Staff';

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 h-screen sticky top-0 bg-slate-900 border-r border-slate-800 text-slate-400">
        {/* Branding header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
          <Activity className="h-5 w-5 text-teal-500" />
          <span className="font-bold text-white tracking-wide text-sm">LALA Medical Complex</span>
        </div>
        
        {/* Navigation Area */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {visibleNavItems.map((item, index) => {
            const Icon = item.icon;
            const isCurrent = item.href === pathname;

            return (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                  isCurrent 
                    ? 'bg-teal-600 text-white font-bold' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4.5 w-4.5 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer logout info */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-teal-400 border border-slate-700">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : <User className="h-4 w-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Clinical Staff'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{primaryRole}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 mt-1 text-xs font-semibold text-red-400 hover:text-red-300 bg-slate-800/40 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout Terminal</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Nav Header */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <header className="sticky top-0 z-10 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shadow-sm no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-md"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              Terminal Node: <span className="font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase text-xs">{primaryRole}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800">
                {user ? `${user.firstName} ${user.lastName}` : 'Terminal'}
              </span>
              <span className="text-[10px] text-slate-400">{user?.email}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-700 border border-slate-200">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : <User className="h-4 w-4" />}
            </div>
          </div>
        </header>

        {/* 3. Mobile Navigation Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-sm">
            <div className="relative flex flex-col w-full max-w-xs bg-slate-900 text-slate-400 shadow-xl">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2">
                <Activity className="h-5 w-5 text-teal-500" />
                <span className="font-bold text-white tracking-wide text-sm">LALA HMS</span>
              </div>

              <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
                {visibleNavItems.map((item, index) => {
                  const Icon = item.icon;
                  const isCurrent = item.href === pathname;

                  return (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                        isCurrent 
                          ? 'bg-teal-600 text-white font-bold' 
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4.5 w-4.5 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
                <p className="text-xs font-semibold text-white text-center">
                  {user ? `${user.firstName} ${user.lastName}` : ''}
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-red-400 hover:text-red-300 bg-slate-800/40 rounded-md"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout Terminal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Core Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
