import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  MapPin,
  Plus,
  ChevronRight,
  Crosshair,
} from 'lucide-react';


export const SurveillanceScreen: React.FC = () => {
  const { diseaseReports, navigateTo, openModal } = useApp();
  const [activeFilter, setActiveFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);

  const filteredReports = diseaseReports.filter((r) => {
    if (activeFilter === 'All') return true;
    return r.riskLevel === activeFilter;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Urgent Alert Banner */}
      <div className="p-4 rounded-2xl bg-[#ba1a1a]/20 border border-[#ba1a1a] text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ba1a1a] text-white animate-pulse flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#ba1a1a] text-white">
                CRIMSON ALERT
              </span>
              <span className="text-xs text-[#ffb4ab] font-mono">Risk Level: HIGH</span>
            </div>
            <h3 className="text-base font-bold font-serif text-white mt-0.5">
              Newcastle Disease Avian Vector Outbreak Alert
            </h3>
            <p className="text-xs text-slate-300">
              Active risk detected in Zone 2 Poultry House. Quarantine buffer active.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('farm-map')}
          className="px-4 py-2 text-xs font-bold bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl flex items-center gap-1 transition-all active:scale-95 flex-shrink-0 shadow-md"
        >
          View Details in Farm Map <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Disease Risk Map Card (Satellite Farm Overview with Glowing Heatmap Overlays) */}
      <div className="surface-card rounded-2xl p-5 border border-[#34343c] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#c0c1ff]" />
              Satellite Epidemiological Risk Map
            </h3>
            <p className="text-xs text-slate-400">
              Real-time spatial density heatmap & active pathogen vector telemetry
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span> High Risk
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffba3f]"></span> Medium
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></span> Low Risk
            </span>
          </div>
        </div>

        {/* Satellite Map Canvas */}
        <div className="relative w-full h-80 rounded-2xl bg-[#0f1015] border border-[#34343c] overflow-hidden group">
          {/* Blueprint SVG grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#c0c1ff" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />
          </svg>

          {/* Farm Sector Regions Geometry */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="flex justify-between">
              <span className="text-[10px] font-mono text-[#c0c1ff] border border-[#c0c1ff]/30 p-1 rounded">
                SECTOR 1 (SWINE GESTATION)
              </span>
              <span className="text-[10px] font-mono text-[#ffba3f] border border-[#ffba3f]/30 p-1 rounded">
                ZONE 2 (POULTRY HOUSE B)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-mono text-[#4CAF50] border border-[#4CAF50]/30 p-1 rounded">
                SECTOR 3 (BREEDER NUCLEUS)
              </span>
              <span className="text-[10px] font-mono text-[#ba1a1a] border border-[#ba1a1a]/30 p-1 rounded">
                SECTOR 4 (FARROWING)
              </span>
            </div>
          </div>

          {/* Glowing Heatmap Overlays (Crimson, Amber, Green) */}
          <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-[#ba1a1a]/40 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-[#ffba3f]/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-1/4 left-1/5 w-24 h-24 bg-[#4CAF50]/30 rounded-full blur-xl"></div>

          {/* Interactive Hotspot Pings */}
          {diseaseReports.map((rep) => {
            const isHigh = rep.riskLevel === 'High';
            const isMed = rep.riskLevel === 'Medium';

            return (
              <div
                key={rep.id}
                onClick={() => setSelectedHotspot(rep)}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group/pin z-20"
                style={{ left: `${rep.coordinates.x}%`, top: `${rep.coordinates.y}%` }}
                title={`${rep.diseaseName} - Click for Info`}
              >
                {/* Radar pulse ring */}
                <span
                  className={`absolute inset-0 rounded-full animate-ping ${
                    isHigh ? 'bg-[#ba1a1a]' : isMed ? 'bg-[#ffba3f]' : 'bg-[#4CAF50]'
                  }`}
                ></span>
                {/* Ping marker */}
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-2xl transition-transform group-hover/pin:scale-125 ${
                    isHigh
                      ? 'bg-[#ba1a1a]'
                      : isMed
                      ? 'bg-[#ffba3f] text-black'
                      : 'bg-[#4CAF50] text-black'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </div>
                <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-[#12131a]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-[#34343c] whitespace-nowrap shadow-lg opacity-0 group-hover/pin:opacity-100 transition-opacity">
                  {rep.diseaseName}
                </div>
              </div>
            );
          })}

          {/* Selected Hotspot Tooltip Modal */}
          {selectedHotspot && (
            <div className="absolute bottom-3 left-3 right-3 bg-[#12131a]/95 backdrop-blur-md p-3.5 rounded-xl border border-[#c0c1ff]/60 text-xs shadow-2xl z-30 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{selectedHotspot.diseaseName}</span>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                      selectedHotspot.riskLevel === 'High'
                        ? 'bg-[#ba1a1a] text-white'
                        : selectedHotspot.riskLevel === 'Medium'
                        ? 'bg-[#ffba3f] text-black'
                        : 'bg-[#4CAF50] text-black'
                    }`}
                  >
                    {selectedHotspot.riskLevel} Risk
                  </span>
                </div>
                <p className="text-slate-300 font-sans mt-0.5">{selectedHotspot.location}</p>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#1b1b22] text-slate-300 hover:text-white rounded-lg border border-[#34343c]"
              >
                Close Pin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Filter Tabs & Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1f1f26] border border-[#34343c] self-start">
          {(['All', 'High', 'Medium', 'Low'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === tab
                  ? 'bg-[#1a178c] text-[#c0c1ff] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab} {tab === 'All' ? `(${diseaseReports.length})` : ''}
            </button>
          ))}
        </div>

        {/* Report New Case CTA */}
        <button
          onClick={() => openModal('add-case')}
          className="px-4 py-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" /> + Report New Case
        </button>
      </div>

      {/* 4. Recent Surveillance Reports */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          Active Outbreak Reports ({filteredReports.length})
        </h3>

        {filteredReports.map((report) => {
          const isHigh = report.riskLevel === 'High';
          const isMed = report.riskLevel === 'Medium';

          return (
            <div
              key={report.id}
              className={`surface-card p-4 rounded-2xl border transition-all ${
                isHigh
                  ? 'border-[#ba1a1a]/60 bg-[#ba1a1a]/10'
                  : isMed
                  ? 'border-[#ffba3f]/50 bg-[#ffba3f]/10'
                  : 'border-[#34343c]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isHigh
                          ? 'bg-[#ba1a1a] text-white'
                          : isMed
                          ? 'bg-[#ffba3f] text-black'
                          : 'bg-[#4CAF50] text-black'
                      }`}
                    >
                      {report.riskLevel} Risk Level
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{report.reportedDate}</span>
                  </div>

                  <h4 className="text-base font-bold text-white font-serif">{report.diseaseName}</h4>
                  <p className="text-xs font-semibold text-[#c0c1ff]">{report.location}</p>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{report.details}</p>
                </div>

                <button
                  onClick={() => navigateTo('farm-map')}
                  className="px-3 py-1.5 rounded-xl bg-[#1b1b22] hover:bg-[#292931] border border-[#34343c] text-xs font-semibold text-slate-200 flex items-center gap-1 transition-all flex-shrink-0"
                >
                  Map Pin <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
