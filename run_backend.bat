@echo off
cd /d "%~dp0"
echo ========================================================
echo   RouteX AI - Backend API Server
echo   Developed by Anil Biradar
echo   "Smarter Roads. Safer Journeys. Better Cities."
echo ========================================================
echo Starting FastAPI Uvicorn server on http://localhost:8000 ...
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause
