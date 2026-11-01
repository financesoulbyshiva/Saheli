import {
  LayoutDashboard,
  AlertOctagon,
  Users,
  Navigation,
  Clock,
  Bell,
  Settings,
  ShieldCheck,
  MapPin,
  PlayCircle,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { Badge } from '../ui/Badge';

/**
 * AppSidebar Component
 * Dedicated Application Sidebar conforming to Part 6 specification:
 * - Overview
 * - Emergency SOS
 * - Trusted Contacts
 * - Location Sharing
 * - Incident Reports
 * - Notifications
 * - Settings
 * + Admin Dashboard, Safe Places, Simulator, & Public Site Switcher.
 */
export function AppSidebar({
  currentTab,
  onSelectTab,
  onSwitchToPublic,
  onOpenProfile,
  notificationsCount = 0,
}) {
  const { safetyState, triggerEmergency, user, logout } = useSafety();

  const mainNav = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    {
      id: 'sos',
      label: 'Emergency SOS',
      icon: <AlertOctagon size={18} />,
      isDanger: true,
      badge: safetyState === 'EMERGENCY' ? 'ACTIVE' : null,
    },
    { id: 'guardians', label: 'Trusted Contacts', icon: <Users size={18} /> },
    { id: 'safewalk', label: 'Location Sharing', icon: <Navigation size={18} /> },
    { id: 'incidents', label: 'Incident Reports', icon: <Clock size={18} /> },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={18} />,
      badge: notificationsCount > 0 ? String(notificationsCount) : null,
    },
  ];

  const secondaryNav = [
    { id: 'places', label: 'Nearby Services & Map', icon: <MapPin size={17} /> },
    { id: 'simulator', label: 'Safety Simulator', icon: <PlayCircle size={17} /> },
    { id: 'admin', label: 'Admin Dashboard', icon: <ShieldCheck size={17} /> },
    { id: 'settings', label: 'Settings & Privacy', icon: <Settings size={17} /> },
  ];

  return (
    <aside
      className="saheli-app-sidebar"
      style={{
        width: '260px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 990,
        overflowY: 'auto',
      }}
    >
      {/* Top Branding & Status */}
      <div>
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem 1rem 1.25rem',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3758F9 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.125rem',
                boxShadow: '0 2px 10px rgba(55, 88, 249, 0.35)',
              }}
            >
              S
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.0625rem', fontWeight: 900, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                  SAHELI
                </span>
                <span style={{ fontSize: '0.625rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(55, 88, 249, 0.12)', color: '#3758F9', fontWeight: 800 }}>
                  APP
                </span>
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                Command & Telemetry
              </span>
            </div>
          </div>
        </div>

        {/* Live Safety Status Pill */}
        <div style={{ padding: '0.75rem 1.25rem' }}>
          <div
            style={{
              padding: '0.625rem 0.875rem',
              borderRadius: '10px',
              backgroundColor:
                safetyState === 'EMERGENCY'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : safetyState === 'THREAT'
                  ? 'rgba(249, 115, 22, 0.15)'
                  : safetyState === 'CAUTION'
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(16, 185, 129, 0.1)',
              border: '1px solid',
              borderColor:
                safetyState === 'EMERGENCY'
                  ? 'rgba(239, 68, 68, 0.35)'
                  : safetyState === 'THREAT'
                  ? 'rgba(249, 115, 22, 0.35)'
                  : safetyState === 'CAUTION'
                  ? 'rgba(245, 158, 11, 0.35)'
                  : 'rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor:
                    safetyState === 'EMERGENCY'
                      ? '#EF4444'
                      : safetyState === 'THREAT'
                      ? '#F97316'
                      : safetyState === 'CAUTION'
                      ? '#F59E0B'
                      : '#10B981',
                  boxShadow:
                    safetyState === 'EMERGENCY' ? '0 0 8px #EF4444' : 'none',
                }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color:
                    safetyState === 'EMERGENCY'
                      ? '#EF4444'
                      : safetyState === 'THREAT'
                      ? '#F97316'
                      : safetyState === 'CAUTION'
                      ? '#F59E0B'
                      : '#10B981',
                  letterSpacing: '0.04em',
                }}
              >
                {safetyState}
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              Live GPS
            </span>
          </div>
        </div>

        {/* Primary Navigation Menu */}
        <div style={{ padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0.5rem 0.5rem 0.5rem' }}>
            Main Dashboard
          </div>
          {mainNav.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'sos') {
                    triggerEmergency();
                  }
                  onSelectTab(item.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive
                    ? 'rgba(55, 88, 249, 0.12)'
                    : item.isDanger
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'transparent',
                  color: isActive
                    ? '#3758F9'
                    : item.isDanger
                    ? '#EF4444'
                    : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant={item.isDanger ? 'emergency' : 'primary'} size="sm">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}

          {/* Secondary Tools Navigation */}
          <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '1rem 0.5rem 0.5rem 0.5rem' }}>
            Safety Tools & Admin
          </div>
          {secondaryNav.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'settings') {
                    onOpenProfile();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? 'rgba(55, 88, 249, 0.12)' : 'transparent',
                  color: isActive ? '#3758F9' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border-subtle)' }}>
        {/* Switch back to Public Marketing Website */}
        <button
          type="button"
          onClick={onSwitchToPublic}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border-subtle)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '6px',
            transition: 'background-color 0.15s ease',
          }}
        >
          <ArrowLeft size={14} />
          <span>Public Website</span>
        </button>

        {user && (
          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
