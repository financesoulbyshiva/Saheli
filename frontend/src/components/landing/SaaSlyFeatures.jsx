import { Card } from '../ui/Card';
import { TiltCard } from '../ui/TiltCard';
import { useSafety } from '../../context/SafetyContext';
import {
  Navigation,
  AlertOctagon,
  MapPin,
  PhoneCall,
  Volume2,
  ShieldCheck,
  ArrowRight,
  Zap,
} from 'lucide-react';

/**
 * SaaSlyFeatures Component
 * Clean 6-feature grid matching TailGrids SaaSly architecture.
 * Generous whitespace, 3D perspective tilt cards, and actionable safety workflows.
 */
export function SaaSlyFeatures({ onOpenFakeCall }) {
  const { setActiveTab, triggerEmergency } = useSafety();

  const features = [
    {
      id: 'feat-safewalk',
      icon: <Navigation size={24} style={{ color: '#3758F9' }} />,
      tag: 'PREVENTION',
      tagColor: '#3758F9',
      title: 'Proactive SafeWalk Companion',
      description: 'Continuous route monitoring and automated check-in heartbeats before danger ever occurs. Notifies your trusted guardians if you stop moving or take an unexpected detour.',
      actionText: 'Setup SafeWalk',
      action: () => setActiveTab('safewalk'),
    },
    {
      id: 'feat-sos',
      icon: <AlertOctagon size={24} style={{ color: '#EF4444' }} />,
      tag: 'EMERGENCY',
      tagColor: '#EF4444',
      title: 'One-Tap Critical SOS Broadcast',
      description: 'Dispatches emergency SMS alerts with your live GPS coordinates, battery level, and medical details to all trusted contacts and coordinates with 112 services.',
      actionText: 'Review SOS Action',
      action: triggerEmergency,
    },
    {
      id: 'feat-places',
      icon: <MapPin size={24} style={{ color: '#10B981' }} />,
      tag: 'SANCTUARY',
      tagColor: '#10B981',
      title: 'Verified 24/7 Safe Havens',
      description: 'Physical verified sanctuaries including 24-hour pharmacies, hospital desks, campus gates, and metro stations staffed with personnel ready to shelter you.',
      actionText: 'Explore Havens',
      action: () => setActiveTab('places'),
    },
    {
      id: 'feat-fakecall',
      icon: <PhoneCall size={24} style={{ color: '#8B5CF6' }} />,
      tag: 'DE-ESCALATION',
      tagColor: '#8B5CF6',
      title: 'Discrete Fake Incoming Call',
      description: 'Simulates a realistic incoming phone call from "Papa", "Police Control", or "Brother" with full-screen ringing, audio simulation, and spoken dialogue prompts to gracefully exit risky situations.',
      actionText: 'Launch Fake Call',
      action: onOpenFakeCall,
    },
    {
      id: 'feat-siren',
      icon: <Volume2 size={24} style={{ color: '#F59E0B' }} />,
      tag: 'DETERRENT',
      tagColor: '#F59E0B',
      title: 'Web Audio Distress Siren',
      description: 'High-frequency 800Hz-1250Hz acoustic sweep generated client-side via the Web Audio API. Requires zero asset downloads and deters threats in crowded spaces immediately.',
      actionText: 'Simulator Console',
      action: () => setActiveTab('simulator'),
    },
    {
      id: 'feat-security',
      icon: <ShieldCheck size={24} style={{ color: '#06B6D4' }} />,
      tag: 'CRYPTOGRAPHY',
      tagColor: '#06B6D4',
      title: 'Zero-Knowledge Privacy Architecture',
      description: 'Zero coordinate tracking or location selling. Powered by salted scrypt password hashing, session key isolation, and SQLite WAL ACID persistence with strict user partition boundaries.',
      actionText: 'Privacy Specs',
      action: () => {
        const elem = document.getElementById('contact');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      },
    },
  ];

  return (
    <section id="features" className="saasly-features-section" style={{ padding: '5rem 0', backgroundColor: 'var(--color-bg-surface-subtle)' }}>
      <div className="app-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: 'rgba(55, 88, 249, 0.08)', border: '1px solid rgba(55, 88, 249, 0.2)', color: '#3758F9', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Zap size={15} />
            <span>INTELLIGENT DEFENSE CAPABILITIES</span>
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.025em', lineHeight: 1.25 }}>
            Engineered for Dignity, Speed, and Immediate Protection
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginTop: '0.75rem', lineHeight: 1.6 }}>
            Every feature is clinically designed to balance unobtrusive daily monitoring with decisive, fail-safe assistance during distress.
          </p>
        </div>

        {/* 6-Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {features.map((feat) => (
            <TiltCard key={feat.id} maxTilt={6}>
              <Card
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '2rem',
                  backgroundColor: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border-subtle)',
                  borderRadius: '18px',
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        backgroundColor: `${feat.tagColor}12`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${feat.tagColor}25`,
                      }}
                    >
                      {feat.icon}
                    </div>

                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        backgroundColor: `${feat.tagColor}15`,
                        color: feat.tagColor,
                        textTransform: 'uppercase',
                      }}
                    >
                      {feat.tag}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.625rem' }}>
                    {feat.title}
                  </h3>

                  <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {feat.description}
                  </p>
                </div>

                <div style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                  <button
                    type="button"
                    onClick={feat.action}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3758F9',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: 0,
                    }}
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </Card>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
