'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, X, AlertCircle } from 'lucide-react';
import { Client, User, Priority, RequestCategory, RequestSource, RequestStatus } from '@/lib/types';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReq: any) => void;
  defaultAssignee?: string;
  defaultStatus?: RequestStatus;
}

export default function CreateRequestModal({
  isOpen,
  onClose,
  onSuccess,
  defaultAssignee,
  defaultStatus = 'new',
}: CreateRequestModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [assignedTo, setAssignedTo] = useState(defaultAssignee || '');
  const [status, setStatus] = useState<RequestStatus>(defaultStatus);
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<RequestCategory>('Operations');
  const [source, setSource] = useState<RequestSource>('whatsapp');
  const [dueDate, setDueDate] = useState('');

  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Load clients and users
      fetch('/api/clients')
        .then((r) => r.json())
        .then((data) => {
          if (data.clients) setClients(data.clients);
        })
        .catch(console.error);

      fetch('/api/users')
        .then((r) => r.json())
        .then((data) => {
          if (data.users) setUsers(data.users);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          client_id: clientId || null,
          assigned_to: assignedTo || null,
          status,
          priority,
          category,
          source,
          due_date: dueDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to create request.');
      }

      onSuccess(data.request);
      onClose();
      // Reset
      setTitle('');
      setDescription('');
      setClientId('');
      setAssignedTo('');
      setDueDate('');
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl my-8 p-6 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <PlusCircle className="w-5 h-5 text-blue-500" />
            <span>Create New Client Request</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Send invoice for order #4532"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Client Organization
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Select Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Assignee
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Leave Unassigned (Manager Triage) --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="high">High (Urgent)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RequestStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="new">New Request</option>
                <option value="ready_to_assign">Ready to Assign</option>
                <option value="in_progress">In Progress</option>
                <option value="needs_clarification">Needs Clarification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RequestCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Sales">Sales</option>
                <option value="Logistics">Logistics</option>
                <option value="Support">Support</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Source Channel
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as RequestSource)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="phone">Phone / Verbal</option>
                <option value="website">Website Form</option>
                <option value="manual">Manual Entry</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description / Instructions
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full details of the request, deliverables, or customer instructions..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center gap-2"
            >
              {isSubmitting ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
