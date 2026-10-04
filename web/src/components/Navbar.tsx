import React, { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { ScreenId } from '../types';
import {
  ChevronLeft,
  Bell,
  Layers,
  User,
  Camera,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';

const screenTitles: Record<ScreenId, { title: string; subtitle: string }> = {
  dashboard: { title: 'AgroShield Surveillance', subtitle: 'Biosecurity & Commercial Farm Health' },
  profile: { title: 'User Profile', subtitle: 'Veterinary Specialist & Account Settings' },
  surveillance: { title: 'Disease Surveillance', subtitle: 'Real-time Vector & Outbreak Tracking' },
  health: { title: 'Farm Health Overview', subtitle: 'Telemetry, Water, Temp & PCR Diagnostic' },
  audits: { title: 'Audits & Compliance', subtitle: 'Inspection Checklists & Protocols' },
  visitors: { title: 'Visitor Control Log', subtitle: 'On-Premise Entrant & Bio-Pass Tracking' },
  checklist: { title: 'Biosecurity Checklist', subtitle: 'Daily Decontamination & Zone Status' },
  weather: { title: 'Micro-Climate Weather', subtitle: 'Farm Forecast & Humidity Monitoring' },
  emergency: { title: 'Emergency Contacts', subtitle: '24/7 Vet Response & Authorities' },
  training: { title: 'Training & Guidelines', subtitle: 'Clinical SOPs & Hygiene Rules' },
  'farm-map': { title: 'Farm Map Blueprint', subtitle: 'Poultry House B - Zone 2 Alert' },
  inventory: { title: 'Biosecurity Inventory', subtitle: 'Chemicals, PPE & Diagnostic Stock' },
  reports: { title: 'Reports & Analytics', subtitle: 'Compliance Certificates & PDF Export' },
};

export const Navbar: React.FC = () => {
  const {
    activeScreen,
    navigateTo,
    goBack,
    userProfile,
    alerts,
    setIsPrototypeDrawerOpen,
    setIsAlertDrawerOpen,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    openModal,
  } = useApp();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadAlertsCount = alerts.filter((a) => !a.read).length;
  const screenInfo = screenTitles[activeScreen] || screenTitles.dashboard;
  const isHome = activeScreen === 'dashboard';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsProfileDropdownOpen]);

  return (
    <header className="sticky top-0 z-40 bg-[#181922]/95 backdrop-blur-md border-b border-[#2d3142] px-4 sm:px-6 lg:px-8 py-3.5 font-sans transition-all duration-200">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Left Section: Avatar Dropdown Trigger or Back Button */}
        <div className="flex items-center gap-3.5">
          {!isHome ? (
            <button
              onClick={goBack}
              className="p-2.5 rounded-xl bg-[#212330] border border-[#33374a] text-slate-300 hover:text-white hover:border-[#c0c1ff] active:scale-95 transition-all flex items-center justify-center"
              aria-label="Go Back"
            >
              <ChevronLeft className="w-5 h-5 text-[#c0c1ff]" />
            </button>
          ) : null}

          {/* Clickable Profile DP Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              className="relative flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-[#212330] border border-transparent hover:border-[#33374a] transition-all group"
              aria-label="User Profile Dropdown"
            >
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#4f46e5] group-hover:border-[#c0c1ff] transition-all shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#16a34a] border-2 border-[#181922] rounded-full"></span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-white leading-snug group-hover:text-[#c0c1ff] transition-colors flex items-center gap-1">
                  {userProfile.name}
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#c0c1ff]" />
                </p>
                <p className="text-xs text-slate-400 font-sans truncate max-w-[140px]">
                  {userProfile.title.split('&')[0]}
                </p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute top-14 left-0 w-72 bg-[#181922] border border-[#33374a] rounded-2xl shadow-2xl p-2.5 z-50 animate-fadeIn space-y-1">
                <div className="p-3.5 rounded-xl bg-[#212330] border border-[#33374a] mb-2">
                  <p className="text-sm font-bold text-white">{userProfile.name}</p>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">{userProfile.email}</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full bg-[#16a34a]/20 text-[#4CAF50] text-xs font-bold border border-[#16a34a]/40">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active Specialist
                  </span>
                </div>

                <button
                  onClick={() => navigateTo('profile')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-[#2a2d3d] flex items-center gap-3 transition-all"
                >
                  <User className="w-4 h-4 text-[#c0c1ff]" /> View Full Profile
                </button>

                <button
                  onClick={() => openModal('change-dp')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-[#2a2d3d] flex items-center gap-3 transition-all"
                >
                  <Camera className="w-4 h-4 text-[#c0c1ff]" /> Change Profile Picture (DP)
                </button>

                <button
                  onClick={() => openModal('edit-profile')}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-[#2a2d3d] flex items-center gap-3 transition-all"
                >
                  <Settings className="w-4 h-4 text-[#c0c1ff]" /> Edit Profile Settings
                </button>

                <div className="pt-1.5 border-t border-[#33374a]">
                  <button
                    onClick={() => openModal('logout')}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-[#fca5a5] hover:bg-[#dc2626]/20 flex items-center gap-3 transition-all"
                  >
                    <LogOut className="w-4 h-4 text-[#dc2626]" /> Log Out Session
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold font-sans text-white tracking-tight leading-none">
                {screenInfo.title}
              </h1>
              <span className="px-2.5 py-1 text-xs font-bold tracking-wider uppercase bg-[#4f46e5]/30 text-[#c0c1ff] border border-[#c0c1ff]/30 rounded-full hidden sm:inline-block">
                Bio-Vigilant
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-sans hidden md:block mt-0.5">
              {screenInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Section: Prototype Switcher & Alert Bell */}
        <div className="flex items-center gap-3">
          {/* All Screens Jumper Button */}
          <button
            onClick={() => setIsPrototypeDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#212330] hover:bg-[#2a2d3d] border border-[#33374a] hover:border-[#c0c1ff]/50 text-slate-200 text-xs font-bold transition-all active:scale-95"
            title="Open 13 Prototype Screens Switcher"
          >
            <Layers className="w-4 h-4 text-[#c0c1ff]" />
            <span className="hidden md:inline">Screens</span>
            <span className="bg-[#4f46e5] text-white text-xs px-2 py-0.5 rounded-full font-extrabold">
              13
            </span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setIsAlertDrawerOpen(true)}
            className="relative p-2.5 rounded-xl bg-[#212330] hover:bg-[#2a2d3d] border border-[#33374a] hover:border-[#dc2626]/50 text-slate-300 hover:text-white transition-all active:scale-95"
            aria-label="Open Alerts Drawer"
          >
            <Bell className="w-5 h-5 text-slate-300" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-xs font-extrabold rounded-full flex items-center justify-center animate-pulse border-2 border-[#181922]">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
