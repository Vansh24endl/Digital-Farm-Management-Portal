import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Map, Plus, XCircle, Clock, AlertTriangle } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getFarms()
      .then((result: any) => {
        const list = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
        setFarms(list);
        if (list.length) setSelectedFarmId(String(list[0]._id || list[0].id || ''));
      })
      .catch((err: Error) => setError(err.message || 'Could not load farms.'))
      .finally(() => setLoading(false));
  }, []);

  const activeFarm = farms.find(farm => String(farm._id || farm.id) === selectedFarmId) || farms[0];

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      <div className="surface-card rounded-2xl p-5 border border-[#34343c] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1a178c]/30 text-[#c0c1ff] text-xs font-bold border border-[#c0c1ff]/30">
                FARM LOCATION
              </span>
              {activeFarm?.status && <span className="text-xs text-slate-400">Status: {activeFarm.status}</span>}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
              {activeFarm?.name || 'Farm Map'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {activeFarm?.location || 'Farm location not provided'}
              {activeFarm?.farmType ? ` · ${activeFarm.farmType}` : ''}
            </p>
            <div className="mt-3 max-w-sm">
              <label className="block text-xs text-slate-400 mb-1" htmlFor="farm-map-select">Select farm</label>
              <select
                id="farm-map-select"
                value={selectedFarmId}
                onChange={event => setSelectedFarmId(event.target.value)}
                disabled={loading || farms.length === 0}
                className="w-full px-3 py-2 rounded-xl bg-[#1b1b22] border border-[#34343c] text-slate-100 text-sm outline-none"
              >
                {farms.length === 0 && <option value="">{loading ? 'Loading farms...' : 'No farms available'}</option>}
                {farms.map(farm => {
                  const id = String(farm._id || farm.id || '');
                  return <option key={id} value={id}>{farm.name || 'Unnamed farm'}</option>;
                })}
              </select>
            </div>
            {error && <p className="text-xs text-red-300 mt-2">{error}</p>}
            {!loading && !error && farms.length === 0 && <p className="text-xs text-amber-300 mt-2">Add a farm first to display it here.</p>}
          </div>
          <button
            onClick={() => openModal('incident-log')}
            className="px-4 py-2.5 rounded-xl bg-[#ffba3f] text-black hover:bg-[#ffba3f]/90 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Log Incident
          </button>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-5 border border-[#34343c] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold font-serif text-white flex items-center gap-2">
            <Map className="w-4 h-4 text-[#c0c1ff]" /> Spatial Zone Blueprint
          </h3>
          <span className="text-xs text-amber-300">Illustrative layout</span>
        </div>
        <div className="relative w-full h-80 rounded-2xl bg-[#0d0e14] border border-[#34343c] overflow-hidden p-4">
          <svg className="w-full h-full" viewBox="0 0 800 450" role="img" aria-label="Illustrative farm biosecurity zone blueprint">
            <defs><pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#292931" strokeWidth="1" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#mapGrid)" />
            <rect x="50" y="50" width="220" height="150" rx="10" fill="#1b1b22" stroke="#34343c" strokeWidth="2" />
            <text x="70" y="80" fill="#4CAF50" fontSize="12" fontWeight="bold">ZONE A: ENTRY</text>
            <text x="70" y="100" fill="#94a3b8" fontSize="10">Clean / dirty separation</text>
            <rect x="320" y="50" width="430" height="220" rx="10" fill="#ba1a1a" fillOpacity="0.12" stroke="#ba1a1a" strokeWidth="2" />
            <text x="340" y="80" fill="#ffb4ab" fontSize="14" fontWeight="bold">ZONE B: LIVESTOCK AREA</text>
            <text x="340" y="102" fill="#e2e8f0" fontSize="11">Review local biosecurity risks</text>
            <circle cx="530" cy="160" r="30" fill="#ba1a1a" fillOpacity="0.2" />
            <circle cx="530" cy="160" r="10" fill="#ba1a1a" />
            <rect x="50" y="240" width="240" height="160" rx="10" fill="#1b1b22" stroke="#34343c" strokeWidth="2" />
            <text x="70" y="270" fill="#ffba3f" fontSize="12" fontWeight="bold">ZONE C: FEED / STORAGE</text>
            <rect x="340" y="310" width="390" height="90" rx="10" fill="#1f1f26" stroke="#ffba3f" strokeDasharray="5,5" strokeWidth="2" />
            <text x="360" y="340" fill="#ffba3f" fontSize="12" fontWeight="bold">PERIMETER / VEHICLE CHECK</text>
          </svg>
        </div>
        <p className="text-xs text-slate-400">This is a sample blueprint, not a GPS map. Actual farm coordinates and sensor readings are not available from the current farms API.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="surface-card p-5 rounded-2xl border border-[#ba1a1a]/50 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb4ab] flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-[#ba1a1a]" /> Biosecurity checks
          </h3>
          <div className="p-3 rounded-xl bg-[#ffba3f]/10 border border-[#ffba3f]/30 text-slate-200 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-[#ffba3f] shrink-0 mt-0.5" />
            <div><span className="font-bold text-[#ffba3f]">Review required</span><p className="text-[11px] text-slate-300 mt-0.5">Verify vehicle disinfection and footbath concentration during farm inspections.</p></div>
          </div>
          <p className="text-xs text-slate-400">No live failed-protocol records are connected yet.</p>
        </div>
        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#c0c1ff]" /> Farm activity
          </h3>
          <div className="p-3 rounded-xl bg-[#1f1f26] border border-[#34343c] text-xs text-slate-300">
            {activeFarm ? `Selected farm: ${activeFarm.name || 'Unnamed farm'}` : 'Farm data is unavailable.'}
          </div>
          <p className="text-xs text-slate-400">Live sensor and gate logs will appear here when a telemetry API is connected.</p>
        </div>
      </div>
    </div>
  );
};