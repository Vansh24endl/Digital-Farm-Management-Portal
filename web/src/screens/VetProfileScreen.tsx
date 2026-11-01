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
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  Edit,
  Plus,
  ShieldCheck,
  AlertCircle,
  Users,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const VetProfileScreen: React.FC = () => {
  const { currentUser, openModal } = useApp();

  const isVet = currentUser?.role === 'veterinarian';
  const isAdmin = currentUser?.role === 'admin';

  // Active Tab: 'directory' | 'my-practice' | 'admin-queue'
  const [activeTab, setActiveTab] = useState<'directory' | 'my-practice' | 'admin-queue'>(
    isVet ? 'my-practice' : 'directory'
  );

  // ─── Directory State ────────────────────────────────────────────────────────
  const [directoryVets, setDirectoryVets] = useState<any[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  // ─── Vet Own Profile State ──────────────────────────────────────────────────
  const [profile, setProfile] = useState<VeterinarianProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCertUrl, setNewCertUrl] = useState('');
  const [isAddingCert, setIsAddingCert] = useState(false);

  // ─── Admin Review Queue State ───────────────────────────────────────────────
  const [pendingVets, setPendingVets] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const getInitials = (name?: string) => {
    if (!name || !name.trim()) return 'DR';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Fetch verified directory
  const loadDirectory = useCallback(async () => {
    setDirectoryLoading(true);
    setDirectoryError('');
    try {
      const res = await api.getVetDirectory({
        search: searchQuery || undefined,
        specialization: specializationFilter !== 'all' ? specializationFilter : undefined,
        location: locationFilter || undefined,
      });
      if (res.success && Array.isArray(res.data)) {
        setDirectoryVets(res.data);
      } else {
        setDirectoryVets([]);
      }
    } catch (err: any) {
      setDirectoryError(err?.message || 'Failed to retrieve veterinarian directory.');
      setDirectoryVets([]);
    } finally {
      setDirectoryLoading(false);
    }
  }, [searchQuery, specializationFilter, locationFilter]);

  // Fetch vet's own profile
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

  // Fetch admin pending
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
    loadDirectory();
    if (isVet) loadProfile();
    if (isAdmin) loadPending();
  }, [loadDirectory, loadProfile, loadPending, isVet, isAdmin]);

  const handleAdminVerify = async (id: string, status: 'verified' | 'rejected') => {
    try {
      await api.verifyVet(id, { status });
      setPendingVets((prev) => prev.filter((v) => v._id !== id));
      if (profile && profile._id === id) {
        setProfile({ ...profile, verificationStatus: status });
      }
      loadDirectory();
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

  return (
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* ── Top Header & Tab Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[3px] fd-card border border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[2px] bg-[var(--bg-panel)] border border-[var(--lime)]/40 flex items-center justify-center text-[var(--lime)]">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
              Veterinary Surveillance & Practice
            </h1>
            <p className="text-xs font-mono text-[var(--text-secondary)]">
              Verified clinician directory, professional certifications, and licensing
            </p>
          </div>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-[2px] border transition-all ${
              activeTab === 'directory'
                ? 'bg-[var(--lime)] text-black border-[var(--lime)]'
                : 'border-[var(--border-dim)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-main)]'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1" />
            Verified Directory
          </button>

          {isVet && (
            <button
              onClick={() => setActiveTab('my-practice')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-[2px] border transition-all ${
                activeTab === 'my-practice'
                  ? 'bg-[var(--lime)] text-black border-[var(--lime)]'
                  : 'border-[var(--border-dim)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-main)]'
              }`}
            >
              <Award className="w-3.5 h-3.5 inline mr-1" />
              My Professional Credentials
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin-queue')}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-[2px] border transition-all relative ${
                activeTab === 'admin-queue'
                  ? 'bg-[var(--lime)] text-black border-[var(--lime)]'
                  : 'border-[var(--border-dim)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-main)]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              Pending Review Queue
              {pendingVets.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-bold rounded-full">
                  {pendingVets.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── TAB 1: VERIFIED VETERINARIAN DIRECTORY (Public / All Roles) ── */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="fd-card p-4 rounded-[3px] border border-[var(--border)] space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  type="text"
                  placeholder="Search by Doctor Name, Clinic, Qualification, or Service Area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="fd-input w-full pl-9 pr-3 py-2 text-xs font-mono rounded-[2px]"
                />
              </div>

              {/* Specialization Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[var(--lime)] shrink-0 hidden sm:block" />
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="fd-input py-2 px-3 text-xs font-mono rounded-[2px]"
                >
                  <option value="all">All Specializations</option>
                  <option value="Swine">Swine / Pig Health</option>
                  <option value="Poultry">Poultry / Avian Medicine</option>
                  <option value="Epidemiology">Epidemiology & Surveillance</option>
                  <option value="Pathology">Veterinary Pathology & PCR</option>
                  <option value="Livestock">Mixed Livestock & Biosecurity</option>
                </select>

                {/* Location Filter */}
                <input
                  type="text"
                  placeholder="Filter Location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="fd-input py-2 px-3 text-xs font-mono w-32 sm:w-40 rounded-[2px]"
                />

                <button
                  type="button"
                  onClick={() => void loadDirectory()}
                  className="fd-btn-ghost py-2 px-3 text-xs font-mono flex items-center gap-1"
                  title="Refresh Directory"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${directoryLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-dim)] pt-1 border-t border-[var(--border-dim)]">
              <span>Verified Directory of Certified Veterinary Practitioners</span>
              <span>Showing {directoryVets.length} verified specialist(s)</span>
            </div>
          </div>

          {/* Directory Loading / Error */}
          {directoryLoading && (
            <div className="fd-card p-12 text-center text-xs font-mono text-[var(--text-dim)] space-y-2">
              <div className="w-6 h-6 border-2 border-[var(--lime)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Searching verified veterinarian directory in MongoDB...</p>
            </div>
          )}

          {directoryError && !directoryLoading && (
            <div className="fd-card p-4 rounded-[3px] bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{directoryError}</span>
            </div>
          )}

          {/* Empty Directory State */}
          {!directoryLoading && !directoryError && directoryVets.length === 0 && (
            <div className="fd-card p-12 rounded-[3px] border border-dashed border-[var(--border-dim)] text-center space-y-3">
              <Stethoscope className="w-12 h-12 text-[var(--text-dim)] mx-auto opacity-60" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
                No Verified Veterinarians Found
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono max-w-md mx-auto leading-relaxed">
                {searchQuery || specializationFilter !== 'all' || locationFilter
                  ? 'No verified veterinarians matched your current search filters. Try clearing filters or using a broader query.'
                  : 'There are currently no verified veterinarians registered on the platform. Newly registered veterinarians will appear here once verified.'}
              </p>
              {(searchQuery || specializationFilter !== 'all' || locationFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSpecializationFilter('all');
                    setLocationFilter('');
                  }}
                  className="fd-btn-ghost px-3 py-1.5 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" /> Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Directory Grid */}
          {!directoryLoading && directoryVets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {directoryVets.map((vet) => {
                const photo = vet.profilePhoto || vet.userId?.profilePhoto || '';
                const email = vet.email || vet.userId?.email || '';
                const phone = vet.contactNumber || '';

                return (
                  <div
                    key={vet._id}
                    className="fd-card rounded-[3px] border border-[var(--border)] p-4 flex flex-col justify-between hover:border-[var(--lime)]/50 transition-colors space-y-3.5"
                  >
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        {photo ? (
                          <img
                            src={photo}
                            alt={vet.fullName}
                            className="w-14 h-14 rounded-[2px] object-cover border border-[var(--border)] shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-[2px] flex items-center justify-center font-bold font-display text-base border border-[var(--border)] shadow-sm"
                            style={{ background: 'rgba(163, 230, 53, 0.15)', color: 'var(--lime)' }}
                          >
                            {getInitials(vet.fullName)}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[var(--lime)] border-2 border-[var(--bg-panel)]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="fd-badge fd-badge-success text-[9px] font-mono uppercase inline-flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> Verified Clinician
                          </span>
                          {vet.yearsOfExperience > 0 && (
                            <span className="fd-badge text-[9px] font-mono uppercase bg-[var(--bg-raised)] text-[var(--text-secondary)] border border-[var(--border-dim)]">
                              {vet.yearsOfExperience}y Exp
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold font-display uppercase tracking-tight text-[var(--text-primary)] mt-1 truncate">
                          {vet.fullName}
                        </h3>

                        <p className="text-[11px] font-mono text-[var(--lime)] font-semibold truncate">
                          {vet.specialization || vet.qualification}
                        </p>
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="space-y-1.5 text-xs text-[var(--text-secondary)] font-sans pt-2 border-t border-[var(--border-dim)]">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <Hash className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                        <span className="text-[var(--text-dim)]">Reg #:</span>
                        <strong className="text-[var(--text-primary)] truncate">{vet.registrationNumber}</strong>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <GraduationCap className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                        <span className="text-[var(--text-dim)]">Degree:</span>
                        <span className="truncate">{vet.qualification}</span>
                      </div>

                      {(vet.clinicName || vet.clinicAddress) && (
                        <div className="flex items-start gap-2 text-[11px]">
                          <Building2 className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0 mt-0.5" />
                          <span className="truncate">
                            {vet.clinicName} {vet.clinicAddress ? `· ${vet.clinicAddress}` : ''}
                          </span>
                        </div>
                      )}

                      {vet.serviceLocation && (
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                          <span className="text-[var(--text-dim)]">Area:</span>
                          <span className="truncate">{vet.serviceLocation}</span>
                        </div>
                      )}

                      {vet.bio && (
                        <p className="text-[11px] text-[var(--text-dim)] line-clamp-2 pt-1 font-sans italic">
                          "{vet.bio}"
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Buttons: Call & Email */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-dim)]">
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="fd-btn py-2 px-2.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 text-center uppercase tracking-wider"
                          title={`Call ${vet.fullName} at ${phone}`}
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>Call Doctor</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="fd-btn-ghost py-2 px-2.5 text-xs font-mono opacity-50 cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>No Phone</span>
                        </button>
                      )}

                      {email ? (
                        <a
                          href={`mailto:${email}?subject=FarmDrishti%20Veterinary%20Consultation%20Request`}
                          className="fd-btn-ghost py-2 px-2.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 text-center uppercase tracking-wider"
                          title={`Email ${email}`}
                        >
                          <Mail className="w-3 h-3 shrink-0 text-[var(--lime)]" />
                          <span>Send Email</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="fd-btn-ghost py-2 px-2.5 text-xs font-mono opacity-50 cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>No Email</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY VETERINARY PRACTICE (Veterinarians Only) ── */}
      {activeTab === 'my-practice' && isVet && (
        <div className="space-y-5">
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
                    {profile.profilePhoto ? (
                      <img
                        src={profile.profilePhoto}
                        alt={profile.fullName}
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
                        {getInitials(profile.fullName)}
                      </div>
                    )}
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
                    <span>
                      Your veterinarian registration was rejected by the administration. Reason: {profile.rejectionReason}.
                      Please edit your details and re-submit.
                    </span>
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
                      <GraduationCap className="w-3 h-3 text-[var(--lime)]" /> Primary Qualification
                    </span>
                    <p className="text-sm font-bold font-display uppercase text-[var(--text-primary)] mt-1 truncate">
                      {profile.qualification}
                    </p>
                  </div>

                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-[var(--lime)]" /> Specialization
                    </span>
                    <p className="text-sm font-bold font-display uppercase text-[var(--text-primary)] mt-1 truncate">
                      {profile.specialization || 'General Practice'}
                    </p>
                  </div>

                  <div className="fd-raised p-3 rounded-[3px] border border-[var(--border-dim)]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--lime)]" /> Clinical Experience
                    </span>
                    <p className="text-sm font-bold font-mono text-[var(--text-primary)] mt-1">
                      {profile.yearsOfExperience} Years
                    </p>
                  </div>
                </div>
              </div>

              {/* Clinic & Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="fd-card p-4 rounded-[3px] border border-[var(--border)] space-y-3">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--lime)]" />
                    Clinic & Hospital Operations
                  </h3>
                  <div className="space-y-2 text-xs font-sans">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase block">Clinic Name</span>
                      <p className="font-semibold text-[var(--text-primary)]">{profile.clinicName || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase block">Facility Address</span>
                      <p className="text-[var(--text-secondary)]">{profile.clinicAddress || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase block">Service Coverage Region</span>
                      <p className="text-[var(--text-secondary)]">{profile.serviceLocation || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="fd-card p-4 rounded-[3px] border border-[var(--border)] space-y-3">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[var(--lime)]" />
                    Public Emergency & Consultation Contacts
                  </h3>
                  <div className="space-y-2 text-xs font-sans">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase block">Direct Hotline</span>
                      <p className="font-mono text-[var(--text-primary)]">{profile.contactNumber || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase block">Public Email</span>
                      <p className="font-mono text-[var(--text-primary)]">{profile.email || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificates */}
              <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[var(--lime)]" />
                    Accreditations & Certificates ({profile.certificates?.length || 0})
                  </h3>
                  <button
                    onClick={() => setIsAddingCert(!isAddingCert)}
                    className="fd-btn-ghost px-2.5 py-1 text-xs font-mono uppercase tracking-wider flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certificate Link
                  </button>
                </div>

                {isAddingCert && (
                  <form onSubmit={handleAddCertificate} className="mb-4 p-3 rounded-[3px] fd-raised border border-[var(--border-dim)] flex gap-2">
                    <input
                      type="url"
                      placeholder="https://accreditation-board.org/cert-1234.pdf"
                      value={newCertUrl}
                      onChange={(e) => setNewCertUrl(e.target.value)}
                      required
                      className="fd-input text-xs font-mono flex-1 py-1.5"
                    />
                    <button type="submit" className="fd-btn px-3 py-1.5 text-xs font-mono uppercase font-bold">
                      Save
                    </button>
                  </form>
                )}

                {profile.certificates && profile.certificates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.certificates.map((cert, idx) => (
                      <a
                        key={idx}
                        href={cert}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-[2px] fd-raised border border-[var(--border-dim)] hover:border-[var(--lime)] transition-colors flex items-center justify-between text-xs font-mono text-[var(--text-primary)] group"
                      >
                        <span className="truncate flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--lime)] flex-shrink-0" />
                          <span className="truncate">{cert}</span>
                        </span>
                        <ExternalLink className="w-3 h-3 text-[var(--text-dim)] group-hover:text-[var(--lime)] flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-[var(--text-dim)]">No certificates uploaded yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB 3: ADMIN REVIEW QUEUE (Admins Only) ── */}
      {activeTab === 'admin-queue' && isAdmin && (
        <div className="fd-card p-4 sm:p-5 rounded-[3px] border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
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
            <div className="text-xs font-mono text-[var(--text-dim)] py-6 text-center">
              Loading pending verification requests...
            </div>
          )}

          {!adminLoading && pendingVets.length === 0 && (
            <div className="text-xs font-mono text-[var(--text-dim)] py-8 text-center flex flex-col items-center justify-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-[var(--success)] opacity-70" />
              <span>All veterinarian profiles have been reviewed. No pending verifications.</span>
            </div>
          )}

          <div className="space-y-3">
            {pendingVets.map((vet) => (
              <div
                key={vet._id}
                className="fd-raised p-4 rounded-[3px] border border-[var(--border-dim)] flex flex-col md:flex-row md:items-center justify-between gap-3"
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
    </div>
  );
};

export default VetProfileScreen;
