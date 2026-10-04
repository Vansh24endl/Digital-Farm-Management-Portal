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
      <div className="w-full max-w-md bg-[#0f1017] rounded-2xl border border-[#33374a] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#181922] border-b border-[#33374a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#c0c1ff]" />
            <h3 className="text-base font-bold font-sans text-white">Change Profile Picture (DP)</h3>
          </div>
          <button onClick={closeModal} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 font-sans">
          {/* Active Preview */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#181922] border border-[#33374a]">
            <img
              src={customUrl.trim() ? customUrl : selectedUrl}
              alt="DP Preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-[#4f46e5] shadow-md"
              onError={(e) => {
                // Fallback on image load error
                (e.target as HTMLImageElement).src = avatarPresets[0].url;
              }}
            />
            <div>
              <p className="text-xs font-bold text-white">Active Avatar Preview</p>
              <p className="text-[11px] text-slate-400">{userProfile.name}</p>
            </div>
          </div>

          {/* Avatar Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Specialist Avatar Preset:
            </label>
            <div className="grid grid-cols-4 gap-2.5">
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
                    className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                      isSelected ? 'border-[#4f46e5] scale-105 shadow-lg' : 'border-[#33374a] hover:border-slate-400'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-14 object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#4f46e5]/40 flex items-center justify-center text-white">
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
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Link className="w-3.5 h-3.5 text-[#c0c1ff]" /> Or Paste Custom Image URL:
            </label>
            <input
              type="text"
              placeholder="https://example.com/my-photo.jpg"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#181922] border border-[#33374a] rounded-xl text-slate-100 text-xs focus:border-[#4f46e5] outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#33374a] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Image className="w-4 h-4" /> Save Profile Picture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
