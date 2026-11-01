import { Navigation, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * Reusable JourneyCard Component
 * Displays live SafeWalk progression, check-in status, and quick intervention triggers.
 */
export function JourneyCard({
  journey,
  onCheckIn = null,
  onFeelUncomfortable = null,
  className = '',
}) {
  const {
    title,
    destination,
    estimatedMinutes,
    elapsedMinutes,
    progressPercentage = 0,
    nextCheckInInSeconds = 120,
  } = journey;

  const minutesRemaining = Math.max(0, estimatedMinutes - elapsedMinutes);
  const checkInMin = Math.floor(nextCheckInInSeconds / 60);
  const checkInSec = (nextCheckInInSeconds % 60).toString().padStart(2, '0');

  return (
    <Card className={`saheli-journey-card ${className}`}>
      <div className="saheli-journey-card__header">
        <div className="saheli-journey-card__title-col">
          <div className="saheli-journey-card__status-row">
            <span className="saheli-journey-card__live-dot" aria-hidden="true" />
            <span className="saheli-journey-card__live-text">SafeWalk Active</span>
            <Badge variant="safe" size="sm">
              Live Monitoring
            </Badge>
          </div>
          <h3 className="saheli-journey-card__title">{title}</h3>
        </div>

        <div className="saheli-journey-card__eta">
          <span className="saheli-journey-card__eta-val">{minutesRemaining} min</span>
          <span className="saheli-journey-card__eta-label">Remaining</span>
        </div>
      </div>

      <div className="saheli-journey-card__destination-row">
        <Navigation size={14} className="dest-icon" />
        <span className="dest-label">Destination:</span>
        <span className="dest-val">{destination}</span>
      </div>

      {/* Progress Bar */}
      <div className="saheli-journey-card__progress-block">
        <div className="saheli-journey-card__progress-track">
          <div
            className="saheli-journey-card__progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          />
        </div>
        <div className="saheli-journey-card__progress-labels">
          <span>{elapsedMinutes}m elapsed</span>
          <span>{progressPercentage}% completed</span>
        </div>
      </div>

      {/* Check-in Notification Pill */}
      <div className="saheli-journey-card__checkin-box">
        <div className="saheli-journey-card__checkin-info">
          <Clock size={16} />
          <div>
            <div className="saheli-journey-card__checkin-title">
              Safety Check-In in {checkInMin}:{checkInSec}
            </div>
            <div className="saheli-journey-card__checkin-desc">
              Guardians will be notified if not acknowledged
            </div>
          </div>
        </div>

        {onCheckIn && (
          <button
            type="button"
            className="saheli-btn saheli-btn--success saheli-btn--sm"
            onClick={onCheckIn}
          >
            <ShieldCheck size={14} />
            <span>I'm Safe</span>
          </button>
        )}
      </div>

      {/* Bottom Action for Proactive Assistance */}
      {onFeelUncomfortable && (
        <div className="saheli-journey-card__footer">
          <button
            type="button"
            className="saheli-btn saheli-btn--caution saheli-btn--md saheli-btn--full"
            onClick={onFeelUncomfortable}
          >
            <AlertTriangle size={18} />
            <span>I'm Uncomfortable — Get Assistance</span>
          </button>
        </div>
      )}
    </Card>
  );
}
