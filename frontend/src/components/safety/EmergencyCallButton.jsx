import { PhoneCall } from 'lucide-react';

/**
 * EmergencyCallButton Component
 * Direct one-tap link to India's National Emergency Helpline: 112.
 * Opens device's native dialer with 112 prefilled (tel:112).
 * Works 100% offline and unauthenticated. Never claims a call was automatically connected.
 */
export function EmergencyCallButton({
  variant = 'pill',
  className = '',
  style = {},
  showLabel = true,
}) {
  // Common base accessibility and dialer attributes
  const commonProps = {
    href: 'tel:112',
    'aria-label': 'Call India National Emergency Helpline 112',
    title: 'Opens phone dialer for India National Emergency Helpline 112',
    rel: 'noopener',
  };

  // 1. Navbar Pill variant (for top navigation header on desktop & mobile)
  if (variant === 'navbar') {
    return (
      <a
        {...commonProps}
        className={`saheli-emergency-call-pill ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '9999px',
          backgroundColor: '#EF4444',
          color: '#FFFFFF',
          fontSize: '0.8125rem',
          fontWeight: 800,
          letterSpacing: '0.02em',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
          transition: 'all 0.15s ease',
          flexShrink: 0,
          ...style,
        }}
      >
        <PhoneCall size={14} className="animate-pulse" />
        <span>112 SOS</span>
      </a>
    );
  }

  // 2. Banner variant (for AuthModal, login, and registration screens)
  if (variant === 'banner') {
    return (
      <div
        className={`saheli-emergency-call-banner ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          fontSize: '0.75rem',
          ...style,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>🚨</span>
          <div>
            <strong style={{ color: '#FCA5A5', display: 'block' }}>In Immediate Danger?</strong>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.6875rem' }}>
              India National Emergency Helpline (Police / Fire / Medical)
            </span>
          </div>
        </div>
        <a
          {...commonProps}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.75rem',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <PhoneCall size={12} /> Call 112
        </a>
      </div>
    );
  }

  // 3. Emergency Mode Large variant (for active SOS screen)
  if (variant === 'full') {
    return (
      <a
        {...commonProps}
        className={`saheli-emergency-call-full ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
          padding: '12px 18px',
          borderRadius: '10px',
          backgroundColor: '#DC2626',
          color: '#FFFFFF',
          fontSize: '1rem',
          fontWeight: 800,
          letterSpacing: '0.03em',
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(220, 38, 38, 0.45)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center',
          boxSizing: 'border-box',
          ...style,
        }}
      >
        <PhoneCall size={22} className="animate-pulse" />
        <span>📞 CALL 112 EMERGENCY (POLICE / AMBULANCE)</span>
      </a>
    );
  }

  // 4. Default Button / Dock variant
  return (
    <a
      {...commonProps}
      className={`saheli-emergency-call-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '7px 14px',
        borderRadius: '8px',
        backgroundColor: '#EF4444',
        color: '#FFFFFF',
        fontSize: '0.8125rem',
        fontWeight: 700,
        textDecoration: 'none',
        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
        ...style,
      }}
    >
      <PhoneCall size={15} />
      {showLabel && <span>Call 112</span>}
    </a>
  );
}
