import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Shield,
  Clock,
  MapPin,
  CheckCircle,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Incident } from '../types';
import { api } from '../services/api';
import {
  formatDate,
  formatTimeAgo,
  getIncidentTypeConfig,
  getSeverityConfig,
  getStatusConfig,
  getDataSourceBadge,
} from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

interface IncidentsPageProps {
  onSelectIncident: (inc: Incident) => void;
  onOpenReportModal: () => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  onSelectIncident,
  onOpenReportModal,
}) => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidents({
        status: statusFilter === 'all' ? undefined : statusFilter,
        incident_type: typeFilter === 'all' ? undefined : typeFilter,
        severity: severityFilter === 'all' ? undefined : severityFilter,
        source_type: sourceFilter === 'all' ? undefined : sourceFilter,
        search: search.trim() || undefined,
        limit: 100,
      });
      setIncidents(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter, typeFilter, severityFilter, sourceFilter]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete incident #${id}?`)) return;
    try {
      await api.deleteIncident(id);
      setIncidents((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete incident');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Road Incident Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800">
              MODERATION PIPELINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track, verify, and resolve reported traffic impediments across urban sectors.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadIncidents}
            className="p-2.5 rounded-xl bg-panel border border-panel-border hover:border-slate-600 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-accent-primary hover:bg-accent-hover text-black transition-all shadow-md shadow-accent-primary/20 flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Hazard Report</span>
          </button>
        </div>
      </div>

      {/* Moderation Banner if user is Moderator or Admin */}
      {user && (user.role === 'moderator' || user.role === 'admin') && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-panel to-panel border border-blue-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-accent-primary flex-shrink-0" />
            <div>
              <span className="font-bold text-white">
                You have active {user.role.toUpperCase()} operational privileges.
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Click any incident below to inspect its audit trail or promote status to Confirmed / Resolved.
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
            MODERATOR MODE
          </span>
        </div>
      )}

      {/* Filter Matrix */}
      <div className="p-4 rounded-2xl bg-panel border border-panel-border space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Status */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Statuses</option>
              <option value="reported">Reported (Unverified)</option>
              <option value="under_review">Under Review</option>
              <option value="confirmed">Confirmed</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Category</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Categories</option>
              <option value="accident">Accident</option>
              <option value="roadwork">Roadwork</option>
              <option value="road_closure">Road Closure</option>
              <option value="breakdown">Vehicle Breakdown</option>
              <option value="waterlogging">Waterlogging</option>
              <option value="hazard">Road Hazard</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Data Source */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Data Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Sources</option>
              <option value="demo">Demo Data</option>
              <option value="user_reported">User Reported</option>
              <option value="verified_feed">Verified Feed</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadIncidents()}
                placeholder="Search road or title..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-panel-subtle border border-panel-border text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Incidents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {incidents.length === 0 ? (
          <div className="col-span-full py-16 text-center rounded-2xl bg-panel border border-panel-border space-y-2">
            <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No incident records found</p>
            <p className="text-xs text-slate-500">Try loosening your search query or status filter.</p>
          </div>
        ) : (
          incidents.map((inc) => {
            const typeCfg = getIncidentTypeConfig(inc.incident_type);
            const sevCfg = getSeverityConfig(inc.severity);
            const statusCfg = getStatusConfig(inc.status);
            const srcBadge = getDataSourceBadge(inc.source_type);

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="p-5 rounded-2xl bg-panel border border-panel-border hover:border-accent-primary/40 transition-all flex flex-col justify-between space-y-4 cursor-pointer group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeCfg.bg}`}>
                        {typeCfg.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sevCfg.badge}`}>
                        {sevCfg.label}
                      </span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${srcBadge.color}`}>
                      {srcBadge.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-accent-primary transition-colors leading-snug line-clamp-2">
                      {inc.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{inc.location_name}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {inc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-panel-border flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.badge}`}>
                      {statusCfg.label}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatTimeAgo(inc.reported_at)}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {user?.role === 'admin' && (
                      <button
                        onClick={(e) => handleDelete(inc.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete (Admin only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span className="text-[11px] font-semibold text-accent-primary group-hover:translate-x-0.5 transition-transform">
                      Inspect →
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
