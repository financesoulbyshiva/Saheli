# SAHELI — Smart Women Safety & Emergency Assistance Platform

> **Core Message:** *"Safety before the emergency."*  
> **Architecture:** Full-Stack Monorepo (React 18 + Node.js REST API + SQLite WAL Persistence)

---

## Monorepo Architecture

```
SAHELI/
├── frontend/    # React 18 + Vite SPA, UI & State Engine, Leaflet, Three.js, Lucide Icons
├── backend/     # Node.js REST API Server, Scrypt Authentication, Session Tokens, Telemetry
├── database/    # SQLite ACID Database (WAL Mode), Schema DDL, Seed Fixtures, Migrations
├── docs/        # Complete Product, UI, and Technical Documentation
├── scripts/     # Full-stack dev runner (spawns backend + frontend concurrently)
└── README.md
```

### System Architecture
$$\text{Frontend (React + Vite)} \longleftrightarrow \text{Backend REST API (Port 5000)} \longleftrightarrow \text{SQLite WAL Database (saheli.db)}$$

---

## Key Features

1. **SafeWalk Companion:** Proactive journey companion featuring customizable origin and destination, live ETA calculation, route monitoring, and interactive safety check-in countdown.
2. **5-Stage Safety Continuum:** Standardized state transitions from routine travel to caution, threat defense, emergency response, and safe recovery.
3. **Trusted Guardian Network:** Multi-tier guardian circle (Primary & Secondary) with priority distress alerting, relationship management, and owner-isolated database persistence.
4. **Verified Safe Havens & Real-Time Geospatial Discovery:** OpenStreetMap (Overpass API) integration to locate nearby police stations, hospitals, ambulances, fire stations, 24/7 pharmacies, and verified women's support sanctuaries with real Haversine distance.
5. **Emergency SOS & 112 ERSS Integration:** Direct one-tap connection to India's Emergency Response Support System (112), dual-tone Web Audio distress siren, and priority broadcast dispatch.
6. **Live Location Telemetry:** Cryptographically authorized real-time GPS coordinate sharing and revocation controls for trusted guardians.
7. **Tamper-Evident Incident Ledger:** Chronological audit trail logging safety state changes, check-ins, guardian dispatches, and coordinate stamps with JSON export capability.
8. **Administrative Command Center:** Real-time platform management, user verification controls, database metrics, and system audit logs.

---

## Safety State Machine

$$\mathbf{SAFE} \longrightarrow \mathbf{CAUTION} \longrightarrow \mathbf{THREAT} \longrightarrow \mathbf{EMERGENCY} \longrightarrow \mathbf{RECOVERED} \longrightarrow \mathbf{SAFE}$$

| State | Purpose & System Posture |
|---|---|
| **`SAFE`** | Routine monitoring. SafeWalk active with check-in countdown. |
| **`CAUTION`** | Early discomfort. Discreet guardian alerts and navigation to verified safe havens. |
| **`THREAT`** | Heightened risk. Emergency actions armed and immediate shelter prioritized. |
| **`EMERGENCY`** | High crisis. Full-screen emergency assistance, audio alarm siren, and ERSS 112 dispatch. |
| **`RECOVERED`** | Reassurance. Guardians notified of safety, incident resolved in ledger, baseline restored. |

---

## Quick Start (Run Locally)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Full-Stack Application
Running `npm run dev` starts both the backend API server (`http://localhost:5000`) and the frontend client (`http://localhost:5173`):
```bash
npm run dev
```

### 3. Run Backend Test Suite
```bash
npm run test
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## Technology Stack

- **Frontend:** React 18, Vite 6, Leaflet, React-Leaflet, Three.js, Lucide React
- **Backend:** Node.js HTTP Server, `node:sqlite` (DatabaseSync), `node:crypto` (scrypt, HMAC-SHA256)
- **Database:** SQLite in WAL Mode with foreign key enforcement
- **Mapping & Geospatial:** OpenStreetMap Nominatim (Geocoding), Overpass QL (Facilities), Project-OSRM (Walking Routes)
- **Meteorology:** Open-Meteo API (Live weather alerts)
