import React, { useState } from 'react';
import Logo from './logo';

export default function ShareCard({ exercise, score, reps, duration, onClose }) {
  const [copied, setCopied] = useState(false);

  const mins = Math.floor((duration || 0) / 60);
  const secs = ((duration || 0) % 60).toString().padStart(2, '0');

  const scoreColor =
    score >= 90 ? 'var(--accent)' :
    score >= 70 ? 'var(--orange)' :
    'var(--red)';

  const shareText = `Just trained with BODYBVILDER AI Form Coach\n\n${exercise?.name || 'Workout'}\nForm Score: ${score}/100\nReps: ${reps}\nTime: ${mins}:${secs}\n\nbodybvilder.vercel.app\n#BODYBVILDER #AIFormCoach #Bodybuilding`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BODYBVILDER Workout', text: shareText });
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback silent fail
      }
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 200,
        padding: '0',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      {/* Bottom sheet */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'var(--bg-1)',
          borderRadius: '28px 28px 0 0',
          padding: '28px 20px calc(28px + env(safe-area-inset-bottom))',
          animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: '40px', height: '4px', background: 'var(--bg-3)', borderRadius: '99px', margin: '0 auto 24px' }} />

        {/* Workout complete label */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px', borderRadius: '99px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(200,255,0,0.2)',
            marginBottom: '12px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Workout Complete
            </span>
          </div>
          <h2 style={{
            fontSize: '24px', fontWeight: 900,
            color: 'var(--text-0)', letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            {exercise?.name || 'Workout'}
          </h2>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1px', background: 'var(--border)',
          borderRadius: '18px', overflow: 'hidden',
          marginBottom: '20px',
        }}>
          {[
            { label: 'Form Score', value: score || 0, color: scoreColor, suffix: '' },
            { label: 'Reps', value: reps || 0, color: 'var(--text-0)', suffix: '' },
            { label: 'Time', value: `${mins}:${secs}`, color: 'var(--text-0)', suffix: '' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-2)',
              padding: '16px 8px', textAlign: 'center',
            }}>
              <div style={{
                fontSize: i === 2 ? '20px' : '28px',
                fontWeight: 900, color: s.color,
                letterSpacing: '-0.04em', lineHeight: 1,
                marginBottom: '4px',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Logo + branding */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '14px',
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          marginBottom: '20px',
        }}>
          <Logo color="accent" size={28} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>BODYBVILDER</div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>AI Form Coach · bodybvilder.vercel.app</div>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          style={{
            width: '100%', padding: '16px',
            borderRadius: '16px', border: 'none',
            background: 'var(--gradient-accent)',
            color: '#000', fontSize: '16px', fontWeight: 800,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            marginBottom: '10px', letterSpacing: '-0.01em',
            transition: 'opacity 0.15s ease',
          }}
        >
          {copied ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Copied to clipboard
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share Workout
            </>
          )}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px',
            borderRadius: '16px', border: 'none',
            background: 'transparent',
            color: 'var(--text-2)', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
