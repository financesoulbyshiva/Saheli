import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Navigation, Users, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * OnboardingModal Component
 * Guides new users through SAHELI's proactive women safety paradigm.
 */
export function OnboardingModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'Proactive SafeWalk Companion',
      subtitle: 'Safety before the emergency',
      description:
        'Traditional panic buttons only help after an attack starts. SafeWalk monitors your journey before danger arises, running automated periodic check-ins. If a check-in is missed, your guardians are automatically alerted.',
      icon: <Navigation size={32} style={{ color: 'var(--color-brand-primary)' }} />,
      badge: 'PREVENT',
      badgeVariant: 'safe',
    },
    {
      step: 2,
      title: 'Trusted Guardian Network',
      subtitle: 'Your circle of immediate protection',
      description:
        'Assign trusted family members, roommates, and friends to your safety network. Set a Primary Guardian who receives priority standby alerts and live GPS tracking when elevated risk is detected.',
      icon: <Users size={32} style={{ color: 'var(--color-brand-secondary)' }} />,
      badge: 'ASSIST',
      badgeVariant: 'caution',
    },
    {
      step: 3,
      title: 'Discomfort De-escalation & Safe Havens',
      subtitle: 'Move toward verified public safety',
      description:
        'Feeling uneasy? Tap "I\'m Uncomfortable" to route toward verified 24/7 pharmacies, security posts, and open public shelters nearby, or tap the Crimson SOS button for immediate crisis intervention.',
      icon: <ShieldAlert size={32} style={{ color: 'var(--color-state-emergency)' }} />,
      badge: 'ESCALATE',
      badgeVariant: 'emergency',
    },
  ];

  const current = steps[step - 1];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      try {
        localStorage.setItem('saheli_onboarded', 'true');
      } catch {
        // Local storage unavailable
      }
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome to SAHELI"
      size="sm"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                style={{
                  width: s === step ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: s === step ? 'var(--color-brand-primary)' : 'rgba(255, 255, 255, 0.18)',
                  boxShadow: s === step ? '0 0 8px var(--color-brand-primary)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>

          <Button variant="primary" size="md" icon={step === 3 ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />} onClick={handleNext}>
            {step === 3 ? 'Get Started' : 'Next Step'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center', padding: '0.5rem 0' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.28)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.2)',
          }}
        >
          {current.icon}
        </div>

        <div>
          <Badge variant={current.badgeVariant} size="sm">
            Phase {current.step}: {current.badge}
          </Badge>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '0.5rem' }}>
            {current.title}
          </h3>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-brand-secondary)' }}>
            "{current.subtitle}"
          </span>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
          {current.description}
        </p>
      </div>
    </Modal>
  );
}
