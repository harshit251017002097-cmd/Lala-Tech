'use client';

import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, UserCheck, CheckCircle2, Database, Sparkles } from 'lucide-react';
import { User } from '@/lib/types';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user));
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          <span>System Settings & Profile</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Operations Hub configuration and user profile information.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active User Profile</h3>
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg"
            style={{ backgroundColor: currentUser?.avatar_color || '#4F46E5' }}
          >
            {currentUser?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{currentUser?.full_name}</h2>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-semibold capitalize">
              {currentUser?.role === 'manager' ? (
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
              ) : (
                <UserCheck className="w-3 h-3 text-cyan-400" />
              )}
              {currentUser?.role} Role
            </span>
          </div>
        </div>
      </div>

      {/* Architecture & PRD v2 Principles Card */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Architecture & PRD v2 Principles</span>
        </h3>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2.5 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">6-Stage Request Lifecycle</p>
              <p className="text-slate-400 mt-0.5">
                New Request → Needs Clarification → Ready to Assign → In Progress → Waiting on Client → Done.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Strict Overdue Protection</p>
              <p className="text-slate-400 mt-0.5">
                Requests in <em>Waiting on Client</em> or <em>Done</em> are strictly excluded from overdue queues because Lala Tech is not holding up the work.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Persistent SQLite Database</p>
              <p className="text-slate-400 mt-0.5">
                Backed by real persistent SQLite storage in <code className="text-slate-200">/data/lalatech.db</code>. Survives server restarts and refreshes with zero external cloud dependencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
