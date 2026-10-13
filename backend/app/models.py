import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="registered", nullable=False)  # 'public', 'registered', 'moderator', 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    reported_incidents = relationship("Incident", back_populates="reporter", foreign_keys="Incident.reported_by")
    verified_incidents = relationship("Incident", back_populates="verifier", foreign_keys="Incident.verified_by")
    saved_locations = relationship("SavedLocation", back_populates="user", cascade="all, delete-orphan")
    saved_routes = relationship("SavedRoute", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    incident_type = Column(String(50), index=True, nullable=False)  # accident, roadwork, road_closure, breakdown, waterlogging, hazard, other
    description = Column(Text, nullable=False)
    location_name = Column(String(200), nullable=False, default="Urban Corridor")
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    severity = Column(String(50), default="moderate", index=True, nullable=False)  # low, moderate, high, critical
    status = Column(String(50), default="reported", index=True, nullable=False)  # reported, under_review, confirmed, resolved, rejected
    source_type = Column(String(50), default="demo", index=True, nullable=False)  # demo, user_reported, verified_feed, historical
    image_url = Column(String(500), nullable=True)

    reported_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    reported_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    reporter = relationship("User", foreign_keys=[reported_by], back_populates="reported_incidents")
    verifier = relationship("User", foreign_keys=[verified_by], back_populates="verified_incidents")
    history = relationship("IncidentStatusHistory", back_populates="incident", cascade="all, delete-orphan", order_by="desc(IncidentStatusHistory.changed_at)")

class IncidentStatusHistory(Base):
    __tablename__ = "incident_status_history"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    change_reason = Column(String(500), nullable=True)
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="history")
    changer = relationship("User")

class SavedLocation(Base):
    __tablename__ = "saved_locations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_locations")

class SavedRoute(Base):
    __tablename__ = "saved_routes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    origin_name = Column(String(200), nullable=False)
    destination_name = Column(String(200), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lng = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    duration_minutes = Column(Float, nullable=False)
    route_data = Column(Text, nullable=False)  # JSON representation of geometry/steps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="saved_routes")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)  # null = broadcast
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="system")  # incident_created, status_changed, closure_alert, system
    is_read = Column(Boolean, default=False, index=True)
    related_incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="notifications")
    incident = relationship("Incident")

class DataSourceLog(Base):
    __tablename__ = "data_source_logs"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), nullable=False)  # e.g., 'OpenStreetMap Tiles', 'OSRM Routing Engine', 'Simulated Traffic Engine'
    last_sync_at = Column(DateTime, default=datetime.datetime.utcnow)
    sync_status = Column(String(50), default="active")  # active, degraded, offline, demo
    record_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
