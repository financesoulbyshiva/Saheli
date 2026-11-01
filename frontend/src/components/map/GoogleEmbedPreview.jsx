import { ExternalLink, X, MapPin, AlertCircle } from 'lucide-react';

/**
 * Optional Google Maps Embed Preview Component
 * Zero-cost preview mode using standard iframe embedding.
 * Only loaded if VITE_GOOGLE_MAPS_EMBED_KEY is explicitly configured.
 */
export function GoogleEmbedPreview({
  latitude,
  longitude,
  placeName = 'Location',
  isOpen = false,
  onClose,
}) {
  const embedKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY || '';

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--color-bg-surface, #FFFFFF)',
          borderRadius: '12px',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} style={{ color: '#EA4335' }} />
            <strong style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
              Google Maps Preview: {placeName}
            </strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ height: '380px', backgroundColor: '#F3F4F6' }}>
          {embedKey && latitude && longitude ? (
            <iframe
              title={`Google Map Embed for ${placeName}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${embedKey}&q=${latitude},${longitude}`}
            />
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                gap: '12px',
              }}
            >
              <AlertCircle size={32} style={{ color: '#F59E0B' }} />
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                  Google Maps Embed Key Not Configured
                </h4>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
                  The optional Google Maps preview requires <code>VITE_GOOGLE_MAPS_EMBED_KEY</code> in your environment. SAHELI uses OpenStreetMap & Leaflet as its zero-cost primary mapping engine.
                </p>
              </div>
              {latitude && longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#EA4335',
                    color: '#FFFFFF',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={14} /> Open in External Google Maps
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
