'use client';

import React, { useState } from 'react';
import { HelpCircle, X, AlertCircle } from 'lucide-react';

interface RequestClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (missingInfo: string, requestedFrom: string, notes?: string) => Promise<void>;
  displayId: string;
  defaultContact?: string | null;
}

export default function RequestClarificationModal({
  isOpen,
  onClose,
  onSubmit,
  displayId,
  defaultContact,
}: RequestClarificationModalProps) {
  const [missingInfo, setMissingInfo] = useState('');
  const [requestedFrom, setRequestedFrom] = useState(defaultContact || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missingInfo.trim()) {
      setError('Please describe what information is missing.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(missingInfo.trim(), requestedFrom.trim() || 'Client', notes.trim() || undefined);
      setMissingInfo('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to request clarification.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg p-6 bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-lg">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>Request Clarification for {displayId}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200">
            <strong>Lifecycle State:</strong> Moving this request to <em>Needs Clarification</em> will record what is missing, start a clarification waiting timer, and hold internal assignment until the client answers.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Missing Information / What needs clarification? *
            </label>
            <textarea
              required
              rows={3}
              value={missingInfo}
              onChange={(e) => setMissingInfo(e.target.value)}
              placeholder="e.g. Missing order invoice number, client shipping address confirmation, or confirmed product SKU..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Requested From (Client contact / Person)
            </label>
            <input
              type="text"
              value={requestedFrom}
              onChange={(e) => setRequestedFrom(e.target.value)}
              placeholder="e.g. Sanjay Mehta (Apex Retail)"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Internal notes / follow-up channel (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent WhatsApp message at 11:30 AM, awaiting reply by evening"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
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
              disabled={isSubmitting || !missingInfo.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : 'Set Needs Clarification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
