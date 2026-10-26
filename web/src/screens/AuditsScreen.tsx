import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardCheck, Plus, Clock, ChevronRight, TrendingUp, CheckCircle2,
  RefreshCw, AlertTriangle, AlertCircle,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

type AuditRecord = {
  id: string;
  title: string;
  sector: string;
  auditor: string;
  dueDate: string;
  progress: number;
  severity: 'urgent' | 'attention' | 'routine';
  status: 'pending' | 'in-progress' | 'completed';
  riskLevel?: string;
  findings?: string;
  createdAt?: string;
  farmId?: any;
  raw?: any;
};

function normalizeAudit(a: any): AuditRecord {
  const farm = a.farmId && typeof a.farmId === 'object' ? a.farmId : null;
  const risk = String(a.riskLevel || 'routine').toLowerCase();
  const status = ['pending', 'in-progress', 'completed'].includes(a.status) ? a.status : 'pending';
  const progress = status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0;
  const created = a.createdAt ? new Date(a.createdAt) : null;
  return {
    id: String(a._id || a.id),
    title: a.title || 'Untitled audit',
    sector: farm ? `${farm.name || 'Farm'}${farm.farmType ? ` · ${farm.farmType}` : ''}` : 'Farm audit',
    auditor: a.auditor || 'Assigned auditor',
    dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : created && !Number.isNaN(created.getTime()) ? created.toLocaleDateString() : 'Not set',
    progress,
    severity: ['urgent', 'high', 'critical'].includes(risk) ? 'urgent' : ['attention', 'medium', 'moderate'].includes(risk) ? 'attention' : 'routine',
    status: status as AuditRecord['status'],
    riskLevel: a.riskLevel,
    findings: a.findings,
    createdAt: a.createdAt,
    farmId: a.farmId,
    raw: a,
  };
}

async function readJson(response: Response) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    throw new Error(`API returned a non-JSON response (${response.status}). Check VITE_API_URL and backend route.`);
  }
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.message || 'Audit request failed');
  return data;
}

