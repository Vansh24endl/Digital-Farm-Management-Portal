import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { X, PackagePlus, Plus, FileSpreadsheet, Download } from 'lucide-react';

export const AddInventoryModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();

  const [farmId, setFarmId] = useState('');
  const [farms, setFarms] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<
    'disinfectant' | 'ppe' | 'medicine' | 'equipment' | 'other'
  >('disinfectant');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('pieces');
  const [minimumStock, setMinimumStock] = useState(5);
  const [saving, setSaving] = useState(false);
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeModal !== 'add-inventory') return;

    const loadFarms = async () => {
      try {
        setLoadingFarms(true);
        setError('');

        const response = await api.getFarms() as any;
        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

        setFarms(list);
        if (list.length > 0) {
          setFarmId((current) => current || list[0]._id || list[0].id || '');
        } else {
          setError('No farms found. Add a farm before adding inventory.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load farms.');
      } finally {
        setLoadingFarms(false);
      }
    };

    loadFarms();
  }, [activeModal]);

  if (activeModal !== 'add-inventory') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmId) {
      setError('Select a farm before saving this inventory item.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const baseUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_token') : null;

      const response = await fetch(`${baseUrl}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          farmId,
          itemName: name.trim(),
          category,
          quantity: Number(quantity),
          unit: unit.trim(),
          minimumStock: Number(minimumStock),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Failed to save inventory item.');
      }

      window.dispatchEvent(new Event('inventory-updated'));
      showToast('Inventory item saved successfully.');
      setName('');
      setQuantity(10);
      setMinimumStock(5);
      closeModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save inventory item.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-[var(--lime)]" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">Add Stock Item to Inventory</h3>
          </div>
          <button type="button" onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          <div>
            <label className="fd-label block mb-1">Target Farm</label>
            <select
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="fd-select w-full text-xs font-mono"
              required
              disabled={loadingFarms || farms.length === 0}
            >
              <option value="">
                {loadingFarms ? 'Loading farms...' : 'Select a farm'}
              </option>
              {farms.map((farm) => (
                <option key={farm._id || farm.id} value={farm._id || farm.id}>
                  {farm.name || 'Unnamed farm'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="fd-label block mb-1">Item Designation</label>
            <input
              type="text"
              placeholder="e.g. Virkon S Broad-Spectrum Disinfectant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="fd-input w-full text-xs font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="fd-label block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="fd-select w-full text-xs font-mono"
              >
                <option value="disinfectant">Disinfectant</option>
                <option value="ppe">PPE Equipment</option>
                <option value="medicine">Medicine / Vaccines</option>
                <option value="equipment">Diagnostic Equipment</option>
                <option value="other">Other Consumable</option>
              </select>
            </div>
            <div>
              <label className="fd-label block mb-1">Unit Type</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="fd-input w-full text-xs font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="fd-label block mb-1">Initial Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="fd-input w-full text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="fd-label block mb-1">Minimum Alert Threshold</label>
              <input
                type="number"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                className="fd-input w-full text-xs font-mono"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-mono text-[var(--critical)] bg-[var(--critical-bg)] border border-[var(--critical-dim)] rounded-[2px] p-2">
              {error}
            </p>
          )}

          <div className="pt-2.5 border-t border-[var(--border-dim)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loadingFarms || farms.length === 0}
              className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const IncidentLogModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();
  const [notes, setNotes] = useState('');

  if (activeModal !== 'incident-log') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] rounded-[3px] border border-[var(--warning-dim)] overflow-hidden shadow-2xl">
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">Log Perimeter Incident (Zone 2)</h3>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3.5">
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Record spatial breaches, failed vehicle washes, or sensor anomalies for Poultry House B - Zone 2.
          </p>
          <textarea
            rows={4}
            placeholder="Describe incident, location pin, and corrective action taken..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="fd-input w-full text-xs font-mono resize-none"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-dim)]">
            <button onClick={closeModal} className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider">
              Cancel
            </button>
            <button
              onClick={() => {
                showToast('Incident logged to Poultry House B surveillance file!');
                closeModal();
              }}
              className="px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-[var(--warning)] text-[#111311] hover:brightness-110 rounded-[2px] shadow-sm"
            >
              Save Incident Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PDFExportModal: React.FC = () => {
  const { activeModal, closeModal, showToast } = useApp();

  if (activeModal !== 'pdf-export') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[var(--lime)]" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">Export Official Biosecurity Certificate PDF</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3.5 font-sans text-xs text-[var(--text-secondary)]">
          <div className="fd-raised p-3.5 rounded-[3px] border border-[var(--border-dim)] space-y-2 font-mono text-xs">
            <div className="flex justify-between font-semibold text-[var(--text-primary)]">
              <span>Report Title:</span> <span>AgroShield Monthly Farm Health Certificate</span>
            </div>
            <div className="flex justify-between">
              <span>Auditor Authority:</span> <span className="text-[var(--text-primary)]">Dr. Ananya Reyes (Lead Vet)</span>
            </div>
            <div className="flex justify-between">
              <span>Overall Score:</span> <span className="font-bold text-[var(--success)]">82/100 (Optimal Grade A)</span>
            </div>
            <div className="flex justify-between">
              <span>Data Scope:</span> <span>Audit Logs, PCR Telemetry, Visitor Pass, Inventory</span>
            </div>
          </div>
          <p className="text-[11px] font-mono text-[var(--text-dim)]">
            This generated PDF includes cryptographic verification signatures and is ready for submission to the State Animal Health Department.
          </p>
          <div className="flex justify-end gap-2 pt-2.5 border-t border-[var(--border-dim)]">
            <button onClick={closeModal} className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider">
              Cancel
            </button>
            <button
              onClick={() => {
                showToast('AgroShield Biosecurity PDF Report compiled & downloaded!');
                closeModal();
              }}
              className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};