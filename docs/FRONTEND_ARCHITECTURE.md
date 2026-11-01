# Frontend Architecture & Technical Design: SAHELI

## Product: SAHELI — Smart Women Safety & Emergency Assistance Platform
**Document:** Technical Architecture, State Management, and Simulation Engine
**Constraint:** 100% Frontend-Only Prototype (No Backend, No APIs, No DB)

---

## 1. Architectural Strategy

The application is structured as a **Single Page Application (SPA)** engineered for:
1. **Zero External Dependencies at Runtime:** Operates completely offline without failing during college projector demos.
2. **Deterministic State Machine:** A unified, immutable safety state governing visual themes and action availability.
3. **Simulated Asynchronous Engine:** Timers and event schedulers that emulate GPS movement, push notifications, audio sirens, and incoming guardian responses.

---

## 2. Recommended Tech Stack

| Layer | Recommended Choice | Rationale |
|---|---|---|
| **Core Framework** | React 18+ (via Vite) | Fast component lifecycle, reactive state transitions, clean modularity for 1-hour build. |
| **Styling** | Vanilla CSS with Design Tokens | Modern CSS variables, flexbox/grid, glassmorphism, zero Tailwind version conflicts, fast iteration. |
| **Icons** | Lucide React (or lightweight SVG icon set) | Sharp, modern icons for medical, police, shield, phone, and sirens. |
| **Audio** | HTML5 Web Audio API | Zero asset loading required; synthesized tones and sirens generated directly in code. |
| **Storage** | Browser `localStorage` | Preserves walk state and incident history if the page is refreshed during a demo. |

---

## 3. Global State Architecture

The application state is managed centrally via a `SafetyContext` (or centralized state reducer), ensuring every component stays in sync with the current safety posture.

```
                    ┌───────────────────────────────┐
                    │         SafetyContext         │
                    │                               │
                    │  - currentState: SafetyState  │
                    │  - activeWalk: SafeWalkSession│
                    │  - guardians: Guardian[]      │
                    │  - safePlaces: SafePlace[]    │
                    │  - timeline: IncidentEvent[]  │
                    │  - isSimulatingAudio: boolean │
                    └───────────────┬───────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│ Safety Dashboard │       │ SafeWalk Tracker │       │ Emergency Screen │
│ (Status & Quick) │       │ (ETA & Check-in) │       │ (SOS & Siren)    │
└──────────────────┘       └──────────────────┘       └──────────────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
                    ┌───────────────────────────────┐
                    │      Safety Simulator         │
                    │   (Presenter State Control)   │
                    └───────────────────────────────┘
```

### 3.1 State Machine Definition

```typescript
type SafetyState = 'SAFE' | 'CAUTION' | 'THREAT' | 'EMERGENCY' | 'RECOVERED';

interface SafeWalkSession {
  isActive: boolean;
  destination: string;
  totalDurationSeconds: number;
  remainingSeconds: number;
  progressPercent: number;
  nextCheckInSeconds: number;
}

interface IncidentEvent {
  id: string;
  timestamp: string;
  state: SafetyState;
  title: string;
  description: string;
  simulatedActionType?: 'SMS' | 'CALL' | 'GPS' | 'AUDIO' | 'STATUS_CHANGE';
}
```

---

## 4. The Simulation Engine

Since no live APIs or hardware sensors are connected, the prototype uses an integrated **Simulation Engine** running on client-side timers.

### 4.1 SafeWalk Progress Simulation
- Driven by a `setInterval` ticker (1-second tick).
- When a walk is started:
  - Progress advances by a configurable percentage each second (e.g., 1% / sec for demo mode, or normal speed).
  - Check-in countdown decreases.
  - When the check-in timer hits 0:
    - If not acknowledged by user, an automatic transition to `CAUTION` is dispatched.

### 4.2 Simulated Guardian Dispatcher
- When entering `CAUTION` or `EMERGENCY`:
  - System generates simulated SMS payloads with mock GPS coordinates (`28.6139° N, 77.2090° E`).
  - Schedules a mock delayed response using `setTimeout` (e.g., after 3 seconds, Guardian "Maa" replies: *"Beta, I see your alert. Stay where you are, calling you now!"*).
  - Pushes both the dispatch and the response into the **Incident Timeline**.

### 4.3 Web Audio Siren Synthesizer
- Avoids missing audio files or network MP3 fetch errors.
- Uses `AudioContext` to create a 2-tone frequency oscillator (`750Hz` $\leftrightarrow$ `950Hz` frequency modulation).
- Includes an instant master mute/unmute control.

