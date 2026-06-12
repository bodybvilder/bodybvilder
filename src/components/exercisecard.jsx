import React from 'react';
import { useNavigate } from 'react-router-dom';

const muscleIcons = {
  chest: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12c0-4-3-8-8-8s-8 4-8 8 3 8 8 8 8-4 8-8z"/><path d="M12 8v8M8 12h8"/></svg>,
  back: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"/></svg>,
  shoulders: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12h20"/></svg>,
  arms: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l12 16M18 4l-12 16"/></svg>,
  legs: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5"/></svg>,
  core: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          {exercise.targetSets}x{exercise.isTimed ? `${exercise.targetReps}s` : exercise.targetReps}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
          {exercise.equipment === 'none' ? 'No equipment' : exercise.equipment}
        </span>
      </div>
    </div>
  );
}