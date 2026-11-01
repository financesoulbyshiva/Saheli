# Mock Data Schema & Datasets: SAHELI

## Product: SAHELI — Smart Women Safety & Emergency Assistance Platform
**Document:** Mock Datasets, Schemas, and Simulation Payloads
**Status:** 100% Client-Side Mock Data (No Network Calls)

---

## 1. Guardian Network Mock Data

```json
[
  {
    "id": "g-01",
    "name": "Maa (Mom)",
    "relationship": "Mother",
    "phone": "+91 98765-43210",
    "avatar": "👩",
    "batteryLevel": 88,
    "status": "Online & Listening",
    "isPrimary": true,
    "lastPing": "1 min ago",
    "simulatedReply": "Beta, I see you are on SafeWalk. Reach safe and call me!"
  },
  {
    "id": "g-02",
    "name": "Aarav (Brother)",
    "relationship": "Brother",
    "phone": "+91 98111-22334",
    "avatar": "🧑",
    "batteryLevel": 74,
    "status": "Online & Listening",
    "isPrimary": true,
    "lastPing": "3 mins ago",
    "simulatedReply": "I have your live track open. Stay on the main street."
  },
  {
    "id": "g-03",
    "name": "Priya Sharma",
    "relationship": "Hostel Roommate",
    "phone": "+91 97222-33445",
    "avatar": "👧",
    "batteryLevel": 95,
    "status": "Online & Listening",
    "isPrimary": false,
    "lastPing": "Just now",
    "simulatedReply": "Room door is unlocked for you, hurry back!"
  }
]
```

---

## 2. Nearby Safe Places Mock Data

```json
[
  {
    "id": "sp-01",
    "name": "Apollo 24/7 Pharmacy",
    "category": "Pharmacy",
    "icon": "💊",
    "distanceMeters": 180,
    "estimatedWalkMinutes": 2,
    "address": "Shop 4, University Commercial Complex, Outer Ring Rd",
    "isOpen24Hours": true,
    "lightingRating": "High (Well-Lit Street)",
    "safetyTags": ["24/7 Staff", "CCTV Covered", "Security Guard", "Emergency First Aid"],
    "coordinates": { "lat": 28.6145, "lng": 77.2095 },
    "simulatedDirections": "Walk 100m straight past ATM, turn right at neon green cross sign."
  },
  {
    "id": "sp-02",
    "name": "North Gate Pink Police Help Booth",
    "category": "Police Assistance",
    "icon": "👮‍♀️",
    "distanceMeters": 290,
    "estimatedWalkMinutes": 4,
    "address": "University Main Gate No. 2, Police Kiosk",
    "isOpen24Hours": true,
    "lightingRating": "Maximum (Police High-Mast Light)",
    "safetyTags": ["Women Police Officers On Duty", "Direct ERSS Dispatch", "Safe Waiting Area"],
    "coordinates": { "lat": 28.6160, "lng": 77.2110 },
    "simulatedDirections": "Head North towards University Gate 2. Booth is next to security barrier."
  },
  {
    "id": "sp-03",
    "name": "Central Metro Station (Gate 3)",
    "category": "Transit Hub",
    "icon": "🚇",
    "distanceMeters": 420,
    "estimatedWalkMinutes": 6,
    "address": "Gate 3 Concourse, Central Line Metro",
    "isOpen24Hours": false,
    "operatingHours": "05:30 AM - 11:30 PM",
    "lightingRating": "High (Surveillance Zone)",
    "safetyTags": ["CISF Security", "Continuous Crowd", "Emergency SOS Pillar", "Escalator Access"],
    "coordinates": { "lat": 28.6180, "lng": 77.2135 },
    "simulatedDirections": "Continue along avenue 350m, follow illuminated Metro signage down concourse."
  },
  {
    "id": "sp-04",
    "name": "Cafe Coffee Day 24hr Express",
    "category": "Commercial Safe Haven",
    "icon": "☕",
    "distanceMeters": 510,
    "estimatedWalkMinutes": 7,
    "address": "Ground Floor, City Square Mall Complex",
    "isOpen24Hours": true,
    "lightingRating": "High (Bright Glass Frontage)",
    "safetyTags": ["24/7 Barista", "Crowded Seating", "Free Wi-Fi", "Indoor Seating"],
    "coordinates": { "lat": 28.6120, "lng": 77.2060 },
    "simulatedDirections": "Take crosswalk towards City Square Mall; cafe is on the ground floor corner."
  }
]
```

