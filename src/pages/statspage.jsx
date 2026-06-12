import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/logo';
import ScoreBadge from '../components/scorebadge';

export default function StatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    workoutsCompleted: 0,
    streak: 0,
    totalReps: 0,
    totalTime: 0,
    lastWorkout: null,
    weeklyWorkouts: [0, 0, 0, 0, 0, 0, 0]
  });
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('bv-stats');
    if (saved) {
      setStats(JSON.parse(saved));
    }
    const hist = localStorage.getItem('bv-history');
    if (hist) {
      setHistory(JSON.parse(hist).slice(-10).reverse());
    }
  }, []);
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();

  // Build last-7-days in order: oldest → today
  // Each entry carries the real weeklyWorkouts index so the bar value is correct
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (today - 6 + i + 7) % 7;
    return { label: days[dayIndex], index: dayIndex };
  });

  const maxWeekly = Math.max(...stats.weeklyWorkouts, 1);
  
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
            color: 'var(--text-primary)'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <path d="M17 18a5 5 0 00-10 0M12 2v8M8 6l4-4 4 4"/>
            </svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
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
          {weekDays.map(({ label, index }, i) => {
            const count = stats.weeklyWorkouts[index] || 0;
            const heightPct = `${(count / maxWeekly) * 100}%`;
            const isToday = i === 6;

            return (
              <div key={label} style={{ 
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
                    height: count > 0 ? heightPct : '4px',
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
                  {label}
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
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.5 }}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <p style={{ fontSize: '14px' }}>No workouts yet</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Complete your first workout to see it here</p>
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
              <ScoreBadge score={item.score} size="sm" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.exerciseName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.reps} reps • {Math.floor(item.duration / 60)}m {item.duration % 60}s
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}