import { ChecklistHistory } from './ChecklistHistory';
import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type ChecklistStatus = 'passed' | 'warning' | 'critical';

const statusConfig: Record<ChecklistStatus, { label: string; badgeClass: string; iconColor: string; borderColor: string; bgColor: string }> = {
  passed:   { label: 'PASSED',   badgeClass: 'fd-badge-success',  iconColor: 'var(--success)',  borderColor: 'var(--success-dim)',  bgColor: 'var(--success-bg)' },
  warning:  { label: 'WARNING',  badgeClass: 'fd-badge-warning',  iconColor: 'var(--warning)',  borderColor: 'var(--warning-dim)',  bgColor: 'var(--warning-bg)' },
  critical: { label: 'CRITICAL', badgeClass: 'fd-badge-critical', iconColor: 'var(--critical)', borderColor: 'var(--critical-dim)', bgColor: 'var(--critical-bg)' },
};

export const ChecklistScreen: React.FC = () => {
  const {
    checklist,
    selectedZone,
    setSelectedZone,
    cycleChecklistItemStatus,
    submitChecklist,
  } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const zones = [
    'Zone A Rearing Facility',
    'Zone B Poultry House',
    'Zone C Hatchery',
    'Zone D Storage & Chemical Depot',
  ];

  const zoneChecklist = useMemo(
    () =>
      checklist.filter((item: any) => {
        return !item.zone || item.zone === selectedZone;
      }),
    [checklist, selectedZone]
  );

  const totalItems = zoneChecklist.length;
  const passedItems  = zoneChecklist.filter((item: any) => item.status === 'passed').length;
  const warningItems = zoneChecklist.filter((item: any) => item.status === 'warning').length;
  const criticalItems = zoneChecklist.filter((item: any) => item.status === 'critical').length;
  const passPercentage = totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      await Promise.resolve(submitChecklist());
      setSubmitMessage('Checklist submitted successfully.');
      setHistoryRefreshKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent('checklist-submitted'));
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Could not submit the checklist. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / Biosecurity Checklist</p>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Daily Inspection Protocol
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
            Mandatory sanitation audit checklist for active farm personnel
          </p>
        </div>

        {/* Zone Selector */}
        <div className="flex flex-col gap-1 self-start">
          <label className="fd-label" htmlFor="zone-select">Inspection Zone</label>
          <div className="relative">
            <select
              id="zone-select"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="fd-select pr-8"
              style={{ minWidth: '220px' }}
            >
              {zones.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Compliance Summary Card ── */}
      <div className="fd-card p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="fd-label mb-1">Zone Decontamination Status</p>
            <div className="flex items-baseline gap-2">
              <span
                className="font-display text-4xl leading-none"
                style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}
              >
                {passedItems}/{totalItems}
              </span>
              <span className="text-sm font-bold fd-highlight" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                {passPercentage}% Passed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="fd-badge fd-badge-success">
              <CheckCircle2 className="w-3 h-3" /> {passedItems} Passed
            </span>
            {warningItems > 0 && (
              <span className="fd-badge fd-badge-warning">
                <AlertCircle className="w-3 h-3" /> {warningItems} Warning
              </span>
            )}
            {criticalItems > 0 && (
              <span className="fd-badge fd-badge-critical">
                <AlertTriangle className="w-3 h-3" /> {criticalItems} Critical
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="fd-progress-track">
          <div
            className="fd-progress-fill"
            style={{
              width: `${passPercentage}%`,
              background: passPercentage >= 80 ? 'var(--success)' : passPercentage >= 60 ? 'var(--warning)' : 'var(--critical)',
            }}
          />
        </div>

        <p className="text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
          Click a row to cycle: Passed → Warning → Critical → Passed
        </p>
      </div>

      {/* ── Checklist Items ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="fd-label">Inspection Items ({totalItems})</h2>
          <ClipboardList className="w-4 h-4" style={{ color: 'var(--text-dim)' }} />
        </div>

        {zoneChecklist.length === 0 ? (
          <div className="fd-card p-8 text-center">
            <ClipboardList className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-dim)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No checklist items available for this zone.</p>
          </div>
        ) : (
          zoneChecklist.map((item: any) => {
            const status = item.status as ChecklistStatus;
            const config = statusConfig[status];
            const isPassed = status === 'passed';
            const isWarning = status === 'warning';

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => cycleChecklistItemStatus(item.id)}
                className="w-full text-left p-4 transition-all active:scale-[0.995] group"
                style={{
                  background: isPassed ? 'var(--success-bg)' : isWarning ? 'var(--warning-bg)' : 'var(--critical-bg)',
                  border: `1px solid ${config.borderColor}`,
                  borderRadius: '3px',
                }}
                title="Click to cycle status (Passed → Warning → Critical)"
                aria-label={`${item.title}, current status ${config.label}. Click to change status.`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div
                      className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                      style={{
                        border: `1px solid ${config.borderColor}`,
                        borderRadius: '2px',
                        color: config.iconColor,
                        background: isPassed ? 'var(--success-bg)' : isWarning ? 'var(--warning-bg)' : 'var(--critical-bg)',
                      }}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isWarning ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className="fd-label">{item.category}</span>
                      <h4
                        className="text-sm font-bold"
                        style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`fd-badge ${config.badgeClass}`}>
                      {config.label}
                    </span>
                    <span className="text-[9px]" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>tap to cycle</span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* ── Submit Section ── */}
      <div className="pt-2 space-y-3">
        {submitMessage && (
          <div
            className="fd-card p-3 flex items-center gap-2 text-sm"
            style={{ borderColor: 'var(--success-dim)', background: 'var(--success-bg)' }}
            role="status"
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
            <span style={{ color: 'var(--success)' }}>{submitMessage}</span>
          </div>
        )}

        {submitError && (
          <div
            className="fd-card p-3 flex items-center gap-2 text-sm"
            style={{ borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)' }}
            role="alert"
          >
            <AlertTriangle className="w-4 h-4" style={{ color: 'var(--critical)' }} />
            <span style={{ color: 'var(--critical)' }}>{submitError}</span>
          </div>
        )}

        <button
          id="checklist-submit-btn"
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || totalItems === 0}
          className="fd-btn w-full py-3.5 text-sm"
        >
          {isSubmitting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isSubmitting
            ? 'Submitting Checklist…'
            : 'Submit Daily Biosecurity Checklist to HQ'}
        </button>
      </div>

      {/* ── Checklist History ── */}
      <div className="pt-3" style={{ borderTop: '1px solid var(--border-dim)' }}>
        <button
          id="checklist-history-toggle"
          type="button"
          onClick={() => setShowHistory((prev) => !prev)}
          className="fd-btn-ghost w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            {showHistory ? 'Hide Checklist History' : 'View Submission History'}
          </span>
          {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHistory && (
          <div className="mt-4">
            <ChecklistHistory refreshKey={historyRefreshKey} />
          </div>
        )}
      </div>
    </div>
  );
};