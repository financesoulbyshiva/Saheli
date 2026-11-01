import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Shield, Lock, AlertTriangle, MapPin, Cookie, FileText, CheckCircle2, PhoneCall, Check, RefreshCw } from 'lucide-react';

/**
 * LegalTrustCenter Component
 * Complete, verified Privacy & Legal specification for SAHELI Women Safety Platform.
 * Covers: Privacy Policy, Terms of Service, Emergency Disclaimer, Location Privacy, and Cookie Policy.
 */
export function LegalTrustCenter({ initialTab = 'privacy', className = '' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [diagnosticsConsent, setDiagnosticsConsent] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('saheli_cookie_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.diagnostics === 'boolean') {
          setDiagnosticsConsent(parsed.diagnostics);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSaveCookiePreferences = () => {
    try {
      localStorage.setItem('saheli_cookie_consent', JSON.stringify({
        essential: true,
        diagnostics: diagnosticsConsent,
        timestamp: Date.now(),
      }));
      setSaveStatus('Preferences saved successfully');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('Failed to save preferences');
    }
  };

  const handleResetCookies = () => {
    try {
      localStorage.removeItem('saheli_cookie_consent');
      setDiagnosticsConsent(true);
      setSaveStatus('Cookie preferences reset to default');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      // Ignore
    }
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: <Lock size={15} /> },
    { id: 'terms', label: 'Terms of Service', icon: <FileText size={15} /> },
    { id: 'disclaimer', label: 'Emergency Disclaimer', icon: <AlertTriangle size={15} /> },
    { id: 'location', label: 'Location Privacy', icon: <MapPin size={15} /> },
    { id: 'cookies', label: 'Cookie & Storage Policy', icon: <Cookie size={15} /> },
  ];

  return (
    <div className={`legal-trust-center ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '860px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand-primary)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <Shield size={14} />
          <span>LEGAL COMPLIANCE & USER RIGHTS • VERSION 2.0</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800 }}>
          Trust, Privacy & Legal Center
        </h1>
        <p className="body-text" style={{ marginTop: '0.35rem' }}>
          Transparent documentation of data practices, cryptographic safeguards, and operational limitations verified against the SAHELI production codebase.
        </p>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: '6px',
          padding: '6px',
          backgroundColor: 'var(--color-bg-surface-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((t) => {
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isSelected ? 'var(--color-bg-surface)' : 'transparent',
                color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.8125rem',
                boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <Card style={{ padding: '2rem', backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-subtle)', borderRadius: '18px' }}>
        {/* 1. PRIVACY POLICY */}
        {activeTab === 'privacy' && (
          <article style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                SAHELI Privacy Policy
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Effective Date: October 31, 2026 • Verified against Node.js / SQLite backend
              </span>
            </div>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                1. Information We Collect
              </h3>
              <p>We collect only the minimum necessary data required to deliver reliable life-safety and emergency assistance services:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li><strong>Account Information:</strong> Name, verified email address, mobile phone number, and hashed authentication credentials.</li>
                <li><strong>Health & Emergency Attributes:</strong> Voluntary blood group, medical emergency notes (e.g. allergies, asthma inhaler location), and 4-digit Safety PIN.</li>
                <li><strong>Trusted Contacts:</strong> Names, phone numbers, and priority classifications of guardians you designate to receive emergency alerts.</li>
                <li><strong>Location Information:</strong> Real-time latitude, longitude, and accuracy radius captured strictly during active SafeWalk sessions or when you trigger an emergency SOS.</li>
                <li><strong>Incident Reports:</strong> Audit logs of safety posture escalations (Caution, Threat, Emergency) with timestamps and status for user record keeping.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                2. How We Store & Process Your Data
              </h3>
              <p>All passwords and safety PINs are hashed using salted <strong>scrypt key derivation</strong> (`scryptSync`) with unique cryptographic salts. Passwords are never stored in plain text. Application records are persisted in local ACID SQLite databases operating in WAL mode with strict foreign key constraints preventing orphaned data.</p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                3. Zero Third-Party Monetization & Data Sharing
              </h3>
              <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--color-state-safe-bg)', border: '1px solid var(--color-state-safe-border)', borderRadius: '10px', color: 'var(--color-state-safe-text)' }}>
                <CheckCircle2 size={16} style={{ display: 'inline', marginRight: '6px' }} />
                <strong>Strict Privacy Guarantee:</strong> SAHELI does NOT sell, rent, monetize, or trade your personal coordinates or identity to advertising brokers, marketing networks, or commercial analytics firms.
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                4. Your Rights & Data Portability (GDPR & DPDP Compliant)
              </h3>
              <p>You maintain full sovereignty over your information:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li><strong>Data Access & Export:</strong> You can download a complete JSON export of your profile, guardian circle, and incident history at any time from Settings.</li>
                <li><strong>Permanent Account Deletion:</strong> You can permanently purge your entire account, guardian records, and incident history directly via Settings with password verification.</li>
                <li><strong>Revoking Guardians:</strong> You can add or delete individual trusted contacts with immediate database cascading.</li>
              </ul>
            </section>
          </article>
        )}

        {/* 2. TERMS OF SERVICE */}
        {activeTab === 'terms' && (
          <article style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Terms of Service
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Version 2.0 • Binding Agreement for SAHELI Services
              </span>
            </div>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                1. Acceptance & Eligibility
              </h3>
              <p>By creating an account or accessing the SAHELI platform, you agree to comply with and be bound by these Terms. The platform is designed to promote personal safety, proactive journey monitoring, and distress coordination for women and vulnerable individuals.</p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                2. User Account Security
              </h3>
              <p>You are responsible for maintaining the confidentiality of your credentials, password, and 4-digit Safety PIN. You agree to notify SAHELI immediately if you suspect unauthorized access to your account.</p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                3. Prohibited Misuse & False Alerts
              </h3>
              <p>You agree not to use SAHELI to harass, stalk, or transmit false distress calls. Intentionally spamming emergency hotlines or trusted contacts with malicious false emergencies is grounds for immediate account termination.</p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                4. Limitation of Liability
              </h3>
              <p>SAHELI is an software assistance coordination tool and cannot guarantee physical rescue, intervention, or continuous cellular carrier uptime. To the maximum extent permitted by applicable law, SAHELI and its operators disclaim liability for damages resulting from network dropouts, battery failure, or hardware sensor inaccuracies.</p>
            </section>
          </article>
        )}

        {/* 3. EMERGENCY DISCLAIMER */}
        {activeTab === 'disclaimer' && (
          <article style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#EF4444' }}>
                  Emergency Life-Safety Disclaimer
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Essential Legal & Operational Limitations
                </span>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: 'var(--color-text-primary)' }}>
              <strong>IMPORTANT:</strong> SAHELI is a companion coordination and notification tool. It does <em>not</em> replace official government emergency rescue personnel, local police departments, or medical triage units.
            </div>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                Key Technical Realities:
              </h3>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>No Guaranteed Immediate Response:</strong> Alert delivery depends on your device having active cellular connectivity, mobile data, or Wi-Fi, and recipient carrier availability.</li>
                <li><strong>GPS Availability:</strong> Location precision depends on your device's built-in GNSS/GPS hardware, sky visibility, and operating system permissions. In dense indoor environments or basements, accuracy may degrade.</li>
                <li><strong>In Immediate Threat of Violence or Assault:</strong> Do not rely exclusively on in-app notifications. Call <strong>112 (National Emergency Support)</strong> or <strong>1091 (Women Helpline)</strong> immediately.</li>
              </ul>
            </section>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <a
                href="tel:112"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                <PhoneCall size={16} />
                <span>Call Police 112 Directly</span>
              </a>

              <a
                href="tel:1091"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-brand-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                }}
              >
                <PhoneCall size={16} />
                <span>Call Women Helpline 1091</span>
              </a>
            </div>
          </article>
        )}

        {/* 4. LOCATION PRIVACY */}
        {activeTab === 'location' && (
          <article style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Location Privacy & Geolocation Policy
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                How Your Coordinates Are Protected
              </span>
            </div>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                1. Why Location Access is Requested
              </h3>
              <p>SAHELI asks for browser geolocation access solely to calculate your proximity to the nearest 24/7 verified safe places (sanctuaries) and to attach accurate coordinates into emergency SMS and guardian dispatches when you need rescue.</p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                2. When Location is Collected
              </h3>
              <p>We do NOT silently track your location in the background 24/7. Location queries are triggered strictly when:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>You initiate a SafeWalk journey and check in at designated waypoints.</li>
                <li>You trigger an Emergency SOS, Caution mode, or Threat escalation.</li>
                <li>You open the Safe Places directory to view walking distances.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                3. How to Revoke Location Access
              </h3>
              <p>You can revoke browser location permissions at any time through your browser's site settings (`Lock icon in address bar → Permissions → Location → Block`). When disabled, SAHELI will gracefully fallback to manual campus waypoint landmark selection.</p>
            </section>
          </article>
        )}

        {/* 5. COOKIE & TRACKING POLICY */}
        {activeTab === 'cookies' && (
          <article style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Storage & Cookie Tracking Audit
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Verified against application dependencies and storage keys
              </span>
            </div>

            <p>SAHELI uses minimal client-side browser storage exclusively for core security and offline functionality. We do NOT use third-party advertising cookies, retargeting pixels, or invasive behavioral trackers.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '8px', color: 'var(--color-text-primary)' }}>Key / Technology</th>
                  <th style={{ padding: '8px', color: 'var(--color-text-primary)' }}>Classification</th>
                  <th style={{ padding: '8px', color: 'var(--color-text-primary)' }}>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-family-mono)' }}>saheli_auth_token</td>
                  <td style={{ padding: '8px', color: '#10B981', fontWeight: 700 }}>Strictly Necessary</td>
                  <td style={{ padding: '8px' }}>Cryptographic session token for authenticated API requests.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-family-mono)' }}>saheli_theme</td>
                  <td style={{ padding: '8px', color: 'var(--color-brand-primary)', fontWeight: 700 }}>Functional Preference</td>
                  <td style={{ padding: '8px' }}>Remembers your choice of Light Mode or Dark Mode.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-family-mono)' }}>saheli_cookie_consent</td>
                  <td style={{ padding: '8px', color: '#10B981', fontWeight: 700 }}>Strictly Necessary</td>
                  <td style={{ padding: '8px' }}>Stores your consent preferences for GDPR compliance.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-family-mono)' }}>saheli_guardians</td>
                  <td style={{ padding: '8px', color: '#10B981', fontWeight: 700 }}>Strictly Necessary</td>
                  <td style={{ padding: '8px' }}>Offline cache of emergency contacts for rapid dispatch during zero-network states.</td>
                </tr>
              </tbody>
            </table>

            {/* Interactive Cookie Preference Settings */}
            <div style={{ marginTop: '1.25rem', padding: '1.25rem', backgroundColor: 'var(--color-bg-surface-subtle)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                  <Cookie size={18} style={{ color: 'var(--color-brand-primary)' }} />
                  <span>Interactive Storage & Cookie Preferences</span>
                </div>
                {saveStatus && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '9999px' }}>
                    {saveStatus}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Strictly Necessary Storage</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Session auth token, encryption keys, and emergency PIN verification.</div>
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '9999px' }}>
                    REQUIRED
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--color-bg-surface)', borderRadius: '8px', border: '1px solid var(--color-border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>GPS Precision Diagnostics</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Caches GPS accuracy telemetry in browser memory for offline navigation.</div>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={diagnosticsConsent}
                      onChange={(e) => setDiagnosticsConsent(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-brand-primary)', cursor: 'pointer' }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button variant="ghost" size="sm" onClick={handleResetCookies} icon={<RefreshCw size={13} />}>
                  Reset to Defaults
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveCookiePreferences} icon={<Check size={14} />}>
                  Save Cookie Preferences
                </Button>
              </div>
            </div>
          </article>
        )}
      </Card>
    </div>
  );
}
