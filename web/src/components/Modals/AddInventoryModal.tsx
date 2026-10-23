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

      const response = await fetch(`${baseUrl}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      <div className="w-full max-w-md bg-[#12131a] rounded-2xl border border-[#34343c] overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-[#c0c1ff]" />
            <h3 className="text-base font-bold font-serif text-white">Add Stock Item to Inventory</h3>
          </div>
          <button type="button" onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Farm</label>
            <select
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Virkon S Disinfectant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              >
                <option value="disinfectant">Disinfectant</option>
                <option value="ppe">PPE</option>
                <option value="medicine">Medicine / Vaccines</option>
                <option value="equipment">Equipment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Type</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Quantity</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Stock</label>
              <input
                type="number"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </p>
          )}

          <div className="pt-3 border-t border-[#34343c] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loadingFarms || farms.length === 0}
              className="px-5 py-2 text-xs font-bold bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {saving ? 'Saving...' : 'Add Item'}
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
      <div className="w-full max-w-md bg-[#12131a] rounded-2xl border border-[#ffba3f]/60 overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#ffba3f]/20 border-b border-[#34343c] flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-white">Log Perimeter Incident (Zone 2)</h3>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300 font-sans">
            Record spatial breaches, failed vehicle washes, or sensor anomalies for Poultry House B - Zone 2.
          </p>
          <textarea
            rows={4}
            placeholder="Describe incident, location pin, and corrective action taken..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#ffba3f] outline-none font-sans"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-[#34343c]">
            <button onClick={closeModal} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={() => {
                showToast('Incident logged to Poultry House B surveillance file!');
                closeModal();
              }}
              className="px-5 py-2 text-xs font-bold bg-[#ffba3f] text-black hover:bg-[#ffba3f]/90 rounded-xl shadow-md"
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
      <div className="w-full max-w-xl bg-[#12131a] rounded-2xl border border-[#c0c1ff]/50 overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#c0c1ff]" />
            <h3 className="text-base font-bold font-serif text-white">Export Official Biosecurity Certificate PDF</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 font-sans text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-[#1f1f26] border border-[#34343c] space-y-2">
            <div className="flex justify-between font-semibold text-white">
              <span>Report Title:</span> <span>AgroShield Monthly Farm Health Certificate</span>
            </div>
            <div className="flex justify-between">
              <span>Auditor Authority:</span> <span>Dr. Ananya Reyes (Lead Vet)</span>
            </div>
            <div className="flex justify-between">
              <span>Overall Score:</span> <span className="font-bold text-[#4CAF50]">82/100 (Optimal Grade A)</span>
            </div>
            <div className="flex justify-between">
              <span>Data Scope:</span> <span>Audit Logs, PCR Telemetry, Visitor Pass, Inventory</span>
            </div>
          </div>
          <p className="text-slate-400">
            This generated PDF includes cryptographic verification signatures and is ready for submission to the State Animal Health Department.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#34343c]">
            <button onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              onClick={() => {
                showToast('AgroShield Biosecurity PDF Report compiled & downloaded!');
                closeModal();
              }}
              className="px-5 py-2 text-xs font-bold bg-[#1a178c] text-[#c0c1ff] border border-[#c0c1ff]/40 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-4 h-4" /> Download PDF Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};