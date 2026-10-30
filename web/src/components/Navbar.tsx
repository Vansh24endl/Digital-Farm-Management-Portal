import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { ScreenId } from '../types';
import {
  ChevronLeft, Bell, Layers, User, Camera, Settings, LogOut, ChevronDown, ShieldCheck,
  Sun, Moon, Globe,
} from 'lucide-react';

const screenTitles: Record<ScreenId, { title: string; subtitle: string }> = {
  dashboard:   { title: 'AgroShield Surveillance', subtitle: 'Biosecurity & Commercial Farm Health' },
  profile:     { title: 'User Profile', subtitle: 'Veterinary Specialist & Account Settings' },
  surveillance:{ title: 'Disease Surveillance', subtitle: 'Real-time Vector & Outbreak Tracking' },
  health:      { title: 'Farm Health Overview', subtitle: 'Telemetry, Water, Temp & PCR Diagnostic' },
  audits:      { title: 'Audits & Compliance', subtitle: 'Inspection Checklists & Protocols' },
  visitors:    { title: 'Visitor Control Log', subtitle: 'On-Premise Entrant & Bio-Pass Tracking' },
  checklist:   { title: 'Biosecurity Checklist', subtitle: 'Daily Decontamination & Zone Status' },
  weather:     { title: 'Micro-Climate Weather', subtitle: 'Farm Forecast & Humidity Monitoring' },
  emergency:   { title: 'Emergency Contacts', subtitle: '24/7 Vet Response & Authorities' },
  training:    { title: 'Training & Guidelines', subtitle: 'Clinical SOPs & Hygiene Rules' },
  'farm-map':  { title: 'Farm Map Blueprint', subtitle: 'Poultry House B - Zone 2 Alert' },
  inventory:   { title: 'Biosecurity Inventory', subtitle: 'Chemicals, PPE & Diagnostic Stock' },
  reports:     { title: 'Reports & Analytics', subtitle: 'Compliance Certificates & PDF Export' },
};

