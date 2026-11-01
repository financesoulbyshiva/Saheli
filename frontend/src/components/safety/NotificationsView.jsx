import { useState } from 'react';
import { Bell, Check, Trash2, Navigation, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * NotificationsView Component
 * Dedicated full-page Notifications center for the Application Sidebar.
 */
export function NotificationsView({
  notifications = [],
  onMarkAllRead,
  onClearAll,
}) {
  const [filter, setFilter] = useState('ALL');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((notif) => {
    if (filter === 'UNREAD') return !notif.read;
    if (filter === 'READ') return notif.read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'safewalk':
        return <Navigation size={18} style={{ color: '#3758F9' }} />;
      case 'guardian':
        return <Users size={18} style={{ color: '#10B981' }} />;
      case 'threat':
      case 'emergency':
        return <AlertTriangle size={18} style={{ color: '#EF4444' }} />;
      default:
        return <ShieldCheck size={18} style={{ color: '#818CF8' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '780px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Title & Batch Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              Safety Notifications
            </h1>
            <Badge variant={unreadCount > 0 ? 'primary' : 'neutral'} size="sm">
              {unreadCount} unread
            </Badge>
          </div>
          <p className="body-text" style={{ marginTop: '0.25rem' }}>
            Telemetry status alerts, guardian battery pings, and incident notifications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && onMarkAllRead && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Check size={14} />}
              onClick={onMarkAllRead}
            >
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={onClearAll}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '4px',
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '10px',
          border: '1px solid var(--color-border-subtle)',
          width: 'fit-content',
        }}
      >
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: filter === 'ALL' ? 'var(--color-brand-primary)' : 'transparent',
            color: filter === 'ALL' ? '#FFFFFF' : 'var(--color-text-secondary)',
            fontWeight: filter === 'ALL' ? 700 : 500,
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: filter === 'UNREAD' ? 'var(--color-brand-primary)' : 'transparent',
            color: filter === 'UNREAD' ? '#FFFFFF' : 'var(--color-text-secondary)',
            fontWeight: filter === 'UNREAD' ? 700 : 500,
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('READ')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: filter === 'READ' ? 'var(--color-brand-primary)' : 'transparent',
            color: filter === 'READ' ? '#FFFFFF' : 'var(--color-text-secondary)',
            fontWeight: filter === 'READ' ? 700 : 500,
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications Card List */}
      <Card>
        <CardContent style={{ padding: '0.75rem' }}>
          {filteredNotifs.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <Bell size={32} style={{ margin: '0 auto 0.75rem auto', color: 'var(--color-text-muted)', opacity: 0.5 }} />
              No notifications matching this filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredNotifs.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '1rem',
                    borderRadius: '10px',
                    backgroundColor: notif.read ? 'transparent' : 'rgba(55, 88, 249, 0.05)',
                    border: '1px solid',
                    borderColor: notif.read ? 'var(--color-border-subtle)' : 'rgba(55, 88, 249, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'var(--color-bg-surface-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: notif.read ? 600 : 800, color: 'var(--color-text-primary)' }}>
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#3758F9',
                              display: 'inline-block',
                            }}
                          />
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                        {notif.time}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
