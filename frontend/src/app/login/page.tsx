'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAccessToken } from '../../lib/api-client';
import { Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation Check
    if (!email || !password) {
      setError('Please fill in all required credentials');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, user } = response.data.data;
      
      // Cache the access token in client memory
      setAccessToken(accessToken);
      localStorage.setItem('hms_user', JSON.stringify(user));
      
      // Push to dashboard landing
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 
        'Connection error: Unable to reach the security gateway server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Hospital Branding Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
            <Shield className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            LALA Medical Complex
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Hospital Management Core Gateway
          </p>
        </div>

        {/* Credentials Card */}
        <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-medium text-slate-800">
              Sign In
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your clinical credentials to access your terminal
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-55 border border-red-200 text-red-600 rounded-md font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-500">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@lalamedical.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-500">
                Security Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder-slate-400 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center h-10 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-55"
              >
                {loading ? 'Verifying Terminal Access...' : 'Authenticate'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice Footer */}
        <p className="text-center text-xs text-slate-400">
          Authorized personnel only. Activities are audited under section 4.1.
        </p>
      </div>
    </div>
  );
}
