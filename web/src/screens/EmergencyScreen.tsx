import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { EmergencyContact } from '../types';
import {
  PhoneCall,
  Search,
  ShieldAlert,
  Stethoscope,
  Building,
  Truck,
  Phone,
  Clock,
} from 'lucide-react';


const emergencyDirectory: EmergencyContact[] = [
  {
    id: 'em-1',
    name: 'Dr. Ananya Singh',
    role: 'Associate Field Veterinarian & Serologist',
    phone: '+91 98765 43210',
    category: 'Veterinary Services',
    available: '24/7 On-Call (Priority 1)',
  },
  {
    id: 'em-2',
    name: 'Regional Animal Health Diagnostic Clinic',
    role: '24/7 Outbreak & Lab Diagnostics Command',
    phone: '+91 91234 56789',
    category: 'Veterinary Services',
    available: '24/7 Hotline',
  },
  {
    id: 'em-3',
    name: 'State Animal Husbandry & Quarantine Dept',
    role: 'Government Epidemiological Authority',
    phone: '+91 94212 34567',
    category: 'Authorities',
    available: '08:00 AM - 08:00 PM',
  },
  {
    id: 'em-4',
    name: 'Local Police & Bio-Perimeter Protection',
    role: 'Perimeter Barrier & Traffic Lockdown',
    phone: '+91 100',
    category: 'Authorities',
    available: 'Emergency Dispatch',
  },
  {
    id: 'em-5',
    name: 'Raj Feeds & Grain Supplier Logistics',
    role: 'Biosecure Feed Transit & Emergency Grain',
    phone: '+91 98765 55443',
    category: 'Suppliers',
    available: '06:00 AM - 06:00 PM',
  },
  {
    id: 'em-6',
    name: 'CleanBio Virucide & Disinfectant Depot',
    role: 'Chemical Emergency Stock Replenishment',
    phone: '+91 98765 88990',
    category: 'Suppliers',
    available: '24/7 Dispatch',
  },
];

const categoryIcon = (cat: string) => {
  if (cat === 'Veterinary Services') return <Stethoscope className="w-4 h-4" style={{ color: 'var(--lime)' }} />;
  if (cat === 'Authorities') return <Building className="w-4 h-4" style={{ color: 'var(--warning)' }} />;
  return <Truck className="w-4 h-4" style={{ color: 'var(--success)' }} />;
};

export const EmergencyScreen: React.FC = () => {
  const { startEmergencyCall } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Veterinary Services', 'Authorities', 'Suppliers'];

  const filteredContacts = emergencyDirectory.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeCategory === 'All') return matchesSearch;
    return matchesSearch && contact.category === activeCategory;
  });

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">

      {/* ── Page Header ── */}
      <div>
        <p className="fd-label mb-1">FarmDrishti / Emergency</p>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          Emergency Contacts
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
          24/7 vet response & authorities
        </p>
      </div>

      {/* ── Emergency Alert Banner ── */}
      <div
        className="fd-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-urgent"
        style={{ borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 flex-shrink-0"
            style={{ background: 'var(--critical)', borderRadius: '2px' }}
          >
            <ShieldAlert className="w-5 h-5" style={{ color: '#111311' }} />
          </div>
          <div>
            <span className="fd-badge fd-badge-critical block mb-1">HOTLINE SYSTEM READY</span>
            <h3
              className="text-sm font-bold"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
            >
              24/7 Bio-Hazard & Disease Containment Helpline
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Instant voice encryption for Dr. Reyes and field veterinary commanders.
            </p>
          </div>
        </div>

        <button
          id="dial-lead-vet-btn"
          onClick={() => startEmergencyCall(emergencyDirectory[0])}
          className="fd-btn flex items-center gap-2 flex-shrink-0 self-start sm:self-auto"
          style={{ background: 'var(--critical)', borderColor: 'var(--critical)', color: '#111311' }}
        >
          <PhoneCall className="w-4 h-4" /> Dial Lead Vet Now
        </button>
      </div>

      {/* ── Search + Category Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
          <input
            id="emergency-search"
            type="text"
            placeholder="Search contact or service…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="fd-input pl-9"
            style={{ borderColor: 'var(--border)' }}
          />
        </div>

        <div className="flex items-center gap-1 p-1 overflow-x-auto" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '3px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap"
              style={{
                borderRadius: '2px',
                background: activeCategory === cat ? 'var(--critical-bg)' : 'transparent',
                color: activeCategory === cat ? 'var(--critical)' : 'var(--text-secondary)',
                border: activeCategory === cat ? '1px solid var(--critical-dim)' : '1px solid transparent',
                fontFamily: 'IBM Plex Mono, monospace',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contact Cards ── */}
      <div className="space-y-2">
        <h2 className="fd-label">Directory ({filteredContacts.length})</h2>

        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="fd-card-hover p-4 sm:p-5 group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className="p-2.5 flex-shrink-0"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '2px' }}
                >
                  {categoryIcon(contact.category)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="fd-label">{contact.category}</span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
                      <Clock className="w-3 h-3" /> {contact.available}
                    </span>
                  </div>
                  <h3
                    className="text-sm font-bold"
                    style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
                  >
                    {contact.name}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{contact.role}</p>
                  <p className="text-xs font-bold pt-1" style={{ color: 'var(--lime)', fontFamily: 'IBM Plex Mono, monospace' }}>
                    {contact.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => startEmergencyCall(contact)}
                className="fd-btn self-end sm:self-center flex items-center gap-2 flex-shrink-0"
                style={{ background: 'var(--critical)', borderColor: 'var(--critical)', color: '#111311' }}
              >
                <Phone className="w-4 h-4 fill-current" /> Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
