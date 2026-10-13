import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import SavedLocation, User
from backend.app.schemas import SavedLocationCreate, SavedLocationOut
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/locations", tags=["Saved Locations"])

@router.get("/saved", response_model=List[SavedLocationOut])
def get_saved_locations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SavedLocation).filter(SavedLocation.user_id == current_user.id).order_by(SavedLocation.created_at.desc()).all()

@router.post("/saved", response_model=SavedLocationOut, status_code=status.HTTP_201_CREATED)
def save_location(
    loc_in: SavedLocationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = SavedLocation(
        user_id=current_user.id,
        name=loc_in.name.strip(),
        address=loc_in.address,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        created_at=datetime.datetime.utcnow()
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved

@router.delete("/saved/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_location(
    location_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loc = db.query(SavedLocation).filter(SavedLocation.id == location_id, SavedLocation.user_id == current_user.id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Saved location not found.")
    db.delete(loc)
    db.commit()
    return None
