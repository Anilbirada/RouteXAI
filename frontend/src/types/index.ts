export type IncidentType =
  | 'accident'
  | 'roadwork'
  | 'road_closure'
  | 'breakdown'
  | 'waterlogging'
  | 'hazard'
  | 'other';

export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';

export type IncidentStatus = 'reported' | 'under_review' | 'confirmed' | 'resolved' | 'rejected';

export type DataSourceType = 'demo' | 'user_reported' | 'verified_feed' | 'historical';

export type UserRole = 'public' | 'registered' | 'moderator' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface IncidentStatusHistory {
  id: number;
  incident_id: number;
  previous_status: string | null;
  new_status: string;
  changed_by: number | null;
  change_reason: string | null;
  changed_at: string;
  changer_name?: string;
}

export interface Incident {
  id: number;
  title: string;
  incident_type: IncidentType;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source_type: DataSourceType;
  image_url?: string | null;
  reported_by?: number | null;
  reporter_name?: string | null;
  verified_by?: number | null;
  verifier_name?: string | null;
  reported_at: string;
  updated_at: string;
  resolved_at?: string | null;
  history?: IncidentStatusHistory[];
}

export interface MapSummary {
  total_active_incidents: number;
  total_closures: number;
  high_critical_incidents: number;
  demo_mode_active: boolean;
  data_freshness_label: string;
  data_provider: string;
  last_updated: string;
}

export interface CoordinatePoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface RouteIncidentSummary {
  id: number;
  title: string;
  incident_type: string;
  severity: string;
  distance_to_route_meters: number;
}

export interface RouteOption {
  id: string;
  name: string;
  distance_km: number;
  duration_minutes: number;
  summary: string;
  coordinates: [number, number][];
  incidents_along_route: RouteIncidentSummary[];
  advisory: string;
  data_source: string;
  is_recommended: boolean;
}

export interface RouteCompareResponse {
  origin: CoordinatePoint;
  destination: CoordinatePoint;
  routes: RouteOption[];
  timestamp: string;
  notice: string;
}

export interface SavedLocation {
  id: number;
  name: string;
  address?: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface SavedRoute {
  id: number;
  origin_name: string;
  destination_name: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  distance_km: number;
  duration_minutes: number;
  route_data: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  related_incident_id?: number | null;
  created_at: string;
}

export interface TypeBreakdown {
  type: string;
  count: number;
  percentage: number;
}

export interface SeverityBreakdown {
  severity: string;
  count: number;
  percentage: number;
}

export interface TrendPoint {
  date: string;
  count: number;
  resolved_count: number;
}

export interface HotspotItem {
  location_name: string;
  incident_count: number;
  avg_severity: string;
  latitude: number;
  longitude: number;
}

export interface AnalyticsSummary {
  total_records: number;
  active_incidents: number;
  resolved_incidents: number;
  closures_count: number;
  by_type: TypeBreakdown[];
  by_severity: SeverityBreakdown[];
  by_status: Record<string, number>;
  trends_7d: TrendPoint[];
  hotspots: HotspotItem[];
  insights: string[];
  ai_summary: string;
  data_disclaimer: string;
}

export interface DataSourceLog {
  id: number;
  source_name: string;
  last_sync_at: string;
  sync_status: string;
  record_count: number;
  error_message?: string | null;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  user_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  details?: string | null;
  created_at: string;
}
