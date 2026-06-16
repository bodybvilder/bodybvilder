import React from 'react';

export default function StreakBadge({ streak }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '6px 10px',
      borderRadius: '99px',
      background: streak > 0 ? 'var(--accent-dim)' : 'var(--bg-1)',
      border: `1px solid ${streak > 0 ? 'rgba(200,255,0,0.2)' : 'var(--border)'}`,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill={streak > 0 ? 'var(--accent)' : 'var(--text-3)'}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <span style={{
        fontSize: '13px', fontWeight: 800,
        color: streak > 0 ? 'var(--accent)' : 'var(--text-3)',
        letterSpacing: '-0.02em', lineHeight: 1,
      }}>
        {streak}
      </span>
    </div>
  );
}
