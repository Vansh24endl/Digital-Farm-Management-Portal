import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  UserX,
  Phone,
  Thermometer,
  Clock,
  Building,
} from 'lucide-react';


export const VisitorLogScreen: React.FC = () => {
  const { openModal, showToast } = useApp();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVisitors = async () => {
    try {
      setError('');
      const result = await api.getVisitors();
      const rows = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
      setVisitors(rows.map((v: any) => ({
        ...v,
        id: v._id || v.id,
        name: v.name || v.visitorName || 'Unknown visitor',
        company: v.company || v.organization || 'Not specified',
        role: v.role || v.visitorType || 'Visitor',
        purpose: v.purpose || 'Not specified',
        status: v.checkOut ? 'OUT' : 'IN',
        entryTime: v.entryTime || v.checkInTime || (v.createdAt ? new Date(v.createdAt).toLocaleString() : '—'),
        temperature: v.temperature ?? '—',
        phone: v.phone || '—',
      })));
    } catch (e: any) {
      setError(e.message || 'Could not load visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
    const refresh = () => loadVisitors();
    window.addEventListener('visitors-updated', refresh);
    return () => window.removeEventListener('visitors-updated', refresh);
  }, []);

  const toggleVisitorStatus = async (id: string) => {
    const visitor = visitors.find((v) => v.id === id);
    if (!visitor) return;

    if (visitor.status !== 'IN') {
      showToast?.('This backend supports check-out only. Register the visitor again to check in.');
      return;
    }

    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${base}/visitors/${id}/checkout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await response.json()
        : { message: 'API returned HTML instead of JSON. Check VITE_API_URL and backend route.' };

      if (!response.ok) throw new Error(result.message || 'Could not check out visitor');
      await loadVisitors();
      showToast?.('Visitor checked out.');
    } catch (e: any) {
      setError(e.message || 'Could not update visitor status');
    }
  };

  const activeOnPremiseCount = visitors.filter((v) => v.status === 'IN').length;

  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && v.status === statusFilter;
  });

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / Visitor Control</p>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            On-Premise Visitor Log
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
            Biometric, temperature & farm zone access surveillance
          </p>
        </div>
        <button
          id="add-visitor-btn"
          onClick={() => openModal('add-visitor')}
          className="fd-btn self-start flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Visitor
        </button>
      </div>

      {/* ── Summary Metrics ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="fd-card p-4 text-center" style={{ borderColor: 'var(--success-dim)', background: 'var(--success-bg)' }}>
          <span className="fd-label block mb-1">Active On-Premise</span>
          <p className="font-display text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--success)' }}>
            {activeOnPremiseCount}
          </p>
          <span className="text-xs font-bold" style={{ color: 'var(--success)', fontFamily: 'IBM Plex Mono, monospace' }}>Checked IN</span>
        </div>

        <div className="fd-card p-4 text-center">
          <span className="fd-label block mb-1">This Week</span>
          <p className="font-display text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--lime)' }}>45</p>
          <span className="text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>Entrants Logged</span>
        </div>

        <div className="fd-card p-4 text-center">
          <span className="fd-label block mb-1">This Month</span>
          <p className="font-display text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>120</p>
          <span className="text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>Bio-Pass Passes</span>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input
            id="visitor-search"
            type="text"
            placeholder="Search visitor, company or purpose…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="fd-input pl-9"
          />
        </div>

        <div className="flex items-center gap-1 p-1" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '3px' }}>
          {(['ALL', 'IN', 'OUT'] as const).map((st) => (
            <button
              key={st}
              id={`visitor-filter-${st.toLowerCase()}`}
              onClick={() => setStatusFilter(st)}
              className="px-3 py-1.5 text-xs font-bold transition-all"
              style={{
                borderRadius: '2px',
                background: statusFilter === st ? 'var(--lime-subtle)' : 'transparent',
                color: statusFilter === st ? 'var(--lime)' : 'var(--text-secondary)',
                border: statusFilter === st ? '1px solid var(--lime-dim)' : '1px solid transparent',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {st === 'ALL' ? 'All' : st === 'IN' ? 'IN' : 'OUT'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="fd-card p-4 text-sm" style={{ borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)', color: 'var(--critical)' }}>
          {error}
        </div>
      )}

      {/* ── Visitor Cards ── */}
      <div className="space-y-2">
        {loading ? (
          <div className="fd-card p-8 text-center text-sm" style={{ color: 'var(--text-dim)' }}>Loading visitors…</div>
        ) : filteredVisitors.length === 0 ? (
          <div className="fd-card p-8 text-center">
            <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No visitors match your search filter.</p>
          </div>
        ) : filteredVisitors.map((visitor) => {
          const isIn = visitor.status === 'IN';

          return (
            <div
              key={visitor.id}
              onClick={() => toggleVisitorStatus(visitor.id)}
              className="fd-card p-4 cursor-pointer transition-all active:scale-[0.998] group"
              style={{
                borderColor: isIn ? 'var(--success-dim)' : 'var(--border)',
                background: isIn ? 'var(--success-bg)' : 'var(--bg-panel)',
              }}
              title="Tap to toggle Checked IN / Checked OUT"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  {/* Initials Avatar */}
                  <div
                    className="w-10 h-10 flex items-center justify-center font-bold text-base flex-shrink-0"
                    style={{
                      borderRadius: '2px',
                      border: `1px solid ${isIn ? 'var(--success-dim)' : 'var(--border)'}`,
                      background: isIn ? 'var(--success-bg)' : 'var(--bg-raised)',
                      color: isIn ? 'var(--success)' : 'var(--text-secondary)',
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    {visitor.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                        {visitor.name}
                      </h3>
                      <span className={`fd-badge ${isIn ? 'fd-badge-success' : 'fd-badge-neutral'}`}>
                        {isIn ? 'ON-PREMISE' : 'CHECKED OUT'}
                      </span>
                    </div>

                    <p className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--lime)', fontFamily: 'IBM Plex Mono, monospace' }}>
                      <Building className="w-3 h-3" /> {visitor.company} · {visitor.role}
                    </p>

                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{visitor.purpose}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px' }}>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {visitor.entryTime}</span>
                      <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" style={{ color: 'var(--warning)' }} /> {visitor.temperature}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {visitor.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Toggle button */}
                <div className="self-end sm:self-center flex flex-col items-end gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleVisitorStatus(visitor.id); }}
                    className={`fd-btn-ghost flex items-center gap-1.5 text-xs ${isIn ? '' : ''}`}
                    style={{
                      borderColor: isIn ? 'var(--critical-dim)' : 'var(--success-dim)',
                      color: isIn ? 'var(--critical)' : 'var(--success)',
                    }}
                  >
                    {isIn ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    {isIn ? 'Check OUT' : 'Check IN'}
                  </button>
                  <span className="text-[9px]" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>tap card to toggle</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sticky Bottom CTA ── */}
      <div className="fixed bottom-16 left-0 right-0 p-3 z-30 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={() => openModal('add-visitor')}
            className="fd-btn w-full py-3 text-sm justify-center"
          >
            <Plus className="w-4 h-4" /> Register New On-Premise Entrant
          </button>
        </div>
      </div>
    </div>
  );
};