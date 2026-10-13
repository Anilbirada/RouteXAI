import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field, field_validator

# --- User & Auth Schemas ---

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = "registered"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

# --- Incident Schemas ---

class IncidentBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    incident_type: str = Field(..., description="accident, roadwork, road_closure, breakdown, waterlogging, hazard, other")
    description: str = Field(..., min_length=5, max_length=2000)
    location_name: str = Field(..., min_length=2, max_length=200)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    severity: str = Field("moderate", description="low, moderate, high, critical")
    image_url: Optional[str] = None

    @field_validator("incident_type")
    def validate_type(cls, v):
        allowed = {"accident", "roadwork", "road_closure", "breakdown", "waterlogging", "hazard", "other"}
        if v.lower() not in allowed:
            raise ValueError(f"Invalid incident_type '{v}'. Allowed: {allowed}")
        return v.lower()

    @field_validator("severity")
    def validate_severity(cls, v):
        allowed = {"low", "moderate", "high", "critical"}
        if v.lower() not in allowed:
            raise ValueError(f"Invalid severity '{v}'. Allowed: {allowed}")
        return v.lower()

class IncidentCreate(IncidentBase):
    source_type: Optional[str] = "user_reported"

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location_name: Optional[str] = None
    severity: Optional[str] = None
    incident_type: Optional[str] = None
    image_url: Optional[str] = None

class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., description="reported, under_review, confirmed, resolved, rejected")
    change_reason: Optional[str] = Field(None, max_length=500)

    @field_validator("status")
    def validate_status(cls, v):
        allowed = {"reported", "under_review", "confirmed", "resolved", "rejected"}
        if v.lower() not in allowed:
            raise ValueError(f"Invalid status '{v}'. Allowed: {allowed}")
        return v.lower()

class IncidentStatusHistoryOut(BaseModel):
    id: int
    incident_id: int
    previous_status: Optional[str]
    new_status: str
    changed_by: Optional[int]
    change_reason: Optional[str]
    changed_at: datetime.datetime
    changer_name: Optional[str] = None

    class Config:
        from_attributes = True

class IncidentOut(IncidentBase):
    id: int
    status: str
    source_type: str
    reported_by: Optional[int] = None
    reporter_name: Optional[str] = None
    verified_by: Optional[int] = None
    verifier_name: Optional[str] = None
    reported_at: datetime.datetime
    updated_at: datetime.datetime
    resolved_at: Optional[datetime.datetime] = None
    history: List[IncidentStatusHistoryOut] = []

    class Config:
        from_attributes = True

# --- Map Schemas ---

class MapIncidentOut(BaseModel):
    id: int
    title: str
    incident_type: str
    description: str
    location_name: str
    latitude: float
    longitude: float
    severity: str
    status: str
    source_type: str
    reported_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class MapSummary(BaseModel):
    total_active_incidents: int
    total_closures: int
    high_critical_incidents: int
    demo_mode_active: bool
    data_freshness_label: str
    data_provider: str
    last_updated: datetime.datetime

# --- Routing Schemas ---

class CoordinatePoint(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0)
    lng: float = Field(..., ge=-180.0, le=180.0)
    name: Optional[str] = None

class RouteCompareRequest(BaseModel):
    origin: CoordinatePoint
    destination: CoordinatePoint
    preference: Optional[str] = "fastest"  # fastest, shortest, avoid_hazards

class RouteIncidentSummary(BaseModel):
    id: int
    title: str
    incident_type: str
    severity: str
    distance_to_route_meters: float

class RouteOption(BaseModel):
    id: str
    name: str
    distance_km: float
    duration_minutes: float
    summary: str
    coordinates: List[List[float]]  # [[lat, lng], ...]
    incidents_along_route: List[RouteIncidentSummary] = []
    advisory: str
    data_source: str
    is_recommended: bool = False

class RouteCompareResponse(BaseModel):
    origin: CoordinatePoint
    destination: CoordinatePoint
    routes: List[RouteOption]
    timestamp: datetime.datetime
    notice: str

class SavedRouteCreate(BaseModel):
    origin_name: str
    destination_name: str
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    distance_km: float
    duration_minutes: float
    route_data: str

class SavedRouteOut(BaseModel):
    id: int
    origin_name: str
    destination_name: str
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    distance_km: float
    duration_minutes: float
    route_data: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Saved Locations ---

class SavedLocationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    address: Optional[str] = None
    latitude: float
    longitude: float

class SavedLocationOut(SavedLocationCreate):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Notifications ---

class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    related_incident_id: Optional[int]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Analytics Schemas ---

class TypeBreakdown(BaseModel):
    type: str
    count: int
    percentage: float

class SeverityBreakdown(BaseModel):
    severity: str
    count: int
    percentage: float

class TrendPoint(BaseModel):
    date: str
    count: int
    resolved_count: int

class HotspotItem(BaseModel):
    location_name: str
    incident_count: int
    avg_severity: str
    latitude: float
    longitude: float

class AnalyticsSummary(BaseModel):
    total_records: int
    active_incidents: int
    resolved_incidents: int
    closures_count: int
    by_type: List[TypeBreakdown]
    by_severity: List[SeverityBreakdown]
    by_status: dict
    trends_7d: List[TrendPoint]
    hotspots: List[HotspotItem]
    insights: List[str]
    ai_summary: str
    data_disclaimer: str

# --- Admin Schemas ---

class DataSourceLogOut(BaseModel):
    id: int
    source_name: str
    last_sync_at: datetime.datetime
    sync_status: str
    record_count: int
    error_message: Optional[str]

    class Config:
        from_attributes = True

class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int]
    user_email: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[int]
    details: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True
