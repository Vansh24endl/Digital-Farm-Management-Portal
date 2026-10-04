import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  Plus,
  UserCheck,
  UserX,
  Phone,
  Thermometer,
  Clock,
  Building,
} from 'lucide-react';


export const VisitorLogScreen: React.FC = () => {
  const { visitors, toggleVisitorStatus, openModal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const activeOnPremiseCount = visitors.filter((v) => v.status === 'IN').length;

  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && v.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-24 animate-fadeIn font-sans">
      {/* 1. Summary Stats Header Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="surface-card p-4 rounded-xl border border-[#34343c] text-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Active On-Premise</span>
          <p className="font-display text-3xl text-[#4CAF50]">{activeOnPremiseCount}</p>
          <span className="text-[10px] text-[#4CAF50] font-bold">Checked IN Now</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#34343c] text-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">This Week</span>
          <p className="font-display text-3xl text-[#c0c1ff]">45</p>
          <span className="text-[10px] text-slate-400 font-sans">Entrants Logged</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#34343c] text-center">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">This Month</span>
          <p className="font-display text-3xl text-white">120</p>
          <span className="text-[10px] text-slate-400 font-sans">Bio-Pass Passes</span>
        </div>
      </div>

      {/* 2. Title & Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c0c1ff]" />
            On-Premise Visitor & Entrant Log
          </h2>
          <p className="text-xs text-slate-400">
            Real-time biometric, temperature, and farm zone access surveillance
          </p>
        </div>

        <button
          onClick={() => openModal('add-visitor')}
          className="px-4 py-2 rounded-xl bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> + Add New Visitor
        </button>
      </div>

      {/* 3. Search Bar & Status Filter Chips */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search visitor, feed supplier, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b1b22] border border-[#34343c] text-slate-100 text-xs focus:border-[#c0c1ff] outline-none"
          />
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1f1f26] border border-[#34343c] self-start sm:self-auto">
          {(['ALL', 'IN', 'OUT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-[#1a178c] text-[#c0c1ff] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'All Visitors' : st === 'IN' ? 'Checked IN' : 'Checked OUT'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Visitor Cards List (Tapping Card Toggles IN <-> OUT Status!) */}
      <div className="space-y-3">
        {filteredVisitors.length === 0 ? (
          <div className="text-center py-10 surface-card rounded-2xl p-6 text-slate-400">
            <Users className="w-8 h-8 mx-auto text-slate-500 mb-2" />
            <p className="text-sm font-semibold">No visitors match your search filter</p>
          </div>
        ) : (
          filteredVisitors.map((visitor) => {
            const isIn = visitor.status === 'IN';

            return (
              <div
                key={visitor.id}
                onClick={() => toggleVisitorStatus(visitor.id)}
                className={`surface-card p-4 rounded-2xl border cursor-pointer transition-all active:scale-98 group relative ${
                  isIn
                    ? 'border-[#4CAF50]/60 bg-[#316342]/10 shadow-lg'
                    : 'border-[#34343c] opacity-80 hover:opacity-100'
                }`}
                title="Tap to toggle Checked IN / Checked OUT status"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Status Avatar Icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-serif text-lg font-bold flex-shrink-0 ${
                        isIn
                          ? 'bg-[#316342]/40 border-[#4CAF50] text-[#4CAF50]'
                          : 'bg-[#1f1f26] border-[#34343c] text-slate-400'
                      }`}
                    >
                      {visitor.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white font-serif group-hover:text-[#c0c1ff] transition-colors">
                          {visitor.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            isIn
                              ? 'bg-[#316342] text-[#4CAF50] border-[#4CAF50]'
                              : 'bg-[#1f1f26] text-slate-400 border-[#34343c]'
                          }`}
                        >
                          {isIn ? 'ON-PREMISE (IN)' : 'CHECKED OUT'}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#c0c1ff] flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" /> {visitor.company} · {visitor.role}
                      </p>

                      <p className="text-xs text-slate-300 font-sans pt-1">{visitor.purpose}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {visitor.entryTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-[#ffba3f]" /> Temp: {visitor.temperature}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {visitor.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Toggle Action Badge */}
                  <div className="self-end sm:self-center flex flex-col items-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisitorStatus(visitor.id);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                        isIn
                          ? 'bg-[#ba1a1a]/20 hover:bg-[#ba1a1a]/40 text-[#ffb4ab] border border-[#ba1a1a]/60'
                          : 'bg-[#316342]/40 hover:bg-[#316342]/60 text-[#4CAF50] border border-[#4CAF50]/60'
                      }`}
                    >
                      {isIn ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      {isIn ? 'Check OUT' : 'Check IN'}
                    </button>
                    <span className="text-[9px] text-slate-500 font-sans">Tap card to toggle</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Sticky Bottom CTA for Adding New Visitor */}
      <div className="fixed bottom-16 left-0 right-0 p-3 z-30 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={() => openModal('add-visitor')}
            className="w-full py-3 rounded-2xl bg-[#1a178c] hover:bg-[#1a178c]/90 text-[#c0c1ff] border border-[#c0c1ff]/50 font-bold text-xs shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Register New On-Premise Entrant (+ Add Visitor)
          </button>
        </div>
      </div>
    </div>
  );
};
