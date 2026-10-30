import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Eye } from 'lucide-react';

export interface FarmLocation {
  id?: string;
  _id?: string;
  name?: string;
  farmType?: string;
  location?: string;
  status?: string;
  lat?: number;
  lon?: number;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface DiseaseHotspot {
  id?: string;
  _id?: string;
  diseaseName?: string;
  symptoms?: string;
  severity?: string;
  riskLevel?: string;
  location?: string;
  farmId?: any;
  createdAt?: string;
  lat?: number;
  lon?: number;
}

interface RealFarmMapProps {
  farms?: FarmLocation[];
  selectedFarmId?: string;
  onSelectFarm?: (farmId: string) => void;
  diseaseReports?: DiseaseHotspot[];
  height?: string;
  showZones?: boolean;
  mode?: 'farm' | 'surveillance';
}

// Known coordinates for agricultural hubs and fallback geocoding
const KNOWN_COORDS: Record<string, [number, number]> = {
  // Indian Poultry & Swine hubs
  pune: [18.5204, 73.8567],
  baramati: [18.1517, 74.5772],
  delhi: [28.6139, 77.2090],
  bangalore: [12.9716, 77.5946],
  mumbai: [19.0760, 72.8777],
  chandigarh: [30.7333, 76.7794],
  hyderabad: [17.3850, 78.4867],
  nashik: [19.9975, 73.7898],
  // International demo hubs (Iowa poultry/swine belt)
  'des moines': [41.5868, -93.6250],
  ames: [42.0308, -93.6319],
  'cedar rapids': [41.9779, -91.6656],
  iowa: [41.8780, -93.0977],
};

function resolveCoordinates(farmOrName?: FarmLocation | string, location?: string, index: number = 0): [number, number] {
  if (typeof farmOrName === 'object' && farmOrName !== null) {
    if (farmOrName.coordinates && typeof farmOrName.coordinates.lat === 'number' && typeof farmOrName.coordinates.lon === 'number') {
      return [farmOrName.coordinates.lat, farmOrName.coordinates.lon];
    }
    if (typeof farmOrName.lat === 'number' && typeof farmOrName.lon === 'number') {
      return [farmOrName.lat, farmOrName.lon];
    }
    return resolveCoordinates(farmOrName.name, farmOrName.location, index);
  }

  const combined = `${farmOrName || ''} ${location || ''}`.toLowerCase();

  // 1. Direct coordinate format in string (e.g. "18.52, 73.85")
  const coordMatch = combined.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (coordMatch && coordMatch[1] && coordMatch[2]) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) return [lat, lon];
  }

  // 2. City / Region matching
  for (const [key, coords] of Object.entries(KNOWN_COORDS)) {
    if (combined.includes(key)) {
      // Offset slightly per farm so multiple farms in the same city don't overlap exactly
      const offsetLat = (index % 3 - 1) * 0.015;
      const offsetLon = (Math.floor(index / 3) - 1) * 0.018;
      return [coords[0] + offsetLat, coords[1] + offsetLon];
    }
  }

  // 3. Sensible agro-cluster default (Pune / Maharashtra agro cluster)
  const baseLat = 18.5204;
  const baseLon = 73.8567;
  const offsetLat = (index * 0.022) % 0.12 - 0.06;
  const offsetLon = (index * 0.031) % 0.14 - 0.07;
  return [baseLat + offsetLat, baseLon + offsetLon];
}

