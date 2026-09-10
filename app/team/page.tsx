'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users2, ShieldCheck, UserCheck, AlertOctagon, PauseCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { User } from '@/lib/types';

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user));

    fetch('/api/team/workload')
      .then((r) => r.json())
      .then((d) => {
        if (d.team) setTeam(d.team);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (currentUser?.role !== 'manager') {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-400">Access Restricted</p>
        <p className="text-xs text-slate-400">Only Operations Managers can access the Team Workload overview.</p>
        <Link href="/dashboard" className="inline-block px-4 py-2 bg-slate-800 text-xs text-white rounded-xl">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users2 className="w-6 h-6 text-indigo-400" />
          <span>Team Workload & Capacity</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor employee request allocation, active vs waiting load, and internal overdue items. (PRD v2 Workload Matrix)
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {team.map((member) => (
          <div
            key={member.id}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md"
                  style={{ backgroundColor: member.avatar_color || '#4F46E5' }}
                >
                  {member.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{member.full_name}</h3>
                  <p className="text-[11px] text-slate-400 capitalize flex items-center gap-1">
                    {member.role === 'manager' ? <ShieldCheck className="w-3 h-3 text-indigo-400" /> : <UserCheck className="w-3 h-3 text-cyan-400" />}
                    {member.role}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Active Internal</span>
                  <span className="text-base font-extrabold text-blue-400 font-mono">
                    {member.internal_active || 0}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-purple-300 block">Waiting Client</span>
                  <span className="text-base font-extrabold text-purple-400 font-mono">
                    {member.waiting_client || 0}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-rose-300 block">Overdue</span>
                  <span className={`text-base font-extrabold font-mono ${member.overdue_count > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                    {member.overdue_count || 0}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 block">Done</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {member.completed_count || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <Link
                href={`/requests?assignedTo=${member.id}`}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
              >
                <span>View Assigned Requests</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
