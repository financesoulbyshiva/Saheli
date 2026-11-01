import { Battery, Bell, Trash2, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * Reusable GuardianCard Component
 * Displays guardian details, priority tier, availability status,
 * and a direct [ ALERT GUARDIAN ] action with prototype disclosure.
 */
export function GuardianCard({
  guardian,
  onAlert = null,
  onRemove = null,
  className = '',
}) {
  const {
    id,
    name,
    relationship,
    phone,
    battery = 90,
    status = 'Available',
    availability = 'Available',
    priority = 'Secondary',
    isPrimary = false,
    isCustom = false,
  } = guardian;

  const isPrimaryGuardian = isPrimary || priority === 'Primary';

  return (
    <Card
      className={`saheli-guardian-card ${isPrimaryGuardian ? 'guardian-card--primary' : ''} ${className}`}
      style={{
        borderLeft: isPrimaryGuardian
          ? '4px solid var(--color-brand-primary)'
          : '3px solid var(--color-border-subtle)',
        background: isPrimaryGuardian
          ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(14, 20, 36, 0.85) 100%)'
          : 'var(--color-glass-bg)',
        borderColor: isPrimaryGuardian ? 'rgba(56, 189, 248, 0.35)' : 'var(--color-border-subtle)',
        boxShadow: isPrimaryGuardian ? '0 0 25px -4px rgba(56, 189, 248, 0.2)' : 'none',
      }}
    >
      {/* Primary Priority Header Banner */}
      {isPrimaryGuardian && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '0.5rem',
            marginBottom: '0.5rem',
            borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} style={{ color: 'var(--color-brand-primary)' }} />
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: 'var(--color-brand-primary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              PRIMARY GUARDIAN • FIRST TRUSTED CONTACT
            </span>
          </div>
          <Badge variant="primary" size="sm">
            Priority 1
          </Badge>
        </div>
      )}

      {/* Main Contact Row */}
      <div className="saheli-guardian-card__header">
        <div className="saheli-guardian-card__avatar-col">
          <div
            className="saheli-guardian-card__avatar"
            style={{
              background: isPrimaryGuardian
                ? 'linear-gradient(135deg, #0284C7 0%, #6366F1 100%)'
                : 'rgba(56, 189, 248, 0.12)',
              color: '#FFFFFF',
              boxShadow: isPrimaryGuardian ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none',
              border: isPrimaryGuardian ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <div className="saheli-guardian-card__name-row">
              <h4 className="saheli-guardian-card__name">{name}</h4>
              <Badge variant={isPrimaryGuardian ? 'primary' : 'neutral'} size="sm">
                {priority}
              </Badge>
            </div>
            <p className="saheli-guardian-card__relationship">
              Relationship: <strong>{relationship}</strong>
            </p>
          </div>
        </div>

        <div className="saheli-guardian-card__telemetry">
          <span className="saheli-guardian-card__battery" title="Device Battery Status" aria-label={`Device Battery Status: ${battery}%`}>
            <Battery size={14} className={battery < 30 ? 'battery--low' : 'battery--good'} />
            <span>{battery}%</span>
          </span>
        </div>
      </div>

      {/* Availability & Priority Info */}
      <div className="saheli-guardian-card__details">
        <div className="saheli-guardian-card__meta-item">
          <span className="saheli-guardian-card__status-dot" aria-hidden="true" />
          <span className="saheli-guardian-card__status-text">
            Status: <strong>{availability || status}</strong>
          </span>
        </div>
        <div className="saheli-guardian-card__phone" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {phone}
        </div>
      </div>

      {/* Action Footer */}
      <div className="saheli-guardian-card__footer" style={{ alignItems: 'center' }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
          Priority Safety Circle
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isCustom && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => onRemove(id)}
              ariaLabel={`Remove ${name}`}
              style={{ color: 'var(--color-state-emergency)' }}
            >
              Remove
            </Button>
          )}

          {onAlert && (
            <Button
              variant={isPrimaryGuardian ? 'danger' : 'secondary'}
              size="sm"
              icon={<Bell size={14} />}
              onClick={() => onAlert(guardian)}
              ariaLabel={`Alert guardian ${name}`}
            >
              Alert Guardian
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
