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
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* 1. Header Profile Hero Card */}
      <div className="fd-card rounded-[3px] p-5 relative overflow-hidden border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          <div className="relative flex-shrink-0 group">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[3px] object-cover border border-[var(--border)] shadow-md"
            />
            <button
              onClick={() => openModal('change-dp')}
              className="absolute inset-0 rounded-[2px] bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[var(--lime)] text-[10px] font-mono font-bold transition-opacity"
              title="Click to Change DP"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span>EDIT DP</span>
            </button>
            <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-[2px] bg-[var(--lime)] text-[#111311] text-[9px] font-mono font-bold uppercase tracking-wider shadow-sm">
              SPECIALIST
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="fd-badge fd-badge-success text-xs font-mono inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Senior Biosecurity Specialist
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-[var(--text-primary)]">
              {userProfile.name}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans max-w-2xl">
              {userProfile.bio}
            </p>

            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={() => openModal('edit-profile')}
                className="fd-btn px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile Details
              </button>
              <button
                onClick={() => openModal('change-dp')}
                className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-[var(--lime)]" /> Change DP
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Information Card */}
      <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[var(--lime)]" />
          Personal Credentials & Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Email Address</span>
              <p className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)] truncate">{userProfile.email}</p>
            </div>
          </div>

          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Direct Contact</span>
              <p className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)] truncate">{userProfile.phone}</p>
            </div>
          </div>

          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Assigned Region</span>
              <p className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)] truncate">{userProfile.location}</p>
            </div>
          </div>

          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
              <IdCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Employee ID / License</span>
              <p className="text-xs sm:text-sm font-mono font-bold text-[var(--lime)] truncate">{userProfile.employeeId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Certifications & Specialties */}
      <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-[var(--warning)]" />
          Board Certifications & Specialties
        </h3>

        <div className="space-y-2">
          {userProfile.certifications.map((cert, idx) => (
            <div
              key={idx}
              className="fd-raised p-2.5 rounded-[3px] border border-[var(--border-dim)] flex items-center justify-between text-xs font-semibold text-[var(--text-primary)]"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
                <span className="font-sans">{cert}</span>
              </div>
              <span className="fd-badge fd-badge-success text-[10px] font-mono uppercase">Verified Active</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Assigned Farms (6 Active) */}
      <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--lime)]" />
            Assigned Farm Units ({userProfile.assignedFarms.length} Active Sites)
          </h3>
          <span className="text-[10px] font-mono text-[var(--lime)] uppercase tracking-wider">HQ Coverage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {userProfile.assignedFarms.map((farm, idx) => (
            <div
              key={idx}
              onClick={() => navigateTo('farm-map')}
              className="fd-raised hover:border-[var(--lime)] border border-[var(--border-dim)] rounded-[3px] p-2.5 flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div>
                <h4 className="text-xs font-bold font-display uppercase text-[var(--text-primary)] group-hover:text-[var(--lime)] transition-colors">
                  {farm.name}
                </h4>
                <p className="text-[10px] font-mono text-[var(--text-dim)]">{farm.sector}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    farm.status === 'optimal'
                      ? 'bg-[var(--success)]'
                      : farm.status === 'warning'
                      ? 'bg-[var(--warning)] animate-ping'
                      : 'bg-[var(--critical)]'
                  }`}
                ></span>
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-dim)] group-hover:text-[var(--lime)] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. App Settings */}
      <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[var(--lime)]" />
          App Preferences & Biosecurity Controls
        </h3>

        <div className="space-y-2.5">
          {/* Push Notifications Toggle */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[var(--lime)]" />
              <div>
                <p className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">Push Notifications & Bio-Alerts</p>
                <p className="text-[11px] font-mono text-[var(--text-secondary)]">Receive instant high-priority outbreak alerts</p>
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
              className={`w-10 h-5 rounded-[2px] transition-colors relative border ${
                userProfile.settings.pushNotifications
                  ? 'bg-[var(--lime)] border-[var(--lime)]'
                  : 'bg-[var(--bg-main)] border-[var(--border)]'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-[1px] absolute top-[2px] transition-all ${
                  userProfile.settings.pushNotifications ? 'left-5 bg-[#111311]' : 'left-0.5 bg-[var(--text-dim)]'
                }`}
              ></span>
            </button>
          </div>

          {/* Data Sync Frequency */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-[var(--text-primary)]" />
              <div>
                <p className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">Data Sync Frequency</p>
                <p className="text-[11px] font-mono text-[var(--text-secondary)]">Sync interval with Central HQ</p>
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
              className="fd-select text-xs font-mono py-1 px-2.5 text-[var(--text-primary)]"
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
      <div className="text-center pt-1">
        <button
          onClick={() => openModal('logout')}
          className="fd-btn-danger w-full py-2.5 rounded-[3px] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> End Specialist Session & Log Out
        </button>
      </div>
    </div>
  );
};
