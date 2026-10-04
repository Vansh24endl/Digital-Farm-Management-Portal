import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CloudSun,
  Droplets,
  Wind,
  Gauge,
  Sun,
  CloudRain,
  MapPin,
  Flame,
} from 'lucide-react';


export const WeatherScreen: React.FC = () => {
  const {
    temperatureUnit,
    toggleTemperatureUnit,
    selectedWeatherLocation,
    setSelectedWeatherLocation,
  } = useApp();

  const locations = [
    'Green Valley - Sector 1 (Swine)',
    'Sunrise Poultry - Zone 2 (Avian)',
    'Oak Ridge Site A (Breeder Nucleus)',
    'Pine Valley North (Hatchery)',
  ];

  const currentTemp = temperatureUnit === 'C' ? '28°C' : '82°F';

  const forecast = [
    { day: 'Today', condition: 'Partly Cloudy', high: temperatureUnit === 'C' ? '29°C' : '84°F', low: temperatureUnit === 'C' ? '20°C' : '68°F', icon: CloudSun },
    { day: 'Tue', condition: 'High Wind / Storm', high: temperatureUnit === 'C' ? '26°C' : '78°F', low: temperatureUnit === 'C' ? '18°C' : '64°F', icon: CloudRain },
    { day: 'Wed', condition: 'Sunny & Clear', high: temperatureUnit === 'C' ? '31°C' : '88°F', low: temperatureUnit === 'C' ? '22°C' : '71°F', icon: Sun },
    { day: 'Thu', condition: 'Scattered Rain', high: temperatureUnit === 'C' ? '25°C' : '77°F', low: temperatureUnit === 'C' ? '17°C' : '62°F', icon: CloudRain },
    { day: 'Fri', condition: 'Partly Cloudy', high: temperatureUnit === 'C' ? '27°C' : '80°F', low: temperatureUnit === 'C' ? '19°C' : '66°F', icon: CloudSun },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {/* 1. Header Location Selector & °C / °F Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-[#ffba3f]" />
            Micro-Climate Farm Weather Surveillance
          </h2>
          <p className="text-xs text-slate-400">
            Real-time barometric pressure, humidity & ventilation heat stress index
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Farm Location Dropdown */}
          <select
            value={selectedWeatherLocation}
            onChange={(e) => setSelectedWeatherLocation(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#1b1b22] border border-[#34343c] text-slate-100 font-bold font-serif text-xs focus:border-[#c0c1ff] outline-none cursor-pointer shadow-md"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          {/* Temperature Unit Toggle Button */}
          <button
            onClick={toggleTemperatureUnit}
            className="px-3.5 py-2 rounded-xl bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 text-xs font-bold transition-all active:scale-95 shadow-md"
          >
            °{temperatureUnit} Switch
          </button>
        </div>
      </div>

      {/* 2. Current Weather Hero Card */}
      <div className="surface-card rounded-2xl p-6 border border-[#ffba3f]/40 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffba3f]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-3xl bg-[#ffba3f]/20 text-[#ffba3f] border border-[#ffba3f]/50">
              <CloudSun className="w-12 h-12" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffba3f] flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {selectedWeatherLocation}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl text-white">{currentTemp}</span>
                <span className="text-base font-semibold text-slate-300">Partly Cloudy</span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Feels like {temperatureUnit === 'C' ? '29°C' : '84°F'} · Low Thermal Stress Risk
              </p>
            </div>
          </div>

          {/* Environmental Telemetry Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            <div className="p-3 rounded-xl bg-[#1f1f26] border border-[#34343c] text-center">
              <span className="text-[10px] text-slate-400 font-sans uppercase">Humidity</span>
              <p className="font-display text-lg text-white flex items-center justify-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-[#c0c1ff]" /> 65%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1f1f26] border border-[#34343c] text-center">
              <span className="text-[10px] text-slate-400 font-sans uppercase">Wind Velocity</span>
              <p className="font-display text-lg text-white flex items-center justify-center gap-1">
                <Wind className="w-3.5 h-3.5 text-[#c0c1ff]" /> 12 km/h
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1f1f26] border border-[#34343c] text-center">
              <span className="text-[10px] text-slate-400 font-sans uppercase">Barometer</span>
              <p className="font-display text-lg text-white flex items-center justify-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-[#c0c1ff]" /> 1014 hPa
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1f1f26] border border-[#34343c] text-center">
              <span className="text-[10px] text-slate-400 font-sans uppercase">UV Index</span>
              <p className="font-display text-lg text-[#ffba3f] flex items-center justify-center gap-1">
                <Sun className="w-3.5 h-3.5" /> 6 Moderate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 5-Day Forecast */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-sans">
          5-Day Micro-Climate Trend Forecast
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {forecast.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className={`surface-card p-4 rounded-2xl border text-center space-y-2 ${
                  idx === 0 ? 'border-[#c0c1ff]/60 bg-[#1a178c]/20' : 'border-[#34343c]'
                }`}
              >
                <span className="text-xs font-bold text-white font-serif">{item.day}</span>
                <IconComp className="w-7 h-7 mx-auto text-[#ffba3f]" />
                <p className="text-[11px] text-slate-300 font-sans">{item.condition}</p>
                <div className="text-xs font-mono pt-1 border-t border-[#34343c] flex justify-center gap-2">
                  <span className="font-bold text-white">{item.high}</span>
                  <span className="text-slate-400">{item.low}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Biosecurity Climate Tip Card */}
      <div className="p-4 rounded-2xl bg-[#1a178c]/30 border border-[#c0c1ff]/40 flex items-start gap-3 text-slate-200">
        <Flame className="w-6 h-6 text-[#ffba3f] flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-white font-serif">
            Biosecurity Ventilation & Heat Stress Advisory
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            "With relative humidity at 65% and ambient temp at {currentTemp}, ensure evaporative cooling pads in Farrowing House 3 run at 70% duty cycle to prevent thermal distress in gestating sows."
          </p>
        </div>
      </div>
    </div>
  );
};
