'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Phone,
  MessageCircle,
  Mail,
  Plus,
  ArrowRight,
  Clock,
  PauseCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Client } from '@/lib/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/clients');
      const data = await res.json();
      if (data.clients) setClients(data.clients);
    } catch (e) {
      console.error('Load clients error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          company_name: companyName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          whatsapp_number: whatsapp.trim(),
        }),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setName('');
        setCompanyName('');
        setEmail('');
        setPhone('');
        setWhatsapp('');
        loadClients();
      }
    } catch (e) {
      console.error('Create client error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>Client Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Group, search, and monitor requests by client entity. (PRD v2 Client Data Model)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 animate-pulse">
            Loading client directory...
          </div>
        ) : clients.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500">
            No clients found. Add your first client above.
          </div>
        ) : (
          clients.map((cli) => (
            <div
              key={cli.id}
              className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                      {cli.company_name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Contact: {cli.name}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                    {cli.company_name.charAt(0)}
                  </div>
                </div>

                {/* Contact Links */}
                <div className="space-y-1.5 text-xs text-slate-400">
                  {cli.whatsapp_number && (
                    <a
                      href={`https://wa.me/${cli.whatsapp_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-emerald-400 hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp: {cli.whatsapp_number}</span>
                    </a>
                  )}
                  {cli.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cli.phone}</span>
                    </div>
                  )}
                  {cli.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{cli.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics & Link */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-300">
                    <strong className="text-white font-mono">{cli.active_requests || 0}</strong> active
                  </span>
                  {cli.waiting_requests > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-950/40 text-purple-300 border border-purple-800/40 text-[10px] font-bold">
                      {cli.waiting_requests} waiting
                    </span>
                  )}
                </div>

                <Link
                  href={`/requests?clientId=${cli.id}`}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 group"
                >
                  <span>Requests</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Add New Client Organization</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Retail Ltd"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sanjay Mehta"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 98201 23456"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98201 23456"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !companyName.trim() || !name.trim()}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Creating...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
