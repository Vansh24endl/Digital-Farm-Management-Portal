import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  UserCheck,
  Edit,
  Mail,
  Phone,
  IdCard,
  Lock,
  LogOut,
  ShieldCheck,
  Camera,
  Calendar,
  KeyRound,
  Stethoscope,
  ArrowRight,
  Bell,
  RefreshCw,
  Clock,
} from 'lucide-react';

const roleLabel = (role?: string) => {
  switch (role) {
    case 'admin': return 'System Administrator';
    case 'farm_manager': return 'Farm Operations Manager';
    case 'inspector': return 'Biosecurity Inspector';
    case 'veterinarian': return 'Veterinarian';
    default: return role ? role.replace('_', ' ') : 'Registered User';
  }
};

export const ProfileScreen: React.FC = () => {
  const { userProfile, updateUserProfile, openModal, navigateTo, currentUser } = useApp();

  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    // Fetch live user profile from /api/users/profile
    const fetchUser = async () => {
      try {
        const res = await api.getUserProfile();
        if (res.success && res.data) {
          setDbUser(res.data);
        }
      } catch {
        // Fallback to currentUser / context
      }
    };
    fetchUser();
  }, [currentUser]);

  const displayName = dbUser?.name || currentUser?.name || userProfile.name;
  const displayEmail = dbUser?.email || currentUser?.email || userProfile.email;
  const displayPhone = dbUser?.phone || currentUser?.phone || userProfile.phone || '—';
  const displayRole = dbUser?.role || currentUser?.role || 'farm_manager';
  const isActive = dbUser?.isActive !== undefined ? dbUser.isActive : currentUser?.isActive !== false;
  const registrationDate = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Oct 2026';

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'FD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const avatarUrl =
    dbUser?.profilePhoto ||
    userProfile.avatar ||
    currentUser?.profilePhoto ||
    (typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_avatar') : null) ||
    '';

  const isVet = displayRole === 'veterinarian';
  const isAdmin = displayRole === 'admin';

  return (
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* ── 1. User Profile Header Hero Card ─────────────────────────────── */}
      <div className="fd-card rounded-[3px] p-5 relative overflow-hidden border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
          <div className="relative flex-shrink-0 group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[3px] object-cover border border-[var(--border)] shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-[3px] flex items-center justify-center font-bold font-display text-2xl border border-[var(--border)] shadow-md"
                style={{ background: 'rgba(163, 230, 53, 0.15)', color: 'var(--lime)' }}
              >
                {getInitials(displayName)}
              </div>
            )}
            <button
              onClick={() => openModal('change-dp')}
              className="absolute inset-0 rounded-[2px] bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[var(--lime)] text-[10px] font-mono font-bold transition-opacity"
              title="Click to Change Photo"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span>EDIT PHOTO</span>
            </button>
            <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-[2px] bg-[var(--lime)] text-[#111311] text-[9px] font-mono font-bold uppercase tracking-wider shadow-sm">
              {displayRole.replace('_', ' ')}
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="fd-badge fd-badge-success text-xs font-mono inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> {roleLabel(displayRole)}
              </span>
              <span className="fd-badge text-xs font-mono inline-flex items-center gap-1.5 bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-dim)]">
                <Clock className="w-3.5 h-3.5" /> Registered: {registrationDate}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-[var(--text-primary)]">
              {displayName}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed max-w-2xl">
              {displayEmail}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={() => openModal('edit-profile')}
                className="fd-btn px-3.5 py-2 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Personal Information
              </button>
              <button
                onClick={() => openModal('change-password')}
                className="fd-btn-ghost px-3.5 py-2 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 text-[var(--lime)] border-[var(--border)] w-full sm:w-auto"
              >
                <KeyRound className="w-3.5 h-3.5" /> Change Password
              </button>
              <button
                onClick={() => openModal('change-dp')}
                className="fd-btn-ghost px-3.5 py-2 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <Camera className="w-3.5 h-3.5" /> Update Photo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Link to Separate Veterinarian Profile (For Vet accounts) ────── */}
      {isVet && (
        <div className="fd-card p-4 rounded-[3px] border border-[var(--lime-dim)] bg-[var(--lime-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-[var(--lime)] text-[#111311] flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
                Professional Veterinarian Profile
              </p>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                Manage your clinical qualifications, registration numbers, clinic details, and verification status.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('vet-profile')}
            className="fd-btn px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
          >
            <span>View Professional Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 3. Link to Admin Verification Queue (For Admin accounts) ───────── */}
      {isAdmin && (
        <div className="fd-card p-4 rounded-[3px] border border-[var(--warning-dim)] bg-[var(--warning-bg)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[2px] bg-[var(--warning)] text-[#111311] flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
                Veterinarian Verification Console
              </p>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                Review and approve/reject pending veterinarian licenses and clinical registrations.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('vet-profile')}
            className="fd-btn px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
          >
            <span>Open Verification Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 4. Account Details Grid (Personal info only, NO vet info) ──────── */}
      <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[var(--lime)]" />
          Personal Account Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Full Name */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Full Name</span>
              <p className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)] truncate">{displayName}</p>
            </div>
          </div>

          {/* Email */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Email Address</span>
              <p className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)] truncate">{displayEmail}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Phone Number</span>
              <p className="text-xs sm:text-sm font-semibold font-mono text-[var(--text-primary)] truncate">{displayPhone}</p>
            </div>
          </div>

          {/* Account Role */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
              <IdCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Account Role</span>
              <p className="text-xs sm:text-sm font-mono font-bold text-[var(--lime)] truncate">{roleLabel(displayRole)}</p>
            </div>
          </div>

          {/* Account Status */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--success)] flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Account Status</span>
              <p className="text-xs sm:text-sm font-mono font-bold text-[var(--success)] truncate">
                {isActive ? 'Active & Verified' : 'Suspended'}
              </p>
            </div>
          </div>

          {/* Registration Date */}
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Registration Date</span>
              <p className="text-xs sm:text-sm font-mono font-bold text-[var(--text-primary)] truncate">{registrationDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Security & Password Management Card ────────────────────────── */}
      <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[var(--lime)]" />
          Security & Password Management
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-[3px] fd-raised border border-[var(--border-dim)]">
          <div>
            <p className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
              Account Authentication Password
            </p>
            <p className="text-[11px] font-mono text-[var(--text-secondary)]">
              Securely update your login password. Requires verifying your existing password.
            </p>
          </div>
          <button
            onClick={() => openModal('change-password')}
            className="fd-btn px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
          >
            <KeyRound className="w-3.5 h-3.5" /> Change Password
          </button>
        </div>
      </div>

      {/* ── 6. App Preferences ────────────────────────────────────────────── */}
      <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[var(--lime)]" />
          App Preferences
        </h3>

        <div className="space-y-2.5">
          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[var(--lime)]" />
              <div>
                <p className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">Push Notifications</p>
                <p className="text-[11px] font-mono text-[var(--text-secondary)]">Receive critical notifications and disease updates</p>
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
                userProfile.settings?.pushNotifications
                  ? 'bg-[var(--lime)] border-[var(--lime)]'
                  : 'bg-[var(--bg-main)] border-[var(--border)]'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-[1px] absolute top-[2px] transition-all ${
                  userProfile.settings?.pushNotifications ? 'left-5 bg-[#111311]' : 'left-0.5 bg-[var(--text-dim)]'
                }`}
              />
            </button>
          </div>

          <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-[var(--text-primary)]" />
              <div>
                <p className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">Data Sync Frequency</p>
                <p className="text-[11px] font-mono text-[var(--text-secondary)]">Sync interval with Central Cloud</p>
              </div>
            </div>
            <select
              value={userProfile.settings?.syncFrequency || 'Real-time'}
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
              <option value="Real-time">Real-time</option>
              <option value="Every 15 mins">Every 15 mins</option>
              <option value="Hourly">Hourly</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 7. Logout ─────────────────────────────────────────────────────── */}
      <div className="text-center pt-1">
        <button
          onClick={() => openModal('logout')}
          className="fd-btn-danger w-full py-2.5 rounded-[3px] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};
