import React, { useEffect, useState } from 'react';
import Logo from './logo';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  // phase 0: logo appears, phase 1: text appears, phase 2: bar fills, phase 3: fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1100);
    const t3 = setTimeout(() => setPhase(3), 2400);
    const t4 = setTimeout(() => onDone && onDone(), 2900);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-0)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      opacity: phase === 3 ? 0 : 1,
      transition: 'opacity 0.5s ease',
    }}>

      {/* Ambient glow behind logo */}
      <div style={{
        position: 'absolute',
        width: '280px', height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-dim) 0%, transparent 70%)',
        opacity: phase >= 1 ? 1 : 0,
        transition: 'opacity 0.8s ease',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        opacity: phase >= 0 ? 1 : 0,
        transform: phase >= 0 ? 'scale(1)' : 'scale(0.7)',
        transition: 'opacity 0.6s cubic-bezier(0.34,1.56,0.64,1), transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        marginBottom: '28px',
        animation: phase === 2 ? 'logoPulse 1.2s ease-in-out infinite' : 'none',
      }}>
        <Logo color="accent" size={80} />
      </div>

      {/* Brand name */}
      <div style={{
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        textAlign: 'center',
        marginBottom: '48px',
      }}>
        <div style={{
          fontSize: '28px', fontWeight: 900,
          letterSpacing: '-0.04em',
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: '6px',
        }}>
          BODYBVILDER
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 500, letterSpacing: '0.06em' }}>
          AI FORM COACH
        </div>
      </div>

      {/* Loading bar */}
      <div style={{
        width: '120px', height: '2px',
        background: 'var(--bg-3)',
        borderRadius: '99px',
        overflow: 'hidden',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        <div style={{
          height: '100%',
          background: 'var(--gradient-accent)',
          borderRadius: '99px',
          width: phase >= 2 ? '100%' : '0%',
          transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}
