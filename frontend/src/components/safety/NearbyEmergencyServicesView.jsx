import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LeafletMapView } from '../map/LeafletMapView';
import { WeatherCard } from '../weather/WeatherCard';
import { EmergencyCallButton } from './EmergencyCallButton';
import { GoogleEmbedPreview } from '../map/GoogleEmbedPreview';
import { useSafety } from '../../context/SafetyContext';
import { fetchNearbyEmergencyServices } from '../../services/overpassService';
import { searchLocations } from '../../services/geocodingService';
import { getRoutePreview } from '../../services/routingService';
import { fetchPropertiesAndHostels } from '../../services/supabaseService';
import {
  MapPin,
  Search,
  LocateFixed,
  Phone,
  ExternalLink,
  Navigation,
  Shield,
  RefreshCw,
  AlertTriangle,
  Layers,
  List,
  Map as MapIcon,
  Building,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: '📍' },
  { id: 'police', label: 'Police & Security', icon: '👮' },
  { id: 'hospital', label: 'Hospitals & Medical', icon: '🏥' },
  { id: 'ambulance', label: 'Ambulance Services', icon: '🚑' },
  { id: 'fire_station', label: 'Fire Stations', icon: '🚒' },
  { id: 'pharmacy', label: 'Pharmacies', icon: '💊' },
  { id: 'women_support', label: "Women's Support", icon: '🛡️' },
  { id: 'safe_places', label: 'Verified Safe Places', icon: '⭐' },
  { id: 'properties', label: 'Hostels & Accommodations', icon: '🏠' },
  { id: 'essential', label: 'Essential Facilities', icon: '🚻' },
];

