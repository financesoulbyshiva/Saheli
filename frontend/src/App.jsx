import { useState, useEffect } from 'react';
import { SafetyProvider, useSafety } from './context/SafetyContext';
import { ThemeProvider } from './context/ThemeContext';

// Navigation Components
import { TailGridsNavbar } from './components/navigation/TailGridsNavbar';
import { TailGridsFooter } from './components/navigation/TailGridsFooter';
import { AppSidebar } from './components/navigation/AppSidebar';
import { AppHeader } from './components/navigation/AppHeader';

// Public Landing Components
import { SaaSlyHero } from './components/landing/SaaSlyHero';
import { SaaSlyFeatures } from './components/landing/SaaSlyFeatures';
import { SaaSlyHowItWorks } from './components/landing/SaaSlyHowItWorks';
import { AboutSection } from './components/landing/AboutSection';
import { ContactFeedbackSection } from './components/contact/ContactFeedbackSection';
import { ReadyMessagesSection } from './components/safety/ReadyMessagesSection';
import { CookieConsentBanner } from './components/legal/CookieConsentBanner';

// Dashboard & Safety Components
import { SafetyStatusCard } from './components/safety/SafetyStatusCard';
import { GuardianCard } from './components/safety/GuardianCard';
import { SafePlaceCard } from './components/safety/SafePlaceCard';
import { Timeline } from './components/safety/Timeline';
import { SafeWalkSetup } from './components/safewalk/SafeWalkSetup';
import { ActiveSafeWalk } from './components/safewalk/ActiveSafeWalk';
import { IncidentReportingView } from './components/safety/IncidentReportingView';
import { NotificationsView } from './components/safety/NotificationsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SafetySimulator } from './components/simulator/SafetySimulator';
import { CautionMode } from './components/safety/CautionMode';
import { ThreatMode } from './components/safety/ThreatMode';
import { EmergencyMode } from './components/safety/EmergencyMode';

// Modals
import { AddGuardianModal } from './components/guardians/AddGuardianModal';
import { SafePlaceDetailModal } from './components/places/SafePlaceDetailModal';
import { ProfileSettingsModal } from './components/profile/ProfileSettingsModal';
import { AuthModal } from './components/auth/AuthModal';
import { LegalModal } from './components/legal/LegalModal';
import { LegalTrustCenter } from './components/legal/LegalTrustCenter';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { FakeCallModal } from './components/safety/FakeCallModal';
import { LocationMapSection } from './components/map/LocationMapSection';
import { NearbyEmergencyServicesView } from './components/safety/NearbyEmergencyServicesView';

// Common UI
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/Card';
import { Toast } from './components/ui/Toast';

import {
  ShieldAlert,
  HeartHandshake,
  PlusCircle,
  RotateCcw,
  UserPlus,
  Shield,
  MapPin,
  AlertCircle,
  Navigation,
  PhoneCall,
  LayoutDashboard,
  Clock,
  Settings,
  AlertOctagon,
  Users,
} from 'lucide-react';

