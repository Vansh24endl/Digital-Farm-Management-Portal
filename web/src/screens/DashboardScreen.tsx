import React, { useCallback, useEffect, useState } from 'react';
import { api, type RecentChecklistActivity } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck, AlertTriangle, Building2, ClipboardList, Activity,
  ArrowUpRight, TrendingUp, ChevronRight, AlertCircle, Info, Clock,
  RefreshCw, CheckCircle2,
} from 'lucide-react';

type Farm = { _id?: string; id?: string; name?: string; farmType?: string; location?: string };
type Audit = { _id?: string; id?: string; title?: string; status?: string; dueDate?: string; riskLevel?: string; createdAt?: string; farmId?: any };
type DiseaseReport = { _id?: string; id?: string; symptoms?: string; severity?: string; status?: string; animalType?: string; createdAt?: string; farmId?: any; description?: string };

async function fetchCollection<T>(endpoint: string): Promise<T[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_token') : null;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${base}${endpoint}`, { headers });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Non-JSON response from ${endpoint} (${response.status}). Check backend route and VITE_API_URL.`);
  }
  const result = await response.json();
  if (!response.ok || result.success === false) throw new Error(result.message || `Failed to load ${endpoint}`);
  return Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
}

type Stats = {
  totalFarms: number; totalVisitors: number; totalAudits: number; pendingAudits: number;
  totalDiseaseReports: number; activeDiseaseReports: number; totalInventoryItems: number; lowStockItems: number;
};

const emptyStats: Stats = {
  totalFarms: 0, totalVisitors: 0, totalAudits: 0, pendingAudits: 0,
  totalDiseaseReports: 0, activeDiseaseReports: 0, totalInventoryItems: 0, lowStockItems: 0,
};

const emptyChecklist = {
  totalSubmissions: 0, totalItems: 0, passed: 0, warning: 0, critical: 0, compliancePercentage: 0,
};

