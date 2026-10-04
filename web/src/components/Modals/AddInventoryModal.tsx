import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, PackagePlus, Plus, FileSpreadsheet, Download } from 'lucide-react';


export const AddInventoryModal: React.FC = () => {
  const { activeModal, closeModal, addInventoryItem } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Disinfectants' | 'PPE' | 'Vaccines' | 'Medical Supplies' | 'Feed Additives'>('Disinfectants');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('Barrels');
  const [minThreshold, setMinThreshold] = useState(5);
  const [location, setLocation] = useState('Central Chemical Shed');

  if (activeModal !== 'add-inventory') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInventoryItem({
      name: name || 'Chemical Virucide Solution',
      category,
      quantity: Number(quantity),
      unit,
      minThreshold: Number(minThreshold),
      location,
      lastRestocked: 'Just Now',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#12131a] rounded-2xl border border-[#34343c] overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-[#c0c1ff]" />
            <h3 className="text-base font-bold font-serif text-white">Add Stock Item to Inventory</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              >
                <option value="Disinfectants">Disinfectants</option>
                <option value="PPE">PPE Equipment</option>
                <option value="Vaccines">Vaccines & Serology</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Feed Additives">Feed Additives</option>
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
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Min Threshold</label>
              <input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Depot Storage Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
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
              className="px-5 py-2 text-xs font-bold bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Item
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
