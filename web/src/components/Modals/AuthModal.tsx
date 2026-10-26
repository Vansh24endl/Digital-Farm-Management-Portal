import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  X,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { activeModal, modalPayload, closeModal, loginUser, registerUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'farm_manager' | 'inspector' | 'veterinarian' | 'admin'>('farm_manager');
  const [farmId, setFarmId] = useState('');
  const [availableFarms, setAvailableFarms] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (activeModal === 'auth') {
      setError('');
      if (modalPayload?.mode === 'register') {
        setMode('register');
      } else {
        setMode('login');
      }
      // Load farms list for registration dropdown
      api.getFarms()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          setAvailableFarms(
            list.map((f: any) => ({
              id: String(f._id || f.id),
              name: String(f.name || 'Unnamed Farm'),
            }))
          );
        })
        .catch(() => {});
    }
  }, [activeModal, modalPayload]);

  if (activeModal !== 'auth') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginUser(email, password);
      } else {
        await registerUser({
          name,
          email,
          password,
          role,
          farmId: farmId || undefined,
          phone,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoRole: 'admin' | 'veterinarian' | 'farm_manager') => {
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
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md rounded-[3px] overflow-hidden shadow-2xl relative bg-[var(--bg-panel)] border border-[var(--border)]"
      >
        {/* Top Header */}
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-[var(--lime-bg)] border border-[var(--lime)]/30 flex items-center justify-center text-[var(--lime)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
                FarmDrishti Portal
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                Biosecurity & Surveillance Access
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--border)] p-1 bg-[var(--bg-main)] gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-[2px] transition-all ${
              mode === 'login'
                ? 'bg-[var(--lime)] text-[#111311] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-[2px] transition-all ${
              mode === 'register'
                ? 'bg-[var(--lime)] text-[#111311] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-3 p-2.5 rounded-[2px] bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-[var(--critical)] text-xs font-mono flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--critical)] shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          {mode === 'register' && (
            <>
              <div>
                <label className="fd-label block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[var(--text-dim)] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="fd-input w-full pl-9 pr-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="fd-label block mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="fd-select w-full text-xs font-mono py-1.5"
                  >
                    <option value="farm_manager">Farm Manager</option>
                    <option value="veterinarian">Veterinarian</option>
                    <option value="inspector">Biosecurity Inspector</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="fd-label block mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[var(--text-dim)] absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="fd-input w-full pl-9 pr-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {availableFarms.length > 0 && (
                <div>
                  <label className="fd-label block mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[var(--text-dim)]" /> Assigned Farm (Optional)
                  </label>
                  <select
                    value={farmId}
                    onChange={(e) => setFarmId(e.target.value)}
                    className="fd-select w-full text-xs font-mono py-1.5"
                  >
                    <option value="">No specific farm (All access)</option>
                    {availableFarms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label className="fd-label block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--text-dim)] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@farmdrishti.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="fd-input w-full pl-9 pr-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="fd-label block mb-1">
              Password {mode === 'register' && '(min. 6 characters)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[var(--text-dim)] absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="fd-input w-full pl-9 pr-9 py-1.5 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[var(--text-dim)] hover:text-[var(--text-primary)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="fd-btn w-full mt-2 py-2 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-[#111311] border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              'Sign In to Dashboard'
            ) : (
              'Create Farm Account'
            )}
          </button>
        </form>

        {/* Demo Fast-Fill helper for Viva / Presentation */}
        {mode === 'login' && (
          <div className="p-3 pt-0 border-t border-[var(--border-dim)]">
            <p className="text-[10px] text-[var(--text-dim)] mb-1.5 flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[var(--lime)]" /> Quick Credentials:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono bg-[var(--bg-raised)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-dim)]"
              >
                Admin (admin@farmdrishti.org)
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('veterinarian')}
                className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono bg-[var(--bg-raised)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-dim)]"
              >
                Vet (ananya.reyes@biosec.vet)
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('farm_manager')}
                className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono bg-[var(--bg-raised)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-dim)]"
              >
                Manager (manager@greenvalley.farm)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
