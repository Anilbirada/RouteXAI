import {
  User,
  Incident,
  IncidentStatusHistory,
  MapSummary,
  RouteCompareResponse,
  CoordinatePoint,
  SavedLocation,
  SavedRoute,
  NotificationItem,
  AnalyticsSummary,
  DataSourceLog,
  AuditLog,
} from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('routex_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('routex_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('routex_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMessage = `Request failed: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // Keep default
    }
    throw new Error(errMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // --- Auth ---
  login: async (creds: { email: string; password: string }) => {
    const data = await request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(creds),
    });
    setAuthToken(data.access_token);
    return data;
  },

  register: async (payload: { name: string; email: string; password: string }) => {
    const data = await request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(data.access_token);
    return data;
  },

  getMe: async () => {
    return request<User>('/auth/me');
  },

  logout: () => {
    removeAuthToken();
  },

  // --- Map ---
  getMapIncidents: async (params?: { include_resolved?: boolean; incident_type?: string; severity?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.include_resolved) searchParams.set('include_resolved', 'true');
    if (params?.incident_type) searchParams.set('incident_type', params.incident_type);
    if (params?.severity) searchParams.set('severity', params.severity);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<Incident[]>(`/map/incidents${query}`);
  },

  getMapSummary: async () => {
    return request<MapSummary>('/map/summary');
  },

  // --- Incidents ---
  getIncidents: async (filters?: {
    status?: string;
    incident_type?: string;
    severity?: string;
    source_type?: string;
    time_range?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (filters?.status) searchParams.set('status', filters.status);
    if (filters?.incident_type) searchParams.set('incident_type', filters.incident_type);
    if (filters?.severity) searchParams.set('severity', filters.severity);
    if (filters?.source_type) searchParams.set('source_type', filters.source_type);
    if (filters?.time_range) searchParams.set('time_range', filters.time_range);
    if (filters?.search) searchParams.set('search', filters.search);
    if (filters?.limit) searchParams.set('limit', filters.limit.toString());
    if (filters?.offset) searchParams.set('offset', filters.offset.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<Incident[]>(`/incidents${query}`);
  },

  getIncident: async (id: number) => {
    return request<Incident>(`/incidents/${id}`);
  },

  createIncident: async (payload: {
    title: string;
    incident_type: string;
    description: string;
    location_name: string;
    latitude: number;
    longitude: number;
    severity: string;
    image_url?: string;
  }) => {
    return request<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateIncidentStatus: async (id: number, status: string, change_reason?: string) => {
    return request<Incident>(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, change_reason }),
    });
  },

  getIncidentHistory: async (id: number) => {
    return request<IncidentStatusHistory[]>(`/incidents/${id}/history`);
  },

  deleteIncident: async (id: number) => {
    return request<void>(`/incidents/${id}`, { method: 'DELETE' });
  },

  // --- Routes ---
  compareRoutes: async (origin: CoordinatePoint, destination: CoordinatePoint, preference: string = 'fastest') => {
    return request<RouteCompareResponse>('/routes/compare', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, preference }),
    });
  },

  getSavedRoutes: async () => {
    return request<SavedRoute[]>('/routes/saved');
  },

  saveRoute: async (payload: {
    origin_name: string;
    destination_name: string;
    origin_lat: number;
    origin_lng: number;
    dest_lat: number;
    dest_lng: number;
    distance_km: number;
    duration_minutes: number;
    route_data: string;
  }) => {
    return request<SavedRoute>('/routes/saved', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteSavedRoute: async (id: number) => {
    return request<void>(`/routes/saved/${id}`, { method: 'DELETE' });
  },

  // --- Locations ---
  getSavedLocations: async () => {
    return request<SavedLocation[]>('/locations/saved');
  },

  saveLocation: async (payload: { name: string; address?: string; latitude: number; longitude: number }) => {
    return request<SavedLocation>('/locations/saved', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteSavedLocation: async (id: number) => {
    return request<void>(`/locations/saved/${id}`, { method: 'DELETE' });
  },

  // --- Analytics ---
  getAnalyticsSummary: async (timeRange: string = 'all') => {
    return request<AnalyticsSummary>(`/analytics/summary?time_range=${timeRange}`);
  },

  getExportUrl: (format: 'csv' | 'json') => {
    return `${API_BASE}/analytics/export?format=${format}`;
  },

  // --- Notifications ---
  getNotifications: async (unreadOnly: boolean = false) => {
    return request<NotificationItem[]>(`/notifications?unread_only=${unreadOnly}`);
  },

  markNotificationRead: async (id: number) => {
    return request<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  markAllNotificationsRead: async () => {
    return request<{ message: string }>('/notifications/mark-all-read', { method: 'POST' });
  },

  // --- Admin ---
  getAllUsers: async () => {
    return request<User[]>('/admin/users');
  },

  updateUserRole: async (userId: number, newRole: string) => {
    return request<User>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ new_role: newRole }),
    });
  },

  getDataSources: async () => {
    return request<DataSourceLog[]>('/admin/data-sources');
  },

  getAuditLogs: async () => {
    return request<AuditLog[]>('/admin/audit-logs');
  },

  resetDemoData: async () => {
    return request<{ message: string }>('/admin/reset-demo-data', { method: 'POST' });
  },
};
