import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Plus } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AddVisitorModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();
  const [farms, setFarms] = useState<any[]>([]);
  const [farmId, setFarmId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Feed Supplier / Logistics Driver');
  const [company, setCompany] = useState('National Agri Express');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Bulk Delivery & Swab Verification');
  const [temperature, setTemperature] = useState('36.5');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeModal !== 'add-visitor') return;
    fetch(`${API}/farms`)
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Could not load farms');
        const list = Array.isArray(result) ? result : result.data || [];
        setFarms(list);
        if (list.length) setFarmId(String(list[0]._id || list[0].id));
      })
      .catch((err) => setError(err.message || 'Could not load farms'));
  }, [activeModal]);

  if (activeModal !== 'add-visitor') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!farmId) {
      setError('Select a farm first.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${API}/visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId,
          name: name.trim(),
          role: role.trim(),
          company: company.trim(),
          phone: phone.trim(),
          purpose: purpose.trim(),
          status: 'IN',
          entryTime: new Date().toISOString(),
          temperature: temperature.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not save visitor');
      window.dispatchEvent(new Event('visitors-updated'));
      showToast?.('Visitor registered successfully.');
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save visitor');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#12131a] rounded-2xl border border-[#34343c] overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#c0c1ff]" />
            <h3 className="text-base font-bold font-serif text-white">Register On-Premise Visitor</h3>
          </div>
          <button type="button" onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Farm</label>
            <select value={farmId} onChange={(e) => setFarmId(e.target.value)} className={inputClass} required>
              <option value="">Select farm</option>
              {farms.map((farm) => <option key={farm._id || farm.id} value={farm._id || farm.id}>{farm.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Entrant Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Ramesh Sharma" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Org</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Designation</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Temperature (°C)</label>
              <input type="number" min="30" max="45" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} className={inputClass} required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose of Visit</label>
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} className={inputClass} required />
          </div>
          {error && <p className="text-xs text-[#ffb4ab]">{error}</p>}
          <div className="pt-3 border-t border-[#34343c] flex items-center justify-end gap-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={saving || farms.length === 0} className="px-5 py-2 text-xs font-bold bg-[#1a178c] hover:bg-[#1a178c]/80 disabled:opacity-50 text-[#c0c1ff] border border-[#c0c1ff]/40 rounded-xl flex items-center gap-1.5 shadow-md">
              <Plus className="w-4 h-4" /> {saving ? 'Saving...' : 'Check IN Entrant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};