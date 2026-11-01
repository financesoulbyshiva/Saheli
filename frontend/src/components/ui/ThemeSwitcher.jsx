import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeSwitcher Component
 * Global theme toggle button supporting Light and Dark themes.
 * Renders cleanly in navbars, headers, and settings panels.
 */
export function ThemeSwitcher({ variant = 'icon', className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-switcher-pill ${className}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '9999px',
          backgroundColor: 'var(--color-bg-surface-subtle)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-secondary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isDark ? (
          <>
            <Sun size={15} style={{ color: '#F59E0B' }} />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon size={15} style={{ color: '#3758F9' }} />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-switcher-icon ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-bg-surface-subtle)',
        border: '1px solid var(--color-border-subtle)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isDark ? '#F59E0B' : '#3758F9',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, background-color 0.2s ease',
      }}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
