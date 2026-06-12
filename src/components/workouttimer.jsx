import React, { useState, useEffect, useRef } from 'react';

export default function WorkoutTimer({ isRunning }) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  // Reset elapsed when workout starts fresh (isRunning flips from false to true)
  const prevRunningRef = useRef(false);

  useEffect(() => {
    if (isRunning && !prevRunningRef.current) {
      // Fresh start — reset elapsed
      setElapsed(0);
      startTimeRef.current = Date.now();
    }
    prevRunningRef.current = isRunning;

    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      const tick = () => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (!isRunning) startTimeRef.current = null;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      padding: '8px 20px',
      zIndex: 10,
      pointerEvents: 'none'
    }}>
      <span style={{
        fontSize: '18px',
        fontWeight: 700,
        color: '#fff',
        fontVariantNumeric: 'tabular-nums'
      }}>
        {formatTime(elapsed)}
      </span>
    </div>
  );
}
