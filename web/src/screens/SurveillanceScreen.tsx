import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  MapPin,
  Plus,
  ChevronRight,
  X,
} from 'lucide-react';
import { RealFarmMap } from '../components/RealFarmMap';


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
              <MapPin className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
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

        {/* ── Real Satellite & Geographic Disease Surveillance Map ── */}
        <RealFarmMap
          diseaseReports={filteredReports.map((r: any) => ({
            id: r.id || r._id,
            diseaseName: r.diseaseName,
            symptoms: r.symptoms || r.description,
            riskLevel: r.riskLevel,
            severity: r.severity || r.riskLevel,
            location: r.location || (r.farmId && typeof r.farmId === 'object' ? r.farmId.name : 'Farm Vector Zone'),
          }))}
          height="380px"
          mode="surveillance"
        />

        {/* Selected Hotspot Panel */}
        {selectedHotspot && (
          <div
            className="p-3.5 flex items-center justify-between gap-3 animate-fadeIn"
            style={{ background: 'var(--bg-raised)', border: '1.5px solid var(--border)', borderRadius: '3px' }}
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
              className="fd-btn-icon"
              aria-label="Close details"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
          style={{ background: 'var(--critical)', borderColor: 'var(--critical)', color: '#FFFFFF' }}
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
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'IBM Plex Mono, monospace' }}>
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
