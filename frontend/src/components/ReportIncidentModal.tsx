import React, { useState } from 'react';
import { X, AlertTriangle, MapPin, Send, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Incident } from '../types';

interface ReportIncidentModalProps {
  onClose: () => void;
  onCreated: (inc: Incident) => void;
  initialCoords?: { lat: number; lng: number };
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  onClose,
  onCreated,
  initialCoords,
}) => {
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState('accident');
  const [locationName, setLocationName] = useState('Dayananda Sagar Main Road');
  const [latitude, setLatitude] = useState(initialCoords?.lat || 12.9081);
  const [longitude, setLongitude] = useState(initialCoords?.lng || 77.5658);
  const [severity, setSeverity] = useState('moderate');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick preset locations for rapid testing during live demonstration
  const locationPresets = [
    { name: 'DSCE Campus Approach', lat: 12.9081, lng: 77.5658 },
    { name: 'Silk Board Junction', lat: 12.9172, lng: 77.6228 },
    { name: 'Banashankari 3rd Stage', lat: 12.9255, lng: 77.5512 },
    { name: 'Kanakapura Metro Pillar', lat: 12.8954, lng: 77.5683 },
    { name: 'Outer Ring Road BTM', lat: 12.9140, lng: 77.6101 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and incident description.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.createIncident({
        title: title.trim(),
        incident_type: incidentType,
        location_name: locationName.trim(),
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
        severity,
        description: description.trim(),
      });
      onCreated(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit incident report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-panel border border-panel-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-panel-border bg-panel-subtle/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Report Road Hazard or Incident</h2>
              <p className="text-xs text-slate-400">Community submissions undergo moderation review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-panel-subtle transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-300 mb-1">Incident Headline / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken water pipe flooding left carriage-way"
              className="w-full px-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Incident Category</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="accident">Accident</option>
                <option value="roadwork">Roadwork / Construction</option>
                <option value="road_closure">Road Closure</option>
                <option value="breakdown">Vehicle Breakdown</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="hazard">Road Hazard / Debris</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Severity Assessment</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
              >
                <option value="low">Low (Passable with caution)</option>
                <option value="moderate">Moderate (Lane slowdown)</option>
                <option value="high">High (Major choke point)</option>
                <option value="critical">Critical (Impassable / Blocked)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Location / Roadway Name *</label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Kumaraswamy Layout Main Road"
              className="w-full px-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary"
            />
          </div>

          {/* Quick preset chips */}
          <div>
            <span className="text-[10px] text-slate-400 block mb-1 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-accent-primary" />
              <span>Demo Quick Location Presets:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {locationPresets.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => {
                    setLocationName(p.name);
                    setLatitude(p.lat);
                    setLongitude(p.lng);
                  }}
                  className="px-2 py-1 rounded bg-panel-subtle hover:bg-slate-800 text-[10px] text-slate-300 border border-panel-border transition-all"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white font-mono focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white font-mono focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Incident Description & Impact *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe lane blockages, safe passing distance, or hazards for fellow drivers..."
              className="w-full px-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-panel-subtle border border-panel-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-accent-primary hover:bg-accent-hover text-black transition-all flex items-center space-x-1.5 shadow-md shadow-accent-primary/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Submit Incident Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
