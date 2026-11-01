import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Users,
  Package,
  RefreshCw,
  Search,
  Calendar,
  Building2,
  UserCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  ShieldAlert,
} from 'lucide-react';

type DateFilterPreset = 'all' | 'today' | '7d' | '30d' | '90d' | 'custom';

export const ReportsScreen: React.FC = () => {
  const { openModal, showToast } = useApp();

  // Filters state
  const [preset, setPreset] = useState<DateFilterPreset>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [reportType, setReportType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 10;

  // Data states
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [farmAnalytics, setFarmAnalytics] = useState<any>(null);
  const [auditAnalytics, setAuditAnalytics] = useState<any>(null);
  const [complianceAnalytics, setComplianceAnalytics] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [farmsList, setFarmsList] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch farms list for filter dropdown
  useEffect(() => {
    api.getFarms()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setFarmsList(
          list.map((f: any) => ({
            id: String(f._id || f.id),
            name: String(f.name || 'Unnamed Farm'),
          }))
        );
      })
      .catch(() => {});
  }, []);

  // Compute query parameters for API calls
  const getFilterParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (preset !== 'all' && preset !== 'custom') {
      params.timeRange = preset;
    } else if (preset === 'custom') {
      if (customStart) params.startDate = customStart;
      if (customEnd) params.endDate = customEnd;
    }
    if (selectedFarm !== 'all') params.farmId = selectedFarm;
    if (selectedRole !== 'all') params.role = selectedRole;
    if (selectedStatus !== 'all') params.status = selectedStatus;
    if (reportType !== 'all') params.type = reportType;
    if (searchTerm.trim()) params.search = searchTerm.trim();
    return params;
  }, [preset, customStart, customEnd, selectedFarm, selectedRole, selectedStatus, reportType, searchTerm]);

  // Load all analytics data
  const loadAllAnalytics = useCallback(async () => {
    setLoading(true);
    const filterParams = getFilterParams();

    try {
      const [ovRes, uRes, fRes, aRes, cRes, rRes] = await Promise.all([
        api.getAdminAnalyticsOverview(filterParams),
        api.getAdminAnalyticsUsers(filterParams),
        api.getAdminAnalyticsFarms(filterParams),
        api.getAdminAnalyticsAudits(filterParams),
        api.getAdminAnalyticsCompliance(filterParams),
        api.getAdminReports({ ...filterParams, page, limit }),
      ]);

      if (ovRes?.success) setOverview(ovRes.data);
      if (uRes?.success) setUserAnalytics(uRes.data);
      if (fRes?.success) setFarmAnalytics(fRes.data);
      if (aRes?.success) setAuditAnalytics(aRes.data);
      if (cRes?.success) setComplianceAnalytics(cRes.data);
      if (rRes?.success) {
        setReportsData(rRes.data || []);
        if (rRes.pagination) setPagination(rRes.pagination);
      }
    } catch (err: any) {
      console.error('Failed to load admin reports data:', err);
      showToast(err.message || 'Failed to load live reports data.');
    } finally {
      setLoading(false);
    }
  }, [getFilterParams, page, limit, showToast]);

  // Trigger load on filter or page change
  useEffect(() => {
    void loadAllAnalytics();
  }, [loadAllAnalytics]);

  // CSV Export Handler
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const filterParams = getFilterParams();
      await api.downloadAdminReportsCsv(filterParams);
      showToast('CSV Compliance Report downloaded successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to export CSV report.');
    } finally {
      setExporting(false);
    }
  };

  // Helper values
  const users = overview?.users || {
    total: 0,
    farmers: 0,
    veterinarians: 0,
    inspectors: 0,
    admins: 0,
    veterinarianVerification: { verified: 0, pending: 0, rejected: 0 },
  };
  const farms = overview?.farms || { total: 0, highRiskCount: 0, lowRiskCount: 0, highRiskFarms: [] };
  const audits = overview?.audits || { total: 0, completed: 0, pending: 0, inProgress: 0, completionRate: 0 };
  const visitors = overview?.visitors || { total: 0, currentlyOnSite: 0 };
  const inventory = overview?.inventory || { totalSKUs: 0, lowStockSKUs: 0 };
  const compliance = overview?.compliance || { score: 100, checklistMetrics: {} };

  return (
    <div className="space-y-6 pb-24 animate-fadeIn font-sans text-left">
      {/* ── Page Header & Quick Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="fd-label">FarmDrishti Intelligence Suite</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-mono border border-[var(--lime)]/30 bg-[var(--lime)]/10 text-[var(--lime)]">
              <ShieldCheck className="w-3 h-3" /> LIVE MONGODB FEED
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Admin Reports & Analytics
          </h1>
          <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
            Enterprise biosecurity compliance metrics, pathogen epidemiology & operational audit logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void loadAllAnalytics()}
            disabled={loading}
            className="fd-btn-icon flex items-center justify-center"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="fd-btn flex items-center gap-1.5 text-xs font-mono font-bold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>

          <button
            onClick={() => openModal('pdf-export')}
            className="fd-btn flex items-center gap-1.5 text-xs font-mono font-bold"
            style={{ background: 'var(--lime)', color: '#0a0d08', border: 'none' }}
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* ── Analytics Filter Bar ── */}
      <div className="fd-card p-4 space-y-3.5 border border-[var(--border-dim)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border-dim)] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)]">
            <Calendar className="w-4 h-4 text-[var(--lime)]" />
            <span className="font-bold uppercase tracking-wider">Date Range Filter:</span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { label: 'All Time', val: 'all' },
                { label: 'Today', val: 'today' },
                { label: 'Last 7 Days', val: '7d' },
                { label: 'Last 30 Days', val: '30d' },
                { label: 'Last 90 Days', val: '90d' },
                { label: 'Custom Range', val: 'custom' },
              ] as const
            ).map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => {
                  setPreset(item.val);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-sm transition-colors ${
                  preset === item.val
                    ? 'bg-[var(--lime)] text-black font-bold'
                    : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-dim)] hover:border-[var(--lime)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers */}
        {preset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono bg-[var(--bg-main)] p-2.5 rounded-sm border border-[var(--border-dim)]">
            <span className="text-[var(--text-dim)]">Custom Period:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-secondary)]">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setPage(1);
                }}
                className="fd-input px-2 py-1 text-xs rounded-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--text-secondary)]">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value);
                  setPage(1);
                }}
                className="fd-input px-2 py-1 text-xs rounded-sm"
              />
            </div>
          </div>
        )}

        {/* Operational Entity Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Farm Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[var(--text-dim)] uppercase flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[var(--lime)]" /> Filter By Farm Facility
            </label>
            <select
              value={selectedFarm}
              onChange={(e) => {
                setSelectedFarm(e.target.value);
                setPage(1);
              }}
              className="fd-input w-full px-2.5 py-1.5 text-xs rounded-sm"
            >
              <option value="all">All Farm Facilities (Full Cluster)</option>
              {farmsList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Role Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[var(--text-dim)] uppercase flex items-center gap-1">
              <Users className="w-3 h-3 text-[var(--lime)]" /> Filter By User Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              className="fd-input w-full px-2.5 py-1.5 text-xs rounded-sm"
            >
              <option value="all">All User Roles</option>
              <option value="farm_manager">Farmers (Farm Managers)</option>
              <option value="veterinarian">Field Veterinarians</option>
              <option value="inspector">Biosecurity Inspectors</option>
              <option value="admin">System Administrators</option>
            </select>
          </div>

          {/* Audit Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-[var(--text-dim)] uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[var(--lime)]" /> Filter By Audit Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="fd-input w-full px-2.5 py-1.5 text-xs rounded-sm"
            >
              <option value="all">All Audit Statuses</option>
              <option value="completed">Completed Audits</option>
              <option value="in-progress">In-Progress Audits</option>
              <option value="pending">Pending Audits</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── SECTION A: Real Database Statistics (KPI Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Users & Workforce */}
        <div className="fd-card p-4 space-y-2 border border-[var(--border-dim)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[var(--lime)]" />
              <span className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">Workforce</span>
            </div>
            <span className="fd-badge fd-badge-lime">{users.total} Total</span>
          </div>
          <div className="space-y-1 pt-1 font-mono text-xs">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Farmers:</span> <span className="font-bold text-[var(--text-primary)]">{users.farmers}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Veterinarians:</span> <span className="font-bold text-[var(--text-primary)]">{users.veterinarians}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Inspectors:</span> <span className="font-bold text-[var(--text-primary)]">{users.inspectors}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Administrators:</span> <span className="font-bold text-[var(--text-primary)]">{users.admins}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Veterinarian Verification */}
        <div className="fd-card p-4 space-y-2 border border-[var(--border-dim)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">Veterinarians</span>
            </div>
            <span className="fd-badge fd-badge-neutral">{users.veterinarians} Enrolled</span>
          </div>
          <div className="space-y-1 pt-1 font-mono text-xs">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Verified Credentials:</span>
              <span className="font-bold text-emerald-400">
                {users.veterinarianVerification?.verified || 0}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Pending Review:</span>
              <span className="font-bold text-amber-400">
                {users.veterinarianVerification?.pending || 0}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Rejected / Flagged:</span>
              <span className="font-bold text-rose-400">
                {users.veterinarianVerification?.rejected || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Farms & Risk Index */}
        <div className="fd-card p-4 space-y-2 border border-[var(--border-dim)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">Farms Monitored</span>
            </div>
            <span className="fd-badge fd-badge-neutral">{farms.total} Registered</span>
          </div>
          <div className="space-y-1 pt-1 font-mono text-xs">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Low-Risk Facilities:</span>
              <span className="font-bold text-emerald-400">{farms.lowRiskCount}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>High-Risk Facilities:</span>
              <span className="font-bold text-rose-400">{farms.highRiskCount}</span>
            </div>
            <div className="text-[11px] text-[var(--text-dim)] pt-0.5">
              {farms.highRiskCount > 0 ? 'Active outbreak quarantine or audit flag' : 'All facilities optimal'}
            </div>
          </div>
        </div>

        {/* Metric 4: Biosecurity Audits & Compliance */}
        <div className="fd-card p-4 space-y-2 border border-[var(--border-dim)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--lime)]" />
              <span className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">Audit Index</span>
            </div>
            <span className="fd-badge fd-badge-lime">{compliance.score}% Index</span>
          </div>
          <div className="space-y-1 pt-1 font-mono text-xs">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Total Audits:</span>
              <span className="font-bold text-[var(--text-primary)]">{audits.total}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Completed / Active:</span>
              <span className="font-bold text-emerald-400">{audits.completed} / {audits.inProgress}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Pending Action:</span>
              <span className="font-bold text-amber-400">{audits.pending}</span>
            </div>
          </div>
        </div>

        {/* Metric 5: Inventory SKUs & Stock Status */}
        <div className="fd-card p-4 space-y-2 border border-[var(--border-dim)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">Depot Stock</span>
            </div>
            <span className={`fd-badge ${inventory.lowStockSKUs > 0 ? 'fd-badge-warning' : 'fd-badge-success'}`}>
              {inventory.lowStockSKUs} Low
            </span>
          </div>
          <div className="space-y-1 pt-1 font-mono text-xs">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Tracked SKUs:</span>
              <span className="font-bold text-[var(--text-primary)]">{inventory.totalSKUs}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Low-Stock Threshold:</span>
              <span className="font-bold text-amber-400">{inventory.lowStockSKUs} SKUs</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Gate Visitors:</span>
              <span className="font-bold text-emerald-400">{visitors.total} logged</span>
            </div>
          </div>
        </div>
      </div>

      {/* High-Risk Farms Alert Banner (if any) */}
      {farms.highRiskFarms && farms.highRiskFarms.length > 0 && (
        <div className="p-4 rounded-sm border border-rose-500/30 bg-rose-500/10 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>High-Risk Biosecurity Alert: {farms.highRiskFarms.length} Facilities Requiring Containment Inspection</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {farms.highRiskFarms.map((f: any) => (
              <div key={f.id} className="p-2.5 rounded-sm bg-[var(--card-bg)] border border-rose-500/20 text-xs font-mono">
                <div className="font-bold text-[var(--text-primary)]">{f.name}</div>
                <div className="text-[11px] text-[var(--text-secondary)]">{f.location} · {f.farmType}</div>
                <div className="text-[10px] text-rose-400 mt-1">
                  {f.hasActiveOutbreak ? '⚠️ High-severity pathogen outbreak' : '⚠️ Urgent audit non-compliance'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION B: Useful Analytics Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart 1 & 2: User & Farm Registration Trends */}
        <div className="lg:col-span-7 fd-card p-5 space-y-4 border border-[var(--border-dim)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--lime)]" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
                Registration & Growth Trends
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--text-dim)]">Timeline Series</span>
          </div>

          {/* SVG Trend Chart */}
          <div className="h-52 w-full flex flex-col justify-end">
            {userAnalytics?.registrationTrends && userAnalytics.registrationTrends.length > 0 ? (
              <div className="h-full w-full flex items-end gap-2 pt-6">
                {userAnalytics.registrationTrends.map((t: any, idx: number) => {
                  const maxCount = Math.max(...userAnalytics.registrationTrends.map((x: any) => x.count), 5);
                  const heightPercent = Math.max(15, Math.round((t.count / maxCount) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <span className="text-[10px] font-mono text-[var(--text-dim)] opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.count}
                      </span>
                      <div
                        className="w-full rounded-xs transition-all duration-500 relative"
                        style={{
                          height: `${heightPercent}%`,
                          background: 'linear-gradient(180deg, var(--lime) 0%, rgba(163, 230, 53, 0.2) 100%)',
                          borderTop: '2px solid var(--lime)',
                        }}
                      />
                      <span className="text-[9px] font-mono text-[var(--text-dim)] truncate max-w-[48px]">
                        {t.date?.slice(5) || `T-${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-xs font-mono text-[var(--text-dim)]">
                <span>No registration activity during this selected period.</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-dim)] pt-2 border-t border-[var(--border-dim)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[var(--lime)]" /> User Registrations
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" /> Monitored Farms
              </span>
            </div>
            <span>MongoDB Aggregate</span>
          </div>
        </div>

        {/* Chart 3: Farm Compliance Distribution & Risk Ratio */}
        <div className="lg:col-span-5 fd-card p-5 space-y-4 border border-[var(--border-dim)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
                  Compliance Distribution
                </h3>
              </div>
              <span className="fd-badge fd-badge-lime">{compliance.score}% Score</span>
            </div>

            {/* Compliance Distribution Bars */}
            <div className="space-y-3 pt-2">
              {complianceAnalytics?.distribution ? (
                complianceAnalytics.distribution.map((band: any, i: number) => {
                  const total = farms.total || 1;
                  const pct = Math.round((band.count / total) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-[var(--text-secondary)]">{band.name}</span>
                        <span className="font-bold text-[var(--text-primary)]">
                          {band.count} farms ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-dim)]">
                        <div
                          className="h-full transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.max(8, pct))}%`, background: band.color }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs font-mono text-[var(--text-dim)]">Loading compliance spectrum...</div>
              )}
            </div>
          </div>

          {/* Risk Dial Overview & Farm Types */}
          <div className="p-3 rounded-sm bg-[var(--bg-main)] border border-[var(--border-dim)] mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-dim)]">High-Risk vs Low-Risk:</span>
              <span className="font-bold text-[var(--text-primary)]">
                {farms.highRiskCount} High / {farms.lowRiskCount} Low
              </span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden border border-[var(--border-dim)]">
              <div
                className="bg-rose-500 transition-all duration-500"
                style={{ width: `${farms.total > 0 ? (farms.highRiskCount / farms.total) * 100 : 0}%` }}
              />
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${farms.total > 0 ? (farms.lowRiskCount / farms.total) * 100 : 100}%` }}
              />
            </div>
            {farmAnalytics?.types && farmAnalytics.types.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--border-dim)] text-[10px] font-mono text-[var(--text-secondary)]">
                {farmAnalytics.types.map((t: any, idx: number) => (
                  <span key={idx} className="capitalize">
                    {t.type}: <strong className="text-[var(--text-primary)]">{t.count}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Biosecurity Audit Completion Trends */}
        <div className="lg:col-span-6 fd-card p-5 space-y-4 border border-[var(--border-dim)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
                Audit Completion Progress
              </h3>
            </div>
            <span className="fd-badge fd-badge-neutral">{audits.completionRate}% Done</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="p-3 rounded-sm bg-[var(--bg-main)] border border-[var(--border-dim)]">
              <div className="text-xl font-bold font-display text-emerald-400">{audits.completed}</div>
              <div className="text-[10px] font-mono uppercase text-[var(--text-dim)] mt-0.5">Completed</div>
            </div>
            <div className="p-3 rounded-sm bg-[var(--bg-main)] border border-[var(--border-dim)]">
              <div className="text-xl font-bold font-display text-amber-400">{audits.inProgress}</div>
              <div className="text-[10px] font-mono uppercase text-[var(--text-dim)] mt-0.5">In-Progress</div>
            </div>
            <div className="p-3 rounded-sm bg-[var(--bg-main)] border border-[var(--border-dim)]">
              <div className="text-xl font-bold font-display text-rose-400">{audits.pending}</div>
              <div className="text-[10px] font-mono uppercase text-[var(--text-dim)] mt-0.5">Pending</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-[var(--text-secondary)]">
              <span>Cluster Audit Resolution:</span>
              <span className="font-bold text-[var(--text-primary)]">{audits.completed} of {audits.total} audits</span>
            </div>
            <div className="h-2.5 w-full bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-dim)] flex">
              <div
                className="bg-emerald-400 transition-all duration-500"
                style={{ width: `${audits.total > 0 ? (audits.completed / audits.total) * 100 : 0}%` }}
              />
              <div
                className="bg-amber-400 transition-all duration-500"
                style={{ width: `${audits.total > 0 ? (audits.inProgress / audits.total) * 100 : 0}%` }}
              />
              <div
                className="bg-rose-400 transition-all duration-500"
                style={{ width: `${audits.total > 0 ? (audits.pending / audits.total) * 100 : 0}%` }}
              />
            </div>
            {auditAnalytics?.riskDistribution && auditAnalytics.riskDistribution.length > 0 && (
              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] pt-1">
                <span>Risk Levels:</span>
                <div className="flex gap-2">
                  {auditAnalytics.riskDistribution.map((rd: any, idx: number) => (
                    <span key={idx} className="capitalize">
                      {rd.riskLevel}: <strong className="text-[var(--text-primary)]">{rd.count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 5: User Role & Veterinarian Verification Distribution */}
        <div className="lg:col-span-6 fd-card p-5 space-y-4 border border-[var(--border-dim)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[var(--lime)]" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
                User Role Distribution
              </h3>
            </div>
            <span className="text-xs font-mono text-[var(--text-dim)]">{users.total} Total Staff</span>
          </div>

          <div className="space-y-2 pt-1">
            {userAnalytics?.roleDistribution ? (
              userAnalytics.roleDistribution.map((r: any, i: number) => {
                const total = users.total || 1;
                const pct = Math.round((r.count / total) * 100);
                return (
                  <div key={i} className="flex items-center justify-between gap-3 text-xs font-mono">
                    <span className="w-28 text-[var(--text-secondary)] truncate">{r.role}</span>
                    <div className="flex-1 h-2 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-dim)]">
                      <div
                        className="h-full bg-[var(--lime)] transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(6, pct))}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-bold text-[var(--text-primary)]">
                      {r.count} ({pct}%)
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-xs font-mono text-[var(--text-dim)]">Loading role spectrum...</div>
            )}
          </div>

          <div className="p-3 rounded-sm bg-[var(--bg-main)] border border-[var(--border-dim)] flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--text-dim)]">Perimeter Entrants: {visitors.total} Logged</span>
            <span className="text-emerald-400 font-bold">{visitors.currentlyOnSite} Currently On-Site</span>
          </div>
        </div>
      </div>

      {/* ── SECTION C: Detailed Reports Generation Table ── */}
      <section className="fd-card p-5 space-y-4 border border-[var(--border-dim)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
              Detailed Audit, Pathogen & Compliance Records
            </h3>
            <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
              Filtered database stream with CSV export and role attribution
            </p>
          </div>

          {/* Record Type Filter Tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'audits', label: 'Audits' },
              { id: 'diseases', label: 'Diseases' },
              { id: 'checklists', label: 'Checklists' },
              { id: 'visitors', label: 'Visitors' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setReportType(t.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-sm transition-colors ${
                  reportType === t.id
                    ? 'bg-[var(--lime)] text-black font-bold'
                    : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border border-[var(--border-dim)] hover:border-[var(--lime)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search records by facility name, title, responsible auditor, or keywords..."
            className="fd-input w-full pl-10 pr-4 py-2 text-xs font-mono rounded-sm"
          />
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-sm border border-[var(--border-dim)]">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--bg-main)] border-b border-[var(--border-dim)] font-mono text-[11px] uppercase text-[var(--text-secondary)]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3">Title / Subject</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Auditor / Author</th>
                <th className="py-2.5 px-3">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-dim)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs font-mono text-[var(--text-dim)]">
                    Loading records from live MongoDB database...
                  </td>
                </tr>
              ) : reportsData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs font-mono text-[var(--text-dim)]">
                    No compliance records match the selected filters.
                  </td>
                </tr>
              ) : (
                reportsData.map((row: any) => {
                  const isHigh = String(row.severity).toLowerCase() === 'high' || String(row.severity).toLowerCase() === 'urgent';
                  const isLow = String(row.severity).toLowerCase() === 'low';
                  const formattedDate = row.date ? new Date(row.date).toLocaleDateString() : '—';

                  return (
                    <tr key={row.id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap text-[var(--text-dim)]">
                        {formattedDate}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="fd-badge fd-badge-neutral text-[10px]">
                          {row.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[var(--text-primary)] whitespace-nowrap">
                        {row.farmName}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">
                        {row.title}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`fd-badge text-[10px] ${
                            isHigh
                              ? 'fd-badge-critical'
                              : isLow
                              ? 'fd-badge-neutral'
                              : 'fd-badge-warning'
                          }`}
                        >
                          {row.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="fd-badge fd-badge-neutral text-[10px]">
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                        {row.responsible}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[var(--text-secondary)] max-w-xs truncate">
                        {row.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-mono text-[var(--text-dim)]">
          <div>
            Showing {reportsData.length} of {pagination.total} total matching database records
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-2.5 py-1 rounded-sm border border-[var(--border-dim)] bg-[var(--bg-main)] hover:border-[var(--lime)] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <span className="text-[var(--text-primary)]">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages || loading}
              className="px-2.5 py-1 rounded-sm border border-[var(--border-dim)] bg-[var(--bg-main)] hover:border-[var(--lime)] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportsScreen;
