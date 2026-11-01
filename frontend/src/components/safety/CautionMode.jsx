import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SafePlaceCard } from './SafePlaceCard';
import { useSafety } from '../../context/SafetyContext';
import {
  AlertTriangle,
  MapPin,
  Bell,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';

/**
 * CautionMode Component
 * Dedicated de-escalation screen when user feels uncomfortable.
 * Provides calm, supportive, structured steps towards safety.
 */
export function CautionMode({ onViewSafePlace = null, onTriggerFakeCall = null, className = '' }) {
  const {
    safePlaces,
    guardians,
    identifySafePlace,
    alertGuardian,
    checkInAtSafePlace,
    escalateToThreat,
    resolveEmergency,
    selectedSafePlace,
    alertedGuardian,
  } = useSafety();

  const [showSafePlaceCard, setShowSafePlaceCard] = useState(false);
  const [guardianAlertConfirmed, setGuardianAlertConfirmed] = useState(false);

  const nearestPlace = selectedSafePlace || safePlaces[1] || safePlaces[0]; // Apollo 24/7 Pharmacy
  const primaryGuardian = alertedGuardian || guardians[0]; // Mother

  const handleFindSafePlace = () => {
    identifySafePlace(nearestPlace);
    setShowSafePlaceCard(true);
  };

  const handleAlertGuardian = () => {
    alertGuardian(primaryGuardian);
    setGuardianAlertConfirmed(true);
  };

  return (
    <div className={`saheli-caution-view ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Caution Mode Header Card */}
      <Card className="caution-mode-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(14, 20, 36, 0.85) 100%)', borderColor: 'rgba(245, 158, 11, 0.35)', boxShadow: '0 0 25px rgba(245, 158, 11, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: '#FBBF24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FBBF24' }}>
              CAUTION MODE
            </h2>
          </div>
          <Badge variant="caution" size="sm">Active</Badge>
        </div>

        <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
          You're feeling uncomfortable. Let's help you move toward safety.
        </p>

        {/* Recommended Actions List */}
        <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#FBBF24', marginBottom: '0.5rem' }}>
            Recommended Steps:
          </div>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <li>Find a verified safe place nearby</li>
            <li>Alert your trusted guardian to standby</li>
            <li>Stay connected and keep moving towards light</li>
            <li>Escalate immediately if the situation worsens</li>
          </ol>
        </div>
      </Card>

      {/* Primary Caution Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
        {/* Action 1: Find Safe Place */}
        <Button
          variant="secondary"
          size="lg"
          icon={<MapPin size={18} />}
          onClick={handleFindSafePlace}
          style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem' }}
        >
          <span>Find Safe Place</span>
        </Button>

        {/* Action 2: Alert Guardian */}
        <Button
          variant="secondary"
          size="lg"
          icon={<Bell size={18} />}
          onClick={handleAlertGuardian}
          style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem' }}
        >
          <span>Alert Guardian ({primaryGuardian.name})</span>
        </Button>

        {/* Action 3: Discrete Fake Call (Exit Strategy) */}
        {onTriggerFakeCall && (
          <Button
            variant="secondary"
            size="lg"
            icon={<PhoneCall size={18} style={{ color: '#818CF8' }} />}
            onClick={onTriggerFakeCall}
            style={{
              justifyContent: 'flex-start',
              padding: '0.875rem 1rem',
              borderColor: 'rgba(99, 102, 241, 0.35)',
              background: 'rgba(99, 102, 241, 0.1)',
              color: '#FFFFFF',
            }}
          >
            <span>Discrete Fake Call (Excuse to Exit)</span>
          </Button>
        )}
      </div>

      {/* Conditional Safe Place Card Display (RECOMMENDED SAFE PLACE) */}
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
                {primaryGuardian.name} has received your simulated alert.
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Bottom Action Grid: Escalate or I'm Safe */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        {/* ESCALATE */}
        <Button
          variant="danger"
          size="lg"
          fullWidth
          icon={<TrendingUp size={20} />}
          onClick={escalateToThreat}
        >
          Escalate Situation
        </Button>

        {/* I'M SAFE */}
        <Button
          variant="success"
          size="md"
          fullWidth
          icon={<ShieldCheck size={18} />}
          onClick={resolveEmergency}
        >
          I'm Safe Now (Return to Normal)
        </Button>
      </div>
    </div>
  );
}
