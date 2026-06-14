import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/logo';
import StreakBadge from '../components/streakbadge';
import { exercises, categories, getExercisesByCategory } from '../data/exercises';
import { usePro } from '../hooks/usepro';

// ── SVG CATEGORY ICONS (NO EMOJI) ──────────────────────────────────────
const CATEGORY_ICONS = {
  all: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  chest: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12c0-4-3-8-8-8s-8 4-8 8 3 8 8 8 8-4 8-8z"/><path d="M12 8v8M8 12h8"/></svg>,
  back: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"/></svg>,
  shoulders: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M2 12h20"/></svg>,
  triceps: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4l12 16M18 4l-12 16"/></svg>,
  arms: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4l12 16M18 4l-12 16"/></svg>,
  legs: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5"/></svg>,
  core: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/></svg>,
};

const DIFFICULTY_COLOR = {
  beginner: 'var(--green)',
  intermediate: 'var(--orange)',
  advanced: 'var(--red)',
};

// ── SVG WAVE ICON FOR GREETING ─────────────────────────────────────────
const WaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10 10-4.477 10-10z"/>
    <path d="M8 14c1.5 2 4 2 5.5 0 1.5-2 4-2 5.5 0"/>
    <path d="M9 9h.01M15 9h.01"/>
  </svg>
);

// ── SVG SEARCH ICON FOR EMPTY STATE ────────────────────────────────────
const SearchEmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
    <line x1="8" y1="8" x2="14" y2="14"/>
  </svg>
);