function getPageHeaderInfo(activeTab) {
  switch (activeTab) {
    case 'overview':
    case 'home':
      return {
        title: 'Safety Command Overview',
        subtitle: 'Live situation assessment, nearest verified havens, and guardian network status.',
      };
    case 'sos':
      return {
        title: 'Emergency SOS Broadcast',
        subtitle: 'Life-critical siren, discrete silent mode, and ERSS 112 multi-channel dispatch.',
      };
    case 'guardians':
      return {
        title: 'Trusted Contact Network',
        subtitle: 'Verified circle of protection. Primary contact receives priority distress telemetry.',
      };
    case 'safewalk':
      return {
        title: 'Location Sharing (SafeWalk)',
        subtitle: 'Proactive route monitoring with periodic check-ins and waypoints.',
      };
    case 'incidents':
      return {
        title: 'Incident Reports & Ledger',
        subtitle: 'Tamper-evident activity ledger with GPS coordinates and timestamps.',
      };
    case 'notifications':
      return {
        title: 'Safety Notification Center',
        subtitle: 'Real-time telemetry pings, guardian battery status, and incident updates.',
      };
    case 'admin':
      return {
        title: 'Administrative Command Center',
        subtitle: 'Platform user management, incident resolution, and system audit logs.',
      };
    case 'places':
      return {
        title: 'Nearby Emergency & Essential Services',
        subtitle: 'Live OpenStreetMap discovery for police stations, hospitals, ambulance, fire stations, and verified havens.',
      };
    case 'simulator':
      return {
        title: 'Interactive Safety Simulator',
        subtitle: 'Demonstrate system response across all 5 standardized safety states.',
      };
    case 'legal':
      return {
        title: 'Privacy & Legal Trust Center',
        subtitle: 'DPDP 2023 compliance, GDPR data portability, and emergency disclaimers.',
      };
    default:
      return {
        title: 'SAHELI Safety Platform',
        subtitle: 'Smart autonomous women safety & emergency assistance system.',
      };
  }
}

