import React, { useCallback, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Download, ShieldCheck, CheckCircle2, Users, Package, Activity,
  ArrowUpRight, RefreshCw,
} from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

type Report = {
  id: string;
  farmName: string;
  animalType: string;
  symptoms: string;
  description?: string;
  severity: string;
  status: string;
  createdAt?: string;
};

type Audit = { id: string; status: string };
type Visitor = { id: string; checkOut?: string | null };
type InventoryItem = { id: string; quantity: number; minimumStock: number };

async function getData<T>(endpoint: string): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_token') : null;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`API returned a non-JSON response for ${endpoint} (${response.status}). Check backend URL.`);
  }
  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Failed to load ${endpoint}`);
  }
  return result.data as T;
}

function dateLabel(value?: string) {
  if (!value) return 'Date not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not recorded' : date.toLocaleDateString();
}

export const ReportsScreen: React.FC = () => {
  const { openModal } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [reportData, auditData, visitorData, inventoryData] = await Promise.all([
        getData<any[]>('/disease-reports'),
        getData<any[]>('/audits'),
        getData<any[]>('/visitors'),
        getData<any[]>('/inventory'),
      ]);
      setReports((Array.isArray(reportData) ? reportData : []).map((r: any) => ({
        id: String(r._id || r.id),
        farmName: r.farmId && typeof r.farmId === 'object' ? r.farmId.name || 'Farm' : 'Farm',
        animalType: String(r.animalType || 'unknown'),
        symptoms: String(r.diseaseName || r.symptoms || 'Observed clinical signs'),
        description: r.description ? String(r.description) : '',
        severity: String(r.severity || 'unknown'),
        status: String(r.status || 'reported'),
        createdAt: r.createdAt,
      })));
      setAudits((Array.isArray(auditData) ? auditData : []).map((a: any) => ({
        id: String(a._id || a.id), status: String(a.status || 'pending').toLowerCase(),
      })));
      setVisitors((Array.isArray(visitorData) ? visitorData : []).map((v: any) => ({
        id: String(v._id || v.id), checkOut: v.checkOut || null,
      })));
      setInventory((Array.isArray(inventoryData) ? inventoryData : []).map((i: any) => ({
        id: String(i._id || i.id), quantity: Number(i.quantity || 0), minimumStock: Number(i.minimumStock || 0),
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
    const onUpdate = () => void loadReports();
    ['disease-reports-updated', 'audits-updated', 'visitors-updated', 'inventory-updated'].forEach((eventName) =>
      window.addEventListener(eventName, onUpdate)
    );
    return () => {
      ['disease-reports-updated', 'audits-updated', 'visitors-updated', 'inventory-updated'].forEach((eventName) =>
        window.removeEventListener(eventName, onUpdate)
      );
    };
  }, [loadReports]);

  const completedAudits = audits.filter((a) => a.status === 'completed').length;
  const auditScore = audits.length ? Math.round((completedAudits / audits.length) * 100) : 0;
  const visitorsCheckedIn = visitors.filter((v) => !v.checkOut).length;
  const lowStock = inventory.filter((i) => i.quantity <= i.minimumStock).length;
  const reportedCount = reports.filter((r) => r.status === 'reported').length;
  const investigatingCount = reports.filter((r) => r.status === 'investigating').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  return (
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / Compliance Intelligence</p>
          <h1
            className="text-2xl font-bold font-display"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Reports & Analytics
          </h1>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            Biosecurity compliance aggregates, disease epidemiology & certification metrics
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button onClick={() => void loadReports()} className="fd-btn-icon" title="Refresh analytics data">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openModal('pdf-export')}
            className="fd-btn flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-sm bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-xs font-mono text-[var(--critical)] flex items-center justify-between">
          <span>Failed to load live report database: {error}</span>
          <button onClick={() => void loadReports()} className="underline ml-2">Retry</button>
        </div>
      )}

      {/* ── High-Level Dial Summary Card ── */}
      <div className="fd-card p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center text-center flex-shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" role="img" aria-label={`Audit completion score ${auditScore}%`}>
                <circle cx="50" cy="50" r="42" stroke="var(--border-dim)" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke="var(--lime)"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - auditScore / 100)}
                  strokeLinecap="square"
                  fill="transparent"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {loading ? '…' : `${auditScore}%`}
                </span>
                <span className="fd-label text-[9px] mt-0.5">
                  AUDIT INDEX
                </span>
              </div>
            </div>
            <span className="mt-2 text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
              Completed / Total Audits
            </span>
          </div>

          <div className="flex-1 space-y-2.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5">
              <span className="fd-badge fd-badge-success">
                <ShieldCheck className="w-3.5 h-3.5" /> Database Synced
              </span>
              <span className="fd-badge fd-badge-neutral">
                Real-Time Aggregates
              </span>
            </div>
            <h3 className="text-xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              Comprehensive Biosecurity Surveillance Report
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Aggregated from verified electronic decontamination checklists, perimeter access barrier logs, and pathogen symptom incident records across all active facilities.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4 Module Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="fd-card p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
              <h4 className="text-xs font-bold font-mono uppercase" style={{ color: 'var(--text-primary)' }}>Audit Index</h4>
            </div>
            <span className="fd-badge fd-badge-lime">{loading ? '…' : `${auditScore}%`}</span>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {completedAudits} completed / {audits.length} recorded
          </p>
          <button onClick={() => openModal('pdf-export')} className="text-xs font-mono font-bold flex items-center gap-1 hover:underline pt-1" style={{ color: 'var(--text-primary)' }}>
            Export Audits <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="fd-card p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4" style={{ color: 'var(--critical)' }} />
              <h4 className="text-xs font-bold font-mono uppercase" style={{ color: 'var(--text-primary)' }}>Surveillance</h4>
            </div>
            <span className="fd-badge fd-badge-critical">{loading ? '…' : `${reportedCount} Active`}</span>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {investigatingCount} testing · {resolvedCount} resolved
          </p>
          <button onClick={() => openModal('add-case')} className="text-xs font-mono font-bold flex items-center gap-1 hover:underline pt-1" style={{ color: 'var(--critical)' }}>
            Report New Case <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="fd-card p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" style={{ color: 'var(--success)' }} />
              <h4 className="text-xs font-bold font-mono uppercase" style={{ color: 'var(--text-primary)' }}>Visitor Log</h4>
            </div>
            <span className="fd-badge fd-badge-success">{loading ? '…' : `${visitorsCheckedIn} On-Site`}</span>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {visitors.length} total logged entrants
          </p>
          <button onClick={() => openModal('pdf-export')} className="text-xs font-mono font-bold flex items-center gap-1 hover:underline pt-1" style={{ color: 'var(--success)' }}>
            Export Bio-Passes <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="fd-card p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4" style={{ color: 'var(--warning)' }} />
              <h4 className="text-xs font-bold font-mono uppercase" style={{ color: 'var(--text-primary)' }}>Depot Stock</h4>
            </div>
            <span className={`fd-badge ${lowStock > 0 ? 'fd-badge-warning' : 'fd-badge-success'}`}>
              {loading ? '…' : `${lowStock} Low Stock`}
            </span>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {inventory.length} total tracked SKUs
          </p>
          <button onClick={() => openModal('pdf-export')} className="text-xs font-mono font-bold flex items-center gap-1 hover:underline pt-1" style={{ color: 'var(--warning)' }}>
            Export Inventory <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ── Recent Disease Incident Log Table ── */}
      <section className="fd-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            Recent Pathogen Vector & Disease Incident Stream
          </h3>
          <span className="fd-badge fd-badge-neutral">
            {loading ? 'Loading…' : `${reports.length} Records In MongoDB`}
          </span>
        </div>

        {loading ? (
          <p className="text-xs font-mono text-[var(--text-dim)]">Loading records from database…</p>
        ) : reports.length === 0 ? (
          <p className="text-xs font-mono text-[var(--text-dim)] p-4 text-center">No disease incidents logged in the database yet.</p>
        ) : (
          <div className="space-y-2">
            {reports.slice(0, 10).map((report) => (
              <div
                key={report.id}
                className="p-3 rounded-sm fd-raised flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">{report.symptoms}</p>
                  <p className="text-[11px] font-mono text-[var(--text-secondary)] mt-0.5">
                    {report.farmName} · Species: {report.animalType} · Logged: {dateLabel(report.createdAt)}
                  </p>
                  {report.description && (
                    <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">{report.description}</p>
                  )}
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                  <span className={`fd-badge ${report.severity.toLowerCase() === 'high' ? 'fd-badge-critical' : report.severity.toLowerCase() === 'low' ? 'fd-badge-neutral' : 'fd-badge-warning'}`}>
                    {report.severity}
                  </span>
                  <span className="fd-badge fd-badge-neutral">
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
