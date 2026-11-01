import { SAFETY_STATE_META } from '../../data/mockData';

/**
 * Reusable StatusIndicator Component
 * A clean dot or pill showing system or contact status.
 */
export function StatusIndicator({
  state = 'SAFE',
  size = 'md',        // 'sm' | 'md' | 'lg'
  showPulse = false,
  showLabel = false,
  customLabel = null,
  className = '',
}) {
  const meta = SAFETY_STATE_META[state] || SAFETY_STATE_META.SAFE;
  const label = customLabel || meta.label;

  return (
    <div className={`saheli-status-indicator saheli-status-indicator--${size} ${className}`}>
      <span
        className={`saheli-status-dot saheli-status-dot--${state.toLowerCase()} ${showPulse ? 'saheli-status-dot--pulse' : ''}`}
        aria-hidden="true"
      />
      {showLabel && (
        <span className={`saheli-status-label saheli-status-label--${state.toLowerCase()}`}>
          {label}
        </span>
      )}
    </div>
  );
}
