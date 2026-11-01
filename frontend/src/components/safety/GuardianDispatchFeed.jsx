import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Radio, Send, CheckCircle2, Copy } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

/**
 * GuardianDispatchFeed Component
 * Displays live simulated SMS and Push notification dispatches queued/sent
 * during safety posture changes and emergency triggers.
 */
export function GuardianDispatchFeed({ className = '' }) {
  const { safetyState, guardians, locationStatus, userProfile, user, showToast } = useSafety();
  const [copiedId, setCopiedId] = useState(null);

  const userName = user?.name || userProfile?.name || 'User';
  const coordsStr = locationStatus?.coords
    ? `${locationStatus.coords.latitude.toFixed(4)}, ${locationStatus.coords.longitude.toFixed(4)}`
    : '28.5451, 77.1926 (Campus Gateway)';

  // Generate realistic dispatches based on guardians and active state
  const dispatches = guardians.map((g, idx) => {
    const isPrimary = g.isPrimary || g.priority === 'Primary';
    const isEmergency = safetyState === 'EMERGENCY';
    const isThreat = safetyState === 'THREAT';
    const isCaution = safetyState === 'CAUTION';

    let urgencyLevel = isEmergency ? 'CRITICAL_SOS' : isThreat ? 'HIGH_THREAT' : isCaution ? 'STANDBY_ALERT' : 'ROUTINE_CHECKIN';
    let message = '';

    if (isEmergency) {
      message = `[SAHELI CRITICAL SOS] ${userName} triggered an Emergency SOS! Live GPS: https://saheli.org/live/${coordsStr.replace(/ /g, '')} (±12m). Medical: ${userProfile?.medicalNotes || 'None'}. Please contact local police immediately.`;
    } else if (isThreat) {
      message = `[SAHELI THREAT ALERT] ${userName} escalated safety status to THREAT near ${coordsStr}. Standby for emergency broadcast.`;
    } else if (isCaution) {
      message = `[SAHELI STANDBY] ${userName} feels uncomfortable near Campus Route. Moving towards nearest safe haven. Tracking active.`;
    } else {
      message = `[SAHELI SAFEWALK] ${userName} started SafeWalk journey. Expected arrival: 7:30 PM. Automatic check-in interval: 4m.`;
    }

    return {
      id: `disp-${g.id}-${idx}`,
      guardianName: g.name,
      phone: g.phone,
      relationship: g.relationship,
      urgencyLevel,
      status: 'DELIVERED',
      channel: 'SMS & Push Dispatch Gateway',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message,
      isPrimary,
    };
  });

  const handleCopyMessage = (item) => {
    try {
      navigator.clipboard.writeText(item.message);
      setCopiedId(item.id);
      showToast('Alert payload copied to clipboard', 'info');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore
    }
  };

  const getBadgeVariant = (urgency) => {
    switch (urgency) {
      case 'CRITICAL_SOS':
        return 'emergency';
      case 'HIGH_THREAT':
        return 'threat';
      case 'STANDBY_ALERT':
        return 'caution';
      default:
        return 'safe';
    }
  };

  return (
    <Card className={`saheli-dispatch-feed ${className}`}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} style={{ color: 'var(--color-brand-primary)', animation: 'status-pulse 1.6s infinite' }} />
            <div>
              <CardTitle>Guardian Broadcast Telemetry Feed</CardTitle>
              <CardDescription>
                SMS & Push notification broadcast payloads sent to trusted contacts.
              </CardDescription>
            </div>
          </div>
          <Badge variant="primary" size="sm">
            DISPATCH GATEWAY
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {dispatches.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid',
                borderColor: item.isPrimary ? 'rgba(56, 189, 248, 0.3)' : 'var(--color-border-subtle)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={14} style={{ color: item.isPrimary ? 'var(--color-brand-primary)' : 'var(--color-text-muted)' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    To: {item.guardianName} ({item.relationship})
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text-secondary)' }}>
                    {item.phone}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Badge variant={getBadgeVariant(item.urgencyLevel)} size="sm">
                    {item.urgencyLevel.replace(/_/g, ' ')}
                  </Badge>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                    {item.timestamp}
                  </span>
                </div>
              </div>

              {/* Message Payload Box */}
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-family-mono)',
                  color: item.urgencyLevel === 'CRITICAL_SOS' ? '#FCA5A5' : item.urgencyLevel === 'HIGH_THREAT' ? '#FB923C' : '#94A3B8',
                  lineHeight: 1.45,
                }}
              >
                {item.message}
              </div>

              {/* Status and Copy Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34D399' }}>
                  <CheckCircle2 size={12} />
                  <span>Channel: {item.channel} • Delivery Confirmed</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyMessage(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copiedId === item.id ? '#34D399' : 'var(--color-brand-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                  }}
                >
                  <Copy size={12} />
                  <span>{copiedId === item.id ? 'Copied!' : 'Copy Payload'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
