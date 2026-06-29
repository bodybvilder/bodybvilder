import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePoseDetection } from '../hooks/useposedetection';
import SkeletonOverlay from '../components/skeletonoverlay';
import WorkoutTimer from '../components/workouttimer';
import ShareCard from '../components/sharecard';
import WorkoutSummary from '../components/workoutsummary';
import MuscleDiagram, { MuscleList } from '../components/musclediagram';
import ExerciseGif from '../components/exercisegif';
import SmartRestTimer from '../components/resttimer';
import { usePro } from '../hooks/usepro';
import { getExerciseById } from '../data/exercises';
import ExerciseIcon from '../components/exerciseicons';
import { useBodyProfile } from '../hooks/useBodyProfile';
import SmartBurnEngine from '../engine/SmartBurnEngine';
import CalorieBurnDisplay from '../components/calorieburndisplay';
import useWorkoutLog, { getProgressionSuggestion, getExerciseSessions } from '../hooks/useWorkoutLog';

// ── Icons ──────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── PR Celebration Overlay ─────────────────────────────────────────────────
// Ref: Strava's "Trophy" moment + Apple Fitness+ ring close animation
// Full-screen radial burst with the new PR weight, auto-dismisses after 2.8s
function PRCelebration({ weight, unit, visible, onDone }) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  if (!visible) return null;
  return (
    <div
      onClick={onDone}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        animation: 'prFadeIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
        cursor: 'pointer',
      }}
    >
      <style>{`
        @keyframes prFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes prBurst {
          0%   { transform: scale(0.3) rotate(-8deg); opacity:0 }
          60%  { transform: scale(1.08) rotate(2deg); opacity:1 }
          100% { transform: scale(1) rotate(0deg); opacity:1 }
        }
        @keyframes prRing {
          0%   { transform: scale(0.5); opacity:0 }
          50%  { transform: scale(1.3); opacity:0.5 }
          100% { transform: scale(2.2); opacity:0 }
        }
        @keyframes prSlideUp {
          from { opacity:0; transform: translateY(20px) }
          to   { opacity:1; transform: translateY(0) }
        }
        @keyframes prParticle {
          0%   { transform: translateY(0) scale(1); opacity:1 }
          100% { transform: translateY(-120px) scale(0); opacity:0 }
        }
      `}</style>

      {/* Radial burst rings — like Apple ring close */}
      {[0, 150, 300].map(delay => (
        <div key={delay} style={{
          position: 'absolute',
          width: '220px', height: '220px',
          borderRadius: '50%',
          border: '2px solid rgba(200,255,0,0.6)',
          animation: `prRing 1.4s ${delay}ms cubic-bezier(0.16,1,0.3,1) both`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Floating lime particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${4 + (i % 3) * 3}px`,
          height: `${4 + (i % 3) * 3}px`,
          borderRadius: '50%',
          background: i % 2 === 0 ? '#C8FF00' : '#fff',
          top: `${30 + (i * 5)}%`,
          left: `${10 + (i * 10)}%`,
          animation: `prParticle ${0.8 + i * 0.12}s ${i * 60}ms ease-out both`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Main badge */}
      <div style={{
        animation: 'prBurst 0.55s cubic-bezier(0.34,1.56,0.64,1) both',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
      }}>
        {/* Trophy icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #C8FF00 0%, #8FFF00 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 48px rgba(200,255,0,0.5), 0 0 100px rgba(200,255,0,0.15)',
          marginBottom: '8px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#000">
            <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
            <path d="M4 22h16"/>
            <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
            <line x1="12" y1="15" x2="12" y2="22"/>
          </svg>
        </div>

        <div style={{
          fontSize: '13px', fontWeight: 800, letterSpacing: '0.18em',
          color: '#C8FF00', textTransform: 'uppercase',
          animation: 'prSlideUp 0.4s 0.2s both',
        }}>
          New Personal Record
        </div>

        <div style={{
          fontSize: '64px', fontWeight: 900, color: '#fff',
          letterSpacing: '-0.05em', lineHeight: 1,
          animation: 'prSlideUp 0.4s 0.3s both',
        }}>
          {weight}
          <span style={{ fontSize: '24px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: '4px' }}>
            {unit}
          </span>
        </div>

        <div style={{
          fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500,
          animation: 'prSlideUp 0.4s 0.4s both',
        }}>
          Tap to dismiss
        </div>
      </div>
    </div>
  );
}

// ── Progression Badge (pre-start screen) ──────────────────────────────────
// Shows last session stats + suggested weight for this session
function ProgressionBadge({ exerciseId, targetReps }) {
  const suggestion = getProgressionSuggestion(exerciseId, targetReps);
  const sessions   = getExerciseSessions(exerciseId, 1);
  const last       = sessions[0];
  if (!last) return null;

  const lastDate = new Date(last.date);
  const daysAgo  = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
  const dateLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;
  const lastMaxWeight = last.sets?.length
    ? Math.max(...last.sets.map(s => s.weight || 0))
    : null;
  const lastUnit = last.sets?.[0]?.unit || 'kg';

  return (
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '14px 16px', marginBottom: '16px',
      animation: 'fadeUp 0.4s 0.15s both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          Last Session · {dateLabel}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
        {/* Last weight */}
        {lastMaxWeight != null && (
          <div style={{ flex: 1, background: 'var(--bg-2)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>Last Weight</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {lastMaxWeight}<span style={{ fontSize: '11px', color: 'var(--text-3)', marginLeft: '2px' }}>{lastUnit}</span>
            </div>
          </div>
        )}

        {/* Sets done */}
        <div style={{ flex: 1, background: 'var(--bg-2)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>Sets Done</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {last.sets?.length || 0}
          </div>
        </div>

        {/* Suggestion */}
        {suggestion && (
          <div style={{ flex: 1.4, background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>Try Today</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {suggestion.suggestedWeight}<span style={{ fontSize: '11px', marginLeft: '2px' }}>{suggestion.unit}</span>
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(200,255,0,0.6)', marginTop: '2px', lineHeight: 1.3 }}>{suggestion.reason}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Inline Set Logger — compact by default, expand on tap ────────────────
function InlineSetLogger({ exerciseId, exerciseName, currentSet, targetReps, wLog }) {
  const [weight, setWeight] = useState('');
  const [reps,   setReps]   = useState(String(targetReps));
  const [unit,   setUnit]   = useState(() => {
    try { return getExerciseSessions(exerciseId, 1)[0]?.sets?.[0]?.unit || 'kg'; }
    catch { return 'kg'; }
  });
  const [open,   setOpen]   = useState(false);
  const [saved,  setSaved]  = useState(false);

  useEffect(() => {
    const s = getProgressionSuggestion(exerciseId, targetReps);
    if (s && !weight) setWeight(String(s.suggestedWeight));
  }, [exerciseId, targetReps]); // eslint-disable-line

  const sets = wLog.activeSession?.sets || [];

  const handleLog = () => {
    if (!weight || !reps) return;
    wLog.logSet(weight, unit, reps);
    setSaved(true);
    setOpen(false);
    setTimeout(() => setSaved(false), 1000);
    if (navigator.vibrate) navigator.vibrate([6, 40, 6]);
  };

  const nudge = (field, delta) => {
    if (field === 'weight') {
      const step = unit === 'kg' ? 2.5 : 5;
      setWeight(v => String(Math.max(0, parseFloat(v || 0) + delta * step)));
    } else {
      setReps(v => String(Math.max(1, parseInt(v || 1) + delta)));
    }
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      {/* ── Collapsed row: logged chips + Log button ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        background: 'rgba(0,0,0,0.55)', borderRadius: '14px',
        border: `1px solid ${open ? 'rgba(200,255,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
        padding: '8px 12px', cursor: 'pointer',
        transition: 'border-color 0.15s',
      }} onClick={() => setOpen(v => !v)}>

        {/* Set label */}
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.03em', flexShrink: 0 }}>
          Set {currentSet}
        </span>

        {/* Logged set chips */}
        <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {sets.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(200,255,0,0.12)', border: '1px solid rgba(200,255,0,0.2)',
              borderRadius: '7px', padding: '2px 8px',
              fontSize: '11px', fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
            }}>
              {s.weight}{s.unit}×{s.reps}
            </div>
          ))}
          {sets.length === 0 && (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              Tap to log set
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* ── Expanded logger ── */}
      {open && (
        <div style={{
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)',
          borderRadius: '14px', padding: '14px',
          marginTop: '4px', border: '1px solid rgba(255,255,255,0.1)',
          animation: 'slideUp 0.18s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {/* Undo chip */}
          {sets.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
              {sets.map((s, i) => (
                <div key={i} style={{ background: 'rgba(200,255,0,0.1)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: '8px', padding: '3px 9px', fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>
                  S{i+1}: {s.weight}{s.unit}×{s.reps}
                </div>
              ))}
              <button onClick={wLog.undoLastSet} style={{ background: 'rgba(255,59,59,0.12)', border: '1px solid rgba(255,59,59,0.2)', borderRadius: '8px', padding: '3px 9px', fontSize: '11px', fontWeight: 700, color: '#FF6B6B', cursor: 'pointer', fontFamily: 'inherit' }}>Undo</button>
            </div>
          )}

          {/* Weight + Reps row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            {/* Weight */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px', textAlign: 'center' }}>Weight</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button onClick={() => nudge('weight', -1)} style={{ width: 44, height: 52, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '22px', fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <input type="number" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)}
                  style={{ flex: 1, height: 52, padding: '0 4px', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '26px', fontWeight: 900, outline: 'none', fontFamily: 'inherit', textAlign: 'center', letterSpacing: '-0.04em', boxSizing: 'border-box' }}
                />
                <button onClick={() => nudge('weight', 1)} style={{ width: 44, height: 52, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '22px', fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                {['kg','lb'].map(u => (
                  <button key={u} onClick={() => setUnit(u)} style={{ padding: '2px 9px', borderRadius: '99px', border: 'none', background: unit===u?'var(--accent)':'rgba(255,255,255,0.08)', color: unit===u?'#000':'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{u}</button>
                ))}
              </div>
            </div>

            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '18px', fontWeight: 300, marginTop: '-12px' }}>×</div>

            {/* Reps */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px', textAlign: 'center' }}>Reps</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button onClick={() => nudge('reps', -1)} style={{ width: 44, height: 52, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '22px', fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <input type="number" inputMode="numeric" value={reps} onChange={e => setReps(e.target.value)}
                  style={{ flex: 1, height: 52, padding: '0 4px', borderRadius: '10px', border: '1.5px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.1)', color: 'var(--accent)', fontSize: '26px', fontWeight: 900, outline: 'none', fontFamily: 'inherit', textAlign: 'center', letterSpacing: '-0.04em', boxSizing: 'border-box' }}
                />
                <button onClick={() => nudge('reps', 1)} style={{ width: 44, height: 52, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '22px', fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
            </div>
          </div>

          {/* Log button */}
          <button onClick={handleLog} disabled={!weight || !reps}
            style={{
              width: '100%', height: 50, borderRadius: '13px', border: 'none',
              background: (weight && reps) ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
              color: (weight && reps) ? '#000' : 'rgba(255,255,255,0.2)',
              fontSize: '14px', fontWeight: 800, cursor: (weight && reps) ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Log Set {currentSet}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Overlay modes ──────────────────────────────────────────────────────────
// 'clean'     → raw video only
// 'skeleton'  → video + skeleton bones
// 'hud'       → video + skeleton + score/rep HUD burned in
const OVERLAY_MODES = [
  { id: 'clean',    label: 'Clean',    icon: '▷' },
  { id: 'skeleton', label: 'Bones',    icon: '⬡' },
  { id: 'hud',      label: 'HUD',      icon: '◈' },
];

// ── Score color helper ─────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 88) return '#C8FF00';
  if (s >= 65) return '#FF9500';
  return '#FF3B3B';
}

// ── Toast notification ────────────────────────────────────────────────────
function Toast({ msg, visible }) {
  return (
    <div style={{
      position: 'absolute', bottom: '110px', left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : '12px'})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(16px)',
      borderRadius: '99px', padding: '10px 20px',
      color: '#fff', fontSize: '13px', fontWeight: 700,
      pointerEvents: 'none', zIndex: 50,
      border: '1px solid rgba(255,255,255,0.12)',
      whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  );
}

// ── Countdown overlay ─────────────────────────────────────────────────────
function CountdownOverlay({ count }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 40, pointerEvents: 'none',
    }}>
      <div key={count} style={{
        fontSize: '120px', fontWeight: 900,
        color: '#fff', lineHeight: 1,
        letterSpacing: '-0.06em',
        textShadow: '0 0 60px rgba(200,255,0,0.6), 0 4px 24px rgba(0,0,0,0.8)',
        animation: 'countPop 0.9s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {count}
      </div>
    </div>
  );
}

// ── Recording progress ring (bottom center) ────────────────────────────────
function RecordRing({ isRecording, elapsed, maxSec = 60 }) {
  const R = 24, circ = 2 * Math.PI * R;
  const pct = Math.min(elapsed / maxSec, 1);
  const offset = circ * (1 - pct);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  if (!isRecording) return null;
  return (
    <div style={{
      position: 'absolute', bottom: '96px', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      zIndex: 20, pointerEvents: 'none',
    }}>
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={R} fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.12)" strokeWidth="3"/>
        <circle cx="30" cy="30" r={R} fill="none" stroke="#FF3B3B"
          strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 30 30)"
          style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 6px #FF3B3B)' }}
        />
        <text x="30" y="35" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="inherit">
          {mins}:{secs}
        </text>
      </svg>
    </div>
  );
}

export default function WorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isPro } = usePro();
  const exerciseId = searchParams.get('exercise') || 'pushup';
  const exercise = getExerciseById(exerciseId) || getExerciseById('pushup');
  const isPose = exercise?.isPose === true || exerciseId.startsWith('pose-');

  // ── SmartBurnEngine ────────────────────────────────────────────────────
  const { weightKg } = useBodyProfile();
  const burnEngineRef   = useRef(null);
  const burnIntervalRef = useRef(null);
  const [burnData, setBurnData] = useState(null);
  const formScoreRef = useRef(null);
  if (!formScoreRef.current) {
    formScoreRef.current = {
      _s: [],
      addSample: function(s) {
        if (s > 0) {
          this._s.push(s);
          // Keep last 5 min of samples
          if (this._s.length > 300) this._s.shift();
        }
      },
      getMultiplier: function() {
        const arr = this._s;
        if (!arr.length) return 1.0;
        const avg = arr.reduce(function(a, b) { return a + b; }, 0) / arr.length;
        if (avg >= 95) return 1.30;
        if (avg >= 85) return 1.20;
        if (avg >= 75) return 1.10;
        if (avg >= 65) return 1.00;
        if (avg >= 55) return 0.90;
        if (avg >= 45) return 0.80;
        return 0.70;
      },
      reset: function() { this._s = []; },
    };
  }

  // ── Refs ─────────────────────────────────────────────────────────────
  const videoRef = useRef(null);
  const canvasRef = useRef(null);          // MediaPipe skeleton canvas
  const compositeRef = useRef(null);       // off-screen composite canvas for recording
  const compositeLoopRef = useRef(null);   // rAF loop id
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const controlsTimeoutRef = useRef(null);
  const recordElapsedRef = useRef(null);

  // ── Camera state ──────────────────────────────────────────────────────
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const cameraPreloadedRef = useRef(false);

  // ── Workout state ─────────────────────────────────────────────────────
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [workoutStartTime, setWorkoutStartTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [showShareCard, setShowShareCard] = useState(false);
  const [workoutStats, setWorkoutStats] = useState(null);

  // ── UI state ──────────────────────────────────────────────────────────
  const [showControls, setShowControls] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [customSets, setCustomSets] = useState(null);
  const [customReps, setCustomReps] = useState(null);

  // ── Camera capture state ──────────────────────────────────────────────
  const [overlayMode, setOverlayMode] = useState('skeleton');  // clean | skeleton | hud
  const [isRecording, setIsRecording] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const [captureFlash, setCaptureFlash] = useState(false);
  const [countdownVal, setCountdownVal] = useState(null);  // null | 3 | 2 | 1
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // ── Workout Log — must be declared before any useEffect that uses it ──
  const wLog = useWorkoutLog();

  // ── PR Celebration state ───────────────────────────────────────────────
  const [prVisible, setPrVisible] = useState(false);
  const [prData, setPrData] = useState({ weight: 0, unit: 'kg' });

  // Also fire PR celebration from wLog (weight logger PRs)
  useEffect(() => {
    if (wLog.lastPR) {
      setPrData({ weight: wLog.lastPR.weight, unit: wLog.lastPR.unit });
      setPrVisible(true);
    }
  }, [wLog.lastPR]);

  const targetSets = customSets ?? exercise?.targetSets ?? 3;
  const targetReps = customReps ?? exercise?.targetReps ?? 12;

  // ── Voice Cues ────────────────────────────────────────────────────────
  const voiceEnabledRef = useRef(
    () => localStorage.getItem('bv-sound') !== 'false'
  );
  const lastSpokenRef = useRef({ text: '', time: 0 });
  const speakCue = useCallback((text) => {
    if (!voiceEnabledRef.current()) return;
    if (!window.speechSynthesis) return;
    const now = Date.now();
    if (lastSpokenRef.current.text === text && now - lastSpokenRef.current.time < 3000) return;
    lastSpokenRef.current = { text, time: now };
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.1;
    utt.pitch = 1.0;
    utt.volume = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.localService) || voices[0];
    if (preferred) utt.voice = preferred;
    window.speechSynthesis.speak(utt);
  }, []);

  // ── usePoseDetection — enabled only when camera AND workout are both active ─
  const { isReady, score, feedback, repCount, resetRepCount } = usePoseDetection(
    videoRef, canvasRef, cameraEnabled && isWorkoutActive, facingMode, exerciseId
  );

  // Speak feedback whenever it changes during active workout
  const prevFeedbackRef = useRef('');
  useEffect(() => {
    if (!isWorkoutActive || !feedback || feedback === prevFeedbackRef.current) return;
    prevFeedbackRef.current = feedback;
    speakCue(feedback);
  }, [feedback, isWorkoutActive, speakCue]);

  // Announce rep milestones
  const prevRepCountRef = useRef(0);
  useEffect(() => {
    if (!isWorkoutActive) return;
    if (repCount === prevRepCountRef.current) return;
    prevRepCountRef.current = repCount;
    if (repCount > 0 && repCount % 5 === 0) {
      speakCue(`${repCount} reps`);
    }
    if (repCount === targetReps) {
      speakCue(`Set complete! ${targetReps} reps done.`);
    }
  }, [repCount, isWorkoutActive, targetReps, speakCue]);

  // ── Feed form samples ──────────────────────────────────────────────────
  useEffect(() => {
    if (isWorkoutActive && score > 0) {
      formScoreRef.current.addSample(score);
    }
  }, [score, isWorkoutActive]);

  // ── Start / stop burn engine with workout ─────────────────────────────
  useEffect(() => {
    if (isWorkoutActive) {
      burnEngineRef.current = new SmartBurnEngine({
        exerciseId,
        weightKg: weightKg ?? null,
      });
      burnEngineRef.current.start();
      formScoreRef.current.reset();
      burnIntervalRef.current = setInterval(function() {
        if (!burnEngineRef.current) return;
        const fm   = formScoreRef.current.getMultiplier();
        const data = burnEngineRef.current.calculate({ formMultiplier: fm });
        setBurnData(data);
      }, 1000);
    } else {
      clearInterval(burnIntervalRef.current);
    }
    return function() { clearInterval(burnIntervalRef.current); };
  }, [isWorkoutActive]); // eslint-disable-line

  // ── Toast helper ──────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  // ── Controls auto-hide ────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isWorkoutActive) setShowControls(false);
    }, 3000);
  }, [isWorkoutActive]);

  // ── Auto-start after mount when navigated with ?autostart=1 ──────────
  useEffect(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  }, []); // eslint-disable-line

  // ── Start workout (manual — user pressed Start button) ───────────────
  const handleStart = () => {
    setCameraEnabled(true);
    setIsWorkoutActive(true);
    setWorkoutStartTime(Date.now());
    setShowControls(false);
    resetRepCount();
    handleTap();
    wLog.startSession(exerciseId, exercise?.name || exerciseId);
  };

  // ── Preload camera on first user gesture (pre-start screen) ───────────
  const handlePreloadCamera = useCallback(() => {
    if (cameraPreloadedRef.current) return;
    cameraPreloadedRef.current = true;
    setCameraEnabled(true);
  }, []);

  // ── Stop / save workout ───────────────────────────────────────────────
  const stopWorkout = useCallback(() => {
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    const fm             = formScoreRef.current.getMultiplier();
    const finalBurn      = burnEngineRef.current
      ? burnEngineRef.current.calculate({ formMultiplier: fm })
      : null;
    const caloriesBurned = finalBurn ? finalBurn.totalBurn : 0;

    setWorkoutStats({ exercise, score: Math.round(score), reps: repCount, duration: duration || 0, caloriesBurned,
      exerciseName: exercise?.name || exerciseId });
    setIsWorkoutActive(false);
    setShowShareCard(true);
    try {
      const saved = localStorage.getItem('bv-stats');
      const stats = saved ? JSON.parse(saved) : {
        workoutsCompleted: 0, streak: 0, lastWorkout: null,
        totalReps: 0, totalTime: 0, totalCalories: 0,
        weeklyWorkouts: [0,0,0,0,0,0,0]
      };
      stats.workoutsCompleted += 1;
      stats.totalReps         += repCount;
      stats.totalTime         += (duration || 0);
      stats.totalCalories      = (stats.totalCalories || 0) + caloriesBurned;
      const today    = new Date();
      const dayIndex = today.getDay();
      stats.weeklyWorkouts[dayIndex] = (stats.weeklyWorkouts[dayIndex] || 0) + 1;
      const todayStr = today.toDateString();
      if (stats.lastWorkout !== todayStr) {
        const lastDate    = stats.lastWorkout ? new Date(stats.lastWorkout) : null;
        const yesterday   = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate && lastDate.toDateString() === yesterday.toDateString()) stats.streak += 1;
        else if (!lastDate || lastDate.toDateString() !== todayStr) stats.streak = 1;
        stats.lastWorkout = todayStr;
      }
      localStorage.setItem('bv-stats', JSON.stringify(stats));
      const hist    = localStorage.getItem('bv-history');
      const history = hist ? JSON.parse(hist) : [];
      history.push({
        exerciseName:   exercise?.name || 'Workout',
        exerciseId,
        score:          Math.round(score),
        reps:           repCount,
        duration:       duration || 0,
        caloriesBurned,
        formMultiplier: parseFloat(fm.toFixed(2)),
        confidence:     finalBurn ? finalBurn.confidence : 'low',
        date:           new Date().toISOString(),
      });
      localStorage.setItem('bv-history', JSON.stringify(history.slice(-50)));
    } catch (err) { console.error('Save workout error:', err); }
    // Finish workout log session
    wLog.finishSession();
  }, [workoutStartTime, score, repCount, exercise, exerciseId]); // eslint-disable-line

  // ── Next set / rest ───────────────────────────────────────────────────
  const nextSet = () => {
    if (currentSet < targetSets) {
      if (isPro) {
        const diff = exercise?.difficulty || 'beginner';
        setRestDuration(diff === 'advanced' ? 90 : diff === 'intermediate' ? 75 : 60);
        setShowRestTimer(true);
        setIsWorkoutActive(false);
      } else {
        setCurrentSet(prev => prev + 1);
        resetRepCount();
      }
    } else {
      stopWorkout();
    }
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    setCurrentSet(prev => prev + 1);
    resetRepCount();
    setIsWorkoutActive(true);
  };

  // ── Camera flip ───────────────────────────────────────────────────────
  const handleFlipCamera = useCallback(() => {
    if (isRecording) return; // safety: don't flip mid-record
    setCameraEnabled(false);
    setTimeout(() => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
      setCameraEnabled(true);
    }, 200);
  }, [isRecording]);

  // ── Build composite canvas frame ──────────────────────────────────────
  // Returns a fully drawn canvas (video + optional skeleton + optional HUD)
  const buildCompositeFrame = useCallback((targetCanvas) => {
    const video = videoRef.current;
    const skelCanvas = canvasRef.current;
    if (!video || !video.videoWidth) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (targetCanvas.width !== w) targetCanvas.width = w;
    if (targetCanvas.height !== h) targetCanvas.height = h;

    const ctx = targetCanvas.getContext('2d');
    ctx.save();

    // Mirror for front cam
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    // Skeleton overlay (skeleton or hud mode) — canvas is already in mirrored coords
    if ((overlayMode === 'skeleton' || overlayMode === 'hud') && skelCanvas) {
      ctx.drawImage(skelCanvas, 0, 0, w, h);
    }

    // HUD: score + rep counter + watermark burned in
    if (overlayMode === 'hud') {
      const col = scoreColor(score);
      // Score pill (top-left)
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      roundRect(ctx, 16, 16, 80, 54, 12);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '700 10px system-ui';
      ctx.fillText('FORM', 28, 34);
      ctx.fillStyle = col;
      ctx.font = '900 28px system-ui';
      ctx.fillText(String(score), 24, 62);

      // Rep counter (bottom center)
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      roundRect(ctx, w / 2 - 44, h - 82, 88, 56, 14);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 36px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(String(repCount), w / 2, h - 46);
      ctx.font = '700 10px system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(exercise?.isTimed ? 'SECONDS' : 'REPS', w / 2, h - 34);
      ctx.textAlign = 'left';

      // Watermark
      ctx.fillStyle = 'rgba(200,255,0,0.75)';
      ctx.font = '800 11px system-ui';
      ctx.fillText('BODYBVILDER', w - 112, h - 12);
    }
  }, [facingMode, overlayMode, score, repCount, exercise]);

  // Helper: roundRect polyfill
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Screenshot ────────────────────────────────────────────────────────
  const handleScreenshot = useCallback(() => {
    const snap = document.createElement('canvas');
    buildCompositeFrame(snap);

    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 280);

    snap.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `bodybvilder-${exerciseId}.jpg`, { type: 'image/jpeg' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        navigator.share({ title: 'BODYBVILDER', text: `${exercise?.name} · Score ${score}`, files: [file] }).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
      }
      showToast('Photo saved!');
    }, 'image/jpeg', 0.93);
  }, [buildCompositeFrame, exerciseId, exercise, score, showToast]);

  // ── Countdown then record ─────────────────────────────────────────────
  const handleCountdownRecord = useCallback((delaySeconds) => {
    let n = delaySeconds;
    setCountdownVal(n);
    const tick = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(tick);
        setCountdownVal(null);
        startRecording();
      } else {
        setCountdownVal(n);
      }
    }, 1000);
  }, []); // eslint-disable-line

  // ── Start recording (from composite canvas) ───────────────────────────
  const startRecording = useCallback(() => {
    const comp = document.createElement('canvas');
    compositeRef.current = comp;
    recordedChunksRef.current = [];

    // Drive composite at ~30fps via rAF loop
    const loop = () => {
      buildCompositeFrame(comp);
      compositeLoopRef.current = requestAnimationFrame(loop);
    };
    compositeLoopRef.current = requestAnimationFrame(loop);

    const stream = comp.captureStream(30);
    const mimeTypes = [
      'video/webm;codecs=vp9', 'video/webm;codecs=vp8',
      'video/webm', 'video/mp4',
    ];
    const mime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
    let recorder;
    try { recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {}); }
    catch { recorder = new MediaRecorder(stream); }

    recorder.ondataavailable = e => { if (e.data?.size > 0) recordedChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      cancelAnimationFrame(compositeLoopRef.current);
      const ext = mime.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunksRef.current, { type: mime || 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bodybvilder-${exerciseId}-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Video saved!');
    };
    recorder.start(500);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordElapsed(0);
    recordElapsedRef.current = setInterval(() => {
      setRecordElapsed(s => s + 1);
    }, 1000);
  }, [buildCompositeFrame, exerciseId, showToast]);

  // ── Stop recording ────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    clearInterval(recordElapsedRef.current);
    setIsRecording(false);
    setRecordElapsed(0);
  }, []);

  // ── Toggle record ─────────────────────────────────────────────────────
  const handleToggleRecord = useCallback(() => {
    if (isRecording) { stopRecording(); }
    else { handleCountdownRecord(3); }
  }, [isRecording, stopRecording, handleCountdownRecord]);

  // ── PRE-START SCREEN ──────────────────────────────────────────────────
  if (!cameraEnabled) {
    return (
      <div
        style={{ height: '100dvh', background: 'var(--bg-0)', overflowY: 'auto', position: 'relative', overflow: 'hidden' }}
        onPointerDown={handlePreloadCamera}
      >
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
          @keyframes countPop { from { opacity:0; transform:scale(0.4); } to { opacity:1; transform:scale(1); } }
          @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

        {/* video+canvas hidden in DOM so refs are ready before Start is pressed */}
        <video ref={videoRef} style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} playsInline muted />
        <canvas ref={canvasRef} style={{ position: 'fixed', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }} />
        {/* Dark gradient overlay so content stays readable */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.72) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Scrollable content layer */}
        <div style={{ position: 'relative', zIndex: 1, height: '100%', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
            <ArrowLeftIcon />
          </button>
        </div>

        <div style={{ padding: '20px 20px calc(40px + env(safe-area-inset-bottom))', textAlign: 'center' }}>
          {/* AI status pill — shows while skeleton loads, fades when ready */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '99px',
            background: 'rgba(0,0,0,0.55)', border: `1px solid ${isReady ? 'rgba(200,255,0,0.4)' : 'rgba(255,255,255,0.15)'}`,
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
            color: isReady ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
            marginBottom: '14px', transition: 'all 0.4s ease',
            animation: 'fadeUp 0.4s both',
          }}>
            {isReady ? (
              <>
                <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#C8FF00"/></svg>
                AI skeleton ready
              </>
            ) : (
              <>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                Loading AI...
              </>
            )}
          </div>
          {/* Icon — trophy for pose, equipment icon for exercise */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid rgba(200,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'fadeUp 0.4s both' }}>
            {isPose ? (
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                <line x1="12" y1="15" x2="12" y2="22"/>
                <path d="M9 18c1.5 1 4.5 1 6 0"/>
              </svg>
            ) : (
              <ExerciseIcon
                equipment={exercise?.equipment}
                category={exercise?.category}
                size={38}
                color="var(--accent)"
              />
            )}
          </div>

          {/* Category badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '99px', background: 'var(--bg-1)', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px', animation: 'fadeUp 0.4s 0.04s both',
            color: isPose ? 'var(--accent)' : 'var(--text-2)',
            borderColor: isPose ? 'rgba(200,255,0,0.3)' : 'var(--border)',
            background: isPose ? 'var(--accent-dim)' : 'var(--bg-1)',
          }}>
            {isPose && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="var(--accent)">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            )}
            {isPose
              ? (exercise?.division === 'mens-physique' ? "Men's Physique" : 'Classic — IFBB')
              : (exercise?.category || 'exercise')
            }
          </div>

          <h2 style={{ fontSize: 'clamp(26px,7vw,36px)', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '12px', animation: 'fadeUp 0.4s 0.07s both' }}>
            {exercise?.name || 'Workout'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto 24px', animation: 'fadeUp 0.4s 0.1s both' }}>
            {exercise?.description || 'Get in position and start when ready.'}
          </p>

          {/* Exercise preview — GIF from ExerciseDB + muscle diagram */}
          <div style={{ animation: 'fadeUp 0.4s 0.12s both', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <ExerciseGif exerciseId={exerciseId} size={240} />
            </div>
            {/* Muscle diagram — only for exercises, not poses */}
            {!isPose && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                <MuscleDiagram muscles={exercise?.muscles || []} exerciseId={exerciseId} size={80} />
                <MuscleList muscles={exercise?.muscles || []} />
              </div>
            )}
          </div>

          {/* Stats row — hide for poses */}
          {!isPose && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', animation: 'fadeUp 0.4s 0.14s both' }}>
            {[
              { val: `${targetSets}×${exercise?.isTimed ? `${targetReps}s` : targetReps}`, label: 'Target' },
              { val: exercise?.difficulty || 'beginner', label: 'Level' },
              { val: exercise?.equipment === 'none' ? 'No gear' : exercise?.equipment || '—', label: 'Equipment' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '12px 8px', textAlign: 'center', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: i === 0 ? 'var(--accent)' : 'var(--text-0)', marginBottom: '3px', textTransform: i === 1 ? 'capitalize' : undefined }}>{s.val}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
          )}

          {/* Progressive overload badge — shows last session + today's suggestion */}
          {!isPose && (
            <ProgressionBadge exerciseId={exerciseId} targetReps={targetReps} />
          )}

          {/* Sets & Reps picker — hide for poses */}
          {!isPose && (
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '16px', animation: 'fadeUp 0.4s 0.16s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sets &amp; Reps</span>
              <button onClick={() => { setCustomSets(exercise?.targetSets ?? 3); setCustomReps(exercise?.targetReps ?? 12); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--accent)', fontWeight: 600, fontFamily: 'inherit' }}>Reset</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {[
                { label: 'Sets', val: targetSets, min: 1, max: 20, set: v => setCustomSets(v) },
                { label: exercise?.isTimed ? 'Seconds' : 'Reps', val: targetReps, min: 1, max: 200, set: v => setCustomReps(v), accent: true },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {i === 1 && <div style={{ fontSize: '20px', color: 'var(--text-3)', fontWeight: 300 }}>×</div>}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>{item.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <button onClick={() => item.set(Math.max(item.min, item.val - 1))}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span style={{ fontSize: '26px', fontWeight: 900, color: item.accent ? 'var(--accent)' : 'var(--text-0)', minWidth: '36px', textAlign: 'center', letterSpacing: '-0.04em' }}>{item.val}</span>
                      <button onClick={() => item.set(Math.min(item.max, item.val + 1))}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          )}

          {/* Pose — how it works info card */}
          {isPose && (
            <div style={{
              background: 'var(--bg-1)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '16px', marginBottom: '16px',
              animation: 'fadeUp 0.4s 0.16s both',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                How it works
              </div>
              {[
                { iconEl: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="8" width="20" height="12" rx="3"/><path d="M8 8V6a4 4 0 018 0v2"/><line x1="9" y1="14" x2="9" y2="14" strokeWidth="3"/><line x1="15" y1="14" x2="15" y2="14" strokeWidth="3"/></svg>), text: 'AI scores your pose in real-time' },
                { iconEl: (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>), text: 'Hold 70+ score for 2.5s to count' },
                { iconEl: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/><line x1="12" y1="15" x2="12" y2="22"/></svg>), text: 'Best score saved automatically' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < 2 ? '8px' : 0 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-dim)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                    {item.iconEl}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Start button */}
          <button onClick={handleStart}
            style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: 'var(--gradient-accent)', color: '#000', fontSize: '17px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '-0.01em', boxShadow: 'var(--accent-glow)', animation: 'fadeUp 0.4s 0.18s both' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            {isPose ? 'Start Practice' : `Start ${targetSets}×${targetReps}`}
          </button>
        </div>
        </div>{/* end scrollable content layer */}
      </div>
    );
  }

  // ── ACTIVE CAMERA SCREEN ──────────────────────────────────────────────
  return (
    <div style={{ height: '100dvh', background: '#000', position: 'relative', overflow: 'hidden' }} onClick={handleTap}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes countPop { 0%{opacity:0;transform:scale(0.3)} 60%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
      `}</style>

      {/* ── Video feed ── */}
      <video ref={videoRef}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover',
          // Mirror front cam for natural selfie view
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          transformOrigin: 'center center',
        }}
        playsInline muted />

      {/* ── Skeleton canvas ── */}
      {/* Canvas must NOT be flipped — MediaPipe draws in raw camera coords.
          Video is flipped for display, canvas stays unflipped so bones align. */}
      <canvas ref={canvasRef}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none',
          opacity: overlayMode === 'clean' ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }} />

      {/* ── Score + feedback overlay (visible in skeleton/hud modes) ── */}
      {overlayMode !== 'clean' && isWorkoutActive && (
        <SkeletonOverlay score={score} feedback={feedback} />
      )}

      {/* ── AI loading indicator — shown while MediaPipe initializes ── */}
      {!isReady && isWorkoutActive && overlayMode !== 'clean' && (
        <div style={{
          position: 'absolute',
          bottom: '140px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '99px',
          padding: '10px 18px',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 20,
          pointerEvents: 'none',
          animation: 'fadeIn 0.3s ease',
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            width: '16px', height: '16px',
            border: '2px solid rgba(200,255,0,0.3)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
            Loading AI skeleton...
          </span>
        </div>
      )}

      {/* ── Workout timer ── */}
      <WorkoutTimer isRunning={isWorkoutActive} />

      {/* ── Capture flash ── */}
      {captureFlash && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 45, pointerEvents: 'none', animation: 'fadeIn 0.05s' }} />
      )}

      {/* ── Countdown overlay ── */}
      {countdownVal !== null && <CountdownOverlay count={countdownVal} />}

      {/* ── Recording progress ring ── */}
      <RecordRing isRecording={isRecording} elapsed={recordElapsed} />

      {/* ── Toast ── */}
      <Toast msg={toastMsg} visible={toastVisible} />

      {/* ── REC badge ── */}
      {isRecording && (
        <div style={{ position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '16px', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,40,40,0.88)', backdropFilter: 'blur(8px)', borderRadius: '99px', padding: '5px 10px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', animation: 'pulseDot 1s ease-in-out infinite' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>REC</span>
        </div>
      )}

      {/* ── Rep counter (large, center-screen) ── */}
      {isWorkoutActive && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
          /* Push slightly up so it doesn't clash with bottom controls */
          marginTop: '-60px',
        }}>
          {/* Rep count big number */}
          <div style={{
            fontSize: '96px',
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 2px 32px rgba(0,0,0,0.7)',
            lineHeight: 1,
            letterSpacing: '-0.06em',
            /* Subtle glow that changes with rep */
            filter: `drop-shadow(0 0 24px rgba(200,255,0,0.18))`,
          }}>
            {repCount}
          </div>
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginTop: '4px',
            fontWeight: 700,
          }}>
            {exercise?.isTimed ? 'Seconds' : 'Reps'}
          </div>

          {/* Progress bar toward target reps */}
          {!exercise?.isTimed && targetReps > 0 && (
            <div style={{
              marginTop: '10px',
              width: '80px',
              height: '3px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '99px',
              overflow: 'hidden',
              margin: '10px auto 0',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min((repCount / targetReps) * 100, 100)}%`,
                background: repCount >= targetReps ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                borderRadius: '99px',
                transition: 'width 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              }}/>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          RIGHT SIDEBAR — TikTok/IG style vertical controls
      ════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '10px', zIndex: 20,
        opacity: showControls || !isWorkoutActive ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: showControls || !isWorkoutActive ? 'auto' : 'none',
      }}>

        {/* Set counter pill */}
        <div style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '14px', padding: '8px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', minWidth: '48px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1px' }}>Set</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{currentSet}<span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>/{targetSets}</span></div>
        </div>

        {/* Flip camera */}
        <SidebarBtn onClick={handleFlipCamera} disabled={isRecording} title="Flip">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
        </SidebarBtn>

        {/* Overlay mode toggle */}
        <div style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          {OVERLAY_MODES.map(m => (
            <button key={m.id} onClick={e => { e.stopPropagation(); setOverlayMode(m.id); }}
              title={m.label}
              style={{ display: 'block', width: '44px', padding: '9px 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em', background: overlayMode === m.id ? 'var(--accent)' : 'transparent', color: overlayMode === m.id ? '#000' : 'rgba(255,255,255,0.7)', transition: 'all 0.15s ease', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Screenshot */}
        <SidebarBtn onClick={e => { e.stopPropagation(); handleScreenshot(); }} title="Photo">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
          </svg>
        </SidebarBtn>

        {/* Record toggle */}
        <SidebarBtn
          onClick={e => { e.stopPropagation(); handleToggleRecord(); }}
          active={isRecording}
          activeColor="#FF3B3B"
          title={isRecording ? 'Stop' : 'Record'}>
          {isRecording
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
            : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          }
        </SidebarBtn>

        {/* Tips toggle */}
        {exercise?.tips && (
          <SidebarBtn onClick={e => { e.stopPropagation(); setShowTips(v => !v); }} active={showTips} title="Tips">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
          </SidebarBtn>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BOTTOM CONTROLS BAR
      ════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        zIndex: 20,
        opacity: showControls || !isWorkoutActive ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: showControls || !isWorkoutActive ? 'auto' : 'none',
      }}>

        {/* Tips panel */}
        {showTips && exercise?.tips && (
          <div style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', padding: '14px 16px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.08)', animation: 'slideUp 0.25s both' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Form Tips</p>
            {exercise.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '3px 0', color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: 1.4 }}>
                <CheckIcon size={13} />
                {tip}
              </div>
            ))}
          </div>
        )}

        {/* ── Compact Set Logger (expandable) ── */}
        {isWorkoutActive && !isPose && (
          <InlineSetLogger
            exerciseId={exerciseId}
            exerciseName={exercise?.name || exerciseId}
            currentSet={currentSet}
            targetReps={targetReps}
            wLog={wLog}
          />
        )}

        {/* ── Calorie pill (compact) ── */}
        {isWorkoutActive && burnData && burnData.totalBurn > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '10px', padding: '6px 12px',
            background: 'rgba(0,0,0,0.4)', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF6B00" strokeWidth="0">
              <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3C8.928 6.857 9.776 4.946 12 3c.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0c0-1.153.433-2.294 1-3A2.5 2.5 0 008.5 14.5z"/>
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{burnData.totalBurn} kcal</span>
            {burnData.formMultiplier !== 1.0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: burnData.formMultiplier > 1 ? 'var(--accent)' : '#FF3B3B', marginLeft: 'auto' }}>
                ×{burnData.formMultiplier.toFixed(2)} form
              </span>
            )}
          </div>
        )}

        {/* ── Action buttons: End + Next/Finish ── */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Exercise name (compact, left-aligned) */}
          <button
            onClick={() => { resetRepCount(); cameraPreloadedRef.current = false; setCameraEnabled(false); setIsWorkoutActive(false); setCurrentSet(1); if (isRecording) stopRecording(); }}
            style={{
              width: 48, height: 48, borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
            </svg>
          </button>
          <button onClick={nextSet}
            style={{
              flex: 1, height: 52, borderRadius: '16px', border: 'none',
              background: 'var(--gradient-accent)', color: '#000',
              fontSize: '16px', fontWeight: 800, cursor: 'pointer',
              fontFamily: 'inherit', letterSpacing: '-0.01em',
              boxShadow: 'var(--accent-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
            {currentSet < targetSets ? (
              <>
                Set {currentSet + 1}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            ) : (
              <>
                Done
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Rest timer ── */}
      {showRestTimer && (
        <SmartRestTimer isActive={showRestTimer} duration={restDuration} onComplete={handleRestComplete} onSkip={handleRestComplete} />
      )}

      {/* ── PR Celebration overlay (fires during active workout) ── */}
      {!showShareCard && (
        <PRCelebration
          weight={prData.weight}
          unit={prData.unit}
          visible={prVisible}
          onDone={() => { setPrVisible(false); wLog.clearPR(); }}
        />
      )}

      {/* ── Workout Summary (full-screen post-workout screen) ── */}
      {showShareCard && workoutStats && (
        <WorkoutSummary
          stats={{
            exerciseName:  workoutStats.exerciseName,
            score:         workoutStats.score,
            repCount:      workoutStats.reps,
            duration:      workoutStats.duration,
            calories:      workoutStats.caloriesBurned,
          }}
          wLogSession={wLog.activeSession || (() => {
            try {
              const sessions = JSON.parse(localStorage.getItem('bv-wlog-sessions') || '[]');
              return sessions[sessions.length - 1] || null;
            } catch { return null; }
          })()}
          newPR={wLog.lastPR}
          onClose={() => { setShowShareCard(false); wLog.clearPR(); navigate('/'); }}
          onShare={() => {
            /* ShareCard still available as secondary action */
          }}
        />
      )}
    </div>
  );
}

// ── Sidebar button component ───────────────────────────────────────────────
function SidebarBtn({ onClick, children, disabled, active, activeColor = 'rgba(200,255,0,0.9)', title }) {
  const hapticTap = () => {
    if (navigator.vibrate) navigator.vibrate(5);
  };
  return (
    <button
      onClick={(e) => { hapticTap(); onClick(e); }}
      disabled={disabled}
      aria-label={title}
      style={{
        width: '48px', height: '48px',
        borderRadius: '50%',
        border: `1.5px solid ${active ? activeColor : 'rgba(255,255,255,0.14)'}`,
        background: active ? activeColor : 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: active ? (activeColor === 'rgba(200,255,0,0.9)' ? '#000' : '#fff') : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
