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
  { id: 'farm-map',  label: 'Farm Map',  icon: 'map' },
  { id: 'audits',    label: 'Audits',    icon: 'assignment_turned_in' },
  { id: 'health',    label: 'Health',    icon: 'favorite' },
  { id: 'profile',   label: 'Settings',  icon: 'settings' },
];

export const BottomNav: React.FC = () => {
  const { activeScreen, navigateTo } = useApp();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-1 py-1.5"
      style={{ background: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => navigateTo(tab.id)}
              className="flex flex-col items-center justify-center w-14 py-1.5 rounded-sm transition-colors active:scale-95"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-dim)',
                background: isActive ? 'var(--lime-subtle)' : 'transparent',
              }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {tab.icon}
              </span>
              <span
                className="text-[10px] font-bold tracking-tight mt-0.5"
                style={{ fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.02em' }}
              >
                {tab.label}
              </span>
              {isActive && (
                <span
                  className="w-4 h-0.5 mt-0.5 rounded-full"
                  style={{ background: 'var(--border)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
