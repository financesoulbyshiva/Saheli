import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

/**
 * ErrorBoundary Component
 * Protects safety critical UI from uncaught runtime crashes.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SAHELI Uncaught Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#070A12',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#0E1424',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <ShieldAlert size={32} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
              Safety System Notice
            </h2>

            <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '24px' }}>
              The application encountered an unexpected display state. Emergency hotline services and backup systems remain operational.
            </p>

            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #0284C7 0%, #6366F1 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 24px',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
              }}
            >
              <RotateCcw size={16} />
              Restore Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