---

## 3. SafeWalk Preset Routes

```json
[
  {
    "id": "route-01",
    "title": "Campus Library ➔ Metro Station Gate 2",
    "description": "Standard night route across main university avenue.",
    "distanceKm": 1.2,
    "defaultDurationMinutes": 14,
    "checkInIntervalMinutes": 4,
    "startPoint": "Central University Library",
    "endPoint": "Metro Station Gate 2",
    "waypoints": [
      "Library Steps",
      "Science Quad Crosswalk",
      "Apollo Pharmacy Safe Point",
      "Metro Station Entrance"
    ]
  },
  {
    "id": "route-02",
    "title": "Academic Block B ➔ Girls Hostel 3",
    "description": "Inner campus illuminated pathway with security checkpoints.",
    "distanceKm": 0.8,
    "defaultDurationMinutes": 10,
    "checkInIntervalMinutes": 3,
    "startPoint": "Academic Block B",
    "endPoint": "Girls Hostel 3 Gate",
    "waypoints": [
      "Department Porch",
      "Sports Ground Perimeter",
      "Pink Police Help Booth",
      "Hostel Main Entrance"
    ]
  },
  {
    "id": "route-03",
    "title": "City Coaching Center ➔ City Bus Terminal",
    "description": "Urban main road route through commercial high street.",
    "distanceKm": 1.6,
    "defaultDurationMinutes": 18,
    "checkInIntervalMinutes": 5,
    "startPoint": "City Coaching Center",
    "endPoint": "City Bus Terminal Platform 4",
    "waypoints": [
      "Coaching Complex",
      "Cafe Coffee Day 24hr",
      "Civil Hospital Junction",
      "Bus Terminal"
    ]
  }
]
```

---

## 4. Simulated Fake Call Configuration

```json
{
  "callerName": "Papa (Dad)",
  "callerNumber": "+91 94150-XXXXX",
  "incomingRingtoneDurationMs": 15000,
  "simulatedAudioDialogue": [
    { "delayMs": 500, "speaker": "Papa", "text": "Haan beta, kahan tak pahunchi?" },
    { "delayMs": 3500, "speaker": "Papa", "text": "Main bas main gate pe khada hoon gaadi leke, jaldi aao." },
    { "delayMs": 6500, "speaker": "Papa", "text": "Phone kaatna mat, main call pe hoon." }
  ]
}
```

---

## 5. Simulated Emergency Broadcast Templates

```json
{
  "smsTemplates": {
    "cautionPing": "SAHELI ALERT [CAUTION]: {userName} feels uneasy near {location}. Battery: {battery}%. Live simulated track: https://saheli.local/track/{sessionId}",
    "sosEmergency": "EMERGENCY SOS: {userName} triggered SOS alert! Immediate assistance requested near {location} ({lat}, {lng}). Police 112 simulated alert logged.",
    "recoverySafe": "SAHELI NOTICE [SAFE]: {userName} has reached a verified safe location and cancelled the alert. Threat resolved."
  },
  "emergencyServices": {
    "police": { "code": "112", "service": "National Emergency Response Support System (ERSS)" },
    "womenHelpline": { "code": "1091", "service": "Women Safety Helpline" }
  }
}
```

---

## 6. Initial Incident Timeline Seed Data

```json
[
  {
    "id": "init-01",
    "timestamp": "18:00:00",
    "state": "SAFE",
    "title": "Platform Initialized",
    "description": "SAHELI System online. Guardian network pinged successfully. Battery at 89%."
  }
]
```
