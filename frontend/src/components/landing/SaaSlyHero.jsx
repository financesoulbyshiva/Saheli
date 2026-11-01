import { Safety3DCanvas } from '../three/Safety3DCanvas';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TiltCard } from '../ui/TiltCard';
import { useSafety } from '../../context/SafetyContext';
import {
  ShieldCheck,
  Navigation,
  PhoneCall,
  MessageSquare,
  Lock,
  MapPin,
  HeartHandshake,
  Radio,
} from 'lucide-react';

/**
 * SaaSlyHero Component
 * Spacious, modern hero section matching TailGrids SaaSly template.
 * Features an interactive Three.js 3D safety shield, floating telemetry cards,
 * and high-impact conversion CTAs.
 */
export function SaaSlyHero({ onOpenFakeCall }) {
  const { safetyState, setSafetyState, setActiveTab, guardians, safePlaces } = useSafety();

  const primaryGuardian = guardians.find((g) => g.isPrimary) || guardians[0];
  const nearestPlace = safePlaces[1] || safePlaces[0];

  return (
    <section id="home" className="saasly-hero-section" style={{ padding: '4.5rem 0 5rem 0', overflow: 'hidden', position: 'relative' }}>
      <div className="app-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
          {/* Left Column: Value Proposition & CTAs */}
          <div>
            {/* Trust Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(55, 88, 249, 0.08)',
                border: '1px solid rgba(55, 88, 249, 0.2)',
                color: '#3758F9',
                fontSize: '0.8125rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
              }}
            >
              <ShieldCheck size={16} />
              <span>VERIFIED WOMEN SAFETY & ASSISTANCE NETWORK</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              Dignified Safety & Instant Assistance for Every Journey.
            </h1>

            {/* Sub-headline */}
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.65,
                color: 'var(--color-text-secondary)',
                marginTop: '1.25rem',
                maxWidth: '560px',
              }}
            >
              Proactive journey tracking, discrete de-escalation tools, ready-to-use one-tap emergency messages, and verified 24/7 physical safe havens designed for real-world women safety.
            </p>

            {/* Action CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '2rem' }}>
              <Button
                variant="primary"
                size="lg"
                icon={<Navigation size={18} />}
                onClick={() => setActiveTab('safewalk')}
                style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 700 }}
              >
                Launch SafeWalk
              </Button>

              <Button
                variant="secondary"
                size="lg"
                icon={<MessageSquare size={18} />}
                onClick={() => {
                  const elem = document.getElementById('ready-messages');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                  else setActiveTab('ready-messages');
                }}
                style={{ padding: '12px 22px', fontSize: '1rem' }}
              >
                Ready SOS Messages
              </Button>

              {onOpenFakeCall && (
                <Button
                  variant="ghost"
                  size="lg"
                  icon={<PhoneCall size={18} style={{ color: '#6366F1' }} />}
                  onClick={onOpenFakeCall}
                  style={{
                    padding: '12px 20px',
                    fontSize: '0.9375rem',
                    color: '#4F46E5',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}
                >
                  Discrete Fake Call
                </Button>
              )}
            </div>

            {/* Trust Metrics Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginTop: '2.5rem',
                paddingTop: '2rem',
                borderTop: '1px solid var(--color-border-subtle)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} style={{ color: '#10B981' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Zero Location Selling
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} style={{ color: '#3758F9' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Live GPS Verification
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} style={{ color: '#F59E0B' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  112 / 1091 Hotline Linked
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Canvas with Floating Status Cards */}
          <div style={{ position: 'relative', width: '100%', minHeight: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Background Soft Glow */}
            <div
              style={{
                position: 'absolute',
                width: '360px',
                height: '360px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(55, 88, 249, 0.12) 0%, rgba(16, 185, 129, 0.06) 50%, transparent 70%)',
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />

            {/* Interactive 3D WebGL Three.js Shield */}
            <div style={{ width: '100%', maxWidth: '440px', height: '440px', position: 'relative', zIndex: 1 }}>
              <Safety3DCanvas safetyState={safetyState} />
            </div>

            {/* Floating 3D Badge 1: Top-Right GPS Status */}
            <TiltCard
              maxTilt={8}
              style={{
                position: 'absolute',
                top: '15px',
                right: '10px',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'status-pulse 1.5s infinite' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    GPS HUD Active
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    Accuracy ±12m • Verified
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Floating 3D Badge 2: Bottom-Left Guardian Standby */}
            <TiltCard
              maxTilt={8}
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '10px',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <HeartHandshake size={18} style={{ color: '#3758F9' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {primaryGuardian?.name || 'Primary Guardian'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#10B981', fontWeight: 700 }}>
                    Connected • Battery 84%
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Floating 3D Badge 3: Bottom-Right Nearest Haven */}
            <TiltCard
              maxTilt={8}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '25px',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <MapPin size={18} style={{ color: '#10B981' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {nearestPlace?.name || 'Apollo 24/7 Pharmacy'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                    200m • 24/7 Staffed Haven
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Live Safety State Evaluator Bar */}
        <div
          style={{
            marginTop: '3.5rem',
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interactive 3D Engine Posture:
            </span>
            <Badge
              variant={
                safetyState === 'EMERGENCY'
                  ? 'danger'
                  : safetyState === 'THREAT'
                  ? 'threat'
                  : safetyState === 'CAUTION'
                  ? 'caution'
                  : safetyState === 'RECOVERED'
                  ? 'secondary'
                  : 'safe'
              }
              size="sm"
            >
              {safetyState} ACTIVE
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginRight: '4px' }}>
              Switch Scenario:
            </span>
            {['SAFE', 'CAUTION', 'THREAT', 'EMERGENCY', 'RECOVERED'].map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setSafetyState(state)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  backgroundColor: safetyState === state ? '#3758F9' : 'transparent',
                  borderColor: safetyState === state ? '#3758F9' : 'var(--color-border-default)',
                  color: safetyState === state ? '#FFFFFF' : 'var(--color-text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
