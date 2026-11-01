import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Shield, Navigation, AlertTriangle, Users } from 'lucide-react';
import { Badge } from '../ui/Badge';

/**
 * NotificationsDropdown Component
 * Interactive notifications popover for the Application Top Header.
 */
export function NotificationsDropdown({ notifications = [], onMarkAllRead, onClearAll }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'safewalk':
        return <Navigation size={15} style={{ color: '#3758F9' }} />;
      case 'guardian':
        return <Users size={15} style={{ color: '#10B981' }} />;
      case 'threat':
      case 'emergency':
        return <AlertTriangle size={15} style={{ color: '#EF4444' }} />;
      default:
        return <Shield size={15} style={{ color: '#818CF8' }} />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications menu"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.15s ease',
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.625rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '340px',
            maxWidth: '90vw',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1rem',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Notifications
              </span>
              <Badge variant={unreadCount > 0 ? 'primary' : 'neutral'} size="sm">
                {unreadCount} new
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  title="Mark all as read"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-brand-primary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Check size={13} />
                  <span>Read all</span>
                </button>
              )}
              {notifications.length > 0 && onClearAll && (
                <button
                  type="button"
                  onClick={onClearAll}
                  title="Clear all"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                No notifications right now. All clear!
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    backgroundColor: notif.read ? 'transparent' : 'rgba(55, 88, 249, 0.04)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-bg-surface-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: notif.read ? 600 : 700, color: 'var(--color-text-primary)' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                        {notif.time}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: '2px 0 0 0' }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
