import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  User,
  History,
  Check,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Incident, IncidentStatus } from '../types';
import {
  formatDate,
  formatTimeAgo,
  getIncidentTypeConfig,
  getSeverityConfig,
  getStatusConfig,
  getDataSourceBadge,
} from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
  onUpdated: (updated: Incident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onUpdated,
}) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>(incident.status);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const typeConfig = getIncidentTypeConfig(incident.incident_type);
  const sevConfig = getSeverityConfig(incident.severity);
  const statusConfig = getStatusConfig(incident.status);
  const sourceBadge = getDataSourceBadge(incident.source_type);

  const canModerate = user && (user.role === 'moderator' || user.role === 'admin');

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.updateIncidentStatus(
        incident.id,
        newStatus,
        reason || `Status updated to ${newStatus} by ${user?.name || 'Moderator'}`
      );
      onUpdated(res);
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to update incident status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-panel border border-panel-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-panel-border bg-panel-subtle/40">
          <div className="space-y-1.5 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeConfig.bg}`}>
                {typeConfig.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${sevConfig.badge}`}>
                {sevConfig.label}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig.badge}`}>
                {statusConfig.label}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${sourceBadge.color}`} title={sourceBadge.tooltip}>
                {sourceBadge.label}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{incident.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-panel-subtle transition-all flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Location & Metadata card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-panel-subtle/60 border border-panel-border text-xs">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-400 font-medium">Location</p>
                <p className="text-white font-semibold">{incident.location_name}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Clock className="w-4 h-4 text-accent-secondary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-400 font-medium">Logged & Updated</p>
                <p className="text-white font-semibold">Reported: {formatTimeAgo(incident.reported_at)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(incident.reported_at)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <User className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-400 font-medium">Reporter</p>
                <p className="text-white font-semibold">{incident.reporter_name || 'Community Commuter'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-400 font-medium">Verification Status</p>
                <p className="text-white font-semibold">
                  {incident.verifier_name ? `Verified by ${incident.verifier_name}` : 'Awaiting Moderator Check'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Hazard Description</h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-panel-subtle/30 p-3.5 rounded-xl border border-panel-border/60">
              {incident.description}
            </p>
          </div>

          {/* Moderator Action Panel (RBAC protected) */}
          {canModerate ? (
            <div className="p-4 rounded-xl bg-gradient-to-br from-panel-subtle to-panel border border-accent-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-accent-primary uppercase tracking-wider flex items-center space-x-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Traffic Ops Verification Control (Moderator Access)</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Role: {user.role}</span>
              </div>
              <p className="text-xs text-slate-400">
                Update the official operational state of this incident. Changes are logged to the audit history.
              </p>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Change Reason / Moderator Notes (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Field inspection confirmed, lane clearance completed"
                  className="w-full px-3 py-2 rounded-lg bg-panel border border-panel-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {incident.status !== 'confirmed' && (
                  <button
                    disabled={submitting}
                    onClick={() => handleStatusChange('confirmed')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-all flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Incident</span>
                  </button>
                )}

                {incident.status !== 'under_review' && (
                  <button
                    disabled={submitting}
                    onClick={() => handleStatusChange('under_review')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/20 text-amber-300 border border-amber-500/40 hover:bg-amber-600/30 transition-all flex items-center space-x-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark Under Review</span>
                  </button>
                )}

                {incident.status !== 'resolved' && (
                  <button
                    disabled={submitting}
                    onClick={() => handleStatusChange('resolved')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 transition-all flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                )}

                {incident.status !== 'rejected' && (
                  <button
                    disabled={submitting}
                    onClick={() => handleStatusChange('rejected')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 transition-all flex items-center space-x-1"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>Reject / Duplicate</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-panel-subtle/40 border border-panel-border text-xs text-slate-400 flex items-center justify-between">
              <span>Status modifications require <strong>Traffic Moderator</strong> permissions.</span>
              <span className="text-[10px] text-accent-primary">Switch role in top right menu to test</span>
            </div>
          )}

          {/* Status Change History Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <History className="w-4 h-4 text-accent-primary" />
              <span>Incident Lifecycle History</span>
            </h4>

            <div className="space-y-2.5">
              {incident.history && incident.history.length > 0 ? (
                incident.history.map((h, idx) => (
                  <div
                    key={h.id || idx}
                    className="relative pl-6 pb-2 border-l border-panel-border last:border-l-0"
                  >
                    <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-accent-primary ring-4 ring-panel" />
                    <div className="text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white capitalize">{h.new_status.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-400">• {formatDate(h.changed_at)}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {h.change_reason || 'Status update logged'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">By: {h.changer_name || 'System'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No status transitions recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-panel-border bg-panel-subtle/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-panel-subtle border border-panel-border"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
