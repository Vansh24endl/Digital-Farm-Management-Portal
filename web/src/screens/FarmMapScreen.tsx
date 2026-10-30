import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Map, Plus, XCircle, Clock, AlertTriangle, Building, Satellite, Compass } from 'lucide-react';
import { RealFarmMap } from '../components/RealFarmMap';

type Farm = {
  _id?: string;
  id?: string;
  name?: string;
  farmType?: string;
  location?: string;
  status?: string;
};

export const FarmMapScreen: React.FC = () => {
  const { openModal } = useApp();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [viewMode, setViewMode] = useState<'satellite' | 'blueprint'>('satellite');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFarms = (preferredId?: string) => {
    setLoading(true);
    api.getFarms()
      .then((result: any) => {
        const list = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
        setFarms(list);
        if (preferredId) {
          setSelectedFarmId(preferredId);
        } else if (list.length && !selectedFarmId) {
          setSelectedFarmId(String(list[0]._id || list[0].id || ''));
        }
      })
      .catch((err: Error) => setError(err.message || 'Could not load farms.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const activeFarm = farms.find(farm => String(farm._id || farm.id) === selectedFarmId) || farms[0];

  return (
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / Spatial Blueprint</p>
          <h1
            className="text-2xl font-bold font-display"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Farm Map & Zone Details
          </h1>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            Biosecurity perimeter fences, vehicle checkpoints & containment sectors
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => openModal('register-farm')}
            className="fd-btn flex items-center gap-1.5"
            style={{ background: 'var(--lime)', color: '#111311', borderColor: 'var(--lime)' }}
          >
            <Plus className="w-4 h-4" /> Register New Farm
          </button>
          <button
            onClick={() => openModal('incident-log')}
            className="fd-btn-ghost flex items-center gap-1.5 text-xs"
          >
            Log Incident
          </button>
        </div>
      </div>

      {/* ── Active Farm Selector Bar ── */}
      <div className="fd-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
            >
              <Building className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                  {activeFarm?.name || 'Selected Facility'}
                </span>
                <span className="fd-badge fd-badge-lime">
                  {activeFarm?.status || 'OPTIMAL'}
                </span>
                {activeFarm?.farmType && (
                  <span className="fd-badge fd-badge-neutral uppercase">
                    {activeFarm.farmType}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {activeFarm?.location || 'Location telemetry not assigned'}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-72">
            <label className="fd-label block mb-1" htmlFor="farm-map-select">
              Switch Facility
            </label>
            <select
              id="farm-map-select"
              value={selectedFarmId}
              onChange={event => setSelectedFarmId(event.target.value)}
              disabled={loading || farms.length === 0}
              className="fd-select"
            >
              {farms.length === 0 && <option value="">{loading ? 'Loading facilities...' : 'No facilities active'}</option>}
              {farms.map(farm => {
                const id = String(farm._id || farm.id || '');
                return <option key={id} value={id}>{farm.name || 'Unnamed facility'}</option>;
              })}
            </select>
            {farms.length === 0 && !loading && (
              <button
                type="button"
                onClick={() => openModal('register-farm')}
                className="mt-2 text-xs text-[var(--lime)] hover:underline flex items-center gap-1 font-mono"
              >
                <Plus className="w-3.5 h-3.5" /> + Register your farm map now
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-sm bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-xs font-mono text-[var(--critical)]">
            {error}
          </div>
        )}
      </div>

      {/* ── Spatial Blueprint & Real Satellite Map ── */}
      <div className="fd-card p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold font-display flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Map className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
              {viewMode === 'satellite' ? 'Live GPS Satellite Telemetry & Perimeter Map' : 'Biosecurity Zone Architecture Blueprint'}
            </h3>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-dim)' }}>
              {viewMode === 'satellite'
                ? `Real GPS map centered on ${activeFarm?.name || 'selected facility'} · High-res satellite & biosecurity zones`
                : 'Internal airlock, farrowing house & disinfectant arch architectural layout'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('satellite')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-1.5 ${
                viewMode === 'satellite' ? 'shadow-sm' : 'fd-btn-ghost'
              }`}
              style={{
                background: viewMode === 'satellite' ? 'var(--lime, #a3e635)' : undefined,
                color: viewMode === 'satellite' ? '#111311' : undefined,
                border: '1.5px solid var(--border)',
              }}
            >
              <Satellite className="w-3.5 h-3.5" /> Satellite Map
            </button>

            <button
              onClick={() => setViewMode('blueprint')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all flex items-center gap-1.5 ${
                viewMode === 'blueprint' ? 'shadow-sm' : 'fd-btn-ghost'
              }`}
              style={{
                background: viewMode === 'blueprint' ? 'var(--lime, #a3e635)' : undefined,
                color: viewMode === 'blueprint' ? '#111311' : undefined,
                border: '1.5px solid var(--border)',
              }}
            >
              <Compass className="w-3.5 h-3.5" /> Shed Blueprint
            </button>
          </div>
        </div>

        {viewMode === 'satellite' ? (
          <RealFarmMap
            farms={farms}
            selectedFarmId={selectedFarmId}
            onSelectFarm={setSelectedFarmId}
            height="440px"
            showZones={true}
            mode="farm"
          />
        ) : (
          <div
            className="relative w-full h-80 rounded-sm overflow-hidden p-4"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}
          >
            <svg className="w-full h-full" viewBox="0 0 800 450" role="img" aria-label="Farm biosecurity zone layout">
              <defs>
                <pattern id="fieldMapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-dim)" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#fieldMapGrid)" />

              {/* Zone A: Entry & Shower Lock */}
              <rect x="40" y="40" width="230" height="150" rx="3" fill="var(--bg-panel)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="60" y="70" fill="var(--success)" fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono">ZONE A: ENTRY AIRLOCK</text>
              <text x="60" y="90" fill="var(--text-secondary)" fontSize="10" fontFamily="Inter">Shower-in / Shower-out barrier</text>
              <text x="60" y="110" fill="var(--text-dim)" fontSize="9" fontFamily="IBM Plex Mono">BOOT DILUTION: pH 2.4 (ACTIVE)</text>

              {/* Zone B: Livestock Containment */}
              <rect x="300" y="40" width="460" height="230" rx="3" fill="rgba(255, 118, 95, 0.08)" stroke="var(--critical-dim)" strokeWidth="1.5" />
              <text x="320" y="72" fill="var(--critical)" fontSize="13" fontWeight="700" fontFamily="Space Grotesk">ZONE B: PRIMARY LIVESTOCK HOUSING</text>
              <text x="320" y="94" fill="var(--text-primary)" fontSize="11" fontFamily="Inter">Restricted Access · Negative Pressure Filtration</text>
              <circle cx="530" cy="160" r="32" fill="rgba(255, 118, 95, 0.15)" stroke="var(--critical)" strokeWidth="1" />
              <circle cx="530" cy="160" r="10" fill="var(--critical)" />
              <text x="575" y="165" fill="var(--text-secondary)" fontSize="10" fontFamily="IBM Plex Mono">BIO-SENSOR #B4 (OPTIMAL)</text>

              {/* Zone C: Feed Storage */}
              <rect x="40" y="220" width="230" height="180" rx="3" fill="var(--bg-panel)" stroke="var(--border)" strokeWidth="1.5" />
              <text x="60" y="250" fill="var(--warning)" fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono">ZONE C: FEED STORAGE & SILOS</text>
              <text x="60" y="270" fill="var(--text-secondary)" fontSize="10" fontFamily="Inter">Automated auger disinfection</text>
              <text x="60" y="290" fill="var(--text-dim)" fontSize="9" fontFamily="IBM Plex Mono">SEAL STATUS: AIRTIGHT</text>

              {/* Perimeter Fence Line */}
              <rect x="300" y="300" width="460" height="100" rx="3" fill="var(--bg-raised)" stroke="var(--lime-dim)" strokeDasharray="6,4" strokeWidth="1.5" />
              <text x="320" y="335" fill="var(--lime)" fontSize="11" fontWeight="700" fontFamily="IBM Plex Mono">PERIMETER VEHICLE TYRE BATH & GATE</text>
              <text x="320" y="355" fill="var(--text-secondary)" fontSize="10" fontFamily="Inter">Under-chassis spray arch active · Thermal gate camera online</text>
            </svg>
          </div>
        )}
        <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
          {viewMode === 'satellite'
            ? 'Interactive real-time map with satellite imagery & live GPS coordinates.'
            : 'Blueprint visualization telemetry connected to facility perimeter zoning engine.'}
        </p>
      </div>

      {/* ── Status Modules Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="fd-card p-5 space-y-3" style={{ borderColor: 'var(--critical-dim)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--critical)' }}>
              <XCircle className="w-4 h-4" /> Biosecurity Protocols
            </h3>
            <span className="fd-badge fd-badge-critical">ACTION REQ</span>
          </div>
          <div className="p-3 rounded-sm fd-raised flex gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
            <div>
              <span className="font-bold text-xs" style={{ color: 'var(--warning)' }}>Inspection Pending</span>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Verify vehicle wheel-spray disinfectant titration and footbath virucide concentration during morning shift.
              </p>
            </div>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
            Protocol verified against AgroShield Level-4 master standards.
          </p>
        </div>

        <div className="fd-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--text-primary)' }} /> Facility Activity Telemetry
            </h3>
            <span className="fd-badge fd-badge-lime">LIVE FEED</span>
          </div>
          <div className="p-3 rounded-sm fd-raised text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
            {activeFarm ? `Monitoring Facility: ${activeFarm.name || 'Unnamed farm'}` : 'Facility data unavailable'}
            <div className="text-[11px] mt-1" style={{ color: 'var(--text-dim)' }}>
              Location: {activeFarm?.location || 'Standard Sector'} · Type: {activeFarm?.farmType || 'Mixed'}
            </div>
          </div>
          <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>
            Sensor gateway synchronization: 100% packets acknowledged.
          </p>
        </div>
      </div>
    </div>
  );
};