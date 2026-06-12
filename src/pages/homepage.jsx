import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from '../components/exercisecard';
import StreakBadge from '../components/streakbadge';
import { exercises, categories, getExercisesByCategory } from '../data/exercises';

const categoryIcons = {
  all: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  chest: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12c0-4-3-8-8-8s-8 4-8 8 3 8 8 8 8-4 8-8z"/><path d="M12 8v8M8 12h8"/></svg>,
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"/></svg>,
  shoulders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>,
  triceps: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3l6 9 6-9M6 21l6-9 6 9"/></svg>,
  arms: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l12 16M18 4l-12 16"/></svg>,
  legs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5"/></svg>,
  core: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
};

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [streak, setStreak] = useState(0);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const saved = localStorage.getItem('bv-stats');
    if (saved) {
      const stats = JSON.parse(saved);
      setStreak(stats.streak || 0);
      setWorkoutsCompleted(stats.workoutsCompleted || 0);
    }
  }, []);
  
  const filteredExercises = getExercisesByCategory(activeCategory).filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.muscles.some(m => m.includes(searchQuery.toLowerCase()))
  );
    return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)',
      paddingBottom: '84px'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '24px 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo color="accent" size={36} />
          <div>
            <h1 style={{ 
              fontSize: '22px', 
              fontWeight: 800, 
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px'
            }}>
              BODYBVILDER
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              AI Form Coach
            </p>
          </div>
        </div>
        <StreakBadge streak={streak} />
      </div>
      
      {/* Stats Bar */}
      <div style={{
        margin: '0 20px 20px',
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>
            {workoutsCompleted}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Workouts Done
          </div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {exercises.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Exercises
          </div>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {streak > 0 ? `${streak}d` : '-'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Best Streak
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '14px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '15px',
              outline: 'none',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Category Pills */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        padding: '0 20px 16px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeCategory === cat.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            {categoryIcons[cat.id]}
            {cat.name}
          </button>
        ))}
      </div>
      
      {/* Exercise Grid */}
      <div style={{ 
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '12px'
      }}>
        {filteredExercises.map((exercise, i) => (
          <div key={exercise.id} style={{ animationDelay: `${i * 0.05}s` }} className="fade-in">
            <ExerciseCard exercise={exercise} />
          </div>
        ))}
      </div>
      
      {filteredExercises.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: 'var(--text-muted)' 
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.5 }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <p style={{ fontSize: '15px' }}>No exercises found</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Try a different search or category</p>
        </div>
      )}
    </div>
  );
}