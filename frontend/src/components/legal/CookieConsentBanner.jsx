import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Shield, Cookie, Check, X, Lock, EyeOff } from 'lucide-react';

/**
 * CookieConsentBanner Component
 * Non-intrusive cookie & storage consent bar with detailed privacy options.
 * Strict adherence to GDPR/DPDP guidelines: no tracking, no ad cookies.
 */
export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [diagnosticsConsent, setDiagnosticsConsent] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('saheli_cookie_consent');
      if (!consent) {
        setShowBanner(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('saheli_cookie_consent', JSON.stringify({ essential: true, diagnostics: true, timestamp: Date.now() }));
    } catch {
      // Ignore
    }
    setShowBanner(false);
    setShowModal(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('saheli_cookie_consent', JSON.stringify({ essential: true, diagnostics: false, timestamp: Date.now() }));
    } catch {
      // Ignore
    }
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = () => {
    try {
      localStorage.setItem('saheli_cookie_consent', JSON.stringify({ essential: true, diagnostics: diagnosticsConsent, timestamp: Date.now() }));
    } catch {
      // Ignore
    }
    setShowBanner(false);
    setShowModal(false);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Floating Bottom Consent Banner */}
      {showBanner && !showModal && (
        <div
          role="region"
          aria-label="Privacy & Cookie Preferences"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '920px',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 9990,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 480px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-brand-subtle)',
                color: 'var(--color-brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Your Privacy & Safety First
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: 1.45 }}>
                SAHELI uses essential browser storage strictly for session authentication and emergency guardian records. We <strong>never</strong> use advertising trackers or sell your live location.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="ghost" size="sm" onClick={() => setShowModal(true)}>
              Cookie Preferences
            </Button>
            <Button variant="secondary" size="sm" onClick={handleEssentialOnly}>
              Essential Only
            </Button>
            <Button variant="primary" size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      )}

      {/* Cookie Preferences Detailed Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: '20px',
              border: '1px solid var(--color-border-subtle)',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cookie size={24} style={{ color: 'var(--color-brand-primary)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Cookie & Storage Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Choose how SAHELI manages local data on your device. In accordance with women safety principles, all safety coordinates remain strictly isolated.
            </p>

            {/* Category 1: Strictly Necessary */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                  <Lock size={16} style={{ color: '#10B981' }} />
                  <span>Strictly Necessary Storage</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '9999px' }}>
                  ALWAYS ACTIVE
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                Required to keep you logged in, persist your emergency contact phone numbers, and verify your 4-digit Safety PIN.
              </p>
            </div>

            {/* Category 2: Performance & Diagnostics */}
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                  <EyeOff size={16} style={{ color: 'var(--color-brand-primary)' }} />
                  <span>GPS Precision Diagnostics</span>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={diagnosticsConsent}
                    onChange={(e) => setDiagnosticsConsent(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-brand-primary)' }}
                  />
                </label>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                Permits temporary browser memory caching of GPS latency to optimize safe haven routing in low connectivity.
              </p>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="secondary" size="sm" onClick={handleEssentialOnly}>
                Essential Only
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveCustom} icon={<Check size={14} />}>
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
