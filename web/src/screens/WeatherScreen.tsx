import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  CloudSun,
  Droplets,
  Wind,
  Gauge,
  Sun,
  CloudRain,
  MapPin,
  Flame,
  RefreshCw,
  Radio,
} from 'lucide-react';

const LOCATION_COORDS: Record<string, { lat: number; lon: number }> = {
  'Green Valley - Sector 1 (Swine)': { lat: 28.6139, lon: 77.2090 },
  'Sunrise Poultry - Zone 2 (Avian)': { lat: 12.9716, lon: 77.5946 },
  'Oak Ridge Site A (Breeder Nucleus)': { lat: 19.0760, lon: 72.8777 },
  'Pine Valley North (Hatchery)': { lat: 30.7333, lon: 76.7794 },
};

function parseWeatherCode(code: number) {
  if (code === 0) return { condition: 'Clear Sky', icon: Sun };
  if (code <= 3) return { condition: 'Partly Cloudy', icon: CloudSun };
  if (code >= 51 && code <= 67) return { condition: 'Rain Showers', icon: CloudRain };
  if (code >= 80 && code <= 82) return { condition: 'Heavy Rain', icon: CloudRain };
  if (code >= 95) return { condition: 'Thunderstorm', icon: CloudRain };
  return { condition: 'Overcast', icon: CloudSun };
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WeatherScreen: React.FC = () => {
  const {
    temperatureUnit,
    toggleTemperatureUnit,
    selectedWeatherLocation,
    setSelectedWeatherLocation,
    t,
  } = useApp();

  const locations = Object.keys(LOCATION_COORDS);

  // Live telemetry state
  const [currentTempC, setCurrentTempC] = useState<number>(24);
  const [apparentTempC, setApparentTempC] = useState<number>(25);
  const [humidity, setHumidity] = useState<number>(62);
  const [windSpeed, setWindSpeed] = useState<number>(11);
  const [pressure, setPressure] = useState<number>(1013);
  const [conditionText, setConditionText] = useState<string>('Partly Cloudy');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [forecast, setForecast] = useState<
    Array<{
      day: string;
      condition: string;
      highC: number;
      lowC: number;
      icon: any;
    }>
  >([
    { day: 'Today', condition: 'Partly Cloudy', highC: 28, lowC: 19, icon: CloudSun },
    { day: 'Tue', condition: 'Clear Sky', highC: 29, lowC: 20, icon: Sun },
    { day: 'Wed', condition: 'High Wind / Storm', highC: 25, lowC: 18, icon: CloudRain },
    { day: 'Thu', condition: 'Scattered Rain', highC: 26, lowC: 17, icon: CloudRain },
    { day: 'Fri', condition: 'Sunny & Clear', highC: 30, lowC: 21, icon: Sun },
  ]);

  const [weatherProvider, setWeatherProvider] = useState<string>('Live Station');

  const fetchWeather = async (locName: string) => {
    const coords = LOCATION_COORDS[locName] || LOCATION_COORDS['Green Valley - Sector 1 (Swine)'];
    setIsLoading(true);
    try {
      // 1. Try our backend Weather API route (uses WeatherAPI.com with the configured key)
      const res = await api.getWeather({
        lat: coords.lat,
        lon: coords.lon,
        q: locName.split('(')[0]?.trim() || locName,
        days: 5,
      });

      if (res?.success && res.current) {
        setCurrentTempC(res.current.tempC);
        setApparentTempC(res.current.apparentTempC);
        setHumidity(res.current.humidity);
        setWindSpeed(res.current.windSpeedKmh);
        setPressure(res.current.pressureHpa);
        setConditionText(res.current.condition);
        setWeatherProvider(res.provider === 'weatherapi' ? 'WeatherAPI.com' : 'Open-Meteo');
        setIsLive(true);

        if (Array.isArray(res.forecast) && res.forecast.length > 0) {
          const mappedForecast = res.forecast.map((f: any) => {
            const lowerCond = (f.condition || '').toLowerCase();
            let icon = Sun;
            if (lowerCond.includes('cloud') || lowerCond.includes('overcast')) icon = CloudSun;
            else if (lowerCond.includes('rain') || lowerCond.includes('shower') || lowerCond.includes('drizzle')) icon = CloudRain;
            else if (lowerCond.includes('thunder') || lowerCond.includes('storm')) icon = CloudRain;

            return {
              day: f.day || 'Day',
              condition: f.condition || 'Clear',
              highC: f.highC,
              lowC: f.lowC,
              icon,
            };
          });
          setForecast(mappedForecast);
        }
        return;
      }

      // 2. Fallback to Open-Meteo direct call if backend is unavailable
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const fallbackRes = await fetch(url);
      if (!fallbackRes.ok) throw new Error('Weather fallback error');
      const data = await fallbackRes.json();

      if (data.current) {
        setCurrentTempC(Math.round(data.current.temperature_2m));
        setApparentTempC(Math.round(data.current.apparent_temperature));
        setHumidity(Math.round(data.current.relative_humidity_2m));
        setWindSpeed(Math.round(data.current.wind_speed_10m));
        setPressure(Math.round(data.current.surface_pressure));
        const parsed = parseWeatherCode(data.current.weather_code);
        setConditionText(parsed.condition);
        setWeatherProvider('Open-Meteo');
        setIsLive(true);
      }

      if (data.daily?.time && Array.isArray(data.daily.time)) {
        const parsedForecast = data.daily.time.slice(0, 5).map((isoDate: string, idx: number) => {
          const date = new Date(isoDate);
          const dayName = idx === 0 ? 'Today' : WEEKDAY_NAMES[date.getDay()];
          const code = data.daily.weather_code?.[idx] ?? 1;
          const parsed = parseWeatherCode(code);
          return {
            day: dayName,
            condition: parsed.condition,
            highC: Math.round(data.daily.temperature_2m_max?.[idx] ?? 28),
            lowC: Math.round(data.daily.temperature_2m_min?.[idx] ?? 18),
            icon: parsed.icon,
          };
        });
        setForecast(parsedForecast);
      }
    } catch (err) {
      console.warn('Live weather fetch fallback:', err);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedWeatherLocation);
  }, [selectedWeatherLocation]);

  const toDisplayTemp = (tempC: number) => {
    if (temperatureUnit === 'F') {
      return `${Math.round((tempC * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(tempC)}°C`;
  };

  // Dynamic heat stress assessment based on live metrics
  const isHighHeatStress = currentTempC >= 30 || (currentTempC >= 27 && humidity >= 70);
  const isColdStress = currentTempC <= 14;

  return (
    <div className="space-y-5 pb-20 animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="fd-label">FarmDrishti / {t('nav.weather')}</p>
            {isLive ? (
              <span className="fd-badge fd-badge-success text-[10px] inline-flex items-center gap-1 font-mono">
                <Radio className="w-2.5 h-2.5 animate-pulse text-[var(--accent-red)]" /> {weatherProvider}
              </span>
            ) : (
              <span className="fd-badge text-[10px] inline-flex items-center gap-1 font-mono">
                {t('weather.stationCached')}
              </span>
            )}
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            {t('weather.title')}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
            {t('weather.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="fd-label" htmlFor="weather-location">{t('weather.location')}</label>
            <select
              id="weather-location"
              value={selectedWeatherLocation}
              onChange={(e) => setSelectedWeatherLocation(e.target.value)}
              className="fd-select"
              style={{ minWidth: '220px' }}
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
              className="fd-btn-ghost px-3.5 py-1.5 text-xs font-mono"
            >
              °{temperatureUnit} Switch
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <span className="fd-label">Refresh</span>
            <button
              onClick={() => fetchWeather(selectedWeatherLocation)}
              disabled={isLoading}
              className="fd-btn-ghost px-2.5 py-1.5 text-xs disabled:opacity-50"
              title="Refresh meteorological telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Current Weather Hero Card ── */}
      <div className="fd-card p-5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="p-4 flex-shrink-0"
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '3px' }}
            >
              <CloudSun className="w-10 h-10 text-[var(--accent-ink)]" />
            </div>
            <div>
              <span className="fd-label flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-[var(--accent-red)]" /> {selectedWeatherLocation}
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="font-display text-5xl leading-none"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  {toDisplayTemp(currentTempC)}
                </span>
                <span className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {conditionText}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'IBM Plex Mono, monospace' }}>
                Feels like {toDisplayTemp(apparentTempC)} ·{' '}
                {isHighHeatStress
                  ? 'Elevated Thermal Stress Alert'
                  : isColdStress
                  ? 'Cold Stress Alert'
                  : 'Optimal Thermal Comfort Envelope'}
              </p>
            </div>
          </div>

          {/* Telemetry params */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            {[
              { label: 'Humidity', value: `${humidity}%`, icon: <Droplets className="w-3.5 h-3.5" /> },
              { label: 'Wind', value: `${windSpeed} km/h`, icon: <Wind className="w-3.5 h-3.5" /> },
              { label: 'Pressure', value: `${pressure} hPa`, icon: <Gauge className="w-3.5 h-3.5" /> },
              { label: 'Solar/UV', value: 'Moderate', icon: <Sun className="w-3.5 h-3.5" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="fd-raised p-3 text-center">
                <span className="fd-label block mb-1">{label}</span>
                <p className="text-sm font-bold flex items-center justify-center gap-1 font-mono text-[var(--text-primary)]">
                  {icon} {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5-Day Forecast ── */}
      <div>
        <h2 className="fd-label mb-3">5-Day Micro-Climate Forecast (Live Model)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {forecast.map((item, idx) => {
            const IconComp = item.icon || CloudSun;
            return (
              <div
                key={idx}
                className="fd-card p-4 text-center space-y-2"
                style={idx === 0 ? { borderColor: 'var(--border)', background: 'var(--bg-main)' } : {}}
              >
                <div className="flex items-center justify-center gap-1">
                  <span
                    className="text-xs font-bold font-mono"
                    style={{ color: idx === 0 ? 'var(--accent-ink)' : 'var(--text-primary)' }}
                  >
                    {item.day}
                  </span>
                  {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)]"></span>}
                </div>
                <IconComp className="w-6 h-6 mx-auto text-[var(--text-primary)]" />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.condition}</p>
                <div
                  className="text-xs pt-1 flex justify-center gap-2"
                  style={{ borderTop: '1px solid var(--border-dim)', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  <span className="font-bold text-[var(--text-primary)]">{toDisplayTemp(item.highC)}</span>
                  <span className="text-[var(--text-dim)]">{toDisplayTemp(item.lowC)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Biosecurity Advisory ── */}
      <div
        className="fd-card p-4 flex items-start gap-3"
        style={{
          borderColor: isHighHeatStress ? 'var(--accent-red)' : 'var(--border)',
          background: 'var(--bg-panel)',
        }}
      >
        <Flame
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isHighHeatStress ? 'text-[var(--accent-red)] animate-bounce' : 'text-[var(--text-secondary)]'
          }`}
        />
        <div>
          <h4 className="text-sm font-bold font-display uppercase tracking-wide text-[var(--text-primary)]">
            Biosecurity Ventilation & Micro-Environment Advisory
          </h4>
          <p className="text-xs mt-1 leading-relaxed text-[var(--text-secondary)]">
            {isHighHeatStress
              ? `Thermal stress threshold breached (ambient temp ${toDisplayTemp(currentTempC)} with ${humidity}% RH). Ensure evaporative cooling pad duty cycles run at maximum ventilation capacity and monitor drinking waterline flow.`
              : isColdStress
              ? `Ambient temperature is depressed (${toDisplayTemp(currentTempC)}). Verify supplemental infrared creep heaters in farrowing bays and reduce fan negative pressure to prevent draft chills.`
              : `Current micro-climate parameters (${toDisplayTemp(currentTempC)}, ${humidity}% RH, ${pressure} hPa) are within the ideal biosafety comfort envelope for gestating herds and broilers.`}
          </p>
        </div>
      </div>
    </div>
  );
};
