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
      <div className="w-full max-w-sm bg-[#12131a] rounded-3xl border border-[#ba1a1a]/80 overflow-hidden shadow-2xl p-6 text-center relative">
        {/* Top Emergency Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ba1a1a]/30 border border-[#ba1a1a] text-[#ffb4ab] text-[11px] font-bold uppercase tracking-wider mb-6 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" /> Emergency Vet Hotline Active
        </div>

        {/* Avatar & Pulse Ring */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-[#ba1a1a]/30 animate-ping"></div>
          <div className="relative w-24 h-24 rounded-full bg-[#1b1b22] border-2 border-[#ba1a1a] flex items-center justify-center text-white text-2xl font-bold font-serif shadow-xl">
            {activeCallContact.name.substring(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Contact Info */}
        <h3 className="text-xl font-bold font-serif text-white">{activeCallContact.name}</h3>
        <p className="text-xs text-[#c0c1ff] font-sans mt-0.5">{activeCallContact.role}</p>
        <p className="text-xs text-slate-400 font-mono mt-1">{activeCallContact.phone}</p>

        {/* Call Duration Timer */}
        <div className="my-6">
          <span className="text-3xl font-display text-white tracking-widest">
            {formatTime(seconds)}
          </span>
          <p className="text-[10px] text-[#4CAF50] font-bold uppercase mt-1">Encrypted Voice Connection Established</p>
        </div>

        {/* Animated Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1 h-8 mb-8">
          {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-[#ba1a1a] rounded-full animate-pulse"
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
            className={`p-4 rounded-full border transition-all ${
              isMuted
                ? 'bg-[#ba1a1a] border-[#ba1a1a] text-white'
                : 'bg-[#1b1b22] border-[#34343c] text-slate-300 hover:text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endEmergencyCall}
            className="p-5 rounded-full bg-[#ba1a1a] hover:bg-[#93000a] text-white shadow-2xl active:scale-90 transition-all border-2 border-[#ffb4ab]"
            title="End Emergency Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full border transition-all ${
              isSpeakerOn
                ? 'bg-[#1a178c] border-[#c0c1ff] text-[#c0c1ff]'
                : 'bg-[#1b1b22] border-[#34343c] text-slate-300 hover:text-white'
            }`}
            title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
