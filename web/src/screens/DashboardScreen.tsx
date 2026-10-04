import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  AlertTriangle,
  Building2,
  ClipboardList,
  Activity,
  ArrowUpRight,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Info,
  Clock,
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const { navigateTo, userProfile } = useApp();

  return (
    <div className="space-y-8 pb-20 animate-fadeIn font-sans">
      {/* 1. Biosecurity Score Gauge Card */}
      <div className="surface-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-[#2d3142] shadow-xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#4f46e5]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          {/* Circular SVG Gauge (Clicking routes to Health Overview) */}
          <div
            onClick={() => navigateTo('health')}
            className="cursor-pointer group flex flex-col items-center text-center flex-shrink-0"
            title="Click to open Farm Health Overview"
          >
            <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#212330"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - 0.82)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out group-hover:stroke-[#c0c1ff]"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#c0c1ff" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-5xl sm:text-6xl text-white tracking-tight group-hover:scale-105 transition-transform">
                  82
                </span>
                <span className="text-xs sm:text-sm font-sans text-slate-300 uppercase tracking-wider font-extrabold mt-1">
                  out of 100
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/50 text-[#4CAF50] text-sm font-extrabold shadow-md">
              <ShieldCheck className="w-4 h-4" /> Status: Optimal Baseline
            </div>
          </div>

          {/* System Status Summary */}
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4f46e5]/20 text-[#c0c1ff] border border-[#c0c1ff]/40 text-xs sm:text-sm font-bold">
              <Activity className="w-4 h-4 animate-pulse text-[#4f46e5]" /> Live Telemetry Vigilance Active
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tracking-tight leading-tight">
              Biosecurity Defense Surveillance
            </h2>
            <p className="text-base sm:text-lg text-slate-200 font-sans leading-relaxed max-w-3xl font-medium">
              "System status is vigilant and stable. Minor bio-alerts detected in Sector 4 require review by Lead Veterinarian <strong className="text-white font-bold">{userProfile.name}</strong>."
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
              <button
                onClick={() => navigateTo('health')}
                className="px-5 py-3 text-sm font-extrabold bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                View Farm Health Telemetry <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateTo('surveillance')}
                className="px-5 py-3 text-sm font-bold bg-[#212330] hover:bg-[#2a2d3d] text-slate-200 border border-[#33374a] rounded-xl flex items-center gap-2 transition-all active:scale-95"
              >
                Surveillance Risk Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-Metric Grid (Sikuda Hua Fix - Spacious Boxes & Large High-Contrast Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {/* Active Farms Card */}
        <div
          onClick={() => navigateTo('profile')}
          className="surface-card p-6 sm:p-7 rounded-2xl border border-[#2d3142] hover:border-[#c0c1ff]/60 cursor-pointer transition-all active:scale-95 group flex flex-col justify-between min-h-[140px] shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-200 mb-3">
            <span className="text-base font-bold font-sans">Active Farms</span>
            <div className="p-2.5 rounded-xl bg-[#4f46e5]/20 text-[#c0c1ff] group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-display text-5xl sm:text-6xl text-white tracking-tight">6</span>
            <span className="text-xs sm:text-sm text-[#4CAF50] font-extrabold flex items-center bg-[#16a34a]/20 px-2.5 py-1 rounded-full border border-[#16a34a]/40">
              <TrendingUp className="w-4 h-4 mr-1" /> All Online
            </span>
          </div>
        </div>

        {/* Open Alerts Card */}
        <div
          onClick={() => navigateTo('surveillance')}
          className="surface-card p-6 sm:p-7 rounded-2xl border border-[#2d3142] hover:border-[#dc2626]/60 cursor-pointer transition-all active:scale-95 group flex flex-col justify-between min-h-[140px] shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-200 mb-3">
            <span className="text-base font-bold font-sans">Open Alerts</span>
            <div className="p-2.5 rounded-xl bg-[#dc2626]/20 text-[#fca5a5] group-hover:scale-110 transition-transform animate-pulse">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-display text-5xl sm:text-6xl text-[#fca5a5] tracking-tight">3</span>
            <span className="text-xs sm:text-sm text-[#fca5a5] font-extrabold bg-[#dc2626]/30 px-2.5 py-1 rounded-full border border-[#dc2626]/50">
              1 Urgent
            </span>
          </div>
        </div>

        {/* Audits This Week Card */}
        <div
          onClick={() => navigateTo('audits')}
          className="surface-card p-6 sm:p-7 rounded-2xl border border-[#2d3142] hover:border-[#c0c1ff]/60 cursor-pointer transition-all active:scale-95 group flex flex-col justify-between min-h-[140px] shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-200 mb-3">
            <span className="text-base font-bold font-sans">Audits This Week</span>
            <div className="p-2.5 rounded-xl bg-[#4f46e5]/20 text-[#c0c1ff] group-hover:scale-110 transition-transform">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-display text-5xl sm:text-6xl text-white tracking-tight">11</span>
            <span className="text-xs sm:text-sm text-slate-300 font-bold bg-[#212330] px-2.5 py-1 rounded-full border border-[#33374a]">
              92% Pass
            </span>
          </div>
        </div>

        {/* Monitored Livestock Card */}
        <div
          onClick={() => navigateTo('health')}
          className="surface-card p-6 sm:p-7 rounded-2xl border border-[#2d3142] hover:border-[#4CAF50]/60 cursor-pointer transition-all active:scale-95 group flex flex-col justify-between min-h-[140px] shadow-lg"
        >
          <div className="flex items-center justify-between text-slate-200 mb-3">
            <span className="text-base font-bold font-sans">Monitored Livestock</span>
            <div className="p-2.5 rounded-xl bg-[#16a34a]/20 text-[#4CAF50] group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-display text-5xl sm:text-6xl text-white tracking-tight">2.4k</span>
            <span className="text-xs sm:text-sm text-[#4CAF50] font-extrabold bg-[#16a34a]/20 px-2.5 py-1 rounded-full border border-[#16a34a]/40">
              Healthy
            </span>
          </div>
        </div>
      </div>

      {/* 3. Active Bio-Alert Feed (Distinct Color Coding & Pulse Animations) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-200 font-sans flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
            Active Bio-Alert Feed
          </h3>
          <button
            onClick={() => navigateTo('surveillance')}
            className="text-sm sm:text-base text-[#c0c1ff] hover:underline font-extrabold"
          >
            View Surveillance Map →
          </button>
        </div>

        <div className="space-y-4">
          {/* Solid Red - Urgent Alert with Pulsing Animation */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#dc2626] text-white border-2 border-[#fca5a5] shadow-xl animate-urgent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/20 text-white flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-extrabold uppercase bg-black/40 text-white tracking-wider">
                    CRITICAL URGENT
                  </span>
                  <span className="text-xs text-red-100 font-mono flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5" /> 10m ago
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  Temperature Spike in Farrowing House 3
                </h4>
                <p className="text-sm text-red-100 font-sans font-medium">
                  Sector 4 · Target threshold exceeded (28.4°C max limit)
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('health')}
              className="px-5 py-3 rounded-xl bg-white text-[#dc2626] text-xs sm:text-sm font-extrabold hover:bg-red-50 transition-all shadow-md flex-shrink-0 self-end sm:self-center active:scale-95"
            >
              Investigate Telemetry
            </button>
          </div>

          {/* Solid Yellow/Amber - Review Required Alert */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#d97706] text-white border border-[#fcd34d] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-black/20 text-white flex-shrink-0 mt-0.5">
                <AlertCircle className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-extrabold uppercase bg-black/40 text-white tracking-wider">
                    REVIEW REQUIRED
                  </span>
                  <span className="text-xs text-amber-100 font-mono flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5" /> 2h ago
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  Unauthorized Vehicle Near Perimeter Gate B
                </h4>
                <p className="text-sm text-amber-100 font-sans font-medium">
                  Zone 2 · Wheel decontamination wash bypassed
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('farm-map')}
              className="px-5 py-3 rounded-xl bg-black/30 text-white hover:bg-black/50 text-xs sm:text-sm font-extrabold transition-all shadow-md flex-shrink-0 self-end sm:self-center active:scale-95"
            >
              Check Zone 2 Map
            </button>
          </div>

          {/* Solid Grey - Low Priority Alert */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#374151] text-slate-100 border border-[#4b5563] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-black/20 text-slate-300 flex-shrink-0 mt-0.5">
                <Info className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-black/30 text-slate-300">
                    LOW PRIORITY
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1 font-bold">
                    <Clock className="w-3.5 h-3.5" /> Yesterday
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                  Routine Sanitation Audit Pending
                </h4>
                <p className="text-sm text-slate-200 font-sans font-medium">
                  Sector 2 Feed Mill · Scheduled inspection due in 2 days
                </p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('audits')}
              className="px-5 py-3 rounded-xl bg-[#1f2937] hover:bg-[#111827] text-slate-200 text-xs sm:text-sm font-extrabold border border-[#4b5563] transition-all flex-shrink-0 self-end sm:self-center active:scale-95"
            >
              Resume Audit
            </button>
          </div>
        </div>
      </div>

      {/* 4. Monitored Commercial Farm Units */}
      <div>
        <h3 className="text-base font-bold uppercase tracking-wider text-slate-200 mb-4 font-sans">
          Monitored Commercial Farm Units
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Green Valley Pig Farm */}
          <div className="surface-card p-6 rounded-2xl border border-[#2d3142] space-y-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-white font-sans">Green Valley Pig Farm</h4>
                <p className="text-sm text-slate-300 font-sans font-medium mt-0.5">Swine Gestation · 1,400 Head</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#16a34a]/20 text-[#4CAF50] text-xs font-extrabold border border-[#16a34a]/40">
                Biosecurity: Optimal
              </span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base text-slate-200 pt-3 border-t border-[#2d3142]">
              <span>Biosecurity Score: <strong className="text-white font-display text-lg ml-1">82/100</strong></span>
              <button
                onClick={() => navigateTo('health')}
                className="px-4 py-2.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1 shadow-md active:scale-95"
              >
                View Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sunrise Poultry House */}
          <div className="surface-card p-6 rounded-2xl border border-[#d97706]/50 space-y-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-white font-sans">Sunrise Poultry House</h4>
                <p className="text-sm text-slate-300 font-sans font-medium mt-0.5">Broiler Facility · 1,000 Birds</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#d97706]/20 text-[#fcd34d] text-xs font-extrabold border border-[#d97706]/40 animate-pulse">
                Biosecurity: Monitoring
              </span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-base text-slate-200 pt-3 border-t border-[#2d3142]">
              <span>Biosecurity Score: <strong className="text-white font-display text-lg ml-1">61/100</strong></span>
              <button
                onClick={() => navigateTo('farm-map')}
                className="px-4 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-white text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1 shadow-md active:scale-95"
              >
                View Zone 2 Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
