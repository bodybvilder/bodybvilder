// ── CalorieBurnDisplay — Real-time calorie burn widget for WorkoutPage ────
//
// UI Design references:
//   - Apple Fitness+: large hero number, minimal chrome, bottom strip layout
//   - WHOOP: horizontal card, metric + trend color, confidence-coded
//   - Principle: max 3 metrics visible during workout, breakdown on tap
//
// Props:
//   burnData    — output from SmartBurnEngine.calculate()
//   isActive    — boolean, animates only when workout running
//   onSetupBody — callback when user taps "Set up profile" CTA

import React, { useState, useEffect, useRef } from 'react';

// ── Confidence color map ──────────────────────────────────────────────────
const CONFIDENCE_CONFIG = {
  high:   { color: '#C8FF00', label: 'High accuracy',   dot: '#C8FF00' },
  medium: { color: '#FF9500', label: 'Weight-based',     dot: '#FF9500' },
  low:    { color: '#888888', label: 'Estimated (70kg)', dot: '#888888' },
};

// ── Animated number — smooth counter ─────────────────────────────────────
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const stateRef = useRef({ prev: value, raf: null });

  useEffect(() => {
    const state = stateRef.current;
    const start = state.prev;
    const end   = value;
    if (start === end) return;

    const duration  = 400;
    const startTime = performance.now();

    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) {
        state.raf = requestAnimationFrame(tick);
      } else {
        state.prev = end;
      }
    };

    state.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(state.raf);
  }, [value]);

  return <>{display}</>;
}

