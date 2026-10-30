import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { X, UserPlus, Plus } from 'lucide-react';

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_token') : null;
    if (!token) return;

    api.getFarms()
      .then((result: any) => {
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
      await api.createVisitor({
        farmId,
        name: name.trim(),
        role: role.trim(),
        company: company.trim(),
        phone: phone.trim(),
        purpose: purpose.trim(),
        status: 'IN',
        entryTime: new Date().toISOString(),
        temperature: temperature.trim(),
      });
      window.dispatchEvent(new Event('visitors-updated'));
      showToast?.('Visitor registered successfully.');
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save visitor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[var(--lime)]" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">Register On-Premise Visitor</h3>
          </div>
          <button type="button" onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          <div>
            <label className="fd-label block mb-1">Target Farm</label>
            <select value={farmId} onChange={(e) => setFarmId(e.target.value)} className="fd-select w-full text-xs font-mono" required>
              <option value="">Select farm</option>
              {farms.map((farm) => <option key={farm._id || farm.id} value={farm._id || farm.id}>{farm.name}</option>)}
            </select>
          </div>
          <div>
            <label className="fd-label block mb-1">Entrant Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="fd-input w-full text-xs font-mono" placeholder="e.g. Ramesh Sharma" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="fd-label block mb-1">Company / Organization</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="fd-input w-full text-xs font-mono" required />
            </div>
            <div>
              <label className="fd-label block mb-1">Role Designation</label>
              <input value={role} onChange={(e) => setRole(e.target.value)} className="fd-input w-full text-xs font-mono" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="fd-label block mb-1">Phone Contact</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="fd-input w-full text-xs font-mono" required />
            </div>
            <div>
              <label className="fd-label block mb-1">Temperature (°C)</label>
              <input type="number" min="30" max="45" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="fd-input w-full text-xs font-mono" required />
            </div>
          </div>
          <div>
            <label className="fd-label block mb-1">Purpose of Visit</label>
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} className="fd-input w-full text-xs font-mono" required />
          </div>
          {error && <p className="text-xs font-mono text-[var(--critical)] bg-[var(--critical-bg)] border border-[var(--critical-dim)] rounded-[2px] p-2">{error}</p>}
          <div className="pt-2.5 border-t border-[var(--border-dim)] flex items-center justify-end gap-2">
            <button type="button" onClick={closeModal} className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider">Cancel</button>
            <button type="submit" disabled={saving || farms.length === 0} className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50">
              <Plus className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Check IN Entrant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};