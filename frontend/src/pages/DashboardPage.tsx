import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Ban,
  ShieldCheck,
  Clock,
  Filter,
  Search,
  RefreshCw,
  MapPin,
  ExternalLink,
  CheckCircle,
  Eye,
  SlidersHorizontal,
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

interface DashboardPageProps {
  onSelectIncident: (inc: Incident) => void;
  onNavigateToMap: () => void;
  onOpenReportModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectIncident,
  onNavigateToMap,
  onOpenReportModal,
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getIncidents({
        time_range: timeRange,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search.trim() || undefined,
        limit: 100,
      });
      setIncidents(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange, statusFilter]);

  // Derived metrics from actual stored data
  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(
    (i) => i.status === 'reported' || i.status === 'under_review' || i.status === 'confirmed'
  ).length;
  const activeClosures = incidents.filter(
    (i) => i.incident_type === 'road_closure' && i.status !== 'resolved'
  ).length;
  const criticalCount = incidents.filter(
    (i) => (i.severity === 'critical' || i.severity === 'high') && i.status !== 'resolved'
  ).length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  const demoCount = incidents.filter((i) => i.source_type === 'demo').length;
  const userReportedCount = incidents.filter((i) => i.source_type === 'user_reported').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Traffic Monitoring Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              DEMO DATA TELEMETRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time status overview, corridor disruptions, and moderation queue.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-panel border border-panel-border hover:border-slate-600 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-accent-primary hover:bg-accent-hover text-black transition-all shadow-md shadow-accent-primary/20 flex items-center space-x-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-panel border border-panel-border space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">ACTIVE INCIDENTS</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{activeIncidents}</div>
          <p className="text-[11px] text-slate-400">
            {resolvedCount} resolved records cleared
          </p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-sky-500/5 rounded-full blur-xl" />
        </div>

        <div className="p-5 rounded-2xl bg-panel border border-panel-border space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">ROAD CLOSURES</span>
            <Ban className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400">{activeClosures}</div>
          <p className="text-[11px] text-slate-400">Requires route diversions</p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-red-500/5 rounded-full blur-xl" />
        </div>

        <div className="p-5 rounded-2xl bg-panel border border-panel-border space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">HIGH / CRITICAL</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{criticalCount}</div>
          <p className="text-[11px] text-slate-400">Elevated congestion risk</p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
        </div>

        <div className="p-5 rounded-2xl bg-panel border border-panel-border space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">DATABASE PROVENANCE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-white pt-1">
            {demoCount} Demo / {userReportedCount} User
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Explicit origin tags</p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-panel border border-panel-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Time range tabs */}
          <div className="flex items-center bg-panel-subtle p-1 rounded-xl border border-panel-border">
            {[
              { id: '24h', label: '24 Hours' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Records' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  timeRange === t.id
                    ? 'bg-accent-primary text-black font-semibold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-panel-subtle border border-panel-border text-white focus:outline-none focus:border-accent-primary"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported (Pending Review)</option>
            <option value="under_review">Under Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            placeholder="Search by title or road..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-panel-subtle border border-panel-border text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary"
          />
        </div>
      </div>

      {/* Incident Records Table */}
      <div className="rounded-2xl bg-panel border border-panel-border overflow-hidden shadow-xl">
        <div className="p-4 border-b border-panel-border flex items-center justify-between bg-panel-subtle/30">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Monitored Incident Feed ({incidents.length})
            </h3>
          </div>
          <button
            onClick={onNavigateToMap}
            className="text-xs font-semibold text-accent-primary hover:underline flex items-center space-x-1"
          >
            <span>View All on Map</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-panel-border text-slate-400 bg-panel-subtle/20 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Incident</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Data Source</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-border text-slate-300">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No traffic incidents match your selected filters.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => {
                  const typeCfg = getIncidentTypeConfig(inc.incident_type);
                  const sevCfg = getSeverityConfig(inc.severity);
                  const statusCfg = getStatusConfig(inc.status);
                  const srcBadge = getDataSourceBadge(inc.source_type);

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="hover:bg-panel-subtle/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-accent-primary transition-colors">
                          {inc.title}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-xs">{inc.location_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeCfg.bg}`}>
                          {typeCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sevCfg.badge}`}>
                          {sevCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${srcBadge.color}`}>
                          {srcBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {formatTimeAgo(inc.reported_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIncident(inc);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-panel-subtle hover:bg-slate-800 text-slate-300 hover:text-white border border-panel-border transition-all"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
