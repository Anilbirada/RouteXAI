import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.database import get_db
from backend.app.models import User, DataSourceLog, AuditLog
from backend.app.schemas import UserOut, DataSourceLogOut, AuditLogOut
from backend.app.auth import require_roles
from backend.app.seed_data import seed_database

router = APIRouter(prefix="/api/admin", tags=["Administration"])

@router.get("/users", response_model=List[UserOut])
def get_all_users(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(User).order_by(User.id).all()

@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    new_role: str = Body(..., embed=True),
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    allowed_roles = {"public", "registered", "moderator", "admin"}
    if new_role not in allowed_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role '{new_role}'. Allowed: {allowed_roles}")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if target_user.id == current_user.id and new_role != "admin":
        raise HTTPException(status_code=400, detail="Cannot demote yourself from Admin role.")

    prev_role = target_user.role
    target_user.role = new_role

    db.add(AuditLog(
        user_id=current_user.id,
        action="UPDATE_USER_ROLE",
        entity_type="USER",
        entity_id=target_user.id,
        details=f"Changed user '{target_user.email}' role from '{prev_role}' to '{new_role}'",
        created_at=datetime.datetime.utcnow()
    ))
    db.commit()
    db.refresh(target_user)
    return UserOut.model_validate(target_user)

@router.get("/data-sources", response_model=List[DataSourceLogOut])
def get_data_sources(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    return db.query(DataSourceLog).order_by(DataSourceLog.id).all()

@router.get("/audit-logs", response_model=List[AuditLogOut])
def get_audit_logs(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(100).all()
    out = []
    for log in logs:
        out.append(AuditLogOut(
            id=log.id,
            user_id=log.user_id,
            user_email=log.user.email if log.user else "System",
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            details=log.details,
            created_at=log.created_at
        ))
    return out

@router.post("/reset-demo-data")
def reset_demo_data(
    current_user: User = Depends(require_roles(["admin", "moderator"])),
    db: Session = Depends(get_db)
):
    seed_database(db, reset_demo_only=True)
    db.add(AuditLog(
        user_id=current_user.id,
        action="RESET_DEMO_DATA",
        entity_type="SYSTEM",
        entity_id=0,
        details=f"Demo traffic incident data reset by {current_user.email}",
        created_at=datetime.datetime.utcnow()
    ))
    db.commit()
    return {"message": "Demonstration dataset refreshed successfully with verified geographic coordinates."}
