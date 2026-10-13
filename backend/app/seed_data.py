import datetime
from sqlalchemy.orm import Session
from backend.app.models import User, Incident, IncidentStatusHistory, Notification, DataSourceLog, AuditLog
from backend.app.auth import get_password_hash

DEMO_DISCLAIMER_TEXT = "Demonstration data is simulated and does not represent current real-world traffic conditions."

def seed_database(db: Session, reset_demo_only: bool = False):
    now = datetime.datetime.utcnow()

    # 1. Users
    if db.query(User).count() == 0:
        users_data = [
            ("System Admin", "admin@routex.ai", "Admin@123", "admin"),
            ("Traffic Ops Moderator", "moderator@routex.ai", "Moderator@123", "moderator"),
            ("Daily Commuter", "commuter@routex.ai", "Commuter@123", "registered"),
            ("Demo Evaluator", "demo@routex.ai", "Demo@123", "registered"),
        ]
        for name, email, pw, role in users_data:
            user = User(
                name=name,
                email=email,
                password_hash=get_password_hash(pw),
                role=role,
                is_active=True,
                created_at=now - datetime.timedelta(days=10)
            )
            db.add(user)
        db.commit()

    admin_user = db.query(User).filter(User.role == "admin").first()
    mod_user = db.query(User).filter(User.role == "moderator").first()
    commuter_user = db.query(User).filter(User.role == "registered").first()

    # If resetting demo data, delete previous demo records
    if reset_demo_only:
        db.query(Incident).filter(Incident.source_type == "demo").delete()
        db.commit()

    # Check if demo incidents already exist
    existing_demo = db.query(Incident).filter(Incident.source_type == "demo").count()
    if existing_demo == 0:
        demo_incidents = [
            {
                "title": "Multi-Vehicle Collision on Outer Ring Road",
                "incident_type": "accident",
                "description": "[SIMULATED DEMO DATA] Two four-wheelers collided near the flyover ramp. One lane blocked. Traffic police on scene.",
                "location_name": "Outer Ring Road (Near Silk Board Flyover)",
                "latitude": 12.9172,
                "longitude": 77.6228,
                "severity": "high",
                "status": "confirmed",
                "source_type": "demo",
                "reported_by": commuter_user.id if commuter_user else None,
                "verified_by": mod_user.id if mod_user else None,
                "reported_at": now - datetime.timedelta(hours=2, minutes=15),
                "updated_at": now - datetime.timedelta(hours=1, minutes=45),
            },
            {
                "title": "Metro Line Expansion Lane Restriction",
                "incident_type": "roadwork",
                "description": "[SIMULATED DEMO DATA] Metro pier foundation casting in progress. Right lane cordoned off with safety barricades.",
                "location_name": "Kanakapura Road Corridor (Phase 2B)",
                "latitude": 12.8954,
                "longitude": 77.5683,
                "severity": "moderate",
                "status": "confirmed",
                "source_type": "demo",
                "reported_by": mod_user.id if mod_user else None,
                "verified_by": mod_user.id if mod_user else None,
                "reported_at": now - datetime.timedelta(days=2),
                "updated_at": now - datetime.timedelta(hours=5),
            },
            {
                "title": "Stormwater Culvert Repair - Full Closure",
                "incident_type": "road_closure",
                "description": "[SIMULATED DEMO DATA] Emergency drain repair following overnight downpour. Street completely closed to motor vehicles until 18:00 hrs. Detour via 14th Main.",
                "location_name": "Kumaraswamy Layout Main Access (Near DSCE Gate 2)",
                "latitude": 12.9081,
                "longitude": 77.5658,
                "severity": "critical",
                "status": "confirmed",
                "source_type": "demo",
                "reported_by": mod_user.id if mod_user else None,
                "verified_by": admin_user.id if admin_user else None,
                "reported_at": now - datetime.timedelta(hours=6),
                "updated_at": now - datetime.timedelta(hours=2),
            },
            {
                "title": "Heavy Goods Truck Breakdown at Underpass",
                "incident_type": "breakdown",
                "description": "[SIMULATED DEMO DATA] Mechanical failure of commercial container truck inside underpass approach. Towing vehicle en route.",
                "location_name": "Banashankari 3rd Stage Underpass",
                "latitude": 12.9255,
                "longitude": 77.5512,
                "severity": "moderate",
                "status": "under_review",
                "source_type": "demo",
                "reported_by": commuter_user.id if commuter_user else None,
                "verified_by": None,
                "reported_at": now - datetime.timedelta(minutes=45),
                "updated_at": now - datetime.timedelta(minutes=30),
            },
            {
                "title": "Monsoon Waterlogging on Low-Lying Service Road",
                "incident_type": "waterlogging",
                "description": "[SIMULATED DEMO DATA] Water stagnation up to 35cm due to blocked catch basins. Two-wheelers advised to divert.",
                "location_name": "BTM Layout 2nd Stage Service Road",
                "latitude": 12.9140,
                "longitude": 77.6101,
                "severity": "high",
                "status": "confirmed",
                "source_type": "demo",
                "reported_by": commuter_user.id if commuter_user else None,
                "verified_by": mod_user.id if mod_user else None,
                "reported_at": now - datetime.timedelta(hours=4),
                "updated_at": now - datetime.timedelta(hours=3),
            },
            {
                "title": "Loose Construction Gravel Spill on Descent",
                "incident_type": "hazard",
                "description": "[SIMULATED DEMO DATA] Loose crushed stone spilled on roadway incline, causing skidding hazard for two-wheelers.",
                "location_name": "Dayananda Sagar Campus Ring Road",
                "latitude": 12.9095,
                "longitude": 77.5670,
                "severity": "low",
                "status": "reported",
                "source_type": "demo",
                "reported_by": commuter_user.id if commuter_user else None,
                "verified_by": None,
                "reported_at": now - datetime.timedelta(minutes=20),
                "updated_at": now - datetime.timedelta(minutes=20),
            },
            {
                "title": "Uprooted Tree Branch - Cleared and Traffic Restored",
                "incident_type": "hazard",
                "description": "[SIMULATED DEMO DATA] Large storm branch fallen across carriage-way. Disaster management team removed debris. Road fully reopened.",
                "location_name": "South End Circle Junction",
                "latitude": 12.9372,
                "longitude": 77.5768,
                "severity": "low",
                "status": "resolved",
                "source_type": "demo",
                "reported_by": commuter_user.id if commuter_user else None,
                "verified_by": mod_user.id if mod_user else None,
                "reported_at": now - datetime.timedelta(days=1, hours=8),
                "updated_at": now - datetime.timedelta(hours=1),
                "resolved_at": now - datetime.timedelta(hours=1),
            },
            {
                "title": "Unscheduled Utility Trenching Activity",
                "incident_type": "roadwork",
                "description": "[SIMULATED DEMO DATA] Fiber optic cable trenching without active signalman. Slow crawl traffic.",
                "location_name": "Jayanagar 4th Block Boulevard",
                "latitude": 12.9298,
                "longitude": 77.5834,
                "severity": "moderate",
                "status": "confirmed",
                "source_type": "demo",
                "reported_by": mod_user.id if mod_user else None,
                "verified_by": mod_user.id if mod_user else None,
                "reported_at": now - datetime.timedelta(hours=12),
                "updated_at": now - datetime.timedelta(hours=10),
            }
        ]

        for item in demo_incidents:
            inc = Incident(**item)
            db.add(inc)
            db.flush()

            # Add status history
            hist = IncidentStatusHistory(
                incident_id=inc.id,
                previous_status=None,
                new_status="reported",
                changed_by=inc.reported_by,
                change_reason="Initial incident logging",
                changed_at=inc.reported_at
            )
            db.add(hist)

            if inc.status != "reported":
                hist2 = IncidentStatusHistory(
                    incident_id=inc.id,
                    previous_status="reported",
                    new_status=inc.status,
                    changed_by=inc.verified_by,
                    change_reason="Moderator status verification during shift review",
                    changed_at=inc.updated_at
                )
                db.add(hist2)

        # Add initial notifications
        notifications = [
            Notification(
                user_id=None,
                title="Critical Road Closure Active",
                message="Kumaraswamy Layout Main Access (Near DSCE Gate 2) closed for culvert repair. Seek alternative bypass routes.",
                notification_type="closure_alert",
                is_read=False,
                created_at=now - datetime.timedelta(hours=2)
            ),
            Notification(
                user_id=None,
                title="High Waterlogging Alert",
                message="BTM Layout 2nd Stage Service Road reported water stagnation. Caution advised.",
                notification_type="incident_created",
                is_read=False,
                created_at=now - datetime.timedelta(hours=4)
            ),
            Notification(
                user_id=None,
                title="RouteX AI Intelligence Platform Ready",
                message="System initialized with sample traffic intelligence data for demonstration.",
                notification_type="system",
                is_read=True,
                created_at=now - datetime.timedelta(days=1)
            )
        ]
        for n in notifications:
            db.add(n)

        # Add initial data source logs
        sources = [
            ("OpenStreetMap Tile Server", "active", 1),
            ("OSRM Open Routing Network", "active", 1),
            ("RouteX Spatial Synthetic Intelligence Model", "demo", 8),
            ("Community Traffic Incident Feed", "active", 8)
        ]
        for src, stat, cnt in sources:
            db.add(DataSourceLog(
                source_name=src,
                last_sync_at=now,
                sync_status=stat,
                record_count=cnt,
                error_message=None
            ))

        # Initial audit log
        if admin_user:
            db.add(AuditLog(
                user_id=admin_user.id,
                action="INITIALIZE_DEMO_DATASET",
                entity_type="SYSTEM",
                entity_id=1,
                details="Seeded initial demonstration dataset with verified spatial coordinates.",
                created_at=now
            ))

        db.commit()
