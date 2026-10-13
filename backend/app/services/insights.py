import datetime
from typing import List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models import Incident

def generate_rule_based_insights(db: Session, days: int = 7) -> tuple[List[str], str]:
    now = datetime.datetime.utcnow()
    since = now - datetime.timedelta(days=days)

    total_incidents = db.query(Incident).count()
    active_incidents = db.query(Incident).filter(Incident.status.in_(["reported", "under_review", "confirmed"])).count()
    recent_incidents = db.query(Incident).filter(Incident.reported_at >= since).count()
    closures = db.query(Incident).filter(Incident.incident_type == "road_closure", Incident.status != "resolved").count()
    high_critical = db.query(Incident).filter(Incident.severity.in_(["high", "critical"]), Incident.status != "resolved").count()

    # Most frequent type
    type_counts = db.query(Incident.incident_type, func.count(Incident.id)).group_by(Incident.incident_type).all()
    top_type = max(type_counts, key=lambda x: x[1]) if type_counts else ("none", 0)
    top_type_pct = round((top_type[1] / total_incidents * 100), 1) if total_incidents > 0 else 0

    # Top hotspot location
    loc_counts = db.query(Incident.location_name, func.count(Incident.id)).group_by(Incident.location_name).order_by(func.count(Incident.id).desc()).limit(3).all()
    top_loc = loc_counts[0] if loc_counts else ("Central Corridor", 0)

    insights: List[str] = []

    if recent_incidents > 0:
        insights.append(f"{recent_incidents} road incident(s) were logged across monitored zones during the past {days} days.")
    else:
        insights.append(f"Zero new incidents recorded in the monitored database over the past {days} days.")

    if total_incidents > 0:
        insights.append(f"{top_type[0].replace('_', ' ').title()}s represent {top_type_pct}% of all logged incidents in this intelligence database.")

    if closures > 0:
        insights.append(f"Notice: {closures} active road closure(s) currently require bypass or lane diversion.")

    if high_critical > 0:
        insights.append(f"High-priority monitoring: {high_critical} incident(s) are classified at High or Critical severity level.")

    if loc_counts:
        insights.append(f"Location hotspot: '{top_loc[0]}' has recorded {top_loc[1]} incident(s), warranting traffic patrol attention.")

    # Generate synthetic AI summary
    ai_summary = (
        f"[Smart Traffic Analysis Engine] Monitored network currently tracks {active_incidents} active road incidents "
        f"across urban sectors, with {closures} major closure(s). "
        f"The primary hazard profile is dominated by {top_type[0].replace('_', ' ')}s ({top_type_pct}% of total records), "
        f"with significant activity clustered near {top_loc[0]}. Commuters are advised to review corridor advisories before departure."
    )

    return insights, ai_summary
