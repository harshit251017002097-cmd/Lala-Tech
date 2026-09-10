'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertOctagon,
  MessageSquare,
  PauseCircle,
  HelpCircle,
  Check
} from 'lucide-react';
import { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch (e) {
      console.error('Load notifications error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'request_overdue':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'deadline_approaching':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'waiting_on_client':
        return <PauseCircle className="w-4 h-4 text-purple-400" />;
      case 'clarification_requested':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'request_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" />
            <span>Notifications Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated alerts for assignments, deadline proximity, client waiting, and status transitions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
          >
            <Check className="w-3.5 h-3.5 text-blue-400" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl divide-y divide-slate-800/60 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No notifications.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition ${
                n.is_read ? 'opacity-65 hover:opacity-90' : 'bg-slate-850/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <p className={`text-xs ${n.is_read ? 'text-slate-300' : 'text-white font-semibold'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}
                    </span>
                    {n.request_id && (
                      <>
                        <span>•</span>
                        <Link
                          href={`/requests/${n.request_id}`}
                          onClick={() => handleMarkRead(n.id)}
                          className="text-blue-400 hover:underline"
                        >
                          View Request →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  title="Mark as read"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
