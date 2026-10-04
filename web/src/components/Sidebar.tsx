import React from 'react';
import { useApp } from '../context/AppContext';
import type { ScreenId } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarItem {
  id: ScreenId;
  label: string;
  icon: string;
  category: 'core' | 'quick' | 'companion';
  badge?: string;
}

const navItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid_view', category: 'core' },
  { id: 'farm-map', label: 'Farm Map (Zone 2)', icon: 'map', category: 'companion', badge: 'Alert' },
  { id: 'surveillance', label: 'Surveillance Map', icon: 'coronavirus', category: 'core', badge: 'High Risk' },
  { id: 'health', label: 'Farm Health Overview', icon: 'favorite', category: 'core' },
  { id: 'audits', label: 'Audits & Compliance', icon: 'assignment_turned_in', category: 'core' },
  
  // Quick Access Section (Moved to Sidebar!)
  { id: 'checklist', label: 'Biosecurity Checklist', icon: 'fact_check', category: 'quick' },
  { id: 'visitors', label: 'Visitor Control Log', icon: 'badge', category: 'quick' },
  { id: 'weather', label: 'Micro-Climate Weather', icon: 'partly_cloudy_day', category: 'quick' },
  { id: 'emergency', label: 'Emergency Contacts', icon: 'emergency', category: 'quick', badge: '24/7' },
  { id: 'training', label: 'Training & SOPs', icon: 'menu_book', category: 'quick' },
  { id: 'inventory', label: 'Chemical & PPE Stock', icon: 'inventory_2', category: 'quick' },
  { id: 'reports', label: 'Reports & Analytics', icon: 'analytics', category: 'companion' },
  { id: 'profile', label: 'User Profile & Settings', icon: 'settings', category: 'core' },
];

export const Sidebar: React.FC = () => {
  const { activeScreen, navigateTo, isSidebarCollapsed, toggleSidebar } = useApp();

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#181922] border-r border-[#2d3142] h-[calc(100vh-61px)] sticky top-[61px] transition-all duration-300 z-30 select-none ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header & Collapse Toggle */}
      <div className="p-3 border-b border-[#2d3142] flex items-center justify-between">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck className="w-5 h-5 text-[#c0c1ff]" />
            <span className="text-xs font-bold font-sans tracking-wide text-white uppercase">
              AgroShield Portal
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-1.5 rounded-xl bg-[#212330] hover:bg-[#2a2d3d] border border-[#33374a] text-slate-300 hover:text-white transition-all ${
            isSidebarCollapsed ? 'mx-auto' : ''
          }`}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#c0c1ff]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#c0c1ff]" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4 font-sans">
        {/* Core Operations Group */}
        <div>
          {!isSidebarCollapsed && (
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core Operations
            </span>
          )}
          <div className="mt-1 space-y-1">
            {navItems
              .filter((item) => item.category === 'core')
              .map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#4f46e5] text-white shadow-md font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-[#212330]'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span className={`material-symbols-outlined text-xl flex-shrink-0 ${isActive ? 'fill-1' : ''}`}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-[#dc2626]/30 text-[#fca5a5] border border-[#dc2626]/50">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Quick Access Modules Group (Moved to Sidebar!) */}
        <div>
          {!isSidebarCollapsed && (
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#c0c1ff]">
              Quick Access Modules
            </span>
          )}
          <div className="mt-1 space-y-1">
            {navItems
              .filter((item) => item.category === 'quick')
              .map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#4f46e5] text-white shadow-md font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-[#212330]'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span className={`material-symbols-outlined text-xl flex-shrink-0 ${isActive ? 'fill-1' : ''}`}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-[#d97706]/30 text-[#fcd34d] border border-[#d97706]/50">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Companion Modules Group */}
        <div>
          {!isSidebarCollapsed && (
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#d97706]">
              Analytics & Maps
            </span>
          )}
          <div className="mt-1 space-y-1">
            {navItems
              .filter((item) => item.category === 'companion')
              .map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#4f46e5] text-white shadow-md font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-[#212330]'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <span className={`material-symbols-outlined text-xl flex-shrink-0 ${isActive ? 'fill-1' : ''}`}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-[#dc2626]/30 text-[#fca5a5] border border-[#dc2626]/50">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </aside>
  );
};
