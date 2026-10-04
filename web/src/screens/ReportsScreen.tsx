import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Download,
  ShieldCheck,
  CheckCircle2,
  Users,
  Package,
  Activity,
  ArrowUpRight,
} from 'lucide-react';


export const ReportsScreen: React.FC = () => {
  const { openModal } = useApp();

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Header Title & Export PDF Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c0c1ff]" />
            Biosecurity Analytics & Compliance Reports
          </h2>
          <p className="text-xs text-slate-400">
            Official monthly epidemiological surveillance certificates and audit logs
          </p>
        </div>

        <button
          onClick={() => openModal('pdf-export')}
          className="px-4 py-2.5 rounded-xl bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export Official PDF Certificate
        </button>
      </div>

      {/* 2. Biosecurity Score Report Gauge Card (82/100) */}
      <div className="surface-card rounded-2xl p-6 border border-[#34343c] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* SVG Score Gauge */}
          <div className="flex flex-col items-center text-center flex-shrink-0">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#292931" strokeWidth="10" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#4CAF50"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - 0.82)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 glow-green"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl text-white tracking-tight">82</span>
                <span className="text-xs font-bold text-[#4CAF50] uppercase tracking-wider mt-0.5">
                  GRADE A PASS
                </span>
              </div>
            </div>
            <span className="mt-2 text-xs text-slate-400 font-sans">
              Cumulative October 2026 Audit Rating
            </span>
          </div>

          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#316342]/40 text-[#4CAF50] text-xs font-bold border border-[#4CAF50]/40">
              <ShieldCheck className="w-4 h-4" /> State Regulatory Biosecurity Standard Compliant
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">
              Dr. Ananya Reyes - Official Surveillance Certificate
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              "This report consolidates daily decontamination checklists, visitor bio-pass logs, telemetry water/temperature trends, and real-time PCR pathogen screenings across all 6 assigned farm sites."
            </p>
          </div>
        </div>
      </div>

      {/* 3. Report Category Breakdown (Audit, Health, Visitor, Inventory) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Audit Compliance Report */}
        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#c0c1ff]" />
              <h4 className="text-sm font-bold text-white font-serif">Audit Compliance Report</h4>
            </div>
            <span className="text-xs font-bold text-[#4CAF50]">92% Score</span>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            14 inspections completed this month. 1 minor footbath dilution flagged in Zone 2.
          </p>
          <button
            onClick={() => openModal('pdf-export')}
            className="text-xs font-bold text-[#c0c1ff] hover:underline flex items-center gap-1"
          >
            Download Audit PDF <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Health & PCR Telemetry Report */}
        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#4CAF50]" />
              <h4 className="text-sm font-bold text-white font-serif">Health & PCR Diagnostics</h4>
            </div>
            <span className="text-xs font-bold text-[#4CAF50]">Negative / Clear</span>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            Batch #9411 RT-PCR cleared for ASFV, PRRSv, and CSFV. Ammonia & temp within bounds.
          </p>
          <button
            onClick={() => openModal('pdf-export')}
            className="text-xs font-bold text-[#c0c1ff] hover:underline flex items-center gap-1"
          >
            Download Lab PDF <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visitor Traceability Log */}
        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#c0c1ff]" />
              <h4 className="text-sm font-bold text-white font-serif">Visitor Bio-Pass Traceability</h4>
            </div>
            <span className="text-xs font-bold text-white">120 Entrants</span>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            100% thermal scan compliance logged. 0 temperature spikes detected above 37.5°C threshold.
          </p>
          <button
            onClick={() => openModal('pdf-export')}
            className="text-xs font-bold text-[#c0c1ff] hover:underline flex items-center gap-1"
          >
            Download Visitor PDF <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inventory Chemical Audit */}
        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#ffba3f]" />
              <h4 className="text-sm font-bold text-white font-serif">Chemical & PPE Stock Audit</h4>
            </div>
            <span className="text-xs font-bold text-[#ffba3f]">8 Low Stock</span>
          </div>
          <p className="text-xs text-slate-300 font-sans">
            Virucides and Tyvek suits requested for replenishment. 120 items tracked.
          </p>
          <button
            onClick={() => openModal('pdf-export')}
            className="text-xs font-bold text-[#c0c1ff] hover:underline flex items-center gap-1"
          >
            Download Inventory PDF <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
