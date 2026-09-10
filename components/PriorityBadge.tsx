import React from 'react';
import { Priority } from '@/lib/types';
import { AlertTriangle, AlertCircle, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export default function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const configs: Record<
    Priority,
    { label: string; bg: string; text: string; dot: string; icon: React.ElementType }
  > = {
    high: {
      label: 'High',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      dot: 'bg-rose-500',
      icon: AlertTriangle,
    },
    medium: {
      label: 'Medium',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-500',
      icon: AlertCircle,
    },
    low: {
      label: 'Low',
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      dot: 'bg-slate-400',
      icon: ArrowDown,
    },
  };

  const config = configs[priority] || configs.medium;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium gap-1',
    md: 'px-2.5 py-0.5 text-xs font-semibold gap-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full ${config.bg} ${config.text} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
