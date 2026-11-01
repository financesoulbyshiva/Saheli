# UI/UX Specifications: SAHELI

## Product: SAHELI — Smart Women Safety & Emergency Assistance Platform
**Document:** Visual Design System, Tokens, Layouts & Component Specs
**Design Philosophy:** High-clarity, stress-resilient, dynamic ambient theme.

---

## 1. Visual Design Principles & Aesthetics

1. **Cognitive Clarity Under Panic:**
   - Under extreme stress, fine motor skills and reading comprehension drop by 50%.
   - Primary emergency actions require massive touch targets ($\ge 64\text{px}$) with distinctive geometric silhouettes.
2. **Dynamic Ambient Theming:**
   - The interface background, subtle glow accents, and navigation borders shift in real-time according to the active safety state (`SAFE`, `CAUTION`, `THREAT`, `EMERGENCY`, `RECOVERED`).
3. **Glassmorphism & High-End Modernism:**
   - Sleek dark-slate foundation (`#0B0F19`) paired with frosted-glass containers (`backdrop-filter: blur(16px)`), giving a modern, premium feel suitable for a standout college project presentation.
4. **Transparent Prototype Disclaimers:**
   - Every simulated element features clear badges (`[SIMULATION]`) so evaluators know it is an honest, fully contained frontend prototype.

---

## 2. Design Tokens & Color Palette

### 2.1 State-Driven Dynamic Tokens

| Safety State | Primary Hex | Accent Glow / CSS Variable | Cognitive Meaning |
|---|---|---|---|
| **SAFE** | `#10B981` (Emerald) | `rgba(16, 185, 129, 0.2)` | Normalcy, peaceful, passive monitoring |
| **CAUTION** | `#F59E0B` (Amber) | `rgba(245, 158, 11, 0.25)` | Alertness, early intervention, safe haven focus |
| **THREAT** | `#F97316` (Orange) | `rgba(249, 115, 22, 0.3)` | Heightened risk, auto-countdown countdown |
| **EMERGENCY** | `#EF4444` (Crimson) | `rgba(239, 68, 68, 0.45)` | Critical crisis, high contrast, pulsing alert |
| **RECOVERED** | `#14B8A6` (Teal) | `rgba(20, 184, 166, 0.2)` | Relief, reassurance, resolution debrief |

### 2.2 Core Neutral Palette
- **Background Deep:** `#0B0F19` (Deep Night Blue-Black)
- **Background Surface:** `rgba(17, 24, 39, 0.85)` (Glassmorphic Slate)
- **Background Elevated:** `rgba(31, 41, 55, 0.7)` (Lighter Card Surface)
- **Border Default:** `rgba(255, 255, 255, 0.1)`
- **Text Primary:** `#F9FAFB` (Pure High-Contrast White)
- **Text Secondary:** `#9CA3AF` (Muted Cool Grey)
- **Text Accent:** `#E5E7EB` (Crisp Off-White)

### 2.3 Typography
- **Primary Typeface:** `Plus Jakarta Sans` or `Inter`, system fallback `sans-serif`.
- **Display Headings:** Font weight 700 / 800 for high-stress legibility.
- **Data & Timers:** Monospace or tabular numerals (`font-variant-numeric: tabular-nums`) for countdowns and GPS coordinates.

---

## 3. Responsive Layout & Presentation Frame

To create the best visual impact in a college presentation, the application uses an adaptive layout:
- **Presentation Dual-Mode:**
  - **Center Stage (Mobile Viewport Frame):** Realistic smartphone aspect ratio (390px - 440px wide, rounded bezel with simulated dynamic island/status bar) centered on screen.
  - **Left / Right Presenter Rails (on wide screens):**
    - **Right Rail:** The **Safety Simulator Dock** (for one-click state jumps, speed-ups, and examiner demos).
    - **Left Rail / Drawer:** The live **Incident Timeline** and **Guardian Pulse Monitor**.
  - **Responsive Mobile Behavior:** On a real phone or narrow screen, the presenter tools tuck into a discreet bottom-sheet drawer or slide-out menu.

---

## 4. Key Component Specifications

