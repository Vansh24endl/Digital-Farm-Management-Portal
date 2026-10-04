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
    name: 'Local Police & Bio-Perimeter Protection Station',
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
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Red Emergency Alert Banner */}
      <div className="p-5 rounded-2xl bg-[#ba1a1a]/25 border-2 border-[#ba1a1a] text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#ba1a1a] text-white animate-bounce flex-shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#ba1a1a] text-white">
              HOTLINE SYSTEM READY
            </span>
            <h3 className="text-lg font-bold font-serif text-white mt-1">
              24/7 Bio-Hazard & Disease Containment Helpline
            </h3>
            <p className="text-xs text-slate-300">
              Instant voice encryption for Dr. Reyes and field veterinary commanders.
            </p>
          </div>
        </div>

        <button
          onClick={() => startEmergencyCall(emergencyDirectory[0])}
          className="px-5 py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xl active:scale-95 flex-shrink-0"
        >
          <PhoneCall className="w-4 h-4" /> Dial Lead Vet Now
        </button>
      </div>

      {/* 2. Title & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#ffb4ab]" />
            Emergency Contacts Directory
          </h2>
          <p className="text-xs text-slate-400">
            Rapid hotline response for veterinarians, state authorities, and suppliers
          </p>
        </div>

        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contact or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b1b22] border border-[#34343c] text-slate-100 text-xs focus:border-[#ba1a1a] outline-none"
          />
        </div>
      </div>

      {/* 3. Category Filter Chips */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1f1f26] border border-[#34343c] overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-[#ba1a1a] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. Categorized Directory Cards */}
      <div className="space-y-3">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="surface-card p-4 sm:p-5 rounded-2xl border border-[#34343c] hover:border-[#ba1a1a]/60 transition-all group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-[#1a178c]/40 text-[#c0c1ff] border border-[#c0c1ff]/30 flex-shrink-0">
                  {contact.category === 'Veterinary Services' ? (
                    <Stethoscope className="w-5 h-5 text-[#c0c1ff]" />
                  ) : contact.category === 'Authorities' ? (
                    <Building className="w-5 h-5 text-[#ffba3f]" />
                  ) : (
                    <Truck className="w-5 h-5 text-[#4CAF50]" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-[#c0c1ff]">
                      {contact.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {contact.available}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-serif group-hover:text-[#ffb4ab] transition-colors">
                    {contact.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">{contact.role}</p>
                  <p className="text-xs font-mono font-bold text-[#c0c1ff] pt-1">{contact.phone}</p>
                </div>
              </div>

              {/* Dial Button Triggering Live Call Dialer Modal */}
              <button
                onClick={() => startEmergencyCall(contact)}
                className="px-4 py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 self-end sm:self-center flex-shrink-0"
              >
                <Phone className="w-4 h-4 fill-current" /> Simulated Call
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
