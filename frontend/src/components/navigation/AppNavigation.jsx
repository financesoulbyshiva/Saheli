import { Shield, Navigation, Users, MapPin, AlertOctagon, Activity, PlayCircle, Settings, UserCheck, HelpCircle, PhoneCall } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { StatusIndicator } from '../ui/StatusIndicator';

/**
 * Reusable AppNavigation Component — Fintech SaaS Dark Specification
 * Responsive Top Header for Desktop and Floating Pill Bottom Navigation Bar for Mobile.
 */
export function AppNavigation({ onOpenProfile, onOpenAuth, onOpenLegal, onOpenOnboarding, onOpenFakeCall }) {
  const { activeTab, setActiveTab, safetyState, triggerEmergency, user, userProfile } = useSafety();

  const navItems = [
    { id: 'home', label: 'Home', icon: <Shield size={16} /> },
    { id: 'safewalk', label: 'SafeWalk', icon: <Navigation size={16} /> },
    { id: 'guardians', label: 'Guardians', icon: <Users size={16} /> },
    { id: 'places', label: 'Safe Places', icon: <MapPin size={16} /> },
    { id: 'simulator', label: 'Simulator', icon: <PlayCircle size={16} /> },
    { id: 'safety', label: 'Safety', icon: <Activity size={16} /> },
  ];

  const displayName = user?.name || userProfile?.name || 'Account';
  const firstName = displayName.split(' ')[0];

  return (
    <>
      {/* Top Header for Desktop & Tablet */}
      <header className="app-header">
        <div className="app-container app-header-inner">
          <div
            className="app-brand"
            onClick={() => setActiveTab('home')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('home')}
            role="button"
            tabIndex={0}
            aria-label="SAHELI Home Dashboard"
          >
            <div className="app-brand-logo">S</div>
            <div className="app-brand-text">
              <span className="app-brand-title">
                SAHELI
                <span style={{ fontSize: '0.625rem', padding: '2px 6px', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.04em' }}>
                  v2.0
                </span>
              </span>
              <span className="app-brand-subtitle">Smart Women Safety Platform</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Header Right Actions */}
          <div className="header-actions">
            {/* Guide & Onboarding Button */}
            {onOpenOnboarding && (
              <button
                type="button"
                className="saheli-btn saheli-btn--ghost saheli-btn--sm"
                onClick={onOpenOnboarding}
                title="How SAHELI Works"
                aria-label="Open Onboarding Guide"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                }}
              >
                <HelpCircle size={14} style={{ color: 'var(--color-brand-primary)' }} />
                <span>Guide</span>
              </button>
            )}

            {/* Verified Emergency Helplines Direct Trigger */}
            {onOpenLegal && (
              <button
                type="button"
                className="saheli-btn saheli-btn--ghost saheli-btn--sm"
                onClick={() => onOpenLegal('hotlines')}
                title="National Emergency Numbers"
                aria-label="Open Emergency Helplines"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#FCA5A5',
                }}
              >
                <span>Helplines</span>
              </button>
            )}

            {/* Discrete Fake Call Assistant */}
            {onOpenFakeCall && (
              <button
                type="button"
                className="saheli-btn saheli-btn--ghost saheli-btn--sm"
                onClick={onOpenFakeCall}
                title="Simulate Fake Incoming Call (Discrete De-escalation)"
                aria-label="Open Fake Incoming Call"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  background: 'rgba(99, 102, 241, 0.12)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#A5B4FC',
                }}
              >
                <PhoneCall size={13} style={{ color: '#818CF8' }} />
                <span>Fake Call</span>
              </button>
            )}

            {/* Profile or Sign In Button */}
            {user ? (
              <button
                type="button"
                className="saheli-btn saheli-btn--ghost saheli-btn--sm header-profile-btn"
                onClick={onOpenProfile}
                aria-label="User Profile and Security Settings"
                title={`${user.email} (${user.is_verified ? 'Verified' : 'Unverified'})`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  background: 'rgba(56, 189, 248, 0.10)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#38BDF8',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.15)',
                }}
              >
                <UserCheck size={14} style={{ color: '#38BDF8' }} />
                <span>{firstName}</span>
                {user.is_verified ? (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-state-safe)',
                      boxShadow: '0 0 6px var(--color-state-safe)',
                    }}
                    title="Verified Account"
                  />
                ) : (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-state-caution)',
                      boxShadow: '0 0 6px var(--color-state-caution)',
                    }}
                    title="Email Unverified"
                  />
                )}
              </button>
            ) : (
              <button
                type="button"
                className="saheli-btn saheli-btn--secondary saheli-btn--sm"
                onClick={onOpenAuth}
                aria-label="Sign In or Register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                }}
              >
                <Settings size={14} />
                <span>Sign In</span>
              </button>
            )}

            {/* Status Pill */}
            <div
              className="header-status-pill"
              onClick={() => setActiveTab('safety')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveTab('safety')}
              title="Click to view safety status"
              role="button"
              tabIndex={0}
              aria-label={`Current safety status: ${safetyState}. Click to view details.`}
            >
              <StatusIndicator state={safetyState} showPulse={safetyState !== 'SAFE'} showLabel />
            </div>

            {/* Direct SOS Button */}
            <button
              type="button"
              className="saheli-btn saheli-btn--danger saheli-btn--sm header-sos-btn"
              onClick={triggerEmergency}
              aria-label="Direct SOS Emergency"
              style={{ fontWeight: 800, letterSpacing: '0.04em' }}
            >
              <AlertOctagon size={16} />
              <span>SOS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Floating Pill Dock) */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            aria-label={item.label}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
