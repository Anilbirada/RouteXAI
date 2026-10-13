import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  AlertTriangle,
  MapPin,
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { AnalyticsSummary } from '../types';
import { api } from '../services/api';
import { getIncidentTypeConfig, getSeverityConfig } from '../utils/formatters';

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalyticsSummary(timeRange);
      setSummary(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const handleExport = (format: 'csv' | 'json') => {
    window.open(api.getExportUrl(format), '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Traffic Analytics & City Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800">
              AGGREGATED METRICS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data-driven patterns, category breakdown, corridor hotspots, and downloadable reports.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-panel hover:bg-slate-800 text-slate-200 border border-panel-border transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-panel hover:bg-slate-800 text-slate-200 border border-panel-border transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5 text-accent-primary" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Time Range Filter Bar */}
      <div className="p-3 rounded-2xl bg-panel border border-panel-border flex items-center space-x-2 text-xs">
        <span className="text-slate-400 font-semibold px-2">Time Horizon:</span>
        {[
          { id: '24h', label: 'Last 24 Hours' },
          { id: '7d', label: 'Last 7 Days' },
          { id: '30d', label: 'Last 30 Days' },
          { id: 'all', label: 'All Historic Records' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTimeRange(t.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              timeRange === t.id
                ? 'bg-accent-primary text-black font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* AI Smart Summary & Explainable Insights */}
      {summary && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-panel-subtle via-panel to-panel border border-accent-primary/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-accent-primary/20 text-accent-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">RouteX AI Synthesized Condition Report</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono border border-sky-800">
              SYNTHETIC SUMMARY
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-black/30 p-4 rounded-xl border border-panel-border">
            {summary.ai_summary}
          </p>

          <div className="space-y-1.5 pt-1">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Explainable Rule-Based Insights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {summary.insights.map((ins, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-panel-subtle/50 border border-panel-border/60 text-slate-300 flex items-start space-x-2"
                >
                  <span className="text-accent-primary font-bold">•</span>
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Statistical Breakdowns Grid */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breakdown by Incident Type */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-accent-primary" />
                <span>Incidents by Category</span>
              </h3>
              <span className="text-xs text-slate-400">{summary.total_records} Total</span>
            </div>

            <div className="space-y-3 pt-2">
              {summary.by_type.map((item) => {
                const cfg = getIncidentTypeConfig(item.type);
                return (
                  <div key={item.type} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">{cfg.label}</span>
                      <span className="font-mono text-slate-400">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-panel-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: cfg.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown by Severity */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Severity Distribution</span>
              </h3>
              <span className="text-xs text-slate-400">Prioritization</span>
            </div>

            <div className="space-y-3 pt-2">
              {summary.by_severity.map((item) => {
                const cfg = getSeverityConfig(item.severity);
                return (
                  <div key={item.severity} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300 capitalize">{item.severity}</span>
                      <span className="font-mono text-slate-400">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-panel-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: cfg.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>7-Day Volume Trend</span>
            </h3>

            <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-panel-border">
              {summary.trends_7d.map((tr) => {
                const heightPct = Math.min(100, Math.max(15, tr.count * 25));
                return (
                  <div key={tr.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="text-[10px] font-mono text-accent-primary font-bold">{tr.count}</div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-accent-secondary to-accent-primary transition-all hover:brightness-125"
                    />
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{tr.date}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Frequently Reported Hotspot Locations */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Frequently Reported Corridor Hotspots</span>
            </h3>

            <div className="space-y-2.5 pt-1 text-xs">
              {summary.hotspots.map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-panel-subtle border border-panel-border flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{h.location_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Coordinates: {h.latitude}, {h.longitude}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono font-bold text-xs">
                      {h.incident_count} reports
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transparency Disclaimer Card */}
      <div className="p-4 rounded-xl bg-panel-subtle/50 border border-panel-border flex items-start space-x-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
        <p className="leading-relaxed">
          {summary?.data_disclaimer ||
            'Demonstration data is simulated and does not represent current real-world traffic conditions.'}
        </p>
      </div>
    </div>
  );
};
