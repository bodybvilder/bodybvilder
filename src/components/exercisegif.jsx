import React, { useState } from 'react';

/**
 * ExerciseGif — Loads animated GIFs from /exercise-gifs/[id].gif
 * Falls back to a clean SVG silhouette if the GIF hasn't been generated yet.
 *
 * To add a GIF: drop [exercise-id].gif into public/exercise-gifs/
 * The component detects it automatically — no code change needed.
 *
 * GIF spec: 300x300px, #0a0a0a or transparent bg, #e0e0e0 figure, #C8FF00 accent
 */

// ─── All exercise IDs that the app uses ──────────────────────────────────
export const EXERCISE_IDS = [
  // Chest
  'pushup','incline-pushup','decline-pushup','diamond-pushup','wide-pushup',
  'pike-pushup','incline-dumbbell-press','dumbbell-fly','cable-fly','barbell-bench-press',
  // Back
  'dead-hang','pullup','chinup','bodyweight-row','superman',
  'barbell-row','dumbbell-row','barbell-deadlift','romanian-deadlift','lat-pulldown',
  'seated-cable-row','t-bar-row','good-morning','barbell-shrug',
  // Shoulders
  'lateral-raise','front-raise','shoulder-tap','overhead-press','arnold-press',
  'face-pull','cable-lateral-raise','dumbbell-shoulder-press','upright-row','reverse-fly',
  // Triceps
  'dip','bench-dip','tricep-extension','skull-crusher','tricep-pushdown','cable-kickback',
  // Biceps
  'dumbbell-curl','hammer-curl','concentration-curl','barbell-curl','cable-curl',
  'preacher-curl','incline-dumbbell-curl','incline-hammer-curl',
  // Legs
  'squat','barbell-squat','lunge','glute-bridge','jump-squat','single-leg-squat',
  'calf-raise','bulgarian-split-squat','leg-press','leg-extension','leg-curl',
  'hack-squat','barbell-hip-thrust','step-up','box-jump',
  // Core
  'plank','hollow-body','crunch','mountain-climber','leg-raise','russian-twist',
  // Cardio
  'burpee',
  // IFBB Poses – Classic Physique
  'pose-front-double-biceps','pose-front-lat-spread','pose-side-chest',
  'pose-back-double-biceps','pose-back-lat-spread','pose-side-triceps',
  'pose-abs-thighs','pose-most-muscular',
  // IFBB Poses – Men's Physique
  'pose-mp-front','pose-mp-back','pose-mp-side',
];

