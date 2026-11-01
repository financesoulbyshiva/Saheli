
/**
 * Reusable Badge Component
 * Compact status indicators, tags, and category chips.
 */
export function Badge({
  children,
  variant = 'neutral', // 'neutral' | 'primary' | 'safe' | 'caution' | 'threat' | 'emergency' | 'recovered'
  size = 'md',        // 'sm' | 'md'
  icon = null,
  className = '',
  ...props
}) {
  const classes = [
    'saheli-badge',
    `saheli-badge--${variant}`,
    `saheli-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...props}>
      {icon && <span className="saheli-badge__icon" aria-hidden="true">{icon}</span>}
      <span className="saheli-badge__text">{children}</span>
    </span>
  );
}
