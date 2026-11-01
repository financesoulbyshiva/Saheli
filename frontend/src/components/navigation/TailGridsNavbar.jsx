import { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { EmergencyCallButton } from '../safety/EmergencyCallButton';
import {
  Menu,
  X,
  User,
  ArrowRight,
} from 'lucide-react';

/**
 * TailGridsNavbar Component
 * Clean, uncluttered SaaS navigation bar conforming strictly to Part 6 specification:
 * - LEFT: SAHELI Logo
 * - CENTER: Home, Features, How It Works, About
 * - RIGHT: Theme Switcher, Login, Get Started
 */
export function TailGridsNavbar({
  onOpenProfile,
  onOpenAuth,
  onLaunchDashboard,
}) {
  const { activeTab, setActiveTab, user, userProfile } = useSafety();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
    { id: 'about', label: 'About', href: '#about' },
  ];

  const handleNavClick = (linkId) => {
    setActiveTab(linkId);
    setMobileMenuOpen(false);

    // Smooth scroll to anchor element if present on page
    const elem = document.getElementById(linkId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayName = user?.name || userProfile?.name;
  const firstName = displayName ? displayName.split(' ')[0] : null;

  return (
    <header
      className="tailgrids-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9980,
        backgroundColor: 'var(--color-glass-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border-subtle)',
        transition: 'all 0.2s ease',
      }}
    >
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* LEFT: SAHELI LOGO */}
        <div
          onClick={() => handleNavClick('home')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNavClick('home')}
          role="button"
          tabIndex={0}
          aria-label="SAHELI Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3758F9 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(55, 88, 249, 0.35)',
              fontWeight: 900,
              fontSize: '1.25rem',
            }}
          >
            S
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.1875rem', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                SAHELI
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  backgroundColor: 'rgba(55, 88, 249, 0.1)',
                  color: '#3758F9',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em',
                }}
              >
                v2.0
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 500 }}>
              Women Safety Platform
            </span>
          </div>
        </div>

        {/* CENTER: Clean Desktop Nav Links (Home, Features, How It Works, About) */}
        <nav className="tailgrids-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isActive ? '#3758F9' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  padding: '6px 2px',
                  position: 'relative',
                  transition: 'color 0.15s ease',
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: '0',
                      right: '0',
                      height: '2px',
                      backgroundColor: '#3758F9',
                      borderRadius: '9999px',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Emergency Call 112, Theme Switcher, Login, Get Started */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Direct 112 India National Helpline Call Button */}
          <EmergencyCallButton variant="navbar" />

          {/* Theme Switcher */}
          <ThemeSwitcher variant="icon" />

          {/* Login or User Name */}
          {user ? (
            <button
              type="button"
              onClick={onOpenProfile}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-bg-surface-subtle)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Profile & Privacy Settings"
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: user?.is_verified ? '#10B981' : '#F59E0B',
                }}
              />
              <span>{firstName || 'Account'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 16px',
                borderRadius: '9999px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={14} />
              <span>Login</span>
            </button>
          )}

          {/* Get Started / Launch Dashboard */}
          <button
            type="button"
            onClick={user ? onLaunchDashboard : () => onOpenAuth('register')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #3758F9 0%, #4F46E5 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(55, 88, 249, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <span>{user ? 'Dashboard' : 'Get Started'}</span>
            <ArrowRight size={15} />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="tailgrids-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'none',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              display: 'none',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border-subtle)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                style={{
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  color: activeTab === link.id ? '#3758F9' : 'var(--color-text-primary)',
                  fontWeight: activeTab === link.id ? 700 : 500,
                  fontSize: '1rem',
                  padding: '8px 4px',
                  cursor: 'pointer',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Theme</span>
            <ThemeSwitcher variant="pill" />
          </div>

          {/* Mobile Emergency 112 Helpline */}
          <div style={{ marginTop: '0.25rem' }}>
            <EmergencyCallButton variant="full" style={{ padding: '10px 14px', fontSize: '0.875rem' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
            {!user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-default)',
                  backgroundColor: 'var(--color-bg-surface-subtle)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Profile & Settings
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (user) {
                  onLaunchDashboard();
                } else {
                  onOpenAuth('register');
                }
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3758F9 0%, #4F46E5 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {user ? 'Launch App' : 'Get Started'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
