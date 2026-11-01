import { ShieldCheck, AlertTriangle, Flame, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { SAFETY_STATE_META } from '../../data/mockData';
import { Badge } from '../ui/Badge';

/**
 * Reusable SafetyStatusCard Component
 * Prominently and calmly communicates the user's active risk posture.
 */
export function SafetyStatusCard({
  state = 'SAFE',
  customTitle = null,
  customDescription = null,
  showActions = true,
  onResolve = null,
  onEscalate = null,
  className = '',
}) {
  const meta = SAFETY_STATE_META[state] || SAFETY_STATE_META.SAFE;

  const stateIcons = {
    SAFE: <ShieldCheck size={28} className="state-icon state-icon--safe" />,
    CAUTION: <AlertTriangle size={28} className="state-icon state-icon--caution" />,
    THREAT: <Flame size={28} className="state-icon state-icon--threat" />,
    EMERGENCY: <AlertOctagon size={28} className="state-icon state-icon--emergency" />,
    RECOVERED: <CheckCircle2 size={28} className="state-icon state-icon--recovered" />,
  };

  const badgeVariants = {
    SAFE: 'safe',
    CAUTION: 'caution',
    THREAT: 'threat',
    EMERGENCY: 'emergency',
    RECOVERED: 'recovered',
  };

  return (
    <div className={`saheli-safety-card saheli-safety-card--${state.toLowerCase()} ${className}`}>
      <div className="saheli-safety-card__top">
        <div className="saheli-safety-card__icon-wrapper">
          {stateIcons[state] || stateIcons.SAFE}
        </div>
        <div className="saheli-safety-card__badge-wrapper">
          <Badge variant={badgeVariants[state] || 'neutral'} size="sm">
            {meta.label}
          </Badge>
        </div>
      </div>

      <div className="saheli-safety-card__body">
        <h2 className="saheli-safety-card__title">
          {customTitle || meta.title}
        </h2>
        <p className="saheli-safety-card__description">
          {customDescription || meta.description}
        </p>
      </div>

      {showActions && (
        <div className="saheli-safety-card__actions">
          {state === 'EMERGENCY' && onResolve && (
            <button
              type="button"
              className="saheli-btn saheli-btn--success saheli-btn--md saheli-btn--full"
              onClick={onResolve}
            >
              <CheckCircle2 size={18} />
              <span>I'm Safe Now (De-escalate)</span>
            </button>
          )}

          {state === 'CAUTION' && onEscalate && (
            <button
              type="button"
              className="saheli-btn saheli-btn--danger saheli-btn--sm"
              onClick={onEscalate}
            >
              <AlertOctagon size={16} />
              <span>Escalate to Emergency</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
