'use client';

import React, { useState } from 'react';
import { PauseCircle, X, AlertCircle } from 'lucide-react';

interface WaitingOnClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  displayId: string;
  clientName?: string | null;
}

export default function WaitingOnClientModal({
  isOpen,
  onClose,
  onSubmit,
  displayId,
  clientName,
}: WaitingOnClientModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A specific reason is required so everyone knows what is stalled.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg p-6 bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-lg">
            <PauseCircle className="w-5 h-5 text-purple-400" />
            <span>Move {displayId} to Waiting on Client</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200">
            <strong>Rule:</strong> Requests in <em>Waiting on Client</em> are paused and <strong>structurally excluded from overdue calculations</strong>, because Lala Tech is not the party causing the delay.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              What are we waiting for from {clientName ? `${clientName}` : 'the client'}? *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Awaiting client approval on design mockup, sign-off on invoice, or missing order documentation..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
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
              disabled={isSubmitting || !reason.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Waiting on Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
