# SAHELI — Real-Time Production Backend Service

> **Status:** `OPERATIONAL & ACTIVE`
> Production-ready Node.js REST API service with SQLite ACID persistence (WAL mode), secure scrypt hashing, JWT token authentication, authorized guardian location sharing, and security headers.

---

## Backend Architecture

```
backend/
├── src/
│   ├── config/          # Runtime configuration and environment loading
│   ├── controllers/     # Handlers (auth, guardians, incidents, location)
│   ├── db/              # SQLite database initialization, WAL mode, migrations, backup
│   ├── middleware/      # Rate limiting, security headers, token authentication, RBAC
│   ├── routes/          # API route map definitions
│   ├── services/        # Email dispatch, Supabase Auth integration
│   ├── utils/           # Scrypt hashing, token creation, sanitization, validation
│   ├── validators/      # Registration and input validation schemas
│   └── server.js        # Node.js HTTP server bootstrap and routing
├── test/
│   └── api.test.js      # Comprehensive 56-test security & API test suite
├── package.json
└── README.md
```

## Active API Endpoints

- `GET  /api/health` — Health check & operational status
- `GET  /api/config` — Public client configuration
- `POST /api/auth/register` — User account registration with scrypt password hashing
- `POST /api/auth/login` — Authentication with JWT session token
- `POST /api/auth/logout` — Invalidate session token
- `POST /api/auth/verify-otp` — Verify 6-digit email OTP
- `POST /api/auth/resend-otp` — Resend verification code (rate-limited)
- `GET  /api/auth/me` — Retrieve authenticated user profile
- `PUT  /api/auth/profile` — Update user medical notes, contact, and check-in intervals
- `GET  /api/guardians` — Retrieve trusted contacts (owner-isolated)
- `POST /api/guardians` — Add trusted guardian to emergency circle
- `DELETE /api/guardians/:id` — Delete guardian (authorized owner only)
- `GET  /api/safe-places` — Haversine distance-sorted verified sanctuaries
- `GET  /api/incidents` — Evidentiary incident logs & tamper-evident activity ledger
- `POST /api/incidents` — Log safety state transition, coordinates & telemetry
- `POST /api/safewalk/checkin` — SafeWalk periodic check-in telemetry confirmation
- `POST /api/location/share` — Authorized live GPS location broadcast
- `POST /api/location/revoke` — Revoke location broadcast and conceal coordinates
- `GET  /api/location/shared` — Query active coordinates (self or authorized ward)
- `GET  /api/location/protected-contacts` — List active locations of protected wards
- `GET  /api/admin/overview` — Administrative platform metrics
- `GET  /api/admin/users` — Administrative user list & status management

## Running Tests

```bash
npm run test
```
