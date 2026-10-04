import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Plus } from 'lucide-react';

export const AddVisitorModal: React.FC = () => {
  const { activeModal, closeModal, addVisitor } = useApp();

  const [name, setName] = useState('');
  const [role, setRole] = useState('Feed Supplier / Logistics Driver');
  const [company, setCompany] = useState('National Agri Express');
  const [phone, setPhone] = useState('+91 98765 00000');
  const [purpose, setPurpose] = useState('Bulk Delivery & Swab Verification');
  const [temperature, setTemperature] = useState('36.5 °C');

  if (activeModal !== 'add-visitor') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVisitor({
      name: name || 'Anonymous Entrant',
      role,
      company,
      phone,
      purpose,
      status: 'IN',
      entryTime: 'Just Now',
      temperature,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#12131a] rounded-2xl border border-[#34343c] overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#c0c1ff]" />
            <h3 className="text-base font-bold font-serif text-white">Register On-Premise Visitor</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Entrant Full Name</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Org</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Designation</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Thermal Scan Temp</label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Purpose of Visit & Sector Target</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
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
              <Plus className="w-4 h-4" /> Check IN Entrant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