// ── Multiplier pill (form / personal) ────────────────────────────────────
function MultiplierPill({ label, value, color }) {
  const isBonus   = value > 1.0;
  const isPenalty = value < 1.0;
  const sign      = isBonus ? '+' : isPenalty ? '−' : '=';
  const pct       = Math.abs(Math.round((value - 1.0) * 100));

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '2px', flex: 1,
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 700,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '2px',
        padding: '3px 8px', borderRadius: '99px',
        background: isBonus
          ? 'rgba(200,255,0,0.12)'
          : isPenalty
          ? 'rgba(255,59,59,0.12)'
          : 'rgba(255,255,255,0.06)',
        border: `1px solid ${
          isBonus   ? 'rgba(200,255,0,0.25)'
          : isPenalty ? 'rgba(255,59,59,0.25)'
          : 'rgba(255,255,255,0.1)'
        }`,
      }}>
        <span style={{
          fontSize: '11px', fontWeight: 800,
          color: isBonus ? '#C8FF00' : isPenalty ? '#FF3B3B' : 'rgba(255,255,255,0.5)',
          letterSpacing: '-0.01em',
        }}>
          {value === 1.0 ? '×1.0' : `${sign}${pct}%`}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function CalorieBurnDisplay({ burnData, isActive, onSetupBody }) {
  const [expanded, setExpanded] = useState(false);
  const [pulse, setPulse]       = useState(false);
  const prevCalRef = useRef(0);

  // Pulse animation when calories tick up
  const totalBurn = burnData ? burnData.totalBurn : 0;
  useEffect(() => {
    if (!burnData || !isActive) return;
    if (totalBurn !== prevCalRef.current && totalBurn > 0) {
      prevCalRef.current = totalBurn;
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [totalBurn, isActive]); // eslint-disable-line

  // ── No data yet ───────────────────────────────────────────────────────
  if (!burnData) {
    return (
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '18px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
            <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a5 5 0 11-10 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5-2.5z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
            Calorie tracking
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
            Start workout to begin
          </div>
        </div>
      </div>
    );
  }

  const conf    = CONFIDENCE_CONFIG[burnData.confidence] ?? CONFIDENCE_CONFIG.low;
  const hasForm = burnData.formMultiplier !== 1.0;

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Main calorie card ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '18px',
          border: `1px solid ${expanded ? 'rgba(200,255,0,0.2)' : 'rgba(255,255,255,0.1)'}`,
          padding: '12px 14px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s ease',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Fire icon with pulse on new calorie */}
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(255,80,0,0.12)',
            border: '1px solid rgba(255,80,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transform: pulse ? 'scale(1.15)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="0">
              <path fill="#FF6B00"
                d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a5 5 0 11-10 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5-2.5z"/>
            </svg>
          </div>

          {/* Calorie number + label */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{
                fontSize: '28px', fontWeight: 900,
                color: '#fff', letterSpacing: '-0.04em', lineHeight: 1,
                transition: 'color 0.2s ease',
              }}>
                <AnimatedNumber value={burnData.totalBurn} />
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>
                kcal
              </span>
            </div>

            {/* Confidence row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px',
            }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: conf.dot,
                boxShadow: `0 0 4px ${conf.dot}`,
              }} />
              <span style={{
                fontSize: '10px', fontWeight: 600,
                color: conf.color, letterSpacing: '0.02em',
              }}>
                {conf.label}
              </span>
              {burnData.isEstimatedWeight && (
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
                  · tap to fix
                </span>
              )}
            </div>
          </div>

          {/* Form multiplier badge */}
          {hasForm && (
            <div style={{
              padding: '4px 10px', borderRadius: '99px',
              background: burnData.formMultiplier > 1
                ? 'rgba(200,255,0,0.12)' : 'rgba(255,59,59,0.12)',
              border: `1px solid ${burnData.formMultiplier > 1
                ? 'rgba(200,255,0,0.25)' : 'rgba(255,59,59,0.25)'}`,
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: '11px', fontWeight: 800,
                color: burnData.formMultiplier > 1 ? '#C8FF00' : '#FF3B3B',
              }}>
                ×{burnData.formMultiplier.toFixed(2)}
              </span>
            </div>
          )}

          {/* Expand chevron */}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', flexShrink: 0 }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* ── Expanded breakdown panel ── */}
      {/* Inspired by WHOOP's "Strain breakdown" — shows each multiplier layer */}
      {expanded && (
        <div style={{
          marginTop: '4px',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '14px',
          animation: 'slideUp 0.2s cubic-bezier(0.16,1,0.3,1) both',
        }}>

          {/* Formula visualization — Base × Form × Personal = Total */}
          <div style={{
            fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: '10px',
          }}>
            Burn breakdown
          </div>

          {/* Row: base × multipliers = total */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '6px', marginBottom: '14px',
          }}>
            {/* Base */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>Base</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.02em' }}>{burnData.rawBurn}</div>
            </div>

            {/* × */}
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: 700 }}>×</span>

            {/* Form */}
            <MultiplierPill label="Form" value={burnData.formMultiplier} />

            {/* × */}
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: 700 }}>×</span>

            {/* Personal */}
            <MultiplierPill label="Personal" value={burnData.personalFactor} />

            {/* = */}
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: 700 }}>=</span>

            {/* Total */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>Total</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#C8FF00', letterSpacing: '-0.02em' }}>{burnData.totalBurn}</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '12px' }} />

          {/* Meta row: MET value + elapsed */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'MET', value: burnData.metUsed?.toFixed(1) },
              { label: 'Duration', value: `${Math.floor(burnData.elapsedSeconds / 60)}m ${burnData.elapsedSeconds % 60}s` },
              { label: 'Body', value: burnData.isEstimatedWeight ? 'Estimated' : `${burnData.weightUsed}kg` },
            ].map(item => (
              <div key={item.label} style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                borderRadius: '10px', padding: '8px 6px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '3px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Profile setup CTA (only when estimated weight) */}
          {burnData.isEstimatedWeight && onSetupBody && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetupBody(); }}
              style={{
                width: '100%', marginTop: '10px',
                padding: '9px 12px', borderRadius: '10px',
                border: '1px solid rgba(200,255,0,0.2)',
                background: 'rgba(200,255,0,0.06)',
                color: '#C8FF00', fontSize: '11px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,255,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,255,0,0.06)'; }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Add your weight for accurate tracking
            </button>
          )}
        </div>
      )}
    </div>
  );
}
