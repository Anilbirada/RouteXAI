import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Search,
  Filter,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Eye,
  Info,
  Maximize2,
  Navigation,
} from 'lucide-react';
import { Incident, MapSummary } from '../types';
import { api } from '../services/api';
import {
  formatDate,
  formatTimeAgo,
  getIncidentTypeConfig,
  getSeverityConfig,
  getStatusConfig,
  getDataSourceBadge,
} from '../utils/formatters';

interface TrafficMapPageProps {
  onSelectIncident: (inc: Incident) => void;
  onOpenReportModalWithCoords: (coords: { lat: number; lng: number }) => void;
}

export const TrafficMapPage: React.FC<TrafficMapPageProps> = ({
  onSelectIncident,
  onOpenReportModalWithCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [summary, setSummary] = useState<MapSummary | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  // Layer toggles
  const [showIncidents, setShowIncidents] = useState(true);
  const [showClosures, setShowClosures] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick jump locations (Bengaluru focus centered around Dayananda Sagar College of Engineering)
  const quickLocations = [
    { name: 'Dayananda Sagar College (DSCE)', lat: 12.9081, lng: 77.5658 },
    { name: 'Silk Board Flyover', lat: 12.9172, lng: 77.6228 },
    { name: 'Banashankari Underpass', lat: 12.9255, lng: 77.5512 },
    { name: 'Kanakapura Corridor', lat: 12.8954, lng: 77.5683 },
    { name: 'South End Circle', lat: 12.9372, lng: 77.5768 },
  ];

  // Fetch incidents & summary
  const fetchData = async () => {
    setLoading(true);
    try {
      const [incs, sum] = await Promise.all([
        api.getIncidents({
          time_range: 'all',
          limit: 100,
        }),
        api.getMapSummary(),
      ]);
      setIncidents(incs);
      setSummary(sum);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center map around Dayananda Sagar / South Bangalore (12.915, 77.585)
    const map = L.map(mapContainerRef.current, {
      center: [12.915, 77.585],
      zoom: 13,
      zoomControl: false,
    });

    // Custom OpenStreetMap tile layer with attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | RouteX AI',
      className: 'dark-tiles',
    }).addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create Layer Groups
    const markersLayer = L.layerGroup().addTo(map);
    const hotspotsLayer = L.layerGroup().addTo(map);

    markersLayerRef.current = markersLayer;
    hotspotsLayerRef.current = hotspotsLayer;
    mapInstanceRef.current = map;

    // Right-click on map to report incident at exact location
    map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      onOpenReportModalWithCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers on Map when filters or incidents change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const hotspotsLayer = hotspotsLayerRef.current;
    if (!map || !markersLayer || !hotspotsLayer) return;

    markersLayer.clearLayers();
    hotspotsLayer.clearLayers();

    const filtered = incidents.filter((inc) => {
      if (!includeResolved && (inc.status === 'resolved' || inc.status === 'rejected')) {
        return false;
      }
      if (typeFilter !== 'all' && inc.incident_type !== typeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          inc.title.toLowerCase().includes(query) ||
          inc.location_name.toLowerCase().includes(query)
        );
      }
      return true;
    });

    filtered.forEach((inc) => {
      const typeCfg = getIncidentTypeConfig(inc.incident_type);
      const isClosure = inc.incident_type === 'road_closure';

      if (isClosure && !showClosures) return;
      if (!isClosure && !showIncidents) return;

      // Custom HTML Pin Marker
      const markerHtml = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${typeCfg.color}; opacity: 0.25;" class="${inc.severity === 'critical' ? 'animate-ping-slow' : ''}"></div>
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #111827; border: 2px solid ${typeCfg.color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${typeCfg.color};"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-traffic-pin',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      marker.on('click', () => {
        setSelectedIncident(inc);
      });

      marker.bindTooltip(
        `<strong>${inc.title}</strong><br/><span style="color:${typeCfg.color}; font-size: 11px;">${typeCfg.label} • ${inc.severity.toUpperCase()}</span>`,
        { direction: 'top', offset: [0, -10] }
      );

      markersLayer.addLayer(marker);

      // Hotspot circle visualization
      if (showHotspots && (inc.severity === 'critical' || inc.severity === 'high')) {
        const halo = L.circle([inc.latitude, inc.longitude], {
          radius: inc.severity === 'critical' ? 380 : 220,
          color: typeCfg.color,
          fillColor: typeCfg.color,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4',
        });
        hotspotsLayer.addLayer(halo);
      }
    });
  }, [incidents, showIncidents, showClosures, showHotspots, includeResolved, typeFilter, searchQuery]);

  const handleJumpToLocation = (loc: { lat: number; lng: number }) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 15, { duration: 1.2 });
    }
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full flex flex-col overflow-hidden bg-background">
      {/* Top HUD Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left Side: Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-panel/90 backdrop-blur-md border border-panel-border shadow-lg flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-white">Active Alerts:</span>
            <span className="text-accent-primary font-mono font-bold">
              {summary?.total_active_incidents ?? incidents.length}
            </span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-panel/90 backdrop-blur-md border border-panel-border shadow-lg flex items-center space-x-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-bold text-white">Road Closures:</span>
            <span className="text-amber-400 font-mono font-bold">{summary?.total_closures ?? 1}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-panel/90 backdrop-blur-md border border-panel-border shadow-lg flex items-center space-x-1.5 text-xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-950 text-purple-300 border border-purple-800">
              {summary?.data_freshness_label ?? 'DEMO DATA'}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Jumps & Layer Control Toggle */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Quick Corridor Selector */}
          <div className="hidden lg:flex items-center space-x-1 bg-panel/90 backdrop-blur-md border border-panel-border rounded-xl p-1 shadow-lg text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold px-2">Focus:</span>
            {quickLocations.slice(0, 3).map((loc) => (
              <button
                key={loc.name}
                onClick={() => handleJumpToLocation(loc)}
                className="px-2.5 py-1 rounded-lg hover:bg-panel-subtle text-slate-300 hover:text-white transition-all text-xs"
              >
                {loc.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([12.915, 77.585], 13);
              }
            }}
            className="p-2 rounded-xl bg-panel/90 backdrop-blur-md border border-panel-border hover:border-slate-600 text-slate-300 hover:text-white shadow-lg transition-all"
            title="Reset Map View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Left Layer Control Panel */}
        <div className="absolute bottom-6 left-4 z-20 w-72 rounded-2xl bg-panel/90 backdrop-blur-md border border-panel-border shadow-2xl p-4 space-y-3.5 pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-panel-border">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-accent-primary" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Map Layers & Filter</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">OSM Engine</span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search corridor or title..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-panel-subtle border border-panel-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary"
            />
          </div>

          {/* Type Filter Select */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Filter by Incident Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-panel-subtle border border-panel-border text-xs text-white focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Incident Types</option>
              <option value="accident">Accidents Only</option>
              <option value="roadwork">Roadworks Only</option>
              <option value="road_closure">Road Closures</option>
              <option value="breakdown">Vehicle Breakdowns</option>
              <option value="waterlogging">Waterlogging</option>
              <option value="hazard">Road Hazards</option>
            </select>
          </div>

          {/* Layer Checkboxes */}
          <div className="space-y-2 pt-1 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Traffic Incidents</span>
              <input
                type="checkbox"
                checked={showIncidents}
                onChange={(e) => setShowIncidents(e.target.checked)}
                className="rounded bg-panel border-panel-border text-accent-primary focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Road Closures</span>
              <input
                type="checkbox"
                checked={showClosures}
                onChange={(e) => setShowClosures(e.target.checked)}
                className="rounded bg-panel border-panel-border text-accent-primary focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Congestion Hotspot Halos</span>
              <input
                type="checkbox"
                checked={showHotspots}
                onChange={(e) => setShowHotspots(e.target.checked)}
                className="rounded bg-panel border-panel-border text-accent-primary focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Include Resolved</span>
              <input
                type="checkbox"
                checked={includeResolved}
                onChange={(e) => setIncludeResolved(e.target.checked)}
                className="rounded bg-panel border-panel-border text-accent-primary focus:ring-0"
              />
            </label>
          </div>

          <div className="pt-1 text-[10px] text-slate-400 border-t border-panel-border flex items-center justify-between">
            <span>Tip: Right-click map to report hazard</span>
          </div>
        </div>

        {/* Selected Incident Drawer (Right Side) */}
        {selectedIncident && (
          <div className="absolute top-20 right-4 z-20 w-80 sm:w-96 rounded-2xl bg-panel/95 backdrop-blur-md border border-panel-border shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-right-4 pointer-events-auto">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      getIncidentTypeConfig(selectedIncident.incident_type).bg
                    }`}
                  >
                    {getIncidentTypeConfig(selectedIncident.incident_type).label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      getSeverityConfig(selectedIncident.severity).badge
                    }`}
                  >
                    {getSeverityConfig(selectedIncident.severity).label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      getDataSourceBadge(selectedIncident.source_type).color
                    }`}
                  >
                    {getDataSourceBadge(selectedIncident.source_type).label}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">{selectedIncident.title}</h4>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                <span className="truncate">{selectedIncident.location_name}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed bg-panel-subtle/50 p-2.5 rounded-lg border border-panel-border">
                {selectedIncident.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-panel-subtle/40 border border-panel-border">
              <div>
                <span className="text-slate-400 block text-[10px]">Status</span>
                <span className="font-semibold text-white capitalize">{selectedIncident.status.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Reported</span>
                <span className="font-semibold text-white">{formatTimeAgo(selectedIncident.reported_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onSelectIncident(selectedIncident)}
                className="flex-1 py-2 rounded-lg text-xs font-bold bg-accent-primary hover:bg-accent-hover text-black transition-all flex items-center justify-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Details & Audit</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
