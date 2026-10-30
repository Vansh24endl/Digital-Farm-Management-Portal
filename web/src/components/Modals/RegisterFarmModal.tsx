import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  X,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import L from 'leaflet';

interface RegisterFarmModalProps {
  onFarmCreated?: (newFarm: any) => void;
}

export const RegisterFarmModal: React.FC<RegisterFarmModalProps> = ({ onFarmCreated }) => {
  const { activeModal, closeModal, showToast, setSelectedFarmId } = useApp();

  const [name, setName] = useState('');
  const [farmType, setFarmType] = useState<'poultry' | 'pig' | 'mixed'>('poultry');
  const [locationText, setLocationText] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const miniMapContainerRef = useRef<HTMLDivElement | null>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const isOpen = activeModal === 'register-farm';

  // Initialize mini picker Leaflet map when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!miniMapContainerRef.current) return;
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.invalidateSize();
        return;
      }

      // Default center: India (Maharashtra/Central)
      const defaultLat = coordinates ? coordinates.lat : 18.5204;
      const defaultLon = coordinates ? coordinates.lon : 73.8567;

      const map = L.map(miniMapContainerRef.current, {
        center: [defaultLat, defaultLon],
        zoom: coordinates ? 14 : 7,
        zoomControl: true,
        attributionControl: false,
      });

      // Esri Satellite tiles with labels
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(map);

      // Marker icon
      const pinIcon = L.divIcon({
        className: 'custom-farm-picker-pin',
        html: `
          <div style="
            background: #ef4444;
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          ">
            <span style="transform: rotate(45deg); font-size: 14px;">📍</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (coordinates) {
        markerRef.current = L.marker([coordinates.lat, coordinates.lon], { icon: pinIcon }).addTo(map);
      }

      // Interactive Click on Map to set coordinates
      map.on('click', (e: L.LeafletMouseEvent) => {
        const lat = parseFloat(e.latlng.lat.toFixed(5));
        const lon = parseFloat(e.latlng.lng.toFixed(5));
        setCoordinates({ lat, lon });
        setLocationText(`${lat}, ${lon}`);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon]);
        } else {
          markerRef.current = L.marker([lat, lon], { icon: pinIcon }).addTo(map);
        }
      });

      miniMapInstanceRef.current = map;
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Update map pin when coordinates change programmatically
  useEffect(() => {
    if (!coordinates || !miniMapInstanceRef.current) return;
    const map = miniMapInstanceRef.current;
    map.flyTo([coordinates.lat, coordinates.lon], 14, { duration: 1 });

    const pinIcon = L.divIcon({
      className: 'custom-farm-picker-pin',
      html: `
        <div style="
          background: #22c55e;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        ">
          <span style="transform: rotate(45deg); font-size: 14px;">📍</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([coordinates.lat, coordinates.lon]);
    } else {
      markerRef.current = L.marker([coordinates.lat, coordinates.lon], { icon: pinIcon }).addTo(map);
    }
  }, [coordinates]);

  // 1-Click Live GPS Detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setError('GPS Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGPS(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGPS(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lon = parseFloat(pos.coords.longitude.toFixed(5));
        setCoordinates({ lat, lon });
        setLocationText(`${lat}, ${lon} (Live GPS)`);
        showToast('📍 Live GPS coordinates captured successfully!');
      },
      (err) => {
        setIsDetectingGPS(false);
        setError(`GPS error: ${err.message}. You can still click on the map or type location.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Quick preset hubs
  const applyPresetHub = (hubName: string, lat: number, lon: number) => {
    setCoordinates({ lat, lon });
    setLocationText(hubName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a Farm Name.');
      return;
    }
    if (!locationText.trim()) {
      setError('Please select or specify farm location.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload: any = {
        name: name.trim(),
        farmType,
        location: locationText.trim(),
      };

      if (coordinates) {
        payload.coordinates = coordinates;
      }

      const res = await api.createFarm(payload);
      if (res.success && res.data) {
        const createdId = res.data._id || res.data.id;
        setSelectedFarmId(String(createdId));
        showToast(`🎉 Farm "${name}" registered successfully with live map telemetry!`);
        if (onFarmCreated) onFarmCreated(res.data);
        closeModal();
      } else {
        throw new Error((res as any).message || 'Failed to register farm');
      }
    } catch (err: any) {
      setError(err.message || 'Could not register farm. Please verify login status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-sm p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        style={{
          background: 'var(--bg-panel)',
          border: '1.5px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-sm flex items-center justify-center"
              style={{ background: 'var(--lime-subtle)', border: '1px solid var(--lime-dim)' }}
            >
              <Building2 className="w-5 h-5" style={{ color: 'var(--lime)' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                Register Farm & Map Telemetry
              </h2>
              <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                GPS satellite mapping & biosecurity containment setup
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="fd-btn-icon text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div
            className="p-3 text-xs rounded-sm flex items-center gap-2"
            style={{ background: 'var(--critical-bg)', border: '1px solid var(--critical-dim)', color: 'var(--critical)' }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Farm Name */}
          <div>
            <label className="fd-label block mb-1">
              Farm Facility Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Broiler Farm / Green Valley Unit 2"
              className="fd-input w-full"
              required
            />
          </div>

          {/* Farm Type */}
          <div>
            <label className="fd-label block mb-1">
              Livestock Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'poultry', label: '🐔 Poultry (कुक्कुट)', desc: 'Broiler / Layer' },
                { type: 'pig',     label: '🐖 Swine (शूकर)',   desc: 'Breeding / Finisher' },
                { type: 'mixed',   label: '🌾 Mixed (मिश्रित)', desc: 'Multi-specie Hub' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setFarmType(item.type as any)}
                  className={`p-2.5 text-left rounded-sm border transition-all ${
                    farmType === item.type ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    background: farmType === item.type ? 'var(--lime-subtle)' : 'var(--bg-raised)',
                    borderColor: farmType === item.type ? 'var(--lime)' : 'var(--border)',
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: farmType === item.type ? 'var(--lime)' : 'var(--text-primary)' }}>
                    {item.label}
                  </p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Location & GPS Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="fd-label">
                Farm GPS Location & Satellite Pin <span className="text-red-400">*</span>
              </label>

              {/* 1-Click Detect GPS Button */}
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetectingGPS}
                className="fd-btn text-xs py-1 px-2.5 flex items-center gap-1.5"
                style={{ background: 'var(--lime)', color: '#111311', borderColor: 'var(--lime)' }}
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetectingGPS ? 'animate-spin' : ''}`} />
                {isDetectingGPS ? 'Detecting...' : '📍 Use My Live GPS'}
              </button>
            </div>

            {/* Quick Hub Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-[var(--text-secondary)]">Quick Select:</span>
              {[
                { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567 },
                { name: 'Baramati, MH', lat: 18.1517, lon: 74.5772 },
                { name: 'Nashik, MH', lat: 19.9975, lon: 73.7898 },
                { name: 'Karnal, Haryana', lat: 29.6857, lon: 76.9905 },
                { name: 'Hyderabad, TS', lat: 17.3850, lon: 78.4867 },
              ].map((hub) => (
                <button
                  type="button"
                  key={hub.name}
                  onClick={() => applyPresetHub(hub.name, hub.lat, hub.lon)}
                  className="px-2 py-0.5 text-[11px] font-mono rounded-sm border hover:border-[var(--lime)] transition-colors"
                  style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}
                >
                  {hub.name.split(',')[0]}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={locationText}
                onChange={(e) => {
                  setLocationText(e.target.value);
                  const match = e.target.value.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
                  if (match && match[1] && match[2]) {
                    setCoordinates({ lat: parseFloat(match[1]), lon: parseFloat(match[2]) });
                  }
                }}
                placeholder="Click map below or type: 18.5204, 73.8567 or City Name"
                className="fd-input w-full font-mono text-xs pl-8"
                required
              />
              <MapPin className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* ── Interactive Mini-Map Pin Drop Picker ── */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                <span>🛰️ Click anywhere on map to drop farm pin:</span>
                {coordinates && (
                  <span className="text-[var(--lime)] font-bold">
                    GPS: {coordinates.lat}, {coordinates.lon}
                  </span>
                )}
              </div>
              <div
                ref={miniMapContainerRef}
                className="w-full h-48 rounded-sm overflow-hidden border border-[var(--border)] relative cursor-crosshair shadow-inner"
              />
            </div>
          </div>

          {/* Biosecurity Guarantee Note */}
          <div
            className="p-3 rounded-sm flex items-start gap-2.5 text-xs font-mono"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[var(--lime)] mt-0.5" />
            <div>
              <p className="font-bold text-[var(--text-primary)]">Automated Biosecurity Telemetry</p>
              <p className="text-[var(--text-secondary)] text-[11px] mt-0.5">
                Perimeter fence buffers (320m), livestock housing zone (110m), and disease outbreak surveillance sensors will be automatically bound to this farm.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={closeModal}
              className="fd-btn-ghost text-xs"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="fd-btn text-xs flex items-center gap-1.5"
              style={{ background: 'var(--lime)', color: '#111311', borderColor: 'var(--lime)' }}
            >
              {submitting ? (
                <>Registering...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Save & Register Farm Map
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
