import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StreakBadge from '../components/streakbadge';
import { exercises, categories, getExercisesByCategory } from '../data/exercises';
import { usePro } from '../hooks/usepro';
import Icon from '../components/icons';

// ── Category icons — clean MDI-style fill icons ────────────────────────────
const CATEGORY_ICONS = {
  all: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  poses: (
    // Trophy — bodybuilding stage
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      <line x1="12" y1="15" x2="12" y2="22"/>
    </svg>
  ),
  chest: (
    // Chest press silhouette — person pressing weight up
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5c-1.11 0-2 .89-2 2s.89 2 2 2s2-.89 2-2s-.89-2-2-2m10-4v5h-2V4H4v2H2V1h2v2h16V1zm-7 10.26V23h-2v-5h-2v5H9V11.26C6.93 10.17 5.5 8 5.5 5.5V5h2v.5C7.5 8 9.5 10 12 10s4.5-2 4.5-4.5V5h2v.5c0 2.5-1.43 4.67-3.5 5.76"/>
    </svg>
  ),
  back: (
    // Pull-up figure — back exercise
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="4" y1="3" x2="20" y2="3" strokeWidth="2.5"/>
      <path d="M9 3 L9 7 M15 3 L15 7"/>
      <path d="M9 7 Q12 8 15 7"/>
      <circle cx="12" cy="10" r="1.8" fill="currentColor" stroke="none"/>
      <line x1="12" y1="11.8" x2="12" y2="16"/>
      <path d="M12 16 L10 19.5 M12 16 L14 19.5"/>
    </svg>
  ),
  shoulders: (
    // Arm flex — shoulder/delt
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18.34S4 7.09 7 3l5 1l-1 3.09H9v7.16h1c2-3.07 6.14-4.19 8.64-3.07c3.3 1.53 3 6.14 0 8.18C16.24 21 9 22.43 3 18.34"/>
    </svg>
  ),
  triceps: (
    // Dumbbell — tricep exercises
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22l1.43-1.43L16.29 22l2.14-2.14l1.43 1.43l1.43-1.43l-1.43-1.43L22 16.29z"/>
    </svg>
  ),
  arms: (
    // Bicep flex
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18.34S4 7.09 7 3l5 1l-1 3.09H9v7.16h1c2-3.07 6.14-4.19 8.64-3.07c3.3 1.53 3 6.14 0 8.18C16.24 21 9 22.43 3 18.34"/>
    </svg>
  ),
  legs: (
    // Human figure — standing/legs
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m-1.5 5h3a2 2 0 0 1 2 2v5.5H14V22h-4v-7.5H8.5V9a2 2 0 0 1 2-2"/>
    </svg>
  ),
  core: (
    // Plank figure — core
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="19.5" cy="6.5" r="1.8" fill="currentColor" stroke="none"/>
      <line x1="3" y1="12" x2="17.5" y2="12"/>
      <line x1="17.5" y1="12" x2="19.5" y2="8.3"/>
      <line x1="13" y1="12" x2="13" y2="16"/>
      <line x1="7" y1="12" x2="7" y2="16"/>
      <line x1="3" y1="16" x2="5" y2="16"/>
    </svg>
  ),
  cardio: (
    // Heart rate pulse
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

const DIFF_COLOR = {
  beginner:     'var(--green)',
  intermediate: 'var(--orange)',
  advanced:     'var(--red)',
};

// ── Routines shortcut card ────────────────────────────────────────────────
function RoutinesShortcut({ navigate }) {
  const routines = (() => {
    try { return JSON.parse(localStorage.getItem('bv-routines') || '[]'); }
    catch { return []; }
  })();

  const last = routines
    .filter(r => r.lastUsed)
    .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))[0];

  return (
    <div style={{ padding: '0 20px 16px', animation: 'fadeUp 0.4s 0.025s cubic-bezier(0.16,1,0.3,1) both' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* Routines main button */}
        <button onClick={() => navigate('/routines')}
          style={{
            flex: 2, display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 16px', borderRadius: '16px',
            border: '1px solid var(--border)', background: 'var(--bg-1)',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="checklist" size={18} color="var(--accent)" strokeWidth={2.2}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.01em' }}>
              My Routines
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>
              {routines.length > 0 ? `${routines.length} routine${routines.length !== 1 ? 's' : ''}` : 'Create first routine'}
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        {/* Last used routine quick-start */}
        {last ? (
          <button onClick={() => navigate('/routines')}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
              padding: '14px 10px', borderRadius: '16px',
              border: '1px solid rgba(200,255,0,0.2)', background: 'var(--accent-dim)',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
              transition: 'transform 0.12s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="checklist" size={18} color="var(--accent)" strokeWidth={2}/>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
              {last.name}
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(200,255,0,0.55)', fontWeight: 600 }}>Resume</div>
          </button>
        ) : (
          <button onClick={() => navigate('/routines')}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
              padding: '14px 10px', borderRadius: '16px',
              border: '1.5px dashed var(--border)', background: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>New</div>
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomePage({ user, isGuest }) {
  const { isPro } = usePro();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [streak, setStreak] = useState(0);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentExercises, setRecentExercises] = useState([]);
  const [proBannerDismissed, setProBannerDismissed] = useState(
    () => localStorage.getItem('bv-pro-banner-dismissed') === 'true'
  );
  const navigate = useNavigate();
  const categoryRef = useRef(null);
  const exerciseSectionRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('bv-stats');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setStreak(s.streak || 0);
        setWorkoutsCompleted(s.workoutsCompleted || 0);
      } catch (e) {}
    }
    // Load recent exercises from workout history
    try {
      const hist = JSON.parse(localStorage.getItem('bv-history') || '[]');
      // Unique exercises, most recent first, max 4
      const seen = new Set();
      const recent = [];
      for (let i = hist.length - 1; i >= 0 && recent.length < 4; i--) {
        const h = hist[i];
        if (!h.exerciseName || seen.has(h.exerciseName)) continue;
        seen.add(h.exerciseName);
        recent.push(h);
      }
      setRecentExercises(recent);
    } catch (e) {}
  }, []);

  const filtered = getExercisesByCategory(activeCategory).filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.muscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const firstName = user?.displayName?.split(' ')[0] || (isGuest ? 'Athlete' : 'Athlete');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Today's plan suggestion — based on least-trained muscle this week
  const todaysPlan = (() => {
    try {
      const vol = JSON.parse(localStorage.getItem('bv-wlog-sessions') || '[]');
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weekSessions = vol.filter(s => new Date(s.date).getTime() > oneWeekAgo);
      const MUSCLE_MAP = {
        chest: ['push', 'bench', 'fly', 'chest'],
        back: ['pull', 'row', 'lat', 'dead'],
        legs: ['squat', 'lunge', 'leg', 'glute'],
        shoulders: ['shoulder', 'press', 'raise', 'delt'],
        arms: ['curl', 'tricep', 'bicep', 'dip'],
        core: ['plank', 'crunch', 'ab', 'core'],
      };
      const SUGGESTIONS = {
        chest:     { label: 'Chest Day',    sub: 'Bench · Push-ups · Fly',         cat: 'chest',     icon: 'chest' },
        back:      { label: 'Back & Lats',  sub: 'Pull-ups · Rows · Deadlifts',    cat: 'back',      icon: 'back' },
        legs:      { label: 'Leg Day',      sub: 'Squats · Lunges · Calf raises',  cat: 'legs',      icon: 'legs' },
        shoulders: { label: 'Shoulder Day', sub: 'Press · Lateral raise · Shrugs', cat: 'shoulders', icon: 'shoulders' },
        arms:      { label: 'Arms Focus',   sub: 'Bicep curls · Tricep dips',      cat: 'arms',      icon: 'arms' },
        core:      { label: 'Core Blast',   sub: 'Planks · Crunches · Abs',        cat: 'core',      icon: 'core' },
      };
      const volume = { chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0, core: 0 };
      weekSessions.forEach(s => {
        const name = (s.exerciseName || s.exerciseId || '').toLowerCase();
        for (const [m, keys] of Object.entries(MUSCLE_MAP)) {
          if (keys.some(k => name.includes(k))) { volume[m]++; break; }
        }
      });
      const leastTrained = Object.entries(volume).sort((a, b) => a[1] - b[1])[0]?.[0];
      return SUGGESTIONS[leastTrained] || SUGGESTIONS.chest;
    } catch { return null; }
  })();

  return (
    <div style={{
      minHeight: 'max-content',
      background: 'var(--bg-0)',
      paddingBottom: 'var(--page-bottom-pad)',
    }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        padding: '16px 20px 12px',
        background: 'var(--glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div>
          <p style={{
            fontSize: '11px', fontWeight: 600,
            color: 'var(--text-2)', letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '2px',
          }}>
            {greeting}
          </p>
          <h1 style={{
            fontSize: '22px', fontWeight: 900,
            color: 'var(--text-0)', letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            {firstName}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <StreakBadge streak={streak} />
          <div
            onClick={() => navigate('/profile')}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: '2px solid var(--border-strong)',
              background: user?.photoURL ? 'transparent' : 'var(--bg-2)',
              overflow: 'hidden', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)' }}>
                {firstName[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── STATS ROW ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '8px',
        padding: '14px 20px 12px',
        animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {[
          {
            val: workoutsCompleted,
            label: 'Workouts',
            hi: true,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
          },
          {
            val: exercises.filter(e => !e.isPose).length,
            label: 'Exercises',
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2.5" strokeLinecap="round"><path d="M6 4v16M18 4v16M6 8H4a1 1 0 000 2h2M6 14H4a1 1 0 000 2h2M18 8h2a1 1 0 000-2h-2M18 14h2a1 1 0 000-2h-2M6 8h12v8H6z"/></svg>,
          },
          {
            val: streak > 0 ? `${streak}d` : '—',
            label: 'Streak',
            fire: streak > 0,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={streak > 0 ? '#FF6B00' : 'var(--text-3)'} stroke="none"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a5 5 0 11-10 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5-2.5z"/></svg>,
          },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '11px 10px',
            background: s.hi ? 'var(--accent-dim)' : s.fire ? 'rgba(255,100,0,0.08)' : 'var(--bg-1)',
            border: `1px solid ${s.hi ? 'rgba(200,255,0,0.2)' : s.fire ? 'rgba(255,100,0,0.2)' : 'var(--border)'}`,
            borderRadius: '14px', textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
              {s.icon}
            </div>
            <div style={{
              fontSize: '22px', fontWeight: 900,
              color: s.hi ? 'var(--accent)' : s.fire ? '#FF6B00' : 'var(--text-0)',
              letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '3px',
            }}>
              {s.val}
            </div>
            <div style={{
              fontSize: '10px', fontWeight: 700,
              color: 'var(--text-3)', letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── TODAY'S FOCUS HERO ─────────────────────────────────────── */}
      {todaysPlan && (
        <div style={{ padding: '16px 20px 4px', animation: 'fadeUp 0.4s 0.02s cubic-bezier(0.16,1,0.3,1) both' }}>
          <button
            onClick={() => {
              setActiveCategory(todaysPlan.cat);
              setTimeout(() => {
                exerciseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 80);
            }}
            style={{
              width: '100%', padding: '20px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, var(--accent-dim) 0%, rgba(57,255,20,0.06) 100%)',
              border: '1.5px solid rgba(200,255,0,0.25)',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              transition: 'transform 0.12s ease, border-color 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.25)'}
            onPointerDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulseDot 2s ease-in-out infinite' }}/>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Today's Focus
              </span>
            </div>

            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: 'rgba(200,255,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name={todaysPlan.icon} size={26} color="var(--accent)" strokeWidth={1.8}/>
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {todaysPlan.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '4px' }}>{todaysPlan.sub}</div>
              </div>
            </div>

            {/* Start CTA */}
            <div style={{
              marginTop: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '12px', color: 'rgba(200,255,0,0.55)', fontWeight: 600 }}>
                Based on your training this week
              </span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--accent)', borderRadius: '99px',
                padding: '7px 16px',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#000"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#000', letterSpacing: '-0.01em' }}>Start</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ── My Routines shortcut ────────────────────────────────────── */}
      <RoutinesShortcut navigate={navigate} />

      {/* ── Quick Start — Recently Trained ─────────────────────────── */}
      {recentExercises.length > 0 && (
        <div style={{
          padding: '0 20px 20px',
          animation: 'fadeUp 0.4s 0.03s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.01em' }}>
                Quick Start
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>
              Recent
            </span>
          </div>

          <div style={{
            display: 'flex', gap: '8px',
            overflowX: 'auto', scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: '2px',
          }}>
            {recentExercises.map((h, i) => {
              const exId = h.exerciseName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              return (
                <button
                  key={i}
                  onClick={() => navigate(`/workout?exercise=${exId}&autostart=1`)}
                  style={{
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-1)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.12s ease, background 0.12s ease',
                    WebkitTapHighlightColor: 'transparent',
                    maxWidth: '160px',
                    animation: `fadeUp 0.3s ${i * 0.06}s cubic-bezier(0.16,1,0.3,1) both`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(200,255,0,0.35)';
                    e.currentTarget.style.background = 'var(--accent-dim)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-1)';
                  }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#000">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 700, color: 'var(--text-0)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      letterSpacing: '-0.01em',
                    }}>
                      {h.exerciseName}
                    </div>
                    {h.score > 0 && (
                      <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 500 }}>
                        Last: {h.score}% form
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Coach B Quick Access ─────────────────────────────────────────── */}
      <div
        onClick={() => navigate('/trainer')}
        role="button"
        tabIndex={0}
        style={{
          margin: '0 20px 16px',
          padding: '14px 16px',
          borderRadius: '18px',
          background: 'var(--bg-1)',
          border: '1px solid rgba(200,255,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '12px',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease, background 0.15s ease',
          animation: 'fadeUp 0.4s 0.04s cubic-bezier(0.16,1,0.3,1) both',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,255,0,0.45)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,255,0,0.2)'; e.currentTarget.style.background = 'var(--bg-1)'; }}
        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
        onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* Avatar */}
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(200,255,0,0.2) 0%, rgba(200,255,0,0.08) 100%)',
          border: '2px solid rgba(200,255,0,0.35)',
          flexShrink: 0, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          {/* Online dot */}
          <div style={{
            position: 'absolute', bottom: '1px', right: '1px',
            width: '10px', height: '10px', borderRadius: '50%',
            background: 'var(--green)', border: '2px solid var(--bg-1)',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', marginBottom: '2px' }}>
            Coach B
          </div>
          <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>
            Online · Ask me anything
          </div>
        </div>

        <div style={{
          flexShrink: 0, background: 'var(--accent)', borderRadius: '99px',
          padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#000' }}>Chat</span>
        </div>
      </div>

      {/* ── PRO BANNER ─────────────────────────────────────────────────── */}
      {!isPro && !proBannerDismissed && (
        <div style={{
          margin: '0 20px 16px',
          padding: '13px 16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(200,255,0,0.07) 0%, rgba(57,255,20,0.03) 100%)',
          border: '1px solid rgba(200,255,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'fadeUp 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{
            flexShrink: 0, width: '30px', height: '30px',
            borderRadius: '8px', background: 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '1px' }}>
              Try PRO free 7 days
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Full history · Program builder · All themes
            </div>
          </div>
          <button
            onClick={() => navigate('/pro')}
            style={{
              flexShrink: 0, padding: '7px 13px',
              borderRadius: '99px', border: 'none',
              background: 'var(--accent)', color: '#000',
              fontSize: '11px', fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
          >
            Try free
          </button>
          <button
            onClick={() => {
              setProBannerDismissed(true);
              localStorage.setItem('bv-pro-banner-dismissed', 'true');
            }}
            style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── SEARCH ─────────────────────────────────────────────────────── */}
      <div ref={exerciseSectionRef} style={{ padding: '0 20px 16px', animation: 'fadeUp 0.4s 0.08s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--bg-1)',
          border: `1.5px solid ${searchFocused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '14px', padding: '11px 14px',
          transition: 'border-color 0.15s ease',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search exercises or muscles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1, background: 'none', border: 'none',
              color: 'var(--text-0)', fontSize: '14px', fontWeight: 500,
              outline: 'none', fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-3)', lineHeight: 1 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── CATEGORY PILLS ─────────────────────────────────────────────── */}
      <div
        ref={categoryRef}
        style={{
          display: 'flex', gap: '6px',
          padding: '0 20px 20px',
          overflowX: 'auto', scrollbarWidth: 'none',
          animation: 'fadeUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {categories.map(cat => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 14px',
                borderRadius: '99px',
                border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#000' : 'var(--text-2)',
                fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                flexShrink: 0, fontFamily: 'inherit',
                transition: 'all 0.12s cubic-bezier(0.34,1.56,0.64,1)',
                letterSpacing: '0.01em',
              }}
            >
              {CATEGORY_ICONS[cat.id]}
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* ── SECTION LABEL ──────────────────────────────────────────────── */}
      <div style={{
        padding: '0 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h2 style={{
          fontSize: '16px', fontWeight: 800,
          color: 'var(--text-0)', letterSpacing: '-0.02em',
        }}>
          {searchQuery
            ? `"${searchQuery}"`
            : activeCategory === 'all'
              ? 'All Exercises'
              : categories.find(c => c.id === activeCategory)?.name}
        </h2>
        <span style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 600 }}>
          {filtered.length}
        </span>
      </div>

      {/* ── EXERCISE LIST ──────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '56px 20px',
          animation: 'fadeUp 0.3s ease both',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '4px' }}>No results</p>
          <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>Try a different search</p>
        </div>
      ) : (
        <div style={{
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: '10px',
        }}>
          {filtered.map((exercise, i) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={i}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────
function ExerciseCard({ exercise, index, navigate }) {
  const [pressed, setPressed] = useState(false);

  const hapticTap = () => {
    if (navigator.vibrate) navigator.vibrate(5);
  };

  return (
    <div
      onClick={() => { hapticTap(); navigate(exercise.isPose ? `/pose?exercise=${exercise.id}&autostart=1` : `/workout?exercise=${exercise.id}&autostart=1`); }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      role="button"
      tabIndex={0}
      aria-label={`Start ${exercise.name} workout`}
      style={{
        background: 'var(--bg-1)',
        border: `1px solid ${pressed ? 'rgba(200,255,0,0.3)' : 'var(--border)'}`,
        borderRadius: '18px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'transform 0.12s ease, border-color 0.12s ease',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        animation: `fadeUp 0.4s ${Math.min(index * 0.03, 0.25)}s cubic-bezier(0.16,1,0.3,1) both`,
        position: 'relative', overflow: 'hidden',
        WebkitTapHighlightColor: 'transparent',
        minHeight: '120px',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        {/* Difficulty or Pose badge */}
        {exercise.isPose ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '3px 8px', borderRadius: '99px',
            background: 'rgba(200,255,0,0.12)',
          }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--accent)">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {exercise.division === 'mens-physique' ? "Men's Phys." : 'Classic'}
            </span>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '3px 8px', borderRadius: '99px',
            background: `${DIFF_COLOR[exercise.difficulty]}15`,
          }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: DIFF_COLOR[exercise.difficulty] }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: DIFF_COLOR[exercise.difficulty], letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {exercise.difficulty}
            </span>
          </div>
        )}

        {/* Target sets×reps — hide for poses */}
        {!exercise.isPose && (
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: 'var(--accent)',
          background: 'var(--accent-dim)',
          padding: '3px 8px', borderRadius: '8px',
        }}>
          {exercise.targetSets}×{exercise.isTimed ? `${exercise.targetReps}s` : exercise.targetReps}
        </span>
        )}
        {/* Hold time badge for poses */}
        {exercise.isPose && (
        <span style={{
          fontSize: '10px', fontWeight: 700,
          color: 'var(--accent)', opacity: 0.7,
          padding: '3px 8px', borderRadius: '8px',
          background: 'rgba(200,255,0,0.06)',
          border: '1px solid rgba(200,255,0,0.15)',
        }}>
          Hold 2.5s
        </span>
        )}
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: '16px', fontWeight: 800,
        color: 'var(--text-0)', letterSpacing: '-0.02em',
        lineHeight: 1.2, marginBottom: '5px',
      }}>
        {exercise.name}
      </h3>

      {/* Muscles */}
      <p style={{
        fontSize: '13px', color: 'var(--text-2)',
        lineHeight: 1.4, marginBottom: '14px',
        display: '-webkit-box',
        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {exercise.muscles.slice(0, 3).join(' · ')}
      </p>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Equipment label — hide for poses */}
        {!exercise.isPose ? (
          <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 500 }}>
            {exercise.equipment === 'none' ? 'No equipment' : exercise.equipment}
          </span>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, opacity: 0.7 }}>
            AI scored
          </span>
        )}

        {/* Play button */}
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#000">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      </div>
    </div>
  );
}


