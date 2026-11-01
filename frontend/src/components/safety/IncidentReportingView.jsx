import { useState } from 'react';
import { AlertTriangle, Clock, MapPin, Send, Download, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useSafety } from '../../context/SafetyContext';

/**
 * IncidentReportingView Component
 * Complete incident reporting screen conforming to Part 2 & Part 6:
 * - Incident creation & logging form
 * - Full chronological activity ledger
 * - Export incident report
 */
export function IncidentReportingView() {
  const { timeline, addTimelineEvent, locationStatus, showToast } = useSafety();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('CAUTION');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter an incident title', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addTimelineEvent({
        state: severity,
        title: title.trim(),
        description: description.trim() || 'Manual incident report submitted.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      });
      showToast('Safety incident logged to tamper-evident ledger', 'success');
      setTitle('');
      setDescription('');
      setIsSubmitting(false);
    }, 400);
  };

  const handleExportIncidentLedger = () => {
    const data = {
      exportDate: new Date().toISOString(),
      reportType: 'Personal Safety Incident Activity Ledger',
      deviceCoordinates: locationStatus?.coords || 'Unavailable / Revoked',
      events: timeline,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `saheli_incident_ledger_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Incident activity ledger exported as JSON', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '820px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Incident Reporting & Activity Ledger
          </h1>
          <p className="body-text" style={{ marginTop: '0.25rem' }}>
            Record safety concerns, suspicious activity, or travel deviations for legal and guardian awareness.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={14} />}
          onClick={handleExportIncidentLedger}
        >
          Export Ledger (JSON)
        </Button>
      </div>

      {/* Manual Report Creation Form */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
            <CardTitle>Log a Safety Event</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="label-text" htmlFor="inc-title">
                  Incident Summary *
                </label>
                <input
                  id="inc-title"
                  type="text"
                  className="saheli-input"
                  placeholder="e.g. Unmarked vehicle following walking route"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label-text" htmlFor="inc-severity">
                  Severity Assessment
                </label>
                <select
                  id="inc-severity"
                  className="saheli-input saheli-select"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="CAUTION">Caution (Discomfort / Low Risk)</option>
                  <option value="THREAT">Threat (Active Suspicion / Detour)</option>
                  <option value="EMERGENCY">Emergency (Life Critical Distress)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label-text" htmlFor="inc-desc">
                Event Description & Evidence Notes
              </label>
              <textarea
                id="inc-desc"
                className="saheli-input"
                rows={3}
                placeholder="Include vehicle color, license fragments, landmarks, or witness presence..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <MapPin size={14} style={{ color: '#10B981' }} />
                <span>
                  GPS Coords: {locationStatus?.coords ? `${locationStatus.coords.latitude.toFixed(4)}, ${locationStatus.coords.longitude.toFixed(4)}` : 'Device Standby (Simulated Campus)'}
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={<Send size={15} />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging...' : 'Record Incident'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Historical Ledger */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: 'var(--color-brand-primary)' }} />
              <CardTitle>Recorded Activity Ledger ({timeline.length})</CardTitle>
            </div>
            <Badge variant="neutral" size="sm">Immutable Local Buffer</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {timeline.map((evt, idx) => (
              <div
                key={evt.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: 'var(--color-bg-surface-subtle)',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border-subtle)',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor:
                        evt.state === 'EMERGENCY'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : evt.state === 'THREAT'
                          ? 'rgba(249, 115, 22, 0.15)'
                          : evt.state === 'CAUTION'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <Shield
                      size={16}
                      style={{
                        color:
                          evt.state === 'EMERGENCY'
                            ? '#EF4444'
                            : evt.state === 'THREAT'
                            ? '#F97316'
                            : evt.state === 'CAUTION'
                            ? '#F59E0B'
                            : '#10B981',
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {evt.title}
                      </span>
                      <Badge
                        variant={
                          evt.state === 'EMERGENCY'
                            ? 'emergency'
                            : evt.state === 'THREAT'
                            ? 'caution'
                            : evt.state === 'SAFE'
                            ? 'safe'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {evt.state || 'EVENT'}
                      </Badge>
                    </div>
                    {evt.description && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: '4px 0 0 0' }}>
                        {evt.description}
                      </p>
                    )}
                  </div>
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0, fontFamily: 'monospace' }}>
                  {evt.timestamp}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
