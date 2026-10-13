# 🚦 RouteX AI — Smart Traffic Management & Road Intelligence Platform

<div align="center">

![RouteX AI Banner](https://img.shields.io/badge/RouteX_AI-Smart_Traffic_Intelligence-38BDF8?style=for-the-badge&logo=compass&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### *"Smarter Roads. Safer Journeys. Better Cities."*

**Developer Credit:** **Developed by Anil Biradar**  
**Institution / Origin:** Dayananda Sagar College of Engineering Project Demonstration  
**Repository:** [https://github.com/Anilbirada/RouteXAI](https://github.com/Anilbirada/RouteXAI)

</div>

---

## 📖 Table of Contents
1. [Project Overview & Vision](#-project-overview--vision)
2. [Key Capabilities & Modules](#-key-capabilities--modules)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [How to Run This Application (Step-by-Step)](#-how-to-run-this-application-step-by-step)
   - [Prerequisites](#prerequisites)
   - [Method 1: 1-Click Startup (Recommended)](#method-1-1-click-startup-recommended)
   - [Method 2: Manual Step-by-Step Startup](#method-2-manual-step-by-step-startup)
6. [Pre-Configured Test Accounts (1-Click Evaluation)](#-pre-configured-test-accounts-1-click-evaluation)
7. [Automated Testing & Quality Assurance](#-automated-testing--quality-assurance)
8. [API Endpoints Reference](#-api-endpoints-reference)
9. [Data Provenance & Transparency Statement](#-data-provenance--transparency-statement)
10. [Developer & Project Credits](#-developer--project-credits)

---

## 🌟 Project Overview & Vision

**RouteX AI** is a next-generation smart-city road intelligence and traffic operations platform built to provide unified visibility into road networks, monitor live-style traffic disruptions, evaluate multi-corridor route alternatives, and analyze congestion patterns.

Designed for smart-city demonstrations, college project presentations, and urban mobility research, RouteX AI bridges community-sourced hazard reports with operational moderator review pipelines and explainable analytics.

### Real-World Problems Solved
- **Daily Commuters**: Struggle with sudden unannounced road closures, hazardous waterlogging, and lack of clear alternate bypass routes.
- **Traffic Monitoring Staff**: Experience fragmented incident feeds and lack a structured moderation queue to confirm, review, and clear road hazards.
- **City Planners**: Require historical trends, incident category distributions, and recurring hotspot coordinates to prioritize road infrastructure budgets.
- **Project Demonstrators**: Need an application that works reliably offline or online, features clearly labeled telemetry, and provides 1-click persona switching.

---

## 🚀 Key Capabilities & Modules

### 1. 🗺️ Interactive Geospatial Traffic Map (`/map`)
- **OpenStreetMap Cartography**: Rendered with Leaflet and high-contrast dark operations-center cartographic tiles.
- **Pulsing Radar Hazard Markers**: Distinct, color-coded visual pins for:
  - 🔴 **Accidents** (with alert radius halos)
  - 🟠 **Road Closures** (with barrier bypass flags)
  - 🟡 **Roadworks & Utility Digs**
  - 🟧 **Vehicle Breakdowns**
  - 🔵 **Waterlogging & Stormwater Stagnation**
  - 🟣 **Pavement & Debris Hazards**
- **Corridor Focus Jumps**: 1-click coordinate jumps to key urban hubs (Dayananda Sagar College DSCE, Silk Board Flyover, Banashankari Underpass, Kanakapura Corridor, South End Circle).
- **Interactive Layer Controls**: Toggle incidents, closure boundaries, hotspot circles, and historical resolved records.
- **Right-Click Reporting**: Right-click anywhere on the map to automatically capture exact coordinates and open the report filing modal.

### 2. 📊 Live Monitoring Dashboard (`/dashboard`)
- **Database-Backed KPIs**: Real-time counters for Active Incidents, Road Closures, High/Critical alerts, and Database Provenance.
- **Time Horizon Filters**: Instant filtering across *Last 24 Hours*, *Last 7 Days*, *Last 30 Days*, and *All Time*.
- **Incident Feed**: Searchable by title or road corridor with 1-click detail drawer.

### 3. 🛡️ Road Incident Lifecycle & Moderation (`/incidents`)
- **Public & Commuter Reporting**: Community reports are tagged `user_reported` and enter as unverified `reported`.
- **Role-Based Moderation (RBAC)**: Authorized `Traffic Moderators` and `Administrators` can transition statuses:
  $$\text{Reported} \longrightarrow \text{Under Review} \longrightarrow \text{Confirmed} \longrightarrow \text{Resolved / Rejected}$$
- **Audit History**: Every status transition logs the previous status, new status, moderator ID, notes, and exact timestamp in `incident_status_history`.

### 4. 🔀 Smart Dual Route Comparison (`/routes`)
- **Dual Corridor Evaluation**:
  - **Route A**: Direct Arterial Corridor (primary city avenue).
  - **Route B**: Outer Ring Road / Expressway Bypass.
- **Proximity Hazard Collision Detection**: Geometric algorithm scans for active incidents within an 800-meter buffer along both paths.
- **Metrics**: Real computed distance in kilometers, estimated travel duration in minutes, and hazard advisories.
- **Saved Routes**: Bookmark preferred paths to personal user profiles.

### 5. 📈 Traffic Analytics & Explainable AI Insights (`/analytics`)
- **Statistical Charts**: Categorical breakdown by incident type, severity distributions, and 7-day volume trend bar visualizations.
- **Hotspot Detection**: Identifies top recurring choke points with coordinates and frequency counts.
- **Explainable Insights**: Rule-based statistical summaries computed from real database records.
- **AI-Synthesized Condition Report**: Structured executive narrative summarizing network status.
- **Data Export**: 1-click download of all incident telemetry as **CSV** or **JSON**.

### 6. ⚙️ System Administration Hub (`/admin`)
- Inspect all registered accounts and assign roles (`registered`, `moderator`, `admin`).
- Monitor sync health of map tile servers and routing engines.
- Review administrative audit logs.
- **Reset Demo Traffic Dataset**: 1-click button to reset simulation records to clean baseline coordinates.

---

## 💻 Technology Stack

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18, TypeScript, Vite 5** | Modern reactive component architecture |
| **Styling** | **Tailwind CSS** | Custom deep navy (`#080B12`) & electric cyan palette |
| **Geospatial Mapping** | **Leaflet, OpenStreetMap** | Hardware-accelerated interactive map engine |
| **Backend API** | **Python 3.12, FastAPI, Pydantic v2** | High-performance asynchronous REST API |
| **ORM & Database** | **SQLAlchemy 2.0, SQLite** | Relational data schema with active foreign key enforcement |
| **Security & Auth** | **PyJWT, bcrypt** | Secure password hashing & role-based bearer tokens |
| **Automated Testing**| **pytest, httpx TestClient** | Automated unit and integration testing suite |

---

## 🏗️ System Architecture

```
RouteX AI
│
├── frontend/ (Vite + React + TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── pages/         (LandingPage, TrafficMapPage, DashboardPage, IncidentsPage,
│   │   │                   RouteComparisonPage, AnalyticsPage, AdminPage)
│   │   ├── components/    (Navbar, Footer, Modals, Badges, NotificationDropdown)
│   │   ├── context/       (AuthContext with 1-click persona switcher, NotificationContext)
│   │   ├── services/      (REST API client with JWT bearer handling)
│   │   └── utils/         (Date and traffic status formatters)
│
├── backend/ (FastAPI + SQLAlchemy + Pydantic)
│   ├── app/
│   │   ├── main.py        (FastAPI initialization, CORS, seed hook)
│   │   ├── config.py      (Configuration & JWT secrets)
│   │   ├── database.py    (SQLAlchemy engine with PRAGMA foreign_keys)
│   │   ├── models.py      (User, Incident, StatusHistory, SavedRoute, AuditLog)
│   │   ├── schemas.py     (Pydantic input/output schemas)
│   │   ├── auth.py        (Password hashing, JWT decoding, RBAC guards)
│   │   ├── seed_data.py   (Simulated sample traffic dataset around Bengaluru/DSCE)
│   │   ├── routers/       (auth, incidents, map, routes, locations, analytics, admin)
│   │   └── services/      (Routing engine, proximity detection, explainable insights)
│   └── tests/             (15 comprehensive pytest test suites)
│
└── Batch Launchers        (run_all.bat, run_backend.bat, run_frontend.bat)
```

---

## 🏃 How to Run This Application (Step-by-Step)

### Prerequisites
Make sure you have the following installed on your computer:
1. **Python 3.10+** (Python 3.12 recommended) — [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+ and npm** — [Download Node.js](https://nodejs.org/)

---

### Method 1: 1-Click Startup (Recommended)

The easiest way to start both backend and frontend simultaneously is using the provided batch launcher:

1. Open PowerShell or Command Prompt.
2. Navigate to your project folder:
   ```powershell
   cd "C:\Users\anilb\OneDrive\Attachments\Desktop\DAYANADA SAGAR CLG PROJECTS\trafice manegement system"
   ```
3. Run:
   ```powershell
   .\run_all.bat
   ```
   *(Or simply double-click `run_all.bat` directly in Windows File Explorer!)*

This automatically opens two dedicated terminal windows:
- 🟢 **Backend API Server**: `http://localhost:8000`
- 🔵 **Frontend Web App**: `http://localhost:3000`

---

### Method 2: Manual Step-by-Step Startup

If you prefer to start each service manually in separate terminal windows:

#### Step 1: Start the Backend API Server
1. Open a terminal and navigate to the project root:
   ```bash
   cd "C:\Users\anilb\OneDrive\Attachments\Desktop\DAYANADA SAGAR CLG PROJECTS\trafice manegement system"
   ```
2. *(Optional)* Install Python dependencies if not already installed:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Launch the FastAPI server:
   ```bash
   python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - **Backend Base URL**: `http://localhost:8000`
   - **Interactive API Documentation (Swagger)**: `http://localhost:8000/docs`

#### Step 2: Start the Frontend Application
1. Open a **second** terminal window and navigate to the `frontend` folder:
   ```bash
   cd "C:\Users\anilb\OneDrive\Attachments\Desktop\DAYANADA SAGAR CLG PROJECTS\trafice manegement system\frontend"
   ```
2. *(Optional)* Install npm packages if not already installed:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit:
   ```text
   http://localhost:3000
   ```

---

## 👥 Pre-Configured Test Accounts (1-Click Evaluation)

RouteX AI includes pre-seeded demonstration accounts covering all permission tiers. You can log in manually or use the **"Switch Demo Persona"** button in the navigation bar for instant 1-click role switching:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@routex.ai` | `Admin@123` | Full system control, role assignment, audit logs, reset demo data |
| **Traffic Ops Moderator** | `moderator@routex.ai` | `Moderator@123` | Verify hazards, update status to Confirmed/Resolved, record audit notes |
| **Daily Commuter** | `commuter@routex.ai` | `Commuter@123` | Save routes, save favorite spots, file unverified community hazard reports |
| **Demo Evaluator** | `demo@routex.ai` | `Demo@123` | Standard evaluation persona |

---

## 🧪 Automated Testing & Quality Assurance

RouteX AI comes with a test suite covering authentication, RBAC authorization, incident validation, spatial routing, and analytics calculations.

To run the automated tests:
```bash
python -m pytest backend/tests -v
```

### Test Suite Results:
```text
backend/tests/test_admin.py::test_admin_endpoints PASSED
backend/tests/test_admin.py::test_admin_endpoints_unauthorized_for_commuter PASSED
backend/tests/test_analytics.py::test_analytics_summary PASSED
backend/tests/test_analytics.py::test_analytics_export_csv PASSED
backend/tests/test_analytics.py::test_analytics_export_json PASSED
backend/tests/test_auth.py::test_login_success PASSED
backend/tests/test_auth.py::test_login_invalid_password PASSED
backend/tests/test_auth.py::test_register_and_me PASSED
backend/tests/test_incidents.py::test_get_incidents PASSED
backend/tests/test_incidents.py::test_create_incident_valid PASSED
backend/tests/test_incidents.py::test_create_incident_invalid_coordinates PASSED
backend/tests/test_incidents.py::test_create_incident_invalid_type PASSED
backend/tests/test_incidents.py::test_update_status_rbac PASSED
backend/tests/test_routes.py::test_compare_routes PASSED
backend/tests/test_routes.py::test_save_and_get_routes PASSED
======================= 15 passed in 4.97s =======================
```

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Register a commuter account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated profile

### Incidents Management
- `GET /api/incidents` — Query incidents with multi-parameter filters (status, category, severity, time range)
- `POST /api/incidents` — Submit hazard report
- `GET /api/incidents/{id}` — Get complete details with lifecycle transition history
- `PATCH /api/incidents/{id}` — Edit incident details
- `PATCH /api/incidents/{id}/status` — *(Moderator / Admin)* Transition status with audit reason
- `GET /api/incidents/{id}/history` — Get chronological status transition log
- `DELETE /api/incidents/{id}` — *(Admin only)* Delete record

### Interactive Map
- `GET /api/map/incidents` — Geospatial pins for Leaflet map rendering
- `GET /api/map/summary` — Active incident counts and telemetry metadata

### Route Comparison
- `POST /api/routes/compare` — Compare dual corridors with hazard collision detection
- `GET /api/routes/saved` — Retrieve user's bookmarked routes
- `POST /api/routes/saved` — Save a route to user profile
- `DELETE /api/routes/saved/{id}` — Remove saved route

### Analytics & Reports
- `GET /api/analytics/summary` — Aggregated counts, breakdowns, 7-day trend, hotspots, AI summary
- `GET /api/analytics/export?format=csv` — Export complete incident database as CSV
- `GET /api/analytics/export?format=json` — Export complete incident database as JSON

### Administration
- `GET /api/admin/users` — List registered platform users
- `PATCH /api/admin/users/{id}/role` — Update user role (RBAC)
- `GET /api/admin/data-sources` — Inspect map tile & routing engine health
- `GET /api/admin/audit-logs` — Audit trail of operations and security events
- `POST /api/admin/reset-demo-data` — Reset demonstration incident data to baseline

---

## 🛡️ Data Provenance & Transparency Statement

RouteX AI is built on honesty and transparent data provenance:
- **DEMO DATA**: Fictional traffic incidents are clearly labeled with a visible purple badge:  
  `"Demonstration data is simulated and does not represent current real-world traffic conditions."`
- **USER REPORTED**: Public community hazard reports remain unverified until reviewed by an authorized moderator.
- **VERIFIED FEED**: Only incidents reviewed and approved by traffic monitoring staff carry verified status.
- **Routing Durations**: Travel times reflect geometric network calculations and known incident proximity. The platform does not claim access to live emergency dispatch systems or unverified GPS probe fleets.

---

## 👨‍💻 Developer & Project Credits

- **Project Name**: **RouteX AI**
- **Tagline**: *"Smarter Roads. Safer Journeys. Better Cities."*
- **Developer Credit**: **Developed by Anil Biradar**
- **Academic Context**: Dayananda Sagar College of Engineering Project Demonstration
- **GitHub Repository**: **[https://github.com/Anilbirada/RouteXAI](https://github.com/Anilbirada/RouteXAI)**