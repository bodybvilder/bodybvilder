import React from 'react';

export default function SkeletonOverlay({ score, feedback }) {
  const color =
    score >= 88 ? 'var(--accent)' :
    score >= 65 ? 'var(--orange)' :
    'var(--red)';

  return (
    <div style={{
      position: 'absolute',
      top: 'calc(16px + env(safe-area-inset-top))',
      left: '16px',
      right: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      {/* Score pill */}
      <div style={{
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '14px',
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        border: `1px solid ${color}30`,
      }}>
        <span style={{
          fontSize: '10px', color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700,
        }}>
          Form
        </span>
        <span style={{
          fontSize: '30px', fontWeight: 900,
          color, lineHeight: 1,
          letterSpacing: '-0.04em',
          textShadow: `0 0 20px ${color}60`,
          transition: 'color 0.2s ease',
        }}>
          {score}
        </span>
      </div>

      {/* Feedback pill */}
      {feedback && (
        <div style={{
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '14px',
          padding: '10px 16px',
          maxWidth: '55%',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <span style={{
            fontSize: '13px', fontWeight: 700,
            color: '#fff', lineHeight: 1.3,
            display: 'block',
          }}>
            {feedback}
          </span>
        </div>
      )}
    </div>
  );
}
