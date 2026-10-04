import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Map,
  Plus,
  XCircle,
  Clock,
} from 'lucide-react';


export const FarmMapScreen: React.FC = () => {
  const { openModal } = useApp();

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Header Banner for Poultry House B - Zone 2 Alert */}
      <div className="surface-card rounded-2xl p-5 border border-[#ffba3f]/60 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffba3f]/20 text-[#ffba3f] text-xs font-bold border border-[#ffba3f]/40 animate-pulse">
                ZONE 2 ALERT ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">Biosecurity Score: 61/100</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">
              Poultry House B Blueprint & Spatial Surveillance
            </h2>
            <p className="text-xs text-slate-300 font-sans">
              Monitoring high-density broiler flock, automated footbaths, and perimeter access gates.
            </p>
          </div>

          <button
            onClick={() => openModal('incident-log')}
            className="px-4 py-2.5 rounded-xl bg-[#ffba3f] text-black hover:bg-[#ffba3f]/90 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> + Log Incident
          </button>
        </div>
      </div>

      {/* 2. Interactive SVG Blueprint Geometry */}
      <div className="surface-card rounded-2xl p-5 border border-[#34343c] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
            <Map className="w-4 h-4 text-[#c0c1ff]" />
            Spatial Zone Blueprint Layout
          </h3>
          <span className="text-xs text-[#c0c1ff] font-mono">Interactive Sector Pins</span>
        </div>

        <div className="relative w-full h-80 rounded-2xl bg-[#0d0e14] border border-[#34343c] overflow-hidden p-4">
          {/* Blueprint SVG Layout */}
          <svg className="w-full h-full" viewBox="0 0 800 450">
            {/* Grid background */}
            <defs>
              <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#292931" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />

            {/* Zone A: Shower Entry */}
            <rect x="50" y="50" width="220" height="150" rx="10" fill="#1b1b22" stroke="#34343c" strokeWidth="2" />
            <text x="70" y="80" fill="#4CAF50" fontSize="12" fontWeight="bold">ZONE A: SHOWER ENTRY</text>
            <text x="70" y="100" fill="#94a3b8" fontSize="10">Clean / Dirty Separation Line</text>

            {/* Zone B: Poultry Barn 2 (ALERT REGION) */}
            <rect x="320" y="50" width="430" height="220" rx="10" fill="#ba1a1a" fillOpacity="0.15" stroke="#ba1a1a" strokeWidth="2" />
            <text x="340" y="80" fill="#ffb4ab" fontSize="14" fontWeight="bold">ZONE B: POULTRY HOUSE B (61/100 ALERT)</text>
            <text x="340" y="102" fill="#e2e8f0" fontSize="11">Newcastle Vector Risk Area · 1,000 Birds</text>
            <circle cx="530" cy="160" r="30" fill="#ba1a1a" fillOpacity="0.3" className="animate-ping" />
            <circle cx="530" cy="160" r="10" fill="#ba1a1a" />

            {/* Zone C: Feed Mill */}
            <rect x="50" y="240" width="240" height="160" rx="10" fill="#1b1b22" stroke="#34343c" strokeWidth="2" />
            <text x="70" y="270" fill="#ffba3f" fontSize="12" fontWeight="bold">ZONE C: FEED MILL & STORAGE</text>

            {/* Gate B Tire Spray */}
            <rect x="340" y="310" width="390" height="90" rx="10" fill="#1f1f26" stroke="#ffba3f" strokeDasharray="5,5" strokeWidth="2" />
            <text x="360" y="340" fill="#ffba3f" fontSize="12" fontWeight="bold">PERIMETER GATE B VEHICLE WASH</text>
          </svg>
        </div>
      </div>

      {/* 3. Failed Protocols & Recent Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Failed Protocols List */}
        <div className="surface-card p-5 rounded-2xl border border-[#ba1a1a]/50 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb4ab] flex items-center gap-1.5 font-sans">
            <XCircle className="w-4 h-4 text-[#ba1a1a]" />
            Failed Zone 2 Protocols
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#ba1a1a]/15 border border-[#ba1a1a]/40 text-slate-200">
              <span className="font-bold text-[#ffb4ab]">Vehicle Decontamination Bypass</span>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                Feed truck driver skipped 5-minute tire spray contact time at Gate B.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#ffba3f]/15 border border-[#ffba3f]/40 text-slate-200">
              <span className="font-bold text-[#ffba3f]">Footbath Virucide pH Dilution</span>
              <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                Rainwater diluted bath concentration to 120 ppm (200 ppm min required).
              </p>
            </div>
          </div>
        </div>

        {/* Recent Sensor & Gate Logs */}
        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-sans">
            <Clock className="w-4 h-4 text-[#c0c1ff]" />
            Recent Zone 2 Telemetry Logs
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 rounded-xl bg-[#1f1f26] border border-[#34343c] flex items-center justify-between">
              <span>Ammonia NH3 Sensor #4: 18 ppm</span>
              <span className="text-[10px] text-slate-400 font-mono">15m ago</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1f1f26] border border-[#34343c] flex items-center justify-between">
              <span>Air Fan #2 RPM Spike (1,450 RPM)</span>
              <span className="text-[10px] text-slate-400 font-mono">1h ago</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1f1f26] border border-[#34343c] flex items-center justify-between">
              <span>Biometric Pass: Dr. Ananya Singh</span>
              <span className="text-[10px] text-slate-400 font-mono">2h ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
