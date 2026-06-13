import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreBadge from '../components/scorebadge';

// ── SVG ICONS (NO EMOJI) ─────────────────────────────────────────────────
const FlameIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a5 5 0 11-10 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5-2.5z"/>
  </svg>
);

const ChartIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const TrophyIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
  </svg>
);

const TrendIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const ClockIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ArrowLeftIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

// ── SAFE DEFAULT STATS ───────────────────────────────────────────────────
const DEFAULT_STATS = {
  workoutsCompleted: 0,
  streak: 0,
  totalReps: 0,
  totalTime: 0,
  lastWorkout: null,
  weeklyWorkouts: [0, 0, 0, 0, 0, 0, 0]
};

const DEFAULT_HISTORY = [];

export default function StatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [history, setHistory] = useState(DEFAULT_HISTORY);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      // Load stats with safe fallback
      const savedStats = localStorage.getItem('bv-stats');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        setStats({
          workoutsCompleted: parsed.workoutsCompleted || 0,
          streak: parsed.streak || 0,
          totalReps: parsed.totalReps || 0,
          totalTime: parsed.totalTime || 0,
          lastWorkout: parsed.lastWorkout || null,
          weeklyWorkouts: Array.isArray(parsed.weeklyWorkouts) ? parsed.weeklyWorkouts : [0,0,0,0,0,0,0]
        });
      }

      // Load history with safe fallback
      const savedHistory = localStorage.getItem('bv-history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(-10).reverse());
        }
      }
    } catch (err) {
      console.error('Stats load error:', err);
      // Keep defaults on error
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  
  // Build week days array starting from 6 days ago
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const idx = (today - 6 + i + 7) % 7;
    return days[idx];
  });
  
  const maxWeekly = Math.max(...stats.weeklyWorkouts, 1);
  
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--bg-tertiary)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Your Progress
        </h1>
      </div>
      
      {/* Main Stats Grid */}
      <div style={{ 
        padding: '0 20px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FlameIcon size={20} color="var(--accent)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Workouts
            </span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.workoutsCompleted}
          </div>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrophyIcon size={20} color="var(--accent)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Day Streak
            </span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent)' }}>
            {stats.streak}
          </div>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendIcon size={20} color="var(--text-secondary)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Total Reps
            </span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.totalReps}
          </div>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ClockIcon size={20} color="var(--text-secondary)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Minutes
            </span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {Math.floor(stats.totalTime / 60)}
          </div>
        </div>
      </div>
      
      {/* Weekly Chart */}
      <div style={{
        margin: '0 20px 20px',
        background: 'var(--bg-secondary)',
        borderRadius: '20px',
        padding: '20px',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: 700, 
          color: 'var(--text-primary)',
          marginBottom: '16px'
        }}>
          This Week
        </h3>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between',
          height: '120px',
          gap: '8px'
        }}>
          {weekDays.map((day, i) => {
            const dayValue = stats.weeklyWorkouts[i] || 0;
            const height = `${(dayValue / maxWeekly) * 100}%`;
            const isToday = i === 6;
            
            return (
              <div key={day} style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '100%',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: isToday ? '100%' : '70%',
                    height: dayValue > 0 ? height : '4px',
                    background: isToday ? 'var(--accent)' : 'var(--bg-tertiary)',
                    borderRadius: '6px 6px 0 0',
                    minHeight: '4px',
                    transition: 'height 0.3s ease'
                  }} />
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? 'var(--accent)' : 'var(--text-muted)'
                }}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div style={{ padding: '0 20px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: 700, 
          color: 'var(--text-primary)',
          marginBottom: '12px'
        }}>
          Recent Activity
        </h3>
        
        {history.length === 0 ? (
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '12px',
              opacity: 0.5
            }}>
              <ChartIcon size={40} color="currentColor" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 600 }}>No workouts yet</p>
            <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.7 }}>
              Complete your first workout to see it here
            </p>
          </div>
        ) : (
          history.map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <ScoreBadge score={item.score || 0} size="sm" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.exerciseName || 'Workout'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.reps || 0} reps • {Math.floor((item.duration || 0) / 60)}m {(item.duration || 0) % 60}s
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