/* ── Shared sub-components ── */
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  icon: React.ReactNode;
  loading: boolean;
  onClick?: () => void;
  accentStyle?: React.CSSProperties;
}> = ({ label, value, sub, subColor, icon, loading, onClick, accentStyle }) => (
  <button
    onClick={onClick}
    className="fd-card-hover text-left p-5 flex flex-col justify-between min-h-[120px]"
    disabled={!onClick}
  >
    <div className="flex items-center justify-between">
      <span className="fd-label">{label}</span>
      <span style={{ color: 'var(--text-primary)', ...accentStyle }}>{icon}</span>
    </div>
    <div>
      <span
        className="font-display text-4xl leading-none"
        style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}
      >
        {loading ? '—' : value}
      </span>
      {sub && (
        <p className="text-xs font-medium mt-1" style={{ color: subColor || 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
          {sub}
        </p>
      )}
    </div>
  </button>
);

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; action?: { label: string; onClick: () => void } }> = ({ title, icon, action }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <span style={{ color: 'var(--text-primary)' }}>{icon}</span>
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
        {title}
      </h3>
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="text-xs font-bold flex items-center gap-1 transition-colors hover:underline"
        style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Mono, monospace' }}
      >
        {action.label} <ChevronRight className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

export const DashboardScreen: React.FC = () => {
  const {
    navigateTo,
    userProfile,
    alerts,
    setIsAlertDrawerOpen,
    isAuthenticated,
    loginUser,
    openModal,
    t,
  } = useApp();
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [checklistSummary, setChecklistSummary] = useState(emptyChecklist);
  const [recentChecklistActivity, setRecentChecklistActivity] = useState<RecentChecklistActivity[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [diseaseReports, setDiseaseReports] = useState<DiseaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const handleQuickLogin = async (email: string, pass: string) => {
    try {
      setLoggingIn(true);
      await loginUser(email, pass);
    } catch (err: any) {
      setApiError(err?.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setApiError('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_token') : null;
    if (!token) {
      // Unauthenticated preview mode: do not trigger 401 errors
      setLoading(false);
      setApiError('');
      return;
    }

    try {
      const [summaryResponse, farmData, auditData, diseaseData] = await Promise.all([
        api.getDashboardSummary(),
        fetchCollection<Farm>('/farms'),
        fetchCollection<Audit>('/audits'),
        fetchCollection<DiseaseReport>('/disease-reports'),
      ]);

      if (!summaryResponse?.success) throw new Error('Dashboard summary could not be loaded.');

      const base = summaryResponse.data;
      const normalizedAudits = auditData.map((a) => ({ ...a, status: String(a.status || 'pending').toLowerCase() }));
      const normalizedReports = diseaseData.map((r) => ({ ...r, status: String(r.status || 'reported').toLowerCase() }));

      setFarms(farmData);
      setAudits(normalizedAudits);
      setDiseaseReports(normalizedReports);
      setStats({
        totalFarms:           Number(base.totalFarms           ?? farmData.length),
        totalVisitors:        Number(base.totalVisitors         ?? 0),
        totalAudits:          Number(base.totalAudits           ?? auditData.length),
        pendingAudits:        Number(base.pendingAudits         ?? normalizedAudits.filter((a) => a.status !== 'completed').length),
        totalDiseaseReports:  Number(base.totalDiseaseReports   ?? diseaseData.length),
        activeDiseaseReports: Number(base.activeDiseaseReports  ?? normalizedReports.filter((r) => r.status !== 'resolved').length),
        totalInventoryItems:  Number(base.totalInventoryItems   ?? 0),
        lowStockItems:        Number(base.lowStockItems         ?? 0),
      });
      setChecklistSummary(base.checklistSummary ?? emptyChecklist);
      setRecentChecklistActivity(base.recentChecklistActivity ?? []);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to connect to the backend.';
      if (msg.includes('token') || msg.includes('Access denied') || msg.includes('401')) {
        if (typeof window !== 'undefined') localStorage.removeItem('farmdrishti_token');
        setApiError('');
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
    const onUpdate = () => void loadDashboard();
    const events = [
      'farms-updated', 'visitors-updated', 'audits-updated',
      'disease-reports-updated', 'inventory-updated', 'checklist-submitted',
    ];
    events.forEach((e) => window.addEventListener(e, onUpdate));
    return () => events.forEach((e) => window.removeEventListener(e, onUpdate));
  }, [loadDashboard, isAuthenticated]);

  const urgentReports = diseaseReports.filter((r) => {
    const severity = String(r.severity || '').toLowerCase();
    return r.status !== 'resolved' && ['urgent', 'critical', 'high', 'severe'].includes(severity);
  });
  const activeReports = diseaseReports.filter((r) => r.status !== 'resolved');
  const pendingAudits = audits.filter((a) => a.status !== 'completed');
  const recentAlerts = alerts && alerts.length > 0
    ? alerts.slice(0, 5).map((a) => ({
        id: a.id,
        title: a.title,
        detail: a.message || a.location,
        severity: a.severity,
        time: a.timeAgo,
        kind: 'alert' as const,
      }))
    : [
        ...activeReports.map((r) => ({
          id: String(r._id || r.id),
          title: r.symptoms || 'Disease report',
          detail: `${r.farmId && typeof r.farmId === 'object' ? r.farmId.name || 'Farm' : 'Farm'} · ${r.animalType || 'Animal type not recorded'}`,
          severity: String(r.severity || 'unknown').toLowerCase(),
          time: r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Date not recorded',
          kind: 'disease' as const,
        })),
        ...pendingAudits.map((a) => ({
          id: String(a._id || a.id),
          title: a.title || 'Pending audit',
          detail: 'Audit requires completion',
          severity: String(a.riskLevel || 'routine').toLowerCase(),
          time: a.createdAt ? new Date(a.createdAt).toLocaleString() : 'Date not recorded',
          kind: 'audit' as const,
        })),
      ].slice(0, 5);

  const urgentCount = urgentReports.length;
  const auditScore = stats.totalAudits ? Math.round(((stats.totalAudits - stats.pendingAudits) / stats.totalAudits) * 100) : 0;
  const compliancePct = checklistSummary.compliancePercentage;

  return (
    <div className="w-full space-y-6 pb-20 animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / {t('nav.dashboard')}</p>
          <h1
            className="text-2xl sm:text-3xl font-bold leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            {t('dashboard.fieldConsole')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
            {t('dashboard.operator')}: <strong style={{ color: 'var(--text-primary)' }}>{userProfile?.name || 'Farm Manager'}</strong>
            {' · '}
            <span>
              {stats.activeDiseaseReports} {t('dashboard.alertsActive')} · {stats.pendingAudits} {t('dashboard.auditsPending')}
            </span>
          </p>
        </div>
        <button
          id="dashboard-refresh"
          onClick={() => void loadDashboard()}
          className="fd-btn-ghost self-start flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> {t('common.refresh')}
        </button>
      </div>

      {/* ── Guest Mode / Sign In Prompt ── */}
      {!isAuthenticated && (
        <div
          className="fd-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn"
          style={{
            borderColor: 'var(--lime, #a3e635)',
            background: 'rgba(163, 230, 53, 0.05)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(163, 230, 53, 0.15)', color: 'var(--lime, #a3e635)' }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {t('dashboard.lockedTitle')}
                </h4>
                <span className="fd-badge fd-badge-lime text-[10px]">{t('common.guestMode')}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t('dashboard.lockedDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openModal('auth')}
              disabled={loggingIn}
              className="px-3.5 py-1.5 rounded text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              style={{ background: 'var(--lime, #a3e635)', color: '#111311' }}
            >
              {t('common.signIn')}
            </button>
            <button
              onClick={() => void handleQuickLogin('admin@farmdrishti.org', 'Admin@1234')}
              disabled={loggingIn}
              className="fd-btn-ghost text-xs px-2.5 py-1.5 border border-dashed border-[var(--border)]"
              title="Quick login as System Admin"
            >
              {t('dashboard.demoAdmin')}
            </button>
            <button
              onClick={() => void handleQuickLogin('manager@greenvalley.farm', 'Manager@123')}
              disabled={loggingIn}
              className="fd-btn-ghost text-xs px-2.5 py-1.5 border border-dashed border-[var(--border)]"
              title="Quick login as Farm Manager"
            >
              {t('dashboard.demoManager')}
            </button>
            <button
              onClick={() => void handleQuickLogin('ananya.reyes@biosec.vet', 'VetSecret@123')}
              disabled={loggingIn}
              className="fd-btn-ghost text-xs px-2.5 py-1.5 border border-dashed border-[var(--border)]"
              title="Quick login as Veterinarian"
            >
              {t('dashboard.demoVet')}
            </button>
          </div>
        </div>
      )}

      {/* ── API Error Banner ── */}
      {apiError && (
        <div className="fd-card p-4 text-sm flex items-start gap-3" style={{ borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--critical)' }} />
          <div>
            <span style={{ color: 'var(--critical)' }}>Backend connection failed: </span>
            <span style={{ color: 'var(--text-secondary)' }}>{apiError}</span>
            <button onClick={() => void loadDashboard()} className="ml-2 underline text-xs" style={{ color: 'var(--lime)' }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ── Hero: Audit Score + Action Buttons ── */}
      <div className="fd-card p-5 sm:p-6" style={{ borderColor: stats.pendingAudits > 0 ? 'var(--warning-dim)' : 'var(--border)' }}>
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Circular gauge */}
          <button
            onClick={() => navigateTo('health')}
            className="group flex flex-col items-center text-center flex-shrink-0"
            title="Open Farm Health Overview"
          >
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="var(--border-dim)" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke={auditScore >= 80 ? 'var(--success)' : auditScore >= 60 ? 'var(--warning)' : 'var(--critical)'}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - auditScore / 100)}
                  strokeLinecap="square"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-display text-4xl leading-none group-hover:scale-105 transition-transform"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  {loading ? '—' : auditScore}
                </span>
                <span className="fd-label mt-1">Audit %</span>
              </div>
            </div>
            <span
              className="mt-2 text-xs font-semibold px-3 py-1"
              style={{
                background: stats.pendingAudits ? 'var(--warning-bg)' : 'var(--success-bg)',
                color: stats.pendingAudits ? 'var(--warning)' : 'var(--success)',
                border: `1px solid ${stats.pendingAudits ? 'var(--warning-dim)' : 'var(--success-dim)'}`,
                borderRadius: '2px',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              <ShieldCheck className="w-3 h-3 inline-block mr-1" />
              {stats.pendingAudits ? `${stats.pendingAudits} Pending` : 'No Pending Audits'}
            </span>
          </button>

          {/* Text + actions */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div>
              <span
                className="fd-badge fd-badge-lime inline-flex mb-2"
              >
                <Activity className="w-3 h-3" /> Live Monitoring
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold leading-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
              >
                Biosecurity Defense Surveillance
              </h2>
              <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {stats.activeDiseaseReports > 0
                  ? `${stats.activeDiseaseReports} active disease reports require attention.`
                  : 'No active disease reports. All systems operational.'
                }
                {' '}{stats.pendingAudits > 0 ? `${stats.pendingAudits} audits pending review.` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <button onClick={() => navigateTo('health')} className="fd-btn flex items-center gap-1.5">
                Farm Health <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => navigateTo('surveillance')} className="fd-btn-ghost flex items-center gap-1.5">
                Surveillance Map
              </button>
              <button onClick={() => navigateTo('checklist')} className="fd-btn-ghost flex items-center gap-1.5">
                Run Checklist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label={t('dashboard.totalFarms')}
          value={stats.totalFarms}
          sub="Registered units"
          loading={loading}
          icon={<Building2 className="w-4 h-4" />}
          onClick={() => navigateTo('profile')}
        />
        <MetricCard
          label={t('dashboard.diseaseCases')}
          value={stats.activeDiseaseReports}
          sub={`${urgentCount} urgent`}
          subColor={urgentCount > 0 ? 'var(--critical)' : 'var(--text-secondary)'}
          loading={loading}
          icon={<AlertTriangle className="w-4 h-4" />}
          onClick={() => navigateTo('surveillance')}
          accentStyle={{ color: urgentCount > 0 ? 'var(--critical)' : 'var(--lime)' }}
        />
        <MetricCard
          label={t('dashboard.totalAudits')}
          value={stats.totalAudits}
          sub={`${stats.pendingAudits} ${t('dashboard.auditsPending')}`}
          subColor={stats.pendingAudits > 0 ? 'var(--warning)' : 'var(--text-secondary)'}
          loading={loading}
          icon={<ClipboardList className="w-4 h-4" />}
          onClick={() => navigateTo('audits')}
        />
        <MetricCard
          label={t('dashboard.inventoryItems')}
          value={stats.totalInventoryItems}
          sub={`${stats.lowStockItems} ${t('dashboard.lowStock')}`}
          subColor={stats.lowStockItems > 0 ? 'var(--warning)' : 'var(--text-secondary)'}
          loading={loading}
          icon={<Activity className="w-4 h-4" />}
          onClick={() => navigateTo('inventory')}
        />
      </div>

      {/* ── Two-column layout for compliance + alerts ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* ── Checklist Compliance Panel (3/5) ── */}
        <section className="xl:col-span-3">
          <SectionHeader
            title="Biosecurity Checklist Compliance"
            icon={<ClipboardList className="w-4 h-4" />}
            action={{ label: 'Open Checklist', onClick: () => navigateTo('checklist') }}
          />

          {loading ? (
            <div className="fd-card p-5 text-sm" style={{ color: 'var(--text-dim)' }}>Loading checklist stats…</div>
          ) : checklistSummary.totalSubmissions === 0 ? (
            <div className="fd-card p-5 text-sm" style={{ color: 'var(--text-dim)' }}>
              No checklist submissions recorded yet. Submit your first daily biosecurity checklist to track compliance.
            </div>
          ) : (
            <div className="fd-card p-5 space-y-4">
              {/* Score row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="fd-label mb-1">Overall Compliance Rate</p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-display text-5xl leading-none"
                      style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}
                    >
                      {compliancePct}%
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
                      {checklistSummary.passed}/{checklistSummary.totalItems} items
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    Across {checklistSummary.totalSubmissions} submission{checklistSummary.totalSubmissions !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <span className="fd-badge fd-badge-success">
                    <CheckCircle2 className="w-3 h-3" /> {checklistSummary.passed} Passed
                  </span>
                  {checklistSummary.warning > 0 && (
                    <span className="fd-badge fd-badge-warning">
                      <AlertCircle className="w-3 h-3" /> {checklistSummary.warning} Warning
                    </span>
                  )}
                  {checklistSummary.critical > 0 && (
                    <span className="fd-badge fd-badge-critical">
                      <AlertTriangle className="w-3 h-3" /> {checklistSummary.critical} Critical
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="fd-progress-track">
                <div
                  className="fd-progress-fill"
                  style={{
                    width: `${compliancePct}%`,
                    background: compliancePct >= 80 ? 'var(--success)' : compliancePct >= 60 ? 'var(--warning)' : 'var(--critical)',
                  }}
                />
              </div>

              {/* Recent submissions */}
              {recentChecklistActivity.length > 0 && (
                <div>
                  <p className="fd-label mb-2">Recent Submissions</p>
                  <div className="space-y-1.5">
                    {recentChecklistActivity.map((item) => {
                      const pct = item.summary.total > 0
                        ? Math.round((item.summary.passed / item.summary.total) * 100)
                        : 0;
                      return (
                        <div
                          key={item._id}
                          className="fd-raised flex items-center justify-between gap-3 px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{item.zone}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
                              {item.farmName} · {new Date(item.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Mono, monospace' }}>{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Active Bio-Alert Feed (2/5) ── */}
        <section className="xl:col-span-2">
          <SectionHeader
            title="Active Bio-Alerts"
            icon={<AlertTriangle className="w-4 h-4" style={{ color: 'var(--critical)' }} />}
            action={{ label: 'Surveillance', onClick: () => navigateTo('surveillance') }}
          />

          {loading ? (
            <div className="fd-card p-5 text-sm" style={{ color: 'var(--text-dim)' }}>Loading alerts…</div>
          ) : recentAlerts.length === 0 ? (
            <div className="fd-card p-5 text-sm" style={{ color: 'var(--text-dim)' }}>
              No active alerts or pending audits.
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((alert) => {
                const urgent = ['urgent', 'critical', 'high', 'severe'].includes(alert.severity);
                const attention = ['attention', 'medium', 'moderate'].includes(alert.severity);
                const borderColor = urgent ? 'var(--critical-dim)' : attention ? 'var(--warning-dim)' : 'var(--border)';
                const bgColor = urgent ? 'var(--critical-bg)' : attention ? 'var(--warning-bg)' : 'var(--bg-panel)';

                return (
                  <div
                    key={`${alert.kind}-${alert.id}`}
                    className="fd-card p-4 flex flex-col gap-2.5"
                    style={{ borderColor, background: bgColor }}
                  >
                    <div className="flex items-start gap-2.5">
                      <span style={{ color: urgent ? 'var(--critical)' : attention ? 'var(--warning)' : 'var(--text-secondary)' }}>
                        {urgent ? <AlertTriangle className="w-4 h-4" /> : attention ? <AlertCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="fd-label mb-0.5">
                          {alert.kind === 'disease' ? 'Disease Report' : 'Audit'}
                        </p>
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{alert.title}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{alert.detail}</p>
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
                          <Clock className="w-3 h-3" /> {alert.time}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (alert.kind === 'alert') {
                          setIsAlertDrawerOpen(true);
                        } else {
                          navigateTo(alert.kind === 'disease' ? 'reports' : 'audits');
                        }
                      }}
                      className="fd-btn-ghost text-xs w-full justify-center"
                    >
                      Review <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── Monitored Farm Units ── */}
      <section>
        <SectionHeader
          title="Monitored Farm Units"
          icon={<Building2 className="w-4 h-4" />}
          action={{ label: 'Farm Health', onClick: () => navigateTo('health') }}
        />
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Loading farms…</p>
        ) : farms.length === 0 ? (
          <div className="fd-card p-5 text-sm" style={{ color: 'var(--text-dim)' }}>No farms registered yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {farms.slice(0, 4).map((farm) => {
              const farmId = String(farm._id || farm.id);
              const farmReports = diseaseReports.filter(
                (r) => String(r.farmId && typeof r.farmId === 'object' ? r.farmId._id : r.farmId) === farmId && r.status !== 'resolved'
              );
              const hasIssues = farmReports.length > 0;
              return (
                <div key={farmId} className="fd-card-hover p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                        {farm.name || 'Unnamed farm'}
                      </h4>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
                        {farm.farmType || 'Farm'}{farm.location ? ` · ${farm.location}` : ''}
                      </p>
                    </div>
                    <span className={`fd-badge ${hasIssues ? 'fd-badge-warning' : 'fd-badge-success'}`}>
                      {hasIssues ? `${farmReports.length} open` : 'Clear'}
                    </span>
                  </div>
                  <div className="fd-divider" />
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Total reports: <strong style={{ color: 'var(--text-primary)' }}>
                        {diseaseReports.filter((r) => String(r.farmId && typeof r.farmId === 'object' ? r.farmId._id : r.farmId) === farmId).length}
                      </strong>
                    </span>
                    <button onClick={() => navigateTo('health')} className="fd-btn-ghost text-xs py-1 px-3">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Database Totals ── */}
      {!loading && checklistSummary.totalSubmissions > 0 && (
        <section className="fd-card p-5">
          <SectionHeader
            title="Database Totals at a Glance"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Disease Reports', value: stats.totalDiseaseReports, color: 'var(--critical)' },
              { label: 'Audit Sessions',  value: stats.totalAudits,          color: 'var(--text-primary)' },
              { label: 'Checklist Submissions', value: checklistSummary.totalSubmissions, color: 'var(--success)' },
              { label: 'Visitor Records', value: stats.totalVisitors,        color: 'var(--warning)' },
            ].map(({ label, value, color }) => (
              <div key={label} className="fd-raised p-4 text-center">
                <p
                  className="font-display text-3xl font-bold leading-none"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', color }}
                >
                  {value}
                </p>
                <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>{label}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};