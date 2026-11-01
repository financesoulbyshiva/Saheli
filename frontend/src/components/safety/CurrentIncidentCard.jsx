import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useSafety } from '../../context/SafetyContext';
import { AlertTriangle, ShieldCheck, Flame, AlertOctagon, ArrowRight } from 'lucide-react';

/**
 * CurrentIncidentCard Component
 * Displays real-time incident status banner on the dashboard.
 * Adapts between active safety event (CAUTION/THREAT/EMERGENCY) and "NO ACTIVE INCIDENT".
 */
export function CurrentIncidentCard({ onOpenSafetyMode = null, className = '' }) {
  const { safetyState, currentIncident } = useSafety();

  const badgeMap = {
    SAFE: 'safe',
    CAUTION: 'caution',
    THREAT: 'threat',
    EMERGENCY: 'emergency',
    RECOVERED: 'recovered',
  };

  const stateIconMap = {
    CAUTION: <AlertTriangle size={20} className="state-icon--caution" />,
    THREAT: <Flame size={20} className="state-icon--threat" />,
    EMERGENCY: <AlertOctagon size={20} className="state-icon--emergency" />,
  };

  if (!currentIncident?.hasActive) {
    return (
      <Card
        className={`saheli-incident-banner saheli-incident-banner--safe ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 20, 36, 0.75) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderLeft: '4px solid #10B981',
          padding: '0.875rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} style={{ color: '#10B981' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#34D399', letterSpacing: '0.04em' }}>
                NO ACTIVE INCIDENT
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                You're currently safe. Standard SafeWalk monitoring is active.
              </div>
            </div>
          </div>

          <Badge variant="safe" size="sm">
            Normal Monitoring
          </Badge>
        </div>
      </Card>
    );
  }

  // Active Incident State (CAUTION / THREAT / EMERGENCY)
  const isEmergency = safetyState === 'EMERGENCY';
  const isThreat = safetyState === 'THREAT';

  return (
    <Card
      className={`saheli-incident-banner saheli-incident-banner--active ${className}`}
      style={{
        background: isEmergency
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(14, 20, 36, 0.9) 100%)'
          : isThreat
          ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.14) 0%, rgba(14, 20, 36, 0.85) 100%)'
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(14, 20, 36, 0.85) 100%)',
        borderColor: isEmergency
          ? 'rgba(239, 68, 68, 0.45)'
          : isThreat
          ? 'rgba(249, 115, 22, 0.38)'
          : 'rgba(245, 158, 11, 0.35)',
        borderLeft: `5px solid var(--color-state-${safetyState.toLowerCase()})`,
        boxShadow: isEmergency
          ? 'var(--shadow-emergency)'
          : isThreat
          ? '0 0 24px rgba(249, 115, 22, 0.25)'
          : '0 0 20px rgba(245, 158, 11, 0.2)',
        padding: '1rem 1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ marginTop: '2px' }}>
            {stateIconMap[safetyState] || <AlertTriangle size={20} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: `var(--color-state-${safetyState.toLowerCase()}-text)`,
                }}
              >
                CURRENT SAFETY EVENT
              </span>
              <Badge variant={badgeMap[safetyState] || 'neutral'} size="sm">
                Status: {safetyState}
              </Badge>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Started: <strong>{currentIncident.startedTime}</strong> • Action:{' '}
              <strong style={{ color: `var(--color-state-${safetyState.toLowerCase()}-dark)` }}>
                {currentIncident.action}
              </strong>
            </div>
          </div>
        </div>

        {onOpenSafetyMode && (
          <Button
            variant={isEmergency ? 'danger' : isThreat ? 'caution' : 'secondary'}
            size="sm"
            icon={<ArrowRight size={16} />}
            onClick={onOpenSafetyMode}
          >
            Open Safety Mode
          </Button>
        )}
      </div>
    </Card>
  );
}
