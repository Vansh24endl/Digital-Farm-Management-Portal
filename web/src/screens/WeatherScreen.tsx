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
    { day: 'Tue',   condition: 'High Wind / Storm', high: temperatureUnit === 'C' ? '26°C' : '78°F', low: temperatureUnit === 'C' ? '18°C' : '64°F', icon: CloudRain },
    { day: 'Wed',   condition: 'Sunny & Clear', high: temperatureUnit === 'C' ? '31°C' : '88°F', low: temperatureUnit === 'C' ? '22°C' : '71°F', icon: Sun },
    { day: 'Thu',   condition: 'Scattered Rain', high: temperatureUnit === 'C' ? '25°C' : '77°F', low: temperatureUnit === 'C' ? '17°C' : '62°F', icon: CloudRain },
    { day: 'Fri',   condition: 'Partly Cloudy', high: temperatureUnit === 'C' ? '27°C' : '80°F', low: temperatureUnit === 'C' ? '19°C' : '66°F', icon: CloudSun },
  ];

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / Weather</p>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Micro-Climate Weather
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
            Barometric pressure, humidity & ventilation heat stress index
          </p>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="fd-label" htmlFor="weather-location">Location</label>
            <select
              id="weather-location"
              value={selectedWeatherLocation}
              onChange={(e) => setSelectedWeatherLocation(e.target.value)}
              className="fd-select"
              style={{ minWidth: '180px' }}
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="fd-label">Unit</span>
            <button
              id="temperature-toggle"
              onClick={toggleTemperatureUnit}
              className="fd-btn-ghost px-4 py-2"
            >
              °{temperatureUnit} Switch
            </button>
          </div>
        </div>
      </div>

      {/* ── Current Weather Hero Card ── */}
      <div className="fd-card p-5" style={{ borderColor: 'var(--warning-dim)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="p-4 flex-shrink-0"
              style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-dim)', borderRadius: '2px' }}
            >
              <CloudSun className="w-10 h-10" style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <span className="fd-label flex items-center gap-1 mb-1" style={{ color: 'var(--warning)' }}>
                <MapPin className="w-3 h-3" /> {selectedWeatherLocation}
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="font-display text-5xl leading-none"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  {currentTemp}
                </span>
                <span className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>Partly Cloudy</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
                Feels like {temperatureUnit === 'C' ? '29°C' : '84°F'} · Low Thermal Stress Risk
              </p>
            </div>
          </div>

          {/* Telemetry params */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            {[
              { label: 'Humidity', value: '65%', icon: <Droplets className="w-3.5 h-3.5" style={{ color: 'var(--lime)' }} /> },
              { label: 'Wind',     value: '12 km/h', icon: <Wind className="w-3.5 h-3.5" style={{ color: 'var(--lime)' }} /> },
              { label: 'Pressure', value: '1014 hPa', icon: <Gauge className="w-3.5 h-3.5" style={{ color: 'var(--lime)' }} /> },
              { label: 'UV Index', value: '6 Mod', icon: <Sun className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="fd-raised p-3 text-center">
                <span className="fd-label block mb-1">{label}</span>
                <p className="text-sm font-bold flex items-center justify-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  {icon} {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5-Day Forecast ── */}
      <div>
        <h2 className="fd-label mb-3">5-Day Micro-Climate Forecast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {forecast.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="fd-card p-4 text-center space-y-2"
                style={idx === 0 ? { borderColor: 'var(--lime-dim)', background: 'var(--lime-subtle)' } : {}}
              >
                <span
                  className="text-xs font-bold"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', color: idx === 0 ? 'var(--lime)' : 'var(--text-primary)' }}
                >
                  {item.day}
                </span>
                <IconComp className="w-6 h-6 mx-auto" style={{ color: 'var(--warning)' }} />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.condition}</p>
                <div
                  className="text-xs pt-1 flex justify-center gap-2"
                  style={{ borderTop: '1px solid var(--border-dim)', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.high}</span>
                  <span style={{ color: 'var(--text-dim)' }}>{item.low}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Biosecurity Advisory ── */}
      <div
        className="fd-card p-4 flex items-start gap-3"
        style={{ borderColor: 'var(--warning-dim)', background: 'var(--warning-bg)' }}
      >
        <Flame className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
        <div>
          <h4 className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
            Biosecurity Ventilation & Heat Stress Advisory
          </h4>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            With relative humidity at 65% and ambient temp at {currentTemp}, ensure evaporative cooling pads in Farrowing House 3 run at 70% duty cycle to prevent thermal distress in gestating sows.
          </p>
        </div>
      </div>
    </div>
  );
};
