import React from 'react';
import { useApp } from '../context/AppContext';
import type { ScreenId } from '../types';

interface TabItem {
  id: ScreenId;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
  { id: 'farm-map', label: 'Farm Map', icon: 'map' },
  { id: 'audits', label: 'Audits', icon: 'assignment_turned_in' },
  { id: 'health', label: 'Health', icon: 'favorite' },
  { id: 'profile', label: 'Settings', icon: 'settings' },
];

export const BottomNav: React.FC = () => {
  const { activeScreen, navigateTo } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#181922]/98 backdrop-blur-md border-t border-[#2d3142] px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#c0c1ff] bg-[#4f46e5]/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#212330]'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${isActive ? 'fill-1' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-xs font-bold tracking-tight mt-0.5 font-sans">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#c0c1ff] rounded-full mt-0.5 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
