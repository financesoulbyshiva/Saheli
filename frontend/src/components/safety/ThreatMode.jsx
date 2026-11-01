import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SafePlaceCard } from './SafePlaceCard';
import { EmergencyButton } from './EmergencyButton';
import { useSafety } from '../../context/SafetyContext';
import {
  Flame,
  MapPin,
  Bell,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

/**
 * ThreatMode Component
 * Screen displayed when situation escalates to THREAT.
 * Keeps Emergency activation prominently accessible while offering rapid safe place & guardian aids.
 */
export function ThreatMode({ onViewSafePlace = null, className = '' }) {
  const {
    safePlaces,
    guardians,
    identifySafePlace,
    alertGuardian,
    checkInAtSafePlace,
    triggerEmergency,
    resolveEmergency,
    selectedSafePlace,
    alertedGuardian,
  } = useSafety();

  const [showSafePlaceCard, setShowSafePlaceCard] = useState(false);
  const [guardianAlertConfirmed, setGuardianAlertConfirmed] = useState(false);

  const nearestPlace = selectedSafePlace || safePlaces[1] || safePlaces[0];
  const primaryGuardian = alertedGuardian || guardians[0];

  const handleFindSafePlace = () => {
    identifySafePlace(nearestPlace);
    setShowSafePlaceCard(true);
  };

  const handleAlertGuardian = () => {
    alertGuardian(primaryGuardian);
    setGuardianAlertConfirmed(true);
  };

  return (
    <div className={`saheli-threat-view ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Threat Mode Header Card */}
      <Card
        className="threat-mode-card"
        style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.14) 0%, rgba(14, 20, 36, 0.85) 100%)',
          borderColor: 'rgba(249, 115, 22, 0.4)',
          borderLeft: '4px solid #F97316',
          boxShadow: '0 0 25px rgba(249, 115, 22, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(249, 115, 22, 0.25)',
                color: '#FB923C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(249, 115, 22, 0.35)',
              }}
            >
              <Flame size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FB923C' }}>
              THREAT MODE
            </h2>
          </div>
          <Badge variant="threat" size="sm">Elevated Risk</Badge>
        </div>

        <p style={{ fontSize: '0.9375rem', color: '#FB923C', lineHeight: 1.5, fontWeight: 600 }}>
          Your situation may require immediate assistance.
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Emergency services and guardian standby are armed. Move towards open public areas immediately.
        </p>
      </Card>

      {/* HIGHEST PRIORITY ACTION: ACTIVATE EMERGENCY */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-state-emergency-text)', marginBottom: '0.5rem' }}>
          Immediate Crisis Action:
        </div>
        <EmergencyButton
          variant="hero"
          label="Activate Emergency (SOS)"
          sublabel="Tap to trigger emergency response simulation"
          onTrigger={triggerEmergency}
        />
      </div>

      {/* Secondary Recommended Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        <Button
          variant="secondary"
          size="lg"
          icon={<MapPin size={18} />}
          onClick={handleFindSafePlace}
          style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem' }}
        >
          <span>Find Safe Place</span>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          icon={<Bell size={18} />}
          onClick={handleAlertGuardian}
          style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem' }}
        >
          <span>Alert Guardian ({primaryGuardian.name})</span>
        </Button>
      </div>

      {/* Conditional Safe Place Card Display */}
      {showSafePlaceCard && (
        <div>
          <SafePlaceCard
            place={nearestPlace}
            isRecommended={true}
            onView={onViewSafePlace}
            onImHere={() => checkInAtSafePlace(nearestPlace)}
          />
        </div>
      )}

      {/* Conditional Guardian Alert Confirmation */}
      {guardianAlertConfirmed && (
        <Card style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--color-bg-surface)', borderLeft: '4px solid var(--color-state-safe)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--color-state-safe)' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Guardian Standby Active
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {primaryGuardian.name} is on priority simulated alert.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Bottom De-escalation: I'M SAFE */}
      <div style={{ marginTop: '0.5rem' }}>
        <Button
          variant="success"
          size="md"
          fullWidth
          icon={<ShieldCheck size={18} />}
          onClick={resolveEmergency}
        >
          I'm Safe (Cancel Threat & De-escalate)
        </Button>
      </div>
    </div>
  );
}
