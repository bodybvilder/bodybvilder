import React from 'react';

export default function StreakBadge({ streak, size = 'md' }) {
  const isLarge = size === 'lg';
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: isLarge ? '12px' : '6px',
      background: 'var(--accent-dim)',
      padding: isLarge ? '12px 20px' : '6px 12px',
      borderRadius: isLarge ? '16px' : '12px',
      border: '1px solid var(--accent-dim)'
    }}>
      <svg width={isLarge ? 28 : 18} height={isLarge ? 28 : 18} viewBox="0 0 24 24" fill="var(--accent)">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
      <div>
        <div style={{ 
          fontSize: isLarge ? '28px' : '16px', 
          fontWeight: 800, 
          color: 'var(--accent)',
          lineHeight: 1 
        }}>
          {streak}
        </div>
        <div style={{ 
          fontSize: isLarge ? '12px' : '9px', 
          color: 'var(--text-muted)', 
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Day Streak
        </div>
      </div>
    </div>
  );
}