import React from 'react';
import { useApp } from '../context/AppContext';
import type { ScreenId } from '../types';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Bell,
  User,
  Stethoscope,
  Users,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

interface BottomTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  action: 'navigate' | 'alerts';
  screenId?: ScreenId;
  badgeCount?: number;
}

export const BottomNav: React.FC = () => {
  const {
    activeScreen,
    navigateTo,
    currentUser,
    isAlertDrawerOpen,
    setIsAlertDrawerOpen,
    unreadAlertCount,
    t,
  } = useApp();

  const userRole = (currentUser?.role || 'farm_manager').toLowerCase();

  // Role-based bottom navigation items
  let tabs: BottomTabItem[] = [];

  if (userRole === 'veterinarian') {
    tabs = [
      { id: 'home', label: 'Home', icon: LayoutDashboard, action: 'navigate', screenId: 'dashboard' },
      { id: 'farms', label: 'Assigned', icon: Building2, action: 'navigate', screenId: 'farm-map' },
      { id: 'consultations', label: 'Practice', icon: Stethoscope, action: 'navigate', screenId: 'vet-profile' },
      { id: 'alerts', label: 'Alerts', icon: Bell, action: 'alerts', badgeCount: unreadAlertCount },
      { id: 'profile', label: 'Profile', icon: User, action: 'navigate', screenId: 'profile' },
    ];
  } else if (userRole === 'admin') {
    tabs = [
      { id: 'home', label: 'Home', icon: LayoutDashboard, action: 'navigate', screenId: 'dashboard' },
      { id: 'users', label: 'Users', icon: Users, action: 'navigate', screenId: 'reports' },
      { id: 'farms', label: 'Farms', icon: Building2, action: 'navigate', screenId: 'farm-map' },
      { id: 'reports', label: 'Reports', icon: BarChart3, action: 'navigate', screenId: 'reports' },
      { id: 'profile', label: 'Profile', icon: User, action: 'navigate', screenId: 'profile' },
    ];
  } else if (userRole === 'inspector') {
    tabs = [
      { id: 'home', label: 'Home', icon: LayoutDashboard, action: 'navigate', screenId: 'dashboard' },
      { id: 'audits', label: 'Audits', icon: ClipboardCheck, action: 'navigate', screenId: 'audits' },
      { id: 'farms', label: 'Farms', icon: Building2, action: 'navigate', screenId: 'farm-map' },
      { id: 'alerts', label: 'Alerts', icon: Bell, action: 'alerts', badgeCount: unreadAlertCount },
      { id: 'profile', label: 'Profile', icon: User, action: 'navigate', screenId: 'profile' },
    ];
  } else {
    // Farmer / Farm Manager (Default)
    tabs = [
      { id: 'home', label: 'Home', icon: LayoutDashboard, action: 'navigate', screenId: 'dashboard' },
      { id: 'farms', label: 'Farms', icon: Building2, action: 'navigate', screenId: 'farm-map' },
      { id: 'audits', label: 'Audits', icon: ClipboardCheck, action: 'navigate', screenId: 'audits' },
      { id: 'alerts', label: 'Alerts', icon: Bell, action: 'alerts', badgeCount: unreadAlertCount },
      { id: 'profile', label: 'Profile', icon: User, action: 'navigate', screenId: 'profile' },
    ];
  }

  const handleTabClick = (tab: BottomTabItem) => {
    if (tab.action === 'alerts') {
      setIsAlertDrawerOpen(!isAlertDrawerOpen);
    } else if (tab.screenId) {
      if (isAlertDrawerOpen) {
        setIsAlertDrawerOpen(false);
      }
      navigateTo(tab.screenId);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-1 pt-1.5 transition-all select-none"
      style={{
        background: 'var(--bg-panel)',
        borderTop: '1.5px solid var(--border)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.12)',
        paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom, 0px))',
      }}
      aria-label="Mobile bottom navigation"
    >
      <div className="w-full max-w-lg mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isAlertTab = tab.action === 'alerts';
          const isActive = isAlertTab ? isAlertDrawerOpen : !isAlertDrawerOpen && activeScreen === tab.screenId;
          const badgeCount = tab.badgeCount || 0;

          // Localization support if translation key exists
          const navKey = tab.screenId === 'farm-map' ? 'farmMap' : tab.screenId || tab.id;
          const translated = t(`nav.${navKey}`);
          const labelText = translated && translated !== `nav.${navKey}` ? translated : tab.label;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              type="button"
              onClick={() => handleTabClick(tab)}
              className="relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-[2px] transition-all duration-150 active:scale-95 min-h-[48px]"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-dim)',
                background: isActive ? 'var(--lime-subtle)' : 'transparent',
              }}
              aria-label={labelText}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span
                  className="absolute top-0 w-8 h-0.5 rounded-full"
                  style={{ background: 'var(--lime, #a3e635)' }}
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center mt-0.5">
                <Icon
                  className="w-5 h-5 transition-transform"
                  strokeWidth={isActive ? 2.3 : 1.8}
                  style={{
                    color: isActive ? 'var(--lime, #a3e635)' : 'currentColor',
                  }}
                />

                {isAlertTab && badgeCount > 0 && (
                  <span
                    className="absolute -top-1 -right-2 min-w-[15px] h-3.5 px-0.5 rounded-full bg-[var(--critical)] text-white text-[9px] font-bold font-mono flex items-center justify-center border border-[var(--bg-panel)] shadow-sm animate-pulse"
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-mono font-bold tracking-tight mt-1 truncate max-w-full leading-none"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-dim)',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {labelText}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
