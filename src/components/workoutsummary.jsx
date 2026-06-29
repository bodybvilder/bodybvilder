import React, { useEffect, useState } from 'react';

/**
 * WorkoutSummary — full-screen post-workout celebration + stats.
 * Props:
 *   stats       : { exerciseName, score, repCount, duration, calories }
 *   wLogSession : completed session from useWorkoutLog (.sets array)
 *   newPR       : { weight, unit, exerciseName } | null
 *   onClose     : () => void
 *   onShare     : () => void
 */
export default function WorkoutSummary({ stats, wLogSession, newPR, onClose, onShare }) {
  const [visible, setVisible] = useState(false);
  const [notes,   setNotes]   = useState('');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Save notes to localStorage when closing
  const handleClose = () => {
    if (notes.trim()) {
      try {
        const sessions = JSON.parse(localStorage.getItem('bv-wlog-sessions') || '[]');
        if (sessions.length > 0) {
          sessions[sessions.length - 1].notes = notes.trim();
          localStorage.setItem('bv-wlog-sessions', JSON.stringify(sessions));
        }
      } catch {}
    }
    onClose();
  };

  if (!stats) return null;

  const duration = stats.duration || 0;
  const calories = Math.round(stats.calories || 0);
  const score    = stats.score    || 0;
  const repCount = stats.repCount || 0;
  const sets     = wLogSession?.sets || [];

  const totalVol  = Math.round(sets.reduce((s, x) => s + (x.weight || 0) * (x.reps || 0), 0));
  const maxWeight = sets.length ? Math.max(...sets.map(x => x.weight || 0)) : 0;
  const unit      = sets[0]?.unit || 'kg';

  const mins      = Math.floor(duration / 60);
  const secs      = duration % 60;
  const timeLabel = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  const scoreColor = score >= 80 ? 'var(--accent)' : score >= 60 ? 'var(--orange)' : 'var(--red)';
  const scoreLabel = score >= 90 ? 'Elite form' : score >= 80 ? 'Great form'
                   : score >= 70 ? 'Good form'  : score >= 60 ? 'Fair form' : 'Keep training';

  // First-workout "aha moment"
  const isFirstWorkout = (() => {
    try {
      const s = JSON.parse(localStorage.getItem('bv-stats') || '{}');
      return (s.workoutsCompleted || 0) <= 1;
    } catch { return false; }
  })();

  const KPIS = [
    { val: timeLabel,                              label: 'Duration', color: 'var(--text-0)' },
    { val: repCount,                               label: 'Reps',     color: 'var(--text-0)' },
    { val: calories > 0 ? calories : '—',         label: 'kcal',     color: 'var(--orange)'  },
    { val: sets.length > 0 ? sets.length : '—',   label: 'Sets',     color: 'var(--text-0)' },
    { val: totalVol  > 0 ? `${totalVol}${unit}` : '—',  label: 'Volume',  color: 'var(--accent)' },
    { val: maxWeight > 0 ? `${maxWeight}${unit}` : '—', label: 'Top set', color: 'var(--accent)' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'var(--bg-0)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <style>{`
        @keyframes confettiDrop {
          0%  { transform:translateY(-20px) rotate(0deg); opacity:1; }
          100%{ transform:translateY(120px) rotate(720deg); opacity:0; }
        }
        @keyframes summaryPopIn {
          0%  { transform:scale(0.5); opacity:0; }
          70% { transform:scale(1.08); }
          100%{ transform:scale(1); opacity:1; }
        }
        @keyframes summaryFadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:none; }
        }
      `}</style>

      {/* Confetti */}
      {visible && ['#C8FF00','#39FF14','#FFD700','#FF6B6B','#4ECDC4','#C8FF00'].map((c, i) => (
        <div key={i} style={{
          position: 'fixed', top: 0, left: `${8 + i * 17}%`,
          width: 8, height: 8, borderRadius: '50%', background: c,
          pointerEvents: 'none', zIndex: 301,
          animation: `confettiDrop ${1.2 + i * 0.15}s ${i * 0.08}s ease-in forwards`,
        }}/>
      ))}

      {/* Score ring */}
      <div style={{ padding: '44px 20px 20px', textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-2)" strokeWidth="8"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - score / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1) 0.3s' }}
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: scoreColor, letterSpacing: '-0.04em', lineHeight: 1,
              animation: 'summaryPopIn 0.5s 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
              {score}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Form
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '6px',
          animation: 'summaryFadeUp 0.4s 0.25s both' }}>
          Workout Done!
        </h1>
        <p style={{ fontSize: '15px', color: scoreColor, fontWeight: 700, marginBottom: '4px',
          animation: 'summaryFadeUp 0.4s 0.3s both' }}>
          {scoreLabel}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-3)', animation: 'summaryFadeUp 0.4s 0.32s both' }}>
          {stats.exerciseName || 'Workout'}
        </p>
      </div>

      {/* First workout Aha moment */}
      {isFirstWorkout && (
        <div style={{
          margin: '0 20px 14px',
          background: 'linear-gradient(135deg, rgba(200,255,0,0.14), rgba(57,255,20,0.07))',
          border: '1.5px solid rgba(200,255,0,0.35)',
          borderRadius: '18px', padding: '16px',
          animation: 'summaryPopIn 0.6s 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,255,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.01em' }}>
              First Workout Done!
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(200,255,0,0.7)', lineHeight: 1.55 }}>
            You're ahead of 80% of people who never start. Every world-class bodybuilder started here. Keep showing up — consistency beats talent every time.
          </div>
        </div>
      )}

      {/* PR Banner */}
      {newPR && (
        <div style={{
          margin: '0 20px 14px',
          background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.3)',
          borderRadius: '16px', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'summaryPopIn 0.5s 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <div style={{width:44,height:44,borderRadius:12,background:"var(--accent-dim)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/><line x1="12" y1="15" x2="12" y2="22"/></svg></div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)' }}>New Personal Record!</div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>
              {newPR.weight}{newPR.unit} — {newPR.exerciseName || stats.exerciseName}
            </div>
          </div>
        </div>
      )}

      {/* KPI grid */}
      <div style={{ padding: '0 20px 14px', animation: 'summaryFadeUp 0.4s 0.4s both' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {KPIS.map((k, i) => (
            <div key={i} style={{
              background: 'var(--bg-1)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '13px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: k.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>
                {k.val}
              </div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {k.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logged sets */}
      {sets.length > 0 && (
        <div style={{ padding: '0 20px 14px', animation: 'summaryFadeUp 0.4s 0.45s both' }}>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '14px 16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Sets Logged
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {sets.map((s, i) => (
                <div key={i} style={{
                  background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)',
                  borderRadius: '10px', padding: '5px 11px',
                  fontSize: '12px', fontWeight: 700, color: 'var(--accent)',
                }}>
                  S{i + 1}: {s.weight}{s.unit} × {s.reps}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workout notes */}
      <div style={{ padding: '0 20px 16px', animation: 'summaryFadeUp 0.4s 0.48s both' }}>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '14px 16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Session Notes
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How did it feel? Any PRs, injuries, or observations…"
            rows={2}
            style={{
              width: '100%', background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '10px 12px',
              color: 'var(--text-0)', fontSize: '13px', lineHeight: 1.5,
              outline: 'none', resize: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box', transition: 'border-color 0.12s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(200,255,0,0.4)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </div>

      {/* Protein reminder */}
      <div style={{ padding: '0 20px 16px', animation: 'summaryFadeUp 0.4s 0.5s both' }}>
        <div style={{
          background: 'linear-gradient(135deg,rgba(200,255,0,0.07),rgba(0,200,100,0.04))',
          border: '1px solid rgba(200,255,0,0.16)',
          borderRadius: '16px', padding: '13px 16px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(200,255,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)' }}>Protein window — 2h left</div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>0.4g/kg triggers max muscle synthesis</div>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div style={{
        padding: '0 20px', marginTop: 'auto',
        paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
        animation: 'summaryFadeUp 0.4s 0.55s both',
      }}>
        {onShare && (
          <button onClick={onShare} style={{
            width: '100%', padding: '15px', borderRadius: '16px',
            border: '1.5px solid var(--border)', background: 'transparent',
            color: 'var(--text-0)', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', marginBottom: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'border-color 0.15s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share Result
          </button>
        )}
        <button onClick={handleClose} style={{
          width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
          background: 'var(--gradient-accent)', color: '#000',
          fontSize: '15px', fontWeight: 800, cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: 'var(--accent-glow)',
        }}>
          Done
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
