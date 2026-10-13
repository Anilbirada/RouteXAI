import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from backend.app.database import get_db
from backend.app.models import Incident, IncidentStatusHistory, Notification, AuditLog, User
from backend.app.schemas import (
    IncidentCreate, IncidentUpdate, IncidentStatusUpdate, IncidentOut, IncidentStatusHistoryOut
)
from backend.app.auth import get_current_user, get_current_user_optional, require_roles

router = APIRouter(prefix="/api/incidents", tags=["Road Incidents"])

def format_incident_out(inc: Incident) -> IncidentOut:
    history_outs = [
        IncidentStatusHistoryOut(
            id=h.id,
            incident_id=h.incident_id,
            previous_status=h.previous_status,
            new_status=h.new_status,
            changed_by=h.changed_by,
            change_reason=h.change_reason,
            changed_at=h.changed_at,
            changer_name=h.changer.name if h.changer else "System / Reporter"
        )
        for h in inc.history
    ]
    return IncidentOut(
        id=inc.id,
        title=inc.title,
        incident_type=inc.incident_type,
        description=inc.description,
        location_name=inc.location_name,
        latitude=inc.latitude,
        longitude=inc.longitude,
        severity=inc.severity,
        status=inc.status,
        source_type=inc.source_type,
        image_url=inc.image_url,
        reported_by=inc.reported_by,
        reporter_name=inc.reporter.name if inc.reporter else "Anonymous Commuter",
        verified_by=inc.verified_by,
        verifier_name=inc.verifier.name if inc.verifier else None,
        reported_at=inc.reported_at,
        updated_at=inc.updated_at,
        resolved_at=inc.resolved_at,
        history=history_outs
    )

@router.get("", response_model=List[IncidentOut])
def get_incidents(
    status: Optional[str] = None,
    incident_type: Optional[str] = None,
    severity: Optional[str] = None,
    source_type: Optional[str] = None,
    time_range: Optional[str] = "all",  # 24h, 7d, 30d, all
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Incident)

    if status:
        query = query.filter(Incident.status == status.lower())
    if incident_type:
        query = query.filter(Incident.incident_type == incident_type.lower())
    if severity:
        query = query.filter(Incident.severity == severity.lower())
    if source_type:
        query = query.filter(Incident.source_type == source_type.lower())

    if time_range and time_range != "all":
        now = datetime.datetime.utcnow()
        if time_range == "24h":
            cutoff = now - datetime.timedelta(hours=24)
        elif time_range == "7d":
            cutoff = now - datetime.timedelta(days=7)
        elif time_range == "30d":
            cutoff = now - datetime.timedelta(days=30)
        else:
            cutoff = None
        if cutoff:
            query = query.filter(Incident.reported_at >= cutoff)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(or_(Incident.title.ilike(pattern), Incident.location_name.ilike(pattern), Incident.description.ilike(pattern)))

    incidents = query.order_by(desc(Incident.reported_at)).offset(offset).limit(limit).all()
    return [format_incident_out(inc) for inc in incidents]

