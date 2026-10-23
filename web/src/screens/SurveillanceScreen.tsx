import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  MapPin,
  Plus,
  ChevronRight,
  Crosshair,
  X,
} from 'lucide-react';


export const SurveillanceScreen: React.FC = () => {
  const { diseaseReports, navigateTo, openModal } = useApp();
  const [activeFilter, setActiveFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);

  const filteredReports = diseaseReports.filter((r) => {
    if (activeFilter === 'All') return true;
    return r.riskLevel === activeFilter;
  });

  const riskBadgeClass = (level: string) =>
    level === 'High' ? 'fd-badge-critical' : level === 'Medium' ? 'fd-badge-warning' : 'fd-badge-success';

  const riskDotColor = (level: string) =>
    level === 'High' ? 'var(--critical)' : level === 'Medium' ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">

      {/* ── Page Header ── */}
      <div>
        <p className="fd-label mb-1">FarmDrishti / Surveillance Map</p>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          Disease Surveillance
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
          Real-time vector & outbreak tracking
        </p>
      </div>

      {/* ── Crimson Alert Banner ── */}
      <div
        className="fd-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 flex-shrink-0"
            style={{ background: 'var(--critical)', borderRadius: '2px', animation: 'urgent-pulse 2s infinite' }}
          >
            <ShieldAlert className="w-5 h-5" style={{ color: '#111311' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="fd-badge fd-badge-critical">CRIMSON ALERT</span>
              <span className="text-xs" style={{ color: 'var(--critical)', fontFamily: 'IBM Plex Mono, monospace' }}>Risk Level: HIGH</span>
            </div>
            <h3 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              Newcastle Disease Avian Vector Outbreak Alert
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Active risk detected in Zone 2 Poultry House. Quarantine buffer active.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('farm-map')}
          className="fd-btn-ghost flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto"
          style={{ borderColor: 'var(--critical-dim)', color: 'var(--critical)' }}
        >
          View Farm Map <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Satellite Risk Map ── */}
      <div className="fd-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              <MapPin className="w-4 h-4" style={{ color: 'var(--lime)' }} />
              Epidemiological Risk Map
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
              Spatial density heatmap & pathogen vector telemetry
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            {[
              { label: 'High Risk', color: 'var(--critical)' },
              { label: 'Medium',    color: 'var(--warning)' },
              { label: 'Low Risk',  color: 'var(--success)' },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Map Canvas */}
        <div
          className="relative w-full h-72 overflow-hidden"
          style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '2px' }}
        >
          {/* Grid overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="fdGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fdGrid)" />
          </svg>

          {/* Sector labels */}
          <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none opacity-50">
            <div className="flex justify-between">
              <span className="fd-label" style={{ border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '2px' }}>SECTOR 1 · SWINE</span>
              <span className="fd-label" style={{ border: '1px solid var(--warning-dim)', padding: '2px 6px', borderRadius: '2px', color: 'var(--warning)' }}>ZONE 2 · POULTRY</span>
            </div>
            <div className="flex justify-between">
              <span className="fd-label" style={{ border: '1px solid var(--success-dim)', padding: '2px 6px', borderRadius: '2px', color: 'var(--success)' }}>SECTOR 3 · BREEDER</span>
              <span className="fd-label" style={{ border: '1px solid var(--critical-dim)', padding: '2px 6px', borderRadius: '2px', color: 'var(--critical)' }}>SECTOR 4 · FARROWING</span>
            </div>
          </div>

          {/* Heatmap blobs */}
          <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full blur-2xl" style={{ background: 'rgba(255,118,95,0.2)', animation: 'urgent-pulse 2s infinite' }} />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full blur-xl" style={{ background: 'rgba(255,181,71,0.15)' }} />
          <div className="absolute bottom-1/4 left-1/5 w-20 h-20 rounded-full blur-xl" style={{ background: 'rgba(135,214,162,0.15)' }} />

          {/* Hotspot Pings */}
          {diseaseReports.map((rep) => {
            const isHigh = rep.riskLevel === 'High';
            const isMed = rep.riskLevel === 'Medium';
            const dotColor = isHigh ? 'var(--critical)' : isMed ? 'var(--warning)' : 'var(--success)';

            return (
              <div
                key={rep.id}
                onClick={() => setSelectedHotspot(rep)}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group/pin z-20"
                style={{ left: `${rep.coordinates.x}%`, top: `${rep.coordinates.y}%` }}
                title={`${rep.diseaseName} — Click for info`}
              >
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: dotColor, opacity: 0.5 }}
                />
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover/pin:scale-125"
                  style={{ background: dotColor, borderColor: 'var(--bg-panel)' }}
                >
                  <Crosshair className="w-3 h-3" style={{ color: '#111311' }} />
                </div>
                <div
                  className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 whitespace-nowrap shadow-lg opacity-0 group-hover/pin:opacity-100 transition-opacity"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--text-primary)', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  {rep.diseaseName}
                </div>
              </div>
            );
          })}

          {/* Selected Hotspot Panel */}
          {selectedHotspot && (
            <div
              className="absolute bottom-3 left-3 right-3 p-3.5 z-30 flex items-center justify-between gap-3"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '2px' }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                    {selectedHotspot.diseaseName}
                  </span>
                  <span className={`fd-badge ${riskBadgeClass(selectedHotspot.riskLevel)}`}>
                    {selectedHotspot.riskLevel} Risk
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
                  {selectedHotspot.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="fd-btn-icon flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Tabs + Add Case ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '3px' }}>
          {(['All', 'High', 'Medium', 'Low'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className="px-3 py-1.5 text-xs font-bold transition-all"
              style={{
                borderRadius: '2px',
                background: activeFilter === tab ? 'var(--lime-subtle)' : 'transparent',
                color: activeFilter === tab ? 'var(--lime)' : 'var(--text-secondary)',
                border: activeFilter === tab ? '1px solid var(--lime-dim)' : '1px solid transparent',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {tab} {tab === 'All' ? `(${diseaseReports.length})` : ''}
            </button>
          ))}
        </div>

        <button
          id="report-case-btn"
          onClick={() => openModal('add-case')}
          className="fd-btn flex items-center gap-1.5 self-start sm:self-auto"
          style={{ background: 'var(--critical)', borderColor: 'var(--critical)', color: '#111311' }}
        >
          <Plus className="w-4 h-4" /> Report New Case
        </button>
      </div>

      {/* ── Outbreak Reports ── */}
      <div className="space-y-2">
        <h2 className="fd-label">Active Outbreak Reports ({filteredReports.length})</h2>

        {filteredReports.map((report) => {
          const isHigh = report.riskLevel === 'High';
          const isMed = report.riskLevel === 'Medium';

          return (
            <div
              key={report.id}
              className="fd-card p-4"
              style={{
                borderColor: isHigh ? 'var(--critical-dim)' : isMed ? 'var(--warning-dim)' : 'var(--border)',
                background: isHigh ? 'var(--critical-bg)' : isMed ? 'var(--warning-bg)' : 'var(--bg-panel)',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`fd-badge ${riskBadgeClass(report.riskLevel)}`}>
                      {report.riskLevel} Risk
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
                      {report.reportedDate}
                    </span>
                  </div>

                  <h4 className="text-base font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                    {report.diseaseName}
                  </h4>
                  <p className="text-xs font-semibold" style={{ color: 'var(--lime)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {report.location}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {report.details}
                  </p>
                </div>

                <button
                  onClick={() => navigateTo('farm-map')}
                  className="fd-btn-ghost flex items-center gap-1 flex-shrink-0 text-xs"
                >
                  Map <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
