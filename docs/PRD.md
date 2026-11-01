# Product Requirements Document (PRD)

## Project: SAHELI — Smart Women Safety & Emergency Assistance Platform
**Tagline:** *Safety before the emergency.*
**Project Type:** Frontend-Only College Prototype & Interactive Presentation
**Target Duration of Implementation:** ~1 Hour MVP Scope
**Environment:** Client-side only (Browser SPA, zero external APIs, zero backend)

---

## 1. Executive Summary & Vision

Traditional women's safety applications fail because they act only **after** violence or danger occurs — requiring users to press panic buttons during active physical distress.

**SAHELI** reverses this model around the foundational philosophy: **"Safety before the emergency."**

The platform introduces a proactive 4-phase continuum:
$$\text{PREVENT} \longrightarrow \text{ASSIST} \longrightarrow \text{ESCALATE} \longrightarrow \text{RECOVER}$$

By providing users with discrete de-escalation tools, companion tracking (**SafeWalk**), verified safe shelters, and tiered safety states, SAHELI intervenes when discomfort begins, preventing escalations while remaining instantly ready for simulated high-priority emergencies.

---

## 2. Core Safety Philosophy: The 4-Phase Model

| Phase | Core Objective | Key Trigger | System Action |
|---|---|---|---|
| **1. PREVENT** | Continuous risk mitigation | Journey starts / Normal travel | SafeWalk active, periodic discreet check-ins, route ETA calculation. |
| **2. ASSIST** | Immediate de-escalation | User clicks "I'm Uncomfortable" | CAUTION mode, locate nearest 24/7 safe places, discrete guardian pre-alert. |
| **3. ESCALATE** | Rapid crisis containment | Threat confirmed / SOS triggered | EMERGENCY mode, audible alarm, simulated dispatch to guardians & emergency services. |
| **4. RECOVER** | Post-crisis resolution & debrief | User clicks "I'm Safe" | RECOVERED state, safety debrief, timeline export, guardian reassurance ping. |

---

## 3. The 5 System Safety States

The entire application state machine is driven by 5 distinct, color-coded safety states:

```
[ SAFE ] ──(User starts walk / reports uneasy)──> [ CAUTION ]
   ↑                                                     │
   │                                           (Direct threat felt)
   │                                                     ▼
   │                                               [ THREAT ]
   │                                                     │
(User marks "I'm Safe")                         (SOS pressed / Timer expired)
   │                                                     ▼
   └─────────────── [ RECOVERED ] <────────────── [ EMERGENCY ]
```

1. **`SAFE`** (Emerald/Green): Normal status. Baseline monitoring, route navigation, guardian battery/network check.
2. **`CAUTION`** (Amber/Yellow): User feels uneasy or followed. Low-profile interface, quick access to safe havens, silent guardian standby ping.
3. **`THREAT`** (Orange): Heightened danger. Haptic feedback, auto-countdown timer (e.g., 60 seconds) before automatic emergency escalation.
4. **`EMERGENCY`** (Crimson/Red): High-intensity red alert screen, simulated flashing siren, loud distress audio toggle, simulated instant location broadcast to emergency contacts.
5. **`RECOVERED`** (Cyan/Teal): Threat resolved. User marks "I'm Safe", simulated confirmation messages sent to all guardians, incident log generated.

---

## 4. Primary College Demo Journey

The core presentation scenario will demonstrate this exact end-to-end journey in under 3 minutes:

1. **Journey Initialization:** User opens SAHELI and starts a **SafeWalk** session (e.g., "Library to Metro Station", 15-minute simulated walk).
2. **Active Monitoring:** The SafeWalk dashboard shows live simulated progression, check-in timer, and guardian readiness.
3. **Early Discomfort (CAUTION):** User notices suspicious activity and taps **"I'm Uncomfortable"**. The system transitions to **CAUTION** mode.
4. **Assistance & Safe Haven:** System highlights the nearest verified safe haven (e.g., "24/7 Apollo Pharmacy — 180m away") and silently pings simulated guardians.
5. **Escalation (EMERGENCY):** Situation worsens; user taps the prominent **SOS Button** (or lets the threat timer expire). State transitions to **EMERGENCY**.
6. **Simulated Response Actions:** Emergency screen visually pulses red, simulates distress SMS/location broadcasts to guardians, simulates dialing 112, and displays an emergency action log.
7. **Resolution (RECOVERED):** Threat passes; user enters safe zone and clicks **"I'm Safe"**.
8. **Debrief & Reset:** System shifts to **RECOVERED**, confirms all mock contacts are notified of safety, and renders an **Incident Timeline**.

---

## 5. MVP Feature Scope (College Presentation Scope)

| # | Feature Name | Description | Simulation Details |
|---|---|---|---|
| 1 | **Landing Page** | High-impact overview of SAHELI, quick action entry, presentation pitch. | Static rich UI with interactive navigation. |
| 2 | **Safety Dashboard** | Central command hub showing current safety status, quick triggers, and guardian pulse. | State-reactive UI with dynamic status badges. |
| 3 | **SafeWalk Tracker** | Companion walk tracker with simulated progress bar, ETA, and countdown check-in. | Client-side timer intervals simulating movement. |
| 4 | **Safety Status System** | 5-state global state machine with reactive theme and contextual actions. | Centralized state store triggering UI-wide styling. |
| 5 | **"I'm Uncomfortable" Flow** | Proactive de-escalation screen with safe place directions, fake call button, and silent ping. | Simulated audio ring for fake call; simulated status pings. |
| 6 | **SOS / Emergency Flow** | 3-second abortable countdown, loud siren toggle, full-screen emergency mode. | Client-side Web Audio siren, simulated SOS dispatches. |
| 7 | **Guardian Network** | List of mock emergency contacts with simulated real-time status and battery indicators. | Pre-loaded mock contacts with interactive ping triggers. |
| 8 | **Nearby Safe Places** | Curated catalog of vetted safe spots (pharmacies, metro stations, police kiosks, cafe chains). | Local mock dataset with simulated distance & map card. |
| 9 | **Safety Simulator** | Presenter utility bar allowing instant toggling of states, timer fast-forwarding, and mock triggers. | Built specifically for smooth college live demonstrations. |
| 10 | **Basic Incident Timeline** | Real-time audit log of all safety actions, alerts, simulated pings, and resolution timestamps. | Dynamically populated event stream stored in browser memory. |

---

## 6. Technical Scope & Non-Goals

### Strict Prototype Boundaries (Frontend-Only)
- **NO Backend / APIs:** No Express, Node server, Python, Firebase, Supabase, or external databases.
- **NO External AI / Third-Party Services:** No live Google Maps API key, Twilio, OpenAI, or location APIs.
- **NO Real Telephony or SMS:** All calls, messages, and broadcasts are client-side animations and simulated logs.
- **Data Persistence:** In-memory state and browser `localStorage` only.
- **Explicit Disclaimers:** All screens and simulated actions will feature clear prototype notices:
  *`[SIMULATED ACTION — College Prototype Demonstrator]`*.

---

## 7. Assumptions & Demonstration Success Criteria

- **Browser Compatibility:** Runs smoothly in standard modern browsers (Chrome, Edge, Safari, Firefox).
- **Responsive Design:** Optimized for both mobile viewport (demonstrating handheld smartphone use) and standard desktop projector presentations.
- **Zero-Latency Execution:** Complete independence from internet connectivity once loaded locally, ensuring no demo failures during the college presentation.
- **Presentation Time:** Demonstrable end-to-end within 2–5 minutes.
