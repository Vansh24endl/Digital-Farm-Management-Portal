import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Dna,
  Droplets,
  Thermometer,
  Wind,
  Gauge,
  Activity,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';


export const FarmHealthScreen: React.FC = () => {
  const { farmUnits, selectedFarmId, setSelectedFarmId, openModal } = useApp();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  const activeFarm = farmUnits.find((f) => f.id === selectedFarmId) || farmUnits[0];

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Top Farm Selector Dropdown & Range Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Farm Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-[#1b1b22] border border-[#34343c] text-slate-100 font-bold font-serif text-sm focus:border-[#c0c1ff] outline-none cursor-pointer shadow-md"
          >
            {farmUnits.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name} ({farm.status})
              </option>
            ))}
          </select>
        </div>

        {/* 24h / 7d / 30d Range Toggles */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1f1f26] border border-[#34343c] self-start sm:self-auto">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === range
                  ? 'bg-[#1a178c] text-[#c0c1ff] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range} Range
            </button>
          ))}
        </div>
      </div>

      {/* 2. Overall Farm Health Score Card (Glowing Circular Gauge 92 / Optimal) */}
      <div className="surface-card rounded-2xl p-6 border border-[#34343c] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Glowing Circular Gauge */}
          <div className="flex flex-col items-center text-center flex-shrink-0">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#292931" strokeWidth="10" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#4CAF50"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - 0.92)}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 glow-green"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-5xl text-white tracking-tight">92</span>
                <span className="text-xs font-bold text-[#4CAF50] uppercase tracking-wider mt-0.5">
                  Optimal Index
                </span>
              </div>
            </div>
            <span className="mt-2 text-xs text-slate-400 font-sans">
              Evaluated across {timeRange} Sensor Stream
            </span>
          </div>

          {/* Health Stats Overview */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#316342]/40 text-[#4CAF50] text-xs font-bold border border-[#4CAF50]/40">
              <ShieldCheck className="w-4 h-4" /> Overall Farm Health: Excellent (92/100)
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">
              {activeFarm.name} Telemetry Summary
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              "Biological baseline is stable. PCR batch diagnostic test was negative for major swine & avian viral strains. Water consumption and ambient thermal values are within optimal ranges."
            </p>
          </div>
        </div>
      </div>

      {/* 3. Diagnostic PCR Card */}
      <div
        onClick={() => openModal('pcr-certificate')}
        className="surface-card p-5 rounded-2xl border border-[#c0c1ff]/50 hover:border-[#c0c1ff] cursor-pointer transition-all active:scale-98 shadow-xl group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#1a178c]/40 text-[#c0c1ff] border border-[#c0c1ff]/30 group-hover:scale-110 transition-transform">
              <Dna className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#c0c1ff] tracking-wider">
                Laboratory PCR Molecular Screening
              </span>
              <h3 className="text-base font-bold text-white font-serif mt-0.5">
                No significant pathogens detected in latest batch
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Swab Specimen Batch #9411 · Updated 2 hours ago
              </p>
            </div>
          </div>

          <button className="px-4 py-2 text-xs font-bold bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-md">
            Open PCR Certificate <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Telemetry Charts (Water Intake & Avg Temp SVG Sparklines) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Water Intake Chart Card */}
        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-[#c0c1ff]" />
              <h4 className="text-sm font-bold text-white font-serif">Water Consumption Intake</h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#316342]/40 text-[#4CAF50] text-xs font-bold border border-[#4CAF50]/40">
              Stable
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-white">4.2</span>
            <span className="text-sm font-semibold text-slate-400">Liters / Head / Day</span>
          </div>

          {/* SVG Sparkline */}
          <div className="h-24 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
              <path
                d="M 0,60 Q 50,45 100,50 T 200,30 T 300,35"
                fill="none"
                stroke="#c0c1ff"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 0,60 Q 50,45 100,50 T 200,30 T 300,35 L 300,80 L 0,80 Z"
                fill="url(#waterGradient)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c0c1ff" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Avg Temperature Chart Card */}
        <div className="surface-card p-5 rounded-2xl border border-[#34343c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-[#ffba3f]" />
              <h4 className="text-sm font-bold text-white font-serif">Ambient Barn Temperature</h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1a178c]/50 text-[#c0c1ff] text-xs font-bold border border-[#c0c1ff]/30">
              Target Zone
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-4xl text-white">22.1</span>
            <span className="text-sm font-semibold text-slate-400">°Celsius</span>
          </div>

          {/* SVG Sparkline */}
          <div className="h-24 w-full pt-2">
            <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
              <path
                d="M 0,40 Q 60,35 120,45 T 240,25 T 300,30"
                fill="none"
                stroke="#ffba3f"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 0,40 Q 60,35 120,45 T 240,25 T 300,30 L 300,80 L 0,80 Z"
                fill="url(#tempGradient)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffba3f" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* 5. Micro-Environment Telemetry Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-sans">
          Micro-Environment Sensor Telemetry
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="surface-card p-4 rounded-xl border border-[#34343c]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-sans">Ammonia NH3</span>
              <Gauge className="w-4 h-4 text-[#c0c1ff]" />
            </div>
            <p className="font-display text-2xl text-white">12 <span className="text-xs text-slate-400">ppm</span></p>
            <span className="text-[10px] text-[#4CAF50] font-semibold">Below 25ppm Limit</span>
          </div>

          <div className="surface-card p-4 rounded-xl border border-[#34343c]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-sans">Air Velocity</span>
              <Wind className="w-4 h-4 text-[#c0c1ff]" />
            </div>
            <p className="font-display text-2xl text-white">1.4 <span className="text-xs text-slate-400">m/s</span></p>
            <span className="text-[10px] text-[#4CAF50] font-semibold">Continuous Airflow</span>
          </div>

          <div className="surface-card p-4 rounded-xl border border-[#34343c]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-sans">Relative Humidity</span>
              <Droplets className="w-4 h-4 text-[#c0c1ff]" />
            </div>
            <p className="font-display text-2xl text-white">58 <span className="text-xs text-slate-400">%</span></p>
            <span className="text-[10px] text-[#4CAF50] font-semibold">Comfort Band</span>
          </div>

          <div className="surface-card p-4 rounded-xl border border-[#34343c]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-sans">Flock Mortality</span>
              <Activity className="w-4 h-4 text-[#4CAF50]" />
            </div>
            <p className="font-display text-2xl text-[#4CAF50]">0.02 <span className="text-xs text-slate-400">%</span></p>
            <span className="text-[10px] text-[#4CAF50] font-semibold">Ultra Low (Optimal)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
