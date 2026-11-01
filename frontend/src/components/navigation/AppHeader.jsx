import { PhoneCall } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { NotificationsDropdown } from './NotificationsDropdown';
import { EmergencyCallButton } from '../safety/EmergencyCallButton';

/**
 * AppHeader Component
 * Conforms strictly to Part 6 Top Header specification:
 * - Current page title & breadcrumbs
 * - Theme switcher
 * - Notifications
 * - User profile
 * + Discrete Fake Call button
 */
export function AppHeader({
  pageTitle,
  pageSubtitle,
  notifications = [],
  onMarkAllRead,
  onClearAll,
  onOpenProfile,
  onOpenFakeCall,
}) {
  const { user, userProfile } = useSafety();

  const displayName = user?.name || userProfile?.name;
  const firstName = displayName ? displayName.split(' ')[0] : 'User';

  return (
    <header
      className="saheli-app-header"
      style={{
        height: '68px',
        position: 'sticky',
        top: 0,
        zIndex: 980,
        backgroundColor: 'var(--color-glass-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        transition: 'all 0.2s ease',
      }}
    >
      {/* LEFT: Current Page Title & Subtitle */}
      <div>
        <h1
          style={{
            fontSize: '1.1875rem',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              margin: '2px 0 0 0',
              lineHeight: 1,
            }}
          >
            {pageSubtitle}
          </p>
        )}
      </div>

      {/* RIGHT: Emergency Call, Fake Call, Theme Switcher, Notifications, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Direct 112 India National Emergency Call Action */}
        <EmergencyCallButton variant="navbar" />

        {/* Discrete Fake Call Assistant */}
        {onOpenFakeCall && (
          <button
            type="button"
            onClick={onOpenFakeCall}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: '#4F46E5',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Simulate Fake Incoming Call (Discrete De-escalation)"
          >
            <PhoneCall size={14} />
            <span className="hide-on-mobile">Fake Call</span>
          </button>
        )}

        {/* Global Theme Switcher */}
        <ThemeSwitcher variant="icon" />

        {/* Notifications Popover */}
        <NotificationsDropdown
          notifications={notifications}
          onMarkAllRead={onMarkAllRead}
          onClearAll={onClearAll}
        />

        {/* User Profile Button */}
        <button
          type="button"
          onClick={onOpenProfile}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-bg-surface-subtle)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-primary)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="User Profile & Security Settings"
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: user?.is_verified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: user?.is_verified ? '#10B981' : '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6875rem',
              fontWeight: 800,
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
          <span>{firstName}</span>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: user?.is_verified ? '#10B981' : '#F59E0B',
            }}
          />
        </button>
      </div>
    </header>
  );
}
