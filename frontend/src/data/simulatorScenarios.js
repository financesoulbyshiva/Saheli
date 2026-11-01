/**
 * SAHELI — Safety Simulator Scenarios Data
 * 100% Client-side educational presentation scenarios.
 * Designed for college evaluation and interactive live demonstrations.
 */

export const SIMULATOR_SCENARIOS = [
  {
    id: 'sc-1',
    title: 'NORMAL JOURNEY',
    description: 'User completes a routine SafeWalk.',
    safetyLevel: 'SAFE',
    badgeVariant: 'safe',
    isRecommended: false,
    steps: [
      {
        title: 'Journey Started',
        state: 'SAFE',
        description: 'SafeWalk session initiated: College Campus to Home (ETA: 7:30 PM).',
        action: 'Route monitoring active. Check-in countdown initialized.',
      },
      {
        title: 'Check-in',
        state: 'SAFE',
        description: 'Periodic 5-minute safety check-in prompt displayed and confirmed.',
        action: 'User confirmed "I\'m Safe". Timer reset.',
      },
      {
        title: 'Destination Reached',
        state: 'SAFE',
        description: 'User safely arrives at destination Home.',
        action: 'SafeWalk completed normally. Guardians notified of safe arrival.',
      },
      {
        title: 'SAFE',
        state: 'SAFE',
        description: 'Routine journey concluded with zero risk escalation.',
        action: 'All systems return to baseline monitoring.',
      },
    ],
  },
  {
    id: 'sc-2',
    title: 'FEELING UNSAFE',
    description: 'User begins feeling uncomfortable during a journey.',
    safetyLevel: 'CAUTION',
    badgeVariant: 'caution',
    isRecommended: false,
    steps: [
      {
        title: 'Journey Started',
        state: 'SAFE',
        description: 'SafeWalk active along main campus avenue.',
        action: 'Standard monitoring in progress.',
      },
      {
        title: 'User reports discomfort',
        state: 'CAUTION',
        description: 'User notices an uneasy situation and taps "I\'m Uncomfortable".',
        action: 'System immediately shifts to CAUTION mode.',
      },
      {
        title: 'CAUTION MODE',
        state: 'CAUTION',
        description: 'Cautious posture armed. De-escalation toolkit surfaced.',
        action: 'De-escalation guidance and nearby shelters active.',
      },
      {
        title: 'Safe Place Recommended',
        state: 'CAUTION',
        description: 'Apollo 24/7 Pharmacy (240m away) highlighted with directions.',
        action: 'User begins moving towards well-lit verified haven.',
      },
      {
        title: 'Guardian Alert Simulated',
        state: 'CAUTION',
        description: 'Mother receives simulated silent standby alert with location track.',
        action: 'Primary contact placed on alert standby.',
      },
      {
        title: 'SAFE',
        state: 'SAFE',
        description: 'User reaches populated public area and marks themselves safe.',
        action: 'Threat averted through proactive intervention.',
      },
    ],
  },
  {
    id: 'sc-3',
    title: 'MISSED CHECK-IN',
    description: 'User misses a scheduled safety check-in.',
    safetyLevel: 'CAUTION',
    badgeVariant: 'caution',
    isRecommended: false,
    steps: [
      {
        title: 'Journey Started',
        state: 'SAFE',
        description: 'SafeWalk active with periodic check-in intervals.',
        action: 'Check-in timer counting down.',
      },
      {
        title: 'Check-in missed',
        state: 'CAUTION',
        description: 'Timer expires with no user acknowledgement.',
        action: 'System proactively escalates to CAUTION mode.',
      },
      {
        title: 'CAUTION MODE',
        state: 'CAUTION',
        description: 'Elevated awareness triggered due to unresponsive check-in.',
        action: 'System checks in with user with audible soft chime.',
      },
      {
        title: 'Guardian Alert Simulated',
        state: 'CAUTION',
        description: 'Mother notified of missed check-in along route.',
        action: 'Guardian receives simulated heads-up alert.',
      },
      {
        title: 'User confirms safety',
        state: 'SAFE',
        description: 'User confirms on screen: "I was busy walking, all good!".',
        action: 'Check-in acknowledged; guardians updated.',
      },
      {
        title: 'SAFE',
        state: 'SAFE',
        description: 'Status returns to normal SAFE monitoring.',
        action: 'Journey continues without incident.',
      },
    ],
  },
  {
    id: 'sc-4',
    title: 'BEING FOLLOWED',
    description: 'User believes someone may be following them.',
    safetyLevel: 'EMERGENCY',
    badgeVariant: 'emergency',
    isRecommended: true,
    recommendationNote: "Best for demonstrating SAHELI's complete escalation and recovery flow.",
    steps: [
      {
        title: 'Journey Started',
        state: 'SAFE',
        description: 'SafeWalk companion session active: Library to Hostel.',
        action: 'Monitoring route ETA and guardian link.',
      },
      {
        title: 'User reports discomfort',
        state: 'CAUTION',
        description: 'User notices an unknown person following footsteps; taps "I\'m Uncomfortable".',
        action: 'System enters CAUTION mode with amber UI treatment.',
      },
      {
        title: 'CAUTION MODE',
        state: 'CAUTION',
        description: 'Proactive de-escalation suite armed. Fake call & safe havens ready.',
        action: 'Screen provides immediate guidance and discrete tools.',
      },
      {
        title: 'Safe place recommended',
        state: 'CAUTION',
        description: 'Nearest verified haven identified: Apollo 24/7 Pharmacy (240m away).',
        action: 'Directions displayed to well-lit store with 24/7 staff.',
      },
      {
        title: 'Guardian alert simulated',
        state: 'CAUTION',
        description: 'Primary guardian (Mother) alerted to standby and keep phone nearby.',
        action: 'Simulated standby ping logged.',
      },
      {
        title: 'THREAT MODE',
        state: 'THREAT',
        description: 'Follower accelerates and closes distance; user escalates to THREAT.',
        action: 'Emergency SOS button armed with full-screen priority focus.',
      },
      {
        title: 'Emergency mode',
        state: 'EMERGENCY',
        description: 'SOS activated! High-urgency alert screen with simulated alerts.',
        action: 'Simulated emergency response sequence prepared and logged.',
      },
      {
        title: 'User marked safe',
        state: 'RECOVERED',
        description: 'User safely reaches haven and confirms safety: "I\'m Safe".',
        action: 'Simulated all-clear sent to guardians. Incident de-escalating.',
      },
      {
        title: 'RECOVERED',
        state: 'RECOVERED',
        description: 'System transitions through RECOVERED debrief and records event.',
        action: 'Reassurance logged and active incident marked resolved.',
      },
      {
        title: 'SAFE',
        state: 'SAFE',
        description: 'System returns to baseline SAFE monitoring posture.',
        action: 'Normal baseline monitoring resumed.',
      },
    ],
  },
  {
    id: 'sc-5',
    title: 'EMERGENCY',
    description: 'User directly activates emergency assistance.',
    safetyLevel: 'EMERGENCY',
    badgeVariant: 'emergency',
    isRecommended: false,
    steps: [
      {
        title: 'Emergency Activated',
        state: 'EMERGENCY',
        description: 'User directly taps high-visibility SOS button from Dashboard.',
        action: 'Full-screen emergency mode engaged immediately.',
      },
      {
        title: 'Guardian Alert Simulated',
        state: 'EMERGENCY',
        description: 'Simulated priority broadcast prepared for Mother, Father, and Priya.',
        action: 'Mock GPS coordinates attached to simulated guardian alert.',
      },
      {
        title: 'Safe Place Identified',
        state: 'EMERGENCY',
        description: 'System identifies nearest haven: College Campus Security Post (120m).',
        action: 'Evacuation target suggested on emergency HUD.',
      },
      {
        title: 'Incident Created',
        state: 'EMERGENCY',
        description: 'High-priority incident record logged in system audit ledger.',
        action: 'Forensic timeline created with precise timestamps.',
      },
      {
        title: 'User marked safe',
        state: 'RECOVERED',
        description: 'Security officers arrive; user taps "I\'m Safe (Resolve Emergency)".',
        action: 'Simulated all-clear broadcasted to guardians.',
      },
      {
        title: 'RECOVERED',
        state: 'RECOVERED',
        description: 'Incident de-escalation confirmed and recovery debrief initiated.',
        action: 'Emergency state de-escalated and archived in incident log.',
      },
      {
        title: 'SAFE',
        state: 'SAFE',
        description: 'Emergency resolved. Normal monitoring restored.',
        action: 'System safely returned to baseline posture.',
      },
    ],
  },
];
