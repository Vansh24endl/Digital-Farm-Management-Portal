import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export const EmergencyCallModal: React.FC = () => {
  const { activeModal, activeCallContact, endEmergencyCall } = useApp();
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  useEffect(() => {
    let interval: any;
    if (activeModal === 'emergency-call') {
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeModal]);

  if (activeModal !== 'emergency-call' || !activeCallContact) return null;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[var(--bg-panel)] rounded-[3px] border border-[var(--critical-dim)] overflow-hidden shadow-2xl p-6 text-center relative">
        {/* Top Emergency Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-[var(--critical)] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" /> Emergency Vet Hotline Active
        </div>

        {/* Avatar & Pulse Ring */}
        <div className="relative w-20 h-20 mx-auto mb-3">
          <div className="absolute inset-0 rounded-full bg-[var(--critical-bg)] animate-ping opacity-75"></div>
          <div className="relative w-20 h-20 rounded-full bg-[var(--bg-raised)] border-2 border-[var(--critical)] flex items-center justify-center text-[var(--text-primary)] text-xl font-bold font-display shadow-xl">
            {activeCallContact.name.substring(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Contact Info */}
        <h3 className="text-lg font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">{activeCallContact.name}</h3>
        <p className="text-xs text-[var(--lime)] font-mono mt-0.5">{activeCallContact.role}</p>
        <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">{activeCallContact.phone}</p>

        {/* Call Duration Timer */}
        <div className="my-5">
          <span className="text-3xl font-mono font-bold text-[var(--text-primary)] tracking-widest">
            {formatTime(seconds)}
          </span>
          <p className="text-[10px] text-[var(--success)] font-mono font-bold uppercase tracking-wider mt-1">Encrypted Voice Link Established</p>
        </div>

        {/* Animated Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-7 mb-7">
          {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-[var(--critical)] rounded-[1px] animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 0.15}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Call Control Buttons */}
        <div className="flex items-center justify-around max-w-xs mx-auto">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-[3px] border transition-all ${
              isMuted
                ? 'bg-[var(--critical)] border-[var(--critical)] text-[#111311]'
                : 'bg-[var(--bg-raised)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endEmergencyCall}
            className="p-4 rounded-[3px] bg-[var(--critical)] hover:bg-[#e05a45] text-[#111311] shadow-2xl active:scale-95 transition-all border border-[var(--critical-dim)]"
            title="End Emergency Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-[3px] border transition-all ${
              isSpeakerOn
                ? 'bg-[var(--lime)] border-[var(--lime)] text-[#111311]'
                : 'bg-[var(--bg-raised)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
