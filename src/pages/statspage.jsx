import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreBadge from '../components/scorebadge';
import UpgradePrompt from '../components/upgradeprompt';
import StreakCalendar from '../components/streakcalendar';
import { usePro } from '../hooks/usepro';

// ── Progressive Overload + Weekly Volume ──────────────────────────────────
function ProgressSection({ navigate }) {
  const strengthLog = (() => {
    try { return JSON.parse(localStorage.getItem('bv-strength-log') || '{}'); }
    catch { return {}; }
  })();

  // Top 5 exercises with history
  const exercises = Object.entries(strengthLog)
    .filter(([, v]) => v.history?.length > 1)
    .slice(0, 5);

  // Weekly volume from history — group muscle categories
  const history = (() => {
    try { return JSON.parse(localStorage.getItem('bv-history') || '[]'); }
    catch { return []; }
  })();

  // Sets per muscle this week
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekHistory = history.filter(h => new Date(h.date).getTime() > oneWeekAgo);
  const MUSCLE_TARGETS = { chest: 12, back: 14, legs: 14, shoulders: 10, arms: 8, core: 10 };
  const muscleVolume = { chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0, core: 0 };
  weekHistory.forEach(h => {
    const n = (h.exerciseName || '').toLowerCase();
    if (n.includes('chest') || n.includes('push') || n.includes('fly') || n.includes('bench')) muscleVolume.chest += 3;
    else if (n.includes('pull') || n.includes('row') || n.includes('dead') || n.includes('lat')) muscleVolume.back += 3;
    else if (n.includes('squat') || n.includes('lunge') || n.includes('leg') || n.includes('glute') || n.includes('calf')) muscleVolume.legs += 3;
    else if (n.includes('shoulder') || n.includes('press') || n.includes('delt') || n.includes('raise')) muscleVolume.shoulders += 3;
    else if (n.includes('curl') || n.includes('tricep') || n.includes('bicep') || n.includes('dip')) muscleVolume.arms += 3;
    else if (n.includes('plank') || n.includes('crunch') || n.includes('core') || n.includes('ab')) muscleVolume.core += 3;
  });

  return (
    <div>
      {/* Progressive Overload Chart */}
      {exercises.length > 0 && (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>Progressive Overload</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {exercises.map(([id, data]) => {
              const hist = (data.history || []).slice(0, 6).reverse();
              const max = Math.max(...hist.map(h => h.maxWeight), 1);
              const latest = hist[hist.length - 1];
              const prev = hist[hist.length - 2];
              const diff = prev ? latest?.maxWeight - prev?.maxWeight : 0;
              return (
                <div key={id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-0)', textTransform: 'capitalize' }}>
                      {id.replace(/-/g, ' ')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)' }}>
                        {latest?.maxWeight}{latest?.unit}
                      </span>
                      {diff !== 0 && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: diff > 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            {diff > 0 ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                          </svg>
                          {Math.abs(diff)}{latest?.unit}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Mini sparkline */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '28px' }}>
                    {hist.map((h, i) => {
                      const pct = Math.max((h.maxWeight / max) * 100, 8);
                      const isLast = i === hist.length - 1;
                      return (
                        <div key={i} style={{ flex: 1, height: `${pct}%`, background: isLast ? 'var(--accent)' : 'var(--bg-3)', borderRadius: '3px 3px 2px 2px', transition: 'height 0.4s ease' }} />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {exercises.length === 0 && (
            <p style={{ fontSize: '12px', color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>
              Log weights during workouts to track overload
            </p>
          )}
        </div>
      )}

      {/* Weekly Volume Tracker */}
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 4h15M6 8h15M6 4v16M2 4v16"/><path d="M2 20h4"/><path d="M2 12h4"/>
            </svg>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>Weekly Volume</h3>
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600, background: 'var(--bg-2)', borderRadius: '99px', padding: '3px 8px' }}>
            Schoenfeld 10–20 sets/muscle
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(MUSCLE_TARGETS).map(([muscle, target]) => {
            const vol = muscleVolume[muscle] || 0;
            const pct = Math.min((vol / target) * 100, 100);
            const color = pct >= 100 ? 'var(--accent)' : pct >= 60 ? 'var(--orange)' : 'var(--red)';
            const status = pct >= 100 ? 'Optimal' : pct >= 60 ? 'Building' : vol > 0 ? 'Low' : 'Not trained';
            return (
              <div key={muscle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', textTransform: 'capitalize' }}>{muscle}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color }}>
                    {vol}/{target} sets · {status}
                  </span>
                </div>
                <div style={{ height: '5px', background: 'var(--bg-3)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => navigate('/recovery')}
          style={{ width: '100%', marginTop: '14px', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.15s ease' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          View Recovery Dashboard
        </button>
      </div>
    </div>
  );
}

// ── 1RM Calculator (Epley + Brzycki average) ─────────────────────────────
function calc1RM(weightKg, reps) {
  if (!weightKg || !reps || reps < 1) return 0;
  if (reps === 1) return weightKg;
  const epley   = weightKg * (1 + reps / 30);
  const brzycki = weightKg * (36 / (37 - reps));
  return Math.round((epley + brzycki) / 2);
}

function OneRMCalculator() {
  const [weight, setWeight] = useState('');
  const [reps,   setReps]   = useState('');
  const [unit,   setUnit]   = useState('kg'); // kg | lb
  const result = calc1RM(parseFloat(weight), parseInt(reps));
  const displayResult = unit === 'lb' && result ? Math.round(result * 2.205) : result;
  const displayWeight = weight ? (unit === 'lb' ? Math.round(parseFloat(weight) * 2.205) : parseFloat(weight)) : '';

  // Percentage table: 100%→50%
  const PCTS = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', marginBottom: '2px' }}>1RM Calculator</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>Epley + Brzycki formula</p>
        </div>
        {/* kg / lb toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-2)', borderRadius: '99px', padding: '3px', gap: '2px' }}>
          {['kg','lb'].map(u => (
            <button key={u} onClick={() => setUnit(u)}
              style={{ padding: '5px 12px', borderRadius: '99px', border: 'none', background: unit === u ? 'var(--accent)' : 'transparent', color: unit === u ? '#000' : 'var(--text-3)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}>
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: `Weight (${unit})`, val: weight, set: setWeight, placeholder: unit === 'kg' ? '100' : '225' },
          { label: 'Reps',            val: reps,   set: setReps,   placeholder: '5' },
        ].map(f => (
          <div key={f.label} style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>{f.label}</div>
            <input
              type="number" inputMode="decimal" min="0" value={f.val} placeholder={f.placeholder}
              onChange={e => f.set(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-0)', fontSize: '18px', fontWeight: 800, outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.02em', boxSizing: 'border-box', textAlign: 'center' }}
            />
          </div>
        ))}
      </div>

      {/* Result */}
      {result > 0 && (
        <>
          <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: '14px', padding: '14px', textAlign: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px' }}>Estimated 1RM</div>
            <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {displayResult} <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-2)' }}>{unit}</span>
            </div>
          </div>

          {/* Percentage table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {PCTS.map(pct => {
              const val = unit === 'lb' ? Math.round(result * 2.205 * pct / 100) : Math.round(result * pct / 100);
              const isMax = pct === 100;
              return (
                <div key={pct} style={{ background: isMax ? 'var(--accent-dim)' : 'var(--bg-2)', borderRadius: '10px', padding: '8px 6px', textAlign: 'center', border: isMax ? '1px solid rgba(200,255,0,0.2)' : '1px solid transparent' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: isMax ? 'var(--accent)' : 'var(--text-0)', letterSpacing: '-0.02em' }}>{val}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-3)', fontWeight: 700, marginTop: '1px' }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const DEFAULT_STATS = {
  workoutsCompleted: 0, streak: 0,
  totalReps: 0, totalTime: 0,
  lastWorkout: null,
  weeklyWorkouts: [0, 0, 0, 0, 0, 0, 0],
};

const STAT_CARDS = (s) => [
  {
    value: s.workoutsCompleted,
    label: 'Workouts',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    accent: true,
  },
  {
    value: s.streak,
    label: 'Day Streak',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a5 5 0 11-10 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5-2.5z"/></svg>,
    accent: false,
  },
  {
    value: s.totalReps,
    label: 'Total Reps',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    accent: false,
  },
  {
    value: Math.floor(s.totalTime / 60),
    label: 'Minutes',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    accent: false,
  },
];

export default function StatsPage() {
  const navigate = useNavigate();
  const { isPro, canUse } = usePro();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem('bv-stats');
      if (s) {
        const p = JSON.parse(s);
        setStats({
          workoutsCompleted: p.workoutsCompleted || 0,
          streak:            p.streak || 0,
          totalReps:         p.totalReps || 0,
          totalTime:         p.totalTime || 0,
          lastWorkout:       p.lastWorkout || null,
          weeklyWorkouts:    Array.isArray(p.weeklyWorkouts) ? p.weeklyWorkouts : [0,0,0,0,0,0,0],
        });
      }
      const h = localStorage.getItem('bv-history');
      if (h) {
        const arr = JSON.parse(h);
        if (Array.isArray(arr)) {
          const limit = canUse('unlimited_history') ? 50 : 3;
          setHistory(arr.slice(-limit).reverse());
        }
      }
    } catch (e) {}
    finally { setLoading(false); }
  }, [canUse]);

  // Week chart — last 7 days ordered
  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayIdx = new Date().getDay();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const di = (todayIdx - 6 + i + 7) % 7;
    return { label: DAY_LABELS[di], count: stats.weeklyWorkouts[di] || 0, isToday: i === 6 };
  });
  const maxWeekly = Math.max(...weekDays.map(d => d.count), 1);

  if (loading) {
    return (
      <div style={{ height: '100dvh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '28px', height: '28px', border: '2.5px solid var(--bg-2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', paddingBottom: '80px' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '20px 20px 16px',
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--bg-0)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-0)', display: 'flex' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em' }}>
          Progress
        </h1>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '10px', padding: '0 20px 20px',
        animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {STAT_CARDS(stats).map((card, i) => (
          <div key={i} style={{
            background: card.accent ? 'var(--accent-dim)' : 'var(--bg-1)',
            border: `1px solid ${card.accent ? 'rgba(200,255,0,0.2)' : 'var(--border)'}`,
            borderRadius: '18px', padding: '18px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              {card.icon}
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {card.label}
              </span>
            </div>
            <div style={{
              fontSize: '34px', fontWeight: 900,
              color: card.accent ? 'var(--accent)' : 'var(--text-0)',
              letterSpacing: '-0.04em', lineHeight: 1,
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly Chart ── */}
      <div style={{
        margin: '0 20px 20px',
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: '20px', padding: '20px',
        animation: 'fadeUp 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>
            This Week
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>
            {weekDays.reduce((a, d) => a + d.count, 0)} sessions
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
          {weekDays.map(({ label, count, isToday }, i) => {
            const heightPct = count > 0 ? Math.max((count / maxWeekly) * 100, 8) : 4;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    minHeight: '4px',
                    background: isToday
                      ? 'var(--accent)'
                      : count > 0 ? 'var(--bg-3)' : 'var(--bg-2)',
                    borderRadius: '5px 5px 3px 3px',
                    transition: 'height 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                  }} />
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: isToday ? 700 : 500,
                  color: isToday ? 'var(--accent)' : 'var(--text-3)',
                  letterSpacing: '0.02em',
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Streak Calendar ── */}
      <div style={{
        padding: '0 20px 20px',
        animation: 'fadeUp 0.4s 0.08s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <StreakCalendar history={history} />
      </div>

      {/* ── 1RM Calculator ── */}
      <div style={{ padding: '0 20px 4px', animation: 'fadeUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}>
        <OneRMCalculator />
      </div>

      {/* ── Progressive Overload + Volume ── */}
      <div style={{ padding: '0 20px 20px', animation: 'fadeUp 0.4s 0.11s cubic-bezier(0.16,1,0.3,1) both' }}>
        <ProgressSection navigate={navigate} />
      </div>

      {/* ── Tools ── */}
      <div style={{ padding: '0 20px 20px', animation: 'fadeUp 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Tools
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

          {/* Measurements */}
          <button onClick={() => navigate('/measurements')} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
              </svg>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '2px' }}>Measurements</div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>Body size tracker</div>
          </button>

          <button onClick={() => navigate('/ffmi')} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '2px' }}>FFMI Calculator</div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>Natural limit checker</div>
          </button>

          <button onClick={() => navigate('/food')} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '2px' }}>Food Scanner</div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>AI macro from photo</div>
          </button>

          <button onClick={() => navigate('/meal')} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12h8M12 8v8"/>
              </svg>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '2px' }}>
              Meal Plan <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '1px 5px', borderRadius: '99px' }}>PRO</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>AI nutrition planner</div>
          </button>

          <button onClick={() => navigate('/plan')} style={{ background: 'var(--bg-1)', border: '1px solid rgba(200,255,0,0.15)', borderRadius: '16px', padding: '16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', gridColumn: '1 / -1', transition: 'border-color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.15)'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-0)' }}>AI Plan Builder</div>
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 6px', borderRadius: '99px', letterSpacing: '0.05em' }}>PRO</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>GPT-4o generates your personalized weekly program</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </button>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div style={{
        padding: '0 20px',
        animation: 'fadeUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>
            Recent Activity
          </h3>
          {!isPro && history.length > 0 && (
            <UpgradePrompt feature="Full History" desc="" compact />
          )}
        </div>

        {history.length === 0 ? (
          <div style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: '18px', padding: '40px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '4px' }}>No workouts yet</p>
            <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>Complete a workout to see it here</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map((item, i) => (
                <div key={i} style={{
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  animation: `fadeUp 0.3s ${i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
                }}>
                  <ScoreBadge score={item.score || 0} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.exerciseName || 'Workout'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                      {item.reps || 0} reps · {Math.floor((item.duration || 0) / 60)}m {(item.duration || 0) % 60}s
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 500, flexShrink: 0 }}>
                    {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </div>
                </div>
              ))}
            </div>

            {!isPro && (
              <div style={{ marginTop: '12px' }}>
                <UpgradePrompt
                  feature="Full Workout History"
                  desc="Showing last 3 sessions. PRO unlocks all."
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
