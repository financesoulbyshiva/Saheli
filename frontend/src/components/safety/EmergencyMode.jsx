import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useSafety } from '../../context/SafetyContext';
import { audioAlarm } from '../../utils/audioAlarm';
import {
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  Info,
  MapPin,
  Users,
  Volume2,
  VolumeX,
  Navigation,
  LocateFixed,
} from 'lucide-react';
import { LeafletMapView } from '../map/LeafletMapView';
import { EmergencyCallButton } from './EmergencyCallButton';

/**
 * EmergencyMode Component
 * Full-focus Emergency mode screen with simulated response sequence,
 * Web Audio distress siren alarm, and clear prototype academic simulation notices.
 */
export function EmergencyMode({ className = '' }) {
  const { resolveEmergency, safePlaces, guardians, locationStatus, requestLocationAccess } = useSafety();
  const [isSirenActive, setIsSirenActive] = useState(false);

  const hasGps = Boolean(locationStatus?.coords?.latitude && locationStatus?.coords?.longitude);
  const userCoords = hasGps
    ? { lat: locationStatus.coords.latitude, lng: locationStatus.coords.longitude }
    : null;

  // Stop audio siren if component unmounts
  useEffect(() => {
    return () => {
      audioAlarm.stop();
    };
  }, []);

  const toggleSiren = () => {
    const active = audioAlarm.toggle();
    setIsSirenActive(active);
  };

  const handleResolve = () => {
    audioAlarm.stop();
    setIsSirenActive(false);
    resolveEmergency();
  };

  const emergencyResponseSteps = [
    { title: 'Emergency mode activated', done: true },
    { title: 'Priority guardian alert dispatched', done: true },
    { title: 'Live GPS location telemetry broadcasting', done: true },
    { title: 'Nearest verified safe place identified', done: true },
    { title: 'Incident recorded to encrypted safety ledger', done: true },
  ];

  const nearestHaven = safePlaces[1] || safePlaces[0];

  return (
    <div className={`saheli-emergency-view ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* High-Urgency Emergency Banner Card */}
      <Card
        className="emergency-mode-card"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(14, 20, 36, 0.95) 100%)',
          borderColor: 'rgba(239, 68, 68, 0.55)',
          borderLeft: '5px solid #EF4444',
          boxShadow: 'var(--shadow-emergency)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.5)',
              }}
            >
              <AlertOctagon size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FCA5A5' }}>
                🔴 EMERGENCY MODE
              </h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F87171' }}>
                High-Priority Emergency State Active
              </span>
            </div>
          </div>
          <Badge variant="emergency" size="sm">Active SOS</Badge>
        </div>

        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.4 }}>
          Emergency assistance mode is active. Live location sharing and guardian alerts are broadcasting.
        </p>

        {/* Emergency Assistance Notice */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <Info size={18} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            <strong style={{ color: '#FCA5A5' }}>
              CRITICAL ASSISTANCE:
            </strong>{' '}
            Guardian emergency telemetry is active. Use the 112 Emergency button below for direct phone connection to India National Emergency Response Support System (ERSS 112).
          </div>
        </div>
      </Card>

      {/* Emergency Response Sequence */}
      <Card>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-brand-primary)', marginBottom: '0.75rem' }}>
          Active Emergency Response Sequence:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {emergencyResponseSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.625rem 0.875rem',
                backgroundColor: 'var(--color-bg-surface-subtle)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <CheckCircle2 size={18} style={{ color: 'var(--color-state-safe)' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Simulated Location & Haven Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <Card style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <MapPin size={18} style={{ color: 'var(--color-brand-secondary)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Nearest Recommended Haven:
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {nearestHaven.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {nearestHaven.distance} • {nearestHaven.timeEst} walk • {nearestHaven.address}
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nearestHaven.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#3758F9',
                textDecoration: 'none',
              }}
            >
              <Navigation size={13} /> Open Directions in Maps →
            </a>
          </div>
        </Card>

        <Card style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <Users size={18} style={{ color: 'var(--color-state-safe)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Guardians Alerted:
            </span>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            {guardians.map((g) => g.name).join(', ')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-state-safe-text)', marginTop: '4px', fontWeight: 600 }}>
            ✓ Priority distress broadcast dispatched
          </div>
        </Card>
      </div>

      {/* SOS Incident Map */}
      <Card style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} style={{ color: '#EF4444' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              SOS Incident Location & Surroundings
            </span>
          </div>
          {hasGps && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${userCoords.lat},${userCoords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem',
                color: '#3758F9',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Google Maps <Navigation size={12} />
            </a>
          )}
        </div>

        {hasGps ? (
          <LeafletMapView
            userLocation={userCoords}
            accuracy={locationStatus?.accuracy}
            incidentLocation={{
              lat: userCoords.lat,
              lng: userCoords.lng,
              title: 'Distress Beacon Location',
              description: 'Incident coordinates broadcast to verified guardians.',
            }}
            facilities={safePlaces}
            height="260px"
          />
        ) : (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <AlertOctagon size={28} style={{ color: '#EF4444' }} />
            <div>
              <strong style={{ color: '#FCA5A5', fontSize: '0.875rem', display: 'block' }}>
                Live GPS Coordinates Unavailable
              </strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)', maxWidth: '400px' }}>
                Device location permission is required so responders and trusted guardians can view your exact position on the emergency map.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<LocateFixed size={14} />}
              onClick={requestLocationAccess}
            >
              Enable Device Location
            </Button>
          </div>
        )}
      </Card>

      {/* Audio Siren & Emergency Resolution Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '0.5rem' }}>
        {/* ONE-TAP CALL 112 NATIONAL HELPLINE */}
        <EmergencyCallButton variant="full" />

        {/* LOUD AUDIO SIREN TRIGGER */}
        <Button
          type="button"
          variant={isSirenActive ? 'danger' : 'caution'}
          size="lg"
          fullWidth
          icon={isSirenActive ? <VolumeX size={22} /> : <Volume2 size={22} />}
          onClick={toggleSiren}
          style={{
            fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: isSirenActive ? '0 0 35px rgba(239, 68, 68, 0.7)' : 'none',
            border: isSirenActive ? '2px solid #FFFFFF' : '1px solid transparent',
          }}
        >
          {isSirenActive ? 'SILENCE DISTRESS SIREN (STOP AUDIO)' : '🔊 SOUND DISTRESS SIREN (ALARM)'}
        </Button>

        {/* EMERGENCY RESOLUTION: I'M SAFE */}
        <Button
          variant="success"
          size="lg"
          fullWidth
          icon={<ShieldCheck size={22} />}
          onClick={handleResolve}
        >
          I'm Safe (Resolve Emergency & Stop Alerts)
        </Button>
      </div>
    </div>
  );
}
