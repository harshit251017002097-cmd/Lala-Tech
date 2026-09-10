'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity as ActivityIcon, Clock } from 'lucide-react';
import { ActivityLogEntry } from '@/lib/types';

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/activity?limit=50')
      .then((r) => r.json())
      .then((d) => {
        if (d.activities) setActivities(d.activities);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ActivityIcon className="w-6 h-6 text-blue-400" />
          <span>Operational Activity Log</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Chronological audit trail of all request creations, assignments, status changes, clarifications, and completions.
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading audit log...</div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No activity logged yet.</div>
        ) : (
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="relative pl-6 pb-2 border-l border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-slate-900 absolute -left-1.5 top-1" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <p className="font-semibold text-slate-200">{act.description}</p>
                    <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {act.request_id && act.display_id && (
                    <Link
                      href={`/requests/${act.request_id}`}
                      className="inline-block text-[11px] text-blue-400 hover:underline"
                    >
                      View {act.display_id} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
