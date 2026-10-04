import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardCheck,
  Plus,
  Clock,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';



export const AuditsScreen: React.FC = () => {
  const { audits, openModal, openAuditInspector } = useApp();

  const pendingAudits = audits.filter((a) => a.status !== 'completed');
  const completedCount = audits.filter((a) => a.status === 'completed').length + 14;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Audit Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="surface-card p-4 rounded-xl border border-[#34343c]">
          <span className="text-xs font-sans text-slate-400">Total Pending</span>
          <p className="font-display text-3xl text-[#c0c1ff]">{pendingAudits.length}</p>
          <span className="text-[10px] text-slate-400">Active Schedules</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#ba1a1a]/60">
          <span className="text-xs font-sans text-slate-400">Overdue Audits</span>
          <p className="font-display text-3xl text-[#ffb4ab]">1</p>
          <span className="text-[10px] text-[#ffb4ab] font-bold">Action Needed</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#34343c]">
          <span className="text-xs font-sans text-slate-400">Completed Audits</span>
          <p className="font-display text-3xl text-white">{completedCount}</p>
          <span className="text-[10px] text-[#4CAF50] font-semibold">100% Passed</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#4CAF50]/50">
          <span className="text-xs font-sans text-slate-400">Compliance Score</span>
          <p className="font-display text-3xl text-[#4CAF50]">92%</p>
          <span className="text-[10px] text-[#4CAF50] font-semibold flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> Grade A Target
          </span>
        </div>
      </div>

      {/* 2. Header Title & Add Audit CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#c0c1ff]" />
            Inspection & Compliance Audits
          </h2>
          <p className="text-xs text-slate-400">
            Mandatory biosecurity verification, footbath protocols, and entrance logs
          </p>
        </div>

        <button
          onClick={() => openModal('add-audit')}
          className="px-4 py-2 rounded-xl bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> + Schedule New Audit
        </button>
      </div>

      {/* 3. Pending Audits List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          Pending & In-Progress Inspection Schedules
        </h3>

        {pendingAudits.map((audit) => {
          const isUrgent = audit.severity === 'urgent';
          const isAttention = audit.severity === 'attention';

          return (
            <div
              key={audit.id}
              className={`surface-card p-4 sm:p-5 rounded-2xl border transition-all ${
                isUrgent
                  ? 'border-[#ba1a1a]/60 bg-[#ba1a1a]/10'
                  : isAttention
                  ? 'border-[#ffba3f]/50 bg-[#ffba3f]/10'
                  : 'border-[#34343c]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isUrgent
                          ? 'bg-[#ba1a1a] text-white'
                          : isAttention
                          ? 'bg-[#ffba3f] text-black'
                          : 'bg-[#1a178c] text-[#c0c1ff]'
                      }`}
                    >
                      {isUrgent ? 'Urgent Warning' : isAttention ? 'Needs Attention' : 'Routine Audit'}
                    </span>
                    <span className="text-xs text-slate-400 font-sans flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> Due: {audit.dueDate}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white font-serif">{audit.title}</h4>
                  <p className="text-xs font-semibold text-[#c0c1ff]">{audit.sector}</p>
                  <p className="text-xs text-slate-400">Auditor: {audit.auditor}</p>

                  {/* Inspection Progress Bar */}
                  <div className="pt-2 max-w-xs">
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Inspection Progress</span>
                      <span className="font-bold text-white">{audit.progress}%</span>
                    </div>
                    <div className="w-full bg-[#12131a] h-2 rounded-full overflow-hidden border border-[#34343c]">
                      <div
                        className="bg-gradient-to-r from-[#1a178c] to-[#c0c1ff] h-full transition-all duration-500"
                        style={{ width: `${audit.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Audit Action Button */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => openAuditInspector(audit)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      isUrgent
                        ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white'
                        : isAttention
                        ? 'bg-[#ffba3f] text-black hover:bg-[#ffba3f]/90'
                        : 'bg-[#1a178c] text-[#c0c1ff] border border-[#c0c1ff]/40 hover:bg-[#1a178c]/80'
                    }`}
                  >
                    {audit.progress > 0 ? 'Resume Inspection' : 'Begin Audit Checklist'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Completed Audits History */}
      <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#4CAF50] font-sans flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Recent Verified Completed Audits
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-[#1f1f26] border border-[#34343c] flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Quarantine Lock Barrier Inspection</p>
              <p className="text-slate-400 font-sans">Sector 1 · Swine Gestation · Oct 02, 2026</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#316342]/40 text-[#4CAF50] font-bold border border-[#4CAF50]/40">
              100% Passed
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1f1f26] border border-[#34343c] flex items-center justify-between">
            <div>
              <p className="font-bold text-white">HVAC Bio-Filter Pressure Calibration</p>
              <p className="text-slate-400 font-sans">Zone 2 Poultry House · Oct 01, 2026</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#316342]/40 text-[#4CAF50] font-bold border border-[#4CAF50]/40">
              100% Passed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