export const Navbar: React.FC = () => {
  const {
    activeScreen, navigateTo, goBack, userProfile, alerts,
    setIsPrototypeDrawerOpen, setIsAlertDrawerOpen,
    isProfileDropdownOpen, setIsProfileDropdownOpen, openModal,
    isAuthenticated, currentUser, logout,
    theme, toggleTheme, language, setLanguage, t,
  } = useApp();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const unreadCount = alerts.filter((a) => !a.read).length;

  const getTitleInfo = () => {
    const fallback = screenTitles[activeScreen] || screenTitles.dashboard;
    const key = activeScreen === 'farm-map' ? 'farmMap' : activeScreen;
    const translatedTitle = t(`nav.${key}`);
    const translatedSub = t(`nav.${key}Sub`);
    return {
      title: translatedTitle !== `nav.${key}` ? translatedTitle : fallback.title,
      subtitle: translatedSub !== `nav.${key}Sub` ? translatedSub : fallback.subtitle,
    };
  };
  const info = getTitleInfo();
  const isHome = activeScreen === 'dashboard';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setIsProfileDropdownOpen]);

  return (
    <header
      className="sticky top-0 z-40 font-sans"
      style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-14">

        {/* ── Left: back / avatar + title ── */}
        <div className="flex items-center gap-3 min-w-0">
          {!isHome && (
            <button
              onClick={goBack}
              className="fd-btn-icon flex-shrink-0"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Avatar + dropdown or Sign In */}
          {isAuthenticated ? (
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen((p) => !p)}
                className="flex items-center gap-2 py-1 pr-2 rounded-sm transition-colors"
                style={{ background: 'transparent' }}
                aria-label="Profile menu"
              >
                <div className="relative">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-8 h-8 rounded-sm object-cover"
                    style={{ border: '1px solid var(--border)' }}
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--success)', border: '2px solid var(--bg-panel)' }}
                  />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                    {userProfile.name.split(' ').slice(0, 2).join(' ')}
                  </p>
                  {currentUser?.role && (
                    <span
                      className="text-[9px] uppercase font-mono tracking-wider font-bold block mt-0.5"
                      style={{ color: 'var(--lime, #a3e635)' }}
                    >
                      {currentUser.role.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-3 h-3 hidden sm:block" style={{ color: 'var(--text-dim)' }} />
              </button>

              {/* Dropdown */}
              {isProfileDropdownOpen && (
                <div
                  className="absolute top-11 left-0 w-64 z-50 animate-fadeIn"
                  style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: '3px' }}
                >
                  <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {userProfile.name}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
                      {userProfile.email}
                    </p>
                    <span className="fd-badge fd-badge-success mt-2 inline-flex uppercase">
                      <ShieldCheck className="w-3 h-3" /> {currentUser?.role?.replace('_', ' ') || 'Active Specialist'}
                    </span>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    {[
                      { icon: User, label: 'View Full Profile', action: () => navigateTo('profile') },
                      { icon: Camera, label: 'Change Profile Picture', action: () => openModal('change-dp') },
                      { icon: Settings, label: 'Edit Profile Settings', action: () => openModal('edit-profile') },
                    ].map(({ icon: Icon, label, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-sm transition-colors text-left"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-raised)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '')}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--lime)' }} />
                        {label}
                      </button>
                    ))}

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '4px', marginTop: '4px' }}>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-sm transition-colors text-left"
                        style={{ color: 'var(--critical)' }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'var(--critical-bg)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = '')}
                      >
                        <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                        Log Out Session
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openModal('auth')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              style={{
                background: 'var(--lime, #a3e635)',
                color: '#111311',
              }}
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

          {/* Screen title */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                className="text-base font-bold leading-none truncate"
                style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
              >
                {info.title}
              </h1>
              <span className="fd-badge fd-badge-lime hidden sm:inline-flex">Bio-Vigilant</span>
            </div>
            <p className="text-xs truncate hidden md:block mt-0.5" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
              {info.subtitle}
            </p>
          </div>
        </div>

        {/* ── Right: Language + Theme + screens + alerts ── */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen((p) => !p)}
              className="fd-btn-ghost py-1 px-2.5 flex items-center gap-1.5 text-xs font-semibold"
              title={t('common.selectLanguage')}
              aria-label="Change language"
            >
              <Globe className="w-3.5 h-3.5" style={{ color: 'var(--lime-dim, #eab308)' }} />
              <span className="text-[11px] font-mono font-bold tracking-wider">
                {language === 'en' ? 'EN' : language === 'hi' ? 'हिंदी' : 'मराठी'}
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--text-dim)]" />
            </button>

            {isLangDropdownOpen && (
              <div
                className="absolute top-10 right-0 w-36 z-50 p-1 rounded shadow-lg animate-fadeIn"
                style={{
                  background: 'var(--bg-panel)',
                  border: '1.5px solid var(--border)',
                  boxShadow: 'var(--shadow-ink)',
                }}
              >
                {[
                  { code: 'en' as const, label: 'English', sub: 'EN' },
                  { code: 'hi' as const, label: 'हिंदी', sub: 'HI' },
                  { code: 'mr' as const, label: 'मराठी', sub: 'MR' },
                ].map(({ code, label, sub }) => (
                  <button
                    key={code}
                    onClick={() => {
                      setLanguage(code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded transition-colors text-left ${
                      language === code ? 'font-bold' : ''
                    }`}
                    style={{
                      background: language === code ? 'var(--lime-subtle)' : 'transparent',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] font-mono opacity-70">{sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="fd-btn-icon"
            title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
            aria-label="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--lime)] transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--text-primary)] transition-transform hover:-rotate-12" />
            )}
          </button>

          <button
            onClick={() => setIsPrototypeDrawerOpen(true)}
            className="fd-btn-ghost flex items-center gap-1.5"
            title="Switch screens"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-xs">{t('common.screens')}</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
              style={{ background: 'var(--lime)', color: '#111311' }}
            >13</span>
          </button>

          <button
            onClick={() => setIsAlertDrawerOpen(true)}
            className="fd-btn-icon relative"
            aria-label="Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center"
                style={{ background: 'var(--critical)', color: '#fff', border: '2px solid var(--bg-panel)' }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