// ─── Human-readable labels ────────────────────────────────────────────────
export const EXERCISE_LABELS = {
  'pushup': 'Push-Up',
  'incline-pushup': 'Incline Push-Up',
  'decline-pushup': 'Decline Push-Up',
  'diamond-pushup': 'Diamond Push-Up',
  'wide-pushup': 'Wide Push-Up',
  'pike-pushup': 'Pike Push-Up',
  'incline-dumbbell-press': 'Incline Dumbbell Press',
  'dumbbell-fly': 'Dumbbell Fly',
  'cable-fly': 'Cable Fly',
  'barbell-bench-press': 'Barbell Bench Press',
  'dead-hang': 'Dead Hang',
  'pullup': 'Pull-Up',
  'chinup': 'Chin-Up',
  'bodyweight-row': 'Bodyweight Row',
  'superman': 'Superman Hold',
  'barbell-row': 'Barbell Row',
  'dumbbell-row': 'Dumbbell Row',
  'barbell-deadlift': 'Barbell Deadlift',
  'romanian-deadlift': 'Romanian Deadlift',
  'lat-pulldown': 'Lat Pulldown',
  'seated-cable-row': 'Seated Cable Row',
  't-bar-row': 'T-Bar Row',
  'good-morning': 'Good Morning',
  'barbell-shrug': 'Barbell Shrug',
  'lateral-raise': 'Lateral Raise',
  'front-raise': 'Front Raise',
  'shoulder-tap': 'Shoulder Tap',
  'overhead-press': 'Overhead Press',
  'arnold-press': 'Arnold Press',
  'face-pull': 'Face Pull',
  'cable-lateral-raise': 'Cable Lateral Raise',
  'dumbbell-shoulder-press': 'Dumbbell Shoulder Press',
  'upright-row': 'Upright Row',
  'reverse-fly': 'Reverse Fly',
  'dip': 'Tricep Dip',
  'bench-dip': 'Bench Dip',
  'tricep-extension': 'Overhead Tricep Extension',
  'skull-crusher': 'Skull Crusher',
  'tricep-pushdown': 'Tricep Pushdown',
  'cable-kickback': 'Cable Kickback',
  'dumbbell-curl': 'Dumbbell Curl',
  'hammer-curl': 'Hammer Curl',
  'concentration-curl': 'Concentration Curl',
  'barbell-curl': 'Barbell Curl',
  'cable-curl': 'Cable Bicep Curl',
  'preacher-curl': 'Preacher Curl',
  'incline-dumbbell-curl': 'Incline Dumbbell Curl',
  'incline-hammer-curl': 'Incline Hammer Curl',
  'squat': 'Squat',
  'barbell-squat': 'Barbell Squat',
  'lunge': 'Lunge',
  'glute-bridge': 'Glute Bridge',
  'jump-squat': 'Jump Squat',
  'single-leg-squat': 'Pistol Squat',
  'calf-raise': 'Calf Raise',
  'bulgarian-split-squat': 'Bulgarian Split Squat',
  'leg-press': 'Leg Press',
  'leg-extension': 'Leg Extension',
  'leg-curl': 'Leg Curl',
  'hack-squat': 'Hack Squat',
  'barbell-hip-thrust': 'Hip Thrust',
  'step-up': 'Step-Up',
  'box-jump': 'Box Jump',
  'plank': 'Plank',
  'hollow-body': 'Hollow Body Hold',
  'crunch': 'Crunch',
  'mountain-climber': 'Mountain Climber',
  'leg-raise': 'Leg Raise',
  'russian-twist': 'Russian Twist',
  'burpee': 'Burpee',
  'pose-front-double-biceps': 'Front Double Biceps',
  'pose-front-lat-spread': 'Front Lat Spread',
  'pose-side-chest': 'Side Chest',
  'pose-back-double-biceps': 'Back Double Biceps',
  'pose-back-lat-spread': 'Back Lat Spread',
  'pose-side-triceps': 'Side Triceps',
  'pose-abs-thighs': 'Abdominals & Thighs',
  'pose-most-muscular': 'Most Muscular / Crab',
  'pose-mp-front': "Men's Physique Front",
  'pose-mp-back': "Men's Physique Back",
  'pose-mp-side': "Men's Physique Side",
};

// ─── CSS vars for theme support ───────────────────────────────────────────
const B  = 'var(--text-1,#e0e0e0)';
const BD = 'var(--text-3,#555)';
const AC = 'var(--accent,#C8FF00)';
const GR = 'var(--border,rgba(255,255,255,0.1))';

// ─── SVG Fallback primitives ──────────────────────────────────────────────
const Gnd = ({ y = 108 }) => (
  <line x1="8" y1={y} x2="92" y2={y} stroke={GR} strokeWidth="1.5" strokeLinecap="round"/>
);
const PullBar = ({ y = 8 }) => (
  <rect x="16" y={y} width="68" height="5" rx="2.5" fill={BD} opacity="0.65"/>
);
const DB = ({ x, y }) => (
  <g fill={BD} opacity="0.6">
    <rect x={x - 11} y={y - 2} width="22" height="4" rx="2"/>
    <ellipse cx={x - 11} cy={y} rx="4" ry="5"/>
    <ellipse cx={x + 11} cy={y} rx="4" ry="5"/>
  </g>
);
const BB = ({ x, y, w = 60 }) => (
  <g fill={BD} opacity="0.6">
    <rect x={x} y={y - 2} width={w} height="4" rx="2"/>
    <rect x={x - 2} y={y - 7} width="6" height="14" rx="2"/>
    <rect x={x + w - 4} y={y - 7} width="6" height="14" rx="2"/>
  </g>
);
const Bench = ({ y = 76 }) => (
  <g fill={BD} opacity="0.45">
    <rect x="12" y={y} width="76" height="9" rx="4"/>
    <rect x="18" y={y + 9} width="5" height="14" rx="2"/>
    <rect x="77" y={y + 9} width="5" height="14" rx="2"/>
  </g>
);
const Box = ({ x = 28, y = 84, w = 44, h = 26 }) => (
  <rect x={x} y={y} width={w} height={h} rx="3" fill={BD} opacity="0.35"/>
);

