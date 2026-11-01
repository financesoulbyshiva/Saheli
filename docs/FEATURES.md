# Feature Specifications: SAHELI

## Product: SAHELI — Smart Women Safety & Emergency Assistance Platform
**Scope:** Frontend-Only College Prototype (10 Core Features)
**Core Motto:** *Safety before the emergency.*

---

## Feature Matrix & 4-Phase Mapping

| Feature # | Feature Name | Core Phase | Primary User Interaction | Simulation Behavior |
|---|---|---|---|---|
| **F01** | Landing Page | Entry & Overview | Explore features, launch demo | Interactive landing with value pillars and 1-click demo entry |
| **F02** | Safety Dashboard | PREVENT / ASSIST | View status, battery, quick access | Central command center with quick state toggles and live widgets |
| **F03** | SafeWalk Tracker | PREVENT | Start walk, set ETA, check in | Simulated GPS progress bar, countdown timer, auto-prompt |
| **F04** | Safety Status System | Cross-Phase (All) | Visual indication of current state | Reactive color-coded theme, banner alerts, haptic/sound cues |
| **F05** | "I'm Uncomfortable" Flow | ASSIST | Single-tap de-escalation trigger | Safe place routing, simulated fake call, discreet guardian alert |
| **F06** | SOS / Emergency Flow | ESCALATE | Hold-to-activate / 3s countdown | Flashing red screen, simulated siren sound, simulated SMS/Call broadcast |
| **F07** | Guardian Network | PREVENT / ESCALATE | Manage trusted contacts | Mock contact cards showing simulated live status & battery |
| **F08** | Nearby Safe Places | ASSIST | Find verified safe spots | Curated cards (pharmacies, police booths, metro stations) with mock directions |
| **F09** | Safety Simulator | Demo Utility | Control demo states & timers | Floating presenter bar to force states, speed up walk, trigger alerts |
| **F10** | Basic Incident Timeline | RECOVER / Audit | Review audit log of actions | Chronological event list recording every state change and simulated dispatch |

---

## Detailed Feature Specifications

### F01: Landing Page
- **Purpose:** Introduce the college project, explain the paradigm shift from "reactive panic buttons" to "proactive prevention", and provide an instant jump into the interactive prototype.
- **Key UI Elements:**
  - Hero section with headline: *"Safety before the emergency."*
  - 4-Phase interactive cards (`PREVENT` → `ASSIST` → `ESCALATE` → `RECOVER`).
  - Single primary CTA: *"Launch Live Safety Prototype"*.
  - College project credits banner & prototype simulation disclaimer badge.
- **Presentation Value:** Sets context immediately for college evaluators before diving into the interactive simulation.

---

### F02: Safety Dashboard
- **Purpose:** Serve as the user's primary companion screen when on the move.
- **Key UI Elements:**
  - **Dynamic Status Shield:** Prominently displays the current state (`SAFE`, `CAUTION`, `THREAT`, `EMERGENCY`, `RECOVERED`).
  - **Quick Action Bar:**
    - Secondary Action: *"I'm Uncomfortable"* (Yellow/Amber button)
    - Primary Action: *"SOS Emergency"* (Red button with hold protection)
    - Tertiary Action: *"Start SafeWalk"* (Emerald button)
  - **Guardian Glance Widget:** Showing 3 active simulated guardians and their simulated sync state.
  - **Recent Incidents/Activity preview.**
- **Interactions:** Clicking any trigger smoothly transitions the dashboard state and logs an event in the Incident Timeline.

---

### F03: SafeWalk Tracker
- **Purpose:** Preventative companion walk session with simulated route progress and periodic check-in safety timers.
- **Key Components:**
  - **Destination Selector:** Preset popular college student routes (e.g., *Campus Library to North Gate*, *Hostel to Metro Station*).
  - **Simulated Progress Bar:** Visual 0% to 100% walk progression with simulated speed controls.
  - **Check-In Timer:** Configurable interval (e.g., check-in every 5 minutes; simulated in seconds for presentation).
  - **Overdue Check-in Alert:** If the timer reaches 0 without user tapping *"I'm Okay"*, system automatically escalates to `CAUTION` state.
- **Simulation Behavior:** Uses JavaScript `setInterval` to advance progress and time. No real GPS hardware required.

---

### F04: Safety Status System (State Machine)
- **Purpose:** Provide immediate cognitive clarity about the safety posture of the user.
- **State Specifications:**
  1. **SAFE (Green):** Calm UI, subtle ambient glow, standard system checks.
  2. **CAUTION (Yellow):** Warm amber ambient, discreet top alert banner: *"Caution Active: Stay vigilant. Nearby safe places highlighted."*
  3. **THREAT (Orange):** Orange warning alert, countdown timer (30s) to emergency escalation unless cancelled.
  4. **EMERGENCY (Red):** High-urgency red pulsating overlay, simulated siren audio toggle, instant simulated broadcast log.
  5. **RECOVERED (Teal):** Calming teal theme, resolution card, confirmation that all contacts were reassured.