function AppContent() {
  const {
    safetyState,
    alertGuardian,
    removeGuardian,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    notifications,
    markAllNotificationsRead,
    clearNotifications,
    guardians,
    safePlaces,
    activeJourney,
    timeline,
    toast,
    hideToast,
    user,
  } = useSafety();

  // State to toggle SafeWalk setup form vs active screen on SafeWalk tab
  const [isSettingUpWalk, setIsSettingUpWalk] = useState(false);

  // Modals state
  const [isAddGuardianOpen, setIsAddGuardianOpen] = useState(false);
  const [viewingSafePlace, setViewingSafePlace] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [authInitialToken, setAuthInitialToken] = useState('');
  const [authInitialError, setAuthInitialError] = useState(null);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);

  // Handle email verification and reset token callbacks from URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const verifyToken = params.get('verify') || params.get('token');
      const verifyStatus = params.get('verify_status');
      const resetToken = params.get('reset');

      if (verifyStatus === 'success') {
        setAuthView('verify-success');
        setIsAuthOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (verifyStatus === 'expired') {
        setAuthView('pending-verification');
        setAuthInitialError('The email verification link has expired or is invalid. Please request a new link.');
        setIsAuthOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (verifyToken) {
        // Direct verification attempt via token in URL
        fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: verifyToken }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setAuthView('verify-success');
              setIsAuthOpen(true);
            } else {
              setAuthView('pending-verification');
              setAuthInitialError(data.error || 'Verification link expired or invalid.');
              setAuthInitialToken(verifyToken);
              setIsAuthOpen(true);
            }
          })
          .catch(() => {
            setAuthView('pending-verification');
            setAuthInitialError('Failed to process verification. Please enter your code manually.');
            setAuthInitialToken(verifyToken);
            setIsAuthOpen(true);
          });
        window.history.replaceState({}, '', window.location.pathname);
      } else if (resetToken) {
        setAuthView('reset');
        setAuthInitialToken(resetToken);
        setIsAuthOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Check onboarding on initial mount
  useEffect(() => {
    try {
      const hasOnboarded = localStorage.getItem('saheli_onboarded');
      if (!hasOnboarded) {
        setIsOnboardingOpen(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Separate Primary Guardian from Secondary Guardians
  const primaryGuardian =
    guardians.find((g) => g.isPrimary || g.priority === 'Primary') || guardians[0];
  const secondaryGuardians = guardians.filter((g) => g.id !== primaryGuardian?.id);

  const handleAlertGuardian = (guardian) => {
    alertGuardian(guardian);
  };

  const handleViewSafePlace = (place) => {
    setViewingSafePlace(place);
  };

  const handleOpenAuth = (view = 'login') => {
    setAuthView(view);
    setIsAuthOpen(true);
  };

  const handleOpenLegal = (tab = 'privacy') => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  const handleLaunchDashboard = () => {
    setViewMode('app');
    if (activeTab === 'home') {
      setActiveTab('overview');
    }
  };

  const headerInfo = getPageHeaderInfo(activeTab);

  return (
    <div className="app-shell">
      {/* Email Verification Reminder Banner (For Unverified Registered Users) */}
      {user && !user.is_verified && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.35)',
            padding: '8px 16px',
            fontSize: '0.8125rem',
            color: '#FBBF24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ color: '#F59E0B', flexShrink: 0 }} />
            <span>
              <strong>Verify your email:</strong> Your account is registered but unverified. Verify your address to secure guardian notifications.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenAuth('verify')}
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#070A12',
              border: 'none',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)',
            }}
          >
            Enter Verification Code
          </button>
        </div>
      )}

      {/* =====================================================================
          VIEW MODE 1: PUBLIC MARKETING & LANDING SITE
          ===================================================================== */}
      {viewMode === 'public' ? (
        <>
          {/* TailGrids SaaSly Public Website Navbar (Part 6) */}
          <TailGridsNavbar
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAuth={handleOpenAuth}
            onLaunchDashboard={handleLaunchDashboard}
          />

          <main className="app-main">
            <div className="app-container">
              {/* Active Danger Overlays (Take Precedence Anytime) */}
              {safetyState === 'EMERGENCY' ? (
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                  <EmergencyMode />
                </div>
              ) : safetyState === 'THREAT' ? (
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                  <ThreatMode onViewSafePlace={handleViewSafePlace} />
                </div>
              ) : safetyState === 'CAUTION' ? (
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                  <CautionMode
                    onViewSafePlace={handleViewSafePlace}
                    onTriggerFakeCall={() => setIsFakeCallOpen(true)}
                  />
                </div>
              ) : (
                /* Public Landing Pages */
                <>
                  {activeTab === 'home' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                      <SaaSlyHero onOpenFakeCall={() => setIsFakeCallOpen(true)} />
                      <SaaSlyFeatures onOpenFakeCall={() => setIsFakeCallOpen(true)} />
                      <SaaSlyHowItWorks onOpenFakeCall={() => setIsFakeCallOpen(true)} />
                      <ReadyMessagesSection />

                      {/* Havens & Primary Guardian Showcase */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <h3 className="section-title" style={{ margin: 0 }}>
                              <ShieldAlert size={18} style={{ color: 'var(--color-state-safe)' }} />
                              Nearest Verified Safe Place
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => { setViewMode('app'); setActiveTab('places'); }}>
                              View All ({safePlaces.length})
                            </Button>
                          </div>
                          <SafePlaceCard
                            place={safePlaces[1] || safePlaces[0]}
                            onView={handleViewSafePlace}
                            isRecommended={true}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <h3 className="section-title" style={{ margin: 0 }}>
                              <HeartHandshake size={18} style={{ color: 'var(--color-brand-primary)' }} />
                              Primary Trusted Guardian
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => { setViewMode('app'); setActiveTab('guardians'); }}>
                              Manage Network ({guardians.length})
                            </Button>
                          </div>
                          {primaryGuardian && (
                            <GuardianCard
                              guardian={primaryGuardian}
                              onAlert={handleAlertGuardian}
                            />
                          )}
                        </div>
                      </div>

                      <ContactFeedbackSection />
                      <div>
                        <Timeline events={timeline.slice(0, 6)} title="Safety Event Activity Ledger" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'features' && (
                    <div style={{ padding: '1rem 0' }}>
                      <SaaSlyFeatures onOpenFakeCall={() => setIsFakeCallOpen(true)} />
                    </div>
                  )}

                  {activeTab === 'how-it-works' && (
                    <div style={{ padding: '1rem 0' }}>
                      <SaaSlyHowItWorks onOpenFakeCall={() => setIsFakeCallOpen(true)} />
                    </div>
                  )}

                  {activeTab === 'about' && (
                    <div style={{ padding: '1rem 0' }}>
                      <AboutSection
                        onOpenOnboarding={() => setIsOnboardingOpen(true)}
                        onOpenFakeCall={() => setIsFakeCallOpen(true)}
                      />
                    </div>
                  )}

                  {activeTab === 'ready-messages' && (
                    <div style={{ padding: '1rem 0' }}>
                      <ReadyMessagesSection />
                    </div>
                  )}

                  {activeTab === 'contact' && (
                    <div style={{ padding: '1rem 0' }}>
                      <ContactFeedbackSection />
                    </div>
                  )}

                  {activeTab === 'legal' && (
                    <div style={{ padding: '1rem 0' }}>
                      <LegalTrustCenter initialTab={legalTab || 'privacy'} />
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* Multi-Column Modern Footer */}
          <TailGridsFooter
            onOpenLegal={handleOpenLegal}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
          />
        </>
      ) : (
        /* =====================================================================
           VIEW MODE 2: APPLICATION DASHBOARD (SIDEBAR + TOP HEADER) (Part 6)
           ===================================================================== */
        <div className="dashboard-layout">
          {/* Application Sidebar (Part 6) */}
          <AppSidebar
            currentTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onSwitchToPublic={() => {
              setViewMode('public');
              setActiveTab('home');
            }}
            onOpenProfile={() => setIsProfileOpen(true)}
            notificationsCount={notifications.filter((n) => !n.read).length}
          />

          {/* Main Dashboard Panel */}
          <div className="dashboard-main">
            {/* Top Header (Part 6) */}
            <AppHeader
              pageTitle={headerInfo.title}
              pageSubtitle={headerInfo.subtitle}
              notifications={notifications}
              onMarkAllRead={markAllNotificationsRead}
              onClearAll={clearNotifications}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenFakeCall={() => setIsFakeCallOpen(true)}
            />

            {/* Dashboard Content Container */}
            <div className="dashboard-content">
              {/* Active Danger Overlays (Take Precedence Anytime) */}
              {safetyState === 'EMERGENCY' ? (
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                  <EmergencyMode />
                </div>
              ) : safetyState === 'THREAT' ? (
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                  <ThreatMode onViewSafePlace={handleViewSafePlace} />
                </div>
              ) : safetyState === 'CAUTION' ? (
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                  <CautionMode
                    onViewSafePlace={handleViewSafePlace}
                    onTriggerFakeCall={() => setIsFakeCallOpen(true)}
                  />
                </div>
              ) : (
                /* Application Tabs */
                <>
                  {/* 1. OVERVIEW / HOME */}
                  {(activeTab === 'overview' || activeTab === 'home') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {/* Live Safety Status Card */}
                      <SafetyStatusCard state={safetyState} />

                      {/* Quick Action Navigation Tiles */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        <Card
                          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                          onClick={() => setActiveTab('safewalk')}
                        >
                          <CardContent style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(55, 88, 249, 0.1)', color: '#3758F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Navigation size={20} />
                              </div>
                              <div>
                                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                                  SafeWalk Route
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                  {activeJourney.isStarted ? 'Journey in progress' : 'Start trip tracking'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                          onClick={() => setIsFakeCallOpen(true)}
                        >
                          <CardContent style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PhoneCall size={20} />
                              </div>
                              <div>
                                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                                  Fake Call Exit
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                  Discrete de-escalation
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                          onClick={() => setActiveTab('places')}
                        >
                          <CardContent style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <MapPin size={20} />
                              </div>
                              <div>
                                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                                  Nearby Havens
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                  {safePlaces.length} 24/7 locations
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                          onClick={() => setActiveTab('incidents')}
                        >
                          <CardContent style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={20} />
                              </div>
                              <div>
                                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                                  Incident Reports
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                  {timeline.length} recorded events
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Two Column Haven & Guardian View */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <h3 className="section-title" style={{ margin: 0 }}>
                              <ShieldAlert size={18} style={{ color: 'var(--color-state-safe)' }} />
                              Nearest Verified Safe Haven
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('places')}>
                              View All ({safePlaces.length})
                            </Button>
                          </div>
                          <SafePlaceCard
                            place={safePlaces[1] || safePlaces[0]}
                            onView={handleViewSafePlace}
                            isRecommended={true}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <h3 className="section-title" style={{ margin: 0 }}>
                              <HeartHandshake size={18} style={{ color: 'var(--color-brand-primary)' }} />
                              Primary Trusted Guardian
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setActiveTab('guardians')}>
                              Manage Network ({guardians.length})
                            </Button>
                          </div>
                          {primaryGuardian && (
                            <GuardianCard
                              guardian={primaryGuardian}
                              onAlert={handleAlertGuardian}
                            />
                          )}
                        </div>
                      </div>

                      {/* Live Safety & Haven Map Section */}
                      <LocationMapSection />

                      <Timeline events={timeline.slice(0, 5)} title="Recent Safety Timeline" />
                    </div>
                  )}

                  {/* 2. EMERGENCY SOS */}
                  {activeTab === 'sos' && (
                    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                      <EmergencyMode />
                    </div>
                  )}

                  {/* 3. TRUSTED CONTACTS (GUARDIANS) */}
                  {activeTab === 'guardians' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '760px', margin: '0 auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <h1 className="page-title">Trusted Guardian Network</h1>
                          <p className="body-text" style={{ marginTop: '0.25rem' }}>
                            Your verified circle of protection. Primary guardian is alerted first during elevated risk.
                          </p>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={<UserPlus size={16} />}
                          onClick={() => setIsAddGuardianOpen(true)}
                        >
                          + Add Guardian
                        </Button>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                          <Shield size={16} style={{ color: 'var(--color-brand-primary)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-brand-primary)', letterSpacing: '0.05em' }}>
                            Primary Guardian (First Trusted Contact)
                          </span>
                        </div>
                        {primaryGuardian && (
                          <GuardianCard
                            guardian={primaryGuardian}
                            onAlert={handleAlertGuardian}
                            onRemove={removeGuardian}
                          />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                          <HeartHandshake size={16} style={{ color: 'var(--color-text-muted)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                            Secondary Guardians (Standby Network)
                          </span>
                        </div>
                        {secondaryGuardians.length === 0 ? (
                          <Card style={{ textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>
                              No secondary guardians added yet. Add trusted friends, roommates, or family.
                            </p>
                          </Card>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {secondaryGuardians.map((g) => (
                              <GuardianCard
                                key={g.id}
                                guardian={g}
                                onAlert={handleAlertGuardian}
                                onRemove={removeGuardian}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. LOCATION SHARING (SAFEWALK) */}
                  {activeTab === 'safewalk' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px', margin: '0 auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h1 className="page-title">SafeWalk Companion</h1>
                          <p className="body-text" style={{ marginTop: '0.25rem' }}>
                            Proactive journey monitoring before an emergency happens.
                          </p>
                        </div>

                        {activeJourney?.isStarted && (
                          <Button
                            variant={isSettingUpWalk ? 'ghost' : 'secondary'}
                            size="sm"
                            icon={isSettingUpWalk ? <RotateCcw size={16} /> : <PlusCircle size={16} />}
                            onClick={() => setIsSettingUpWalk(!isSettingUpWalk)}
                          >
                            {isSettingUpWalk ? 'View Active Walk' : 'Setup New Journey'}
                          </Button>
                        )}
                      </div>

                      {isSettingUpWalk || !activeJourney?.isStarted ? (
                        <SafeWalkSetup onCancel={() => setIsSettingUpWalk(false)} />
                      ) : (
                        <>
                          <ActiveSafeWalk />

                          {activeJourney?.waypoints && activeJourney.waypoints.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Journey Route & Waypoints</CardTitle>
                                <CardDescription>
                                  From {activeJourney?.from} to {activeJourney?.to} (ETA: {activeJourney?.expectedArrival}).
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  {activeJourney.waypoints.map((wp, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: wp.passed ? 'var(--color-state-safe-bg)' : 'var(--color-bg-surface-subtle)',
                                        border: '1px solid',
                                        borderColor: wp.passed ? 'var(--color-state-safe-border)' : 'var(--color-border-subtle)',
                                        borderRadius: '8px',
                                      }}
                                    >
                                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {idx + 1}. {wp.name}
                                      </span>
                                      <Badge variant={wp.passed ? 'safe' : 'neutral'} size="sm">
                                        {wp.passed ? 'Passed' : 'Upcoming'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}

                      <Timeline events={timeline.slice(0, 5)} title="SafeWalk Activity Ledger" />
                    </div>
                  )}

                  {/* 5. INCIDENT REPORTS */}
                  {activeTab === 'incidents' && <IncidentReportingView />}

                  {/* 6. NOTIFICATIONS */}
                  {activeTab === 'notifications' && (
                    <NotificationsView
                      notifications={notifications}
                      onMarkAllRead={markAllNotificationsRead}
                      onClearAll={clearNotifications}
                    />
                  )}

                  {/* 7. NEARBY EMERGENCY SERVICES & DISCOVERY */}
                  {activeTab === 'places' && <NearbyEmergencyServicesView />}

                  {/* 8. ADMIN DASHBOARD */}
                  {activeTab === 'admin' && <AdminDashboard />}

                  {/* 9. SAFETY SIMULATOR */}
                  {activeTab === 'simulator' && <SafetySimulator />}

                  {/* 10. LEGAL & TRUST CENTER */}
                  {activeTab === 'legal' && <LegalTrustCenter initialTab={legalTab || 'privacy'} />}
                </>
              )}
            </div>

            {/* Mobile Bottom Dock (Visible only on small viewports) */}
            <div
              className="saheli-mobile-bottom-dock"
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-bg-surface)',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '8px 12px',
                zIndex: 9900,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'overview' ? '#3758F9' : 'var(--color-text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <LayoutDashboard size={18} />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('safewalk')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'safewalk' ? '#3758F9' : 'var(--color-text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Navigation size={18} />
                <span>SafeWalk</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sos')}
                style={{
                  background: '#EF4444',
                  border: 'none',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '-18px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  cursor: 'pointer',
                }}
              >
                <AlertOctagon size={22} />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guardians')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'guardians' ? '#3758F9' : 'var(--color-text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Users size={18} />
                <span>Contacts</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isProfileOpen ? '#3758F9' : 'var(--color-text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating System Toast */}
      <Toast toast={toast} onClose={hideToast} />

      {/* Add Guardian Modal */}
      <AddGuardianModal
        isOpen={isAddGuardianOpen}
        onClose={() => setIsAddGuardianOpen(false)}
      />

      {/* Safe Place Details Modal */}
      <SafePlaceDetailModal
        place={viewingSafePlace}
        isOpen={Boolean(viewingSafePlace)}
        onClose={() => setViewingSafePlace(null)}
      />

      {/* User Profile & Security Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenLegal={handleOpenLegal}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthInitialToken('');
          setAuthInitialError(null);
        }}
        initialView={authView}
        initialToken={authInitialToken}
        initialError={authInitialError}
        onOpenLegal={handleOpenLegal}
      />

      {/* Legal & Trust Modal */}
      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />

      {/* Onboarding Guide Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Discrete Fake Incoming Call Modal */}
      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
      />

      {/* TailGrids GDPR & DPDP Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SafetyProvider>
          <AppContent />
        </SafetyProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
