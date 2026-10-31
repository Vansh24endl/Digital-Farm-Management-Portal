import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Save, User, Phone, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

// ─── EditProfileModal ─────────────────────────────────────────────────────────
export const EditProfileModal: React.FC = () => {
  const { activeModal, closeModal, userProfile, updateUserProfile, currentUser, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: currentUser?.name || userProfile.name,
    phone: currentUser?.phone || userProfile.phone || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (activeModal !== 'edit-profile') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update in backend
      await api.updateProfile({ name: formData.name.trim(), phone: formData.phone.trim() });
      // Update local state
      await updateUserProfile({ name: formData.name.trim(), phone: formData.phone.trim() });
      showToast('Account information updated successfully.');
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--lime)]" />
            Edit Account Information
          </h3>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          {error && (
            <div className="p-3 rounded-[3px] bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-[var(--critical)] text-xs font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="fd-label block mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="fd-input w-full text-xs font-mono"
              required
            />
          </div>

          <div>
            <label className="fd-label flex items-center gap-1 mb-1">
              <Phone className="w-3 h-3 text-[var(--lime)]" /> Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="fd-input w-full text-xs font-mono"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <p className="text-[10px] font-mono text-[var(--text-dim)]">
            Email and role cannot be changed here. Contact an administrator if needed.
          </p>

          <div className="pt-2.5 border-t border-[var(--border-dim)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── LogoutModal ──────────────────────────────────────────────────────────────
export const LogoutModal: React.FC = () => {
  const { activeModal, closeModal, logout, currentUser } = useApp();

  if (activeModal !== 'logout') return null;

  const handleConfirmLogout = () => {
    closeModal();
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[var(--bg-panel)] rounded-[3px] border border-[var(--critical-dim)] overflow-hidden shadow-2xl p-5 text-center">
        <div className="w-10 h-10 rounded-full bg-[var(--critical-bg)] text-[var(--critical)] border border-[var(--critical-dim)] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
          Confirm Sign Out
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5 font-mono leading-relaxed">
          Are you sure you want to sign out
          {currentUser?.name ? ` as ${currentUser.name}` : ''}?
        </p>
        <div className="mt-4 flex items-center justify-center gap-2.5">
          <button
            onClick={closeModal}
            className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLogout}
            className="fd-btn-danger px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider"
          >
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
