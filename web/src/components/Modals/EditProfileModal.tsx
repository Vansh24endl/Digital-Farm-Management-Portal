import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Save, User, Mail, Phone, MapPin } from 'lucide-react';


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
      <div className="w-full max-w-lg bg-[#12131a] rounded-2xl border border-[#34343c] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#1b1b22] border-b border-[#34343c] flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#c0c1ff]" />
            Edit Specialist Profile
          </h3>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name & Credentials</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Designation</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#c0c1ff]" /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#c0c1ff]" /> Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#c0c1ff]" /> Assigned Headquarters / Region
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Executive Bio & Clinical Specialty</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-[#1b1b22] border border-[#34343c] rounded-xl text-slate-100 text-sm focus:border-[#c0c1ff] outline-none"
              required
            />
          </div>

          <div className="pt-3 border-t border-[#34343c] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-[#1b1b22]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            >
              <Save className="w-4 h-4" /> Save Profile
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
      <div className="w-full max-w-sm bg-[#12131a] rounded-2xl border border-[#ba1a1a]/60 overflow-hidden shadow-2xl p-5 text-center">
        <div className="w-12 h-12 rounded-full bg-[#ba1a1a]/20 text-[#ffb4ab] border border-[#ba1a1a] flex items-center justify-center mx-auto mb-3">
          <X className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold font-serif text-white">Confirm Session Termination</h3>
        <p className="text-xs text-slate-300 mt-2 font-sans">
          Are you sure you want to end your lead veterinarian session for Dr. Ananya Reyes? Unsaved biosecurity drafts will be stored locally.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#1b1b22] hover:bg-[#292931] border border-[#34343c] rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLogout}
            className="px-5 py-2 text-xs font-bold text-white bg-[#ba1a1a] hover:bg-[#93000a] rounded-xl shadow-lg"
          >
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
