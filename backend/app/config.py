import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "RouteX AI"
    APP_TAGLINE: str = "Smarter Roads. Safer Journeys. Better Cities."
    DEVELOPER: str = "Developed by Anil Biradar"
    SECRET_KEY: str = os.getenv("ROUTEX_SECRET_KEY", "routex-ai-smart-traffic-secure-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = os.getenv("ROUTEX_DATABASE_URL", "sqlite:///./routex.db")
    OSRM_BASE_URL: str = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")
    NOMINATIM_BASE_URL: str = os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
    DEMO_MODE_DEFAULT: bool = True
    ALLOW_PUBLIC_INCIDENT_REPORTING: bool = True

settings = Settings()
