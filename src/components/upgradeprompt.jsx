import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Inline upgrade prompt — shows inside the page, not a blocking modal.
 * Philosophy: show the value, let user choose. Never block core features.
 *
 * Usage:
 *   <UpgradePrompt
 *     feature="Form Score Trends"
 *     desc="See how your form improves over time"
 *     compact={false}
 *   />
 */
export default function UpgradePrompt({ feature, desc, compact = false }) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <button
        onClick={() => navigate('/pro')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-dim)',
          border: '1px solid rgba(200,255,0,0.2)',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: '11px', fontWeight: 700,
          color: 'var(--accent)', letterSpacing: '0.03em',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--accent)">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        PRO
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid rgba(200,255,0,0.15)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      animation: 'fadeUp 0.3s ease both',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em' }}>
            PRO FEATURE
          </span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '3px' }}>
          {feature}
        </div>
        {desc && (
          <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.5 }}>
            {desc}
          </div>
        )}
      </div>
      <button
        onClick={() => navigate('/pro')}
        style={{
          flexShrink: 0,
          padding: '10px 16px',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          background: 'var(--gradient-accent)',
          color: '#000',
          fontSize: '13px', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        Unlock
      </button>
    </div>
  );
}
