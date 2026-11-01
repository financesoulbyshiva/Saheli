import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Clock, Activity } from 'lucide-react';

/**
 * Reusable Timeline Component
 * Chronologically displays safety events, state transitions, and simulated alerts.
 */
export function Timeline({
  events = [],
  title = 'INCIDENT TIMELINE',
  subtitle = 'Chronological log of safety actions and alerts',
  className = '',
}) {
  const badgeMap = {
    SAFE: 'safe',
    CAUTION: 'caution',
    THREAT: 'threat',
    EMERGENCY: 'emergency',
    RECOVERED: 'recovered',
  };

  return (
    <Card className={`saheli-timeline-card ${className}`}>
      {title && (
        <div className="saheli-timeline-header" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} className="timeline-header-icon" />
              <div>
                <h3 className="saheli-timeline-title" style={{ fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                  {title}
                </h3>
                {subtitle && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              <Clock size={12} />
              <span>Incident Timeline</span>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <p className="saheli-timeline-empty">No activity logged yet.</p>
      ) : (
        <div className="saheli-timeline">
          {events.map((item, index) => {
            const isLast = index === events.length - 1;
            const state = item.state || 'SAFE';

            return (
              <div key={item.id || index} className={`saheli-timeline-item ${isLast ? 'is-last' : ''}`}>
                <div className="saheli-timeline-gutter">
                  <span
                    className={`saheli-timeline-dot saheli-timeline-dot--${state.toLowerCase()}`}
                    aria-hidden="true"
                  />
                  {!isLast && <span className="saheli-timeline-line" aria-hidden="true" />}
                </div>

                <div className="saheli-timeline-content">
                  <div className="saheli-timeline-meta">
                    <span className="saheli-timeline-time" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {item.timestamp}
                    </span>
                    <Badge variant={badgeMap[state] || 'neutral'} size="sm">
                      {state}
                    </Badge>
                  </div>
                  <h4 className="saheli-timeline-event-title">{item.title}</h4>
                  <p className="saheli-timeline-event-desc">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
