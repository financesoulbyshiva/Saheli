import { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  AlertTriangle,
  ExternalLink,
  LocateFixed,
  RefreshCw,
} from 'lucide-react';

// Night/Dark theme styles for Google Maps matching SAHELI dark mode palette
const SAHELI_DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0F172A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0F172A' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94A3B8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#CBD5E1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748B' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#132338' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#09101F' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748B' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2A3B5C' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1A2740' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#93C5FD' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1E293B' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94A3B8' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#070D19' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }],
  },
];

/**
 * Reusable GoogleMapView Component
 * Handles dynamic API loading, dark/light theme switching, user geolocation,
 * SOS incident markers, verified safe haven markers, and directions navigation.
 */
export function GoogleMapView({
  center = null,
  zoom = 15,
  height = '420px',
  userLocation = null,
  accuracy = null,
  incidentLocation = null,
  safePlaces = [],
  sharedContacts = [],
  onRecenter = null,
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const accuracyCircleRef = useRef(null);
  const infoWindowRef = useRef(null);

  const [mapStatus, setMapStatus] = useState('loading'); // 'loading' | 'ready' | 'missing_key' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);

  // Default coordinate fallback: Central Delhi / Campus haven zone
  const defaultCoords = center || userLocation || { lat: 28.6145, lng: 77.2090 };
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // 1. Script Loader
  useEffect(() => {
    if (!apiKey) {
      setMapStatus('missing_key');
      return;
    }

    if (window.google && window.google.maps) {
      setMapStatus('ready');
      return;
    }

    const scriptId = 'google-maps-saheli-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setMapStatus('ready');
      };

      script.onerror = () => {
        setMapStatus('error');
        setErrorMessage('Failed to connect to Google Maps servers. Please check your network or adblocker.');
      };

      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setMapStatus('ready'));
      script.addEventListener('error', () => {
        setMapStatus('error');
        setErrorMessage('Failed to load Google Maps script.');
      });
    }
  }, [apiKey]);

  // Detect current theme mode from document
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  // 2. Initialize or Update Map Instance
  useEffect(() => {
    if (mapStatus !== 'ready' || !mapContainerRef.current || !window.google?.maps) {
      return;
    }

    const google = window.google;
    const initialCenter = new google.maps.LatLng(defaultCoords.lat, defaultCoords.lng);

    if (!mapInstanceRef.current) {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: initialCenter,
        zoom,
        styles: isDarkMode ? SAHELI_DARK_MAP_STYLES : [],
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      });

      mapInstanceRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow();
    } else {
      mapInstanceRef.current.setOptions({
        styles: isDarkMode ? SAHELI_DARK_MAP_STYLES : [],
      });
    }
  }, [mapStatus, isDarkMode, defaultCoords.lat, defaultCoords.lng, zoom]);

  // 3. Render Markers & Accuracy Circle
  const refreshMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    const google = window.google;
    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setMap(null);
      accuracyCircleRef.current = null;
    }

    // A. Current User Marker
    if (userLocation && typeof userLocation.lat === 'number') {
      const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);

      const userMarker = new google.maps.Marker({
        position: userLatLng,
        map,
        title: 'Your Verified Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#3758F9',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        zIndex: 100,
      });

      userMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="font-family: inherit; padding: 6px; color: #0F172A;">
              <strong style="color: #3758F9;">📍 You Are Here</strong>
              <div style="font-size: 11px; margin-top: 4px; color: #64748B;">
                GPS Accuracy: ±${Math.round(accuracy || 15)}m<br>
                Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}
              </div>
            </div>
          `);
          infoWindowRef.current.open(map, userMarker);
        }
      });

      markersRef.current.push(userMarker);

      // GPS Accuracy Radius Circle
      if (accuracy && accuracy > 0) {
        accuracyCircleRef.current = new google.maps.Circle({
          map,
          center: userLatLng,
          radius: Math.min(accuracy, 500),
          fillColor: '#3758F9',
          fillOpacity: 0.12,
          strokeColor: '#3758F9',
          strokeOpacity: 0.4,
          strokeWeight: 1,
        });
      }
    }

    // B. SOS Incident Location Marker
    if (incidentLocation && typeof incidentLocation.lat === 'number') {
      const incLatLng = new google.maps.LatLng(incidentLocation.lat, incidentLocation.lng);
      const sosMarker = new google.maps.Marker({
        position: incLatLng,
        map,
        title: incidentLocation.title || '🚨 Active Emergency Incident',
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        zIndex: 200,
      });

      sosMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${incidentLocation.lat},${incidentLocation.lng}`;
          infoWindowRef.current.setContent(`
            <div style="font-family: inherit; padding: 8px; color: #0F172A; max-width: 220px;">
              <strong style="color: #EF4444;">🚨 ${incidentLocation.title || 'Emergency Distress Point'}</strong>
              <p style="font-size: 11px; margin: 4px 0 8px 0; color: #475569;">
                ${incidentLocation.description || 'Distress telemetry reported by user.'}
              </p>
              <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; font-size: 11px; background: #EF4444; color: #FFFFFF; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-weight: 700;">
                Navigate in Maps →
              </a>
            </div>
          `);
          infoWindowRef.current.open(map, sosMarker);
        }
      });

      markersRef.current.push(sosMarker);
    }

    // C. Verified Safe Places Markers
    safePlaces.forEach((place) => {
      if (typeof place.latitude !== 'number' || typeof place.longitude !== 'number') return;
      const placeLatLng = new google.maps.LatLng(place.latitude, place.longitude);

      const isHospital = (place.category || '').toLowerCase().includes('hospital');
      const isPharmacy = (place.category || '').toLowerCase().includes('pharmacy');
      const markerColor = isHospital ? '#EF4444' : isPharmacy ? '#10B981' : '#3758F9';

      const placeMarker = new google.maps.Marker({
        position: placeLatLng,
        map,
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        zIndex: 50,
      });

      placeMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
          infoWindowRef.current.setContent(`
            <div style="font-family: inherit; padding: 8px; color: #0F172A; max-width: 240px;">
              <strong style="color: #0F172A; font-size: 13px;">${place.name}</strong>
              <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
                ${place.category} • ${place.openStatus || 'Open 24/7'}<br>
                📍 ${place.address}
              </div>
              <div style="margin-top: 8px;">
                <a href="${dirUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; font-size: 11px; background: #3758F9; color: #FFFFFF; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-weight: 700;">
                  Directions in Maps →
                </a>
              </div>
            </div>
          `);
          infoWindowRef.current.open(map, placeMarker);
        }
      });

      markersRef.current.push(placeMarker);
    });

    // D. Shared Trusted Contacts
    sharedContacts.forEach((contact) => {
      if (typeof contact.latitude !== 'number' || typeof contact.longitude !== 'number') return;
      const contactLatLng = new google.maps.LatLng(contact.latitude, contact.longitude);

      const contactMarker = new google.maps.Marker({
        position: contactLatLng,
        map,
        title: `${contact.name || 'Guardian'} (Live Share)`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#8B5CF6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        zIndex: 80,
      });

      markersRef.current.push(contactMarker);
    });
  }, [userLocation, accuracy, incidentLocation, safePlaces, sharedContacts]);

  useEffect(() => {
    if (mapStatus === 'ready') {
      refreshMarkers();
    }
  }, [mapStatus, refreshMarkers]);

  // Recenter Handler
  const handleRecenter = () => {
    if (mapInstanceRef.current && defaultCoords) {
      const google = window.google;
      mapInstanceRef.current.panTo(new google.maps.LatLng(defaultCoords.lat, defaultCoords.lng));
      mapInstanceRef.current.setZoom(16);
    }
    if (onRecenter) onRecenter();
  };

  const hasRealCoords = Boolean(userLocation && typeof userLocation.lat === 'number');
  const directMapsUrl = hasRealCoords
    ? `https://www.google.com/maps/@${userLocation.lat},${userLocation.lng},16z`
    : `https://www.google.com/maps/@${defaultCoords.lat},${defaultCoords.lng},15z`;

  return (
    <div
      className={`saheli-map-wrapper ${className}`}
      style={{
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid var(--color-border-subtle)',
        backgroundColor: 'var(--color-bg-surface-subtle)',
        minHeight: height,
      }}
    >
      {/* 1. Missing Google Maps API Key Fallback */}
      {mapStatus === 'missing_key' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            minHeight: height,
            backgroundColor: 'var(--color-bg-surface-subtle)',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(55, 88, 249, 0.12)',
              border: '1px solid rgba(55, 88, 249, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MapPin size={28} style={{ color: 'var(--color-brand-primary)' }} />
          </div>

          <div style={{ maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Google Maps Interactive View
            </h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
              {hasRealCoords ? (
                <>
                  Real GPS coordinates detected: <strong>{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</strong>
                  {accuracy ? ` (±${Math.round(accuracy)}m accuracy)` : ''}.
                </>
              ) : (
                <>
                  GPS location pending device acquisition. (Preview centered on active region).
                </>
              )}
              {' '}To render live interactive Google Maps tiles, configure your Maps JavaScript API key:
            </p>
          </div>

          <div
            style={{
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'var(--color-brand-primary)',
            }}
          >
            VITE_GOOGLE_MAPS_API_KEY=your_key_here
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href={directMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-brand-primary)',
                color: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={14} /> Open in Google Maps
            </a>
          </div>
        </div>
      )}

      {/* 2. Loading State */}
      {mapStatus === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-surface-subtle)',
            gap: '8px',
            zIndex: 10,
          }}
        >
          <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--color-brand-primary)' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Initializing Google Maps telemetry...
          </span>
        </div>
      )}

      {/* 3. Error State */}
      {mapStatus === 'error' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            textAlign: 'center',
            minHeight: height,
            gap: '0.75rem',
          }}
        >
          <AlertTriangle size={32} style={{ color: 'var(--color-danger, #EF4444)' }} />
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {errorMessage || 'Unable to connect to Google Maps API.'}
          </p>
          <a
            href={directMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-brand-primary)',
              textDecoration: 'underline',
              fontWeight: 600,
            }}
          >
            View Coordinates on Google Maps Web
          </a>
        </div>
      )}

      {/* 4. Active Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height,
          display: mapStatus === 'ready' ? 'block' : 'none',
        }}
      />

      {/* 5. Floating Recenter & Controls Bar */}
      {mapStatus === 'ready' && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 5,
          }}
        >
          <button
            type="button"
            onClick={handleRecenter}
            aria-label="Recenter Map on Current Location"
            title="Recenter Map on My Location"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s ease',
            }}
          >
            <LocateFixed size={18} style={{ color: 'var(--color-brand-primary)' }} />
          </button>
        </div>
      )}

      {/* 6. Map Legend Bar */}
      {mapStatus === 'ready' && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            padding: '4px 10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.6875rem',
            color: '#FFFFFF',
            zIndex: 5,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3758F9' }} /> You
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} /> Safe Haven
          </span>
          {incidentLocation && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} /> Emergency
            </span>
          )}
        </div>
      )}
    </div>
  );
}
