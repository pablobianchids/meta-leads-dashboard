import { useState, useMemo, useRef, useEffect } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre';
import { MapPin, Globe2 } from 'lucide-react';
import { number, currency } from '../utils/format';
import { useI18n } from '../hooks/useI18n';

// Centro neutro (mundo) usado apenas como fallback antes de fitBounds
const DEFAULT_CENTER = { longitude: -30, latitude: 0, zoom: 1.5 };

const SATELLITE_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: '© Esri'
    }
  },
  layers: [
    { id: 'satellite-base', type: 'raster', source: 'satellite' }
  ]
};


const HEATMAP_PAINT = {
  'heatmap-weight': ['interpolate', ['linear'], ['get', 'leads'], 0, 0, 200, 1],
  'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
  'heatmap-color': [
    'interpolate', ['linear'], ['heatmap-density'],
    0, 'rgba(0,0,0,0)',
    0.2, 'rgba(16,185,129,0.35)',
    0.5, 'rgba(16,185,129,0.65)',
    0.8, 'rgba(52,211,153,0.85)',
    1, 'rgba(110,231,183,1)'
  ],
  // Heatmap escala junto com o zoom para manter a "nuvem" de cor proporcional
  'heatmap-radius': [
    'interpolate', ['exponential', 2], ['zoom'],
    0, 10,
    4, 30,
    7, 90,
    10, 200
  ],
  'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.85, 9, 0.4]
};

const CIRCLE_PAINT = {
  // Círculo cresce com zoom + volume de leads, refletindo a área impactada
  'circle-radius': [
    'interpolate', ['exponential', 1.8], ['zoom'],
    3, ['interpolate', ['linear'], ['get', 'leads'], 0, 3, 200, 9],
    7, ['interpolate', ['linear'], ['get', 'leads'], 0, 8, 200, 22],
    10, ['interpolate', ['linear'], ['get', 'leads'], 0, 18, 200, 50]
  ],
  'circle-color': '#10B981',
  'circle-stroke-color': '#FFFFFF',
  'circle-stroke-width': 1.5,
  'circle-opacity': 0.85,
  'circle-blur': 0.25
};

export default function MapChart({ regions = [] }) {
  const [popup, setPopup] = useState(null);
  const mapRef = useRef(null);
  const { t } = useI18n();

  const geojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: regions.map(r => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: r.coords },
      properties: r
    }))
  }), [regions]);

  const totalRegions = regions.length;
  const totalLeads = regions.reduce((sum, r) => sum + r.leads, 0);

  // Re-centraliza o mapa sempre que o conjunto de regiões muda
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    if (regions.length === 0) {
      map.flyTo({ ...DEFAULT_CENTER, duration: 800, essential: true });
      return;
    }

    if (regions.length === 1) {
      map.flyTo({
        center: regions[0].coords,
        zoom: 9,
        duration: 1500,
        essential: true
      });
      return;
    }

    const lngs = regions.map(r => r.coords[0]);
    const lats = regions.map(r => r.coords[1]);
    const bounds = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    ];
    // padding/maxZoom permitem que regiões muito espalhadas (BR + US, p. ex.)
    // façam zoom out o suficiente para serem visualizadas todas juntas.
    map.fitBounds(bounds, { padding: 50, duration: 1500, maxZoom: 7 });
  }, [regions]);

  const handleClick = (e) => {
    const feature = e.features?.[0];
    if (!feature) return;
    const props = feature.properties;
    setPopup({
      lng: feature.geometry.coordinates[0],
      lat: feature.geometry.coordinates[1],
      ...props
    });
  };

  return (
    <div className="glass-strong overflow-hidden rounded-3xl h-[320px] relative max-h-[320px]">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        <div className="glass-strong flex items-center gap-2 px-3 py-1.5 rounded-lg">
          <Globe2 className="w-3.5 h-3.5 text-emerald" strokeWidth={2.5} />
          <span className="text-[11px] font-semibold tracking-wide uppercase text-white/70">
            {t('geographicCoverage')}
          </span>
        </div>
        {totalRegions > 0 && (
          <div className="glass-strong flex items-center gap-2 px-3 py-1.5 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-emerald" strokeWidth={2.5} />
            <span className="text-[10px] font-medium num text-white/70">
              {totalRegions} · {number(totalLeads)} leads
            </span>
          </div>
        )}
      </div>

      {regions.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="glass-strong px-4 py-2 text-[11px] text-white/60 text-center">
            {t('geoUnavailable')}
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={DEFAULT_CENTER}
        mapStyle={SATELLITE_STYLE}
        attributionControl={false}
        interactiveLayerIds={['leads-circles']}
        onClick={handleClick}
        cursor="default"
        maxZoom={11}
        minZoom={1}
      >

        <Source id="leads-data" type="geojson" data={geojson}>
          <Layer id="leads-heatmap" type="heatmap" paint={HEATMAP_PAINT} />
          <Layer id="leads-circles" type="circle" paint={CIRCLE_PAINT}
            minzoom={3} />
        </Source>

        {popup && (
          <Popup
            longitude={popup.lng}
            latitude={popup.lat}
            onClose={() => setPopup(null)}
            closeOnClick={false}
            anchor="bottom"
            offset={12}
          >
            <div className="font-sans">
              <p className="text-emerald text-[11px] font-bold uppercase tracking-wider mb-1.5">
                {popup.region}
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-6 text-xs">
                  <span className="text-white/50">{t('leads')}</span>
                  <span className="font-semibold num">{number(popup.leads)}</span>
                </div>
                <div className="flex items-center justify-between gap-6 text-xs">
                  <span className="text-white/50">{t('spend')}</span>
                  <span className="font-semibold num">{currency(popup.spend)}</span>
                </div>
                <div className="flex items-center justify-between gap-6 text-xs">
                  <span className="text-white/50">{t('cpl')}</span>
                  <span className="font-semibold num">
                    {popup.cpl > 0 ? currency(popup.cpl) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
