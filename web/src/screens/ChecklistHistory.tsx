
import React, { useEffect, useState } from 'react';
import {
  History,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type ChecklistItem = {
  itemId?: string;
  title: string;
  category?: string;
  description?: string;
  status: 'passed' | 'warning' | 'critical';
};

type Submission = {
  _id: string;
  farmId?: { _id: string; name: string } | string;
  zone: string;
  submittedAt: string;
  items: ChecklistItem[];
  summary: {
    total: number;
    passed: number;
    warning: number;
    critical: number;
  };
};

const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

export const ChecklistHistory: React.FC<{
  refreshKey?: number;
}> = ({ refreshKey = 0 }) => {
  const [records, setRecords] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE}/checklists`, {
          signal: controller.signal,
        });

        const body = await response.json();

        if (!response.ok || !body.success) {
          throw new Error(body.message || 'Failed to load history');
        }

        if (!controller.signal.aborted) {
          setRecords(Array.isArray(body.data) ? body.data : []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : 'Unable to load checklist history'
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadHistory();

    return () => controller.abort();
  }, [refreshKey, reloadCount]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
            <h3
              className="text-sm font-bold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              Submission History
            </h3>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
            Previous biosecurity inspections saved in MongoDB
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReloadCount((n) => n + 1)}
          disabled={loading}
          className="fd-btn-icon"
          aria-label="Refresh history"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* States */}
      {loading && (
        <p className="text-sm" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
          Loading saved checklists…
        </p>
      )}

      {error && (
        <div
          className="fd-card p-3 text-sm flex items-center gap-2"
          style={{ borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)' }}
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--critical)' }} />
          <span style={{ color: 'var(--critical)' }}>{error}</span>
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="fd-card p-6 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
          No checklist submissions found yet.
        </div>
      )}

      {/* Records */}
      {!loading && !error && records.map((record) => {
        const expanded = expandedId === record._id;
        const farmName =
          typeof record.farmId === 'object'
            ? record.farmId?.name
            : 'Farm';
        const pct = record.summary?.total > 0
          ? Math.round((record.summary.passed / record.summary.total) * 100)
          : 0;

        return (
          <div
            key={record._id}
            className="fd-card overflow-hidden"
          >
            {/* Accordion header */}
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : record._id)}
              className="w-full text-left p-4 transition-colors"
              style={{ background: 'transparent' }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-raised)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
              aria-expanded={expanded}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h4
                    className="text-sm font-bold truncate"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
                  >
                    {record.zone}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {farmName || 'Unknown farm'} · {new Date(record.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-xs font-bold"
                    style={{ color: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--critical)', fontFamily: 'IBM Plex Mono, monospace' }}
                  >
                    {pct}%
                  </span>
                  {expanded
                    ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-dim)' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-dim)' }} />
                  }
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2.5 text-xs">
                <span className="fd-badge fd-badge-success">
                  <CheckCircle2 className="w-3 h-3" /> {record.summary?.passed ?? 0} Passed
                </span>
                {(record.summary?.warning ?? 0) > 0 && (
                  <span className="fd-badge fd-badge-warning">
                    <AlertCircle className="w-3 h-3" /> {record.summary.warning} Warning
                  </span>
                )}
                {(record.summary?.critical ?? 0) > 0 && (
                  <span className="fd-badge fd-badge-critical">
                    <AlertTriangle className="w-3 h-3" /> {record.summary.critical} Critical
                  </span>
                )}
              </div>
            </button>

            {/* Expanded items */}
            {expanded && (
              <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
                {(record.items || []).map((item, index) => (
                  <div
                    key={`${item.itemId || item.title}-${index}`}
                    className="fd-raised flex items-start gap-3 p-3"
                  >
                    {item.status === 'passed' ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    ) : item.status === 'warning' ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                    ) : (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--critical)' }} />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {item.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {item.description}
                      </p>
                    </div>

                    <span
                      className={`fd-badge ${
                        item.status === 'passed' ? 'fd-badge-success' :
                        item.status === 'warning' ? 'fd-badge-warning' : 'fd-badge-critical'
                      } flex-shrink-0`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};