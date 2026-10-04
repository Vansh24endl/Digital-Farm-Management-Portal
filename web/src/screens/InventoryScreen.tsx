import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
} from 'lucide-react';


export const InventoryScreen: React.FC = () => {
  const { inventory, openModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const lowStockItems = inventory.filter((item) => item.quantity <= item.minThreshold);
  const categories = ['All', 'Disinfectants', 'PPE', 'Vaccines', 'Medical Supplies'];

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (categoryFilter === 'All') return matchesSearch;
    return matchesSearch && item.category === categoryFilter;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Inventory Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="surface-card p-4 rounded-xl border border-[#34343c]">
          <span className="text-xs text-slate-400 font-sans">Total Stock Items</span>
          <p className="font-display text-3xl text-white">120</p>
          <span className="text-[10px] text-[#c0c1ff] font-semibold">Active Categories</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#ba1a1a]/60 bg-[#ba1a1a]/10">
          <span className="text-xs text-slate-400 font-sans">Low Stock Urgent</span>
          <p className="font-display text-3xl text-[#ffb4ab]">8</p>
          <span className="text-[10px] text-[#ffb4ab] font-bold">Replenishment Needed</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#34343c]">
          <span className="text-xs text-slate-400 font-sans">Disinfectants</span>
          <p className="font-display text-3xl text-white">42</p>
          <span className="text-[10px] text-[#4CAF50] font-semibold">200ppm Virucides</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#34343c]">
          <span className="text-xs text-slate-400 font-sans">PPE Suits & Gloves</span>
          <p className="font-display text-3xl text-white">55</p>
          <span className="text-[10px] text-slate-400 font-sans">Tyvek & N95</span>
        </div>
      </div>

      {/* 2. Title & Add Item CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#c0c1ff]" />
            Biosecurity Chemical & PPE Inventory
          </h2>
          <p className="text-xs text-slate-400">
            Real-time stock tracking for virucides, PCR kits, Tyvek suits, and vaccines
          </p>
        </div>

        <button
          onClick={() => openModal('add-inventory')}
          className="px-4 py-2 rounded-xl bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> + Add New Item
        </button>
      </div>

      {/* 3. Low Stock Highlight Banner List */}
      <div className="surface-card p-4 rounded-2xl border border-[#ba1a1a]/60 bg-[#ba1a1a]/15 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb4ab] flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
          Low Stock Critical Highlight List (Re-order Required)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {lowStockItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#12131a] border border-[#ba1a1a]/40 text-xs font-sans space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white truncate">{item.name}</span>
                <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-[#ba1a1a] text-white">
                  LOW
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Qty: <strong className="text-[#ffb4ab]">{item.quantity} {item.unit}</strong> (Min: {item.minThreshold})
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Search Bar & Category Filter Chips */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search chemical, disinfectant, or PPE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b1b22] border border-[#34343c] text-slate-100 text-xs focus:border-[#c0c1ff] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1f1f26] border border-[#34343c] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#1a178c] text-[#c0c1ff] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Inventory Items Table */}
      <div className="surface-card rounded-2xl border border-[#34343c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#1f1f26] text-slate-400 uppercase font-semibold border-b border-[#34343c]">
              <tr>
                <th className="p-3.5">Item Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">In-Stock Qty</th>
                <th className="p-3.5">Min Threshold</th>
                <th className="p-3.5">Depot Location</th>
                <th className="p-3.5">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34343c] bg-[#1b1b22]">
              {filteredInventory.map((item) => {
                const isLow = item.quantity <= item.minThreshold;

                return (
                  <tr key={item.id} className="hover:bg-[#1f1f26] transition-colors">
                    <td className="p-3.5 font-bold text-white">{item.name}</td>
                    <td className="p-3.5 font-semibold text-[#c0c1ff]">{item.category}</td>
                    <td className="p-3.5 font-mono text-sm font-bold text-white">
                      {item.quantity} <span className="text-xs text-slate-400 font-sans">{item.unit}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{item.minThreshold} {item.unit}</td>
                    <td className="p-3.5 text-slate-300">{item.location}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          isLow
                            ? 'bg-[#ba1a1a]/30 text-[#ffb4ab] border-[#ba1a1a]'
                            : 'bg-[#316342]/40 text-[#4CAF50] border-[#4CAF50]/40'
                        }`}
                      >
                        {isLow ? 'LOW STOCK' : 'OPTIMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