### 4.1 Header & Status Pill
- Displays the brand logo `SAHELI` with a glowing lotus/shield emblem.
- **Safety State Pill:** An animated badge showing the current state:
  - Icon: Shield (Safe) / Alert Triangle (Caution) / Flame (Threat) / Siren (Emergency) / Check (Recovered).
  - Subtle pulsing dot animation indicating live system monitoring.

### 4.2 The SOS Panic Button (`SOSButton`)
- **Dimensions:** Minimum 90px $\times$ 90px circular button or full-width pill.
- **Colors:** Deep crimson background with concentric pulsating radial rings (`@keyframes pulse-ring`).
- **Safety Safeguard:** Hold for 1 second or tap with a 3-second visual abort bar (*"Hold to trigger SOS"* or *"Tap to trigger with 3s abort"*).

### 4.3 "I'm Uncomfortable" Action Card (`UncomfortableCard`)
- **Dimensions:** Prominent horizontal banner / card with amber trim.
- **Text:** *"Feeling Uneasy? Tap Here for Immediate Discreet Assistance."*
- **Sub-actions rendered on tap:**
  - Button 1: *"Simulate Fake Call"* (plays realistic ringtone modal).
  - Button 2: *"Navigate to Nearest Safe Haven"* (opens pharmacy/police card).
  - Button 3: *"Send Silent Ping to Guardians"*.

### 4.4 SafeWalk Tracker Card (`SafeWalkCard`)
- **Progress Line:** Gradient bar showing simulated journey completion ($0\% \to 100\%$).
- **Metrics Grid:**
  - *Destination:* e.g. "Metro Gate 2"
  - *ETA:* "8 mins remaining"
  - *Next Check-in:* "02:45"
  - *Check-in Action:* Button: *"I'm Safe (Check In)"*.

### 4.5 Nearby Safe Places Card (`SafePlaceCard`)
- Clean list of cards displaying:
  - Place Name & Category Icon (e.g., 💊 Pharmacy, 👮 Pink Police Booth).
  - Distance badge: `180m away` (simulated walking time ~2 mins).
  - Safe Attributes: `[24/7 Open]` `[Bright Lighting]` `[CCTV Covered]`.
  - Action button: *"Directions (Simulated)"*.

### 4.6 Guardian Network Grid (`GuardianGrid`)
- Cards for each pre-configured contact:
  - Avatar initials with online status indicator (green dot).
  - Name, Relationship, Simulated Battery Level (`88%`).
  - Simulated Last Seen: *"Syncing real-time"*.

### 4.7 Emergency Screen Overlay (`EmergencyOverlay`)
- Takes over the phone frame during `EMERGENCY` state.
- Flashing red ambient perimeter border (`animation: emergency-flash 1s infinite`).
- Displays simulated distress dispatches in real-time.
- Audio toggle button: *"Simulated Siren Audio [ON/OFF]"* (using safe Web Audio synthesizer tones).
- Big recovery button: *"I'm Safe Now (De-escalate)"*.

### 4.8 Safety Simulator Panel (`SafetySimulator`)
- Floating control console docked for the presentation:
  - State buttons: `[SAFE]` `[CAUTION]` `[THREAT]` `[EMERGENCY]` `[RECOVERED]`.
  - Walk Controls: `[Start Walk]` `[Fast-Forward 50%]` `[Complete Walk]`.
  - Incident Injections: `[Simulate Deviation]` `[Simulate Missed Check-in]`.
  - Reset Button: `[Reset All Data]`.

---

## 5. Micro-Animations & Sound Design

- **State Transitions:** 300ms smooth cross-fade for color palettes and background gradient meshes.
- **Audio Synthesizer (Web Audio API):**
  - *Safe Ping:* Soft 800Hz beep (50ms).
  - *Caution Ping:* Double 600Hz amber alert tone.
  - *Emergency Siren:* Alternating 700Hz - 950Hz siren oscillation (simulated via `OscillatorNode`, toggleable so it won't disrupt college classrooms).
  - *Fake Call Ringtone:* Standard phone ring tone pattern (2 sec ring, 4 sec silence).
