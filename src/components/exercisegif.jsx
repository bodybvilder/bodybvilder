import React, { useState, useEffect, useRef } from 'react';

/**
 * ExerciseGif — uses real exercise photos from free-exercise-db (public domain)
 * Hosted on jsDelivr CDN: https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/
 * Animates by flipping between frame 0 and frame 1 (the two key positions of each exercise)
 * No API key needed, fully open source, accurate exercise visuals
 */

const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';

// Map our exercise IDs → free-exercise-db folder names (verified against DB)
const DB_ID_MAP = {
  // ── Chest / Push ──────────────────────────────────────────────────────
  'pushup':               'Pushups',
  'incline-pushup':       'Incline_Push-Up',
  'decline-pushup':       'Decline_Push-Up',
  'diamond-pushup':       'Close-Grip_Push-Up_off_of_a_Dumbbell',
  'wide-pushup':          'Pushups_Close_and_Wide_Hand_Positions',
  'pike-pushup':          'Pike_Push-Up',
  'incline-dumbbell-press': 'Dumbbell_Incline_Alternating_Press',
  'dumbbell-fly':         'Dumbbell_Flyes',
  'cable-fly':            'Cable_Crossover',

  // ── Back / Pull ───────────────────────────────────────────────────────
  'pullup':               'Pullups',
  'chinup':               'Chin-Up',
  'dead-hang':            'Hanging_Bar_Good_Morning',
  'bodyweight-row':       'Inverted_Row',
  'barbell-row':          'Barbell_Bent_Over_Row',
  'dumbbell-row':         'Dumbbell_Bent_Over_Row',
  'lat-pulldown':         'Close-Grip_Front_Lat_Pulldown',
  'seated-cable-row':     'Cable_Seated_Row',
  'superman':             'Superman',
  'barbell-deadlift':     'Barbell_Deadlift',
  'romanian-deadlift':    'Romanian_Deadlift',

  // ── Shoulders ─────────────────────────────────────────────────────────
  'lateral-raise':        'Dumbbell_Lying_One-Arm_Rear_Lateral_Raise',
  'front-raise':          'Side_Laterals_to_Front_Raise',
  'overhead-press':       'Seated_Barbell_Military_Press',
  'arnold-press':         'Arnold_Dumbbell_Press',
  'face-pull':            'Face_Pull',
  'cable-lateral-raise':  'Cable_Seated_Lateral_Raise',
  'shoulder-tap':         'Push_Up_to_Side_Plank',

  // ── Triceps ───────────────────────────────────────────────────────────
  'dip':                  'Dips_-_Chest_Version',
  'bench-dip':            'Bench_Dips',
  'tricep-extension':     'Cable_Lying_Triceps_Extension',
  'skull-crusher':        'EZ-Bar_Skullcrusher',
  'tricep-pushdown':      'Triceps_Pushdown',
  'cable-kickback':       'One-Legged_Cable_Kickback',

  // ── Arms / Biceps ─────────────────────────────────────────────────────
  'bicep-curl':           'Dumbbell_Bicep_Curl',
  'hammer-curl':          'Hammer_Curls',
  'concentration-curl':   'Concentration_Curls',
  'barbell-curl':         'Barbell_Curl',
  'cable-curl':           'Cable_Curl',

  // ── Legs ──────────────────────────────────────────────────────────────
  'squat':                'Bodyweight_Squat',
  'lunge':                'Barbell_Lunge',
  'glute-bridge':         'Barbell_Glute_Bridge',
  'jump-squat':           'Freehand_Jump_Squat',
  'single-leg-squat':     'Kettlebell_Pistol_Squat',
  'calf-raise':           'Calf_Raise_On_A_Dumbbell',
  'barbell-squat':        'Barbell_Full_Squat',
  'bulgarian-split-squat':'Barbell_Bulgarian_Split_Squat',

  // ── Core ──────────────────────────────────────────────────────────────
  'plank':                'Plank',
  'hollow-body':          'Crunches',
  'crunch':               'Crunches',
  'mountain-climber':     'Mountain_Climbers',
  'leg-raise':            'Flat_Bench_Lying_Leg_Raise',
  'russian-twist':        'Russian_Twist',

  // ── Cardio / Compound ─────────────────────────────────────────────────
  'burpee':               'Freehand_Jump_Squat',
  'box-jump':             'Box_Jump_Multiple_Response',
  'step-up':              'Step-up_with_Knee_Raise',

  // ── Machine Legs ──────────────────────────────────────────────────────
  'leg-press':            'Leg_Press',
  'leg-extension':        'Leg_Extensions',
  'leg-curl':             'Lying_Leg_Curls',
  'hack-squat':           'Hack_Squat',

  // ── More Barbell / Dumbbell ───────────────────────────────────────────
  'barbell-bench-press':  'Barbell_Bench_Press_-_Medium_Grip',
  'dumbbell-shoulder-press': 'Dumbbell_Shoulder_Press',
  'upright-row':          'Upright_Barbell_Row',
  'barbell-shrug':        'Barbell_Shrug',
  't-bar-row':            'T-Bar_Row_with_Handle',
  'good-morning':         'Good_Morning',
  'barbell-hip-thrust':   'Barbell_Hip_Thrust',
  'preacher-curl':        'Preacher_Curl',
  'incline-dumbbell-curl':'Incline_Dumbbell_Curl',
  'incline-hammer-curl':  'Incline_Hammer_Curls',
  'reverse-fly':          'Reverse_Flyes',
};

