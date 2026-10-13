import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  GitBranch,
  Navigation,
  Clock,
  Milestone,
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { RouteOption, SavedRoute, CoordinatePoint } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RouteComparisonPage: React.FC = () => {
  const { user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);

  // Preset location hubs for rapid evaluation
  const hubs: { name: string; point: CoordinatePoint }[] = [
    { name: 'Dayananda Sagar College (DSCE)', point: { lat: 12.9081, lng: 77.5658, name: 'DSCE Main Campus' } },
    { name: 'Silk Board Junction', point: { lat: 12.9172, lng: 77.6228, name: 'Silk Board Flyover' } },
    { name: 'Banashankari Metro Hub', point: { lat: 12.9255, lng: 77.5512, name: 'Banashankari Station' } },
    { name: 'Electronic City Tollgate', point: { lat: 12.8452, lng: 77.6602, name: 'E-City Phase 1' } },
    { name: 'MG Road Trinity Circle', point: { lat: 12.9734, lng: 77.6198, name: 'Trinity Circle CBD' } },
  ];

  const [origin, setOrigin] = useState<CoordinatePoint>(hubs[0].point);
  const [destination, setDestination] = useState<CoordinatePoint>(hubs[1].point);
  const [preference, setPreference] = useState<string>('fastest');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-primary');
  const [loading, setLoading] = useState<boolean>(false);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [12.915, 77.585],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap | RouteX Spatial',
      className: 'dark-tiles',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const polylinesLayer = L.layerGroup().addTo(map);
    polylinesLayerRef.current = polylinesLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleCompare = async () => {
    setLoading(true);
    setSaveSuccess(null);
    try {
      const res = await api.compareRoutes(origin, destination, preference);
      setRoutes(res.routes);
      if (res.routes.length > 0) {
        setSelectedRouteId(res.routes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCompare();
  }, []);

  // Update Route Polyline Layers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const polyLayer = polylinesLayerRef.current;
    if (!map || !polyLayer || routes.length === 0) return;

    polyLayer.clearLayers();

    // Add Origin Marker
    const startIcon = L.divIcon({
      html: `<div style="background:#22C55E; color:#000; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; border:2px solid #fff;">A</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker([origin.lat, origin.lng], { icon: startIcon })
      .bindTooltip(`Origin: ${origin.name || 'Start'}`)
      .addTo(polyLayer);

    // Add Destination Marker
    const destIcon = L.divIcon({
      html: `<div style="background:#EF4444; color:#fff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; border:2px solid #fff;">B</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker([destination.lat, destination.lng], { icon: destIcon })
      .bindTooltip(`Destination: ${destination.name || 'Destination'}`)
      .addTo(polyLayer);

    const latLngBounds = L.latLngBounds([
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ]);

    // Draw route polylines
    routes.forEach((r) => {
      const isSelected = r.id === selectedRouteId;
      const poly = L.polyline(r.coordinates as [number, number][], {
        color: isSelected ? '#38BDF8' : '#64748B',
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 0.95 : 0.45,
        dashArray: isSelected ? undefined : '5, 8',
      }).addTo(polyLayer);

      poly.on('click', () => setSelectedRouteId(r.id));
      latLngBounds.extend(poly.getBounds());
    });

    map.fitBounds(latLngBounds, { padding: [50, 50] });
  }, [routes, selectedRouteId]);

  const handleSaveRoute = async (r: RouteOption) => {
    if (!user) {
      alert('Please sign in to save preferred routes.');
      return;
    }
    try {
      await api.saveRoute({
        origin_name: origin.name || 'Origin',
        destination_name: destination.name || 'Destination',
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        dest_lat: destination.lat,
        dest_lng: destination.lng,
        distance_km: r.distance_km,
        duration_minutes: r.duration_minutes,
        route_data: JSON.stringify(r.coordinates),
      });
      setSaveSuccess(`Route "${r.name}" saved to your personal dashboard!`);
    } catch (err: any) {
      alert(err.message || 'Failed to save route');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Smart Route Comparison
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              DUAL PATHWAY ANALYSIS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compare arterial avenues against bypass corridors with live hazard proximity detection.
          </p>
        </div>
      </div>

      {/* Origin & Destination Configurator Card */}
      <div className="p-6 rounded-2xl bg-panel border border-panel-border shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Origin */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Origin Hub</span>
            </label>
            <select
              value={origin.name}
              onChange={(e) => {
                const found = hubs.find((h) => h.name === e.target.value);
                if (found) setOrigin(found.point);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
            >
              {hubs.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              <span>Destination Hub</span>
            </label>
            <select
              value={destination.name}
              onChange={(e) => {
                const found = hubs.find((h) => h.name === e.target.value);
                if (found) setDestination(found.point);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
            >
              {hubs.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preference */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Routing Strategy</label>
            <select
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
            >
              <option value="fastest">Fastest Travel Time</option>
              <option value="avoid_hazards">Avoid Hazards & Roadworks</option>
              <option value="shortest">Shortest Metric Distance</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-panel-border">
          <span className="text-[11px] text-slate-400 font-mono">
            Evaluating: {origin.name} → {destination.name}
          </span>
          <button
            onClick={handleCompare}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-accent-primary hover:bg-accent-hover text-black transition-all shadow-md shadow-accent-primary/20 flex items-center space-x-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{loading ? 'Calculating Paths...' : 'Recalculate Routes'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Main Comparison Area: Map + Route Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Details Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {routes.map((r, idx) => {
            const isSelected = r.id === selectedRouteId;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-panel-subtle/80 border-accent-primary shadow-xl shadow-accent-primary/10'
                    : 'bg-panel border-panel-border hover:border-slate-600 opacity-80'
                }`}
              >
                {r.is_recommended && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    RECOMMENDED
                  </span>
                )}

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-accent-primary font-mono">
                      OPTION {idx === 0 ? 'A' : 'B'}
                    </span>
                    <h3 className="text-base font-bold text-white leading-snug">{r.name}</h3>
                  </div>

                  {/* Distance and Estimated Time Metrics */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-panel/70 border border-panel-border text-center">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center space-x-1">
                        <Milestone className="w-3 h-3 text-sky-400" />
                        <span>Distance</span>
                      </div>
                      <div className="text-xl font-extrabold text-white mt-0.5">
                        {r.distance_km} <span className="text-xs font-normal text-slate-400">km</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Est. Duration</span>
                      </div>
                      <div className="text-xl font-extrabold text-white mt-0.5">
                        {r.duration_minutes} <span className="text-xs font-normal text-slate-400">min</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{r.summary}</p>

                  {/* Incidents near this route */}
                  {r.incidents_along_route && r.incidents_along_route.length > 0 ? (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{r.incidents_along_route.length} Active Hazard(s) Proximity:</span>
                      </div>
                      {r.incidents_along_route.map((inc) => (
                        <p key={inc.id} className="text-[11px] text-slate-300">
                          • {inc.title} ({inc.severity}) — ~{inc.distance_to_route_meters}m from corridor
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>No critical hazard proximity logged along this path.</span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">Src: {r.data_source}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveRoute(r);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-panel-subtle hover:bg-slate-800 text-slate-300 hover:text-white border border-panel-border transition-all flex items-center space-x-1"
                    >
                      <Bookmark className="w-3 h-3 text-accent-primary" />
                      <span>Save Route</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Transparent Notice */}
          <div className="p-4 rounded-xl bg-panel-subtle/50 border border-panel-border text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center space-x-1 font-semibold text-slate-300">
              <Info className="w-3.5 h-3.5 text-accent-primary" />
              <span>Route Intelligence Notice</span>
            </div>
            <p>
              Travel times are computed using geometric road network models and known incident proximity.
              If live traffic telemetry is unavailable, durations reflect average corridor velocities.
            </p>
          </div>
        </div>

        {/* Interactive Map Visualizer (7 cols) */}
        <div className="lg:col-span-7 h-[500px] lg:h-auto rounded-2xl border border-panel-border overflow-hidden relative shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full" />
          <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-panel/90 backdrop-blur-md border border-panel-border text-[11px] text-white font-mono shadow">
            Visualizing: {routes.find((r) => r.id === selectedRouteId)?.name || 'Selected Route'}
          </div>
        </div>
      </div>
    </div>
  );
};
