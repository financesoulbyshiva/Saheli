import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal / Dialog Component
 * Clean, accessible dialog for confirmations, fake calls, and safe place previews.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = 'md', // 'sm' | 'md' | 'lg'
  showCloseButton = true,
  className = '',
}) {
  // ESC key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="saheli-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`saheli-modal-content saheli-modal-content--${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="saheli-modal-header">
          {title && <h2 className="saheli-modal-title">{title}</h2>}
          {showCloseButton && (
            <button
              type="button"
              className="saheli-modal-close-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="saheli-modal-body">{children}</div>

        {footer && <div className="saheli-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
