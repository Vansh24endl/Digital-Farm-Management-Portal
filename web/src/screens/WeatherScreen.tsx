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
  RefreshCw,
  Search,
  Radio,
} from 'lucide-react';

interface LocationItem {
  name: string;
  lat: number;
  lon: number;
  subtitle?: string;
}

const DEFAULT_INDORE_STATION: LocationItem = {
  name: 'Indore, Madhya Pradesh (Default Station)',
  lat: 22.7196,
  lon: 75.8577,
  subtitle: 'Central Agricultural Telemetry Station',
};

const REGIONAL_MP_HUBS: LocationItem[] = [
  DEFAULT_INDORE_STATION,
  { name: 'Sanwer Agro Zone, Indore', lat: 22.7845, lon: 75.8398, subtitle: 'Sanwer Road Poultry Belt' },
  { name: 'Rau Biosecurity Sector, Indore', lat: 22.6412, lon: 75.8115, subtitle: 'Rau Swine & Livestock Hub' },
  { name: 'Mhow Field Unit, Indore', lat: 22.5539, lon: 75.7622, subtitle: 'Mhow Cantonment Agro Station' },
  { name: 'Dewas Road Bio-Cluster, Indore', lat: 22.8211, lon: 75.9324, subtitle: 'Industrial Agro Belt' },
  { name: 'Ujjain Division Bio-Perimeter', lat: 23.1765, lon: 75.7885, subtitle: 'Malwa Agro Region' },
  { name: 'Bhopal Central Hub, MP', lat: 23.2599, lon: 77.4126, subtitle: 'State Capital Veterinary Hub' },
];

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

  const [locationList, setLocationList] = useState<LocationItem[]>(REGIONAL_MP_HUBS);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lon: number }>({
    lat: DEFAULT_INDORE_STATION.lat,
    lon: DEFAULT_INDORE_STATION.lon,
  });

  // Live telemetry state
  const [currentTempC, setCurrentTempC] = useState<number>(26);
  const [apparentTempC, setApparentTempC] = useState<number>(27);
  const [humidity, setHumidity] = useState<number>(55);
  const [rainfallMm, setRainfallMm] = useState<number>(0);
  const [windSpeed, setWindSpeed] = useState<number>(12);
  const [pressure, setPressure] = useState<number>(1012);
  const [conditionText, setConditionText] = useState<string>('Partly Cloudy');
  const [weatherProvider, setWeatherProvider] = useState<string>('WeatherAPI.com');
  const [resolvedLocationName, setResolvedLocationName] = useState<string>('Indore, Madhya Pradesh');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [forecast, setForecast] = useState<
    Array<{
      day: string;
      condition: string;
      highC: number;
      lowC: number;
      icon: any;
      chanceOfRain?: number;
    }>
  >([
    { day: 'Today', condition: 'Partly Cloudy', highC: 30, lowC: 18, icon: CloudSun, chanceOfRain: 10 },
    { day: 'Tue', condition: 'Clear Sky', highC: 31, lowC: 19, icon: Sun, chanceOfRain: 0 },
    { day: 'Wed', condition: 'Partly Cloudy', highC: 29, lowC: 18, icon: CloudSun, chanceOfRain: 15 },
    { day: 'Thu', condition: 'Rain Showers', highC: 27, lowC: 17, icon: CloudRain, chanceOfRain: 60 },
    { day: 'Fri', condition: 'Sunny & Clear', highC: 30, lowC: 19, icon: Sun, chanceOfRain: 0 },
  ]);

  // Load farms from MongoDB and combine with Indore stations
  useEffect(() => {
    let mounted = true;
    api.getFarms()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (!mounted || list.length === 0) return;

        const farmItems: LocationItem[] = list.map((f: any) => {
          let lat = 22.7196;
          let lon = 75.8577;
          if (f.coordinates?.lat && f.coordinates?.lon) {
            lat = f.coordinates.lat;
            lon = f.coordinates.lon;
          } else if (f.lat && f.lon) {
            lat = f.lat;
            lon = f.lon;
          } else {
            const match = String(f.location || '').match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
            if (match) {
              lat = parseFloat(match[1]);
              lon = parseFloat(match[2]);
            }
          }
          return {
            name: `${f.name} (${f.location || 'Indore, MP'})`,
            lat,
            lon,
            subtitle: `Farm Unit · ${f.farmType || 'Livestock'}`,
          };
        });

        // Prepend Indore Default, then real farms, then regional MP hubs
        const combined = [DEFAULT_INDORE_STATION, ...farmItems, ...REGIONAL_MP_HUBS.slice(1)];
        setLocationList(combined);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const fetchWeather = async (targetLat: number, targetLon: number, queryName: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // 1. Try our backend Weather API route (uses WeatherAPI.com with the configured key)
      const res = await api.getWeather({
        lat: targetLat,
        lon: targetLon,
        q: queryName,
        days: 5,
      });

      if (res?.success && res.current) {
        setCurrentTempC(res.current.tempC);
        setApparentTempC(res.current.apparentTempC);
        setHumidity(res.current.humidity);
        setRainfallMm((res.current as any).rainfallMm || 0);
        setWindSpeed(res.current.windSpeedKmh);
        setPressure(res.current.pressureHpa);
        setConditionText(res.current.condition);
        setWeatherProvider(res.provider === 'weatherapi' ? 'WeatherAPI.com' : 'Open-Meteo');
        setResolvedLocationName(res.location?.name ? `${res.location.name}, ${res.location.region || 'MP'}` : queryName);
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
              chanceOfRain: f.chanceOfRain ?? 0,
            };
          });
          setForecast(mappedForecast);
        }
        return;
      }

      // 2. Direct Open-Meteo fallback strictly using targetLat and targetLon (Indore, MP)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const fallbackRes = await fetch(url);
      if (!fallbackRes.ok) throw new Error('Weather fallback failed');
      const data = await fallbackRes.json();

      if (data.current) {
        setCurrentTempC(Math.round(data.current.temperature_2m));
        setApparentTempC(Math.round(data.current.apparent_temperature));
        setHumidity(Math.round(data.current.relative_humidity_2m));
        setRainfallMm(Number(data.current.precipitation ?? 0));
        setWindSpeed(Math.round(data.current.wind_speed_10m));
        setPressure(Math.round(data.current.surface_pressure));
        const parsed = parseWeatherCode(data.current.weather_code);
        setConditionText(parsed.condition);
        setWeatherProvider('Open-Meteo');
        setResolvedLocationName(queryName);
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
            highC: Math.round(data.daily.temperature_2m_max?.[idx] ?? 30),
            lowC: Math.round(data.daily.temperature_2m_min?.[idx] ?? 18),
            icon: parsed.icon,
            chanceOfRain: data.daily.precipitation_probability_max?.[idx] ?? 0,
          };
        });
        setForecast(parsedForecast);
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setErrorMessage(err?.message || 'Could not connect to meteorological station. Displaying cached telemetry for Indore, MP.');
      setResolvedLocationName('Indore, Madhya Pradesh');
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on initial mount with Indore, MP coordinates
  useEffect(() => {
    fetchWeather(activeCoords.lat, activeCoords.lon, selectedWeatherLocation || 'Indore, Madhya Pradesh');
  }, []);

  const handleSelectLocation = (locName: string) => {
    setSelectedWeatherLocation(locName);
    const matched = locationList.find((item) => item.name === locName) || DEFAULT_INDORE_STATION;
    setActiveCoords({ lat: matched.lat, lon: matched.lon });
    fetchWeather(matched.lat, matched.lon, locName);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchQuery.trim()) return;
    const q = customSearchQuery.trim();
    setSelectedWeatherLocation(q);

    // If query has coordinates like "22.7, 75.8"
    const coordMatch = q.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lon = parseFloat(coordMatch[2]);
      setActiveCoords({ lat, lon });
      fetchWeather(lat, lon, q);
    } else {
      fetchWeather(activeCoords.lat, activeCoords.lon, q);
    }
  };

  const toDisplayTemp = (celsius: number) => {
    if (temperatureUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  // THI (Temperature Humidity Index) for Swine / Avian thermal comfort
  const thi = Math.round(currentTempC - (0.55 - 0.0055 * humidity) * (currentTempC - 14.5));
  const heatStressAlert = thi > 28;
  const coldStressAlert = thi < 14;

  return (
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / {t('nav.weather')}</p>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl font-bold font-display"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              Micro-Climate & Thermal Index
            </h1>
            <span className="fd-badge fd-badge-lime text-[11px] font-mono">
              INDORE (MP) STATION
            </span>
          </div>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            Real-time heat stress (THI), humidity, rainfall & ambient livestock bioclimatology
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch sm:self-start flex-wrap">
          {/* Farm Location Selector */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="fd-label" htmlFor="weather-location">{t('weather.location')}</label>
            <select
              id="weather-location"
              value={selectedWeatherLocation}
              onChange={(e) => handleSelectLocation(e.target.value)}
              className="fd-select text-xs font-mono w-full sm:w-auto sm:min-w-[260px]"
            >
              {locationList.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Unit Toggle */}
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

            {/* Refresh */}
            <div className="flex flex-col gap-1">
              <span className="fd-label">Refresh</span>
              <button
                onClick={() => fetchWeather(activeCoords.lat, activeCoords.lon, selectedWeatherLocation)}
                disabled={isLoading}
                className="fd-btn-ghost px-2.5 py-1.5 text-xs disabled:opacity-50"
                title="Refresh meteorological telemetry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Manual Location Search Bar ── */}
      <div className="fd-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
              placeholder="Search MP city or GPS (e.g. Sanwer, 22.7, 75.8)..."
              className="fd-input w-full text-xs font-mono pl-8"
            />
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            type="submit"
            className="fd-btn text-xs px-3 py-2 flex items-center justify-center gap-1.5"
            style={{ background: 'var(--lime)', color: '#111311', borderColor: 'var(--lime)' }}
          >
            Locate Weather
          </button>
        </form>

        <div className="text-[11px] font-mono text-[var(--text-secondary)] flex items-center gap-2">
          <span>Active Station Coordinates:</span>
          <span className="text-[var(--lime)] font-bold">
            {activeCoords.lat.toFixed(4)}° N, {activeCoords.lon.toFixed(4)}° E
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 text-xs rounded-sm bg-[var(--warning-bg)] border border-[var(--warning-dim)] text-[var(--warning)] font-mono">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* ── Current Weather Hero Card ── */}
      <div className="fd-card p-5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="p-4 flex-shrink-0"
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '3px' }}
            >
              <CloudSun className="w-10 h-10 text-[var(--lime)]" />
            </div>
            <div>
              <span className="fd-label flex items-center gap-1 mb-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-[var(--critical)]" /> {resolvedLocationName}
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="font-display text-5xl leading-none"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  {toDisplayTemp(currentTempC)}
                </span>
                <span className="text-sm font-mono text-[var(--text-secondary)]">
                  Feels like {toDisplayTemp(apparentTempC)}
                </span>
              </div>
              <p className="text-xs mt-1.5 font-bold font-mono" style={{ color: heatStressAlert ? 'var(--critical)' : coldStressAlert ? 'var(--warning)' : 'var(--lime)' }}>
                {conditionText} · {heatStressAlert
                  ? '⚠️ Extreme Heat Stress Risk (Activate mist coolers & high ventilation)'
                  : coldStressAlert
                  ? '⚠️ Cold Stress Alert (Provide heating brooders)'
                  : '✅ Optimal Thermal Comfort Envelope for Poultry & Swine'}
              </p>
            </div>
          </div>

          {/* Telemetry params */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            {[
              { label: 'Humidity', value: `${humidity}%`, icon: <Droplets className="w-3.5 h-3.5 text-blue-400" /> },
              { label: 'Rainfall', value: `${rainfallMm} mm`, icon: <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> },
              { label: 'Wind Velocity', value: `${windSpeed} km/h`, icon: <Wind className="w-3.5 h-3.5 text-gray-300" /> },
              { label: 'Barometric', value: `${pressure} hPa`, icon: <Gauge className="w-3.5 h-3.5 text-emerald-400" /> },
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
        <h2 className="fd-label mb-3">5-Day Micro-Climate Forecast (Indore & Malwa Agro Region)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {forecast.map((item, idx) => {
            const IconComp = item.icon || CloudSun;
            return (
              <div
                key={idx}
                className="fd-card p-4 text-center space-y-2"
                style={idx === 0 ? { borderColor: 'var(--lime-dim)', background: 'var(--lime-subtle)' } : {}}
              >
                <div className="flex items-center justify-center gap-1">
                  <span
                    className="text-xs font-bold font-mono"
                    style={{ color: idx === 0 ? 'var(--lime)' : 'var(--text-primary)' }}
                  >
                    {item.day}
                  </span>
                  {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)] animate-pulse"></span>}
                </div>
                <IconComp className="w-6 h-6 mx-auto text-[var(--text-primary)]" />
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.condition}</p>
                <div
                  className="text-xs pt-1 flex justify-center gap-2"
                  style={{ borderTop: '1px solid var(--border-dim)', fontFamily: 'IBM Plex Mono, monospace' }}
                >
                  <span className="font-bold text-[var(--text-primary)]">{toDisplayTemp(item.highC)}</span>
                  <span style={{ color: 'var(--text-dim)' }}>{toDisplayTemp(item.lowC)}</span>
                </div>
                {item.chanceOfRain !== undefined && (
                  <p className="text-[10px] font-mono text-cyan-400">
                    ☔ {item.chanceOfRain}% Rain
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Biosecurity Telemetry Footer ── */}
      <div
        className="p-3 rounded-sm flex items-center justify-between text-xs font-mono"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
      >
        <span className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Radio className="w-4 h-4 text-[var(--lime)]" />
          <span>Active Provider: <strong>{weatherProvider}</strong></span>
          <span className="opacity-40">|</span>
          <span>Station: <strong>{resolvedLocationName}</strong></span>
        </span>
        <span className="fd-badge fd-badge-lime">
          {isLive ? 'Live Telemetry' : 'Cached Baseline'}
        </span>
      </div>
    </div>
  );
};
