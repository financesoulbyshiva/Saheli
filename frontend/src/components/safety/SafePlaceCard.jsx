import { MapPin, Clock, ShieldCheck, Eye, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * Reusable SafePlaceCard Component
 * Displays verified shelters, open status, tags, and [ VIEW ] action.
 */
export function SafePlaceCard({
  place,
  onView = null,
  onImHere = null,
  isRecommended = false,
  className = '',
}) {
  const {
    name,
    category,
    distance,
    timeEst,
    address,
    openStatus,
    isVerified = true,
    safetyTags = ['CCTV', 'Security', 'First Aid', '24/7'],
    features = [],
  } = place;

  const displayTags = safetyTags && safetyTags.length > 0 ? safetyTags : features;

  return (
    <Card
      className={`saheli-safe-place-card ${isRecommended ? 'safe-place--recommended' : ''} ${className}`}
      style={{
        borderLeft: isRecommended ? '4px solid #10B981' : '1px solid var(--color-border-subtle)',
        background: isRecommended
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 20, 36, 0.85) 100%)'
          : 'var(--color-glass-bg)',
        borderColor: isRecommended ? 'rgba(16, 185, 129, 0.35)' : 'var(--color-border-subtle)',
        boxShadow: isRecommended ? '0 0 25px -4px rgba(16, 185, 129, 0.2)' : 'none',
      }}
    >
      {isRecommended && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.25rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--color-state-safe)' }} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-state-safe-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            RECOMMENDED SAFE PLACE
          </span>
        </div>
      )}

      {place.regionNotice && (
        <div
          style={{
            fontSize: '0.6875rem',
            color: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '3px 8px',
            borderRadius: '6px',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>📍 {place.regionNotice}</span>
        </div>
      )}

      <div className="saheli-safe-place-card__header">
        <div>
          <div className="saheli-safe-place-card__title-row">
            <h4 className="saheli-safe-place-card__name">{name}</h4>
            {isVerified && (
              <Badge variant="safe" size="sm" icon={<ShieldCheck size={12} />}>
                Verified
              </Badge>
            )}
          </div>
          <span className="saheli-safe-place-card__category">
            {category} {place.city ? `• ${place.city}` : ''}
          </span>
        </div>

        <div className="saheli-safe-place-card__distance-badge">
          <MapPin size={14} />
          <span>{distance}</span>
        </div>
      </div>

      <p className="saheli-safe-place-card__address">{address}</p>

      <div className="saheli-safe-place-card__meta">
        <span className="saheli-safe-place-card__hours">
          <Clock size={13} />
          <span>{openStatus}</span>
        </span>
        <span className="saheli-safe-place-card__time">
          ~{timeEst} walk
        </span>
      </div>

      {/* Safety Tags */}
      {displayTags.length > 0 && (
        <div className="saheli-safe-place-card__features">
          {displayTags.map((tag, idx) => (
            <span key={idx} className="saheli-safe-place-card__feature-chip">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="saheli-safe-place-card__footer" style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
        {onView && (
          <Button
            variant="secondary"
            size="sm"
            fullWidth={!onImHere}
            icon={<Eye size={15} />}
            onClick={() => onView(place)}
          >
            View
          </Button>
        )}

        {onImHere && (
          <Button
            variant="success"
            size="sm"
            fullWidth
            icon={<CheckCircle2 size={15} />}
            onClick={() => onImHere(place)}
          >
            I'm Here
          </Button>
        )}
      </div>
    </Card>
  );
}