const imgUrl = (dbId, frame) =>
  `${CDN}/${encodeURIComponent(dbId)}/${frame}.jpg`;

// Per-exercise flip speed (ms per frame) — faster for explosive, slower for holds
const FLIP_SPEED = {
  'jump-squat': 400, 'mountain-climber': 350, 'shoulder-tap': 450,
  'plank': 3000, 'dead-hang': 3000, 'hollow-body': 2500,
  'superman': 2000,
};
const DEFAULT_SPEED = 800;

const frameCache = {};
// Preload with timeout helper
function loadImg(src, timeoutMs = 4000) {
  if (frameCache[src]) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const img = new Image();
    const t = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    img.onload  = () => { clearTimeout(t); frameCache[src] = true; resolve(); };
    img.onerror = () => { clearTimeout(t); reject(); };
    img.src = src;
  });
}

export default function ExerciseGif({ exerciseId, size = 160 }) {
  const [frame, setFrame]       = useState(0);
  const [frame0Ready, setF0]    = useState(false);
  const [frame1Ready, setF1]    = useState(false);
  const [error, setError]       = useState(false);
  const intervalRef             = useRef(null);

  const dbId   = DB_ID_MAP[exerciseId];
  const isPose = exerciseId?.startsWith('pose-');
  const speed  = FLIP_SPEED[exerciseId] || DEFAULT_SPEED;

  useEffect(() => {
    if (!dbId || isPose) return;
    setF0(false); setF1(false); setError(false); setFrame(0);
    clearInterval(intervalRef.current);

    const url0 = imgUrl(dbId, 0);
    const url1 = imgUrl(dbId, 1);

    // Frame 0: show immediately when ready
    loadImg(url0, 4000)
      .then(() => setF0(true))
      .catch(() => setError(true));

    // Frame 1: load silently in background
    loadImg(url1, 6000)
      .then(() => setF1(true))
      .catch(() => {}); // frame 1 failing is fine, just won't animate
  }, [dbId, isPose]);

  // Start flip only after frame 0 is ready (frame 1 optional)
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!frame0Ready) return;
    // If we have both frames, start flipping
    if (frame1Ready) {
      intervalRef.current = setInterval(() => setFrame(f => f === 0 ? 1 : 0), speed);
    }
    return () => clearInterval(intervalRef.current);
  }, [frame0Ready, frame1Ready, speed]);

  // ── Pose icon ────────────────────────────────────────────────────────
  if (isPose) {
    return (
      <div style={containerStyle(size)}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M8 10c0-1.1.9-2 2-2h4a2 2 0 012 2v1.5a4 4 0 01-8 0V10z"/>
            <path d="M12 15v5M9 18h6"/>
          </svg>
          <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Pose</span>
        </div>
      </div>
    );
  }

  // ── No mapping / error ───────────────────────────────────────────────
  if (!dbId || error) return <FallbackAnim size={size} exerciseId={exerciseId} />;

  // ── Skeleton shimmer while frame 0 loads ─────────────────────────────
  if (!frame0Ready) {
    return (
      <div style={containerStyle(size)}>
        <style>{`
          @keyframes bv-shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position:  200% 0; }
          }
        `}</style>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, var(--bg-2) 25%, var(--bg-3) 50%, var(--bg-2) 75%)',
          backgroundSize: '200% 100%',
          animation: 'bv-shimmer 1.4s ease-in-out infinite',
          borderRadius: 'inherit',
        }}/>
        {/* Silhouette hint */}
        <svg width={size * 0.3} height={size * 0.3} viewBox="0 0 24 24" fill="none"
          stroke="var(--bg-3)" strokeWidth="1.5" strokeLinecap="round"
          style={{ position: 'relative', zIndex: 1, opacity: 0.5 }}>
          <circle cx="12" cy="5" r="3"/>
          <path d="M12 8v8M8 10l4-2 4 2M10 20l2-4 2 4"/>
        </svg>
      </div>
    );
  }

  // ── Ready: show frame 0 immediately, animate when frame 1 arrives ─────
  return (
    <div style={containerStyle(size)}>
      {/* frame 0 always visible once loaded */}
      <img
        src={imgUrl(dbId, 0)}
        alt=""
        style={{ ...imgStyle, opacity: frame === 0 || !frame1Ready ? 1 : 0 }}
      />
      {/* frame 1 only shown once loaded */}
      {frame1Ready && (
        <img
          src={imgUrl(dbId, 1)}
          alt=""
          style={{ ...imgStyle, opacity: frame === 1 ? 1 : 0 }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', border: '1px solid rgba(200,255,0,0.12)', pointerEvents: 'none' }}/>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────
const containerStyle = (size) => ({
  width: size, height: size,
  borderRadius: '16px',
  overflow: 'hidden',
  background: 'var(--bg-2)',
  border: '1px solid var(--border)',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

const imgStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'opacity 0.15s ease',
};

// ── Minimal fallback for unmapped exercises ───────────────────────────────
function FallbackAnim({ size, exerciseId }) {
  const label = (exerciseId || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <div style={{ ...containerStyle(size), flexDirection: 'column', gap: '6px' }}>
      <svg width={size * 0.35} height={size * 0.35} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <circle cx="12" cy="5" r="3"/>
        <path d="M12 8v8M8 10l4-2 4 2M10 20l2-4 2 4"/>
      </svg>
      <span style={{ fontSize: '9px', color: 'var(--text-3)', fontWeight: 600, textAlign: 'center', padding: '0 4px', lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}
