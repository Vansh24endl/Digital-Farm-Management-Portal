import React from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck,
  Edit,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Award,
  Building2,
  Bell,
  RefreshCw,
  Lock,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Camera,
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { userProfile, updateUserProfile, openModal, navigateTo } = useApp();

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Header Profile Hero Card */}
      <div className="surface-card rounded-2xl p-6 relative overflow-hidden border border-[#2d3142]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          <div className="relative flex-shrink-0 group">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#4f46e5] shadow-xl"
            />
            <button
              onClick={() => openModal('change-dp')}
              className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity"
              title="Click to Change DP"
            >
              <Camera className="w-6 h-6 mb-0.5" />
              <span>Change DP</span>
            </button>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[#4f46e5] text-white text-[10px] font-bold border border-[#c0c1ff]/50">
              SPECIALIST
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#16a34a]/20 text-[#4CAF50] text-xs font-bold border border-[#16a34a]/40 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Senior Biosecurity Specialist
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">{userProfile.name}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">{userProfile.bio}</p>

            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={() => openModal('edit-profile')}
                className="px-4 py-2 text-xs font-bold bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile Details
              </button>
              <button
                onClick={() => openModal('change-dp')}
                className="px-4 py-2 text-xs font-bold bg-[#212330] hover:bg-[#2a2d3d] text-slate-200 border border-[#33374a] rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
              >
                <Camera className="w-3.5 h-3.5 text-[#c0c1ff]" /> Change DP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Information Card */}
      <div className="surface-card p-5 rounded-2xl border border-[#2d3142]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-[#c0c1ff]" />
          Personal Credentials & Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#212330] border border-[#33374a] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#4f46e5]/30 text-[#c0c1ff]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Email Address</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-100">{userProfile.email}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#212330] border border-[#33374a] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#4f46e5]/30 text-[#c0c1ff]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Direct Contact</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-100">{userProfile.phone}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#212330] border border-[#33374a] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#4f46e5]/30 text-[#c0c1ff]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Region</span>
              <p className="text-xs sm:text-sm font-semibold text-slate-100">{userProfile.location}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#212330] border border-[#33374a] flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#4f46e5]/30 text-[#c0c1ff]">
              <IdCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Employee ID / License</span>
              <p className="text-xs sm:text-sm font-mono font-bold text-[#c0c1ff]">{userProfile.employeeId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Certifications & Specialties */}
      <div className="surface-card p-5 rounded-2xl border border-[#2d3142]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#d97706]" />
          Board Certifications & Specialties
        </h3>

        <div className="space-y-2">
          {userProfile.certifications.map((cert, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#212330] border border-[#33374a] flex items-center justify-between text-xs font-semibold text-slate-200"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                <span>{cert}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono uppercase">Verified Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Assigned Farms (6 Active) */}
      <div className="surface-card p-5 rounded-2xl border border-[#2d3142]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#c0c1ff]" />
            Assigned Farm Units (6 Active Sites)
          </h3>
          <span className="text-[11px] text-[#c0c1ff] font-semibold">HQ Coverage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {userProfile.assignedFarms.map((farm, idx) => (
            <div
              key={idx}
              onClick={() => navigateTo('farm-map')}
              className="p-3 rounded-xl bg-[#212330] hover:bg-[#2a2d3d] border border-[#33374a] hover:border-[#c0c1ff]/40 flex items-center justify-between cursor-pointer transition-all active:scale-95 group"
            >
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#c0c1ff] transition-colors font-sans">
                  {farm.name}
                </h4>
                <p className="text-[10px] text-slate-400">{farm.sector}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    farm.status === 'optimal'
                      ? 'bg-[#16a34a]'
                      : farm.status === 'warning'
                      ? 'bg-[#d97706] animate-ping'
                      : 'bg-[#dc2626]'
                  }`}
                ></span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#c0c1ff]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. App Settings */}
      <div className="surface-card p-5 rounded-2xl border border-[#2d3142]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-[#c0c1ff]" />
          App Preferences & Biosecurity Controls
        </h3>

        <div className="space-y-3">
          {/* Push Notifications Toggle */}
          <div className="p-3.5 rounded-xl bg-[#212330] border border-[#33374a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#c0c1ff]" />
              <div>
                <p className="text-xs font-bold text-white">Push Notifications & Bio-Alerts</p>
                <p className="text-[11px] text-slate-400">Receive instant high-priority outbreak alerts</p>
              </div>
            </div>
            <button
              onClick={() =>
                updateUserProfile({
                  settings: {
                    ...userProfile.settings,
                    pushNotifications: !userProfile.settings.pushNotifications,
                  },
                })
              }
              className={`w-11 h-6 rounded-full transition-all relative ${
                userProfile.settings.pushNotifications ? 'bg-[#4f46e5]' : 'bg-[#2a2d3d]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  userProfile.settings.pushNotifications ? 'left-6 bg-[#c0c1ff]' : 'left-1'
                }`}
              ></span>
            </button>
          </div>

          {/* Data Sync Frequency */}
          <div className="p-3.5 rounded-xl bg-[#212330] border border-[#33374a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-[#c0c1ff]" />
              <div>
                <p className="text-xs font-bold text-white">Data Sync Frequency</p>
                <p className="text-[11px] text-slate-400">Sync interval with Central HQ</p>
              </div>
            </div>
            <select
              value={userProfile.settings.syncFrequency}
              onChange={(e) =>
                updateUserProfile({
                  settings: {
                    ...userProfile.settings,
                    syncFrequency: e.target.value as any,
                  },
                })
              }
              className="bg-[#181922] text-xs text-[#c0c1ff] font-bold border border-[#33374a] px-2.5 py-1 rounded-lg outline-none"
            >
              <option value="Real-time">Real-time (5G/Satellite)</option>
              <option value="Every 15 mins">Every 15 mins</option>
              <option value="Hourly">Hourly</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Logout Action Button */}
      <div className="text-center pt-2">
        <button
          onClick={() => openModal('logout')}
          className="w-full py-3 rounded-xl bg-[#dc2626]/20 hover:bg-[#dc2626]/30 border border-[#dc2626]/60 text-[#fca5a5] text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
        >
          <LogOut className="w-4 h-4" /> End Specialist Session & Log Out
        </button>
      </div>
    </div>
  );
};
