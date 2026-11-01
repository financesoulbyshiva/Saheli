import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/Card';
import { getLiveWeather } from '../../services/weatherService';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  RefreshCw,
  AlertTriangle,
  Info,
  MapPin,
} from 'lucide-react';

export function WeatherCard({
  latitude,
  longitude,
  locationName = 'Current Location',
  className = '',
}) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      setError('GPS coordinates required for live meteorological data.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getLiveWeather(latitude, longitude);
    if (result.success) {
      setWeather(result.data);
    } else {
      setError(result.error || 'Unable to retrieve live weather.');
    }
    setLoading(false);
  }, [latitude, longitude]);

  useEffect(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      fetchWeather();
    }
  }, [latitude, longitude, fetchWeather]);

  if (!latitude || !longitude) {
    return (
      <div
        className={`saheli-weather-card-empty ${className}`}
        style={{
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: 'var(--color-bg-surface-subtle)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CloudSun size={18} style={{ color: 'var(--color-brand-primary)' }} />
          <span>Enable device location to retrieve live Open-Meteo weather and safety advisories.</span>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div
        className={`saheli-weather-card-error ${className}`}
        style={{
          padding: '10px 14px',
          borderRadius: '10px',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          color: 'var(--color-danger, #EF4444)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
        <button
          type="button"
          onClick={fetchWeather}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Retry
        </button>
      </div>
    );
  }

  if (loading && !weather) {
    return (
      <div
        style={{
          padding: '12px',
          borderRadius: '10px',
          backgroundColor: 'var(--color-bg-surface-subtle)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <RefreshCw size={15} className="animate-spin" />
        <span>Fetching live meteorological observations from Open-Meteo...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <Card className={`saheli-weather-card ${className}`} style={{ overflow: 'hidden' }}>
      <CardContent style={{ padding: '1rem' }}>
        {/* Top Header: Location, Condition & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} style={{ color: 'var(--color-brand-primary)' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {locationName}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              ({weather.latitude.toFixed(2)}°, {weather.longitude.toFixed(2)}°)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              Updated {weather.lastUpdated}
            </span>
            <button
              type="button"
              onClick={fetchWeather}
              disabled={loading}
              title="Refresh weather data"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Primary Metric Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          {/* Main Temp & Condition */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{weather.icon}</span>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
                {weather.temperature}°C
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                {weather.condition}
              </div>
            </div>
          </div>

          {/* Feels Like */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            <Thermometer size={15} style={{ color: '#F59E0B' }} />
            <div>
              <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.6875rem' }}>Feels like</span>
              <strong>{weather.apparentTemperature}°C</strong>
            </div>
          </div>

          {/* Humidity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            <Droplets size={15} style={{ color: '#3B82F6' }} />
            <div>
              <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.6875rem' }}>Humidity</span>
              <strong>{weather.relativeHumidity}%</strong>
            </div>
          </div>

          {/* Wind Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            <Wind size={15} style={{ color: '#10B981' }} />
            <div>
              <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.6875rem' }}>Wind</span>
              <strong>{weather.windSpeed} km/h</strong>
            </div>
          </div>

          {/* Rain Probability */}
          {weather.rainProbability !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              <CloudRain size={15} style={{ color: '#6366F1' }} />
              <div>
                <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.6875rem' }}>Precipitation</span>
                <strong>{weather.rainProbability}%</strong>
              </div>
            </div>
          )}
        </div>

        {/* Outdoor Safety Advisories (Derived from Real Metrics) */}
        {weather.safetyAlerts?.length > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {weather.safetyAlerts.map((alert, i) => (
              <div
                key={i}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor:
                    alert.level === 'danger'
                      ? 'rgba(239, 68, 68, 0.12)'
                      : alert.level === 'warning'
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(59, 130, 246, 0.1)',
                  border: `1px solid ${
                    alert.level === 'danger'
                      ? 'rgba(239, 68, 68, 0.35)'
                      : alert.level === 'warning'
                      ? 'rgba(245, 158, 11, 0.35)'
                      : 'rgba(59, 130, 246, 0.3)'
                  }`,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  color: 'var(--color-text-primary)',
                }}
              >
                <Info size={14} style={{ color: '#F59E0B', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>{alert.title}:</strong> {alert.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transparent Attribution Link */}
        <div style={{ marginTop: '0.625rem', textAlign: 'right', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
          Meteorological data provided by{' '}
          <a
            href={weather.attributionUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-brand-primary)', textDecoration: 'underline' }}
          >
            {weather.attribution}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
