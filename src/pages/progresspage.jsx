import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPRs, getAllSessions, getWeeklyVolume, getTotalStats, getExerciseSessions } from '../hooks/useWorkoutLog';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = 'var(--accent)', fill = 'none', sw = 2.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

// ── Sparkline chart ────────────────────────────────────────────────────────
function Sparkline({ data, color = 'var(--accent)', height = 40 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const last = pts[pts.length - 1];
  const [lx, ly] = last.split(',');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height: `${height}px`, overflow: 'visible' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts.join(' ')}/>
      <polygon fill="url(#sg)" points={`0,${height} ${pts.join(' ')} ${w},${height}`}/>
      <circle cx={lx} cy={ly} r="3" fill={color}/>
    </svg>
  );
}

// ── Volume ring (SVG donut) ────────────────────────────────────────────────
function VolumeRing({ pct, color, size = 52 }) {
  const r = 20; const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 1));
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="var(--bg-3)" strokeWidth="5"/>
      <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 24 24)" style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.34,1.56,0.64,1)' }}/>
    </svg>
  );
}

// ── Badges config ──────────────────────────────────────────────────────────
const BADGES = [
  { id: 'first_workout',  label: 'First Rep',      desc: 'Complete your first workout',   iconKey: 'dumbbell', check: (s) => s.totalWorkouts >= 1 },
  { id: 'streak_3',       label: '3-Day Streak',   desc: '3 workouts in a row',            iconKey: 'flame', check: (_, stats) => (stats?.streak || 0) >= 3 },
  { id: 'streak_7',       label: 'Week Warrior',   desc: '7-day streak',                   iconKey: 'bolt', check: (_, stats) => (stats?.streak || 0) >= 7 },
  { id: 'streak_30',      label: 'Iron Discipline',desc: '30-day streak',                  iconKey: 'crown', check: (_, stats) => (stats?.streak || 0) >= 30 },
  { id: 'workouts_10',    label: 'Double Digits',  desc: '10 workouts completed',          iconKey: 'arms', check: (s) => s.totalWorkouts >= 10 },
  { id: 'workouts_50',    label: 'Centurion',      desc: '50 workouts completed',          iconKey: 'trophy', check: (s) => s.totalWorkouts >= 50 },
  { id: 'volume_1000',    label: '1000kg Club',    desc: 'Total volume over 1,000 kg',     iconKey: 'target', check: (s) => s.totalVolume >= 1000 },
  { id: 'volume_10000',   label: '10K Club',       desc: 'Total volume over 10,000 kg',    iconKey: 'star', check: (s) => s.totalVolume >= 10000 },
  { id: 'first_pr',       label: 'PR Breaker',     desc: 'Set your first Personal Record', iconKey: 'trend', check: (_, __, prs) => Object.keys(prs).length >= 1 },
  { id: 'prs_5',          label: 'Record Setter',  desc: '5 different PRs',                iconKey: 'medal', check: (_, __, prs) => Object.keys(prs).length >= 5 },
];

// ── Weekly volume targets (Schoenfeld optimal range) ──────────────────────
const MUSCLE_TARGETS = { chest: 12, back: 14, legs: 14, shoulders: 10, arms: 8, core: 10 };
const MUSCLE_COLORS  = { chest: '#FF6B6B', back: '#4ECDC4', legs: '#45B7D1', shoulders: '#96CEB4', arms: '#FFEAA7', core: '#DDA0DD' };

// ── Section header ─────────────────────────────────────────────────────────
function SectionHead({ icon, title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>{title}</div>
          {sub && <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600, marginTop: '1px' }}>{sub}</div>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ── Card wrapper ───────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '18px', marginBottom: '14px', ...style }}>
      {children}
    </div>
  );
}

// ── Epley 1RM formula (industry standard) ────────────────────────────────
// 1RM = weight × (1 + reps/30) — most accurate at 1–10 reps
function calc1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return null;
  if (reps === 1) return weight;
  // Average of Epley and Brzycki for better accuracy
  const epley   = weight * (1 + reps / 30);
  const brzycki = weight * (36 / (37 - reps));
  return Math.round((epley + brzycki) / 2 * 10) / 10;
}

