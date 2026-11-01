import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  Building2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Activity,
  HelpCircle,
  X,
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { loginUser, registerUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'farm_manager' | 'inspector' | 'veterinarian' | 'admin'>('farm_manager');
  const [farmId, setFarmId] = useState('');
  const [availableFarms, setAvailableFarms] = useState<Array<{ id: string; name: string }>>([]);

  // Restore remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('farmdrishti_remember_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  // Fetch farms list for registration dropdown
  useEffect(() => {
    let cancelled = false;
    api.getFarms()
      .then((res: any) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setAvailableFarms(
          list.map((f: any) => ({
            id: String(f._id || f.id),
            name: String(f.name || 'Unnamed Farm'),
          }))
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('farmdrishti_remember_email', email.trim());
      } else {
        localStorage.removeItem('farmdrishti_remember_email');
      }

      await loginUser(email.trim(), password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('farmdrishti_remember_email', email.trim());
      }
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        farmId: farmId || undefined,
        phone: phone.trim() || undefined,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoRole: 'admin' | 'veterinarian' | 'manager') => {
    setErrorMessage('');
    setSuccessMessage('');
    if (demoRole === 'admin') {
      setEmail('admin@farmdrishti.org');
      setPassword('Admin@1234');
    } else if (demoRole === 'veterinarian') {
      setEmail('ananya.reyes@biosec.vet');
      setPassword('VetSecret@123');
    } else {
      setEmail('manager@greenvalley.farm');
      setPassword('Manager@123');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(163, 230, 53, 0.08) 0%, var(--bg-main) 70%)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Background ambient grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, var(--border-dim) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ── Left Column: FarmDrishti Telemetry Branding ── */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Logo & Platform Name */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm border border-[var(--lime)]/30 bg-[var(--lime)]/10 text-xs font-mono text-[var(--lime)]">
              <span className="w-2 h-2 rounded-full bg-[var(--lime)] animate-pulse" />
              BIOSECURITY SYSTEM ONLINE · v2.4
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-sm flex items-center justify-center font-bold font-display text-xl border shadow-sm"
                style={{
                  background: 'var(--lime)',
                  color: '#0a0d08',
                  borderColor: 'var(--lime)',
                }}
              >
                <ShieldCheck className="w-7 h-7" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight font-display" style={{ color: 'var(--text-primary)' }}>
                  Farm<span style={{ color: 'var(--lime)' }}>Drishti</span>
                </h1>
                <p className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">
                  Swine & Poultry Biosecurity Intelligence
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[var(--text-secondary)] font-sans max-w-lg">
            Authorized portal for live pathogen vector surveillance, facility quarantine compliance, real-time footbath/air filtration tracking, and certified biosecurity audits.
          </p>

          {/* Biosecurity Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-sm border border-[var(--border-dim)] bg-[var(--card-bg)] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                <Activity className="w-3.5 h-3.5 text-[var(--lime)]" />
                <span>Live Surveillance</span>
              </div>
              <p className="text-[11px] text-[var(--text-dim)]">Real-time alerts for viral and bacterial outbreak containment.</p>
            </div>

            <div className="p-3 rounded-sm border border-[var(--border-dim)] bg-[var(--card-bg)] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--lime)]" />
                <span>Verified Audits</span>
              </div>
              <p className="text-[11px] text-[var(--text-dim)]">Electronic decontamination logs & SOP verification.</p>
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-4 rounded-sm border border-[var(--border-dim)] bg-[var(--card-bg)]/80 backdrop-blur-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase text-[var(--text-secondary)]">Quick Demo Credentials:</span>
              <span className="text-[11px] font-mono text-[var(--lime)] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 1-Click Load
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="px-2.5 py-1 text-xs font-mono rounded-sm border border-[var(--border-dim)] hover:border-[var(--lime)] bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)]" />
                Administrator
              </button>
              <button
                type="button"
                onClick={() => fillDemo('veterinarian')}
                className="px-2.5 py-1 text-xs font-mono rounded-sm border border-[var(--border-dim)] hover:border-[var(--lime)] bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Veterinarian
              </button>
              <button
                type="button"
                onClick={() => fillDemo('manager')}
                className="px-2.5 py-1 text-xs font-mono rounded-sm border border-[var(--border-dim)] hover:border-[var(--lime)] bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Farm Manager
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Authentication Card ── */}
        <div className="lg:col-span-6">
          <div
            className="fd-card p-6 sm:p-8 rounded-sm shadow-xl border border-[var(--border-dim)] relative"
            style={{ background: 'var(--card-bg)' }}
          >
            {/* Mode Tabs */}
            <div className="flex items-center border-b border-[var(--border-dim)] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className={`flex-1 pb-3 text-sm font-bold font-display uppercase tracking-wider transition-colors relative ${
                  mode === 'login'
                    ? 'text-[var(--lime)]'
                    : 'text-[var(--text-dim)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Sign In
                {mode === 'login' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--lime)]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
                className={`flex-1 pb-3 text-sm font-bold font-display uppercase tracking-wider transition-colors relative ${
                  mode === 'register'
                    ? 'text-[var(--lime)]'
                    : 'text-[var(--text-dim)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Create Account
                {mode === 'register' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--lime)]" />
                )}
              </button>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="mb-5 p-3 rounded-sm bg-[var(--lime)]/10 border border-[var(--lime)]/30 text-[var(--lime)] text-xs font-mono flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ── Sign In Form ── */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="fd-label flex items-center justify-between">
                    <span>Workstation Email</span>
                    <span className="text-[10px] text-[var(--text-dim)] font-mono">Required</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. manager@greenvalley.farm"
                      required
                      autoComplete="email"
                      disabled={loading}
                      className="fd-input w-full pl-10 pr-3 py-2.5 text-sm rounded-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="fd-label">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-xs font-mono text-[var(--lime)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      autoComplete="current-password"
                      disabled={loading}
                      className="fd-input w-full pl-10 pr-10 py-2.5 text-sm rounded-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded-sm accent-[var(--lime)] bg-[var(--bg-main)] border-[var(--border-dim)] cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[var(--text-secondary)]">
                      Remember me on this workstation
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="fd-btn w-full mt-2 py-3 flex items-center justify-center gap-2 text-sm font-bold font-display uppercase tracking-wider rounded-sm transition-all"
                  style={{
                    background: 'var(--lime)',
                    color: '#0a0d08',
                    border: 'none',
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Biosecurity Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ── Registration Form ── */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="fd-label">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. John Doe / Maria Vance"
                      required
                      disabled={loading}
                      className="fd-input w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-sm"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div className="space-y-1">
                  <label className="fd-label">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@farmdrishti.org"
                      required
                      disabled={loading}
                      className="fd-input w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="fd-label">Create Password (min 6 chars)</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      minLength={6}
                      disabled={loading}
                      className="fd-input w-full pl-10 pr-10 py-2 text-xs sm:text-sm rounded-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label className="fd-label">Assign Operational Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="fd-input w-full px-3 py-2 text-xs sm:text-sm rounded-sm"
                    disabled={loading}
                  >
                    <option value="farm_manager">Farm Operations Manager (Farmer)</option>
                    <option value="veterinarian">Biosecurity Field Veterinarian</option>
                    <option value="inspector">Certified Biosecurity Inspector</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                {/* Primary Farm Selection (if applicable) */}
                {role === 'farm_manager' && (
                  <div className="space-y-1">
                    <label className="fd-label">Assigned Production Facility</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                      <select
                        value={farmId}
                        onChange={(e) => setFarmId(e.target.value)}
                        className="fd-input w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-sm"
                        disabled={loading}
                      >
                        <option value="">Select Farm Facility...</option>
                        {availableFarms.map((farm) => (
                          <option key={farm.id} value={farm.id}>
                            {farm.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Phone Contact */}
                <div className="space-y-1">
                  <label className="fd-label">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      disabled={loading}
                      className="fd-input w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-sm"
                    />
                  </div>
                </div>

                {/* Register Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="fd-btn w-full mt-2 py-3 flex items-center justify-center gap-2 text-sm font-bold font-display uppercase tracking-wider rounded-sm transition-all"
                  style={{
                    background: 'var(--lime)',
                    color: '#0a0d08',
                    border: 'none',
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer security disclaimer */}
            <div className="mt-6 pt-4 border-t border-[var(--border-dim)] flex items-center justify-between text-[11px] font-mono text-[var(--text-dim)]">
              <span>FarmDrishti Protocol ISO-22000</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[var(--lime)]" /> End-to-End TLS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Forgot Password Dialog Modal ── */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="fd-card p-6 rounded-sm max-w-md w-full space-y-4 border border-[var(--border-dim)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold font-display text-[var(--text-primary)]">
                <HelpCircle className="w-4 h-4 text-[var(--lime)]" />
                <span>Credential Recovery Protocol</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-[var(--text-dim)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-sm bg-[var(--bg-main)] border border-[var(--border-dim)] space-y-2 text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
              <p>
                To maintain biosecurity facility compliance and prevent unauthorized access to disease incident logs, account password resets require administrator authentication.
              </p>
              <p className="font-mono text-[11px] text-[var(--lime)]">
                Contact: admin@farmdrishti.org · Ext: +1 (555) 019-8300
              </p>
            </div>

            <p className="text-xs text-[var(--text-dim)]">
              If you are testing the platform in a staging environment, please use one of the quick 1-click demo logins provided on the sign-in page.
            </p>

            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(false)}
              className="fd-btn w-full py-2 text-xs font-mono font-bold"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