export const AuditsScreen: React.FC = () => {
  const { openModal, openAuditInspector } = useApp();
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAudits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/audits`);
      const result = await readJson(response);
      setAudits((Array.isArray(result.data) ? result.data : []).map(normalizeAudit));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load audits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAudits();
    const onUpdated = () => void loadAudits();
    window.addEventListener('audits-updated', onUpdated);
    return () => window.removeEventListener('audits-updated', onUpdated);
  }, [loadAudits]);

  const pendingAudits = audits.filter((a) => a.status !== 'completed');
  const completedAudits = audits.filter((a) => a.status === 'completed');
  const completedCount = completedAudits.length;
  const overdueCount = pendingAudits.filter((a) => {
    if (a.dueDate === 'Not set') return false;
    const due = new Date(a.dueDate);
    return !Number.isNaN(due.getTime()) && due < new Date(new Date().toDateString());
  }).length;
  const complianceScore = audits.length
    ? Math.round((completedCount / audits.length) * 100)
    : 0;

  const severityStyle = (severity: AuditRecord['severity']) => {
    if (severity === 'urgent') return { borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)' };
    if (severity === 'attention') return { borderColor: 'var(--warning-dim)', background: 'var(--warning-bg)' };
    return { borderColor: 'var(--border)', background: 'var(--bg-panel)' };
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / Audits & Compliance</p>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Inspection & Compliance Audits
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
            Mandatory biosecurity verification, footbath protocols and entrance logs
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <button onClick={() => void loadAudits()} className="fd-btn-icon" title="Refresh audits">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            id="add-audit-btn"
            onClick={() => openModal('add-audit')}
            className="fd-btn flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Schedule Audit
          </button>
        </div>
      </div>

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="fd-card p-4">
          <span className="fd-label block mb-1">Pending</span>
          <p className="font-display text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
            {loading ? '—' : pendingAudits.length}
          </p>
          <span className="text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>Active Schedules</span>
        </div>

        <div className="fd-card p-4" style={{ borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)' }}>
          <span className="fd-label block mb-1">Overdue</span>
          <p className="font-display text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--critical)' }}>
            {loading ? '—' : overdueCount}
          </p>
          <span className="text-xs font-bold" style={{ color: 'var(--critical)', fontFamily: 'IBM Plex Mono, monospace' }}>Action Required</span>
        </div>

        <div className="fd-card p-4">
          <span className="fd-label block mb-1">Completed</span>
          <p className="font-display text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
            {loading ? '—' : completedCount}
          </p>
          <span className="text-xs font-semibold" style={{ color: 'var(--success)', fontFamily: 'IBM Plex Mono, monospace' }}>From database</span>
        </div>

        <div className="fd-card p-4" style={{ borderColor: 'var(--success-dim)', background: 'var(--success-bg)' }}>
          <span className="fd-label block mb-1">Completion</span>
          <p className="font-display text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--success)' }}>
            {loading ? '—' : `${complianceScore}%`}
          </p>
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--success)', fontFamily: 'IBM Plex Mono, monospace' }}>
            <TrendingUp className="w-3 h-3" /> Score
          </span>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="fd-card p-4 flex items-start gap-3" style={{ borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--critical)' }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--critical)' }}>Could not load audits</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={() => void loadAudits()} className="text-xs underline mt-1" style={{ color: 'var(--lime)' }}>
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Pending Audits ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="fd-label">Pending & In-Progress ({pendingAudits.length})</h2>
          <ClipboardCheck className="w-4 h-4" style={{ color: 'var(--text-dim)' }} />
        </div>

        {loading ? (
          <div className="fd-card p-5 text-sm" style={{ color: 'var(--text-dim)' }}>Loading audits from database…</div>
        ) : pendingAudits.length === 0 ? (
          <div className="fd-card p-5 text-sm" style={{ color: 'var(--text-dim)' }}>
            No pending audits. Schedule an audit to get started.
          </div>
        ) : pendingAudits.map((audit) => {
          const isUrgent = audit.severity === 'urgent';
          const isAttention = audit.severity === 'attention';
          return (
            <div
              key={audit.id}
              className="fd-card p-4 sm:p-5"
              style={severityStyle(audit.severity)}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Badge + due date */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`fd-badge ${isUrgent ? 'fd-badge-critical' : isAttention ? 'fd-badge-warning' : 'fd-badge-neutral'}`}>
                      {isUrgent ? <AlertTriangle className="w-3 h-3" /> : isAttention ? <AlertCircle className="w-3 h-3" /> : null}
                      {isUrgent ? 'Urgent' : isAttention ? 'Attention' : 'Routine'}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
                      <Clock className="w-3 h-3" /> Due: {audit.dueDate}
                    </span>
                    <span className="fd-badge fd-badge-neutral text-xs uppercase">{audit.status}</span>
                  </div>

                  <h3 className="text-base font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                    {audit.title}
                  </h3>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Mono, monospace' }}>{audit.sector}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Auditor: {audit.auditor}</p>
                  {audit.findings && <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{audit.findings}</p>}

                  {/* Progress */}
                  <div className="max-w-xs space-y-1">
                    <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
                      <span>Inspection Progress</span>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{audit.progress}%</span>
                    </div>
                    <div className="fd-progress-track">
                      <div
                        className="fd-progress-fill"
                        style={{
                          width: `${audit.progress}%`,
                          background: isUrgent ? 'var(--critical)' : isAttention ? 'var(--warning)' : 'var(--border)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openAuditInspector(audit.raw || audit)}
                  className={`fd-btn self-end sm:self-center flex items-center gap-1.5 ${isUrgent ? '' : 'fd-btn-ghost'}`}
                  style={isUrgent
                    ? { background: 'var(--critical)', borderColor: 'var(--critical)', color: '#FFFFFF' }
                    : isAttention
                    ? { borderColor: 'var(--warning-dim)', color: 'var(--warning)' }
                    : {}
                  }
                >
                  {audit.status === 'in-progress' ? 'Resume' : 'Begin Audit'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Completed Audits ── */}
      <div className="fd-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
          <h3 className="fd-label" style={{ color: 'var(--success)' }}>Recent Completed Audits</h3>
        </div>

        {loading ? (
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Loading completed audits…</p>
        ) : completedAudits.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>No completed audits recorded yet.</p>
        ) : (
          <div className="space-y-1.5">
            {completedAudits.slice(0, 5).map((audit) => (
              <div key={audit.id} className="fd-raised flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>{audit.title}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {audit.sector}{audit.createdAt ? ` · ${new Date(audit.createdAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <span className="fd-badge fd-badge-success flex-shrink-0">Completed</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};