export default function HomePage({ user, isGuest }) {
  const { isPro } = usePro();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [streak, setStreak] = useState(0);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const categoryRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('bv-stats');
    if (saved) {
      const s = JSON.parse(saved);
      setStreak(s.streak || 0);
      setWorkoutsCompleted(s.workoutsCompleted || 0);
    }
  }, []);

  const filteredExercises = getExercisesByCategory(activeCategory).filter(e =>
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
      paddingBottom: '84px',
      overflowX: 'hidden',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: 'calc(16px + var(--safe-top)) 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--bg-0)',
        borderBottom: '1px solid transparent',
        animation: 'fadeIn 0.4s ease both',
      }}>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 500, marginBottom: '2px' }}>
            {greeting}
          </p>
          <h1 style={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            color: 'var(--text-0)', 
            letterSpacing: '-0.03em', 
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {firstName}
            <WaveIcon />
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StreakBadge streak={streak} />
          <div
            onClick={() => navigate('/profile')}
            style={{
              width: '38px', height: '38px',
              borderRadius: '50%',
              background: user?.photoURL ? 'transparent' : 'var(--accent-dim)',
              border: '2px solid var(--border-strong)',
              overflow: 'hidden', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)' }}>
                {firstName[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{
        display: 'flex',
        gap: '10px',
        padding: '16px 20px',
        animation: 'fadeUp 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {[
          { value: workoutsCompleted, label: 'Workouts', accent: true },
          { value: exercises.length, label: 'Exercises' },
          { value: streak > 0 ? `${streak}d` : '—', label: 'Streak' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            background: stat.accent ? 'var(--accent-dim)' : 'var(--bg-card)',
            border: `1px solid ${stat.accent ? 'rgba(200,255,0,0.2)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 12px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '22px', fontWeight: 800,
              color: stat.accent ? 'var(--accent)' : 'var(--text-0)',
              letterSpacing: '-0.03em', lineHeight: 1,
              marginBottom: '4px',
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{
        padding: '0 20px 16px',
        animation: 'fadeUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-1)',
          border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px',
          transition: 'border-color 0.15s ease',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search exercises, muscles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              flex: 1, background: 'none', border: 'none',
              color: 'var(--text-0)', fontSize: '14px',
              fontWeight: 500, outline: 'none', fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-3)', lineHeight: 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* ── PRO Banner (only for free users, dismissible) ── */}
      {!isPro && <ProBanner navigate={navigate} />}

      {/* ── Category pills ── */}
      <div
        ref={categoryRef}
        style={{
          display: 'flex', gap: '8px',
          padding: '0 20px 20px',
          overflowX: 'auto', scrollbarWidth: 'none',
          animation: 'fadeUp 0.4s 0.15s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {categories.map(cat => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#000' : 'var(--text-2)',
                fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                flexShrink: 0, fontFamily: 'inherit',
                transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                transform: active ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              <span style={{ 
                display: 'flex', 
                alignItems: 'center',
                opacity: active ? 1 : 0.7 
              }}>
                {CATEGORY_ICONS[cat.id]}
              </span>
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* ── Section title ── */}
      <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>
          {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'all' ? 'All Exercises' : categories.find(c => c.id === activeCategory)?.name}
        </h2>
        <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 500 }}>
          {filteredExercises.length}
        </span>
      </div>

      {/* ── Exercise Grid ── */}
      {filteredExercises.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: 'var(--text-2)',
          animation: 'fadeUp 0.4s ease both',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '12px' 
          }}>
            <SearchEmptyIcon />
          </div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '6px' }}>No exercises found</p>
          <p style={{ fontSize: '14px', color: 'var(--text-2)' }}>Try a different search</p>
        </div>
      ) : (
        <div style={{
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
        }}>
          {filteredExercises.map((exercise, i) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={i} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── PRO Banner — subtle, non-blocking, dismissible ──────────────────────
function ProBanner({ navigate }) {
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('bv-pro-banner-dismissed') === 'true'
  );

  if (dismissed) return null;

  return (
    <div style={{
      margin: '0 20px 16px',
      padding: '14px 16px',
      borderRadius: 'var(--radius-lg)',
      background: 'linear-gradient(135deg, rgba(200,255,0,0.08) 0%, rgba(57,255,20,0.04) 100%)',
      border: '1px solid rgba(200,255,0,0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      animation: 'fadeUp 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      {/* Star icon */}
      <div style={{
        flexShrink: 0, width: '32px', height: '32px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--accent-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '1px' }}>
          Try PRO free for 7 days
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Full history · Program builder · All themes
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/pro')}
        style={{
          flexShrink: 0, padding: '7px 14px',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          background: 'var(--gradient-accent)',
          color: '#000', fontSize: '12px', fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Try free
      </button>

      {/* Dismiss */}
      <button
        onClick={() => {
          setDismissed(true);
          localStorage.setItem('bv-pro-banner-dismissed', 'true');
        }}
        style={{
          flexShrink: 0, background: 'none', border: 'none',
          cursor: 'pointer', padding: '4px', color: 'var(--text-3)',
          lineHeight: 1,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

function ExerciseCard({ exercise, index, navigate }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onClick={() => navigate(`/workout?exercise=${exercise.id}`)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'transform 0.15s cubic-bezier(0.34,1.56,0.64,1), border-color 0.15s ease, box-shadow 0.15s ease',
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        borderColor: pressed ? 'var(--accent)' : 'var(--border)',
        boxShadow: pressed ? 'var(--accent-glow)' : 'none',
        animation: `fadeUp 0.4s ${Math.min(index * 0.04, 0.3)}s cubic-bezier(0.16,1,0.3,1) both`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow spot */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '80px', height: '80px', borderRadius: '50%',
        background: `radial-gradient(circle, ${DIFFICULTY_COLOR[exercise.difficulty]}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Difficulty badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-full)',
        background: `${DIFFICULTY_COLOR[exercise.difficulty]}15`,
        marginBottom: '12px',
      }}>
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: DIFFICULTY_COLOR[exercise.difficulty],
        }} />
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
          color: DIFFICULTY_COLOR[exercise.difficulty], textTransform: 'uppercase',
        }}>
          {exercise.difficulty}
        </span>
      </div>

      {/* Name */}
      <h3 style={{
        fontSize: '15px', fontWeight: 700,
        color: 'var(--text-0)', letterSpacing: '-0.02em',
        lineHeight: 1.25, marginBottom: '6px',
      }}>
        {exercise.name}
      </h3>

      {/* Muscles */}
      <p style={{
        fontSize: '12px', color: 'var(--text-2)',
        lineHeight: 1.4, marginBottom: '12px',
        display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {exercise.muscles.slice(0, 3).join(' · ')}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '12px', fontWeight: 700,
          color: 'var(--accent)',
          background: 'var(--accent-dim)',
          padding: '4px 8px', borderRadius: 'var(--radius-sm)',
        }}>
          {exercise.targetSets}×{exercise.isTimed ? `${exercise.targetReps}s` : exercise.targetReps}
        </span>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#000">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
