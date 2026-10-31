import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { VeterinarianProfile } from '../types';
import {
  Stethoscope,
  Hash,
  GraduationCap,
  Briefcase,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Plus,
  ShieldCheck,
  AlertCircle,
  Users,
  User,
  ArrowRight,
} from 'lucide-react';
import { VetProfileModal } from '../components/Modals/VetProfileModal';

export const VetProfileScreen: React.FC = () => {
  const { currentUser, navigateTo, openModal } = useApp();

  const isVet = currentUser?.role === 'veterinarian';
  const isAdmin = currentUser?.role === 'admin';

  const [profile, setProfile] = useState<VeterinarianProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin pending verifications
  const [pendingVets, setPendingVets] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [newCertUrl, setNewCertUrl] = useState('');
  const [isAddingCert, setIsAddingCert] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!isVet) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.getVetProfile();
      setProfile(res.data);
    } catch (err: any) {
      if (err?.message?.includes('not found') || err?.message?.includes('404')) {
        setProfile(null);
      } else {
        setError(err?.message || 'Failed to retrieve professional profile.');
      }
    } finally {
      setLoading(false);
    }
  }, [isVet]);

  const loadPending = useCallback(async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    try {
      const res = await api.getPendingVets();
      setPendingVets(res.data || []);
    } catch {
      // Non-critical
    } finally {
      setAdminLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadProfile();
    loadPending();
  }, [loadProfile, loadPending]);

  const handleAdminVerify = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await api.verifyVet(id, { status });
      setPendingVets((prev) => prev.filter((v) => v._id !== id));
      if (profile && profile._id === id) {
        setProfile({ ...profile, verificationStatus: status });
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update verification status.');
    }
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCertUrl.trim() || !profile) return;
    try {
      const updatedCerts = [...(profile.certificates || []), newCertUrl.trim()];
      const res = await api.updateVetProfile({ certificates: updatedCerts });
      setProfile(res.data);
      setNewCertUrl('');
      setIsAddingCert(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to add certificate.');
    }
  };

  // Guard for unauthorized roles
  if (!isVet && !isAdmin) {
    return (
      <div className="p-8 text-center fd-card border border-[var(--border)] rounded-[3px] font-sans">
        <Stethoscope className="w-12 h-12 text-[var(--text-dim)] mx-auto mb-3" />
        <h3 className="text-base font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
          Veterinary Practice Portal
        </h3>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-2 max-w-md mx-auto">
          This portal is reserved for registered veterinary professionals. Your current account role is{' '}
          <span className="text-[var(--lime)] font-bold uppercase">{currentUser?.role || 'Guest'}</span>.
        </p>
        <button
          onClick={() => navigateTo('profile')}
          className="fd-btn mt-5 px-4 py-2 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2"
        >
          <User className="w-3.5 h-3.5" /> Go to My Account Profile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* Navigation Breadcrumb / Mode Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[3px] fd-raised border border-[var(--border-dim)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--lime-dim)] flex items-center justify-center text-[var(--lime)]">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
              Veterinary Professional Practice
            </h2>
            <p className="text-[10px] font-mono text-[var(--text-secondary)]">
              Official clinical credentials, licensing, and diagnostic authorization
            </p>
          </div>
        </div>
        <button
          onClick={() => navigateTo('profile')}
          className="fd-btn-ghost px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto"
        >
          <User className="w-3.5 h-3.5 text-[var(--lime)]" />
          Switch to User Account Profile
          <ArrowRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>

      {/* Admin Review Console (If Admin) */}
      {isAdmin && (
        <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--warning)]" />
              Veterinarian Verification Review Queue
            </h3>
            {pendingVets.length > 0 && (
              <span className="px-2 py-0.5 rounded-[2px] bg-[var(--warning)] text-[#111311] text-[10px] font-mono font-bold">
                {pendingVets.length} PENDING
              </span>
            )}
          </div>

          {adminLoading && (
            <div className="text-xs font-mono text-[var(--text-dim)] py-3 text-center">
              Loading pending verification requests...
            </div>
          )}

          {!adminLoading && pendingVets.length === 0 && (
            <div className="text-xs font-mono text-[var(--text-dim)] py-3 text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
              All veterinarian profiles have been reviewed. No pending verifications.
            </div>
          )}

          <div className="space-y-2.5">
            {pendingVets.map((vet) => (
              <div
                key={vet._id}
                className="fd-raised p-3.5 rounded-[3px] border border-[var(--border-dim)] flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold font-display uppercase text-[var(--text-primary)]">
                      {vet.fullName}
                    </p>
                    <span className="fd-badge text-[9px] font-mono uppercase bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-dim)]">
                      Pending Review
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                    Reg: <strong className="text-[var(--text-primary)]">{vet.registrationNumber}</strong> | Degree: {vet.qualification}
                    {vet.specialization ? ` | Specialty: ${vet.specialization}` : ''}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--text-dim)]">
                    Associated User: {vet.userId?.name} ({vet.userId?.email}) • Clinic: {vet.clinicName || 'Independent'}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleAdminVerify(vet._id, 'verified')}
                    className="fd-btn px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve License
                  </button>
                  <button
                    onClick={() => handleAdminVerify(vet._id, 'rejected')}
                    className="fd-btn-danger px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Veterinarian Profile Main View (If Vet) */}
      {isVet && (
        <>
          {loading && (
            <div className="fd-card p-8 text-center text-xs font-mono text-[var(--text-dim)]">
              Loading professional veterinary profile...
            </div>
          )}

          {error && (
            <div className="fd-card p-4 rounded-[3px] bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-[var(--critical)] text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !profile && !error && (
            <div className="fd-card p-8 rounded-[3px] border border-dashed border-[var(--border-dim)] text-center">
              <Stethoscope className="w-12 h-12 text-[var(--lime)] mx-auto mb-3" />
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
                Register Your Veterinary Practice
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-1.5 max-w-md mx-auto leading-relaxed">
                You are logged in as a Veterinarian, but your professional veterinary profile has not been created yet.
                Submit your registration number, credentials, and clinic information for official verification.
              </p>
              <button
                onClick={() => openModal('vet-profile')}
                className="fd-btn mt-5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Professional Profile
              </button>
            </div>
          )}

          {!loading && profile && (
            <>
              {/* Header Profile Hero Card */}
              <div className="fd-card rounded-[3px] p-5 relative overflow-hidden border border-[var(--border)]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        profile.profilePhoto ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                      }
                      alt={profile.fullName}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-[3px] object-cover border border-[var(--border)] shadow-md"
                    />
                    <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-[2px] bg-[var(--lime)] text-[#111311] text-[9px] font-mono font-bold uppercase tracking-wider shadow-sm">
                      VET-LICENSED
                    </span>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="fd-badge fd-badge-success text-xs font-mono inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> Licensed Veterinary Practitioner
                      </span>
                      {profile.verificationStatus === 'verified' && (
                        <span className="fd-badge fd-badge-success text-xs font-mono inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Admin
                        </span>
                      )}
                      {profile.verificationStatus === 'pending' && (
                        <span className="fd-badge text-xs font-mono inline-flex items-center gap-1.5 bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning-dim)]">
                          <Clock className="w-3.5 h-3.5" /> Verification Pending
                        </span>
                      )}
                      {profile.verificationStatus === 'rejected' && (
                        <span className="fd-badge fd-badge-critical text-xs font-mono inline-flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Verification Rejected
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-tight text-[var(--text-primary)]">
                      {profile.fullName}
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans max-w-2xl">
                      {profile.bio || 'Registered Veterinarian on FarmDrishti Biosecurity Network.'}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        onClick={() => openModal('vet-profile')}
                        className="fd-btn px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Professional Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Notice if Rejected */}
              {profile.verificationStatus === 'rejected' && profile.rejectionReason && (
                <div className="fd-card p-4 rounded-[3px] bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-[var(--critical)] text-xs font-mono flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block uppercase font-bold">Verification Notice</strong>
                    <span>Your veterinarian registration was rejected by the administration. Reason: {profile.rejectionReason}. Please edit your details and re-submit.</span>
                  </div>
                </div>
              )}

              {/* Credentials Grid */}
              <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[var(--lime)]" />
                  Official Veterinary Credentials & Registration
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[var(--lime)]" /> Registration Number
                    </span>
                    <p className="text-sm font-bold font-mono text-[var(--lime)] mt-1 truncate">
                      {profile.registrationNumber}
                    </p>
                  </div>

                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-[var(--lime)]" /> Qualification
                    </span>
                    <p className="text-xs font-semibold font-mono text-[var(--text-primary)] mt-1 truncate">
                      {profile.qualification}
                    </p>
                  </div>

                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[var(--lime)]" /> Specialization
                    </span>
                    <p className="text-xs font-semibold font-mono text-[var(--text-primary)] mt-1 truncate">
                      {profile.specialization || 'General Practice'}
                    </p>
                  </div>

                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[var(--lime)]" /> Experience
                    </span>
                    <p className="text-xs font-semibold font-mono text-[var(--text-primary)] mt-1 truncate">
                      {profile.yearsOfExperience ? `${profile.yearsOfExperience} Years` : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Clinic & Practice Information */}
              <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--lime)]" />
                  Clinic & Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Clinic / Hospital</span>
                      <p className="text-xs font-semibold font-mono text-[var(--text-primary)] truncate">
                        {profile.clinicName || 'Independent Practice'}
                      </p>
                    </div>
                  </div>

                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Service / Coverage Area</span>
                      <p className="text-xs font-semibold font-mono text-[var(--text-primary)] truncate">
                        {profile.serviceLocation || 'Indore Region, MP'}
                      </p>
                    </div>
                  </div>

                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Professional Contact</span>
                      <p className="text-xs font-semibold font-mono text-[var(--text-primary)] truncate">
                        {profile.contactNumber || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Professional Email</span>
                      <p className="text-xs font-semibold font-mono text-[var(--text-primary)] truncate">
                        {profile.email || '—'}
                      </p>
                    </div>
                  </div>

                  {profile.clinicAddress && (
                    <div className="sm:col-span-2 fd-raised p-3 rounded-[3px] border border-[var(--border-dim)] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center text-[var(--lime)] flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] block">Clinic Street Address</span>
                        <p className="text-xs font-semibold font-mono text-[var(--text-primary)]">
                          {profile.clinicAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Supporting Certificates & Documents */}
              <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--lime)]" />
                    Supporting Certificates & Documents ({profile.certificates?.length || 0})
                  </h3>
                  <button
                    onClick={() => setIsAddingCert(!isAddingCert)}
                    className="fd-btn-ghost px-2.5 py-1 text-xs font-mono uppercase tracking-wider flex items-center gap-1 text-[var(--lime)]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Document
                  </button>
                </div>

                {isAddingCert && (
                  <form onSubmit={handleAddCertificate} className="p-3 mb-3 rounded-[3px] fd-raised border border-[var(--border-dim)] space-y-2">
                    <label className="fd-label block text-[10px]">Document / Certificate Title or URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCertUrl}
                        onChange={(e) => setNewCertUrl(e.target.value)}
                        placeholder="e.g., Veterinary Council of India Board Certificate 2024"
                        className="fd-input flex-1 text-xs font-mono"
                        required
                      />
                      <button
                        type="submit"
                        className="fd-btn px-3 py-1.5 text-xs font-mono uppercase font-bold"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingCert(false)}
                        className="fd-btn-ghost px-2.5 py-1.5 text-xs font-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {(!profile.certificates || profile.certificates.length === 0) && (
                  <div className="text-xs font-mono text-[var(--text-dim)] py-3 text-center">
                    No supporting documents attached yet. Click "+ Add Document" to attach credentials.
                  </div>
                )}

                <div className="space-y-2">
                  {profile.certificates?.map((cert, idx) => (
                    <div
                      key={idx}
                      className="fd-raised p-2.5 rounded-[3px] border border-[var(--border-dim)] flex items-center justify-between text-xs font-mono text-[var(--text-primary)]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Award className="w-3.5 h-3.5 text-[var(--lime)] flex-shrink-0" />
                        <span className="truncate">{cert}</span>
                      </div>
                      <span className="fd-badge fd-badge-success text-[9px] uppercase">Attached</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Modal */}
          <VetProfileModal
            existingProfile={profile}
            onSaved={(updated) => setProfile(updated)}
          />
        </>
      )}
    </div>
  );
};