---

## 5. Directory & File Organization

```
SAHELI- Women Safety/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   ├── tokens.css           # Color tokens, glassmorphism variables
│   │   ├── main.css             # Base styles, resets, typography
│   │   └── animations.css       # Pulsing siren, glow effects, transitions
│   ├── context/
│   │   └── SafetyContext.jsx    # Master state & reducer
│   ├── data/
│   │   └── mockData.js          # Guardians, safe places, preset routes
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx       # Branding & active status pill
│   │   │   ├── StatusBanner.jsx # Top ambient warning banner
│   │   │   └── Disclaimer.jsx   # Prototype simulation badge
│   │   ├── dashboard/
│   │   │   ├── StatusShield.jsx # Main status display & quick triggers
│   │   │   └── QuickActions.jsx # Uncomfortable & SOS buttons
│   │   ├── safewalk/
│   │   │   ├── SafeWalkCard.jsx # Progress bar & ETA card
│   │   │   └── DestinationModal.jsx # Preset route selector
│   │   ├── uncomfortable/
│   │   │   ├── UncomfortableModal.jsx # De-escalation toolkit
│   │   │   └── FakeCallModal.jsx     # Realistic incoming call overlay
│   │   ├── emergency/
│   │   │   ├── EmergencyModal.jsx    # Fullscreen red alert
│   │   │   ├── SOSCountdown.jsx      # 3-second abort countdown
│   │   │   └── SirenController.jsx   # Audio siren controls
│   │   ├── guardians/
│   │   │   └── GuardianList.jsx      # Contact cards & simulated battery
│   │   ├── places/
│   │   │   └── SafePlacesList.jsx    # Nearby safe spots with mock map preview
│   │   ├── timeline/
│   │   │   └── IncidentTimeline.jsx  # Event log with timestamps
│   │   └── simulator/
│   │       └── PresenterToolbar.jsx  # College demo control panel
│   └── utils/
│       ├── audioSynthesizer.js  # Web Audio API siren & tones
│       └── formatters.js        # Time formatters & coordinate helpers
└── docs/
    └── ...
```

---

## 6. Implementation Feasibility (1-Hour Build Plan)

To comfortably achieve the entire prototype within ~1 hour:
1. **Foundation (10 mins):** Initialize project, define CSS tokens, create mock data structures.
2. **State & Context (10 mins):** Implement `SafetyContext` with 5 states, state transitions, and timeline logging.
3. **Core Dashboard & SafeWalk (15 mins):** Status shield, SafeWalk timer ticker, and quick action buttons.
4. **Interactive De-escalation & Emergency (15 mins):** "I'm Uncomfortable" modal, fake call simulator, SOS countdown modal, audio siren synthesizer.
5. **Presenter Toolbar & Polish (10 mins):** Floating presenter controls to jump states, timeline viewer, disclaimers, responsive adjustments.

---

## 7. Full-Stack Monorepo Target Architecture

The repository is structured as a full-stack monorepo separating client presentation, future server operations, and persistence:

```
SAHELI/
├── frontend/    # [IMPLEMENTED] React 18 + Vite SPA, Design Tokens, Mock Data Engine
├── backend/     # [FUTURE / NOT IMPLEMENTED] Node.js/Express API Service Placeholder
├── database/    # [FUTURE / NOT IMPLEMENTED] Relational / Document Persistence Placeholder
└── docs/        # Complete Product, UI, and Technical Documentation
```

### Architectural Flow:

```
┌────────────────────────────────────────────────────────┐
│             Frontend SPA (IMPLEMENTED)                 │
│   React 18 + SafetyContext + Client Mock State Engine   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ (Planned REST / WebSocket APIs)
┌────────────────────────────────────────────────────────┐
│       Backend API Service (FUTURE / NOT IMPLEMENTED)   │
│   Node.js/Express, Auth Middleware, Gateway Integrations│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ (Planned ORM / Connection Pool)
┌────────────────────────────────────────────────────────┐
│      Database Layer (FUTURE / NOT IMPLEMENTED)         │
│   PostgreSQL / MongoDB, Relational Schemas, Audit Logs │
└────────────────────────────────────────────────────────┘
```

> **IMPORTANT:** In the current prototype milestone, all data structures, transitions, and alerts execute 100% client-side inside `frontend/`. No backend processes or database connections are active.
