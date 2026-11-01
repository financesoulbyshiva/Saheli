import { ArrowUp, Lock } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

/**
 * TailGridsFooter Component
 * Multi-column, modern, spacious footer inspired by TailGrids SaaSly template.
 * Highlights emergency helplines, safety tools, privacy guarantees, and system status.
 */
export function TailGridsFooter({ onOpenLegal, onOpenOnboarding }) {
  const { setActiveTab } = useSafety();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (tabId) => {
    setActiveTab(tabId);
    const elem = document.getElementById(tabId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      className="tailgrids-footer"
      style={{
        backgroundColor: '#0F172A',
        color: '#94A3B8',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '5rem 0 3rem 0',
      }}
    >
      <div className="app-container">
        {/* 4-Column Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          {/* Column 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3758F9 0%, #4F46E5 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.125rem',
                }}
              >
                S
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                SAHELI
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94A3B8', marginBottom: '1.5rem' }}>
              A modern, privacy-first women safety and emergency assistance platform engineered to prevent danger, de-escalate situations, and dispatch immediate assistance.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#10B981' }}>
              <Lock size={14} />
              <span>Zero-knowledge client-side coordinate isolation.</span>
            </div>
          </div>

          {/* Column 2: Safety Tools */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Safety Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <button type="button" onClick={() => handleNav('safewalk')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  SafeWalk Route Companion
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('ready-messages')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  Ready Emergency Messages
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('places')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  24/7 Verified Safe Havens
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('guardians')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  Trusted Guardian Network
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('simulator')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  Interactive Safety Simulator
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Trust & Legal Center
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
              <li>
                <button type="button" onClick={() => onOpenLegal('privacy')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  Privacy Policy & Data Security
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegal('terms')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  Terms of Service
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegal('hotlines')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  National Helpline Directory
                </button>
              </li>
              <li>
                <button type="button" onClick={onOpenOnboarding} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  Platform Walkthrough & Guide
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNav('contact')} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}>
                  Nominate Safe Place / Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: 24/7 National Emergency Numbers */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Emergency Speed-Dial
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href="tel:112"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  color: '#FCA5A5',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                <span>Police / National Emergency</span>
                <span style={{ fontWeight: 900 }}>112</span>
              </a>

              <a
                href="tel:1091"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(55, 88, 249, 0.15)',
                  border: '1px solid rgba(55, 88, 249, 0.3)',
                  borderRadius: '10px',
                  color: '#93C5FD',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                <span>Women Helpline Desk</span>
                <span style={{ fontWeight: 900 }}>1091</span>
              </a>

              <a
                href="tel:181"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  color: '#6EE7B7',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                <span>Women in Distress</span>
                <span style={{ fontWeight: 900 }}>181</span>
              </a>

              <a
                href="tel:108"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '10px',
                  color: '#FDE68A',
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                <span>Emergency Ambulance</span>
                <span style={{ fontWeight: 900 }}>108</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Operational Badge */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
          }}
        >
          <div>
            © 2026 SAHELI — Women Safety & Emergency Assistance Platform. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'status-pulse 1.5s infinite' }} />
              <span>All Systems Operational</span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Back to top"
              aria-label="Back to top"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
