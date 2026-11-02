import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  X,
  Save,
  Stethoscope,
  Hash,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  Building2,
  MapPin,
  FileText,
  Loader2,
} from 'lucide-react';

interface VetProfileData {
  fullName: string;
  registrationNumber: string;
  qualification: string;
  specialization: string;
  yearsOfExperience: number | '';
  contactNumber: string;
  email: string;
  clinicName: string;
  clinicAddress: string;
  serviceLocation: string;
  bio: string;
}

interface Props {
  existingProfile: any | null;
  onSaved: (profile: any) => void;
}

export const VetProfileModal: React.FC<Props> = ({ existingProfile, onSaved }) => {
  const { activeModal, closeModal, showToast, currentUser } = useApp();

  const [form, setForm] = useState<VetProfileData>({
    fullName: '',
    registrationNumber: '',
    qualification: '',
    specialization: '',
    yearsOfExperience: '',
    contactNumber: '',
    email: '',
    clinicName: '',
    clinicAddress: '',
    serviceLocation: '',
    bio: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingProfile) {
      setForm({
        fullName: existingProfile.fullName || '',
        registrationNumber: existingProfile.registrationNumber || '',
        qualification: existingProfile.qualification || '',
        specialization: existingProfile.specialization || '',
        yearsOfExperience: existingProfile.yearsOfExperience ?? '',
        contactNumber: existingProfile.contactNumber || '',
        email: existingProfile.email || currentUser?.email || '',
        clinicName: existingProfile.clinicName || '',
        clinicAddress: existingProfile.clinicAddress || '',
        serviceLocation: existingProfile.serviceLocation || '',
        bio: existingProfile.bio || '',
      });
    } else {
      setForm(prev => ({ ...prev, fullName: currentUser?.name || '', email: currentUser?.email || '' }));
    }
  }, [existingProfile, currentUser]);

  if (activeModal !== 'vet-profile') return null;

  const set = (key: keyof VetProfileData, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) { setError('Full name is required.'); return; }
    if (!form.registrationNumber.trim()) { setError('Registration number is required.'); return; }
    if (!form.qualification.trim()) { setError('Qualification is required.'); return; }

    const payload = {
      ...form,
      yearsOfExperience: form.yearsOfExperience === '' ? 0 : Number(form.yearsOfExperience),
    };

    setIsSubmitting(true);
    try {
      let result: any;
      if (existingProfile) {
        result = await api.updateVetProfile(payload);
        showToast('Professional profile updated successfully.');
      } else {
        result = await api.createVetProfile(payload as any);
        showToast('Professional profile created! Awaiting admin verification.');
      }
      onSaved(result.data);
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[var(--lime)]" />
            {existingProfile ? 'Update' : 'Create'} Veterinarian Professional Profile
          </h3>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto font-sans flex-1">
          {error && (
            <div className="p-3 rounded-[3px] bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-[var(--critical)] text-xs font-mono">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="fd-label flex items-center gap-1 mb-1">
                <Stethoscope className="w-3 h-3 text-[var(--lime)]" /> Full Professional Name *
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                className="fd-input w-full text-xs font-mono"
                placeholder="e.g., Dr. Ananya Reyes"
                required
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className="fd-label flex items-center gap-1 mb-1">
                <Hash className="w-3 h-3 text-[var(--lime)]" /> Vet Registration Number *
              </label>
              <input
                type="text"
                value={form.registrationNumber}
                onChange={e => set('registrationNumber', e.target.value)}
                className="fd-input w-full text-xs font-mono"
                placeholder="e.g., VCI/MP/2019/01234"
                required
              />
            </div>

            {/* Qualification */}
            <div>
              <label className="fd-label flex items-center gap-1 mb-1">
                <GraduationCap className="w-3 h-3 text-[var(--lime)]" /> Qualification / Degree *
              </label>
              <input
                type="text"
                value={form.qualification}
                onChange={e => set('qualification', e.target.value)}
                className="fd-input w-full text-xs font-mono"
                placeholder="e.g., BVSc, MVSc Pathology"
                required
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="fd-label flex items-center gap-1 mb-1">
                <Briefcase className="w-3 h-3 text-[var(--lime)]" /> Specialization
              </label>
              <input
                type="text"
                value={form.specialization}
                onChange={e => set('specialization', e.target.value)}
                className="fd-input w-full text-xs font-mono"
                placeholder="e.g., Poultry Disease & Biosecurity"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="fd-label flex items-center gap-1 mb-1">
                <Briefcase className="w-3 h-3 text-[var(--lime)]" /> Years of Experience
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={form.yearsOfExperience}
                onChange={e => set('yearsOfExperience', e.target.value ? Number(e.target.value) : '')}
                className="fd-input w-full text-xs font-mono"
                placeholder="e.g., 8"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="fd-label flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3 text-[var(--lime)]" /> Professional Contact
              </label>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.contactNumber}
                onChange={e => set('contactNumber', e.target.value)}
                className="fd-input w-full text-xs font-mono"
                placeholder="+91 98765 00000"
              />
            </div>

            {/* Email */}
            <div>
              <label className="fd-label flex items-center gap-1 mb-1">
                <Mail className="w-3 h-3 text-[var(--lime)]" /> Professional Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="fd-input w-full text-xs font-mono"
                placeholder="vet@example.com"
              />
            </div>

            {/* Clinic Name */}
            <div>
              <label className="fd-label flex items-center gap-1 mb-1">
                <Building2 className="w-3 h-3 text-[var(--lime)]" /> Clinic / Hospital Name
              </label>
              <input
                type="text"
                value={form.clinicName}
                onChange={e => set('clinicName', e.target.value)}
                className="fd-input w-full text-xs font-mono"
                placeholder="e.g., Green Valley Animal Hospital"
              />
            </div>

            {/* Clinic Address */}
            <div>
              <label className="fd-label flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-[var(--lime)]" /> Clinic Address
              </label>
              <input
                type="text"
                value={form.clinicAddress}
                onChange={e => set('clinicAddress', e.target.value)}
                className="fd-input w-full text-xs font-mono"
                placeholder="Street, City, State"
              />
            </div>

            {/* Service Location */}
            <div className="sm:col-span-2">
              <label className="fd-label flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-[var(--lime)]" /> Service / Coverage Area
              </label>
              <input
                type="text"
                value={form.serviceLocation}
                onChange={e => set('serviceLocation', e.target.value)}
                className="fd-input w-full text-xs font-mono"
                placeholder="e.g., Indore & Surrounding Districts, MP"
              />
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label className="fd-label flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3 text-[var(--lime)]" /> Professional Bio
              </label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                className="fd-input w-full text-xs font-sans resize-none"
                placeholder="Brief professional background, expertise, and approach..."
              />
            </div>
          </div>

          <p className="text-[10px] font-mono text-[var(--text-dim)] pt-1">
            * Required fields. Your profile will be submitted for admin verification after creation.
          </p>

          <div className="pt-2.5 border-t border-[var(--border-dim)] flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider w-full sm:w-auto justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {isSubmitting ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

