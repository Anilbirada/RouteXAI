from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from backend.app.database import get_db
from backend.app.models import Notification, User
from backend.app.schemas import NotificationOut
from backend.app.auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/notifications", tags=["Smart Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    current_user: Optional[User] = Depends(get_current_user_optional),
    unread_only: bool = False,
    db: Session = Depends(get_db)
):
    # If user is authenticated, return notifications for user or broadcast (user_id is None)
    # If anonymous, return broadcast notifications
    query = db.query(Notification)
    if current_user:
        query = query.filter(or_(Notification.user_id == current_user.id, Notification.user_id == None))
    else:
        query = query.filter(Notification.user_id == None)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    return query.order_by(desc(Notification.created_at)).limit(50).all()

@router.patch("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.post("/mark-all-read")
def mark_all_read(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).filter(Notification.is_read == False)
    if current_user:
        query = query.filter(or_(Notification.user_id == current_user.id, Notification.user_id == None))
    else:
        query = query.filter(Notification.user_id == None)

    count = query.update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"message": f"Marked {count} notifications as read."}
