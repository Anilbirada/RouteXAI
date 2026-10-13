import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.models import Incident
from backend.app.schemas import MapIncidentOut, MapSummary

router = APIRouter(prefix="/api/map", tags=["Interactive Map"])

@router.get("/incidents", response_model=List[MapIncidentOut])
def get_map_incidents(
    include_resolved: bool = Query(False, description="Whether to include resolved incidents"),
    incident_type: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if not include_resolved:
        query = query.filter(Incident.status != "resolved", Incident.status != "rejected")
    if incident_type:
        query = query.filter(Incident.incident_type == incident_type.lower())
    if severity:
        query = query.filter(Incident.severity == severity.lower())

    incidents = query.order_by(desc(Incident.updated_at)).all()
    return [MapIncidentOut.model_validate(inc) for inc in incidents]

@router.get("/summary", response_model=MapSummary)
def get_map_summary(db: Session = Depends(get_db)):
    active_incidents = db.query(Incident).filter(Incident.status.in_(["reported", "under_review", "confirmed"])).count()
    closures = db.query(Incident).filter(
        Incident.incident_type == "road_closure",
        Incident.status.in_(["reported", "under_review", "confirmed"])
    ).count()
    high_critical = db.query(Incident).filter(
        Incident.severity.in_(["high", "critical"]),
        Incident.status.in_(["reported", "under_review", "confirmed"])
    ).count()

    demo_count = db.query(Incident).filter(Incident.source_type == "demo").count()
    total_count = db.query(Incident).count()
    is_demo_mode = (demo_count > 0 and (demo_count / total_count > 0.5)) if total_count > 0 else True

    freshness = "Simulated Demo Telemetry" if is_demo_mode else "Active Community & Network Reports"
    provider = "RouteX Spatial Engine & OpenStreetMap"

    return MapSummary(
        total_active_incidents=active_incidents,
        total_closures=closures,
        high_critical_incidents=high_critical,
        demo_mode_active=is_demo_mode,
        data_freshness_label=freshness,
        data_provider=provider,
        last_updated=datetime.datetime.utcnow()
    )
