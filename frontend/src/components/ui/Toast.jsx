import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Reusable Toast / Notification Component
 * Displays system status confirmations and simulation feedback.
 */
export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = 'info' } = toast;

  const icons = {
    info: <Info size={18} className="toast-icon toast-icon--info" />,
    success: <CheckCircle2 size={18} className="toast-icon toast-icon--success" />,
    warning: <AlertTriangle size={18} className="toast-icon toast-icon--warning" />,
    danger: <AlertCircle size={18} className="toast-icon toast-icon--danger" />,
  };

  return (
    <div className={`saheli-toast-container`} role="alert" aria-live="polite">
      <div className={`saheli-toast saheli-toast--${type}`}>
        <div className="saheli-toast__icon">{icons[type] || icons.info}</div>
        <div className="saheli-toast__message">{message}</div>
        {onClose && (
          <button
            type="button"
            className="saheli-toast__close"
            onClick={onClose}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
