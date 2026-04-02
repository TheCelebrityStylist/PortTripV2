import { useEffect, useRef, useMemo } from 'react';
import { MapPin } from 'lucide-react';

const PORT_COORDS = {
  'alesund': [62.4722, 6.1495], 'molde': [62.7375, 7.1591], 'tromso': [69.6492, 18.9553],
  'alicante': [38.3452, -0.4810], 'barcelona': [41.3805, 2.1719], 'valencia': [39.4561, -0.3274],
  'malaga': [36.7202, -4.4197], 'madrid': [40.4168, -3.7038], 'bilbao': [43.2627, -2.9253],
  'marseille': [43.2965, 5.3698], 'nice': [43.7102, 7.2620], 'toulon': [43.1242, 5.9280],
  'genoa': [44.4056, 8.9463], 'rome': [41.9028, 12.4964], 'naples': [40.8358, 14.2487],
  'venice': [45.4408, 12.3155], 'bari': [41.1177, 16.8719], 'palermo': [38.1157, 13.3615],
  'athens': [37.9838, 23.7275], 'piraeus': [37.9426, 23.6461], 'santorini': [36.3932, 25.4615],
  'mykonos': [37.4467, 25.3289], 'corfu': [39.6243, 19.9217], 'rhodes': [36.4349, 28.2176],
  'dubrovnik': [42.6507, 18.0944], 'split': [43.5081, 16.4402], 'kotor': [42.4247, 18.7712],
  'istanbul': [41.0082, 28.9784], 'kusadasi': [37.8573, 27.2601], 'bodrum': [37.0344, 27.4305],
  'lisbon': [38.7223, -9.1393], 'porto': [41.1579, -8.6291], 'madeira': [32.6669, -16.9241],
  'amsterdam': [52.3676, 4.9041], 'rotterdam': [51.9225, 4.4792], 'bruges': [51.2093, 3.2247],
  'copenhagen': [55.6761, 12.5683], 'stockholm': [59.3293, 18.0686], 'oslo': [59.9139, 10.7522],
  'bergen': [60.3913, 5.3221], 'stavanger': [58.9700, 5.7331], 'flam': [60.8635, 7.1190],
  'reykjavik': [64.1355, -21.8954], 'southampton': [50.9097, -1.4044], 'dover': [51.1295, 1.3089],
  'miami': [25.7617, -80.1918], 'fort lauderdale': [26.1224, -80.1373],
  'nassau': [25.0443, -77.3504], 'cozumel': [20.5009, -86.9496],
  'st maarten': [18.0425, -63.0548], 'barbados': [13.1939, -59.5432],
  'singapore': [1.3521, 103.8198], 'hong kong': [22.3193, 114.1694],
  'sydney': [-33.8688, 151.2093], 'dubai': [25.2048, 55.2708],
  'valletta': [35.8997, 14.5146], 'malta': [35.8997, 14.5146],
  'civitavecchia': [42.0933, 11.7956], 'livorno': [43.5482, 10.3105],
  'messina': [38.1938, 15.5540], 'catania': [37.5079, 15.0830],
  'cartagena': [37.6057, -0.9864], 'cadiz': [36.5348, -6.2994],
};

function getCoords(city) {
  if (!city) return [41.9028, 12.4964];
  const key = city.toLowerCase();
  for (const [k, v] of Object.entries(PORT_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return [41.9028, 12.4964];
}

function injectLeafletCSS() {
  if (document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
}

export default function PortMap({ city, planBlocks = [], className = '' }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const portCoords = useMemo(() => getCoords(city), [city]);

  const stops = useMemo(() =>
    planBlocks.filter(b => b.block_type !== 'transit' && b.title).slice(0, 12),
    [planBlocks]
  );

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      injectLeafletCSS();
      // small delay to ensure CSS loads before map renders
      await new Promise(r => setTimeout(r, 80));

      const L = (await import('leaflet')).default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(portCoords, 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Port terminal marker
      const portIcon = L.divIcon({
        html: `<div style="background:#06b6d4;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(6,182,212,0.3),0 2px 8px rgba(0,0,0,0.5)"></div>`,
        iconSize: [20, 20], iconAnchor: [10, 10], className: '',
      });
      L.marker(portCoords, { icon: portIcon }).addTo(map)
        .bindPopup(`<div style="font-family:sans-serif;font-size:13px;font-weight:bold">🚢 ${city} Port Terminal</div>`);

      // Stop markers + route
      const routePoints = [portCoords];
      stops.forEach((block, i) => {
        const angle = (i / Math.max(stops.length, 1)) * 2 * Math.PI - Math.PI / 2;
        const radius = 0.007 + (i % 3) * 0.003;
        const pos = [portCoords[0] + Math.cos(angle) * radius, portCoords[1] + Math.sin(angle) * radius];
        routePoints.push(pos);

        const stopIcon = L.divIcon({
          html: `<div style="background:#1e293b;color:white;width:26px;height:26px;border-radius:50%;border:2.5px solid #64748b;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${i + 1}</div>`,
          iconSize: [26, 26], iconAnchor: [13, 13], className: '',
        });
        L.marker(pos, { icon: stopIcon }).addTo(map)
          .bindPopup(`<div style="font-family:sans-serif;font-size:13px;font-weight:bold">${block.title}</div>${block.subtitle ? `<div style="font-size:11px;color:#555;margin-top:2px">${block.subtitle}</div>` : ''}${block.location ? `<div style="font-size:10px;color:#888;margin-top:2px">📍 ${block.location}</div>` : ''}${block.cost_estimate > 0 ? `<div style="font-size:10px;color:#06b6d4;margin-top:2px">€${block.cost_estimate}</div>` : ''}`);
      });

      if (stops.length > 0) {
        routePoints.push(portCoords);
        L.polyline(routePoints, { color: '#06b6d4', weight: 2.5, opacity: 0.7, dashArray: '8,6' }).addTo(map);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city, stops.length]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border/40 ${className}`}>
      <div ref={mapRef} style={{ height: '440px', width: '100%' }} />
      <div className="absolute bottom-3 left-3 bg-background/95 backdrop-blur text-xs text-muted-foreground px-3 py-2 rounded-xl border border-border/40 flex items-center gap-2 shadow-lg z-[1000]">
        <MapPin className="w-3 h-3 text-accent" />
        <span className="font-bold text-foreground">{city}</span>
        <span>·</span>
        <span>{stops.length} stops plotted</span>
      </div>
    </div>
  );
}