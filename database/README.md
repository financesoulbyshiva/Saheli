# SAHELI — Database Architecture & Persistence Layer

> **Current Status:** `OPERATIONAL & ACTIVE`
> SAHELI utilizes an embedded SQLite ACID persistence database configured with Write-Ahead Logging (WAL mode), automated migrations, and strict foreign keys.

---

## Directory Structure

```
database/
├── schema/       # Production DDL schemas (schema.sql)
├── seed/         # Initial verified sanctuaries and seed fixtures (seed.sql)
├── migrations/   # Versioned schema migrations (001_initial_schema.sql)
├── saheli.db     # SQLite persistence database (WAL journal mode)
└── README.md
```

---

## Active Schema Entities

### 1. `users`
- User credentials with scrypt hashing and cryptographic salts
- Verification tokens, 6-digit OTP hashes, reset tokens, token versioning
- Medical notes, emergency PIN hash, terms acceptance

### 2. `guardians`
- User trusted emergency contacts with ownership isolation (user_id FK)
- Priority tier (`Primary`, `Secondary`), status, phone numbers

### 3. `safewalk_sessions`
- Real-time journey sessions with check-in intervals and progress tracking

### 4. `incident_logs`
- Tamper-evident evidentiary safety ledger
- Safety state (`SAFE`, `CAUTION`, `THREAT`, `EMERGENCY`, `RECOVERED`)
- GPS coordinates and client telemetry

### 5. `safe_places`
- Verified sanctuaries with coordinates (latitude, longitude)
- Safety tags, facility features, 24/7 operating hours

### 6. `location_shares`
- Authorized live location broadcast records
- Expiration timestamps, accuracy metrics, and privacy revocation controls
