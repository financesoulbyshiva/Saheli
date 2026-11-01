
/**
 * Reusable Button Component
 * High-contrast, mobile-friendly touch targets with accessible focus states.
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'caution' | 'danger' | 'success' | 'ghost' | 'outline'
  size = 'md',        // 'sm' | 'md' | 'lg'
  fullWidth = false,
  icon = null,
  onClick,
  disabled = false,
  type = 'button',
  ariaLabel,
  className = '',
  ...props
}) {
  const classes = [
    'saheli-btn',
    `saheli-btn--${variant}`,
    `saheli-btn--${size}`,
    fullWidth ? 'saheli-btn--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {icon && <span className="saheli-btn__icon" aria-hidden="true">{icon}</span>}
      <span className="saheli-btn__label">{children}</span>
    </button>
  );
}
