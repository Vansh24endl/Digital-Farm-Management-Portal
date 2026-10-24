import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';

export const AlertDrawer: React.FC = () => {
  const { isAlertDrawerOpen, setIsAlertDrawerOpen, alerts, markAlertRead, navigateTo } = useApp();

  if (!isAlertDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] h-full flex flex-col border-l border-[var(--border)] shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--critical-bg)] border border-[var(--critical-dim)] flex items-center justify-center text-[var(--critical)]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
                Active Bio-Alert Feed
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                Real-time Farm Telemetry & Vector Feed
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAlertDrawerOpen(false)}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[2px] hover:bg-[var(--bg-raised)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)] font-mono">
              <Check className="w-8 h-8 mx-auto text-[var(--success)] mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">No Active Alerts</p>
              <p className="text-[11px] text-[var(--text-dim)] mt-1">All monitored biosecurity sectors normal.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isUrgent = alert.severity === 'urgent';
              const isReview = alert.severity === 'review';

              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-[3px] border transition-all relative ${
                    alert.read
                      ? 'bg-[var(--bg-raised)]/60 border-[var(--border-dim)] opacity-60'
                      : isUrgent
                      ? 'bg-[var(--critical-bg)] border-[var(--critical-dim)] text-[var(--text-primary)]'
                      : isReview
                      ? 'bg-[var(--warning-bg)] border-[var(--warning-dim)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-raised)] border-[var(--border-dim)]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded-[2px] flex-shrink-0 mt-0.5 border ${
                        isUrgent
                          ? 'bg-[var(--critical-bg)] border-[var(--critical-dim)] text-[var(--critical)]'
                          : isReview
                          ? 'bg-[var(--warning-bg)] border-[var(--warning-dim)] text-[var(--warning)]'
                          : 'bg-[var(--lime-bg)] border-[var(--lime)]/30 text-[var(--lime)]'
                      }`}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : isReview ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isUrgent ? 'text-[var(--critical)]' : isReview ? 'text-[var(--warning)]' : 'text-[var(--lime)]'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-dim)]">
                          {alert.timeAgo}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)] mt-0.5 leading-snug">
                        {alert.title}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-0.5">{alert.location}</p>

                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border-dim)]">
                        <button
                          onClick={() => {
                            setIsAlertDrawerOpen(false);
                            if (isUrgent) navigateTo('surveillance');
                            else if (isReview) navigateTo('farm-map');
                            else navigateTo('audits');
                          }}
                          className="text-xs font-mono font-bold text-[var(--lime)] hover:underline uppercase tracking-wider"
                        >
                          View Details →
                        </button>

                        {!alert.read && (
                          <button
                            onClick={() => markAlertRead(alert.id)}
                            className="text-[11px] font-mono text-[var(--text-dim)] hover:text-[var(--text-primary)] ml-auto uppercase"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
