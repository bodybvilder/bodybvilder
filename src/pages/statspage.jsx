import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreBadge from '../components/scorebadge';
import UpgradePrompt from '../components/upgradeprompt';
import StreakCalendar from '../components/streakcalendar';
import { usePro } from '../hooks/usepro';

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

      {/* ── Tools ── */}
      <div style={{ padding: '0 20px 20px', animation: 'fadeUp 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Tools
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button onClick={() => navigate('/ffmi')} style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '16px', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'inherit', transition: 'border-color 0.15s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '2px' }}>FFMI Calculator</div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>Natural limit checker</div>
          </button>

          <button onClick={() => navigate('/food')} style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '16px', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'inherit', transition: 'border-color 0.15s ease',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '2px' }}>Food Scanner</div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>AI macro from photo</div>
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
