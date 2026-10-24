import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { X, ShieldAlert, Plus, Building2 } from 'lucide-react';

export const AddCaseModal: React.FC = () => {
  const { activeModal, closeModal, addDiseaseReport, selectedFarmId } = useApp();

  const [diseaseName, setDiseaseName] = useState('');
  const [animalType, setAnimalType] = useState<'poultry' | 'pig'>('poultry');
  const [riskLevel, setRiskLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [farmId, setFarmId] = useState(selectedFarmId || '');
  const [location, setLocation] = useState('Zone 2 · Sector B');
  const [speciesAffected, setSpeciesAffected] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (activeModal === 'add-case') {
      api.getFarms()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          setFarms(list.map((f: any) => ({
            id: String(f._id || f.id),
            name: String(f.name || 'Unnamed Farm'),
          })));
          if (list.length > 0 && !farmId) {
            setFarmId(String(list[0]._id || list[0].id));
          }
        })
        .catch(() => {});
    }
  }, [activeModal]);

  if (activeModal !== 'add-case') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDiseaseReport({
        farmId: farmId || selectedFarmId || undefined,
        diseaseName: diseaseName || 'Unspecified Vector Outbreak',
        animalType,
        riskLevel,
        location: location || 'Main Facility',
        speciesAffected: speciesAffected || (animalType === 'pig' ? 'Swine Herd (250 head)' : 'Layer Flock (800 birds)'),
        status: 'Active',
        details: details || 'Vector symptoms logged by Lead Vet during routine surveillance.',
        coordinates: { x: Math.floor(Math.random() * 60) + 20, y: Math.floor(Math.random() * 60) + 20 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] rounded-[3px] border border-[var(--critical-dim)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[var(--critical)]" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">Report New Disease Case</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          {farms.length > 0 && (
            <div>
              <label className="fd-label block mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[var(--text-dim)]" /> Target Farm
              </label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="fd-select w-full text-xs font-mono"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="fd-label block mb-1">Disease / Pathogen Name</label>
            <input
              type="text"
              placeholder="e.g. African Swine Fever / Newcastle Disease"
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              className="fd-input w-full text-xs font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="fd-label block mb-1">Livestock Species</label>
              <select
                value={animalType}
                onChange={(e) => setAnimalType(e.target.value as any)}
                className="fd-select w-full text-xs font-mono"
              >
                <option value="poultry">Poultry (Birds)</option>
                <option value="pig">Swine (Pigs)</option>
              </select>
            </div>

            <div>
              <label className="fd-label block mb-1">Risk Severity</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="fd-select w-full text-xs font-mono"
              >
                <option value="High">High (Crimson Alert)</option>
                <option value="Medium">Medium (Amber Warning)</option>
                <option value="Low">Low (Routine Monitoring)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="fd-label block mb-1">Zone / Sector</label>
              <input
                type="text"
                value={location}
                placeholder="e.g. Sector 4 · House 3"
                onChange={(e) => setLocation(e.target.value)}
                className="fd-input w-full text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="fd-label block mb-1">Affected Group</label>
              <input
                type="text"
                placeholder="e.g. 500 Birds / 120 Pigs"
                value={speciesAffected}
                onChange={(e) => setSpeciesAffected(e.target.value)}
                className="fd-input w-full text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="fd-label block mb-1">Clinical Observations / Symptoms</label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, swab diagnostics, mortality, or quarantine action..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="fd-input w-full text-xs font-sans resize-none"
              required
            />
          </div>

          <div className="pt-2.5 border-t border-[var(--border-dim)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-[var(--critical)] text-[#111311] hover:bg-[#e05a45] rounded-[2px] flex items-center gap-1.5 shadow-sm transition-all"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-[#111311] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