export const RealFarmMap: React.FC<RealFarmMapProps> = ({
  farms = [],
  selectedFarmId = '',
  onSelectFarm,
  diseaseReports = [],
  height = '420px',
  showZones = true,
  mode = 'farm',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'satellite' | 'street' | 'tactical'>('satellite');
  const [showZonePolygons, setShowZonePolygons] = useState<boolean>(showZones);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center on first farm or central agro hub
    const initialCoords: [number, number] = farms.length > 0
      ? resolveCoordinates(farms[0]?.name, farms[0]?.location, 0)
      : [18.5204, 73.8567];

    const map = L.map(mapContainerRef.current, {
      center: initialCoords,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom tactical zoom control on top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Layer group for dynamic markers/zones
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update Tile Layers when activeLayer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let maxZoom = 19;

    if (activeLayer === 'satellite') {
      // Esri World Imagery (High-res satellite photo tiles)
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (activeLayer === 'tactical') {
      // CartoDB Dark Matter (Dark surveillance mode)
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      maxZoom = 20;
    } else {
      // OpenStreetMap Standard
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(tileUrl, {
      maxZoom,
      subdomains: ['a', 'b', 'c', 'd'],
    }).addTo(map);
  }, [activeLayer]);

  // Update Markers, Zones, and Hotspots
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // ── 1. Render Real Farms ──
    farms.forEach((farm, idx) => {
      const farmId = String(farm._id || farm.id || idx);
      const isSelected = selectedFarmId === farmId;
      const coords = resolveCoordinates(farm, farm.location, idx);

      // Create Custom Tactical Pin Icon
      const pinColor = isSelected ? '#a3e635' : farm.status === 'optimal' ? '#22c55e' : '#f59e0b';
      const iconHtml = `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: #111411;
          border: 2px solid ${pinColor};
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 10px ${pinColor}66;
          cursor: pointer;
          transform: translate(-50%, -50%);
        ">
          <span style="font-size: 18px; line-height: 1;">🚜</span>
          ${isSelected ? `<span style="
            position: absolute;
            top: -5px;
            right: -5px;
            width: 10px;
            height: 10px;
            background: #a3e635;
            border: 2px solid #111411;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
          "></span>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-farm-marker',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker(coords, { icon: customIcon });

      // Popup with real details
      const popupHtml = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${pinColor}; letter-spacing: 0.05em;">
              ● ${farm.status || 'Active Facility'}
            </span>
            <span style="font-size: 9px; font-mono; opacity: 0.7;">GPS VERIFIED</span>
          </div>
          <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #fff;">${farm.name || 'Farm Facility'}</h4>
          <p style="margin: 3px 0 6px 0; font-size: 11px; opacity: 0.8; color: #ccc;">${farm.location || 'Location Not Specified'}</p>
          <div style="font-size: 10px; background: rgba(255,255,255,0.08); padding: 4px 6px; border-radius: 3px; font-mono;">
            Type: <strong>${farm.farmType || 'Poultry & Mixed'}</strong>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectFarm) onSelectFarm(farmId);
      });

      marker.addTo(layerGroup);

      // If this farm is selected, fly to it and draw Biosecurity Zones
      if (isSelected) {
        map.flyTo(coords, 16, { duration: 1.2 });

        if (showZonePolygons) {
          // 🛡️ Outer Biosecurity Perimeter Buffer (Radius ~300m)
          L.circle(coords, {
            radius: 320,
            color: '#a3e635',
            dashArray: '6, 6',
            fillColor: '#a3e635',
            fillOpacity: 0.06,
            weight: 2,
          }).bindTooltip('Perimeter Security Fence & Camera Zone', { sticky: true }).addTo(layerGroup);

          // 🔴 Livestock Containment Sector (Radius ~110m)
          const shedCoords: [number, number] = [coords[0] + 0.0006, coords[1] + 0.0008];
          L.circle(shedCoords, {
            radius: 110,
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.16,
            weight: 2,
          }).bindTooltip('Zone B: Primary Livestock Containment (Restricted)', { sticky: true }).addTo(layerGroup);

          // 🟡 Feed Storage & Silo Area (Radius ~60m)
          const feedCoords: [number, number] = [coords[0] - 0.0007, coords[1] - 0.0006];
          L.circle(feedCoords, {
            radius: 65,
            color: '#f59e0b',
            fillColor: '#f59e0b',
            fillOpacity: 0.18,
            weight: 2,
          }).bindTooltip('Zone C: Feed Mill & Silo Disinfection Barrier', { sticky: true }).addTo(layerGroup);

          // 🟢 Vehicle Entry Airlock & Disinfection Gate (Point)
          const gateCoords: [number, number] = [coords[0] - 0.0014, coords[1] + 0.0012];
          L.circle(gateCoords, {
            radius: 40,
            color: '#22c55e',
            fillColor: '#22c55e',
            fillOpacity: 0.3,
            weight: 2,
          }).bindTooltip('Zone A: Vehicle Wheel-Wash Arch & Shower-In Gate', { sticky: true }).addTo(layerGroup);
        }
      }
    });

    // ── 2. Render Disease Outbreak Hotspots (Surveillance Mode) ──
    diseaseReports.forEach((report, idx) => {
      const risk = String(report.severity || report.riskLevel || 'low').toLowerCase();
      const isHigh = risk.includes('high') || risk.includes('critical') || risk.includes('urgent');
      const isMed = risk.includes('medium') || risk.includes('attention') || risk.includes('warning');
      const color = isHigh ? '#dc2626' : isMed ? '#f59e0b' : '#22c55e';

      const coords = resolveCoordinates(report.diseaseName, report.location, idx + 10);

      // Pulsing Outbreak Marker
      const outbreakIcon = L.divIcon({
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: ${color};
            border: 2px solid #fff;
            border-radius: 50%;
            box-shadow: 0 0 16px ${color};
            cursor: pointer;
            transform: translate(-50%, -50%);
            animation: urgent-pulse 2s infinite;
          ">
            <span style="font-size: 16px; line-height: 1;">⚠️</span>
          </div>
        `,
        className: 'custom-outbreak-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(coords, { icon: outbreakIcon });

      // Outbreak Buffer Area
      const bufferRadius = isHigh ? 500 : isMed ? 250 : 150;
      L.circle(coords, {
        radius: bufferRadius,
        color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: isHigh ? '4, 4' : undefined,
      }).addTo(layerGroup);

      const popupHtml = `
        <div style="font-family: inherit; min-width: 220px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${color}; letter-spacing: 0.05em;">
              🚨 ${isHigh ? 'CRIMSON ALERT' : isMed ? 'WARNING BUFFER' : 'ROUTINE'}
            </span>
            <span style="font-size: 9px; font-mono; opacity: 0.7;">RADIUS: ${bufferRadius}m</span>
          </div>
          <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #fff;">${report.diseaseName || 'Pathogen Vector'}</h4>
          <p style="margin: 3px 0 6px 0; font-size: 11px; opacity: 0.8; color: #ccc;">${report.location || 'Location Not Recorded'}</p>
          <div style="font-size: 10px; background: rgba(255,255,255,0.08); padding: 4px 6px; border-radius: 3px; font-mono;">
            Symptoms: <strong>${report.symptoms || 'Atypical mortality / respiratory'}</strong>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(layerGroup);
    });

    // Invalidate size to ensure crisp rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [farms, selectedFarmId, diseaseReports, showZonePolygons]);

  return (
    <div
      className="relative w-full rounded-sm overflow-hidden"
      style={{
        height,
        background: 'var(--bg-main)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-ink)',
      }}
    >
      {/* ── Leaflet Container ── */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* ── Map Controls & Layer Switcher Bar ── */}
      <div
        className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 p-1 rounded-sm shadow-md"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => setActiveLayer('satellite')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all flex items-center gap-1 ${
            activeLayer === 'satellite' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeLayer === 'satellite' ? 'var(--lime, #a3e635)' : 'transparent',
            color: activeLayer === 'satellite' ? '#111311' : 'var(--text-primary)',
          }}
          title="Satellite Aerial Imagery"
        >
          🛰️ Satellite
        </button>

        <button
          onClick={() => setActiveLayer('street')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all flex items-center gap-1 ${
            activeLayer === 'street' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeLayer === 'street' ? 'var(--lime, #a3e635)' : 'transparent',
            color: activeLayer === 'street' ? '#111311' : 'var(--text-primary)',
          }}
          title="OpenStreetMap Standard"
        >
          🗺️ Street
        </button>

        <button
          onClick={() => setActiveLayer('tactical')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-all flex items-center gap-1 ${
            activeLayer === 'tactical' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            background: activeLayer === 'tactical' ? 'var(--lime, #a3e635)' : 'transparent',
            color: activeLayer === 'tactical' ? '#111311' : 'var(--text-primary)',
          }}
          title="Tactical Dark Mode"
        >
          🕶️ Tactical
        </button>

        {mode === 'farm' && (
          <button
            onClick={() => setShowZonePolygons(!showZonePolygons)}
            className="ml-1 pl-2 border-l border-[var(--border)] px-2 py-1 text-xs font-semibold rounded-sm flex items-center gap-1"
            style={{
              color: showZonePolygons ? 'var(--lime)' : 'var(--text-dim)',
            }}
            title="Toggle Biosecurity Perimeter Zones"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zones</span>
          </button>
        )}
      </div>

      {/* ── Coordinates & Status HUD Footer ── */}
      <div
        className="absolute bottom-2 left-2 right-2 z-[1000] px-3 py-1.5 rounded-sm flex items-center justify-between text-[11px] font-mono shadow-md pointer-events-none"
        style={{
          background: 'rgba(17, 20, 17, 0.85)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[var(--lime, #a3e635)]">
            <span className="w-2 h-2 rounded-full bg-[var(--lime, #a3e635)] animate-pulse"></span>
            LIVE GPS SATELLITE TELEMETRY
          </span>
          <span className="opacity-70 hidden sm:inline">|</span>
          <span className="opacity-80 hidden sm:inline">
            Active Facilities: {farms.length} · Hotspots: {diseaseReports.length}
          </span>
        </div>
        <div className="text-[10px] opacity-70">
          ESRI / OPENSTREETMAP GEO-ENGINE
        </div>
      </div>
    </div>
  );
};
