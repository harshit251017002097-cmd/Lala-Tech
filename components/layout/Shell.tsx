'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  Users2,
  Building2,
  Bell,
  Activity,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  Check,
  CheckSquare,
  Plus
} from 'lucide-react';
import { User, Notification } from '@/lib/types';
import CreateRequestModal from '@/components/modals/CreateRequestModal';

interface ShellProps {
  children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Demo accounts for instant 1-click switching
  const demoAccounts = [
    { id: 'usr_priya', name: 'Priya Sharma', role: 'manager', label: 'Operations Manager', color: '#4F46E5' },
    { id: 'usr_rahul', name: 'Rahul Verma', role: 'employee', label: 'Operations Executive', color: '#0EA5E9' },
    { id: 'usr_aman', name: 'Aman Gupta', role: 'employee', label: 'Delivery Coordinator', color: '#10B981' },
    { id: 'usr_neha', name: 'Neha Kapoor', role: 'employee', label: 'Finance & Support', color: '#F59E0B' },
  ];

  const fetchAuthAndNotifs = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      if (!authData.user) {
        if (pathname !== '/login') {
          router.push('/login');
        }
        return;
      }
      setCurrentUser(authData.user);

      // Fetch notifications
      const notifRes = await fetch('/api/notifications');
      const notifData = await notifRes.json();
      if (notifData.notifications) {
        setNotifications(notifData.notifications);
        setUnreadCount(notifData.unreadCount || 0);
      }
    } catch (e) {
      console.error('Shell load error:', e);
    }
  };

  useEffect(() => {
    fetchAuthAndNotifs();
  }, [pathname]);

  const handleSwitchDemo = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        setIsDemoDropdownOpen(false);
        router.refresh();
        window.location.reload();
      }
    } catch (e) {
      console.error('Switch error:', e);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleMarkAllNotifsRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
  };

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const isManager = currentUser?.role === 'manager';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(isManager
      ? [{ name: 'All Requests', href: '/requests', icon: Inbox }]
      : [{ name: 'My Requests', href: '/my-requests', icon: CheckSquare }]),
    { name: 'AI Capture', href: '/ai-capture', icon: Sparkles, badge: 'v2 AI' },
    { name: 'Clients', href: '/clients', icon: Building2 },
    ...(isManager ? [{ name: 'Team Workload', href: '/team', icon: Users2 }] : []),
    { name: 'Activity Log', href: '/activity', icon: Activity },
    { name: 'Notifications', href: '/notifications', icon: Bell, count: unreadCount },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#080C14] text-slate-200 overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950/80 border-r border-slate-800/80 shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              L
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>Lala Tech</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">v2.0</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Operations Hub</p>
            </div>
          </Link>
        </div>

        {/* Quick Action Button */}
        <div className="p-4 border-b border-slate-800/50">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>New Request</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Demo Switcher footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                style={{ backgroundColor: currentUser?.avatar_color || '#4F46E5' }}
              >
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.full_name}</p>
                <p className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                  {currentUser?.role === 'manager' ? (
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                  )}
                  {currentUser?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1 text-slate-400 hover:text-rose-400 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-slate-950/60 border-b border-slate-800/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Lala Tech Ops Hub • Active Live System</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 1-Click Demo Account Switcher (Priya / Rahul / Aman / Neha) */}
            <div className="relative">
              <button
                onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/70 hover:border-slate-600 text-xs font-medium text-slate-200 shadow-sm transition"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentUser?.avatar_color || '#4F46E5' }} />
                <span className="hidden sm:inline">Demo Switch:</span>
                <span className="font-semibold text-white">{currentUser?.full_name?.split(' ')[0]}</span>
                <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400 uppercase font-mono">{currentUser?.role}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isDemoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Switch Demo Account</p>
                    <p className="text-[10px] text-slate-400">Test Manager vs Employee views instantly</p>
                  </div>
                  {demoAccounts.map((acc) => {
                    const isSelected = currentUser?.id === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => handleSwitchDemo(acc.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${
                          isSelected ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-left">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: acc.color }}>
                            {acc.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs text-white leading-none">{acc.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{acc.label}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">Notifications ({unreadCount} unread)</p>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllNotifsRead}
                        className="text-[11px] text-blue-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-1">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-500">No notifications.</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 text-xs transition ${n.is_read ? 'text-slate-400 opacity-75' : 'bg-slate-800/40 text-slate-100 font-medium'}`}
                        >
                          <p className="line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-center">
                    <Link
                      href="/notifications"
                      onClick={() => setIsNotifDropdownOpen(false)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-2">
            <button
              onClick={() => {
                setIsCreateModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold mb-3"
            >
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </button>
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900"
              >
                <span>{item.name}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Create Request Modal */}
      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          router.refresh();
          window.location.reload();
        }}
      />
    </div>
  );
}
