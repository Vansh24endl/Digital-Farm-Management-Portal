import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Bell, AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';

export const AlertDrawer: React.FC = () => {
  const { isAlertDrawerOpen, setIsAlertDrawerOpen, alerts, markAlertRead, navigateTo } = useApp();

  if (!isAlertDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#12131a] h-full flex flex-col border-l border-[#34343c] shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ba1a1a]/20 border border-[#ba1a1a]/40 flex items-center justify-center text-[#ffb4ab]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-white">Active Bio-Alerts</h2>
              <p className="text-xs text-slate-400 font-sans">
                Real-time Farm Telemetry & Vector Feed
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAlertDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#292931] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Check className="w-10 h-10 mx-auto text-[#4CAF50] mb-2" />
              <p className="text-sm font-semibold">No active alerts</p>
              <p className="text-xs">All monitored sectors are operating normally.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isUrgent = alert.severity === 'urgent';
              const isReview = alert.severity === 'review';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition-all relative ${
                    alert.read
                      ? 'bg-[#1b1b22]/60 border-[#34343c] opacity-75'
                      : isUrgent
                      ? 'bg-[#ba1a1a]/15 border-[#ba1a1a]/60 text-slate-100'
                      : isReview
                      ? 'bg-[#ffba3f]/15 border-[#ffba3f]/60 text-slate-100'
                      : 'bg-[#1f1f26] border-[#34343c]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${
                        isUrgent
                          ? 'bg-[#ba1a1a]/30 text-[#ffb4ab]'
                          : isReview
                          ? 'bg-[#ffba3f]/30 text-[#ffba3f]'
                          : 'bg-[#1a178c]/30 text-[#c0c1ff]'
                      }`}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isReview ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {alert.severity}
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans">
                          {alert.timeAgo}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5 leading-snug">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 font-sans">{alert.location}</p>

                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#34343c]/60">
                        <button
                          onClick={() => {
                            setIsAlertDrawerOpen(false);
                            if (isUrgent) navigateTo('surveillance');
                            else if (isReview) navigateTo('farm-map');
                            else navigateTo('audits');
                          }}
                          className="text-xs font-semibold text-[#c0c1ff] hover:underline"
                        >
                          View Details & Take Action →
                        </button>

                        {!alert.read && (
                          <button
                            onClick={() => markAlertRead(alert.id)}
                            className="text-xs text-slate-400 hover:text-slate-200 ml-auto"
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
