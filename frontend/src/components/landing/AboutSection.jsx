import { Shield, Lock, EyeOff, Activity, PhoneCall, HeartHandshake, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TiltCard } from '../ui/TiltCard';

/**
 * AboutSection Component
 * Comprehensive About Page / Section detailing SAHELI's mission,
 * zero-knowledge location architecture, deterministic safety escalation,
 * and emergency philosophy.
 */
export function AboutSection({ onOpenOnboarding: _onOpenOnboarding, onOpenFakeCall: _onOpenFakeCall } = {}) {
  const principles = [
    {
      icon: <EyeOff size={22} style={{ color: '#3758F9' }} />,
      title: 'Zero-Knowledge Privacy',
      desc: 'GPS coordinates remain strictly in client memory. Normal movement logs are never stored, sold, or shared with advertisers.',
    },
    {
      icon: <Activity size={22} style={{ color: '#10B981' }} />,
      title: 'Deterministic Escalation',
      desc: 'Standardized 5-tier safety states (Safe → Caution → Threat → Emergency → Recovered) ensure clear, predictable system response.',
    },
    {
      icon: <MapPin size={22} style={{ color: '#F59E0B' }} />,
      title: 'Physical Haven Network',
      desc: 'Crowdsourced, physically inspected storefronts, 24/7 pharmacies, and transit hubs provide verified physical sanctuary.',
    },
    {
      icon: <PhoneCall size={22} style={{ color: '#818CF8' }} />,
      title: 'Discrete De-escalation',
      desc: 'Subtle tools like authentic fake incoming phone calls allow victims to safely exit uncomfortable situations before escalation.',
    },
  ];

  const techSpecs = [
    { label: 'Key Derivation', value: 'Salted scrypt hashing (N=16384, r=8, p=1)' },
    { label: 'Database Architecture', value: 'SQLite Write-Ahead Logging (WAL) with foreign keys' },
    { label: 'Compliance Standard', value: 'India DPDP Act 2023 & EU GDPR Article 20' },
    { label: 'Visual Rendering', value: 'Three.js 3D WebGL with GPU acceleration' },
    { label: 'Emergency Protocol', value: 'One-click multi-channel dispatch (SMS, WA, 112)' },
    { label: 'Cross-User Isolation', value: 'Strict ownership authorization on every resource' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', padding: '1rem 0 3rem 0' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
        <Badge variant="primary" size="md" style={{ marginBottom: '1rem' }}>
          ABOUT SAHELI PLATFORM
        </Badge>
        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 900,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            margin: '0 0 1rem 0',
          }}
        >
          Engineering Technology for Women's Autonomy & Physical Safety
        </h1>
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          SAHELI (Smart Autonomous Help & Emergency Lifeline Interface) is designed to close the critical gap between personal vulnerability and emergency intervention. Built on privacy-first engineering, deterministic telemetry, and community sanctuary networks.
        </p>
      </div>

      {/* 4 Core Principles Grid */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Four Core Safety Pillars
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            How our engineering protects without compromising civil privacy.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {principles.map((item, idx) => (
            <TiltCard key={idx}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--color-bg-surface-subtle)',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {item.icon}
                  </div>
                  <CardTitle style={{ fontSize: '1.0625rem' }}>{item.title}</CardTitle>
                </CardHeader>
                <CardContent style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* Philosophy of Graduated Response */}
      <Card style={{ borderLeft: '4px solid var(--color-brand-primary)' }}>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} style={{ color: 'var(--color-brand-primary)' }} />
            <CardTitle>The Philosophy of Graduated Response</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                1. Proactive Journey Monitoring
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Most safety applications only act after a violent encounter occurs. SAHELI SafeWalk begins monitoring before danger arises, requiring gentle periodic check-ins. If you don't respond, escalation begins automatically.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                2. Subtle De-escalation
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                When feeling uncomfortable in an auto-rickshaw, cab, or deserted street, triggering a loud siren can antagonize an aggressor. Our Fake Incoming Call feature gives victims a natural, discrete excuse to exit safely.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                3. Sanctuary Pathfinding
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Rather than running blindly, SAHELI guides you towards verified safe havens: brightly lit storefronts, 24/7 hospital emergency rooms, and active police kiosks with verified staff.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                4. Multi-Channel Distress Broadcast
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                When life-critical emergency occurs, one press dispatches live coordinates via WhatsApp, SMS, and national 112 emergency routing simultaneously, ensuring contacts receive exact GPS coordinates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Specifications Table */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: '#10B981' }} />
              <CardTitle>Technical Security & Privacy Architecture</CardTitle>
            </div>
            <Badge variant="safe" size="sm">Audited & Verified</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {techSpecs.map((spec, i) => (
              <div
                key={i}
                style={{
                  padding: '0.875rem 1rem',
                  backgroundColor: 'var(--color-bg-surface-subtle)',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {spec.label}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px' }}>
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community & Legal Commitment */}
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '16px',
          border: '1px solid var(--color-border-subtle)',
          textAlign: 'center',
          maxWidth: '740px',
          margin: '0 auto',
        }}
      >
        <HeartHandshake size={32} style={{ color: '#3758F9', marginBottom: '0.75rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.5rem 0' }}>
          Open Standard for Public Safety
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
          SAHELI is built as an independent, non-commercial safety framework. We do not sell data to insurance providers, law firms, or marketing brokers. Every software update is subjected to automated security auditing, cross-user isolation verification, and accessibility regression tests.
        </p>
      </div>
    </div>
  );
}
