# Future Scope & Production Roadmap: SAHELI

## Product: SAHELI — Smart Women Safety & Emergency Assistance Platform
**Document:** Post-Prototype Architecture, Scalability & Production Evolution
**Vision:** Transforming the College Prototype into a National-Grade Lifeline

---

## 1. Evolution from College Prototype to Production Architecture

While the current version is intentionally engineered as an interactive, zero-dependency, frontend-only prototype for college evaluation, the complete production vision encompasses high-reliability distributed infrastructure:

```
┌────────────────────────────────────────────────────────┐
│                   SAHELI Client App                    │
│   (React Native / Flutter + Smartwatch Companion App)  │
└──────────────────────────┬─────────────────────────────┘
                           │ Encrypted WebSocket & mTLS
                           ▼
┌────────────────────────────────────────────────────────┐
│               Edge Ingestion & Geofencing              │
│       (Kafka / Redis PubSub + Geo-spatial Indexing)     │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│  Emergency Dispatch Engine  │ │   AI Threat Telemetry Hub   │
│  - Twilio Voice / SMS       │ │   - On-Device Audio Scream  │
│  - 112 ERSS Government API  │ │   - Route Deviation Sensor  │
│  - Nearby Verified Citizens │ │   - Fall / Running Sensor   │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Key Production Pillars

### 2.1 Hardware & Native Device Integration
- **Lock-Screen & Power Button Triggers:** Integration with Android `AccessibilityService` and iOS Shortcuts to trigger silent emergency modes with 3 rapid power button presses without looking at the screen.
- **Wearable Companion App:** Standalone Wear OS and Apple Watch applications allowing discrete heart-rate spike detection and 1-tap SOS from the wrist.
- **Smart Jewelry & Bluetooth Fobs:** Ultra-compact BLE (Bluetooth Low Energy) accessories disguised as pendants or hairpins to trigger alarms without reaching for a phone.

### 2.2 Telecommunications & Emergency Services Integration
- **Official 112 ERSS Bridge:** Direct integration with India's Emergency Response Support System (ERSS 112) API for automatic CAD (Computer-Aided Dispatch) to the nearest patrol vehicle.
- **High-Priority Carrier SMS & Automated Voice Dialing:** Utilizing Twilio / Sinch emergency priority queues with interactive IVR calls that speak the victim's name, last known address, and live tracking URL to guardians.

### 2.3 On-Device Edge AI & Anomaly Detection
- **Audio Scream & Distress Keyword Detection:** Lightweight TensorFlow Lite on-device model listening for high-frequency distress screams or vocal trigger phrases (e.g., *"Help me"*, *"Bachao"*) without recording continuous conversations (privacy-preserving).
- **Inertial Anomaly Detection:** Gyroscope and accelerometer monitoring for sudden sprint bursts, violent phone drops, or struggles, automatically prompting a 15-second safety check before escalating to `THREAT`.
- **Intelligent Route Anomaly Engine:** Machine learning models that learn normal commute patterns and detect abnormal deviations (e.g., car turning down a deserted alleyway instead of continuing along the highway).

### 2.4 Tamper-Proof Forensic Evidence Vault
- **Encrypted WebRTC Audio/Video Streaming:** When `EMERGENCY` is confirmed, the phone discreetly records 30-second rotating video and ambient audio snippets, encrypted on-device with AES-256 and pushed directly to decentralized cloud storage (e.g., AWS S3 with Object Lock or IPFS).
- **Legally Admissible Audit Trail:** Cryptographically signed timestamp logs, cell-tower IDs, and GPS track files designed for direct submission in police investigations and legal proceedings.

### 2.5 Decentralized Community Mesh & Safe Havens
- **Offline Mesh Networking:** Utilizing LoRa (Long Range) or BLE mesh networks to broadcast distress beacons even in subterranean parking lots, metro tunnels, or areas with zero cellular connectivity.
- **"Saheli Shield" Merchant Network:** Formal onboarding of 24/7 businesses, pharmacies, and verified women cab drivers equipped with dedicated beacon receivers who can offer verified physical shelter during `CAUTION` and `THREAT` phases.

---

## 3. Engineering Roadmap

| Phase | Milestone | Primary Deliverable |
|---|---|---|
| **Phase 1** *(Current)* | **Frontend College Prototype** | Interactive browser demonstration of the 4-phase model, 5 states, SafeWalk, and simulated dispatches. |
| **Phase 2** | **Mobile Hybrid MVP** | React Native build, real background GPS tracking, SQLite local persistence, Firebase push notifications. |
| **Phase 3** | **Telecom & Voice Dispatch** | Integration with Twilio SMS/calling, live guardian WebSockets, and real-time Google Maps routing. |
| **Phase 4** | **Government & Police ERSS** | Certified integration with state police emergency dispatch centers, SMS gateway shortcodes. |
| **Phase 5** | **Edge AI & Mesh Hardware** | Wearable BLE panic ring integration, on-device audio scream detection, and offline BLE mesh relay. |
