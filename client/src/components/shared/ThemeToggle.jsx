import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

/**
 * Flexible Theme Toggle Component
 * Supports multiple variants:
 * - 'icon': Compact round button with animated rotating icon (perfect for headers/navbars)
 * - 'pill': Segmented switch showing both [ ☀️ Light | 🌙 Dark ]
 * - 'switch': Classic sliding thumb toggle switch
 */
export default function ThemeToggle({ variant = 'icon', className = '', style = {} }) {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <div
        className={`theme-pill-switcher ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '9999px',
          padding: '3px',
          gap: '2px',
          userSelect: 'none',
          ...style,
        }}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            fontSize: '11.5px',
            fontWeight: 600,
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            background: !isDark ? '#ffffff' : 'transparent',
            color: !isDark ? '#0f172a' : '#94a3b8',
            boxShadow: !isDark ? '0 2px 8px rgba(0, 0, 0, 0.12)' : 'none',
          }}
          title="Switch to Light Mode"
        >
          <Sun size={13} style={{ color: !isDark ? '#f59e0b' : '#94a3b8' }} />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            fontSize: '11.5px',
            fontWeight: 600,
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            background: isDark ? '#ffffff' : 'transparent',
            color: isDark ? '#090a0f' : '#64748b',
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
          }}
          title="Switch to Dark Mode"
        >
          <Moon size={13} style={{ color: isDark ? '#38bdf8' : '#64748b' }} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'switch') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-switch-btn ${className}`}
        style={{
          width: 44,
          height: 24,
          borderRadius: '9999px',
          background: isDark ? '#334155' : '#cbd5e1',
          border: 'none',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.25s ease',
          outline: 'none',
          ...style,
        }}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        aria-label={`Toggle theme: currently ${theme}`}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isDark ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          {isDark ? (
            <Moon size={11} style={{ color: '#090a0f' }} />
          ) : (
            <Sun size={11} style={{ color: '#f59e0b' }} />
          )}
        </span>
      </button>
    );
  }

  // Default: 'icon' variant
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-icon-toggle ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: '9999px',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.1)',
        background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
        color: isDark ? '#f8fafc' : '#0f172a',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        outline: 'none',
        ...style,
      }}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      {isDark ? (
        <Sun size={16} style={{ color: '#fbbf24', transition: 'transform 0.3s ease' }} />
      ) : (
        <Moon size={16} style={{ color: '#6366f1', transition: 'transform 0.3s ease' }} />
      )}
    </button>
  );
}
