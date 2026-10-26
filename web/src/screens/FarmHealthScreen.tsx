import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Dna,
  Droplets,
  Thermometer,
  Wind,
  Gauge,
  Activity,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';


export const FarmHealthScreen: React.FC = () => {
  const { farmUnits, selectedFarmId, setSelectedFarmId, openModal } = useApp();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [farms, setFarms] = useState<any[]>(farmUnits);

  useEffect(() => {
    let mounted = true;
    api.getFarms()
      .then((response: any) => {
        const data = Array.isArray(response) ? response : response?.data;
        if (!mounted || !Array.isArray(data) || data.length === 0) return;
        const loadedFarms = data.map((farm: any) => ({
          ...farm,
          id: farm._id || farm.id,
          name: farm.name || farm.farmName || 'Unnamed Farm',
          status: farm.status || 'Active',
        }));
        setFarms(loadedFarms);
        if (!loadedFarms.some((farm: any) => farm.id === selectedFarmId)) {
          setSelectedFarmId(loadedFarms[0].id);
        }
      })
      .catch(() => {
        if (mounted) setFarms(farmUnits);
      });
    return () => { mounted = false; };
  }, []);

  const activeFarm = farms.find((farm) => farm.id === selectedFarmId) || farms[0] || { name: 'Select a farm' };

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">

      {/* ── Page Header ── */}
      <div>
        <p className="fd-label mb-1">FarmDrishti / Farm Health</p>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          Farm Health Overview
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
          Telemetry, water, temperature & PCR diagnostic
        </p>
      </div>

      {/* ── Controls: Farm Selector + Time Range ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <label className="fd-label" htmlFor="farm-selector">Farm Unit</label>
          <select
            id="farm-selector"
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="fd-select"
            style={{ minWidth: '220px' }}
          >
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name} ({farm.status})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 p-1" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '3px' }}>
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className="px-3 py-1.5 text-xs font-bold transition-all"
              style={{
                borderRadius: '2px',
                background: timeRange === range ? 'var(--lime-subtle)' : 'transparent',
                color: timeRange === range ? 'var(--lime)' : 'var(--text-secondary)',
                border: timeRange === range ? '1px solid var(--lime-dim)' : '1px solid transparent',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ── Health Score Card ── */}
      <div className="fd-card p-5" style={{ borderColor: 'var(--success-dim)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Circular Gauge */}
          <div className="flex flex-col items-center text-center flex-shrink-0">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="var(--border-dim)" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke="var(--success)"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - 0.92)}
                  strokeLinecap="square"
                  fill="transparent"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-display text-4xl leading-none"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  92
                </span>
                <span className="fd-label mt-1" style={{ color: 'var(--success)' }}>Optimal</span>
              </div>
            </div>
            <span className="mt-2 text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
              Sample view · {timeRange}
            </span>
          </div>

          {/* Health Stats */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <span className="fd-badge fd-badge-success inline-flex">
              <ShieldCheck className="w-3 h-3" /> Overall: Excellent (92/100)
            </span>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              {activeFarm.name} Telemetry Summary
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Biometric and micro-environment telemetry verified for {activeFarm.name}. Live sensor arrays, automated waterline metering, and PCR diagnostics active.
            </p>
          </div>
        </div>
      </div>

      {/* ── PCR Diagnostic Card ── */}
      <button
        onClick={() => openModal('pcr-certificate')}
        className="fd-card-hover w-full text-left p-5 group"
        style={{ borderColor: 'var(--lime-dim)' }}
        aria-label="Open PCR Certificate"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="p-3 flex-shrink-0"
              style={{ background: 'var(--lime-subtle)', border: '1px solid var(--border)', borderRadius: '2px' }}
            >
              <Dna className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div>
              <span className="fd-label">Laboratory PCR Molecular Screening</span>
              <h3
                className="text-base font-bold mt-0.5"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
              >
                No significant pathogens detected in latest batch
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
                Swab Specimen Batch #9411 · Updated 2 hours ago
              </p>
            </div>
          </div>

          <span className="fd-btn-ghost flex items-center gap-1.5 self-start sm:self-auto text-xs">
            Open Certificate <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>

      {/* ── Telemetry Sparkline Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Intake */}
        <div className="fd-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
              <h4 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                Water Consumption Intake
              </h4>
            </div>
            <span className="fd-badge fd-badge-success">Stable</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>4.2</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>L / Head / Day</span>
          </div>

          <div className="h-20 w-full">
            <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
              <path d="M 0,60 Q 50,45 100,50 T 200,30 T 300,35" fill="none" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round" />
              <path d="M 0,60 Q 50,45 100,50 T 200,30 T 300,35 L 300,80 L 0,80 Z" fill="var(--lime-subtle)" />
            </svg>
          </div>
        </div>

        {/* Ambient Temperature */}
        <div className="fd-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" style={{ color: 'var(--warning)' }} />
              <h4 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                Ambient Barn Temperature
              </h4>
            </div>
            <span className="fd-badge fd-badge-lime">Target Zone</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>22.1</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>°Celsius</span>
          </div>

          <div className="h-20 w-full">
            <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
              <path d="M 0,40 Q 60,35 120,45 T 240,25 T 300,30" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" />
              <path d="M 0,40 Q 60,35 120,45 T 240,25 T 300,30 L 300,80 L 0,80 Z" fill="var(--warning-bg)" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Micro-Environment Telemetry Grid ── */}
      <div>
        <h2 className="fd-label mb-3">Micro-Environment Sensor Telemetry</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Ammonia NH3', value: '12', unit: 'ppm', icon: <Gauge className="w-4 h-4" />, status: 'Below 25ppm Limit', statusColor: 'var(--success)' },
            { label: 'Air Velocity', value: '1.4', unit: 'm/s', icon: <Wind className="w-4 h-4" />, status: 'Continuous Airflow', statusColor: 'var(--success)' },
            { label: 'Rel. Humidity', value: '58', unit: '%', icon: <Droplets className="w-4 h-4" />, status: 'Comfort Band', statusColor: 'var(--success)' },
            { label: 'Flock Mortality', value: '0.02', unit: '%', icon: <Activity className="w-4 h-4" />, status: 'Ultra Low (Optimal)', statusColor: 'var(--success)' },
          ].map(({ label, value, unit, icon, status, statusColor }) => (
            <div key={label} className="fd-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="fd-label">{label}</span>
                <span style={{ color: 'var(--text-primary)' }}>{icon}</span>
              </div>
              <p className="font-display text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                {value} <span className="text-xs font-normal" style={{ color: 'var(--text-dim)' }}>{unit}</span>
              </p>
              <span className="text-xs font-semibold" style={{ color: statusColor, fontFamily: 'IBM Plex Mono, monospace' }}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};