import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  LocateFixed,
  Layers,
  Info,
  Navigation,
  Phone,
  ExternalLink,
} from 'lucide-react';

// Fix default icon issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Creates high-contrast, scalable SVG divIcons matching SAHELI design tokens
 */
function createSvgIcon(category, isUser = false, isIncident = false) {
  if (isUser) {
    return L.divIcon({
      className: 'saheli-user-marker',
      html: `
        <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:28px; height:28px; border-radius:50%; background:rgba(59,130,246,0.35); animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:18px; height:18px; border-radius:50%; background:#2563EB; border:3px solid #FFFFFF; box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  if (isIncident) {
    return L.divIcon({
      className: 'saheli-incident-marker',
      html: `
        <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(239,68,68,0.4); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="width:24px; height:24px; border-radius:50%; background:#DC2626; color:#FFF; display:flex; align-items:center; justify-content:center; font-weight:900; border:2px solid #FFF; box-shadow:0 4px 12px rgba(220,38,38,0.5);">
            !
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }

  const colorMap = {
    Police: '#1E40AF',
    Hospital: '#DC2626',
    Ambulance: '#EA580C',
    'Fire Station': '#B91C1C',
    Pharmacy: '#059669',
    "Women's Support": '#7C3AED',
    'Safe Place': '#0D9488',
    'Security Post': '#1D4ED8',
    'Safe Partner Store': '#047857',
    Hostel: '#0284C7',
    'Property / Accommodation': '#0369A1',
    'Transit Station': '#475569',
    'Petrol Pump': '#D97706',
    'Public Restroom': '#64748B',
    'Essential Facility': '#4B5563',
  };

  const symbolMap = {
    Police: '👮',
    Hospital: '🏥',
    Ambulance: '🚑',
    'Fire Station': '🚒',
    Pharmacy: '💊',
    "Women's Support": '🛡️',
    'Safe Place': '⭐',
    'Security Post': '🛡️',
    'Safe Partner Store': '🏪',
    Hostel: '🏠',
    'Property / Accommodation': '🏢',
    'Transit Station': '🚆',
    'Petrol Pump': '⛽',
    'Public Restroom': '🚻',
    'Essential Facility': '📍',
  };

  const bg = colorMap[category] || '#3758F9';
  const symbol = symbolMap[category] || '📍';

  return L.divIcon({
    className: 'saheli-custom-marker',
    html: `
      <div style="
        background:${bg};
        color:#FFFFFF;
        width:30px;
        height:30px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        display:flex;
        align-items:center;
        justify-content:center;
        border:2px solid #FFFFFF;
        box-shadow:0 3px 10px rgba(0,0,0,0.35);
        cursor:pointer;
      ">
        <span style="transform:rotate(45deg); font-size:13px; line-height:1;">${symbol}</span>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
  });
}

/**
 * Controller child component to dynamically update map center and view
 */
function MapViewController({ center, zoom, bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (center) {
      map.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [center, zoom, bounds, map]);

  return null;
}

/**
 * Primary Interactive Leaflet Map for SAHELI
 */
export function LeafletMapView({
  userLocation = null,
  accuracy = null,
  incidentLocation = null,
  facilities = [],
  activeRoute = null,
  selectedFacility = null,
  onSelectFacility = null,
  onRequestRoute = null,
  height = '420px',
  className = '',
}) {
  const [satelliteNotice, setSatelliteNotice] = useState(false);
  const mapRef = useRef(null);

  // Default coordinate: Central New Delhi Campus Haven (28.6145, 77.2090)
  const defaultCenter = useMemo(() => {
    if (userLocation?.lat && userLocation?.lng) {
      return { lat: userLocation.lat, lng: userLocation.lng };
    }
    if (incidentLocation?.lat && incidentLocation?.lng) {
      return { lat: incidentLocation.lat, lng: incidentLocation.lng };
    }
    return { lat: 28.6145, lng: 77.209 };
  }, [userLocation, incidentLocation]);

  const [activeCenter, setActiveCenter] = useState(defaultCenter);

  useEffect(() => {
    if (userLocation?.lat && userLocation?.lng) {
      setActiveCenter({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [userLocation]);

  // Center on selected facility when active
  useEffect(() => {
    if (selectedFacility?.latitude && selectedFacility?.longitude) {
      setActiveCenter({ lat: selectedFacility.latitude, lng: selectedFacility.longitude });
    }
  }, [selectedFacility]);

  const handleRecenter = useCallback(() => {
    if (userLocation?.lat && userLocation?.lng) {
      setActiveCenter({ lat: userLocation.lat, lng: userLocation.lng });
    } else if (incidentLocation?.lat && incidentLocation?.lng) {
      setActiveCenter({ lat: incidentLocation.lat, lng: incidentLocation.lng });
    }
  }, [userLocation, incidentLocation]);

  const handleToggleSatellite = () => {
    // Honest explanation for satellite imagery
    setSatelliteNotice(true);
    setTimeout(() => setSatelliteNotice(false), 5000);
  };

  // Compute bounding box if route is active
  const routeBounds = useMemo(() => {
    if (!activeRoute?.coordinates || activeRoute.coordinates.length < 2) return null;
    return L.latLngBounds(activeRoute.coordinates);
  }, [activeRoute]);

  return (
    <div
      className={`saheli-leaflet-container ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <MapContainer
        center={[activeCenter.lat, activeCenter.lng]}
        zoom={14}
        style={{ width: '100%', height: '100%', backgroundColor: '#0F172A' }}
        ref={mapRef}
        zoomControl={false}
      >
        <MapViewController
          center={activeCenter}
          zoom={14}
          bounds={routeBounds}
        />

        {/* Standard OpenStreetMap Tiles (Zero-Cost, Attribution Preserved) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* User GPS Location Marker & Accuracy Circle */}
        {userLocation?.lat && userLocation?.lng && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createSvgIcon(null, true, false)}
            >
              <Popup>
                <div style={{ padding: '4px', minWidth: '160px' }}>
                  <div style={{ fontWeight: 800, color: '#2563EB', fontSize: '0.875rem', marginBottom: '2px' }}>
                    📍 Your Verified GPS Position
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.4 }}>
                    Coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    {accuracy ? ` (Accuracy: ±${Math.round(accuracy)}m)` : ''}
                  </div>
                </div>
              </Popup>
            </Marker>
            {accuracy && accuracy > 5 && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={Math.min(accuracy, 800)}
                pathOptions={{
                  color: '#2563EB',
                  fillColor: '#3B82F6',
                  fillOpacity: 0.12,
                  weight: 1,
                  dashArray: '4, 4',
                }}
              />
            )}
          </>
        )}

        {/* Active Emergency Incident Marker */}
        {incidentLocation?.lat && incidentLocation?.lng && (
          <Marker
            position={[incidentLocation.lat, incidentLocation.lng]}
            icon={createSvgIcon(null, false, true)}
          >
            <Popup>
              <div style={{ padding: '4px', minWidth: '180px' }}>
                <div style={{ fontWeight: 800, color: '#DC2626', fontSize: '0.875rem' }}>
                  🚨 Active Emergency Incident
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4B5563', marginTop: '4px' }}>
                  {incidentLocation.title || 'Emergency Telemetry Beacon'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Real Facilities & Verified Havens Markers */}
        {facilities.map((fac) => {
          if (!fac.latitude || !fac.longitude) return null;
          return (
            <Marker
              key={fac.id}
              position={[fac.latitude, fac.longitude]}
              icon={createSvgIcon(fac.category, false, false)}
              eventHandlers={{
                click: () => onSelectFacility && onSelectFacility(fac),
              }}
            >
              <Popup>
                <div style={{ padding: '6px', maxWidth: '240px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                      }}
                    >
                      {fac.category}
                    </span>
                    {fac.straightLineDistanceKm !== undefined && (
                      <span style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 600 }}>
                        {fac.distanceFormatted || `${fac.straightLineDistanceKm} km`}
                      </span>
                    )}
                  </div>

                  <strong style={{ display: 'block', fontSize: '0.875rem', color: '#111827', margin: '2px 0 4px 0' }}>
                    {fac.name}
                  </strong>

                  <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#4B5563', lineHeight: 1.3 }}>
                    {fac.address}
                  </p>

                  {fac.phone && (
                    <div style={{ marginBottom: '6px' }}>
                      <a
                        href={`tel:${fac.phone.replace(/[^\d+]/g, '')}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#059669',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                        }}
                      >
                        <Phone size={12} /> Call: {fac.phone}
                      </a>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {onRequestRoute && (
                      <button
                        type="button"
                        onClick={() => onRequestRoute(fac)}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#3758F9',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Navigation size={11} /> Route Preview
                      </button>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.6875rem',
                        textDecoration: 'none',
                      }}
                      title="Open external navigation"
                    >
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Real Route Geometry Polyline from OSRM */}
        {activeRoute?.coordinates && activeRoute.coordinates.length > 1 && (
          <Polyline
            positions={activeRoute.coordinates}
            pathOptions={{
              color: '#3758F9',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
      </MapContainer>

      {/* Floating Map Controls Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 1000,
        }}
      >
        {/* Recenter Button */}
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Recenter Map to Current GPS Location"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-bg-surface, #FFFFFF)',
            border: '1px solid var(--color-border-subtle, #E2E8F0)',
            color: 'var(--color-text-primary, #0F172A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          title="Recenter to GPS Location"
        >
          <LocateFixed size={18} />
        </button>

        {/* Satellite Imagery Toggle (with authentic explanation) */}
        <button
          type="button"
          onClick={handleToggleSatellite}
          aria-label="Satellite Imagery Information"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-bg-surface, #FFFFFF)',
            border: '1px solid var(--color-border-subtle, #E2E8F0)',
            color: 'var(--color-text-primary, #0F172A)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
          title="Satellite Imagery Info"
        >
          <Layers size={18} />
        </button>
      </div>

      {/* Satellite Imagery Disclaimer Toast */}
      {satelliteNotice && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '12px',
            right: '12px',
            zIndex: 1000,
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            lineHeight: 1.4,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Info size={16} style={{ color: '#60A5FA', flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Satellite View Notice:</strong> High-resolution satellite tiles require a commercial provider key (e.g., Mapbox Satellite or ESRI World Imagery). Standard OpenStreetMap cartographic vector tiles remain active at zero cost.
          </span>
        </div>
      )}

      {/* Route Info Pill when active */}
      {activeRoute && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 1000,
            padding: '6px 12px',
            borderRadius: '9999px',
            backgroundColor: '#3758F9',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(55, 88, 249, 0.4)',
          }}
        >
          <Navigation size={13} />
          <span>
            Walking Route: {activeRoute.distanceFormatted} • {activeRoute.durationFormatted}
          </span>
        </div>
      )}
    </div>
  );
}
