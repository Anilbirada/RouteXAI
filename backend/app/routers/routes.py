import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Incident, SavedRoute, User
from backend.app.schemas import (
    RouteCompareRequest, RouteCompareResponse, SavedRouteCreate, SavedRouteOut
)
from backend.app.services.routing import calculate_routes
from backend.app.config import settings
from backend.app.auth import get_current_user

router = APIRouter(prefix="/api/routes", tags=["Route Intelligence"])

@router.post("/compare", response_model=RouteCompareResponse)
async def compare_routes(
    req: RouteCompareRequest,
    db: Session = Depends(get_db)
):
    # Fetch active incidents
    active_incidents = db.query(Incident).filter(Incident.status.in_(["reported", "under_review", "confirmed"])).all()

    options = await calculate_routes(
        origin=req.origin,
        destination=req.destination,
        active_incidents=active_incidents,
        preference=req.preference or "fastest",
        osrm_url=settings.OSRM_BASE_URL
    )

    notice = (
        "Route comparison values are computed using geographic road networks and known incident proximity. "
        "Estimated travel times assume standard urban arterial speeds and do not represent continuous live GPS probe measurements."
    )

    return RouteCompareResponse(
        origin=req.origin,
        destination=req.destination,
        routes=options,
        timestamp=datetime.datetime.utcnow(),
        notice=notice
    )

@router.get("/saved", response_model=List[SavedRouteOut])
def get_saved_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SavedRoute).filter(SavedRoute.user_id == current_user.id).order_by(SavedRoute.created_at.desc()).all()

@router.post("/saved", response_model=SavedRouteOut, status_code=status.HTTP_201_CREATED)
def save_route(
    route_in: SavedRouteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved = SavedRoute(
        user_id=current_user.id,
        origin_name=route_in.origin_name,
        destination_name=route_in.destination_name,
        origin_lat=route_in.origin_lat,
        origin_lng=route_in.origin_lng,
        dest_lat=route_in.dest_lat,
        dest_lng=route_in.dest_lng,
        distance_km=route_in.distance_km,
        duration_minutes=route_in.duration_minutes,
        route_data=route_in.route_data,
        created_at=datetime.datetime.utcnow()
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved

@router.delete("/saved/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    route = db.query(SavedRoute).filter(SavedRoute.id == route_id, SavedRoute.user_id == current_user.id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Saved route not found.")
    db.delete(route)
    db.commit()
    return None
