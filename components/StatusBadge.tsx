import React from 'react';
import { RequestStatus } from '@/lib/types';
import { Sparkles, HelpCircle, CheckCircle2, Play, PauseCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const statusConfig: Record<
  RequestStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  new: {
    label: 'New Request',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
    icon: Sparkles,
  },
  needs_clarification: {
    label: 'Needs Clarification',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: HelpCircle,
  },
  ready_to_assign: {
    label: 'Ready to Assign',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: Play,
  },
  waiting_on_client: {
    label: 'Waiting on Client',
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
    icon: PauseCircle,
  },
  done: {
    label: 'Done',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
};

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}
