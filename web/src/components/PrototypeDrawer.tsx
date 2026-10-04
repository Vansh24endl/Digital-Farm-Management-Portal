import React from 'react';
import { useApp } from '../context/AppContext';
import type { ScreenId } from '../types';
import { X, Layout, Layers, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';


interface PrototypeItem {
  id: ScreenId;
  number: number;
  name: string;
  category: 'core' | 'companion';
  description: string;
  icon: string;
  badge?: string;
}

const prototypeScreens: PrototypeItem[] = [
  {
    id: 'dashboard',
    number: 1,
    name: 'Home Dashboard',
    category: 'core',
    description: 'Circular biosecurity dial (82/100), 4-metric grid, quick tiles, alert feed',
    icon: 'grid_view',
    badge: 'Initial Screen',
  },
  {
    id: 'profile',
    number: 2,
    name: 'User Profile & Settings',
    category: 'core',
    description: 'Dr. Ananya Reyes bio, certifications, 6 assigned farms, settings toggles',
    icon: 'account_circle',
  },
  {
    id: 'surveillance',
    number: 3,
    name: 'Disease Surveillance',
    category: 'core',
    description: 'Newcastle alert banner, glowing satellite heatmap, + Report New Case modal',
    icon: 'coronavirus',
    badge: 'High Risk',
  },
  {
    id: 'health',
    number: 4,
    name: 'Farm Health Overview',
    category: 'core',
    description: '92/100 score gauge, diagnostic PCR card, water/temp telemetry sparklines',
    icon: 'favorite',
  },
  {
    id: 'audits',
    number: 5,
    name: 'Audits & Compliance',
    category: 'core',
    description: '92% compliance score, pending audits, + Add audit, step-by-step inspector',
    icon: 'assignment_turned_in',
  },
  {
    id: 'visitors',
    number: 6,
    name: 'Visitor Control Log',
    category: 'core',
    description: 'Real-time search, toggle IN/OUT visitor state, + Add New Visitor CTA',
    icon: 'badge',
  },
  {
    id: 'checklist',
    number: 7,
    name: 'Biosecurity Checklist',
    category: 'core',
    description: 'Facility zone selector, dynamic progress bar, interactive item status cycle',
    icon: 'fact_check',
  },
  {
    id: 'weather',
    number: 8,
    name: 'Weather Forecast',
    category: 'core',
    description: 'Micro-climate selector, °C/°F toggle, 5-day forecast, climate biosecurity tip',
    icon: 'partly_cloudy_day',
  },
  {
    id: 'emergency',
    number: 9,
    name: 'Emergency Contacts',
    category: 'core',
    description: 'Search directory, red emergency alert banner, simulated live in-app dialer',
    icon: 'emergency',
    badge: '24/7 Call',
  },
  {
    id: 'training',
    number: 10,
    name: 'Training & Guidelines',
    category: 'core',
    description: 'Search SOPs, category chips, featured topics, clinical SOP guidelines reader',
    icon: 'menu_book',
  },
  {
    id: 'farm-map',
    number: 11,
    name: 'Companion 1: Farm Map (Zone 2)',
    category: 'companion',
    description: 'Blueprint SVG geometry layout, 61/100 score, failed protocols, log incident',
    icon: 'map',
    badge: 'Zone 2 Alert',
  },
  {
    id: 'inventory',
    number: 12,
    name: 'Companion 2: Inventory Stock',
    category: 'companion',
    description: '120 items total, 8 low stock highlight list, full table, + Add Item modal',
    icon: 'inventory_2',
  },
  {
    id: 'reports',
    number: 13,
    name: 'Companion 3: Reports & Analytics',
    category: 'companion',
    description: 'Score breakdown gauge, PDF certificate export & download preview modal',
    icon: 'analytics',
  },
];

export const PrototypeDrawer: React.FC = () => {
  const { isPrototypeDrawerOpen, setIsPrototypeDrawerOpen, activeScreen, navigateTo } = useApp();

  if (!isPrototypeDrawerOpen) return null;

  const handleSelectScreen = (screenId: ScreenId) => {
    navigateTo(screenId);
    setIsPrototypeDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-all animate-fadeIn">
      <div className="w-full max-w-md bg-[#12131a] h-full flex flex-col border-l border-[#34343c] shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1a178c]/60 border border-[#c0c1ff]/40 flex items-center justify-center text-[#c0c1ff]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-white flex items-center gap-2">
                Prototype Screen Switcher
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                1-Click Jump to All 13 Screens & Modules
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPrototypeDrawerOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#292931] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Screen List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Core Screens Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c0c1ff] mb-2.5 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5" />
              10 Navigation Flow Screens
            </h3>
            <div className="space-y-2">
              {prototypeScreens
                .filter((s) => s.category === 'core')
                .map((item) => {
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectScreen(item.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                        isActive
                          ? 'bg-[#1a178c]/30 border-[#c0c1ff] shadow-md'
                          : 'bg-[#1b1b22] hover:bg-[#1f1f26] border-[#34343c] hover:border-[#c0c1ff]/40'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#292931] text-[#c0c1ff] font-display text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {item.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-sm font-semibold truncate ${isActive ? 'text-[#c0c1ff]' : 'text-slate-100'}`}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-[#ba1a1a]/40 text-[#ffb4ab] border border-[#ba1a1a]/60">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-500 group-hover:text-[#c0c1ff] transition-all flex-shrink-0 mt-1 ${isActive ? 'text-[#c0c1ff]' : ''}`} />
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Companion Modules Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#ffba3f] mb-2.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              3 Companion Modules
            </h3>
            <div className="space-y-2">
              {prototypeScreens
                .filter((s) => s.category === 'companion')
                .map((item) => {
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectScreen(item.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                        isActive
                          ? 'bg-[#1a178c]/30 border-[#c0c1ff] shadow-md'
                          : 'bg-[#1b1b22] hover:bg-[#1f1f26] border-[#34343c] hover:border-[#ffba3f]/40'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#292931] text-[#ffba3f] font-display text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {item.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-sm font-semibold truncate ${isActive ? 'text-[#c0c1ff]' : 'text-slate-100'}`}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-[#ffba3f]/20 text-[#ffba3f] border border-[#ffba3f]/40">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-slate-500 group-hover:text-[#ffba3f] transition-all flex-shrink-0 mt-1 ${isActive ? 'text-[#ffba3f]' : ''}`} />
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#1b1b22] border-t border-[#34343c] text-center">
          <p className="text-xs text-slate-400 font-sans flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />
            All 13 screens fully functional & state connected
          </p>
        </div>
      </div>
    </div>
  );
};
