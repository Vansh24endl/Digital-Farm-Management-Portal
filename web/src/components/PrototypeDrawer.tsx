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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-all animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] h-full flex flex-col border-l border-[var(--border)] shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                Prototype Console Switcher
              </h2>
              <p className="text-xs font-mono text-[var(--text-secondary)]">
                Direct Jump to All 13 Operations & Modules
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPrototypeDrawerOpen(false)}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[2px] hover:bg-[var(--bg-raised)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Screen List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {/* Core Screens Section */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--lime)] mb-2 flex items-center gap-1.5">
              <Layout className="w-3 h-3" />
              10 Navigation Flow Screens
            </h3>
            <div className="space-y-1.5">
              {prototypeScreens
                .filter((s) => s.category === 'core')
                .map((item) => {
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectScreen(item.id)}
                      className={`w-full text-left p-2.5 rounded-[3px] border transition-all flex items-start gap-2.5 group cursor-pointer ${
                        isActive
                          ? 'bg-[var(--lime-bg)] border-[var(--lime)] shadow-sm'
                          : 'bg-[var(--bg-raised)] hover:bg-[var(--bg-hover)] border-[var(--border-dim)] hover:border-[var(--lime)]'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-[2px] font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isActive
                            ? 'bg-[var(--lime)] text-[#111311]'
                            : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-dim)]'
                        }`}
                      >
                        {item.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold font-display uppercase tracking-wide truncate ${
                              isActive ? 'text-[var(--lime)]' : 'text-[var(--text-primary)] group-hover:text-[var(--lime)]'
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.badge && (
                            <span
                              className={`px-1.5 py-0.2 rounded-[2px] text-[9px] font-mono font-bold uppercase tracking-wider ${
                                item.badge === 'High Risk'
                                  ? 'bg-[var(--critical-bg)] text-[var(--critical)] border border-[var(--critical-dim)]'
                                  : 'bg-[var(--lime-bg)] text-[var(--lime)] border border-[var(--lime)]/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5 font-mono">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--lime)] transition-colors flex-shrink-0 mt-1 ${
                          isActive ? 'text-[var(--lime)]' : ''
                        }`}
                      />
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Companion Modules Section */}
          <div>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--warning)] mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              3 Companion Operations
            </h3>
            <div className="space-y-1.5">
              {prototypeScreens
                .filter((s) => s.category === 'companion')
                .map((item) => {
                  const isActive = activeScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectScreen(item.id)}
                      className={`w-full text-left p-2.5 rounded-[3px] border transition-all flex items-start gap-2.5 group cursor-pointer ${
                        isActive
                          ? 'bg-[var(--lime-bg)] border-[var(--lime)] shadow-sm'
                          : 'bg-[var(--bg-raised)] hover:bg-[var(--bg-hover)] border-[var(--border-dim)] hover:border-[var(--warning)]'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-[2px] font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isActive
                            ? 'bg-[var(--warning)] text-[#111311]'
                            : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border-dim)]'
                        }`}
                      >
                        {item.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-xs font-bold font-display uppercase tracking-wide truncate ${
                              isActive ? 'text-[var(--warning)]' : 'text-[var(--text-primary)] group-hover:text-[var(--warning)]'
                            }`}
                          >
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="px-1.5 py-0.2 rounded-[2px] text-[9px] font-mono font-bold uppercase tracking-wider bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-dim)]">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5 font-mono">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--warning)] transition-colors flex-shrink-0 mt-1 ${
                          isActive ? 'text-[var(--warning)]' : ''
                        }`}
                      />
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[var(--bg-main)] border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--text-secondary)] font-mono flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
            All 13 screens telemetry connected
          </p>
        </div>
      </div>
    </div>
  );
};
