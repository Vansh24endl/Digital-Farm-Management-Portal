import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Camera, Image, Check, Link } from 'lucide-react';

const avatarPresets = [
  {
    name: 'Clinical Specialist',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Field Epidemiologist',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Surveillance Commander',
    url: 'https://images.unsplash.com/photo-1594824813572-c2e0b57117e1?auto=format&fit=crop&q=80&w=400',
  },
  {
    name: 'Biosecurity Director',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
  },
];

export const ChangeDPModal: React.FC = () => {
  const { activeModal, closeModal, userProfile, updateAvatar } = useApp();
  const [selectedUrl, setSelectedUrl] = useState(userProfile.avatar);
  const [customUrl, setCustomUrl] = useState('');

  if (activeModal !== 'change-dp') return null;

  const handleApply = () => {
    const finalUrl = customUrl.trim() ? customUrl.trim() : selectedUrl;
    updateAvatar(finalUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--bg-panel)] rounded-[3px] border border-[var(--border)] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3.5 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[var(--lime)]" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">Change Profile Picture (DP)</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 font-sans">
          {/* Active Preview */}
          <div className="flex items-center gap-3.5 p-3 rounded-[3px] bg-[var(--bg-raised)] border border-[var(--border-dim)]">
            <img
              src={customUrl.trim() ? customUrl : selectedUrl}
              alt="DP Preview"
              className="w-14 h-14 rounded-[2px] object-cover border border-[var(--border)] shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = avatarPresets[0].url;
              }}
            />
            <div>
              <p className="text-xs font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">Active Avatar Preview</p>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">{userProfile.name}</p>
            </div>
          </div>

          {/* Avatar Presets */}
          <div>
            <label className="fd-label block mb-2">
              Select Specialist Preset:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {avatarPresets.map((preset, idx) => {
                const isSelected = selectedUrl === preset.url && !customUrl.trim();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedUrl(preset.url);
                      setCustomUrl('');
                    }}
                    className={`relative rounded-[2px] overflow-hidden border transition-all group ${
                      isSelected ? 'border-[var(--lime)] scale-105 shadow-md' : 'border-[var(--border-dim)] hover:border-[var(--border)]'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-12 object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[var(--lime)]/30 flex items-center justify-center text-[#111311]">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom URL Input */}
          <div>
            <label className="fd-label block mb-1 flex items-center gap-1">
              <Link className="w-3 h-3 text-[var(--lime)]" /> Or Paste Custom Image URL:
            </label>
            <input
              type="text"
              placeholder="https://example.com/specialist-dp.jpg"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="fd-input w-full text-xs font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-2.5 border-t border-[var(--border-dim)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="fd-btn px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Image className="w-3.5 h-3.5" /> Save Profile Picture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
