import React, { useRef } from 'react';
import Logo from './logo';

export default function ShareCard({ exercise, score, reps, duration, onClose }) {
  const cardRef = useRef(null);
  
  const handleShare = async () => {
    // Simplified share without html2canvas
    const text = `Just crushed ${exercise.name} on BODYBVILDER!\nForm Score: ${score}%\nReps: ${reps}\nDuration: ${Math.floor(duration/60)}m ${duration%60}s\n\n#BODYBVILDER #AIFormCoach`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BODYBVILDER Workout', text });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Workout summary copied to clipboard!');
    }
  };
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--overlay)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{ textAlign: 'center', maxWidth: '360px', width: '100%' }}>
        <div
          ref={cardRef}
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid var(--accent-dim)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Logo color="accent" size={60} />
          </div>
          
          <h2 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            WORKOUT COMPLETE
          </h2>
          
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>
            {exercise?.name || 'Workout'}
          </h1>
          
          <div style={{ 
            width: '80px', 
            height: '4px', 
            background: 'var(--accent)', 
            borderRadius: '2px', 
            margin: '16px auto' 
          }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent)' }}>{score || 0}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Form Score</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{reps || 0}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reps</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {Math.floor((duration || 0) / 60)}:{((duration || 0) % 60).toString().padStart(2, '0')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration</div>
            </div>
          </div>
          
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Powered by BODYBVILDER AI Form Coach
          </p>
        </div>
        
        <button
          onClick={(e) => { e.stopPropagation(); handleShare(); }}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          Share Workout
        </button>
        
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}