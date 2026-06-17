import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * SmartRestTimer — PRO feature
 * Shows countdown between sets with progress ring
 * Auto-vibrates when rest is complete
 */
export default function SmartRestTimer({ isActive, duration = 60, onComplete, onSkip }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [phase, setPhase] = useState('idle'); // idle | counting | done
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const startTimer = useCallback(() => {
    setTimeLeft(duration);
    setPhase('counting');
    startTimeRef.current = Date.now();
  }, [duration]);

  useEffect(() => {
    if (isActive) {
      startTimer();
    } else {
      setPhase('idle');
      setTimeLeft(duration);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isActive, startTimer, duration]);

  useEffect(() => {
    if (phase !== 'counting') return;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(intervalRef.current);
        setPhase('done');
        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 200]);
        }
        onComplete?.();
      }
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [phase, duration, onComplete]);

  if (phase === 'idle') return null;

  const progress = timeLeft / duration;
  const R = 28;
  const circ = 2 * Math.PI * R;
  const offset = circ * (1 - progress);

  const urgentColor = timeLeft <= 5 ? 'var(--red)' : timeLeft <= 15 ? 'var(--orange)' : 'var(--accent)';

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 30,
      animation: 'fadeIn 0.2s ease both',
    }}>

      {/* Label */}
      <div style={{
        fontSize: '13px', fontWeight: 700,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        marginBottom: '24px',
      }}>
        {phase === 'done' ? 'Rest complete' : 'Rest time'}
      </div>

      {/* Ring countdown */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          {/* Background ring */}
          <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
          {/* Progress ring */}
          <circle
            cx="40" cy="40" r={R}
            fill="none"
            stroke={urgentColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
            style={{
              transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease',
              filter: `drop-shadow(0 0 8px ${urgentColor}80)`,
            }}
          />
        </svg>
        {/* Time display */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          {phase === 'done' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={urgentColor} strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <span style={{
              fontSize: '24px', fontWeight: 900,
              color: urgentColor,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              transition: 'color 0.3s ease',
            }}>
              {timeLeft}
            </span>
          )}
        </div>
      </div>

      {/* Next set info */}
      {phase === 'done' ? (
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '32px' }}>
          Go!
        </div>
      ) : (
        <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
          Next set starts soon
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={onSkip}
        style={{
          padding: '14px 32px',
          borderRadius: '99px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.08)',
          color: '#fff', fontSize: '15px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          backdropFilter: 'blur(10px)',
        }}
      >
        {phase === 'done' ? 'Start Next Set' : 'Skip Rest'}
      </button>
    </div>
  );
}
