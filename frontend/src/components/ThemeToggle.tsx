import React, { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if user has a saved theme preference, otherwise default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDark(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        background: 'var(--bg-bubble-them)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-primary)',
        padding: '8px 14px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'transform 0.2s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
}

export default ThemeToggle;