export function NearbyEmergencyServicesView({ className = '' }) {
  const { locationStatus, requestLocationAccess, safePlaces, currentIncident } = useSafety();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Facilities from Overpass, Supabase, and verified safe places
  const [osmFacilities, setOsmFacilities] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceError, setServiceError] = useState(null);

  // Selected facility and route preview
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState(null);

  // View mode: 'split' | 'map' | 'list'
  const [viewLayout, setViewLayout] = useState('split');

  // Optional Google Maps Embed modal
  const [embedModalFacility, setEmbedModalFacility] = useState(null);

  const hasCoords = Boolean(locationStatus?.coords?.latitude && locationStatus?.coords?.longitude);
  const userCoords = useMemo(() => {
    return hasCoords
      ? { lat: locationStatus.coords.latitude, lng: locationStatus.coords.longitude }
      : null;
  }, [hasCoords, locationStatus?.coords?.latitude, locationStatus?.coords?.longitude]);

  // Fallback anchor: Central Delhi Campus Haven (28.6145, 77.2090) if GPS is pending
  const activeAnchorCoords = useMemo(() => {
    return userCoords || { lat: 28.6145, lng: 77.209 };
  }, [userCoords]);

  // 1. Fetch OpenStreetMap facilities via Overpass API
  const loadNearbyFacilities = useCallback(async (coords, cat) => {
    if (!coords?.lat || !coords?.lng) return;
    setLoadingServices(true);
    setServiceError(null);

    // Overpass category filter mapping
    let overpassCat = cat;
    if (cat === 'safe_places' || cat === 'properties') {
      overpassCat = null; // Handled by separate datasets
    }

    if (overpassCat) {
      const result = await fetchNearbyEmergencyServices({
        latitude: coords.lat,
        longitude: coords.lng,
        radiusMeters: 5000,
        category: overpassCat,
      });

      if (result.success) {
        setOsmFacilities(result.data || []);
      } else {
        setServiceError(result.error || 'Failed to query nearby facilities.');
        setOsmFacilities([]);
      }
    } else {
      setOsmFacilities([]);
    }

    // Also fetch Supabase verified properties/hostels if selected or 'all'
    if (cat === 'all' || cat === 'properties') {
      const propResult = await fetchPropertiesAndHostels();
      if (propResult.success && propResult.data) {
        setPropertiesList(propResult.data);
      }
    } else {
      setPropertiesList([]);
    }

    setLoadingServices(false);
  }, []);

  // Trigger facility load when coordinates or category changes
  useEffect(() => {
    loadNearbyFacilities(activeAnchorCoords, selectedCategory);
  }, [activeAnchorCoords, selectedCategory, loadNearbyFacilities]);

  // 2. Debounced location search via Nominatim
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchLocations(searchQuery);
      if (res.success) {
        setSearchResults(res.results || []);
      }
      setIsSearching(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Combine and format all active facilities
  const combinedFacilities = useMemo(() => {
    const list = [];

    // A. Local Verified Safe Places (from seed/database)
    if (selectedCategory === 'all' || selectedCategory === 'safe_places') {
      (safePlaces || []).forEach((sp) => {
        list.push({
          id: sp.id,
          name: sp.name,
          category: sp.category || 'Safe Place',
          address: sp.address,
          latitude: sp.latitude,
          longitude: sp.longitude,
          distanceFormatted: sp.distance,
          straightLineDistanceKm: null,
          phone: sp.phone,
          openingHours: sp.open_status,
          website: null,
          isVerifiedOfficial: true,
          dataSource: 'SAHELI Verified Safe Place Registry',
          features: sp.features || [],
          safetyTags: sp.safetyTags || [],
        });
      });
    }

    // B. OpenStreetMap Overpass Facilities
    if (selectedCategory !== 'safe_places' && selectedCategory !== 'properties') {
      list.push(...osmFacilities);
    }

    // C. Supabase Properties / Hostels
    if (selectedCategory === 'all' || selectedCategory === 'properties') {
      list.push(...propertiesList);
    }

    return list;
  }, [selectedCategory, safePlaces, osmFacilities, propertiesList]);

  // 3. Request real OSRM Route Preview
  const handleRequestRoute = async (targetFacility) => {
    if (!userCoords) {
      setRoutingError('Please enable device location first to calculate your route.');
      return;
    }

    setSelectedFacility(targetFacility);
    setRoutingLoading(true);
    setRoutingError(null);

    const result = await getRoutePreview(
      { lat: userCoords.lat, lng: userCoords.lng },
      { lat: targetFacility.latitude, lng: targetFacility.longitude },
      'walking'
    );

    if (result.success) {
      setActiveRoute(result.route);
    } else {
      setRoutingError(result.error || 'Failed to calculate walking route.');
      setActiveRoute(null);
    }
    setRoutingLoading(false);
  };

  const handleSelectSearchResult = (loc) => {
    setSearchQuery('');
    setSearchResults([]);
    loadNearbyFacilities({ lat: loc.latitude, lng: loc.longitude }, selectedCategory);
  };

  const incidentCoords = currentIncident?.latitude && currentIncident?.longitude
    ? {
        lat: currentIncident.latitude,
        lng: currentIncident.longitude,
        title: currentIncident.title,
      }
    : null;

  return (
    <div className={`saheli-nearby-services-view ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Emergency Helpline 112 Direct Header Banner */}
      <EmergencyCallButton variant="banner" />

      {/* 2. Live Weather Context (Open-Meteo Integration) */}
      <WeatherCard
        latitude={activeAnchorCoords.lat}
        longitude={activeAnchorCoords.lng}
        locationName={hasCoords ? 'Your Current Location' : 'Central Haven Zone (Delhi NCR)'}
      />

      {/* 3. Main Discovery Control Panel */}
      <Card>
        <CardHeader style={{ paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} style={{ color: 'var(--color-brand-primary)' }} />
                Nearby Emergency & Essential Services
              </CardTitle>
              <CardDescription>
                Zero-cost geospatial intelligence powered by OpenStreetMap, Overpass, and Open-Meteo.
              </CardDescription>
            </div>

            {/* GPS Status & Re-verify Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant={hasCoords ? 'ghost' : 'primary'}
                size="sm"
                icon={<LocateFixed size={15} />}
                onClick={requestLocationAccess}
              >
                {hasCoords ? 'Refresh GPS' : 'Enable Device Location'}
              </Button>

              {/* View Layout Switcher */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--color-bg-surface-subtle)',
                  borderRadius: '8px',
                  padding: '2px',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewLayout('split')}
                  title="Split View (Map + List)"
                  style={{
                    background: viewLayout === 'split' ? 'var(--color-brand-primary)' : 'transparent',
                    color: viewLayout === 'split' ? '#FFFFFF' : 'var(--color-text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Split
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('map')}
                  title="Map View Only"
                  style={{
                    background: viewLayout === 'map' ? 'var(--color-brand-primary)' : 'transparent',
                    color: viewLayout === 'map' ? '#FFFFFF' : 'var(--color-text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <MapIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('list')}
                  title="List View Only"
                  style={{
                    background: viewLayout === 'list' ? 'var(--color-brand-primary)' : 'transparent',
                    color: viewLayout === 'list' ? '#FFFFFF' : 'var(--color-text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search Bar (Nominatim Geocoding) */}
          <div style={{ position: 'relative' }}>
            <div className="input-with-icon">
              <Search size={16} className="input-icon" />
              <input
                type="text"
                className="saheli-input"
                placeholder="Search location, address, landmark, or city (e.g., Connaught Place, AIIMS, Hauz Khas)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <RefreshCw size={14} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
                </div>
              )}
            </div>

            {/* Nominatim Search Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 2000,
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {searchResults.map((result) => (
                  <button
                    key={result.placeId}
                    type="button"
                    onClick={() => handleSelectSearchResult(result)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      border: 'none',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <MapPin size={14} style={{ color: 'var(--color-brand-primary)', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {result.displayName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'thin',
            }}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: active ? '1px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                    backgroundColor: active ? 'var(--color-brand-subtle)' : 'var(--color-bg-surface-subtle)',
                    color: active ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Service or Routing Error / Status Notice */}
      {(serviceError || routingError) && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--color-danger, #EF4444)',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} />
            <span>{serviceError || routingError}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setServiceError(null);
              setRoutingError(null);
            }}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 5. Main Map & Facility List Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            viewLayout === 'map' ? '1fr' : viewLayout === 'list' ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* Interactive OpenStreetMap Leaflet Map */}
        {viewLayout !== 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <LeafletMapView
              userLocation={userCoords}
              accuracy={locationStatus?.accuracy}
              incidentLocation={incidentCoords}
              facilities={combinedFacilities}
              activeRoute={activeRoute}
              selectedFacility={selectedFacility}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
              onRequestRoute={handleRequestRoute}
              height="480px"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-text-muted)', padding: '0 4px' }}>
              <span>Map data &copy; OpenStreetMap contributors under ODbL</span>
              <span>Walking routes by Project-OSRM</span>
            </div>
          </div>
        )}

        {/* Facility Cards List */}
        {viewLayout !== 'map' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* List Header Count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {combinedFacilities.length} Facilities Discovered
              </span>
              {loadingServices && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-brand-primary)' }}>
                  <RefreshCw size={13} className="animate-spin" /> Querying OpenStreetMap Overpass...
                </div>
              )}
            </div>

            {/* Empty State */}
            {combinedFacilities.length === 0 && !loadingServices && (
              <Card>
                <CardContent style={{ padding: '2rem', textAlign: 'center' }}>
                  <Building size={36} style={{ color: 'var(--color-text-muted)', margin: '0 auto 10px auto' }} />
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                    No Facilities Mapped In This Immediate Vicinity
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    Try selecting "All Services" or increasing your search radius. SAHELI presents authentic OpenStreetMap & government registries without inserting synthetic facilities.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Result Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
              {combinedFacilities.map((fac) => {
                const isSelected = selectedFacility?.id === fac.id;
                return (
                  <Card
                    key={fac.id}
                    style={{
                      borderLeft: isSelected ? '4px solid var(--color-brand-primary)' : '1px solid var(--color-border-subtle)',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <CardContent style={{ padding: '0.875rem' }}>
                      {/* Category & Proximity */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--color-brand-subtle)',
                              color: 'var(--color-brand-primary)',
                            }}
                          >
                            {fac.category}
                          </span>
                          {fac.isVerifiedOfficial ? (
                            <Badge variant="safe" size="sm" style={{ fontSize: '0.625rem' }}>
                              Verified Registry
                            </Badge>
                          ) : (
                            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                              Community Mapped
                            </span>
                          )}
                        </div>

                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          {fac.distanceFormatted || (fac.straightLineDistanceKm ? `${fac.straightLineDistanceKm} km (aerial)` : '')}
                        </span>
                      </div>

                      {/* Name & Address */}
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                        {fac.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                        {fac.address}
                      </p>

                      {/* Phone & Hours (Only when legitimately sourced!) */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                        {fac.phone ? (
                          <a
                            href={`tel:${fac.phone.replace(/[^\d+]/g, '')}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700, textDecoration: 'none' }}
                          >
                            <Phone size={12} /> {fac.phone}
                          </a>
                        ) : (
                          <span>Phone not published on OSM</span>
                        )}

                        {fac.openingHours && (
                          <span>• Hours: {fac.openingHours}</span>
                        )}
                      </div>

                      {/* Actions: Route Preview, External Directions, Optional Google Preview */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Navigation size={13} />}
                          onClick={() => handleRequestRoute(fac)}
                          disabled={routingLoading}
                          style={{ flex: 1, minWidth: '120px' }}
                        >
                          {isSelected && activeRoute ? 'Route Active' : 'Preview Route'}
                        </Button>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--color-bg-surface-subtle)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border-subtle)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          <ExternalLink size={12} /> Directions
                        </a>

                        <button
                          type="button"
                          onClick={() => setEmbedModalFacility(fac)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-muted)',
                            border: '1px solid var(--color-border-subtle)',
                            cursor: 'pointer',
                            fontSize: '0.6875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title="Optional Google Maps embed preview"
                        >
                          <Layers size={12} /> Preview
                        </button>
                      </div>

                      {/* Data Source Footnote */}
                      <div style={{ marginTop: '6px', fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                        Source: {fac.dataSource}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Optional Google Maps Embed Modal */}
      {embedModalFacility && (
        <GoogleEmbedPreview
          latitude={embedModalFacility.latitude}
          longitude={embedModalFacility.longitude}
          placeName={embedModalFacility.name}
          isOpen={Boolean(embedModalFacility)}
          onClose={() => setEmbedModalFacility(null)}
        />
      )}
    </div>
  );
}