- **Presentation Value:** Evaluators visually see the screen transform dynamically based on user risk level.

---

### F05: "I'm Uncomfortable" Flow (Proactive Assistance)
- **Purpose:** Allow women to seek assistance *before* an attacker makes a physical move.
- **Key Actions Available to the User:**
  1. **Fake Call Simulator:** Triggers an incoming call modal with audio ringtone, allowing the user to pretend they are on a call with a parent or friend.
  2. **Discreet Guardian Ping:** Simulates sending a silent location notification to trusted guardians: *"Heads up: I'm feeling uneasy near University Road. Keeping you updated."*
  3. **Quick Safe Havens:** Displays top 2 nearest open locations within 200 meters.
  4. **Safe Passage Siren Pre-Arm:** Prepares siren to sound instantly on volume button or screen tap.

---

### F06: SOS / Emergency Flow
- **Purpose:** Immediate crisis response when an imminent danger is encountered.
- **Key Interactions:**
  - **3-Second Abort Countdown:** Prevents accidental triggers while allowing instant panic bypass.
  - **Full-Screen Emergency Banner:** Pulsing alert with prominent *"I'm Safe / False Alarm"* cancellation button.
  - **Simulated Emergency Dispatches:**
    - Simulated SMS sent to primary contacts with mock coordinates (`28.6139° N, 77.2090° E`).
    - Simulated emergency services dispatch (112 police alert simulated).
  - **Simulated Siren Sound:** Synthesized Web Audio API sound generator (beeps/pulsing tone) with mute toggle for classroom environments.

---

### F07: Guardian Network
- **Purpose:** Keep the user supported by personal circles of trust.
- **Mock Contact List:**
  - *Maa (Mom)* — Status: `Active (Listening)` | Battery: `88%` | Phone: `+91 98765-XXXX1`
  - *Aarav (Brother)* — Status: `Active (Listening)` | Battery: `72%` | Phone: `+91 98765-XXXX2`
  - *Priya (Hostel Roommate)* — Status: `Active (Listening)` | Battery: `94%` | Phone: `+91 98765-XXXX3`
- **Actions:** Simulated "Send Test Check-in", "View Simulated Shared Location", and live simulated response badges (e.g., *"Seen 12s ago"*).

---

### F08: Nearby Safe Places
- **Purpose:** Vetted, well-lit, publicly accessible locations where a woman can take refuge.
- **Catalog Categories:**
  - **24/7 Pharmacies:** (e.g., *Apollo 24/7 Pharmacy — 120m away*)
  - **Police Help Booths:** (e.g., *University Gate Pink Police Booth — 250m away*)
  - **Metro Stations:** (e.g., *Central Metro Station Entrance 2 — 350m away*)
  - **Brightly Lit Cafes:** (e.g., *Cafe Coffee Day 24hr Drive-thru — 400m away*)
- **Information Cards:** Distance in meters, open hours, lighting status ("Brightly Lit"), and "Navigate (Simulated)" button.

---

### F09: Safety Simulator (Presenter Tool)
- **Purpose:** Designed explicitly for the college presentation to give the student full control of the demo trajectory without having to wait for natural timers.
- **Presenter Controls:**
  - **State Jumper:** 1-click buttons for `SAFE`, `CAUTION`, `THREAT`, `EMERGENCY`, `RECOVERED`.
  - **Time Warp:** `+1 min`, `+5 min`, or `Fast Forward Walk to 90%`.
  - **Trigger Deviation:** Simulates an unexpected route departure alert.
  - **Simulate Guardian Response:** Triggers a fake incoming reassurance SMS from "Maa": *"I'm on your live track, are you safe beta?"*
  - **Reset Demo:** Instant 1-click reset to clean initial state.

---

### F10: Basic Incident Timeline
- **Purpose:** Maintain an auditable, timestamped ledger of everything that transpired during the session.
- **Tracked Events:**
  - `[00:00]` SafeWalk initiated: Library to North Gate (ETA: 12 mins).
  - `[02:14]` User triggered "I'm Uncomfortable" -> System entered `CAUTION`.
  - `[02:15]` Simulated silent ping dispatched to 3 guardians.
  - `[03:40]` Threat timer escalated -> System entered `EMERGENCY`.
  - `[03:41]` Simulated SOS dispatched with mock coordinates.
  - `[04:20]` User clicked "I'm Safe" -> System entered `RECOVERED`.
- **Presentation Value:** Demonstrates accountability, transparent forensic timeline, and technical attention to detail.
