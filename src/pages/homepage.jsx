import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StreakBadge from '../components/streakbadge';
import { exercises, categories, getExercisesByCategory } from '../data/exercises';
import { usePro } from '../hooks/usepro';

// ── Category icons ────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  all:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  chest:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12c0-4-3-8-8-8s-8 4-8 8 3 8 8 8 8-4 8-8z"/><path d="M12 8v8M8 12h8"/></svg>,
  back:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"/></svg>,
  shoulders: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20"/></svg>,
  triceps:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4l12 16M18 4l-12 16"/></svg>,
  arms:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4l12 16M18 4l-12 16"/></svg>,
  legs:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5"/></svg>,
  core:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/></svg>,
};

const DIFF_COLOR = {
  beginner:     'var(--green)',
  intermediate: 'var(--orange)',
  advanced:     'var(--red)',
};

export default function HomePage({ user, isGuest }) {
  const { isPro } = usePro();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [streak, setStreak] = useState(0);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [proBannerDismissed, setProBannerDismissed] = useState(
    () => localStorage.getItem('bv-pro-banner-dismissed') === 'true'
  );
  const navigate = useNavigate();
  const categoryRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('bv-stats');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setStreak(s.streak || 0);
        setWorkoutsCompleted(s.workoutsCompleted || 0);
      } catch (e) {}
    }
  }, []);

  const filtered = getExercisesByCategory(activeCategory).filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.muscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const firstName = user?.displayName?.split(' ')[0] || (isGuest ? 'Athlete' : 'Athlete');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-0)',
      paddingBottom: '80px',
    }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        padding: '16px 20px 12px',
        background: 'var(--bg-0)',
        borderBottom: '1px solid transparent',
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
        display: 'flex', gap: '10px',
        padding: '16px 20px 20px',
        animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {[
          { val: workoutsCompleted, label: 'Workouts', hi: true },
          { val: exercises.length,  label: 'Exercises' },
          { val: streak > 0 ? `${streak}d` : '—', label: 'Streak' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '14px 10px',
            background: s.hi ? 'var(--accent-dim)' : 'var(--bg-1)',
            border: `1px solid ${s.hi ? 'rgba(200,255,0,0.2)' : 'var(--border)'}`,
            borderRadius: '16px', textAlign: 'center',
          }}>
            <div style={{
              fontSize: '22px', fontWeight: 900,
              color: s.hi ? 'var(--accent)' : 'var(--text-0)',
              letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '3px',
            }}>
              {s.val}
            </div>
            <div style={{
              fontSize: '9px', fontWeight: 700,
              color: 'var(--text-2)', letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {s.label}
            </div>
          </div>
        ))}
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
      <div style={{ padding: '0 20px 16px', animation: 'fadeUp 0.4s 0.08s cubic-bezier(0.16,1,0.3,1) both' }}>
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

  return (
    <div
      onClick={() => navigate(`/workout?exercise=${exercise.id}`)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
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
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        {/* Difficulty dot + label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '3px 8px',
          borderRadius: '99px',
          background: `${DIFF_COLOR[exercise.difficulty]}15`,
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: DIFF_COLOR[exercise.difficulty] }} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: DIFF_COLOR[exercise.difficulty], letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {exercise.difficulty}
          </span>
        </div>

        {/* Target sets×reps */}
        <span style={{
          fontSize: '11px', fontWeight: 700,
          color: 'var(--accent)',
          background: 'var(--accent-dim)',
          padding: '3px 8px', borderRadius: '8px',
        }}>
          {exercise.targetSets}×{exercise.isTimed ? `${exercise.targetReps}s` : exercise.targetReps}
        </span>
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
        fontSize: '12px', color: 'var(--text-2)',
        lineHeight: 1.4, marginBottom: '14px',
        display: '-webkit-box',
        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {exercise.muscles.slice(0, 3).join(' · ')}
      </p>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 500 }}>
          {exercise.equipment === 'none' ? 'No equipment' : exercise.equipment}
        </span>

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
