'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Building2,
  Calendar,
  AlertOctagon,
  PauseCircle,
  Clock,
  UserX,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import WaitingDurationBadge from '@/components/WaitingDurationBadge';
import CreateRequestModal from '@/components/modals/CreateRequestModal';
import WaitingOnClientModal from '@/components/modals/WaitingOnClientModal';
import { RequestItem, Client, User, RequestStatus } from '@/lib/types';

function RequestsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedQueue, setSelectedQueue] = useState<string>(searchParams.get('queue') || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [selectedPriority, setSelectedPriority] = useState<string>(searchParams.get('priority') || 'all');
  const [selectedClient, setSelectedClient] = useState<string>(searchParams.get('clientId') || 'all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>(searchParams.get('assignedTo') || 'all');
  const [sort, setSort] = useState<string>('created_desc');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [waitingModalData, setWaitingModalData] = useState<{ isOpen: boolean; requestId: string; displayId: string; clientName?: string | null }>({
    isOpen: false,
    requestId: '',
    displayId: '',
  });

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedQueue !== 'all') params.set('queue', selectedQueue);
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (selectedPriority !== 'all') params.set('priority', selectedPriority);
      if (selectedClient !== 'all') params.set('clientId', selectedClient);
      if (selectedAssignee !== 'all') params.set('assignedTo', selectedAssignee);
      if (search.trim()) params.set('search', search.trim());
      if (sort) params.set('sort', sort);

      const res = await fetch(`/api/requests?${params.toString()}`);
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (e) {
      console.error('Fetch requests error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then((d) => d.clients && setClients(d.clients));
    fetch('/api/users').then((r) => r.json()).then((d) => d.users && setUsers(d.users));
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [selectedQueue, selectedStatus, selectedPriority, selectedClient, selectedAssignee, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleQuickStatusChange = async (req: RequestItem, newStatus: RequestStatus) => {
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
      const res = await fetch(`/api/requests/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (e) {
      console.error('Status change error:', e);
    }
  };

  const submitWaitingReason = async (reason: string) => {
    const res = await fetch(`/api/requests/${waitingModalData.requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'waiting_on_client',
        client_waiting_reason: reason,
      }),
    });
    if (!res.ok) throw new Error('Failed to set waiting reason');
    fetchRequests();
  };

  const queueTabs = [
    { id: 'all', label: 'All Requests' },
    { id: 'waiting_for_us', label: 'Waiting for Us', icon: Clock, color: 'text-blue-400' },
    { id: 'waiting_for_client', label: 'Waiting for Client', icon: PauseCircle, color: 'text-purple-400' },
    { id: 'unassigned', label: 'Unassigned', icon: UserX, color: 'text-amber-400' },
    { id: 'overdue', label: 'Overdue', icon: AlertOctagon, color: 'text-rose-400' },
    { id: 'done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Requests</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, assign, and advance requests through their 6 lifecycle states.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Request</span>
        </button>
      </div>

      {/* 4 Operational Queue Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/60 no-scrollbar">
        {queueTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedQueue === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedQueue(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${tab.color}`} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID (REQ-1001), request title, client company, or description..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New Request</option>
            <option value="needs_clarification">Needs Clarification</option>
            <option value="ready_to_assign">Ready to Assign</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_on_client">Waiting on Client</option>
            <option value="done">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Client Filter */}
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500 truncate"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>

          {/* Sort Control */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="created_desc">Newest First</option>
            <option value="due_date_asc">Due Date (Soonest)</option>
            <option value="due_date_desc">Due Date (Latest)</option>
            <option value="priority">Priority (High first)</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-400">No requests found matching your filters.</p>
            <button
              onClick={() => {
                setSelectedQueue('all');
                setSelectedStatus('all');
                setSelectedPriority('all');
                setSelectedClient('all');
                setSelectedAssignee('all');
                setSearch('');
              }}
              className="text-xs text-blue-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-950/40">
                  <th className="p-3.5 pl-5 font-semibold">ID</th>
                  <th className="p-3.5 font-semibold">Title & Client</th>
                  <th className="p-3.5 font-semibold">Assignee</th>
                  <th className="p-3.5 font-semibold">Priority</th>
                  <th className="p-3.5 font-semibold">Lifecycle Status</th>
                  <th className="p-3.5 font-semibold">Due Date</th>
                  <th className="p-3.5 pr-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((req) => {
                  const isOverdue = req.is_overdue;
                  const isWaiting = req.status === 'waiting_on_client' || req.status === 'needs_clarification';

                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isOverdue ? 'bg-rose-950/15' : isWaiting ? 'bg-purple-950/10' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="p-3.5 pl-5 font-mono font-bold text-slate-300">
                        <Link href={`/requests/${req.id}`} className="hover:text-blue-400">
                          {req.display_id}
                        </Link>
                      </td>

                      {/* Title & Client */}
                      <td className="p-3.5 max-w-xs">
                        <Link
                          href={`/requests/${req.id}`}
                          className="font-semibold text-white hover:text-blue-300 line-clamp-1"
                        >
                          {req.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          {req.client_company ? (
                            <span className="flex items-center gap-1 text-slate-300">
                              <Building2 className="w-3 h-3 text-slate-500" />
                              {req.client_company}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">No Client</span>
                          )}
                          <span>•</span>
                          <span className="capitalize">{req.category}</span>
                        </div>
                      </td>

                      {/* Assignee */}
                      <td className="p-3.5">
                        {req.assignee_name ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{ backgroundColor: req.assignee_color || '#3B82F6' }}
                            >
                              {req.assignee_name.charAt(0)}
                            </span>
                            <span className="text-slate-300 truncate max-w-[100px]">{req.assignee_name}</span>
                          </div>
                        ) : (
                          <span className="text-amber-400/90 font-medium text-[11px] flex items-center gap-1">
                            <UserX className="w-3 h-3" /> Unassigned
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="p-3.5">
                        <PriorityBadge priority={req.priority} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <StatusBadge status={req.status} size="sm" />
                          <WaitingDurationBadge
                            waitingSince={req.waiting_since}
                            totalWaitingMinutes={req.total_client_waiting_minutes}
                            status={req.status}
                          />
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="p-3.5 whitespace-nowrap">
                        {req.due_date ? (
                          <div className="flex flex-col">
                            <span
                              className={`font-mono text-xs ${
                                isOverdue
                                  ? 'text-rose-400 font-bold flex items-center gap-1'
                                  : 'text-slate-300'
                              }`}
                            >
                              {isOverdue && <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
                              {new Date(req.due_date).toLocaleDateString()}
                            </span>
                            {isOverdue && (
                              <span className="text-[10px] text-rose-400 font-semibold uppercase">
                                Overdue
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={req.status}
                            onChange={(e) => handleQuickStatusChange(req, e.target.value as RequestStatus)}
                            className="text-[11px] px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none"
                          >
                            <option value="new">New</option>
                            <option value="needs_clarification">Needs Clarification</option>
                            <option value="ready_to_assign">Ready to Assign</option>
                            <option value="in_progress">In Progress</option>
                            <option value="waiting_on_client">Wait on Client...</option>
                            <option value="done">Done</option>
                          </select>

                          <Link
                            href={`/requests/${req.id}`}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                            title="View request details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchRequests()}
      />

      {/* Waiting on Client Reason Modal */}
      <WaitingOnClientModal
        isOpen={waitingModalData.isOpen}
        onClose={() => setWaitingModalData((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={submitWaitingReason}
        displayId={waitingModalData.displayId}
        clientName={waitingModalData.clientName}
      />
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading requests...</div>}>
      <RequestsContent />
    </Suspense>
  );
}
