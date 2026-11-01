import { useState } from 'react';
import { Button } from '../ui/Button';
import { TiltCard } from '../ui/TiltCard';
import { useSafety } from '../../context/SafetyContext';
import {
  Users,
  Navigation,
  PhoneCall,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

/**
 * SaaSlyHowItWorks Component
 * Interactive 4-step progressive timeline matching TailGrids SaaSly template.
 * Clear, numbered steps walking users from setup through emergency resolution.
 */
export function SaaSlyHowItWorks({ onOpenFakeCall }) {
  const { setActiveTab } = useSafety();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Configure Your Trusted Circle',
      badge: 'ACCOUNT SETUP',
      icon: <Users size={24} style={{ color: '#3758F9' }} />,
      desc: 'Add your primary family members and standby friends to your trusted network. Their phone numbers are securely verified and alerted first in any safety escalation.',
      actionLabel: 'Manage Guardians',
      action: () => setActiveTab('guardians'),
      details: [
        'Primary contact alerted within 2 seconds of status change',
        'Secondary standby circle notified on threat escalation',
        'Automatic battery & live signal sync',
      ],
    },
    {
      number: '02',
      title: 'Start SafeWalk Journey Companion',
      badge: 'PROACTIVE MONITORING',
      icon: <Navigation size={24} style={{ color: '#10B981' }} />,
      desc: 'Before stepping into a late cab, auto, or deserted street, activate SafeWalk. The platform tracks your route waypoints and prompts automated safety heartbeats.',
      actionLabel: 'Launch SafeWalk',
      action: () => setActiveTab('safewalk'),
      details: [
        'Heartbeat intervals prompt check-ins every 3-10 minutes',
        'Auto-escalates to Caution if you stray off course or stop moving',
        'Continuous encrypted waypoint logging',
      ],
    },
    {
      number: '03',
      title: 'De-escalate Unwanted Situations Discretely',
      badge: 'DISCRETE EXIT',
      icon: <PhoneCall size={24} style={{ color: '#8B5CF6' }} />,
      desc: 'If you feel uncomfortable or stalked, avoid immediate confrontation. Trigger a realistic simulated incoming phone call or view verified safe places nearby.',
      actionLabel: 'Test Fake Call',
      action: onOpenFakeCall,
      details: [
        'Realistic caller profiles ("Papa", "Police Control", "Brother")',
        'In-call audio simulation and verbal dialogue prompter',
        'Nearest safe havens located within 300 meters',
      ],
    },
    {
      number: '04',
      title: 'Immediate 112 & Guardian SOS Broadcast',
      badge: 'LIFE-CRITICAL RESPONSE',
      icon: <ShieldAlert size={24} style={{ color: '#EF4444' }} />,
      desc: 'When danger is active, press the high-contrast SOS button. Your exact coordinates are broadcasted to all guardians, 112 hotlines, and an optional 800Hz distress siren sounds.',
      actionLabel: 'Launch Simulator',
      action: () => setActiveTab('simulator'),
      details: [
        'High-contrast emergency HUD with rapid police dialer',
        'Synthetic Web Audio distress siren deters aggressors',
        'Turn-by-turn navigation directly to the nearest staffed safe haven',
      ],
    },
  ];

  return (
    <section id="how-it-works" className="saasly-how-it-works-section" style={{ padding: '5.5rem 0' }}>
      <div className="app-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: 'rgba(55, 88, 249, 0.08)', border: '1px solid rgba(55, 88, 249, 0.2)', color: '#3758F9', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Sparkles size={15} />
            <span>PROGRESSIVE SAFETY CONTINUUM</span>
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.025em', lineHeight: 1.25 }}>
            How SAHELI Works in Everyday Life
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginTop: '0.75rem', lineHeight: 1.6 }}>
            A four-step safety architecture built to protect you proactively before an incident, de-escalate during discomfort, and respond decisively during an emergency.
          </p>
        </div>

        {/* 4-Step Interactive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
          {steps.map((st, idx) => {
            const isSelected = activeStep === idx;
            return (
              <TiltCard key={st.number} maxTilt={6}>
                <div
                  onClick={() => setActiveStep(idx)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveStep(idx)}
                  role="button"
                  tabIndex={0}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '2rem',
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid',
                    borderColor: isSelected ? '#3758F9' : 'var(--color-border-subtle)',
                    borderRadius: '20px',
                    boxShadow: isSelected ? '0 16px 36px -10px rgba(55, 88, 249, 0.15)' : '0 10px 30px -10px rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Top Step Number & Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                      <span
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 900,
                          fontFamily: 'var(--font-family-mono)',
                          color: isSelected ? '#3758F9' : 'var(--color-text-muted)',
                        }}
                      >
                        {st.number}
                      </span>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(55, 88, 249, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {st.icon}
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.1875rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                      {st.title}
                    </h3>

                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {st.desc}
                    </p>

                    {/* Step Micro-details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                      {st.details.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step Action Button */}
                  <div>
                    <Button
                      variant={isSelected ? 'primary' : 'secondary'}
                      size="sm"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        st.action();
                      }}
                      style={{ borderRadius: '10px', fontWeight: 700 }}
                    >
                      {st.actionLabel}
                    </Button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
