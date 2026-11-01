import { AlertOctagon } from 'lucide-react';

/**
 * Reusable EmergencyButton Component
 * Highly visible, high-contrast, accessible panic trigger.
 * Triggers LOCAL simulated emergency state only (No real 112/police connection).
 */
export function EmergencyButton({
  onTrigger,
  label = 'SOS Emergency',
  sublabel = 'Instant Guardian Alert & SOS Dispatch',
  variant = 'compact', // 'compact' | 'hero'
  disabled = false,
  className = '',
}) {
  return (
    <button
      type="button"
      className={`saheli-emergency-btn saheli-emergency-btn--${variant} ${className}`}
      onClick={onTrigger}
      disabled={disabled}
      aria-label="Trigger emergency SOS assistance"
    >
      <span className="saheli-emergency-btn__pulse" aria-hidden="true" />
      <span className="saheli-emergency-btn__icon" aria-hidden="true">
        <AlertOctagon size={variant === 'hero' ? 36 : 24} />
      </span>
      <span className="saheli-emergency-btn__text-group">
        <span className="saheli-emergency-btn__title">{label}</span>
        {sublabel && <span className="saheli-emergency-btn__subtitle">{sublabel}</span>}
      </span>
    </button>
  );
}