// Reusable stick-figure parts for fallback SVGs
const Head = ({ cx, cy, r = 7 }) => (
  <circle cx={cx} cy={cy} r={r} fill={B} stroke="none"/>
);
const Body = ({ x1, y1, x2, y2, w = 3.5 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={B} strokeWidth={w} strokeLinecap="round"/>
);
const Limb = ({ x1, y1, x2, y2, accent = false }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={accent ? AC : B} strokeWidth="3" strokeLinecap="round"/>
);

// ─── SVG Fallback animations per exercise ────────────────────────────────
// These display while GIF hasn't been added yet.
// Each uses CSS @keyframes inside a <style> tag with transform-box:fill-box
// so transform-origin works correctly relative to each element.

function FallbackSVG({ id }) {
  const styleId = `anim_${id.replace(/-/g, '_')}`;

  // ── Category detector ──
  const isPose = id.startsWith('pose-');

  // ── Pull-bar exercises ──
  const pullBarExercises = ['pullup', 'chinup', 'dead-hang', 'bodyweight-row'];

  // ── Bench exercises ──
  const benchExercises = [
    'barbell-bench-press', 'dumbbell-fly', 'incline-dumbbell-press',
    'skull-crusher', 'bench-dip', 'bulgarian-split-squat',
    'incline-dumbbell-curl', 'incline-hammer-curl', 'barbell-hip-thrust',
  ];

  // ── Box exercises ──
  const boxExercises = ['box-jump', 'step-up', 'decline-pushup'];

  if (isPose) return <PoseFallback id={id} styleId={styleId}/>;
  if (pullBarExercises.includes(id)) return <PullBarFallback id={id} styleId={styleId}/>;
  if (benchExercises.includes(id)) return <BenchFallback id={id} styleId={styleId}/>;
  if (boxExercises.includes(id)) return <BoxFallback id={id} styleId={styleId}/>;

  // Default: standing figure with appropriate animation
  return <StandingFallback id={id} styleId={styleId}/>;
}

// ── Pose fallback ──
function PoseFallback({ id, styleId }) {
  return (
    <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .${styleId}_body { animation: ${styleId}_flex 2s ease-in-out infinite alternate; }
        @keyframes ${styleId}_flex { from { opacity:0.8; } to { opacity:1; } }
      `}</style>
      <g className={`${styleId}_body`}>
        {/* Head */}
        <circle cx="50" cy="18" r="7" fill={B}/>
        {/* Torso */}
        <line x1="50" y1="25" x2="50" y2="60" stroke={B} strokeWidth="4" strokeLinecap="round"/>
        {/* Pose-specific arms/legs based on id */}
        {id === 'pose-front-double-biceps' && <>
          {/* Arms up in W shape */}
          <line x1="50" y1="32" x2="28" y2="42" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="28" y1="42" x2="24" y2="30" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="32" x2="72" y2="42" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="72" y1="42" x2="76" y2="30" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          {/* Legs */}
          <line x1="50" y1="60" x2="42" y2="85" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="42" y1="85" x2="40" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="60" x2="58" y2="85" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="58" y1="85" x2="62" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        </>}
        {id === 'pose-most-muscular' && <>
          {/* Crab pose — elbows down and in */}
          <line x1="50" y1="32" x2="32" y2="45" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="32" y1="45" x2="42" y2="58" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="32" x2="68" y2="45" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="68" y1="45" x2="58" y2="58" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          {/* Trap elevation */}
          <line x1="44" y1="26" x2="38" y2="22" stroke={AC} strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="56" y1="26" x2="62" y2="22" stroke={AC} strokeWidth="2.5" strokeLinecap="round"/>
          {/* Legs */}
          <line x1="50" y1="60" x2="42" y2="85" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="42" y1="85" x2="40" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="60" x2="58" y2="85" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="58" y1="85" x2="62" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        </>}
        {/* Generic pose for others */}
        {!['pose-front-double-biceps','pose-most-muscular'].includes(id) && <>
          <line x1="50" y1="32" x2="28" y2="48" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="28" y1="48" x2="22" y2="60" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="32" x2="72" y2="48" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="72" y1="48" x2="78" y2="60" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="60" x2="42" y2="85" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="42" y1="85" x2="40" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="60" x2="58" y2="85" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="58" y1="85" x2="62" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        </>}
      </g>
      <Gnd/>
    </svg>
  );
}

// ── Pull-bar fallback (pull-up, chin-up, dead-hang, bodyweight-row) ──
function PullBarFallback({ id, styleId }) {
  const isDead = id === 'dead-hang';
  const isRow  = id === 'bodyweight-row';
  return (
    <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .${styleId}_fig {
          animation: ${styleId}_pull ${isDead ? '3s' : '1.8s'} ease-in-out infinite ${isDead ? 'alternate' : ''};
          transform-origin: 50px ${isDead ? '18px' : '14px'};
          transform-box: fill-box;
        }
        @keyframes ${styleId}_pull {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(${isDead ? '2px' : isRow ? '0px' : '-18px'}); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      <PullBar y={isRow ? 38 : 8}/>
      <g className={`${styleId}_fig`}>
        {isRow ? (
          // Bodyweight row — body diagonal under bar
          <>
            <circle cx="50" cy="52" r="6" fill={B}/>
            <line x1="50" y1="58" x2="50" y2="80" stroke={B} strokeWidth="4" strokeLinecap="round"/>
            <line x1="50" y1="62" x2="34" y2="70" stroke={B} strokeWidth="3" strokeLinecap="round"/>
            <line x1="34" y1="70" x2="30" y2="60" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="62" x2="66" y2="70" stroke={B} strokeWidth="3" strokeLinecap="round"/>
            <line x1="66" y1="70" x2="70" y2="60" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="80" x2="42" y2="100" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="50" y1="80" x2="60" y2="100" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          </>
        ) : (
          // Hanging figure
          <>
            <circle cx="50" cy="22" r="7" fill={B}/>
            <line x1="50" y1="29" x2="50" y2="62" stroke={B} strokeWidth="4" strokeLinecap="round"/>
            {/* Arms up to bar */}
            <line x1="50" y1="36" x2="34" y2="18" stroke={B} strokeWidth="3" strokeLinecap="round"/>
            <line x1="34" y1="18" x2="30" y2="13" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="36" x2="66" y2="18" stroke={B} strokeWidth="3" strokeLinecap="round"/>
            <line x1="66" y1="18" x2="70" y2="13" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
            {/* Legs hanging */}
            <line x1="50" y1="62" x2="44" y2="88" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="44" y1="88" x2="42" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="62" x2="56" y2="88" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="56" y1="88" x2="58" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          </>
        )}
      </g>
    </svg>
  );
}

// ── Bench fallback ──
function BenchFallback({ id, styleId }) {
  const isIncline = ['incline-dumbbell-press','incline-dumbbell-curl','incline-hammer-curl'].includes(id);
  const isHipThrust = id === 'barbell-hip-thrust';
  return (
    <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .${styleId}_arms {
          animation: ${styleId}_press 1.8s ease-in-out infinite alternate;
          transform-origin: 50% 100%;
          transform-box: fill-box;
        }
        @keyframes ${styleId}_press {
          from { transform: scaleY(0.7); }
          to   { transform: scaleY(1); }
        }
        .${styleId}_hips {
          animation: ${styleId}_thrust 1.6s ease-in-out infinite alternate;
          transform-box: fill-box;
        }
        @keyframes ${styleId}_thrust {
          from { transform: translateY(8px); }
          to   { transform: translateY(0px); }
        }
      `}</style>
      <Bench y={isHipThrust ? 60 : 72}/>
      {isHipThrust ? (
        // Hip thrust — upper back on bench, hips drive up
        <>
          <circle cx="50" cy="52" r="6" fill={B}/>
          <line x1="50" y1="58" x2="50" y2="68" stroke={B} strokeWidth="4" strokeLinecap="round"/>
          <g className={`${styleId}_hips`}>
            <line x1="50" y1="68" x2="36" y2="80" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="36" y1="80" x2="32" y2="100" stroke={B} strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="68" x2="64" y2="80" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="64" y1="80" x2="68" y2="100" stroke={B} strokeWidth="3" strokeLinecap="round"/>
            <BB x={28} y={65} w={44}/>
          </g>
        </>
      ) : (
        // Lying down on bench
        <>
          <circle cx="50" cy="60" r="6" fill={B}/>
          <line x1="50" y1="66" x2="50" y2="84" stroke={B} strokeWidth="4" strokeLinecap="round"/>
          {/* Legs off bench */}
          <line x1="50" y1="80" x2="38" y2="95" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="38" y1="95" x2="36" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="80" x2="62" y2="95" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="62" y1="95" x2="64" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          {/* Arms pressing */}
          <g className={`${styleId}_arms`}>
            <line x1="50" y1="70" x2="30" y2="60" stroke={B} strokeWidth="3" strokeLinecap="round"/>
            <line x1="30" y1="60" x2="28" y2="48" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
            <line x1="50" y1="70" x2="70" y2="60" stroke={B} strokeWidth="3" strokeLinecap="round"/>
            <line x1="70" y1="60" x2="72" y2="48" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          </g>
        </>
      )}
    </svg>
  );
}

