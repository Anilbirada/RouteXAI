import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed_data import seed_database
from backend.app.routers import (
    auth, incidents, map as map_router, routes, locations, analytics, notifications, admin
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("routex")

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed database with initial users and demonstration traffic records
with SessionLocal() as db:
    seed_database(db)

app = FastAPI(
    title=settings.APP_NAME,
    description="RouteX AI: Smart Traffic Management & Road Intelligence Platform. Developed by Anil Biradar.",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(incidents.router)
app.include_router(map_router.router)
app.include_router(routes.router)
app.include_router(locations.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "platform": settings.APP_NAME,
        "tagline": settings.APP_TAGLINE,
        "developer": settings.DEVELOPER,
        "status": "operational",
        "docs_url": "/docs",
        "demo_data_notice": "Demonstration data is simulated and does not represent current real-world traffic conditions."
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "developer": settings.DEVELOPER
    }
