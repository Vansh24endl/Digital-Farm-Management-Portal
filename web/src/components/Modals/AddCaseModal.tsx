import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldAlert, Plus } from 'lucide-react';

export const AddCaseModal: React.FC = () => {
  const { activeModal, closeModal, addDiseaseReport } = useApp();

  const [diseaseName, setDiseaseName] = useState('');
  const [riskLevel, setRiskLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [location, setLocation] = useState('Sunrise Poultry House · Zone 2');
  const [speciesAffected, setSpeciesAffected] = useState('');
  const [details, setDetails] = useState('');

  if (activeModal !== 'add-case') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDiseaseReport({
      diseaseName: diseaseName || 'Unspecified Vector Outbreak',
      riskLevel,
      location,
      speciesAffected: speciesAffected || 'Flock B (500 Birds)',
      status: 'Active',
      details: details || 'Vector symptoms logged by Lead Vet during routine surveillance.',
      coordinates: { x: Math.floor(Math.random() * 60) + 20, y: Math.floor(Math.random() * 60) + 20 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#12131a] rounded-2xl border border-[#ba1a1a]/60 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#ba1a1a]/20 border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#ffb4ab]" />
            <h3 className="text-base font-bold font-serif text-white">Report New Disease Case</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Disease / Vector Name</label>
            <input
              type="text"
              placeholder="e.g. Newcastle Disease Strain B"
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#ba1a1a] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Risk Severity</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#ba1a1a] outline-none"
              >
                <option value="High">High (Red Flag)</option>
                <option value="Medium">Medium (Amber Warning)</option>
                <option value="Low">Low (Routine Monitoring)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Species / Population</label>
              <input
                type="text"
                placeholder="e.g. 800 Layer Hens"
                value={speciesAffected}
                onChange={(e) => setSpeciesAffected(e.target.value)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#ba1a1a] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Farm Sector & Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#ba1a1a] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Clinical Observation Details</label>
            <textarea
              rows={3}
              placeholder="Describe symptoms, swab results, or mortality signs..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#ba1a1a] outline-none"
              required
            />
          </div>

          <div className="pt-3 border-t border-[#34343c] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Submit Real-Time Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
