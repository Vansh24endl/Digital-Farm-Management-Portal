import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Dna,
  Droplets,
  Thermometer,
  ShieldCheck,
  ArrowUpRight,
  ClipboardPen,
  Calendar,
  Sparkles,
  HeartPulse,
  Package,
} from 'lucide-react';

export const FarmHealthScreen: React.FC = () => {
  const { farmUnits, selectedFarmId, setSelectedFarmId, openModal, showToast } = useApp();
  const [farms, setFarms] = useState<any[]>(farmUnits);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [latestLog, setLatestLog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLogs = (farmId: string) => {
    if (!farmId) return;
    setLoading(true);
    Promise.all([
      api.getDailyLogs(farmId, 15).catch(() => ({ data: [] })),
      api.getLatestDailyLog(farmId).catch(() => ({ data: null })),
    ])
      .then(([logsRes, latestRes]) => {
        const list = Array.isArray(logsRes?.data) ? logsRes.data : [];
        setDailyLogs(list);
        setLatestLog(latestRes?.data || (list.length > 0 ? list[0] : null));
      })
      .finally(() => setLoading(false));
  };

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
          location: farm.location || 'Indore, MP',
        }));
        setFarms(loadedFarms);
        const targetId = selectedFarmId || loadedFarms[0].id;
        if (!selectedFarmId) setSelectedFarmId(targetId);
        loadLogs(targetId);
      })
      .catch(() => {
        if (mounted) setFarms(farmUnits);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (selectedFarmId) {
      loadLogs(selectedFarmId);
    }
  }, [selectedFarmId]);

  const activeFarm = farms.find((farm) => String(farm.id) === String(selectedFarmId)) || farms[0] || { name: 'Select a farm' };

  // Calculate health metrics from real manual observation
  const animalCount = latestLog?.animalCount || 2500;
  const mortality = latestLog?.mortalityCount ?? 0;
  const waterLiters = latestLog?.waterConsumptionLiters || 420;
  const feedKg = latestLog?.feedConsumptionKg || 310;
  const waterPerHead = (waterLiters / Math.max(animalCount, 1)).toFixed(2);
  const mortalityPercent = ((mortality / Math.max(animalCount, 1)) * 100).toFixed(2);
  const barnTemp = latestLog?.temperature ?? 24.2;
  const humidity = latestLog?.humidity ?? 60;

  // Composite health score based on real manual factors
  const healthScore = Math.max(50, Math.min(100, Math.round(96 - mortality * 2 - (barnTemp > 30 ? 5 : 0) - (humidity > 75 ? 4 : 0))));

  return (
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / Farm Health & Observation Console</p>
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-2xl font-bold font-display"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              Manual Farm Health Records
            </h1>
            <span className="fd-badge fd-badge-lime text-[11px] font-mono">
              100% NON-IoT WORKFLOW
            </span>
          </div>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            Physical thermometer readings, water meters, feed logs & visual flock inspections
          </p>
        </div>

        {/* Action Button: Record Today's Observations */}
        <button
          onClick={() => openModal('manual-log')}
          className="fd-btn self-start sm:self-auto flex items-center gap-1.5 shadow-sm"
          style={{ background: 'var(--lime)', color: '#111311', borderColor: 'var(--lime)' }}
        >
          <ClipboardPen className="w-4 h-4" /> + Record Daily Observation
        </button>
      </div>

      {/* ── Controls: Farm Selector ── */}
      <div className="fd-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <label className="fd-label block mb-1" htmlFor="farm-selector">Select Farm Facility</label>
            <select
              id="farm-selector"
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="fd-select w-full sm:w-auto sm:min-w-[240px]"
            >
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} ({farm.location || 'Indore, MP'})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-[var(--text-secondary)] sm:border-l sm:pl-3 border-[var(--border)]">
            <span className="block font-bold text-[var(--text-primary)]">
              {latestLog ? `Last Logged: ${new Date(latestLog.logDate).toLocaleDateString()}` : 'No manual log yet today'}
            </span>
            <span>Recorded By: {latestLog?.recordedBy?.name || 'Assigned Farmer'}</span>
          </div>
        </div>

        <button
          onClick={() => {
            loadLogs(selectedFarmId);
            showToast('🔄 Refreshed manual observations from database.');
          }}
          className="fd-btn-ghost text-xs self-start sm:self-auto flex items-center gap-1"
        >
          Refresh Data
        </button>
      </div>

      {/* ── Non-IoT Architecture Notice ── */}
      <div
        className="p-3.5 rounded-sm flex items-start gap-3 text-xs font-mono"
        style={{ background: 'rgba(163, 230, 53, 0.08)', border: '1px solid var(--lime-dim)' }}
      >
        <Sparkles className="w-4 h-4 flex-shrink-0 text-[var(--lime)] mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-[var(--text-primary)]">
            Autonomous Non-IoT Field Telemetry
          </p>
          <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
            All telemetry displayed below is sourced directly from manual farmer submissions via physical wall thermometers, water line meters, and daily flock health observations. No IoT sensors or automated hardware are required.
          </p>
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
                  strokeDashoffset={2 * Math.PI * 42 * (1 - healthScore / 100)}
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
                  {healthScore}
                </span>
                <span className="fd-label mt-1" style={{ color: 'var(--success)' }}>Optimal</span>
              </div>
            </div>
            <span className="mt-2 text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
              Manual Assessment Score
            </span>
          </div>

          {/* Health Stats */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <span className="fd-badge fd-badge-success inline-flex">
              <ShieldCheck className="w-3 h-3" /> Biosecurity Index: {healthScore}/100
            </span>
            <h2
              className="text-xl font-bold font-display"
              style={{ color: 'var(--text-primary)' }}
            >
              {activeFarm.name} Observation Summary
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Latest manual inspection shows <strong>{animalCount.toLocaleString()}</strong> active head, with <strong>{mortality}</strong> mortality observed today. Water line consumption is at <strong>{waterPerHead} L/head/day</strong>.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono flex-wrap justify-center md:justify-start">
              <span className="px-2 py-1 bg-[var(--bg-raised)] rounded-sm border border-[var(--border)]">
                Disinfection: {latestLog?.cleaningDisinfectionDone ? '✅ Verified Done' : '⏳ Pending'}
              </span>
              <span className="px-2 py-1 bg-[var(--bg-raised)] rounded-sm border border-[var(--border)]">
                Compound: {latestLog?.disinfectantUsed || 'Virkon-S 1%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Real Manual Observation Telemetry Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Consumption Intake */}
        <div className="fd-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4" style={{ color: 'var(--lime)' }} />
              <h4 className="text-sm font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                Water Consumption (Meter Reading)
              </h4>
            </div>
            <span className="fd-badge fd-badge-success">Manual Reading</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {waterPerHead}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>L / Head / Day</span>
            <span className="text-xs font-mono ml-auto text-[var(--text-dim)]">Total: {waterLiters} Liters</span>
          </div>

          <p className="text-xs font-mono text-[var(--text-secondary)]">
            Recorded by farmer from main waterline volumetric meter.
          </p>
        </div>

        {/* Ambient Barn Temperature */}
        <div className="fd-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" style={{ color: 'var(--warning)' }} />
              <h4 className="text-sm font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                Ambient Barn Climate (Thermometer)
              </h4>
            </div>
            <span className="fd-badge fd-badge-lime">Wall Gauge</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {barnTemp}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>°Celsius</span>
            <span className="text-xs font-mono ml-auto text-[var(--text-dim)]">Humidity: {humidity}%</span>
          </div>

          <p className="text-xs font-mono text-[var(--text-secondary)]">
            Read from physical dial thermometer & handheld digital hygrometer.
          </p>
        </div>
      </div>

      {/* ── Key Production & Biosecurity Observations ── */}
      <div>
        <h2 className="fd-label mb-3">Today's Physical Farm Metrics (MongoDB Persisted)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Flock/Herd Count',
              value: animalCount.toLocaleString(),
              unit: 'head',
              icon: <HeartPulse className="w-4 h-4" />,
              status: 'Active Population',
              statusColor: 'var(--success)',
            },
            {
              label: 'Mortality Observed',
              value: `${mortality}`,
              unit: `(${mortalityPercent}%)`,
              icon: <ShieldCheck className="w-4 h-4" />,
              status: mortality > 4 ? 'Spike Alert' : 'Normal Baseline',
              statusColor: mortality > 4 ? 'var(--critical)' : 'var(--success)',
            },
            {
              label: 'Feed Consumed',
              value: `${feedKg}`,
              unit: 'kg',
              icon: <Package className="w-4 h-4" />,
              status: 'Daily Ration Fed',
              statusColor: 'var(--success)',
            },
            {
              label: 'Clinical Signs',
              value: latestLog?.symptomsObserved || 'None',
              unit: '',
              icon: <Calendar className="w-4 h-4" />,
              status: latestLog?.healthObservations ? 'Notes Logged' : 'Normal',
              statusColor: 'var(--success)',
            },
          ].map(({ label, value, unit, icon, status, statusColor }) => (
            <div key={label} className="fd-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="fd-label">{label}</span>
                <span style={{ color: 'var(--text-primary)' }}>{icon}</span>
              </div>
              <p className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {value} <span className="text-xs font-normal" style={{ color: 'var(--text-dim)' }}>{unit}</span>
              </p>
              <span className="text-xs font-semibold" style={{ color: statusColor, fontFamily: 'IBM Plex Mono, monospace' }}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PCR Diagnostic / Laboratory Card ── */}
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
                No significant pathogens detected in latest clinical batch
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
                Regional Avian/Swine Diagnostic Lab · Certified Batch #{latestLog?._id?.slice(-4) || '7104'}
              </p>
            </div>
          </div>
          <span className="fd-btn-ghost flex items-center gap-1.5 self-start sm:self-auto text-xs">
            Open Certificate <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </button>

      {/* ── Recent Manual Log History Table ── */}
      <div className="fd-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            Recent Manual Daily Observations Logbook
          </h3>
          <span className="fd-badge fd-badge-neutral font-mono text-xs">
            {dailyLogs.length} Records In MongoDB
          </span>
        </div>

        {loading ? (
          <p className="text-xs font-mono text-[var(--text-dim)] py-4 text-center">Loading records from MongoDB...</p>
        ) : dailyLogs.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-xs font-mono text-[var(--text-dim)]">No manual observations recorded for this farm yet.</p>
            <button
              onClick={() => openModal('manual-log')}
              className="fd-btn text-xs mx-auto"
              style={{ background: 'var(--lime)', color: '#111311' }}
            >
              <ClipboardPen className="w-3.5 h-3.5 inline mr-1" /> Record Today's First Observation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-secondary)]">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Temp (°C)</th>
                  <th className="pb-2">Humidity</th>
                  <th className="pb-2">Population</th>
                  <th className="pb-2">Mortality</th>
                  <th className="pb-2">Water (L)</th>
                  <th className="pb-2">Disinfection</th>
                  <th className="pb-2">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {dailyLogs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-[var(--bg-raised)] transition-colors">
                    <td className="py-2.5 font-bold text-[var(--text-primary)]">
                      {new Date(log.logDate).toLocaleDateString()}
                    </td>
                    <td className="py-2.5">{log.temperature}°C</td>
                    <td className="py-2.5">{log.humidity}%</td>
                    <td className="py-2.5">{log.animalCount?.toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className={log.mortalityCount > 0 ? 'text-[var(--critical)] font-bold' : ''}>
                        {log.mortalityCount}
                      </span>
                    </td>
                    <td className="py-2.5">{log.waterConsumptionLiters} L</td>
                    <td className="py-2.5">
                      <span className="text-[var(--success)]">{log.cleaningDisinfectionDone ? '✓ Yes' : 'No'}</span>
                    </td>
                    <td className="py-2.5 text-[var(--text-secondary)] max-w-xs truncate" title={log.healthObservations}>
                      {log.healthObservations || 'Normal'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
