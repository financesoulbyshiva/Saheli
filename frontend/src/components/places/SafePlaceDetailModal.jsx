import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MapPin, Clock, ShieldCheck, CheckCircle2, Info, ExternalLink } from 'lucide-react';
import { useSafety } from '../../context/SafetyContext';

/**
 * SafePlaceDetailModal Component
 * Lightweight detail view showing verified haven details, why recommended,
 * and a simulated [ I'M HERE ] check-in button.
 */
export function SafePlaceDetailModal({ place, isOpen, onClose }) {
  const { checkInAtSafePlace } = useSafety();

  if (!place) return null;

  const {
    name,
    category,
    distance,
    timeEst,
    address,
    openStatus,
    safetyTags = ['CCTV', 'Security', 'First Aid', '24/7'],
    features = [],
    whyRecommended = 'Recommended because it is the nearest available safe place with continuous staff presence.',
  } = place;

  const tags = safetyTags && safetyTags.length > 0 ? safetyTags : features;

  const handleImHere = () => {
    checkInAtSafePlace(place);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Safe Place Details"
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
            [PROTOTYPE • SIMULATED ACTIONS]
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(name + ' ' + address)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg-surface-subtle)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={14} /> Directions
            </a>
            <Button variant="ghost" size="md" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="success"
              size="md"
              icon={<CheckCircle2 size={18} />}
              onClick={handleImHere}
            >
              I'm Here (Simulate Check-in)
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header Title & Category */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {name}
            </h3>
            <Badge variant="safe" size="sm" icon={<ShieldCheck size={12} />}>
              Verified Haven
            </Badge>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-brand-secondary)', fontWeight: 600, marginTop: '2px' }}>
            Type: {category}
          </div>
        </div>

        {/* Location & Proximity Details */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} style={{ color: 'var(--color-brand-primary)' }} />
            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Distance
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {distance} (~{timeEst})
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} style={{ color: 'var(--color-state-safe)' }} />
            <div>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Hours
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-state-safe-text)' }}>
                {openStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
            Address:
          </span>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {address}
          </p>
        </div>

        {/* Why Recommended Callout */}
        <div
          style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Info size={16} style={{ color: 'var(--color-brand-primary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-brand-primary)', textTransform: 'uppercase' }}>
              Why Recommended:
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
            {whyRecommended}
          </p>
        </div>

        {/* Safety Features Tags */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
            Safety Features & Vetting:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-subtle)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                }}
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Distance Notice */}
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '0.5rem' }}>
          * Distance and walking estimates are automatically calculated based on available GPS location.
        </div>
      </div>
    </Modal>
  );
}