@router.post("", response_model=IncidentOut, status_code=status.HTTP_201_CREATED)
def create_incident(
    inc_in: IncidentCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    now = datetime.datetime.utcnow()
    # If submitted by moderator/admin, can be directly confirmed or under_review if needed; otherwise unverified 'reported'
    initial_status = "reported"
    source = inc_in.source_type or "user_reported"

    if current_user and current_user.role in ["moderator", "admin"]:
        # Moderator reporting can be verified immediately
        source = "verified_feed" if source == "verified_feed" else "user_reported"

    new_inc = Incident(
        title=inc_in.title.strip(),
        incident_type=inc_in.incident_type.lower(),
        description=inc_in.description.strip(),
        location_name=inc_in.location_name.strip(),
        latitude=inc_in.latitude,
        longitude=inc_in.longitude,
        severity=inc_in.severity.lower(),
        status=initial_status,
        source_type=source,
        image_url=inc_in.image_url,
        reported_by=current_user.id if current_user else None,
        verified_by=None,
        reported_at=now,
        updated_at=now
    )
    db.add(new_inc)
    db.commit()
    db.refresh(new_inc)

    # Status history entry
    hist = IncidentStatusHistory(
        incident_id=new_inc.id,
        previous_status=None,
        new_status=initial_status,
        changed_by=current_user.id if current_user else None,
        change_reason="Initial incident submission (pending verification)",
        changed_at=now
    )
    db.add(hist)

    # Notification for monitors
    notif = Notification(
        title=f"New Road Incident Reported: {new_inc.title}",
        message=f"Location: {new_inc.location_name}. Type: {new_inc.incident_type.title()}. Severity: {new_inc.severity.title()}.",
        notification_type="incident_created",
        is_read=False,
        related_incident_id=new_inc.id,
        created_at=now
    )
    db.add(notif)
    db.commit()
    db.refresh(new_inc)

    return format_incident_out(new_inc)

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return format_incident_out(inc)

@router.patch("/{incident_id}", response_model=IncidentOut)
def update_incident_details(
    incident_id: int,
    update_data: IncidentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    # Permissions: Moderator/Admin can edit any. Original reporter can edit only while status is 'reported'.
    if current_user.role not in ["moderator", "admin"]:
        if inc.reported_by != current_user.id or inc.status != "reported":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your own unverified reports before moderator review."
            )

    if update_data.title:
        inc.title = update_data.title.strip()
    if update_data.description:
        inc.description = update_data.description.strip()
    if update_data.location_name:
        inc.location_name = update_data.location_name.strip()
    if update_data.severity:
        inc.severity = update_data.severity.lower()
    if update_data.incident_type:
        inc.incident_type = update_data.incident_type.lower()
    if update_data.image_url is not None:
        inc.image_url = update_data.image_url

    inc.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(inc)
    return format_incident_out(inc)

@router.patch("/{incident_id}/status", response_model=IncidentOut)
def update_incident_status(
    incident_id: int,
    status_data: IncidentStatusUpdate,
    current_user: User = Depends(require_roles(["moderator", "admin"])),
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    prev_status = inc.status
    new_status = status_data.status.lower()

    if prev_status == new_status:
        return format_incident_out(inc)

    now = datetime.datetime.utcnow()
    inc.status = new_status
    inc.updated_at = now

    if new_status == "confirmed":
        inc.verified_by = current_user.id
        if inc.source_type == "user_reported":
            inc.source_type = "verified_feed"
    elif new_status == "resolved":
        inc.resolved_at = now
        inc.verified_by = current_user.id

    # Record history
    hist = IncidentStatusHistory(
        incident_id=inc.id,
        previous_status=prev_status,
        new_status=new_status,
        changed_by=current_user.id,
        change_reason=status_data.change_reason or f"Status changed from {prev_status} to {new_status} by {current_user.name}",
        changed_at=now
    )
    db.add(hist)

    # Log audit
    db.add(AuditLog(
        user_id=current_user.id,
        action="UPDATE_INCIDENT_STATUS",
        entity_type="INCIDENT",
        entity_id=inc.id,
        details=f"Status changed from '{prev_status}' to '{new_status}'. Reason: {status_data.change_reason}",
        created_at=now
    ))

    # Notification for users
    db.add(Notification(
        user_id=inc.reported_by,
        title=f"Incident Status Updated: {inc.title}",
        message=f"Status updated to '{new_status.title()}'. Note: {status_data.change_reason or 'No additional notes'}",
        notification_type="status_changed",
        is_read=False,
        related_incident_id=inc.id,
        created_at=now
    ))

    db.commit()
    db.refresh(inc)
    return format_incident_out(inc)

@router.get("/{incident_id}/history", response_model=List[IncidentStatusHistoryOut])
def get_incident_history(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return [
        IncidentStatusHistoryOut(
            id=h.id,
            incident_id=h.incident_id,
            previous_status=h.previous_status,
            new_status=h.new_status,
            changed_by=h.changed_by,
            change_reason=h.change_reason,
            changed_at=h.changed_at,
            changer_name=h.changer.name if h.changer else "System / Reporter"
        )
        for h in inc.history
    ]

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    db.add(AuditLog(
        user_id=current_user.id,
        action="DELETE_INCIDENT",
        entity_type="INCIDENT",
        entity_id=incident_id,
        details=f"Deleted incident #{incident_id}: {inc.title}",
        created_at=datetime.datetime.utcnow()
    ))
    db.delete(inc)
    db.commit()
    return None
