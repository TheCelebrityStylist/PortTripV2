import { useEffect, useRef, useMemo, useState } from 'react';
import { MapPin, Utensils, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const PORT_COORDS = {
  'barcelona': [41.3805, 2.1719], 'santorini': [36.3932, 25.4615], 'dubrovnik': [42.6507, 18.0944],
  'kotor': [42.4247, 18.7712], 'venice': [45.4408, 12.3155], 'naples': [40.8358, 14.2487],
  'rome': [41.9028, 12.4964], 'genoa': [44.4056, 8.9463], 'palermo': [38.1157, 13.3615],
  'marseille': [43.2965, 5.3698], 'nice': [43.7102, 7.2620], 'alicante': [38.3452, -0.4810],
  'malaga': [36.7202, -4.4197], 'valencia': [39.4561, -0.3274], 'lisbon': [38.7223, -9.1393],
  'porto': [41.1579, -8.6291], 'athens': [37.9838, 23.7275], 'mykonos': [37.4467, 25.3289],
  'rhodes': [36.4349, 28.2176], 'corfu': [39.6243, 19.9217], 'istanbul': [41.0082, 28.9784],
  'kusadasi': [37.8573, 27.2601], 'valletta': [35.8997, 14.5146], 'bergen': [60.3913, 5.3221],
  'tromso': [69.6492, 18.9553], 'flam': [60.8635, 7.1190], 'copenhagen': [55.6761, 12.5683],
  'stockholm': [59.3293, 18.0686], 'amsterdam': [52.3676, 4.9041], 'reykjavik': [64.1355, -21.8954],
  'nassau': [25.0443, -77.3504], 'cozumel': [20.5009, -86.9496], 'barbados': [13.1939, -59.5432],
  'split': [43.5081, 16.4402], 'civitavecchia': [42.0933, 11.7956], 'livorno': [43.5482, 10.3105],
  'catania': [37.5079, 15.0830], 'messina': [38.1938, 15.5540], 'madeira': [32.6669, -16.9241],
  'cartagena': [37.6057, -0.9864], 'cadiz': [36.5348, -6.2994], 'bari': [41.1177, 16.8719],
  'bodrum': [37.0344, 27.4305], 'alesund': [62.4722, 6.1495], 'stockholm': [59.3293, 18.0686],
};

const LAYERS = [
  { key: 'all',       label: 'All',       icon: MapPin,    color: '#06b6d4' },
  { key: 'sights',    label: 'Must See',  icon: MapPin,    color: '#06b6d4' },
  { key: 'food',      label: 'Food',      icon: Utensils,  color: '#4ade80' },
  { key: 'safety',    label: 'Safety',    icon: Shield,    color: '#f59e0b' },
];

// Generate approximate POI positions around port coords
function generatePOIs(portCoords, port) {
  const pois = [];
  const [lat, lng] = portCoords;

  // Parse attraction highlights for names
  const sightNames = port?.attraction_highlights
    ? port.attraction_highlights.replace(/\*\*/g, '').match(/[A-Z][a-zA-Z\s]{4,30}(?=\s*[-—:])/g)?.slice(0, 6) || []
    : [];

  const foodNames = port?.local_food
    ? port.local_food.replace(/\*\*/g, '').match(/[A-Z][a-zA-Z\s]{3,25}(?=\s*[-—(])/g)?.slice(0, 4) || []
    : [];

  sightNames.forEach((name, i) => {
    const angle = (i / 6) * 2 * Math.PI;
    pois.push({
      id: `sight-${i}`, type: 'sights', label: name.trim(),
      lat: lat + Math.cos(angle) * (0.006 + i * 0.002),
      lng: lng + Math.sin(angle) * (0.008 + i * 0.002),
    });
  });

  foodNames.forEach((name, i) => {
    const angle = (i / 4) * 2 * Math.PI + 0.5;
    pois.push({
      id: `food-${i}`, type: 'food', label: name.trim(),
      lat: lat + Math.cos(angle) * 0.005,
      lng: lng + Math.sin(angle) * 0.007,
    });
  });

  // Safety zone marker
  if (port?.safety_security) {
    pois.push({ id: 'safety-1', type: 'safety', label: 'Tourist Police / Info', lat: lat + 0.003, lng: lng - 0.004 });
  }

  return pois;
}

function injectLeafletCSS() {
  if (document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css'; link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

export default function PortGuideMap({ port }) {
  const [activeLayer, setActiveLayer] = useState('all');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const portCoords = useMemo(() => {
    const key = port?.city?.toLowerCase();
    for (const [k, v] of Object.entries(PORT_COORDS)) {
      if (key?.includes(k) || k?.includes(key)) return v;
    }
    return [41.9028, 12.4964];
  }, [port?.city]);

  const pois = useMemo(() => generatePOIs(portCoords, port), [portCoords, port]);

  useEffect(() => {
    if (!mapRef.current) return;
    let L;

    const init = async () => {
      injectLeafletCSS();
      await new Promise(r => setTimeout(r, 80));
      L = (await import('leaflet')).default;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(portCoords, 14);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Port terminal
      const termIcon = L.divIcon({
        html: `<div style="background:#06b6d4;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(6,182,212,0.3),0 2px 8px rgba(0,0,0,0.6)"></div>`,
        iconSize: [22, 22], iconAnchor: [11, 11], className: '',
      });
      L.marker(portCoords, { icon: termIcon }).addTo(map)
        .bindPopup(`<div style="font-family:sans-serif;font-size:13px;font-weight:bold;color:#0f172a">🚢 ${port.city} Cruise Terminal</div>`);

      markersRef.current = [];
      pois.forEach(poi => {
        const layerCfg = LAYERS.find(l => l.key === poi.type) || LAYERS[0];
        const icon = L.divIcon({
          html: `<div style="background:${layerCfg.color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7], className: '',
        });
        const m = L.marker([poi.lat, poi.lng], { icon })
          .bindPopup(`<div style="font-family:sans-serif;font-size:12px;font-weight:bold;color:#0f172a">${poi.label}</div>`)
          .addTo(map);
        m._poiType = poi.type;
        markersRef.current.push(m);
      });
    };

    init();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, [port?.city]);

  // Layer toggle — show/hide markers
  useEffect(() => {
    markersRef.current.forEach(m => {
      const visible = activeLayer === 'all' || m._poiType === activeLayer;
      const el = m.getElement();
      if (el) el.style.display = visible ? '' : 'none';
    });
  }, [activeLayer]);

  return (
    <div className="rounded-2xl overflow-hidden border border-border/40">
      {/* Layer toggles */}
      <div className="flex items-center gap-2 px-4 py-3 bg-card/60 border-b border-border/30">
        {LAYERS.map(layer => {
          const Icon = layer.icon;
          return (
            <button key={layer.key} onClick={() => setActiveLayer(layer.key)}
              className={cn('flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all',
                activeLayer === layer.key
                  ? 'text-background border-transparent'
                  : 'border-border/40 text-muted-foreground hover:text-foreground'
              )}
              style={activeLayer === layer.key ? { background: layer.color, borderColor: layer.color } : {}}>
              <Icon className="w-3 h-3" />{layer.label}
            </button>
          );
        })}
        <span className="ml-auto text-[10px] text-muted-foreground">Indicative locations</span>
      </div>
      <div ref={mapRef} style={{ height: '380px', width: '100%' }} />
    </div>
  );
}