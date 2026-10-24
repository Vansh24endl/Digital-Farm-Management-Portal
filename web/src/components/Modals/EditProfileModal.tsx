import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Save, User, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';

export const EditProfileModal: React.FC = () => {
  const { activeModal, closeModal, userProfile, updateUserProfile } = useApp();

  const [formData, setFormData] = useState({
    name: userProfile.name,
    title: userProfile.title,
    email: userProfile.email,
    phone: userProfile.phone,
    location: userProfile.location,
    bio: userProfile.bio,
  });

  if (activeModal !== 'edit-profile') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--lime)]" />
            Edit Specialist Profile
          </h3>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[80vh] overflow-y-auto font-sans">
          <div>
            <label className="fd-label block mb-1">Full Name & Official Designation</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="fd-input w-full text-xs font-mono"
              required
            />
          </div>

          <div>
            <label className="fd-label block mb-1">Professional Role / Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="fd-input w-full text-xs font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="fd-label block mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-[var(--lime)]" /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="fd-input w-full text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="fd-label block mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-[var(--lime)]" /> Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="fd-input w-full text-xs font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="fd-label block mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[var(--lime)]" /> Assigned Headquarters / Region
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="fd-input w-full text-xs font-mono"
              required
            />
          </div>

          <div>
            <label className="fd-label block mb-1">Executive Bio & Clinical Specialty</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="fd-input w-full text-xs font-sans resize-none"
              required
            />
          </div>

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
              className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const LogoutModal: React.FC = () => {
  const { activeModal, closeModal, showToast, navigateTo } = useApp();

  if (activeModal !== 'logout') return null;

  const handleConfirmLogout = () => {
    closeModal();
    showToast('Logged out of AgroShield Surveillance Session.');
    navigateTo('dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[var(--bg-panel)] rounded-[3px] border border-[var(--critical-dim)] overflow-hidden shadow-2xl p-5 text-center">
        <div className="w-10 h-10 rounded-full bg-[var(--critical-bg)] text-[var(--critical)] border border-[var(--critical-dim)] flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
          Confirm Session Termination
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5 font-mono leading-relaxed">
          Are you sure you want to end your lead veterinarian session for Dr. Ananya Reyes? Unsaved biosecurity drafts will be stored locally.
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
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
