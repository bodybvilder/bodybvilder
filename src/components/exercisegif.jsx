import React, { useState, useEffect, useRef } from 'react';

/**
 * ExerciseGif — uses real exercise photos from free-exercise-db (public domain)
 * Hosted on jsDelivr CDN: https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/
 * Animates by flipping between frame 0 and frame 1 (the two key positions of each exercise)
 * No API key needed, fully open source, accurate exercise visuals
 */

const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';

// Map our exercise IDs → free-exercise-db folder names
// Source: https://github.com/yuhonas/free-exercise-db/tree/main/exercises
const DB_ID_MAP = {
  // ── Chest / Push ──────────────────────────────────────────────────────
  'pushup':               'Pushup',
  'incline-pushup':       'Incline_Push-Up',
  'decline-pushup':       'Decline_Push-Up',
  'diamond-pushup':       'Close-Grip_Push-Up_off_of_a_Dumbbell',
  'wide-pushup':          'Wide-Grip_Barbell_Bench_Press',
  'pike-pushup':          'Pike_Push-Up',
  'incline-dumbbell-press': 'Dumbbell_Incline_Alternating_Press',
  'dumbbell-fly':         'Dumbbell_Flyes',
  'cable-fly':            'Cable_Crossovers',

  // ── Back / Pull ───────────────────────────────────────────────────────
  'pullup':               'Pull-Up',
  'chinup':               'Chin-Up',
  'dead-hang':            'Hanging_Bar_Good_Morning',
  'bodyweight-row':       'Inverted_Row_with_Straddle',
  'barbell-row':          'Barbell_Bent_Over_Row',
  'dumbbell-row':         'Dumbbell_Bent_Over_Row',
  'lat-pulldown':         'Cable_Lat_Pulldown',
  'seated-cable-row':     'Cable_Seated_Row',
  'superman':             'Superman',
  'barbell-deadlift':     'Barbell_Deadlift',
  'romanian-deadlift':    'Romanian_Deadlift',

  // ── Shoulders ─────────────────────────────────────────────────────────
  'lateral-raise':        'Dumbbell_Lateral_Raise',
  'front-raise':          'Dumbbell_Front_Raise',
  'overhead-press':       'Barbell_Standing_Military_Press',
  'arnold-press':         'Arnold_Dumbbell_Press',
  'face-pull':            'Cable_Face_Pull',
  'cable-lateral-raise':  'Cable_Lateral_Raise',
  'shoulder-tap':         'Push-Up_to_Side_Plank',

  // ── Triceps ───────────────────────────────────────────────────────────
  'dip':                  'Triceps_Dip',
  'bench-dip':            'Bench_Dips',
  'tricep-extension':     'Dumbbell_Tricep_Kickback',
  'skull-crusher':        'Barbell_Skullcrusher',
  'tricep-pushdown':      'Triceps_Pushdown',
  'cable-kickback':       'Cable_Kickback',

  // ── Arms / Biceps ─────────────────────────────────────────────────────
  'bicep-curl':           'Dumbbell_Bicep_Curl',
  'hammer-curl':          'Hammer_Curls',
  'concentration-curl':   'Dumbbell_Concentration_Curl',
  'barbell-curl':         'Barbell_Curl',
  'cable-curl':           'Cable_Curl',

  // ── Legs ──────────────────────────────────────────────────────────────
  'squat':                'Bodyweight_Squat',
  'lunge':                'Barbell_Lunge',
  'glute-bridge':         'Glute_Bridge',
  'jump-squat':           'Jump_Squat',
  'single-leg-squat':     'Pistol_Squat',
  'calf-raise':           'Calf_Raise',
  'barbell-squat':        'Barbell_Full_Squat',
  'bulgarian-split-squat':'Barbell_Bulgarian_Split_Squat',

  // ── Core ──────────────────────────────────────────────────────────────
  'plank':                'Plank',
  'hollow-body':          'L-Sit_on_Floor',
  'crunch':               'Crunch',
  'mountain-climber':     'Mountain_Climber_-_Alternating',
  'leg-raise':            'Lying_Leg_Raise',
  'russian-twist':        'Russian_Twist',
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

export default function ExerciseGif({ exerciseId, size = 160 }) {
  const [frame, setFrame]     = useState(0);
  const [loaded, setLoaded]   = useState([false, false]);
  const [error, setError]     = useState(false);
  const intervalRef           = useRef(null);

  const dbId    = DB_ID_MAP[exerciseId];
  const isPose  = exerciseId?.startsWith('pose-');
  const speed   = FLIP_SPEED[exerciseId] || DEFAULT_SPEED;

  // Preload both frames
  useEffect(() => {
    if (!dbId || isPose) return;
    setLoaded([false, false]);
    setError(false);
    setFrame(0);

    const loadFrame = (f) => new Promise((resolve, reject) => {
      if (frameCache[`${dbId}-${f}`]) { resolve(); return; }
      const img = new Image();
      img.onload  = () => { frameCache[`${dbId}-${f}`] = true; resolve(); };
      img.onerror = () => reject();
      img.src = imgUrl(dbId, f);
    });

    Promise.all([loadFrame(0), loadFrame(1)])
      .then(() => setLoaded([true, true]))
      .catch(() => setError(true));
  }, [dbId, isPose]);

  // Flip animation loop
  useEffect(() => {
    if (!loaded[0] || !loaded[1]) return;
    intervalRef.current = setInterval(() => setFrame(f => f === 0 ? 1 : 0), speed);
    return () => clearInterval(intervalRef.current);
  }, [loaded, speed]);

  // ── Pose: show static pose icon ──────────────────────────────────────
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

  // ── No mapping ────────────────────────────────────────────────────────
  if (!dbId) return <FallbackAnim size={size} exerciseId={exerciseId} />;

  // ── Loading ───────────────────────────────────────────────────────────
  if (!loaded[0]) {
    return (
      <div style={containerStyle(size)}>
        <div style={{ width: 24, height: 24, border: '2.5px solid var(--bg-3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Error fallback ────────────────────────────────────────────────────
  if (error) return <FallbackAnim size={size} exerciseId={exerciseId} />;

  return (
    <div style={containerStyle(size)}>
      {/* frame 0 */}
      <img src={imgUrl(dbId, 0)} alt="" style={{ ...imgStyle, opacity: frame === 0 ? 1 : 0 }} />
      {/* frame 1 */}
      <img src={imgUrl(dbId, 1)} alt="" style={{ ...imgStyle, opacity: frame === 1 ? 1 : 0 }} />
      {/* subtle accent border on active */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', border: '1px solid rgba(200,255,0,0.15)', pointerEvents: 'none' }}/>
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
