import React from 'react';
import { useNavigate } from 'react-router-dom';

// ── Muscle-specific icons — anatomically distinct, same as homepage ───────
const muscleIcons = {
  chest: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8 C3 5 6 3 9 4 C11 5 12 7 12 7 C12 7 13 5 15 4 C18 3 21 5 21 8 C21 13 16 17 12 19 C8 17 3 13 3 8z"/>
    </svg>
  ),
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4 L12 2 L20 4 L17 14 L12 16 L7 14 Z"/>
      <line x1="12" y1="2" x2="12" y2="16"/>
    </svg>
  ),
  shoulders: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 16 C5 10 8 6 12 5 C16 6 19 10 19 16"/>
      <path d="M2 17 C2 14 3.5 12 5 11"/>
      <path d="M22 17 C22 14 20.5 12 19 11"/>
    </svg>
  ),
  triceps: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5 C7 5 5 10 5 14 C5 17 8 20 12 20 C16 20 19 17 19 14 C19 10 17 5 17 5"/>
      <line x1="7" y1="5" x2="17" y2="5"/>
    </svg>
  ),
  arms: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20 L6 14 C6 9 9 5 12 4 C15 5 18 9 18 14 L18 20"/>
      <path d="M9 4 C9 2 10.5 1 12 1 C13.5 1 15 2 15 4"/>
    </svg>
  ),
  legs: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3 C8 3 6 5 6 10 L7 20 L10 21 L11 12 L13 12 L14 21 L17 20 L18 10 C18 5 16 3 16 3"/>
      <line x1="8" y1="3" x2="16" y2="3"/>
    </svg>
  ),
  core: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="10" height="18" rx="2"/>
      <line x1="12" y1="3" x2="12" y2="21"/>
      <line x1="7" y1="9" x2="17" y2="9"/>
      <line x1="7" y1="15" x2="17" y2="15"/>
    </svg>
  ),
  cardio: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

const difficultyColors = {
  beginner: 'var(--success)',
  intermediate: 'var(--warning)',
  advanced: 'var(--danger)'
};

export default function ExerciseCard({ exercise }) {
  const navigate = useNavigate();
  
  return (
    <div
      onClick={() => navigate(`/workout?exercise=${exercise.id}`)}
      className="fade-in"
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.03)',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--accent-dim)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '12px', 
          background: 'var(--accent-dim)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--accent)'
        }}>
          {muscleIcons[exercise.category] || muscleIcons.core}
        </div>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: difficultyColors[exercise.difficulty],
          background: `${difficultyColors[exercise.difficulty]}15`,
          padding: '4px 10px',
          borderRadius: '20px'
        }}>
          {exercise.difficulty}
        </span>
      </div>
      
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: 700, 
        marginBottom: '4px',
        color: 'var(--text-primary)'
      }}>
        {exercise.name}
      </h3>
      
      <p style={{ 
        fontSize: '13px', 
        color: 'var(--text-secondary)', 
        lineHeight: 1.5,
        marginBottom: '12px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {exercise.description}
      </p>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 4h15M6 8h15M6 4v16M2 4v16"/><path d="M2 20h4"/><path d="M2 12h4"/>
          </svg>
          {exercise.targetSets}x{exercise.isTimed ? `${exercise.targetReps}s` : exercise.targetReps}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4M6 9h12M6 15h12"/>
          </svg>
          {exercise.equipment === 'none' ? 'No equipment' : exercise.equipment}
        </span>
      </div>
    </div>
  );
}