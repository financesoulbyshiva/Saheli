
/**
 * Reusable Card Container
 * Clean, modern surface with consistent borders, padding and radii.
 */
export function Card({
  children,
  variant = 'default', // 'default' | 'elevated' | 'outlined' | 'subtle'
  state = null,        // 'SAFE' | 'CAUTION' | 'THREAT' | 'EMERGENCY' | 'RECOVERED'
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    'saheli-card',
    `saheli-card--${variant}`,
    state ? `saheli-card--state-${state.toLowerCase()}` : '',
    onClick ? 'saheli-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`saheli-card__header ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`saheli-card__title ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`saheli-card__description ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`saheli-card__content ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`saheli-card__footer ${className}`}>{children}</div>;
}
