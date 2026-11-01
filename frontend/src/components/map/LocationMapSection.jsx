import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LeafletMapView } from './LeafletMapView';
import { WeatherCard } from '../weather/WeatherCard';
import { useSafety } from '../../context/SafetyContext';
import {
  MapPin,
  Navigation,
  LocateFixed,
  Radio,
  Clock,
  Share2,
  EyeOff,
  AlertOctagon,
} from 'lucide-react';

export function LocationMapSection({ className = '', showControls = true }) {
  const {
    locationStatus,
    requestLocationAccess,
    activeLocationShare,
    shareLiveLocation,
    revokeLiveLocation,
    safePlaces,
    currentIncident,
    safetyState,
  } = useSafety();

  const sharingDuration = 60; // 60-minute default broadcast window
  const [sharingLoading, setSharingLoading] = useState(false);

  const hasCoords = Boolean(locationStatus?.coords?.latitude && locationStatus?.coords?.longitude);
  const userCoords = hasCoords
    ? { lat: locationStatus.coords.latitude, lng: locationStatus.coords.longitude }
    : null;

  const handleShare = async () => {
    setSharingLoading(true);
    await shareLiveLocation({ durationMinutes: sharingDuration });
    setSharingLoading(false);
  };

  const handleRevoke = async () => {
    setSharingLoading(true);
    await revokeLiveLocation();
    setSharingLoading(false);
  };

  const incidentCoords = currentIncident?.latitude && currentIncident?.longitude
    ? {
        lat: currentIncident.latitude,
        lng: currentIncident.longitude,
        title: currentIncident.title,
        description: currentIncident.description,
      }
    : null;

  return (
    <Card className={`saheli-location-map-section ${className}`}>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CardTitle>Live Safety & Haven Map</CardTitle>
              {activeLocationShare?.isActive && (
                <Badge variant="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Radio size={12} className="animate-pulse" /> Live Sharing Active
                </Badge>
              )}
            </div>
            <CardDescription>
              Interactive spatial telemetry showing your verified position and verified 24/7 havens.
            </CardDescription>
          </div>

          {showControls && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button
                variant={hasCoords ? 'ghost' : 'primary'}
                size="sm"
                icon={<LocateFixed size={15} />}
                onClick={requestLocationAccess}
              >
                {hasCoords ? 'Re-verify GPS' : 'Enable Device Location'}
              </Button>

              {hasCoords && (
                <>
                  {activeLocationShare?.isActive ? (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<EyeOff size={15} />}
                      onClick={handleRevoke}
                      disabled={sharingLoading}
                    >
                      Revoke Sharing
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Share2 size={15} />}
                      onClick={handleShare}
                      disabled={sharingLoading}
                    >
                      Broadcast to Guardians (1h)
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* GPS Telemetry Meta Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-bg-surface-subtle)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} style={{ color: hasCoords ? '#10B981' : 'var(--color-text-muted)' }} />
            <span>
              {hasCoords ? (
                <>
                  Coordinates: <strong>{userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}</strong>
                  {locationStatus.accuracy && ` (±${Math.round(locationStatus.accuracy)}m)`}
                </>
              ) : (
                'GPS idle. Click "Enable Device Location" to acquire high-accuracy satellite fix.'
              )}
            </span>
          </div>

          {activeLocationShare?.expiresAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-brand-primary)' }}>
              <Clock size={13} />
              <span>Expires: {new Date(activeLocationShare.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* Live Weather Card (Open-Meteo Integration) */}
        {hasCoords && (
          <WeatherCard
            latitude={userCoords.lat}
            longitude={userCoords.lng}
            locationName="Your Current Location"
          />
        )}

        {/* Primary OpenStreetMap Leaflet Map */}
        <LeafletMapView
          userLocation={userCoords}
          accuracy={locationStatus?.accuracy}
          incidentLocation={incidentCoords}
          facilities={safePlaces}
          height="380px"
        />

        {/* Emergency Direction Quick Link */}
        {safetyState === 'EMERGENCY' && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={18} style={{ color: '#EF4444' }} />
              <span style={{ fontSize: '0.8125rem', color: '#EF4444', fontWeight: 600 }}>
                Emergency route activated. Nearest verified medical sanctuary: Civil Hospital Emergency Ward.
              </span>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=28.6145,77.2105`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Navigation size={13} /> Navigate to Hospital
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
