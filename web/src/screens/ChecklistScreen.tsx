import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Send,
} from 'lucide-react';


export const ChecklistScreen: React.FC = () => {
  const {
    checklist,
    selectedZone,
    setSelectedZone,
    cycleChecklistItemStatus,
    submitChecklist,
  } = useApp();

  const zones = [
    'Zone A Rearing Facility',
    'Zone B Poultry House',
    'Zone C Hatchery',
    'Zone D Storage & Chemical Depot',
  ];

  const totalItems = checklist.length;
  const passedItems = checklist.filter((i) => i.status === 'passed').length;
  const warningItems = checklist.filter((i) => i.status === 'warning').length;
  const criticalItems = checklist.filter((i) => i.status === 'critical').length;
  const passPercentage = Math.round((passedItems / totalItems) * 100);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Facility Zone Selector Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#c0c1ff]" />
            Daily Biosecurity Protocol Checklist
          </h2>
          <p className="text-xs text-slate-400">
            Mandatory sanitation audit checklist for active farm personnel
          </p>
        </div>

        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#1b1b22] border border-[#34343c] text-slate-100 font-bold font-serif text-xs focus:border-[#c0c1ff] outline-none cursor-pointer shadow-md self-start sm:self-auto"
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Dynamic Overall Progress Card */}
      <div className="surface-card rounded-2xl p-5 border border-[#34343c] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Zone Decontamination Status
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl text-white">{passedItems}/{totalItems}</span>
              <span className="text-sm font-bold text-[#c0c1ff]">Passed ({passPercentage}%)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#316342]/40 text-[#4CAF50] font-bold border border-[#4CAF50]/40">
              {passedItems} Passed
            </span>
            {warningItems > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-[#ffba3f]/20 text-[#ffba3f] font-bold border border-[#ffba3f]/40">
                {warningItems} Warning
              </span>
            )}
            {criticalItems > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-[#ba1a1a]/30 text-[#ffb4ab] font-bold border border-[#ba1a1a]/60">
                {criticalItems} Critical
              </span>
            )}
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-[#12131a] h-3 rounded-full overflow-hidden border border-[#34343c]">
          <div
            className="bg-gradient-to-r from-[#1a178c] via-[#c0c1ff] to-[#4CAF50] h-full transition-all duration-500"
            style={{ width: `${passPercentage}%` }}
          ></div>
        </div>

        <p className="text-[11px] text-slate-400 font-sans italic">
          * Tap any checklist item below to cycle its state: Passed → Pending Warning → Critical Pending.
        </p>
      </div>

      {/* 3. Interactive Checklist Items */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
          Interactive Inspection Checklist Items
        </h3>

        {checklist.map((item) => {
          const isPassed = item.status === 'passed';
          const isWarning = item.status === 'warning';


          return (
            <div
              key={item.id}
              onClick={() => cycleChecklistItemStatus(item.id)}
              className={`surface-card p-4 rounded-2xl border cursor-pointer transition-all active:scale-98 group ${
                isPassed
                  ? 'border-[#316342] bg-[#316342]/10 hover:border-[#4CAF50]'
                  : isWarning
                  ? 'border-[#ffba3f]/60 bg-[#ffba3f]/10 hover:border-[#ffba3f]'
                  : 'border-[#ba1a1a] bg-[#ba1a1a]/15 hover:border-[#ffb4ab]'
              }`}
              title="Click to cycle status (Passed -> Warning -> Critical)"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110 ${
                      isPassed
                        ? 'bg-[#4CAF50] border-[#4CAF50] text-black'
                        : isWarning
                        ? 'bg-[#ffba3f] border-[#ffba3f] text-black'
                        : 'bg-[#ba1a1a] border-[#ba1a1a] text-white animate-pulse'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    ) : isWarning ? (
                      <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c0c1ff]">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white font-serif group-hover:text-[#c0c1ff] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-300 font-sans">{item.description}</p>
                  </div>
                </div>

                {/* State Pill Badge */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border shadow-md ${
                      isPassed
                        ? 'bg-[#316342] text-[#4CAF50] border-[#4CAF50]'
                        : isWarning
                        ? 'bg-[#ffba3f]/20 text-[#ffba3f] border-[#ffba3f]'
                        : 'bg-[#ba1a1a] text-white border-[#ffb4ab]'
                    }`}
                  >
                    {isPassed ? 'PASSED' : isWarning ? 'WARNING' : 'CRITICAL'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">Tap to cycle</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Submit Daily Checklist CTA */}
      <div className="pt-2">
        <button
          onClick={submitChecklist}
          className="w-full py-3.5 rounded-2xl bg-[#1a178c] hover:bg-[#1a178c]/90 text-[#c0c1ff] border border-[#c0c1ff]/50 text-sm font-extrabold shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Send className="w-4 h-4" /> Submit Daily Biosecurity Checklist to HQ
        </button>
      </div>
    </div>
  );
};
