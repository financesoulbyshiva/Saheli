import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TiltCard } from '../ui/TiltCard';
import { useSafety } from '../../context/SafetyContext';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Car,
  Eye,
  BatteryCharging,
  HeartPulse,
  ShieldAlert,
  Share2,
  Plus,
  Trash2,
} from 'lucide-react';

/**
 * ReadyMessagesSection Component
 * Instant, life-saving pre-composed emergency SMS & WhatsApp messages
 * designed for high-stress situations where typing is impossible or dangerous.
 */
export function ReadyMessagesSection({ className = '' }) {
  const { locationStatus, userProfile, user, showToast, batteryLevel } = useSafety();
  const [copiedId, setCopiedId] = useState(null);
  const [customMessages, setCustomMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('saheli_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomBody, setNewCustomBody] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const userName = user?.name || userProfile?.name || 'Aadya';
  const coordsStr = locationStatus?.coords
    ? `${locationStatus.coords.latitude.toFixed(4)}, ${locationStatus.coords.longitude.toFixed(4)}`
    : '28.5451, 77.1926 (Campus Gateway)';
  const batteryPct = batteryLevel || '84';
  const mapLink = `https://maps.google.com/?q=${coordsStr.replace(/ /g, '')}`;

  const defaultPresets = [
    {
      id: 'msg-cab',
      icon: <Car size={20} style={{ color: '#EF4444' }} />,
      tag: 'UNSAFE RIDE',
      tagVariant: 'danger',
      title: 'Deviating Cab / Auto Ride',
      situation: 'Driver refusing to stop or taking suspicious unknown turns',
      template: `[SAHELI URGENT] I am ${userName}. I am in a vehicle/cab and feel in immediate danger. The driver has deviated from the route and is refusing to stop. My live GPS: ${mapLink} (${coordsStr}). Please call me immediately or alert police 112!`,
    },
    {
      id: 'msg-followed',
      icon: <Eye size={20} style={{ color: '#F59E0B' }} />,
      tag: 'BEING FOLLOWED',
      tagVariant: 'caution',
      title: 'Suspicious Individual Following Me',
      situation: 'Walking on street and being trailed by someone',
      template: `[SAHELI ALERT] I am ${userName}. Someone is following me on foot near ${coordsStr}. I am walking towards the nearest lighted safe place. Please stay on the line with me right now: ${mapLink}`,
    },
    {
      id: 'msg-stranded',
      icon: <BatteryCharging size={20} style={{ color: '#3B82F6' }} />,
      tag: 'STRANDED / LOW BATTERY',
      tagVariant: 'primary',
      title: 'Isolated Area / Vehicle Breakdown',
      situation: 'Late night transport stall or deserted street with low battery',
      template: `[SAHELI HELP] I am ${userName}. My transport broke down in an isolated area near ${coordsStr}. My phone battery is at ${batteryPct}%. Please dispatch someone to pick me up: ${mapLink}`,
    },
    {
      id: 'msg-medical',
      icon: <HeartPulse size={20} style={{ color: '#EC4899' }} />,
      tag: 'MEDICAL DISTRESS',
      tagVariant: 'secondary',
      title: 'Physical Injury / Medical Crisis',
      situation: 'Fainting, fall, physical assault, or sudden medical distress',
      template: `[SAHELI MEDICAL SOS] I am ${userName}. I have suffered an injury/medical emergency near ${coordsStr}. Blood group: ${userProfile?.bloodGroup || 'O+'}. Please call an ambulance (108) to my coordinates: ${mapLink}`,
    },
    {
      id: 'msg-silent',
      icon: <ShieldAlert size={20} style={{ color: '#DC2626' }} />,
      tag: 'SILENT CODE RED',
      tagVariant: 'danger',
      title: 'Silent Duress Code (Do Not Call)',
      situation: 'Aggressor is standing right next to you; speaking is unsafe',
      template: `[SAHELI CODE RED] DO NOT CALL BACK. I cannot speak safely. Forward my coordinates to Police (112) immediately: ${mapLink} (Coordinates: ${coordsStr}).`,
    },
  ];

  const allPresets = [...defaultPresets, ...customMessages];

  const handleCopy = (preset) => {
    try {
      navigator.clipboard.writeText(preset.template);
      setCopiedId(preset.id);
      showToast('Emergency message copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      showToast('Failed to copy. Please select text manually.', 'error');
    }
  };

  const handleShareWhatsApp = (preset) => {
    const encoded = encodeURIComponent(preset.template);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleShareSMS = (preset) => {
    const encoded = encodeURIComponent(preset.template);
    window.location.href = `sms:?&body=${encoded}`;
  };

  const handleSaveCustom = (e) => {
    e.preventDefault();
    if (!newCustomTitle.trim() || !newCustomBody.trim()) {
      showToast('Please provide both title and message template', 'warning');
      return;
    }

    const newPreset = {
      id: `custom-${Date.now()}`,
      icon: <MessageSquare size={20} style={{ color: '#3758F9' }} />,
      tag: 'PERSONAL PRESET',
      tagVariant: 'neutral',
      title: newCustomTitle.trim(),
      situation: 'Custom emergency message saved by you',
      template: `${newCustomBody.trim()} (GPS: ${mapLink})`,
      isCustom: true,
    };

    const updated = [...customMessages, newPreset];
    setCustomMessages(updated);
    try {
      localStorage.setItem('saheli_custom_presets', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    setNewCustomTitle('');
    setNewCustomBody('');
    setShowAddCustom(false);
    showToast('Custom message template saved successfully!', 'success');
  };

  const handleDeleteCustom = (id) => {
    const updated = customMessages.filter((m) => m.id !== id);
    setCustomMessages(updated);
    try {
      localStorage.setItem('saheli_custom_presets', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    showToast('Custom preset removed', 'info');
  };

  return (
    <section id="ready-messages" className={`ready-messages-section ${className}`} style={{ padding: '4rem 0' }}>
      <div className="app-container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: 'rgba(55, 88, 249, 0.08)', border: '1px solid rgba(55, 88, 249, 0.2)', color: '#3758F9', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem' }}>
            <MessageSquare size={15} />
            <span>ONE-TAP EMERGENCY DISPATCH</span>
          </div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.025em', lineHeight: 1.25 }}>
            Ready-To-Use Emergency Messages
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginTop: '0.75rem', lineHeight: 1.6 }}>
            In high-stress situations, every second matters. Send pre-composed, situation-specific distress messages with your verified live GPS coordinates in a single tap via WhatsApp, SMS, or Clipboard.
          </p>
        </div>

        {/* Message Presets Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {allPresets.map((preset) => {
            const isCopied = copiedId === preset.id;
            return (
              <TiltCard key={preset.id} maxTilt={6}>
                <Card
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    backgroundColor: 'var(--color-bg-surface)',
                    borderColor: 'var(--color-border-subtle)',
                    boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.06)',
                    borderRadius: '16px',
                  }}
                >
                  <div>
                    {/* Header: Icon, Title, Badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(55, 88, 249, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {preset.icon}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                            {preset.title}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                            {preset.situation}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Badge variant={preset.tagVariant} size="sm">
                          {preset.tag}
                        </Badge>
                        {preset.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustom(preset.id)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '2px' }}
                            title="Delete custom preset"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pre-composed Message Box */}
                    <div
                      style={{
                        backgroundColor: 'var(--color-bg-surface-subtle)',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        fontSize: '0.8125rem',
                        lineHeight: 1.5,
                        color: 'var(--color-text-primary)',
                        fontFamily: 'inherit',
                        margin: '1rem 0',
                        position: 'relative',
                      }}
                    >
                      {preset.template}
                    </div>
                  </div>

                  {/* Action Dispatch Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                    <Button
                      variant={isCopied ? 'success' : 'secondary'}
                      size="sm"
                      onClick={() => handleCopy(preset)}
                      icon={isCopied ? <Check size={14} /> : <Copy size={14} />}
                      style={{ width: '100%', fontSize: '0.75rem', padding: '6px 8px' }}
                    >
                      {isCopied ? 'Copied' : 'Copy'}
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleShareWhatsApp(preset)}
                      icon={<Share2 size={14} />}
                      style={{ width: '100%', fontSize: '0.75rem', padding: '6px 8px', backgroundColor: '#25D366', borderColor: '#25D366', color: '#FFFFFF' }}
                    >
                      WhatsApp
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleShareSMS(preset)}
                      icon={<Send size={14} />}
                      style={{ width: '100%', fontSize: '0.75rem', padding: '6px 8px' }}
                    >
                      SMS
                    </Button>
                  </div>
                </Card>
              </TiltCard>
            );
          })}
        </div>

        {/* Custom Message Creator Button / Form */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          {!showAddCustom ? (
            <Button
              variant="secondary"
              size="md"
              icon={<Plus size={16} />}
              onClick={() => setShowAddCustom(true)}
              style={{ backgroundColor: 'var(--color-bg-surface)', borderColor: 'var(--color-border-default)' }}
            >
              + Create Custom Distress Template
            </Button>
          ) : (
            <Card style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'left', padding: '1.5rem' }}>
              <CardHeader>
                <CardTitle>Create Custom Distress Preset</CardTitle>
                <CardDescription>
                  Draft your own custom message. Live Google Maps coordinates will be automatically appended upon sending.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCustom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="label-text">Preset Title</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Metro Commute Alert"
                      value={newCustomTitle}
                      onChange={(e) => setNewCustomTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="label-text">Distress Message Body</label>
                    <textarea
                      className="input-field"
                      rows={3}
                      placeholder="e.g. I am waiting at the station exit and someone is bothering me. Please call me right away."
                      value={newCustomBody}
                      onChange={(e) => setNewCustomBody(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddCustom(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" icon={<Check size={14} />}>
                      Save Preset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
