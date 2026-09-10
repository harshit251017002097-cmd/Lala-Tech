import React from 'react';
import { Hourglass, Clock } from 'lucide-react';

interface WaitingDurationBadgeProps {
  waitingSince: string | null;
  totalWaitingMinutes?: number;
  status: string;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return `${days}d ${remHours > 0 ? `${remHours}h` : ''}`.trim();
  }
  if (hours > 0) {
    const remMins = minutes % 60;
    return `${hours}h ${remMins > 0 ? `${remMins}m` : ''}`.trim();
  }
  return `${Math.max(1, minutes)}m`;
}

export default function WaitingDurationBadge({
  waitingSince,
  totalWaitingMinutes = 0,
  status,
}: WaitingDurationBadgeProps) {
  if (!waitingSince && totalWaitingMinutes <= 0) return null;

  let currentWaitText = '';
  if (waitingSince) {
    const diff = Date.now() - new Date(waitingSince).getTime();
    currentWaitText = formatDuration(Math.max(0, diff));
  } else if (totalWaitingMinutes > 0) {
    currentWaitText = formatDuration(totalWaitingMinutes * 60000);
  }

  const isCurrent = status === 'waiting_on_client' || status === 'needs_clarification';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md border font-medium ${
        isCurrent
          ? 'bg-purple-950/40 text-purple-300 border-purple-800/40 animate-pulse'
          : 'bg-slate-800/60 text-slate-400 border-slate-700/50'
      }`}
      title={isCurrent ? `Currently waiting on client for ${currentWaitText}` : `Total client waiting time: ${currentWaitText}`}
    >
      <Hourglass className="w-3 h-3 text-purple-400" />
      <span>{isCurrent ? `Waiting ${currentWaitText}` : `Waited ${currentWaitText}`}</span>
    </span>
  );
}
