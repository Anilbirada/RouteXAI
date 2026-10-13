import { IncidentSeverity, IncidentStatus, IncidentType, DataSourceType } from '../types';

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return dateString;
  }
}

export function getIncidentTypeConfig(type: IncidentType | string) {
  switch (type.toLowerCase()) {
    case 'accident':
      return {
        label: 'Accident',
        color: '#EF4444',
        bg: 'bg-red-500/10 text-red-400 border-red-500/30',
        badge: 'Accident',
        icon: 'AlertTriangle',
      };
    case 'roadwork':
      return {
        label: 'Roadwork',
        color: '#F59E0B',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        badge: 'Roadwork',
        icon: 'Cone',
      };
    case 'road_closure':
      return {
        label: 'Road Closure',
        color: '#DC2626',
        bg: 'bg-red-600/15 text-red-300 border-red-500/40',
        badge: 'Closure',
        icon: 'Ban',
      };
    case 'breakdown':
      return {
        label: 'Breakdown',
        color: '#F97316',
        bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        badge: 'Breakdown',
        icon: 'Wrench',
      };
    case 'waterlogging':
      return {
        label: 'Waterlogging',
        color: '#38BDF8',
        bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        badge: 'Waterlogging',
        icon: 'CloudRain',
      };
    case 'hazard':
      return {
        label: 'Road Hazard',
        color: '#A855F7',
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        badge: 'Hazard',
        icon: 'ShieldAlert',
      };
    default:
      return {
        label: 'General Notice',
        color: '#94A3B8',
        bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
        badge: 'Notice',
        icon: 'Info',
      };
  }
}

export function getSeverityConfig(severity: IncidentSeverity | string) {
  switch (severity.toLowerCase()) {
    case 'critical':
      return {
        label: 'Critical',
        color: '#EF4444',
        badge: 'bg-red-950/60 text-red-300 border border-red-600/40',
      };
    case 'high':
      return {
        label: 'High',
        color: '#F97316',
        badge: 'bg-orange-950/60 text-orange-300 border border-orange-600/40',
      };
    case 'moderate':
      return {
        label: 'Moderate',
        color: '#F59E0B',
        badge: 'bg-amber-950/60 text-amber-300 border border-amber-600/40',
      };
    case 'low':
      return {
        label: 'Low',
        color: '#22C55E',
        badge: 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40',
      };
    default:
      return {
        label: severity,
        color: '#94A3B8',
        badge: 'bg-slate-800 text-slate-300 border border-slate-700',
      };
  }
}

export function getStatusConfig(status: IncidentStatus | string) {
  switch (status.toLowerCase()) {
    case 'reported':
      return {
        label: 'Reported',
        badge: 'bg-blue-950/60 text-blue-300 border border-blue-600/40',
        desc: 'Submitted by user, pending moderation check',
      };
    case 'under_review':
      return {
        label: 'Under Review',
        badge: 'bg-amber-950/60 text-amber-300 border border-amber-600/40',
        desc: 'Assigned to traffic ops officer for verification',
      };
    case 'confirmed':
      return {
        label: 'Confirmed',
        badge: 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40',
        desc: 'Verified by traffic moderator',
      };
    case 'resolved':
      return {
        label: 'Resolved',
        badge: 'bg-slate-800 text-slate-400 border border-slate-700 line-through',
        desc: 'Cleared from road network',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        badge: 'bg-rose-950/60 text-rose-400 border border-rose-800/40',
        desc: 'Invalid or duplicate report',
      };
    default:
      return {
        label: status,
        badge: 'bg-slate-800 text-slate-300 border border-slate-700',
        desc: status,
      };
  }
}

export function getDataSourceBadge(source: DataSourceType | string) {
  switch (source.toLowerCase()) {
    case 'demo':
      return {
        label: 'DEMO DATA',
        color: 'bg-purple-900/40 text-purple-300 border border-purple-500/40',
        tooltip: 'Simulated sample incident for demonstration purposes',
      };
    case 'user_reported':
      return {
        label: 'USER REPORTED',
        color: 'bg-cyan-900/40 text-cyan-300 border border-cyan-500/40',
        tooltip: 'Submitted by commuter; awaiting moderator review',
      };
    case 'verified_feed':
      return {
        label: 'VERIFIED FEED',
        color: 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40',
        tooltip: 'Official moderator or sensor network verified event',
      };
    case 'historical':
      return {
        label: 'HISTORICAL DATA',
        color: 'bg-slate-800 text-slate-300 border border-slate-700',
        tooltip: 'Historical archive record',
      };
    default:
      return {
        label: source.toUpperCase(),
        color: 'bg-slate-800 text-slate-300 border border-slate-700',
        tooltip: source,
      };
  }
}
