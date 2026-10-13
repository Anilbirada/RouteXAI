import io
import csv
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from backend.app.database import get_db
from backend.app.models import Incident
from backend.app.schemas import (
    AnalyticsSummary, TypeBreakdown, SeverityBreakdown, TrendPoint, HotspotItem
)
from backend.app.services.insights import generate_rule_based_insights
from backend.app.seed_data import DEMO_DISCLAIMER_TEXT

router = APIRouter(prefix="/api/analytics", tags=["Traffic Analytics"])

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    time_range: Optional[str] = "all",  # 24h, 7d, 30d, all
    db: Session = Depends(get_db)
):
    query = db.query(Incident)

    now = datetime.datetime.utcnow()
    if time_range == "24h":
        query = query.filter(Incident.reported_at >= now - datetime.timedelta(hours=24))
    elif time_range == "7d":
        query = query.filter(Incident.reported_at >= now - datetime.timedelta(days=7))
    elif time_range == "30d":
        query = query.filter(Incident.reported_at >= now - datetime.timedelta(days=30))

    total = query.count()
    active = query.filter(Incident.status.in_(["reported", "under_review", "confirmed"])).count()
    resolved = query.filter(Incident.status == "resolved").count()
    closures = query.filter(Incident.incident_type == "road_closure").count()

    # Breakdown by type
    type_counts = query.with_entities(Incident.incident_type, func.count(Incident.id)).group_by(Incident.incident_type).all()
    by_type = [
        TypeBreakdown(
            type=t[0],
            count=t[1],
            percentage=round((t[1] / total * 100), 1) if total > 0 else 0.0
        )
        for t in type_counts
    ]

    # Breakdown by severity
    sev_counts = query.with_entities(Incident.severity, func.count(Incident.id)).group_by(Incident.severity).all()
    by_severity = [
        SeverityBreakdown(
            severity=s[0],
            count=s[1],
            percentage=round((s[1] / total * 100), 1) if total > 0 else 0.0
        )
        for s in sev_counts
    ]

    # Status distribution
    status_counts = query.with_entities(Incident.status, func.count(Incident.id)).group_by(Incident.status).all()
    by_status = {st[0]: st[1] for st in status_counts}

    # 7-day trend
    trends: List[TrendPoint] = []
    for d in range(6, -1, -1):
        day_date = (now - datetime.timedelta(days=d)).date()
        day_start = datetime.datetime.combine(day_date, datetime.time.min)
        day_end = datetime.datetime.combine(day_date, datetime.time.max)

        day_total = db.query(Incident).filter(Incident.reported_at >= day_start, Incident.reported_at <= day_end).count()
        day_res = db.query(Incident).filter(Incident.resolved_at >= day_start, Incident.resolved_at <= day_end).count()

        trends.append(TrendPoint(
            date=day_date.strftime("%b %d"),
            count=day_total,
            resolved_count=day_res
        ))

    # Hotspots (top 5 locations with coordinates)
    hotspot_rows = (
        db.query(
            Incident.location_name,
            func.count(Incident.id).label("cnt"),
            func.avg(Incident.latitude).label("avg_lat"),
            func.avg(Incident.longitude).label("avg_lng")
        )
        .group_by(Incident.location_name)
        .order_by(desc("cnt"))
        .limit(5)
        .all()
    )

    hotspots = [
        HotspotItem(
            location_name=h[0],
            incident_count=h[1],
            avg_severity="Moderate",
            latitude=round(float(h[2]), 5) if h[2] else 12.9716,
            longitude=round(float(h[3]), 5) if h[3] else 77.5946
        )
        for h in hotspot_rows
    ]

    insights, ai_summary = generate_rule_based_insights(db, days=7 if time_range in ["7d", "all"] else 1)

    return AnalyticsSummary(
        total_records=total,
        active_incidents=active,
        resolved_incidents=resolved,
        closures_count=closures,
        by_type=by_type,
        by_severity=by_severity,
        by_status=by_status,
        trends_7d=trends,
        hotspots=hotspots,
        insights=insights,
        ai_summary=ai_summary,
        data_disclaimer=DEMO_DISCLAIMER_TEXT
    )

@router.get("/export")
def export_incidents(
    format: str = Query("csv", pattern="^(csv|json)$"),
    db: Session = Depends(get_db)
):
    incidents = db.query(Incident).order_by(desc(Incident.reported_at)).all()

    if format == "json":
        data = [
            {
                "id": inc.id,
                "title": inc.title,
                "type": inc.incident_type,
                "severity": inc.severity,
                "status": inc.status,
                "location": inc.location_name,
                "latitude": inc.latitude,
                "longitude": inc.longitude,
                "source": inc.source_type,
                "reported_at": inc.reported_at.isoformat() if inc.reported_at else None,
                "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None
            }
            for inc in incidents
        ]
        return data

    # CSV Export
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Type", "Severity", "Status", "Location", "Latitude", "Longitude", "Source", "Reported At", "Resolved At"])
    for inc in incidents:
        writer.writerow([
            inc.id,
            inc.title,
            inc.incident_type,
            inc.severity,
            inc.status,
            inc.location_name,
            inc.latitude,
            inc.longitude,
            inc.source_type,
            inc.reported_at.isoformat() if inc.reported_at else "",
            inc.resolved_at.isoformat() if inc.resolved_at else ""
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=routex_traffic_incidents.csv"}
    )
