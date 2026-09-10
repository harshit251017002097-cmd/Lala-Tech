'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('manager@lalatech.demo');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Invalid email or password.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'demo123' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Login failed.');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-indigo-600/30 mb-4 font-bold text-2xl">
            L
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Lala Tech Operations Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>PRD v2.0 Request Lifecycle Operations Platform</span>
          </p>
        </div>

        {/* 1-Click Fast Demo Logins */}
        <div className="mb-6 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Instant Demo Access (1-Click)</span>
            <span className="text-[10px] text-indigo-400 font-mono">PASS: demo123</span>
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => quickDemoLogin('manager@lalatech.demo')}
              className="flex flex-col items-start p-3 bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-500/30 rounded-xl transition group text-left"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Manager
                </span>
                <ArrowRight className="w-3 h-3 text-indigo-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-xs font-bold text-white">Priya Sharma</p>
              <p className="text-[10px] text-slate-400">All 4 Queues & Triage</p>
            </button>

            <button
              type="button"
              onClick={() => quickDemoLogin('employee@lalatech.demo')}
              className="flex flex-col items-start p-3 bg-sky-950/30 hover:bg-sky-900/40 border border-sky-500/30 rounded-xl transition group text-left"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/30 text-sky-300 flex items-center gap-1">
                  <User className="w-2.5 h-2.5" /> Employee
                </span>
                <ArrowRight className="w-3 h-3 text-sky-400 transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="text-xs font-bold text-white">Rahul Verma</p>
              <p className="text-[10px] text-slate-400">My Requests & Actions</p>
            </button>
          </div>
        </div>

        {/* Credentials Form Card */}
        <div className="p-6 bg-slate-900/70 border border-slate-800 rounded-2xl backdrop-blur-md shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lalatech.demo"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {error && (
              <div className="p-3 text-xs text-rose-300 bg-rose-950/50 border border-rose-800/60 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold tracking-wide uppercase shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In to Operations Hub'}
            </button>
          </form>
        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 6-State Lifecycle
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Overdue Protection
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Persistent SQLite
          </span>
        </div>
      </div>
    </div>
  );
}
