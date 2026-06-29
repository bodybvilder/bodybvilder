import React from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseIcon from './exerciseicons';

const difficultyColors = {
  beginner: 'var(--success)',
  intermediate: 'var(--warning)',
  advanced: 'var(--danger)'
};

export default function ExerciseCard({ exercise }) {
  const navigate = useNavigate();
  
  return (
    <div
      onClick={() => navigate(`/workout?exercise=${exercise.id}&autostart=1`)}
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
          <ExerciseIcon
            equipment={exercise.equipment}
            category={exercise.category}
            muscle={exercise.muscles?.[0]}
            size={20}
            color="var(--accent)"
          />
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
        {!exercise.isPose && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 5v14M18 5v14M2 9h4M18 9h4M2 15h4M18 15h4M6 9h12M6 15h12"/>
            </svg>
            {exercise.equipment === 'none' ? 'No equipment' : exercise.equipment}
          </span>
        )}
      </div>
    </div>
  );
}