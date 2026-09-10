'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Phone,
  MessageCircle,
  Mail,
  User as UserIcon,
  Clock,
  PauseCircle,
  HelpCircle,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  Send,
  Sparkles,
  Check,
  Play
} from 'lucide-react';
import StatusBadge, { statusConfig } from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import WaitingDurationBadge from '@/components/WaitingDurationBadge';
import WaitingOnClientModal from '@/components/modals/WaitingOnClientModal';
import RequestClarificationModal from '@/components/modals/RequestClarificationModal';
import { RequestItem, Comment, Clarification, ActivityLogEntry, User, RequestStatus } from '@/lib/types';

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [request, setRequest] = useState<RequestItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [clarifications, setClarifications] = useState<Clarification[]>([]);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [authRes, reqRes, usersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/requests/${id}`),
        fetch('/api/users'),
      ]);

      const authData = await authRes.json();
      const reqData = await reqRes.json();
      const usersData = await usersRes.json();

      if (authData.user) setCurrentUser(authData.user);
      if (usersData.users) setUsers(usersData.users);

      if (!reqRes.ok) {
        throw new Error(reqData.error?.message || 'Request not found');
      }

      setRequest(reqData.request);
      setComments(reqData.comments || []);
      setClarifications(reqData.clarifications || []);
      setActivity(reqData.activity || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load request.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (newStatus === 'waiting_on_client') {
      setIsWaitingModalOpen(true);
      return;
    }
    if (newStatus === 'needs_clarification') {
      setIsClarificationModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/requests/${request?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error('Status change error:', e);
    }
  };

  const handleReassign = async (newAssigneeId: string) => {
    try {
      await fetch(`/api/requests/${request?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: newAssigneeId || null }),
      });
      loadData();
    } catch (e) {
      console.error('Reassign error:', e);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const res = await fetch(`/api/requests/${request?.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment.trim() }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setNewComment('');
      }
    } catch (e) {
      console.error('Comment submit error:', e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const submitWaitingReason = async (reason: string) => {
    await fetch(`/api/requests/${request?.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'waiting_on_client',
        client_waiting_reason: reason,
      }),
    });
    loadData();
  };

  const submitClarification = async (missingInfo: string, requestedFrom: string, notes?: string) => {
    await fetch(`/api/requests/${request?.id}/clarifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        missingInformation: missingInfo,
        requestedFrom,
        notes,
      }),
    });
    loadData();
  };

  const resolveClarification = async (clarificationId: string) => {
    await fetch(`/api/requests/${request?.id}/clarifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'resolve',
        clarificationId,
        resumeStatus: request?.assigned_to ? 'in_progress' : 'ready_to_assign',
      }),
    });
    loadData();
  };

  const handleDeleteRequest = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${request?.display_id}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/requests/${request?.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/requests');
      }
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading request details...</div>;
  }

  if (error || !request) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-semibold text-rose-400">{error || 'This request could not be found.'}</p>
        <Link href="/requests" className="px-4 py-2 bg-slate-800 text-xs text-slate-200 rounded-xl hover:bg-slate-700">
          ← Back to Requests
        </Link>
      </div>
    );
  }

  const isManager = currentUser?.role === 'manager';
  const isOverdue = request.is_overdue;

  // The 6 stages of the Request Lifecycle
  const lifecycleStages: { id: RequestStatus; label: string }[] = [
    { id: 'new', label: 'New Request' },
    { id: 'needs_clarification', label: 'Needs Clarification' },
    { id: 'ready_to_assign', label: 'Ready to Assign' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'waiting_on_client', label: 'Waiting on Client' },
    { id: 'done', label: 'Done' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to list</span>
        </button>

        <div className="flex items-center gap-2">
          {isManager && (
            <button
              onClick={handleDeleteRequest}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-900/40 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Request Header Banner */}
      <div
        className={`p-6 bg-slate-900/80 border rounded-2xl shadow-xl transition ${
          isOverdue ? 'border-rose-500/50 bg-rose-950/20 glow-overdue' : 'border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-800 text-blue-400 border border-slate-700">
                {request.display_id}
              </span>
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
              <WaitingDurationBadge
                waitingSince={request.waiting_since}
                totalWaitingMinutes={request.total_client_waiting_minutes}
                status={request.status}
              />
              {isOverdue && (
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full text-xs font-bold flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" /> Internally Overdue
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{request.title}</h1>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{request.description}</p>
          </div>

          {/* Quick Transition Action Menu */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl shrink-0 space-y-2 min-w-[200px]">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Advance Lifecycle</p>
            <div className="flex flex-col gap-1.5 text-xs">
              {request.status !== 'in_progress' && request.status !== 'done' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
                >
                  <span>Start Work</span>
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}

              {request.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => handleStatusChange('waiting_on_client')}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-semibold rounded-lg transition"
                  >
                    <span>Wait on Client...</span>
                    <PauseCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStatusChange('needs_clarification')}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 font-semibold rounded-lg transition"
                  >
                    <span>Needs Clarification...</span>
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStatusChange('done')}
                    className="w-full flex items-center justify-between px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition"
                  >
                    <span>Mark Done</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {request.status === 'waiting_on_client' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
                >
                  <span>Client Responded → Resume</span>
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}

              {request.status === 'needs_clarification' && (
                <button
                  onClick={() => handleStatusChange('ready_to_assign')}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition"
                >
                  <span>Clarification Received → Ready</span>
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}

              {request.status === 'done' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="w-full text-center px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
                >
                  Reopen Request
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 6-Stage Visual Lifecycle Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Request Lifecycle Progression (PRD v2 Model)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {lifecycleStages.map((stage, idx) => {
              const isCurrent = request.status === stage.id;
              const config = statusConfig[stage.id];
              const Icon = config.icon;

              return (
                <button
                  key={stage.id}
                  onClick={() => handleStatusChange(stage.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    isCurrent
                      ? `${config.bg} ${config.border} ring-1 ring-white/20 shadow-md`
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500">0{idx + 1}</span>
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? config.text : 'text-slate-600'}`} />
                  </div>
                  <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                    {stage.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Special Context Banner for Waiting on Client */}
      {request.status === 'waiting_on_client' && (
        <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-200">
          <div className="flex items-start gap-3">
            <PauseCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-white">Stalled on Client</p>
              <p className="text-purple-200 mt-0.5">
                <strong>Reason:</strong> {request.client_waiting_reason || 'Waiting for client sign-off or documents.'}
              </p>
              <p className="text-[11px] text-purple-300/80 mt-1">
                ★ <strong>PRD v2 Rule Enforced:</strong> This request is currently paused and <strong>excluded from overdue calculations</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleStatusChange('in_progress')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shrink-0 transition"
          >
            Client Responded → Resume Work
          </button>
        </div>
      )}

      {/* Two-Column Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Client Info & Clarifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Organization Card */}
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Client Entity Details</span>
            </h3>

            {request.client_name ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Company Name</p>
                  <p className="text-sm font-bold text-white">{request.client_company}</p>
                  <p className="text-xs text-slate-400">Primary Contact: {request.client_name}</p>
                </div>

                <div className="space-y-2 text-xs">
                  {request.client_whatsapp && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${request.client_whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 rounded-lg hover:bg-emerald-900/50 transition font-medium"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp ({request.client_whatsapp})</span>
                      </a>
                    </div>
                  )}

                  {request.client_email && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{request.client_email}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No client profile attached to this request.</p>
            )}
          </div>

          {/* Structured Clarification History (PRD v2 Section 5.3 & 6) */}
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Structured Clarifications ({clarifications.length})</span>
              </h3>
              <button
                onClick={() => setIsClarificationModalOpen(true)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                + Request clarification
              </button>
            </div>

            <div className="space-y-3">
              {clarifications.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No clarifications logged for this request.</p>
              ) : (
                clarifications.map((clr) => (
                  <div
                    key={clr.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      clr.resolved_at
                        ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                        : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              clr.resolved_at ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {clr.resolved_at ? 'Resolved' : 'Pending Client Info'}
                          </span>
                          <span className="text-slate-500">From: {clr.requested_from}</span>
                        </div>
                        <p className="font-semibold text-white">{clr.missing_information}</p>
                      </div>

                      {!clr.resolved_at && (
                        <button
                          onClick={() => resolveClarification(clr.id)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg text-xs transition"
                        >
                          Mark Received
                        </button>
                      )}
                    </div>

                    {clr.notes && (
                      <p className="text-[11px] text-slate-400 italic">Notes: {clr.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comments Feed */}
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Follow-up Discussion ({comments.length})
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No comments yet. Leave context or updates below.</p>
              ) : (
                comments.map((cmt) => (
                  <div key={cmt.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white"
                          style={{ backgroundColor: cmt.user_color || '#3B82F6' }}
                        >
                          {cmt.user_name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-bold text-white">{cmt.user_name}</span>
                        <span className="text-[10px] text-slate-500 uppercase">({cmt.user_role})</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(cmt.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 pl-7 leading-relaxed">{cmt.body}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={submitComment} className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write an internal operational update or note..."
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (1 col): Meta Details & Activity Timeline */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignment & Dates</h3>

            {/* Assignee Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Assigned Owner
              </label>
              <select
                value={request.assigned_to || ''}
                disabled={!isManager}
                onChange={(e) => handleReassign(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-80"
              >
                <option value="">-- Unassigned --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
              {!isManager && (
                <span className="text-[10px] text-slate-500 mt-1 block">Only managers can reassign.</span>
              )}
            </div>

            <div className="divide-y divide-slate-800 text-xs text-slate-300">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="font-semibold text-white">{request.category}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Source</span>
                <span className="font-semibold text-white capitalize">{request.source}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Due Date</span>
                <span className={`font-semibold ${isOverdue ? 'text-rose-400 font-bold' : 'text-white'}`}>
                  {request.due_date ? new Date(request.due_date).toLocaleDateString() : 'None set'}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Created By</span>
                <span className="font-semibold text-white">{request.creator_name || 'System'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Created At</span>
                <span className="text-slate-400">{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Audit Timeline ({activity.length})
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {activity.map((act) => (
                <div key={act.id} className="relative pl-4 text-xs border-l border-slate-800 pb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 absolute -left-1 top-1" />
                  <p className="text-slate-200 leading-snug">{act.description}</p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Waiting on Client Modal */}
      <WaitingOnClientModal
        isOpen={isWaitingModalOpen}
        onClose={() => setIsWaitingModalOpen(false)}
        onSubmit={submitWaitingReason}
        displayId={request.display_id}
        clientName={request.client_company || request.client_name}
      />

      {/* Request Clarification Modal */}
      <RequestClarificationModal
        isOpen={isClarificationModalOpen}
        onClose={() => setIsClarificationModalOpen(false)}
        onSubmit={submitClarification}
        displayId={request.display_id}
        defaultContact={request.client_name}
      />
    </div>
  );
}
