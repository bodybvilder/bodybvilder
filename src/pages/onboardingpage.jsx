import React, { useState } from 'react';

const STEPS = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a5 5 0 01-10 0c0-1.153.433-2.294 1-3A2.5 2.5 0 008.5 14.5z" fill="var(--accent)" stroke="none"/>
      </svg>
    ),
    title: 'AI Form Coach',
    subtitle: 'Real-time feedback',
    desc: 'Your camera analyzes every rep using AI pose detection — counting reps automatically and scoring your form out of 100.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>
      </svg>
    ),
    title: '80+ Exercises',
    subtitle: 'Full gym coverage',
    desc: 'From bodyweight to barbell — every exercise with animated guides, form tips, and progressive overload tracking.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M18 2H6v7a6 6 0 0012 0V2z"/><line x1="12" y1="15" x2="12" y2="22"/>
      </svg>
    ),
    title: 'Pose Practice',
    subtitle: 'Stage-ready posing',
    desc: 'AI scores your bodybuilding poses — front double biceps, lat spread, side chest and more. Prep for the stage at home.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Smart Tracking',
    subtitle: 'Form-adjusted calories',
    desc: 'Track workouts, calories, body weight, and strength gains. Calorie burn adjusts based on your real form quality.',
  },
];

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem('bv-onboarding-complete', 'true');
      onComplete();
    }
  };

  const skip = () => {
    localStorage.setItem('bv-onboarding-complete', 'true');
    onComplete();
  };

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg-0)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 28px',
      fontFamily: 'inherit',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes scaleIn  { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        @keyframes spin     { to { transform: rotate(360deg); } }
      `}</style>

      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Skip */}
      {!isLast && (
        <button
          onClick={skip}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'none', border: 'none',
            color: 'var(--text-3)', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            padding: '8px 12px', borderRadius: '8px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          Skip
        </button>
      )}

      {/* Logo */}
      <div style={{
        fontSize: '13px', fontWeight: 900, letterSpacing: '0.15em',
        color: 'var(--accent)', marginBottom: '48px',
        animation: 'fadeUp 0.4s both',
      }}>
        BODYBVILDER
      </div>

      {/* Icon */}
      <div key={step} style={{
        width: '100px', height: '100px', borderRadius: '28px',
        background: 'var(--accent-dim)',
        border: '1.5px solid rgba(200,255,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '32px',
        animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        boxShadow: '0 0 40px rgba(200,255,0,0.12)',
      }}>
        {s.icon}
      </div>

      {/* Text */}
      <div key={`text-${step}`} style={{ textAlign: 'center', animation: 'fadeUp 0.4s 0.05s both' }}>
        <div style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--accent)', textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          {s.subtitle}
        </div>
        <h2 style={{
          fontSize: '28px', fontWeight: 900, color: 'var(--text-0)',
          letterSpacing: '-0.04em', lineHeight: 1.1,
          marginBottom: '14px',
        }}>
          {s.title}
        </h2>
        <p style={{
          fontSize: '15px', color: 'var(--text-2)',
          lineHeight: 1.6, maxWidth: '280px', margin: '0 auto',
        }}>
          {s.desc}
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', margin: '40px 0 32px' }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? '22px' : '7px',
            height: '7px', borderRadius: '99px',
            background: i === step ? 'var(--accent)' : 'var(--bg-3)',
            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            cursor: 'pointer',
          }} onClick={() => setStep(i)} />
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={next}
        style={{
          width: '100%', maxWidth: '320px',
          padding: '17px', borderRadius: '16px',
          border: 'none',
          background: 'var(--gradient-accent)',
          color: '#000', fontSize: '16px', fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: '-0.01em',
          boxShadow: 'var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'transform 0.12s ease',
        }}
        onPointerDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
        onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
        onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isLast ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Start Training
          </>
        ) : (
          <>
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </>
        )}
      </button>

      {/* Step counter */}
      <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '16px', fontWeight: 600 }}>
        {step + 1} of {STEPS.length}
      </p>
    </div>
  );
}