// ── Strength chart for one exercise ──────────────────────────────────────
function StrengthChart({ exerciseId, navigate }) {
  const sessions    = getExerciseSessions(exerciseId, 10).reverse();
  if (sessions.length < 2) return null;

  // Best set per session (max weight)
  const bestSets  = sessions.map(s => {
    if (!s.sets?.length) return { weight: 0, reps: 0 };
    return s.sets.reduce((best, x) =>
      (x.weight || 0) > (best.weight || 0) ? x : best, s.sets[0]);
  });
  const maxWeights = bestSets.map(s => s.weight || 0);
  const unit    = sessions[0]?.sets?.[0]?.unit || 'kg';
  const latest  = maxWeights[maxWeights.length - 1];
  const prev    = maxWeights[maxWeights.length - 2];
  const diff    = +(latest - prev).toFixed(1);

  // Best 1RM estimate across all sessions
  const best1RM = bestSets.reduce((best, s) => {
    const est = calc1RM(s.weight, s.reps);
    return est && est > best ? est : best;
  }, 0);

  // Latest 1RM from most recent session
  const latestBest = bestSets[bestSets.length - 1];
  const latest1RM  = calc1RM(latestBest?.weight, latestBest?.reps);

  return (
    <div style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid var(--border)' }}>
      {/* Exercise name row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)', textTransform: 'capitalize', letterSpacing: '-0.01em' }}>
          {exerciseId.replace(/-/g, ' ')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {diff !== 0 && (
            <span style={{ fontSize: '10px', fontWeight: 700, color: diff > 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              {diff > 0 ? '▲' : '▼'} {Math.abs(diff)}{unit}
            </span>
          )}
          <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.03em' }}>
            {latest}{unit}
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ marginBottom: '10px' }}>
        <Sparkline data={maxWeights} height={44}/>
      </div>

      {/* 1RM pills */}
      {(latest1RM || best1RM > 0) && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {latest1RM && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '99px',
              background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/>
              </svg>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>
                ~{latest1RM}{unit} 1RM
              </span>
              <span style={{ fontSize: '9px', color: 'rgba(200,255,0,0.5)', fontWeight: 600 }}>latest</span>
            </div>
          )}
          {best1RM > 0 && best1RM !== latest1RM && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px', borderRadius: '99px',
              background: 'var(--bg-2)', border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)' }}>
                {best1RM}{unit} best 1RM
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProgressPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview'); // overview | strength | volume | prs | badges
  const [totalStats, setTotalStats] = useState({ totalWorkouts: 0, totalSets: 0, totalReps: 0, totalVolume: 0 });
  const [weeklyVol, setWeeklyVol] = useState({});
  const [prs, setPrs] = useState({});
  const [sessions, setSessions] = useState([]);
  const [bvStats, setBvStats] = useState(null);

  useEffect(() => {
    setTotalStats(getTotalStats());
    setWeeklyVol(getWeeklyVolume());
    setPrs(getAllPRs());
    setSessions(getAllSessions(20));
    try {
      const s = JSON.parse(localStorage.getItem('bv-stats') || '{}');
      setBvStats(s);
    } catch {}
  }, []);

  // Exercises with enough history for strength charts
  const strengthExercises = [...new Set(sessions.map(s => s.exerciseId))]
    .filter(id => getExerciseSessions(id, 8).length >= 2)
    .slice(0, 6);

  const earnedBadges = BADGES.filter(b => b.check(totalStats, bvStats, prs));
  const lockedBadges = BADGES.filter(b => !b.check(totalStats, bvStats, prs));

  const TABS = [
    { id: 'overview',  label: 'Overview' },
    { id: 'strength',  label: 'Strength' },
    { id: 'volume',    label: 'Volume'   },
    { id: 'prs',       label: 'PRs'      },
    { id: 'badges',    label: 'Badges'   },
  ];

  return (
    <div style={{ minHeight: 'max-content', background: 'var(--bg-0)', paddingBottom: 'var(--page-bottom-pad)' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes badgePop { 0%{transform:scale(0.6);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 20px 0', position: 'sticky', top: 0, zIndex: 40, background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-0)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em' }}>Progress</h1>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '6px', padding: '12px 20px 14px', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flexShrink: 0, padding: '7px 15px', borderRadius: '99px', border: `1.5px solid ${tab === t.id ? 'var(--accent)' : 'var(--border)'}`, background: tab === t.id ? 'var(--accent)' : 'transparent', color: tab === t.id ? '#000' : 'var(--text-2)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s cubic-bezier(0.34,1.56,0.64,1)' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {tab === 'overview'  && <OverviewTab  totalStats={totalStats} bvStats={bvStats} sessions={sessions} earnedBadges={earnedBadges} navigate={navigate}/>}
        {tab === 'strength'  && <StrengthTab  exerciseIds={strengthExercises} navigate={navigate}/>}
        {tab === 'volume'    && <VolumeTab    weeklyVol={weeklyVol}/>}
        {tab === 'prs'       && <PRsTab       prs={prs} navigate={navigate}/>}
        {tab === 'badges'    && <BadgesTab    earned={earnedBadges} locked={lockedBadges}/>}
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({ totalStats, bvStats, sessions, earnedBadges, navigate }) {
  const streak = bvStats?.streak || 0;
  const totalCalories = bvStats?.totalCalories || 0;

  // Last 7 workout days for mini calendar
  const DAY_LABELS = ['S','M','T','W','T','F','S'];
  const todayIdx = new Date().getDay();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const di = (todayIdx - 6 + i + 7) % 7;
    const count = bvStats?.weeklyWorkouts?.[di] || 0;
    return { label: DAY_LABELS[di], active: count > 0, isToday: i === 6 };
  });

  const KPI = [
    { val: totalStats.totalWorkouts, label: 'Workouts',   accent: true  },
    { val: streak > 0 ? `${streak}d` : '—', label: 'Streak', fire: true },
    { val: totalStats.totalVolume > 0 ? `${(totalStats.totalVolume/1000).toFixed(1)}t` : '—', label: 'Volume' },
    { val: totalCalories > 0 ? `${totalCalories}` : '—', label: 'kcal' },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.35s both' }}>
      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        {KPI.map((k, i) => (
          <div key={i} style={{ background: k.accent ? 'var(--accent-dim)' : k.fire ? 'rgba(255,100,0,0.08)' : 'var(--bg-1)', border: `1px solid ${k.accent ? 'rgba(200,255,0,0.2)' : k.fire ? 'rgba(255,100,0,0.2)' : 'var(--border)'}`, borderRadius: '18px', padding: '16px 14px' }}>
            <div style={{ fontSize: '32px', fontWeight: 900, color: k.accent ? 'var(--accent)' : k.fire ? '#FF6B00' : 'var(--text-0)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px' }}>{k.val}</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Week activity strip */}
      <Card>
        <SectionHead icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} title="This Week"/>
        <div style={{ display: 'flex', gap: '6px' }}>
          {weekDays.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: d.active ? 'var(--accent)' : d.isToday ? 'var(--bg-3)' : 'var(--bg-2)', border: d.isToday && !d.active ? '1.5px solid var(--accent)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {d.active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span style={{ fontSize: '10px', fontWeight: d.isToday ? 700 : 500, color: d.isToday ? 'var(--accent)' : 'var(--text-3)' }}>{d.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <Card>
          <SectionHead icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} title="Recent Sessions"/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.slice(0, 5).map((s, i) => {
              const d = new Date(s.date);
              const label = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
              const maxW = s.sets?.length ? Math.max(...s.sets.map(x => x.weight || 0)) : null;
              const unit = s.sets?.[0]?.unit || 'kg';
              return (
                <div key={i} onClick={() => navigate(`/workout?exercise=${s.exerciseId}&autostart=1`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: 'var(--bg-2)', cursor: 'pointer', transition: 'background 0.12s ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-2)'}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.exerciseName || s.exerciseId?.replace(/-/g, ' ')}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>{s.sets?.length || 0} sets · {label}</div>
                    {s.notes && <div style={{ fontSize: '10px', color: 'var(--text-2)', marginTop: '2px', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{s.notes}"</div>}
                  </div>
                  {maxW != null && maxW > 0 && (
                    <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.02em', flexShrink: 0 }}>{maxW}<span style={{ fontSize: '10px', color: 'var(--text-3)', marginLeft: '1px' }}>{unit}</span></div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Badges teaser */}
      {earnedBadges.length > 0 && (
        <Card>
          <SectionHead title={`${earnedBadges.length} Badge${earnedBadges.length !== 1 ? 's' : ''} Earned`} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="15" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/><path d="M15 7l-3-4-3 4 1 2h4l1-2z"/></svg>}/>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {earnedBadges.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: '10px', padding: '6px 10px', animation: 'badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                <BadgeIcon iconKey={b.iconKey} color="var(--accent)"/>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {sessions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{width:52,height:52,borderRadius:14,background:"var(--bg-2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"12px"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg></div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '6px' }}>No data yet</div>
          <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '20px' }}>Complete a workout and log your sets to see progress here.</div>
          <button onClick={() => navigate('/')} style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: '#000', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Start Workout
          </button>
        </div>
      )}
    </div>
  );
}

// ── Strength Tab ───────────────────────────────────────────────────────────
function StrengthTab({ exerciseIds, navigate }) {
  if (!exerciseIds.length) {
    return (
      <div style={{ animation: 'fadeUp 0.35s both', textAlign: 'center', padding: '48px 0' }}>
        <div style={{width:52,height:52,borderRadius:14,background:"var(--bg-2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"12px"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '6px' }}>No strength data yet</div>
        <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '20px' }}>Log weights in at least 2 sessions for the same exercise to see your strength curve.</div>
        <button onClick={() => navigate('/')} style={{ padding: '11px 22px', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: '#000', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Start Logging</button>
      </div>
    );
  }
  return (
    <div style={{ animation: 'fadeUp 0.35s both' }}>
      <Card>
        <SectionHead
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
          title="Strength Progression"
          sub="Max weight per session"
        />
        {exerciseIds.map(id => <StrengthChart key={id} exerciseId={id} navigate={navigate}/>)}
      </Card>
    </div>
  );
}

// ── Volume Tab ─────────────────────────────────────────────────────────────
function VolumeTab({ weeklyVol }) {
  return (
    <div style={{ animation: 'fadeUp 0.35s both' }}>
      <Card>
        <SectionHead
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M6 4h15M6 8h15M6 4v16M2 4v16"/><path d="M2 20h4M2 12h4"/></svg>}
          title="Weekly Volume"
          sub="Schoenfeld 10–20 sets/muscle"
          action={<span style={{ fontSize: '10px', color: 'var(--text-3)', background: 'var(--bg-2)', borderRadius: '99px', padding: '3px 8px', fontWeight: 600 }}>This week</span>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {Object.entries(MUSCLE_TARGETS).map(([muscle, target]) => {
            const vol = weeklyVol[muscle] || 0;
            const pct = Math.min(vol / target, 1);
            const color = pct >= 1 ? 'var(--accent)' : pct >= 0.6 ? 'var(--orange)' : 'var(--red)';
            const status = pct >= 1 ? 'Optimal' : pct >= 0.6 ? 'Building' : vol > 0 ? 'Low' : 'Not trained';
            return (
              <div key={muscle} style={{ background: 'var(--bg-2)', borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <VolumeRing pct={pct} color={MUSCLE_COLORS[muscle] || 'var(--accent)'}/>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)', textTransform: 'capitalize', marginBottom: '2px' }}>{muscle}</div>
                  <div style={{ fontSize: '11px', color, fontWeight: 700 }}>{vol}/{target} sets</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-3)', marginTop: '1px' }}>{status}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── PRs Tab ────────────────────────────────────────────────────────────────
function PRsTab({ prs, navigate }) {
  const entries = Object.entries(prs).sort((a, b) => new Date(b[1].date) - new Date(a[1].date));
  if (!entries.length) {
    return (
      <div style={{ animation: 'fadeUp 0.35s both', textAlign: 'center', padding: '48px 0' }}>
        <div style={{width:52,height:52,borderRadius:14,background:"rgba(200,255,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"12px"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/><line x1="12" y1="15" x2="12" y2="22"/></svg></div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '6px' }}>No PRs yet</div>
        <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '20px' }}>Log heavier weights than your previous best to set a Personal Record.</div>
        <button onClick={() => navigate('/')} style={{ padding: '11px 22px', borderRadius: '12px', border: 'none', background: 'var(--accent)', color: '#000', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Start Lifting</button>
      </div>
    );
  }
  return (
    <div style={{ animation: 'fadeUp 0.35s both' }}>
      <Card>
        <SectionHead
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/><line x1="12" y1="15" x2="12" y2="22"/></svg>}
          title={`${entries.length} Personal Record${entries.length !== 1 ? 's' : ''}`}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.map(([id, pr], i) => {
            const date = new Date(pr.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={id}
                onClick={() => navigate(`/workout?exercise=${id}&autostart=1`)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: 'var(--bg-2)', cursor: 'pointer', border: '1px solid transparent', transition: 'border-color 0.12s ease, background 0.12s ease', animation: `fadeUp 0.3s ${i * 0.04}s both` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,255,0,0.2)'; e.currentTarget.style.background = 'var(--bg-3)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'var(--bg-2)'; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
                    <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/><line x1="12" y1="15" x2="12" y2="22"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)', textTransform: 'capitalize', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pr.exerciseName || id.replace(/-/g, ' ')}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{date}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {pr.weight}<span style={{ fontSize: '12px', color: 'var(--text-3)', marginLeft: '2px' }}>{pr.unit}</span>
                  </div>
                  {pr.reps && <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '1px' }}>× {pr.reps} reps</div>}
                  {pr.reps && pr.reps > 1 && (() => {
                    const est = calc1RM(pr.weight, pr.reps);
                    return est ? (
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(200,255,0,0.6)', marginTop: '2px' }}>
                        ~{est}{pr.unit} 1RM
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── Badge icon map ────────────────────────────────────────────────────────
const BADGE_ICONS = {
  dumbbell: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4v16M18 4v16M6 8H4a1 1 0 000 2h2M6 14H4a1 1 0 000 2h2M18 8h2a1 1 0 000-2h-2M18 14h2a1 1 0 000-2h-2M6 8h12v8H6z"/></svg>,
  flame:    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3C8.928 6.857 9.776 4.946 12 3c.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0c0-1.153.433-2.294 1-3A2.5 2.5 0 008.5 14.5z"/></svg>,
  bolt:     <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  crown:    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 20h20M4 20L2 8l6 4 4-8 4 8 6-4-2 12H4z"/></svg>,
  arms:     <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 8c0-4 4-7 7-5.5M19 8c0-4-4-7-7-5.5"/><path d="M5 8c-2 3-1 6 2 7l5 1M19 8c2 3 1 6-2 7l-5 1"/></svg>,
  trophy:   <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/><line x1="12" y1="15" x2="12" y2="22"/></svg>,
  target:   <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  star:     <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  trend:    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  medal:    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="15" r="7"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/><path d="M15 7l-3-4-3 4 1 2h4l1-2z"/></svg>,
};
function BadgeIcon({ iconKey, color = 'currentColor' }) {
  const icon = BADGE_ICONS[iconKey] || BADGE_ICONS.dumbbell;
  return React.cloneElement(icon, { stroke: color });
}

// ── Badges Tab ─────────────────────────────────────────────────────────────
function BadgesTab({ earned, locked }) {
  return (
    <div style={{ animation: 'fadeUp 0.35s both' }}>
      {earned.length > 0 && (
        <Card>
          <SectionHead title={`Earned · ${earned.length}`} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {earned.map((b, i) => (
              <div key={b.id} style={{ background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: '14px', padding: '14px 12px', textAlign: 'center', animation: `badgePop 0.45s ${i * 0.06}s cubic-bezier(0.34,1.56,0.64,1) both` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(200,255,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <BadgeIcon iconKey={b.iconKey} color="var(--accent)"/>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.01em', marginBottom: '3px' }}>{b.label}</div>
                <div style={{ fontSize: '10px', color: 'rgba(200,255,0,0.6)', lineHeight: 1.3 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {locked.length > 0 && (
        <Card>
          <SectionHead title={`Locked · ${locked.length}`} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {locked.map((b, i) => (
              <div key={b.id} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 12px', textAlign: 'center', opacity: 0.5, animation: `fadeUp 0.3s ${i * 0.04}s both` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <BadgeIcon iconKey={b.iconKey} color="var(--text-3)"/>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.01em', marginBottom: '3px' }}>{b.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', lineHeight: 1.3 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}


