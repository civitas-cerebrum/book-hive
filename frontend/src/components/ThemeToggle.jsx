import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      data-testid="theme-toggle"
      onClick={toggleTheme}
      style={{
        background: 'var(--bg-tertiary)',
        border: 'none',
        borderRadius: '12px',
        padding: '4px 8px',
        color: 'var(--text-secondary)',
        fontSize: '14px',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
