import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';
import { useSafety } from '../../context/SafetyContext';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  User,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

/**
 * ActiveSafeWalk Component
 * Focused active journey experience.
 * Displays route, progress, check-in timer, safety status, and primary actions.
 */
export function ActiveSafeWalk({ className = '' }) {
  const {
    activeJourney,
    safetyState,
    performCheckIn,
    triggerUncomfortable,
    triggerEmergency,
    completeSafeWalk,
  } = useSafety();

  const from = activeJourney?.from || 'College Campus';
  const to = activeJourney?.to || 'Home';
  const eta = activeJourney?.expectedArrival || '7:30 PM';
  const progress = activeJourney?.progressPercentage ?? 35;
  const guardian = activeJourney?.guardianName || 'Mother';

  // Format seconds to mm:ss or "4 min"
  const secondsLeft = activeJourney?.checkInSecondsRemaining ?? 240;
  const minutesLeft = Math.ceil(secondsLeft / 60);
  const timeDisplay =
    secondsLeft > 60
      ? `${minutesLeft} min`
      : `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`;

  return (
    <Card className={`saheli-active-safewalk ${className}`}>
      {/* Top Header Badge Row */}
      <div className="active-safewalk__top">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="active-safewalk__pulse-dot" aria-hidden="true" />
          <span className="active-safewalk__label">SAFEWALK ACTIVE</span>
        </div>

        <div className="active-safewalk__status-chip">
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Status:</span>
          <StatusIndicator state={safetyState} showPulse={safetyState !== 'SAFE'} showLabel />
        </div>
      </div>

      {/* Origin & Destination Display */}
      <div className="active-safewalk__route">
        <div className="active-safewalk__location">
          <span className="active-safewalk__loc-label">From</span>
          <span className="active-safewalk__loc-val">{from}</span>
        </div>
        <div className="active-safewalk__route-arrow">
          <ArrowRight size={20} />
        </div>
        <div className="active-safewalk__location">
          <span className="active-safewalk__loc-label">To</span>
          <span className="active-safewalk__loc-val">{to}</span>
        </div>
      </div>

      {/* Route Progress & ETA Details */}
      <div className="active-safewalk__meta-grid">
        <div className="active-safewalk__meta-item">
          <Clock size={16} className="active-safewalk__meta-icon" />
          <div>
            <span className="meta-sub">ETA</span>
            <span className="meta-main">{eta}</span>
          </div>
        </div>

        <div className="active-safewalk__meta-item">
          <User size={16} className="active-safewalk__meta-icon" />
          <div>
            <span className="meta-sub">Guardian</span>
            <span className="meta-main">{guardian}</span>
          </div>
        </div>

        <div className="active-safewalk__meta-item">
          <ShieldCheck size={16} className="active-safewalk__meta-icon" />
          <div>
            <span className="meta-sub">Check-in</span>
            <span className="meta-main">Next check-in in {timeDisplay}</span>
          </div>
        </div>
      </div>

      {/* Journey Progress Bar */}
      <div className="active-safewalk__progress-block">
        <div className="active-safewalk__progress-header">
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Journey Progress
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
            {progress}%
          </span>
        </div>
        <div className="active-safewalk__progress-track">
          <div
            className="active-safewalk__progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>

      {/* Check-in Reminder Box */}
      <div className="active-safewalk__checkin-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="safe" size="sm">
            Check-In Active
          </Badge>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-state-safe-text)', fontWeight: 500 }}>
            Next periodic check-in in {timeDisplay}
          </span>
        </div>
      </div>

      {/* PRIMARY ACTIONS */}
      <div className="active-safewalk__actions">
        {/* Action 1: I'M SAFE */}
        <Button
          variant="success"
          size="lg"
          fullWidth
          icon={<ShieldCheck size={20} />}
          onClick={performCheckIn}
        >
          I'm Safe (Record Check-In)
        </Button>

        {/* Action 2: I'M UNCOMFORTABLE */}
        <Button
          variant="caution"
          size="lg"
          fullWidth
          icon={<AlertTriangle size={20} />}
          onClick={triggerUncomfortable}
        >
          I'm Uncomfortable
        </Button>

        {/* Action 3: EMERGENCY (ALWAYS CLEARLY ACCESSIBLE) */}
        <Button
          variant="danger"
          size="lg"
          fullWidth
          icon={<AlertOctagon size={20} />}
          onClick={triggerEmergency}
          className="emergency-action-btn"
        >
          Emergency (SOS)
        </Button>

        {/* Action 4: ARRIVED SAFELY (COMPLETE JOURNEY) */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          icon={<CheckCircle2 size={18} style={{ color: 'var(--color-state-safe)' }} />}
          onClick={completeSafeWalk}
        >
          Arrived Safely (Complete Journey)
        </Button>
      </div>
    </Card>
  );
}