// ── Box fallback (box jump, step-up, decline pushup) ──
function BoxFallback({ id, styleId }) {
  return (
    <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .${styleId}_fig {
          animation: ${styleId}_jump 1.8s ease-in-out infinite;
          transform-box: fill-box;
        }
        @keyframes ${styleId}_jump {
          0%   { transform: translateY(0px); }
          40%  { transform: translateY(-20px); }
          60%  { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      <Box x={30} y={80} w={40} h={28}/>
      <Gnd/>
      <g className={`${styleId}_fig`}>
        <circle cx="50" cy="22" r="7" fill={B}/>
        <line x1="50" y1="29" x2="50" y2="58" stroke={B} strokeWidth="4" strokeLinecap="round"/>
        <line x1="50" y1="36" x2="34" y2="50" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        <line x1="34" y1="50" x2="30" y2="62" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        <line x1="50" y1="36" x2="66" y2="50" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        <line x1="66" y1="50" x2="70" y2="62" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        <line x1="50" y1="58" x2="42" y2="76" stroke={AC} strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="42" y1="76" x2="40" y2="92" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
        <line x1="50" y1="58" x2="58" y2="76" stroke={AC} strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="58" y1="76" x2="60" y2="92" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

// ── Standing figure fallback (covers most exercises) ──
function StandingFallback({ id, styleId }) {
  // Determine animation style based on exercise type
  const isSquat     = ['squat','barbell-squat','lunge','bulgarian-split-squat','hack-squat','leg-press','leg-extension','leg-curl','single-leg-squat'].includes(id);
  const isCurl      = ['dumbbell-curl','hammer-curl','concentration-curl','barbell-curl','cable-curl','preacher-curl'].includes(id);
  const isPress     = ['overhead-press','arnold-press','dumbbell-shoulder-press'].includes(id);
  const isRaise     = ['lateral-raise','front-raise','upright-row'].includes(id);
  const isDeadlift  = ['barbell-deadlift','romanian-deadlift','good-morning','barbell-row','t-bar-row','reverse-fly'].includes(id);
  const isCore      = ['plank','hollow-body','crunch','mountain-climber','leg-raise','russian-twist'].includes(id);
  const isPush      = ['pushup','incline-pushup','diamond-pushup','wide-pushup','pike-pushup'].includes(id);
  const isDip       = ['dip','bench-dip'].includes(id);
  const isTricep    = ['tricep-extension','skull-crusher','tricep-pushdown','cable-kickback'].includes(id);
  const isJump      = ['jump-squat','burpee'].includes(id);
  const isCalfGlute = ['calf-raise','glute-bridge','barbell-hip-thrust'].includes(id);
  const isSuperman  = id === 'superman';

  // Animation keyframes
  let animCss = '';
  let animClass = `${styleId}_anim`;

  if (isSquat) {
    animCss = `
      .${animClass} { animation: ${styleId}_squat 1.8s ease-in-out infinite alternate; transform-box: fill-box; }
      @keyframes ${styleId}_squat { from { transform: scaleY(1); } to { transform: scaleY(0.75) translateY(12px); } }
    `;
  } else if (isCurl) {
    animCss = `
      .${animClass} { animation: ${styleId}_curl 1.6s ease-in-out infinite alternate; transform-origin: 0% 100%; transform-box: fill-box; }
      @keyframes ${styleId}_curl { from { transform: rotate(0deg); } to { transform: rotate(-110deg); } }
    `;
  } else if (isPress) {
    animCss = `
      .${animClass} { animation: ${styleId}_press 1.8s ease-in-out infinite alternate; transform-origin: 50% 100%; transform-box: fill-box; }
      @keyframes ${styleId}_press { from { transform: scaleY(0.6); } to { transform: scaleY(1); } }
    `;
  } else if (isRaise) {
    animCss = `
      .${animClass} { animation: ${styleId}_raise 1.6s ease-in-out infinite alternate; transform-origin: 50% 0%; transform-box: fill-box; }
      @keyframes ${styleId}_raise { from { transform: rotate(0deg); } to { transform: rotate(-80deg); } }
    `;
  } else if (isDeadlift) {
    animCss = `
      .${animClass} { animation: ${styleId}_hinge 2s ease-in-out infinite alternate; transform-origin: 50% 100%; transform-box: fill-box; }
      @keyframes ${styleId}_hinge { from { transform: rotate(0deg); } to { transform: rotate(55deg); } }
    `;
  } else if (isJump) {
    animCss = `
      .${animClass} { animation: ${styleId}_jump 1.6s ease-in-out infinite; transform-box: fill-box; }
      @keyframes ${styleId}_jump {
        0%  { transform: translateY(0); }
        35% { transform: translateY(-22px); }
        65% { transform: translateY(-22px); }
        100%{ transform: translateY(0); }
      }
    `;
  } else if (isCalfGlute) {
    animCss = `
      .${animClass} { animation: ${styleId}_rise 1.4s ease-in-out infinite alternate; transform-box: fill-box; }
      @keyframes ${styleId}_rise { from { transform: translateY(0); } to { transform: translateY(-8px); } }
    `;
  } else {
    // Default: gentle bob
    animCss = `
      .${animClass} { animation: ${styleId}_bob 2s ease-in-out infinite alternate; transform-box: fill-box; }
      @keyframes ${styleId}_bob { from { transform: translateY(0); } to { transform: translateY(-6px); } }
    `;
  }

  if (isCore || isPush) {
    // Horizontal figure (lying/plank)
    return (
      <svg viewBox="0 0 120 80" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
        <style>{`
          .${animClass} { animation: ${styleId}_core 1.8s ease-in-out infinite alternate; transform-box: fill-box; }
          @keyframes ${styleId}_core { from { transform: translateY(0); } to { transform: translateY(-10px); } }
        `}</style>
        <line x1="8" y1="68" x2="112" y2="68" stroke={GR} strokeWidth="1.5" strokeLinecap="round"/>
        <g className={animClass}>
          {/* Horizontal plank figure */}
          <circle cx="22" cy="42" r="6" fill={B}/>
          <line x1="28" y1="44" x2="72" y2="52" stroke={B} strokeWidth="4" strokeLinecap="round"/>
          {/* Arms */}
          <line x1="36" y1="47" x2="22" y2="62" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          <line x1="48" y1="49" x2="50" y2="64" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          {/* Legs */}
          <line x1="72" y1="52" x2="88" y2="56" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="88" y1="56" x2="102" y2="60" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        </g>
      </svg>
    );
  }

  if (isSuperman) {
    return (
      <svg viewBox="0 0 120 80" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
        <style>{`
          .${animClass} { animation: ${styleId}_sup 2s ease-in-out infinite alternate; transform-box: fill-box; }
          @keyframes ${styleId}_sup { from { transform: translateY(0); } to { transform: translateY(-14px); } }
        `}</style>
        <line x1="8" y1="68" x2="112" y2="68" stroke={GR} strokeWidth="1.5" strokeLinecap="round"/>
        <g className={animClass}>
          <circle cx="22" cy="52" r="6" fill={B}/>
          <line x1="28" y1="54" x2="72" y2="56" stroke={B} strokeWidth="4" strokeLinecap="round"/>
          <line x1="22" y1="50" x2="10" y2="44" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          <line x1="72" y1="56" x2="98" y2="50" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
        </g>
      </svg>
    );
  }

  if (isDip) {
    return (
      <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
        <style>{`
          .${animClass} { animation: ${styleId}_dip 1.6s ease-in-out infinite alternate; transform-box: fill-box; }
          @keyframes ${styleId}_dip { from { transform: translateY(0); } to { transform: translateY(16px); } }
        `}</style>
        {/* Parallel bars */}
        <line x1="20" y1="42" x2="20" y2="80" stroke={BD} strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <line x1="80" y1="42" x2="80" y2="80" stroke={BD} strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
        <line x1="14" y1="42" x2="86" y2="42" stroke={BD} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
        <g className={animClass}>
          <circle cx="50" cy="22" r="7" fill={B}/>
          <line x1="50" y1="29" x2="50" y2="54" stroke={B} strokeWidth="4" strokeLinecap="round"/>
          <line x1="50" y1="36" x2="20" y2="42" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="36" x2="80" y2="42" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="54" x2="42" y2="76" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="42" y1="76" x2="40" y2="92" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="54" x2="58" y2="76" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="58" y1="76" x2="60" y2="92" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        </g>
        <Gnd/>
      </svg>
    );
  }

  // Default standing figure
  return (
    <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <style>{animCss}</style>
      <Gnd/>
      {isDeadlift ? (
        <g>
          {/* Hip-hinged figure for deadlifts/rows */}
          <g className={animClass} style={{ transformOrigin: '50px 60px' }}>
            <circle cx="50" cy="42" r="7" fill={B}/>
            <line x1="50" y1="49" x2="50" y2="72" stroke={B} strokeWidth="4" strokeLinecap="round"/>
          </g>
          <line x1="50" y1="72" x2="38" y2="92" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="38" y1="92" x2="36" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="72" x2="62" y2="92" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="62" y1="92" x2="64" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <BB x={22} y={105} w={56}/>
        </g>
      ) : (
        <g className={animClass}>
          {/* Head */}
          <circle cx="50" cy="18" r="7" fill={B}/>
          {/* Torso */}
          <line x1="50" y1="25" x2="50" y2="62" stroke={B} strokeWidth="4" strokeLinecap="round"/>
          {/* Arms */}
          {isCurl ? (
            <>
              <line x1="50" y1="34" x2="32" y2="50" stroke={B} strokeWidth="3" strokeLinecap="round"/>
              <line x1="32" y1="50" x2="36" y2="36" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
              <line x1="50" y1="34" x2="68" y2="50" stroke={B} strokeWidth="3" strokeLinecap="round"/>
              <line x1="68" y1="50" x2="64" y2="36" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
              <DB x={36} y={32}/>
              <DB x={64} y={32}/>
            </>
          ) : isPress ? (
            <>
              <line x1="50" y1="34" x2="30" y2="44" stroke={B} strokeWidth="3" strokeLinecap="round"/>
              <line x1="30" y1="44" x2="28" y2="22" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
              <line x1="50" y1="34" x2="70" y2="44" stroke={B} strokeWidth="3" strokeLinecap="round"/>
              <line x1="70" y1="44" x2="72" y2="22" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
              <BB x={22} y={20} w={56}/>
            </>
          ) : isRaise ? (
            <>
              <line x1="50" y1="36" x2="24" y2="44" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
              <line x1="50" y1="36" x2="76" y2="44" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
              <DB x={20} y={44}/>
              <DB x={80} y={44}/>
            </>
          ) : (
            <>
              <line x1="50" y1="34" x2="30" y2="52" stroke={B} strokeWidth="3" strokeLinecap="round"/>
              <line x1="30" y1="52" x2="26" y2="66" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
              <line x1="50" y1="34" x2="70" y2="52" stroke={B} strokeWidth="3" strokeLinecap="round"/>
              <line x1="70" y1="52" x2="74" y2="66" stroke={AC} strokeWidth="3" strokeLinecap="round"/>
            </>
          )}
          {/* Legs */}
          <line x1="50" y1="62" x2="40" y2="86" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="40" y1="86" x2="38" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
          <line x1="50" y1="62" x2="60" y2="86" stroke={B} strokeWidth="3.5" strokeLinecap="round"/>
          <line x1="60" y1="86" x2="62" y2="108" stroke={B} strokeWidth="3" strokeLinecap="round"/>
        </g>
      )}
    </svg>
  );
}

// ─── GIF Loader with error → SVG fallback ────────────────────────────────
function GifLoader({ id, size }) {
  const [failed, setFailed] = useState(false);
  const src = `/exercise-gifs/${id}.gif`;

  if (failed) {
    return <FallbackSVG id={id}/>;
  }

  return (
    <img
      src={src}
      alt={EXERCISE_LABELS[id] || id}
      onError={() => setFailed(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}

// ─── "GIF Coming Soon" overlay badge ─────────────────────────────────────
function ComingSoonBadge() {
  return (
    <div style={{
      position: 'absolute',
      bottom: 4,
      right: 4,
      background: 'rgba(0,0,0,0.55)',
      color: 'var(--accent,#C8FF00)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.04em',
      padding: '2px 5px',
      borderRadius: 4,
      pointerEvents: 'none',
      lineHeight: 1.4,
    }}>
      SVG
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────
/**
 * ExerciseGif
 *
 * Props:
 *   id       — exercise/pose id string, e.g. "pushup", "barbell-squat", "pose-front-double-biceps"
 *   size     — pixel size (number). Default 80. Component is always square.
 *   showBadge — show "SVG" badge when GIF hasn't loaded. Default false.
 *   className — extra className on wrapper div
 *   style     — extra style on wrapper div
 */
export default function ExerciseGif({ id, exerciseId, size = 80, showBadge = false, className = '', style = {} }) {
  // Support both `id` and `exerciseId` prop names for backwards compatibility
  const resolvedId = id || exerciseId || 'pushup';
  const [gifFailed, setGifFailed] = useState(false);
  const src = `/exercise-gifs/${resolvedId}.gif`;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
        flexShrink: 0,
        borderRadius: 8,
        overflow: 'hidden',
        background: 'var(--bg-2, #111)',
        ...style,
      }}
    >
      {gifFailed ? (
        <>
          <FallbackSVG id={resolvedId}/>
          {showBadge && <ComingSoonBadge/>}
        </>
      ) : (
        <img
          src={src}
          alt={EXERCISE_LABELS[resolvedId] || resolvedId}
          onError={() => setGifFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      )}
    </div>
  );
}

// ─── Named export for direct SVG fallback (used in pose pages) ───────────
export { FallbackSVG };
