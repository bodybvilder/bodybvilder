import React from 'react';

export default function SkeletonOverlay({ score, feedback }) {
  const getScoreColor = () => {
    if (score >= 90) return 'var(--success)';
    if (score >= 70) return 'var(--warning)';
    return 'var(--danger)';
  };
  
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      right: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      pointerEvents: 'none',
      zIndex: 10
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '12px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Form Score
        </span>
        <span style={{ 
          fontSize: '32px', 
          fontWeight: 800, 
          color: getScoreColor(),
          lineHeight: 1 
        }}>
          {score}
        </span>
      </div>
      
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '12px 18px',
        maxWidth: '200px'
      }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
          {feedback || 'Get in position...'}
        </span>
      </div>
    </div>
  );
}