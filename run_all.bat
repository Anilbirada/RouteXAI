@echo off
cd /d "%~dp0"
echo ========================================================
echo   RouteX AI - Smart Traffic Management & Road Intelligence Platform
echo   Developer: Anil Biradar
echo   Tagline: "Smarter Roads. Safer Journeys. Better Cities."
echo ========================================================
echo Launching Backend and Frontend in separate windows...
start "RouteX AI - Backend API" cmd /k ""%~dp0run_backend.bat""
start "RouteX AI - Frontend UI" cmd /k ""%~dp0run_frontend.bat""
echo Both services are initializing!
echo Backend:  http://localhost:8000 (API Docs: http://localhost:8000/docs)
echo Frontend: http://localhost:3000
