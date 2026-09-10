'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  PauseCircle,
  UserX,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  Calendar,
  Building2,
  ChevronRight,
  TrendingUp,
  Activity as ActivityIcon,
  Plus
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import WaitingDurationBadge from '@/components/WaitingDurationBadge';
import CreateRequestModal from '@/components/modals/CreateRequestModal';
import { DashboardSummary, RequestItem, ActivityLogEntry, User } from '@/lib/types';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [overdueRequests, setOverdueRequests] = useState<RequestItem[]>([]);
  const [todayRequests, setTodayRequests] = useState<RequestItem[]>([]);
  const [waitingRequests, setWaitingRequests] = useState<RequestItem[]>([]);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [authRes, sumRes, overdueRes, todayRes, waitingRes, actRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/requests/dashboard-summary'),
        fetch('/api/requests?queue=overdue'),
        fetch('/api/requests?status=in_progress'),
        fetch('/api/requests?queue=waiting_for_client'),
        fetch('/api/activity?limit=8'),
      ]);

      const authData = await authRes.json();
      const sumData = await sumRes.json();
      const ovData = await overdueRes.json();
      const tdData = await todayRes.json();
      const wtData = await waitingRes.json();
      const actData = await actRes.json();

      if (authData.user) setCurrentUser(authData.user);
      if (sumData.summary) setSummary(sumData.summary);
      if (ovData.requests) setOverdueRequests(ovData.requests);
      if (tdData.requests) setTodayRequests(tdData.requests.filter((r: RequestItem) => r.due_date));
      if (wtData.requests) setWaitingRequests(wtData.requests);
      if (actData.activities) setActivities(actData.activities);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading && !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const isManager = currentUser?.role === 'manager';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Operations Dashboard</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-medium">
              {isManager ? 'Company Overview' : 'Assigned Scope'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time request lifecycle tracking: Know what is waiting, who owns it, and why.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/ai-capture"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-xs font-semibold text-purple-300 shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Capture</span>
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/25 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* 4 Core Operational Queue Cards (PRD v2 Headline Metric) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span>The 4 Operational Queues</span>
          </h2>
          <span className="text-[11px] text-slate-500">Live Database Metrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Waiting for Us */}
          <Link
            href="/requests?queue=waiting_for_us"
            className="p-5 bg-gradient-to-b from-blue-950/40 to-slate-900/80 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl transition group relative overflow-hidden shadow-lg shadow-blue-950/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Waiting for Us
                </span>
                <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                  {summary?.queues.waiting_for_us ?? 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
              <span>Lala Tech action needed (New, Ready, In Progress)</span>
            </p>
          </Link>

          {/* Card 2: Waiting for Client */}
          <Link
            href="/requests?queue=waiting_for_client"
            className="p-5 bg-gradient-to-b from-purple-950/40 to-slate-900/80 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl transition group relative overflow-hidden shadow-lg shadow-purple-950/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <PauseCircle className="w-3.5 h-3.5 text-purple-400" /> Waiting for Client
                </span>
                <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                  {summary?.queues.waiting_for_client ?? 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-300 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-purple-300/80 mt-3 font-medium">
              ★ Structurally excluded from Overdue
            </p>
          </Link>

          {/* Card 3: Unassigned */}
          <Link
            href="/requests?queue=unassigned"
            className="p-5 bg-gradient-to-b from-amber-950/40 to-slate-900/80 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl transition group relative overflow-hidden shadow-lg shadow-amber-950/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5" /> Unassigned
                </span>
                <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                  {summary?.queues.unassigned ?? 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Needs manager triage or assignment
            </p>
          </Link>

          {/* Card 4: Overdue */}
          <Link
            href="/requests?queue=overdue"
            className="p-5 bg-gradient-to-b from-rose-950/50 to-slate-900/80 border border-rose-500/40 hover:border-rose-500/80 rounded-2xl transition group relative overflow-hidden shadow-lg shadow-rose-950/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5" /> Overdue
                </span>
                <div className="text-3xl font-extrabold text-rose-400 mt-2 font-mono">
                  {summary?.queues.overdue ?? 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-rose-300/80 mt-3">
              Internal delays only (Lala Tech responsibility)
            </p>
          </Link>
        </div>
      </div>

      {/* Overdue Queue Highlights (Section 15.2 PRD visual distinction) */}
      {overdueRequests.length > 0 && (
        <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              <span>Genuinely Overdue Requests ({overdueRequests.length})</span>
            </div>
            <Link
              href="/requests?queue=overdue"
              className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View all overdue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-rose-900/30">
            {overdueRequests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-950/20 px-2 rounded-xl transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-rose-400">{req.display_id}</span>
                    <span className="text-xs font-bold text-white hover:text-rose-300">
                      <Link href={`/requests/${req.id}`}>{req.title}</Link>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    {req.client_company && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {req.client_company}
                      </span>
                    )}
                    <span>•</span>
                    <span>Due: {req.due_date ? new Date(req.due_date).toLocaleDateString() : 'No date'}</span>
                    <span>•</span>
                    <span>Assignee: {req.assignee_name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={req.priority} size="sm" />
                  <StatusBadge status={req.status} size="sm" />
                  <Link
                    href={`/requests/${req.id}`}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                  >
                    Action
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Waiting on Client vs Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stalled on Client Card */}
        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Stalled on Client ({waitingRequests.length})</h3>
            </div>
            <Link
              href="/requests?queue=waiting_for_client"
              className="text-xs text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>View queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {waitingRequests.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">No requests currently waiting on clients.</p>
            ) : (
              waitingRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl hover:border-purple-800/50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-bold text-purple-400">{req.display_id}</span>
                        <Link href={`/requests/${req.id}`} className="text-xs font-semibold text-white hover:text-purple-300">
                          {req.title}
                        </Link>
                      </div>
                      <p className="text-[11px] text-purple-200/90 italic line-clamp-1">
                        Reason: {req.client_waiting_reason || 'Pending client information'}
                      </p>
                    </div>
                    <WaitingDurationBadge
                      waitingSince={req.waiting_since}
                      totalWaitingMinutes={req.total_client_waiting_minutes}
                      status={req.status}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Operational Activity Log */}
        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Live Activity Feed</h3>
            </div>
            <Link href="/activity" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
              <span>Full audit log</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">No recent activity.</p>
            ) : (
              activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">{act.description}</p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Request Modal */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
