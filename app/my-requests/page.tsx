'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Play,
  PauseCircle,
  HelpCircle,
  CheckCircle2,
  AlertOctagon,
  Building2,
  Calendar,
  Plus,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import WaitingDurationBadge from '@/components/WaitingDurationBadge';
import WaitingOnClientModal from '@/components/modals/WaitingOnClientModal';
import CreateRequestModal from '@/components/modals/CreateRequestModal';
import { RequestItem, User } from '@/lib/types';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'waiting' | 'clarification' | 'done'>('active');
  const [isLoading, setIsLoading] = useState(true);

  const [waitingModalData, setWaitingModalData] = useState<{
    isOpen: boolean;
    requestId: string;
    displayId: string;
    clientName?: string | null;
  }>({
    isOpen: false,
    requestId: '',
    displayId: '',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadMyRequests = async () => {
    try {
      setIsLoading(true);
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (authData.user) {
        setCurrentUser(authData.user);
        const res = await fetch(`/api/requests?assignedTo=self`);
        const data = await res.json();
        if (data.requests) setRequests(data.requests);
      }
    } catch (e) {
      console.error('Load my requests error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyRequests();
  }, []);

  const handleStatusUpdate = async (req: RequestItem, newStatus: string) => {
    if (newStatus === 'waiting_on_client') {
      setWaitingModalData({
        isOpen: true,
        requestId: req.id,
        displayId: req.display_id,
        clientName: req.client_company || req.client_name,
      });
      return;
    }

    try {
      await fetch(`/api/requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadMyRequests();
    } catch (e) {
      console.error('Update error:', e);
    }
  };

  const submitWaitingReason = async (reason: string) => {
    await fetch(`/api/requests/${waitingModalData.requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'waiting_on_client',
        client_waiting_reason: reason,
      }),
    });
    loadMyRequests();
  };

  // Filter requests by tab
  const activeRequests = requests.filter((r) => ['new', 'ready_to_assign', 'in_progress'].includes(r.status));
  const waitingClientRequests = requests.filter((r) => r.status === 'waiting_on_client');
  const clarificationRequests = requests.filter((r) => r.status === 'needs_clarification');
  const doneRequests = requests.filter((r) => r.status === 'done');
  const overdueCount = activeRequests.filter((r) => r.is_overdue).length;

  let currentList = activeRequests;
  if (activeTab === 'waiting') currentList = waitingClientRequests;
  else if (activeTab === 'clarification') currentList = clarificationRequests;
  else if (activeTab === 'done') currentList = doneRequests;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-sky-400" />
            <span>My Assigned Requests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Signed in as <strong className="text-slate-200">{currentUser?.full_name}</strong> ({currentUser?.role})
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Submit Request</span>
        </button>
      </div>

      {/* Overdue Alert banner if any active requests are overdue */}
      {overdueCount > 0 && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-200">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold text-rose-300">You have {overdueCount} internally overdue request(s)!</p>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                If work is stalled on client feedback or missing info, move it to <em>Waiting on Client</em> or <em>Needs Clarification</em> so it won&apos;t count against you.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Active Internal ({activeRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('waiting')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'waiting'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <PauseCircle className="w-3.5 h-3.5" />
          <span>Waiting on Client ({waitingClientRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clarification')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'clarification'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Clarifications ({clarificationRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('done')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'done'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed ({doneRequests.length})</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading your requests...</div>
        ) : currentList.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400">No requests in this category.</p>
          </div>
        ) : (
          currentList.map((req) => (
            <div
              key={req.id}
              className={`p-4 bg-slate-900/80 border rounded-2xl transition hover:border-slate-700 ${
                req.is_overdue
                  ? 'border-rose-500/40 bg-rose-950/15'
                  : req.status === 'waiting_on_client'
                  ? 'border-purple-500/30 bg-purple-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-300">{req.display_id}</span>
                    <Link
                      href={`/requests/${req.id}`}
                      className="font-bold text-sm text-white hover:text-blue-400 transition truncate"
                    >
                      {req.title}
                    </Link>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">{req.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                    {req.client_company && (
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {req.client_company}
                      </span>
                    )}
                    {req.due_date && (
                      <span className={`flex items-center gap-1 ${req.is_overdue ? 'text-rose-400 font-bold' : ''}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {new Date(req.due_date).toLocaleDateString()}
                      </span>
                    )}
                    <WaitingDurationBadge
                      waitingSince={req.waiting_since}
                      totalWaitingMinutes={req.total_client_waiting_minutes}
                      status={req.status}
                    />
                  </div>

                  {req.client_waiting_reason && (
                    <div className="mt-2 p-2 bg-purple-950/30 border border-purple-800/30 rounded-lg text-xs text-purple-200">
                      <strong>Client waiting reason:</strong> {req.client_waiting_reason}
                    </div>
                  )}
                </div>

                {/* Status and Action Buttons */}
                <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={req.priority} size="sm" />
                    <StatusBadge status={req.status} size="sm" />
                  </div>

                  {/* Workflow Transitions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {req.status !== 'in_progress' && req.status !== 'done' && (
                      <button
                        onClick={() => handleStatusUpdate(req, 'in_progress')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
                      >
                        Start Work
                      </button>
                    )}

                    {req.status === 'in_progress' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(req, 'waiting_on_client')}
                          className="px-2.5 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 rounded-lg text-xs font-medium transition"
                        >
                          Wait on Client
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req, 'done')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                        >
                          Mark Done
                        </button>
                      </>
                    )}

                    {req.status === 'waiting_on_client' && (
                      <button
                        onClick={() => handleStatusUpdate(req, 'in_progress')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
                      >
                        Client Responded → Resume
                      </button>
                    )}

                    <Link
                      href={`/requests/${req.id}`}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Waiting on Client Reason Modal */}
      <WaitingOnClientModal
        isOpen={waitingModalData.isOpen}
        onClose={() => setWaitingModalData((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={submitWaitingReason}
        displayId={waitingModalData.displayId}
        clientName={waitingModalData.clientName}
      />

      {/* Create Request Modal */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => loadMyRequests()}
        defaultAssignee={currentUser?.id}
      />
    </div>
  );
}
