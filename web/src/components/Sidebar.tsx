import React from 'react';
import { useApp } from '../context/AppContext';
import type { ScreenId } from '../types';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

interface SidebarItem {
  id: ScreenId;
  label: string;
  icon: string;
  category: 'core' | 'quick' | 'companion';
  badge?: string;
  badgeKind?: 'critical' | 'warning' | 'lime';
}

const navItems: SidebarItem[] = [
  { id: 'dashboard',    label: 'Dashboard',             icon: 'grid_view',           category: 'core' },
  { id: 'farm-map',     label: 'Farm Map (Zone 2)',      icon: 'map',                 category: 'companion', badge: 'Alert',    badgeKind: 'critical' },
  { id: 'surveillance', label: 'Surveillance Map',       icon: 'coronavirus',         category: 'core',      badge: 'High Risk', badgeKind: 'critical' },
  { id: 'health',       label: 'Farm Health Overview',   icon: 'favorite',            category: 'core' },
  { id: 'audits',       label: 'Audits & Compliance',    icon: 'assignment_turned_in', category: 'core' },
  { id: 'checklist',   label: 'Biosecurity Checklist',  icon: 'fact_check',          category: 'quick' },
  { id: 'visitors',    label: 'Visitor Control Log',    icon: 'badge',               category: 'quick' },
  { id: 'weather',     label: 'Micro-Climate Weather',  icon: 'partly_cloudy_day',   category: 'quick' },
  { id: 'emergency',   label: 'Emergency Contacts',     icon: 'emergency',           category: 'quick',     badge: '24/7',     badgeKind: 'warning' },
  { id: 'training',    label: 'Training & SOPs',        icon: 'menu_book',           category: 'quick' },
  { id: 'inventory',   label: 'Chemical & PPE Stock',   icon: 'inventory_2',         category: 'quick' },
  { id: 'reports',     label: 'Reports & Analytics',    icon: 'analytics',           category: 'companion' },
  { id: 'vet-profile', label: 'Veterinary Profile',     icon: 'medical_services',    category: 'core', badge: 'VET', badgeKind: 'lime' },
  { id: 'profile',     label: 'Profile & Settings',     icon: 'settings',            category: 'core' },
];

const categoryGroups: { key: 'core' | 'quick' | 'companion'; label: string }[] = [
  { key: 'core',      label: 'Core Operations' },
  { key: 'quick',     label: 'Quick Access' },
  { key: 'companion', label: 'Analytics & Maps' },
];

const badgeStyle: Record<string, React.CSSProperties> = {
  critical: { background: 'var(--critical-bg)', color: 'var(--critical)', border: '1px solid var(--critical-dim)', fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', borderRadius: '2px', padding: '1px 5px' },
  warning:  { background: 'var(--warning-bg)',  color: 'var(--warning)',  border: '1px solid var(--warning-dim)',  fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', borderRadius: '2px', padding: '1px 5px' },
  lime:     { background: 'var(--lime-subtle)', color: 'var(--lime)',     border: '1px solid var(--lime-dim)',     fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', borderRadius: '2px', padding: '1px 5px' },
};

const ROLE_ALLOWED_SCREENS: Record<string, ScreenId[]> = {
  admin: ['dashboard', 'farm-map', 'surveillance', 'health', 'audits', 'checklist', 'visitors', 'weather', 'emergency', 'training', 'inventory', 'reports', 'profile', 'vet-profile'],
  farm_manager: ['dashboard', 'farm-map', 'health', 'checklist', 'visitors', 'inventory', 'weather', 'training', 'emergency', 'profile'],
  veterinarian: ['dashboard', 'vet-profile', 'surveillance', 'health', 'weather', 'emergency', 'training', 'reports', 'farm-map', 'profile'],
  inspector: ['dashboard', 'audits', 'reports', 'checklist', 'farm-map', 'weather', 'training', 'profile'],
};

export const Sidebar: React.FC = () => {
  const { activeScreen, navigateTo, isSidebarCollapsed, toggleSidebar, t, currentUser, isAuthenticated } = useApp();
  const userRole = (currentUser?.role || 'farm_manager').toLowerCase();
  const allowedScreens = isAuthenticated && ROLE_ALLOWED_SCREENS[userRole] ? ROLE_ALLOWED_SCREENS[userRole] : null;

  return (
    <aside
      className={`hidden md:flex flex-col flex-shrink-0 h-[calc(100vh-56px)] sticky top-14 transition-all duration-300 z-30 select-none ${
        isSidebarCollapsed ? 'w-14' : 'w-56'
      }`}
      style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {!isSidebarCollapsed && (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--lime)' }} />
              <span
                className="text-xs font-bold uppercase tracking-widest truncate"
                style={{ fontFamily: 'IBM Plex Mono, monospace', color: 'var(--text-secondary)' }}
              >
                FarmDrishti
              </span>
            </div>
            {isAuthenticated && currentUser?.role && (
              <span className="text-[10px] font-mono text-[var(--lime)] uppercase mt-0.5 font-bold tracking-wider">
                {currentUser.role.replace('_', ' ')}
              </span>
            )}
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="fd-btn-icon flex-shrink-0"
          style={isSidebarCollapsed ? { marginLeft: 'auto', marginRight: 'auto' } : {}}
          title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {isSidebarCollapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {categoryGroups.map(({ key, label }, gi) => {
          const items = navItems.filter((item) => item.category === key && (!allowedScreens || allowedScreens.includes(item.id)));
          if (items.length === 0) return null;
          return (
            <div key={key} className={gi > 0 ? 'mt-3' : ''}>
              {/* Group label */}
              {!isSidebarCollapsed && (
                <div className="px-3 mb-1">
                  <span className="fd-label">{label}</span>
                </div>
              )}
              <div className="space-y-0.5 px-2">
                {items.map((item) => {
                  const isActive = activeScreen === item.id;
                  const navKey = item.id === 'farm-map' ? 'farmMap' : item.id;
                  const translated = t(`nav.${navKey}`);
                  const labelText = translated !== `nav.${navKey}` ? translated : item.label;

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      title={isSidebarCollapsed ? labelText : undefined}
                      className={`w-full flex items-center gap-2.5 py-2 rounded-sm transition-colors text-left ${
                        isSidebarCollapsed ? 'justify-center px-2' : 'px-2.5'
                      }`}
                      style={{
                        background: isActive ? 'var(--lime-subtle)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        borderLeft: isActive ? '3px solid var(--border)' : '3px solid transparent',
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'var(--bg-raised)';
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px', color: isActive ? 'var(--text-primary)' : 'inherit' }}>
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span
                            className="text-xs font-semibold truncate"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                              fontWeight: isActive ? 700 : 500,
                            }}
                          >
                            {labelText}
                          </span>
                          {item.badge && (
                            <span style={badgeStyle[item.badgeKind || 'lime']}>
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
          );
        })}
      </div>

      {/* Footer version */}
      {!isSidebarCollapsed && (
        <div className="px-3 py-2 flex-shrink-0" style={{ borderTop: '1px solid var(--border-dim)' }}>
          <p className="fd-label">v2.0 · Field Console</p>
        </div>
      )}
    </aside>
  );
};
