'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  User,
  RotateCcw,
  Clock
} from 'lucide-react';
import { ExtractedRequestDraft } from '@/lib/ai';
import { Client, User as UserType } from '@/lib/types';

export default function AiCapturePage() {
  const router = useRouter();
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [draft, setDraft] = useState<ExtractedRequestDraft | null>(null);
  const [error, setError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);

  // Editable draft fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [clientId, setClientId] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Operations');
  const [source, setSource] = useState('whatsapp');

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then((d) => d.clients && setClients(d.clients));
    fetch('/api/users').then((r) => r.json()).then((d) => d.users && setUsers(d.users));
  }, []);

  const handleExtract = async () => {
    if (!rawText.trim()) {
      setError('Please paste a message or request text first.');
      return;
    }

    try {
      setIsExtracting(true);
      setError('');
      const res = await fetch('/api/ai/extract-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Extraction failed.');
      }

      const d: ExtractedRequestDraft = data.draft;
      setDraft(d);
      setTitle(d.title);
      setDescription(d.description);
      setAssigneeId(d.assigneeId || '');
      setClientId(d.clientId || '');
      setPriority(d.priority);
      setDueDate(d.dueDate || '');
      setCategory(d.category);
      setSource(d.source);
    } catch (err: any) {
      setError(err.message || 'AI extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmCreate = async () => {
    if (!title.trim()) {
      setError('Request title is required.');
      return;
    }

    try {
      setIsConfirming(true);
      setError('');

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          assigned_to: assigneeId || null,
          client_id: clientId || null,
          priority,
          category,
          source,
          due_date: dueDate || null,
          status: 'ready_to_assign', // PRD v2: triage flow
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to create request.');
      }

      router.push(`/requests/${data.request.id}`);
    } catch (err: any) {
      setError(err.message || 'Error creating request.');
    } finally {
      setIsConfirming(false);
    }
  };

  const samples = [
    {
      label: 'Sample WhatsApp Order (PRD Demo)',
      text: 'Rahul, please send the invoice for order #4532 to customer Apex Retail by tomorrow evening. This is urgent.',
    },
    {
      label: 'Sample Logistics Blocker',
      text: 'Aman, check with Metro Logistics regarding warehouse delivery schedule for Batch 17. Need delivery slots confirmed.',
    },
    {
      label: 'Sample Website Inquiry',
      text: 'Website inquiry received from Nova Health requesting quote for medical device imports customs clearance. No rush.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <span>AI Request Capture</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Turn unstructured messages into structured, editable request drafts with 1 click. (PRD v2 Human-in-the-Loop review)
        </p>
      </div>

      {/* Input Section */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Paste Message (WhatsApp / Email / Note)
          </label>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Quick Samples:</span>
            {samples.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setRawText(s.text)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[10px]"
              >
                Sample {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={4}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="e.g. Rahul, please send the invoice for order #4532 to customer Apex Retail by tomorrow evening. This is urgent."
          className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition leading-relaxed font-sans"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500">
            Extracts Title, Client, Assignee, Priority, Deadline, Category & Source.
          </span>
          <button
            onClick={handleExtract}
            disabled={isExtracting || !rawText.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isExtracting ? 'Extracting with AI...' : 'Extract Request Draft'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Review & Edit Draft Panel */}
      {draft && (
        <div className="p-6 bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                AI Draft Generated
              </span>
              <p className="text-xs text-slate-400">Review & adjust fields before saving into the database.</p>
            </div>
            <button
              onClick={() => setDraft(null)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Extracted Title *
                </label>
                <span className="text-[10px] text-emerald-400 uppercase font-mono">
                  Confidence: {draft.confidence.title}
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Matched Client
                  </label>
                  {draft.clientName && (
                    <span className="text-[10px] text-purple-300 font-mono">AI: {draft.clientName}</span>
                  )}
                </div>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Assigned Owner
                  </label>
                  <span className="text-[10px] text-emerald-400 uppercase font-mono">
                    Confidence: {draft.confidence.assignee}
                  </span>
                </div>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Leave Unassigned --</option>
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
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="high">High (Urgent)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
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
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="Sales">Sales</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Support">Support</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmCreate}
              disabled={isConfirming || !title.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isConfirming ? 'Saving Request...' : 'Confirm & Create Request'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
