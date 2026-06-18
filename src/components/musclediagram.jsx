import React from 'react';

/**
 * MuscleDiagram — shows BOTH front AND back body views side by side.
 * Primary muscles highlighted in accent (#C8FF00).
 * Secondary muscles highlighted in orange.
 * Works for ALL exercises — back muscles (triceps, lats, traps, etc.)
 * now always visible because both views are always shown.
 */

// ── Front body muscle paths (viewBox 0 0 100 200) ─────────────────────────
const FRONT = {
  chest: {
    label: 'Chest',
    paths: [
      'M29 56 C32 50 43 48 47 52 C49 55 49 61 47 65 C43 68 34 68 30 63 Z',
      'M71 56 C68 50 57 48 53 52 C51 55 51 61 53 65 C57 68 66 68 70 63 Z',
    ]
  },
  shoulders: {
    label: 'Shoulders',
    paths: [
      'M24 52 C19 48 17 42 20 38 C23 35 30 36 32 42 C34 47 30 53 24 52 Z',
      'M76 52 C81 48 83 42 80 38 C77 35 70 36 68 42 C66 47 70 53 76 52 Z',
    ]
  },
  'front-delts': {
    label: 'Front Delts',
    paths: [
      'M24 52 C19 48 17 42 20 38 C23 35 30 36 32 42 Z',
      'M76 52 C81 48 83 42 80 38 C77 35 70 36 68 42 Z',
    ]
  },
  'side-delts': {
    label: 'Side Delts',
    paths: [
      'M20 44 C15 43 13 51 17 56 C20 59 25 57 25 51 Z',
      'M80 44 C85 43 87 51 83 56 C80 59 75 57 75 51 Z',
    ]
  },
  biceps: {
    label: 'Biceps',
    paths: [
      'M21 63 C17 60 15 67 17 75 C19 82 25 83 28 78 C30 72 26 65 21 63 Z',
      'M79 63 C83 60 85 67 83 75 C81 82 75 83 72 78 C70 72 74 65 79 63 Z',
    ]
  },
  forearms: {
    label: 'Forearms',
    paths: [
      'M17 84 C14 80 12 88 14 98 C16 105 21 105 23 98 C25 91 21 86 17 84 Z',
      'M83 84 C86 80 88 88 86 98 C84 105 79 105 77 98 C75 91 79 86 83 84 Z',
    ]
  },
  abs: {
    label: 'Abs',
    paths: [
      'M38 68 C36 68 34 75 34 82 C34 89 36 93 38 93 L46 93 L46 68 Z',
      'M62 68 C64 68 66 75 66 82 C66 89 64 93 62 93 L54 93 L54 68 Z',
    ]
  },
  obliques: {
    label: 'Obliques',
    paths: [
      'M29 74 C25 74 23 81 25 91 C27 98 32 100 35 95 C37 88 33 76 29 74 Z',
      'M71 74 C75 74 77 81 75 91 C73 98 68 100 65 95 C63 88 67 76 71 74 Z',
    ]
  },
  quads: {
    label: 'Quads',
    paths: [
      'M32 108 C27 105 24 113 25 127 C27 138 33 140 38 135 C41 130 39 115 32 108 Z',
      'M37 108 C40 107 43 114 43 128 C43 137 40 139 37 134 Z',
      'M68 108 C73 105 76 113 75 127 C73 138 67 140 62 135 C59 130 61 115 68 108 Z',
      'M63 108 C60 107 57 114 57 128 C57 137 60 139 63 134 Z',
    ]
  },
  calves: {
    label: 'Calves',
    paths: [
      'M31 162 C27 158 25 167 27 177 C29 184 34 184 36 177 C38 170 35 164 31 162 Z',
      'M69 162 C73 158 75 167 73 177 C71 184 66 184 64 177 C62 170 65 164 69 162 Z',
    ]
  },
  'hip-flexors': {
    label: 'Hip Flexors',
    paths: [
      'M37 94 C34 91 32 98 34 103 C36 108 41 108 42 103 Z',
      'M63 94 C66 91 68 98 66 103 C64 108 59 108 58 103 Z',
    ]
  },
};

// ── Back body muscle paths ─────────────────────────────────────────────────
const BACK = {
  lats: {
    label: 'Lats',
    paths: [
      'M26 60 C21 56 17 63 19 75 C21 86 28 91 35 86 C40 81 38 67 26 60 Z',
      'M74 60 C79 56 83 63 81 75 C79 86 72 91 65 86 C60 81 62 67 74 60 Z',
    ]
  },
  traps: {
    label: 'Traps',
    paths: [
      'M38 40 C32 37 27 42 29 51 C31 57 37 59 42 54 C45 49 43 42 38 40 Z',
      'M62 40 C68 37 73 42 71 51 C69 57 63 59 58 54 C55 49 57 42 62 40 Z',
      'M44 38 C40 33 44 30 50 30 C56 30 60 33 56 38 Z',
    ]
  },
  rhomboids: {
    label: 'Rhomboids',
    paths: [
      'M39 57 C35 54 33 60 35 67 C37 72 42 72 44 67 C45 62 42 58 39 57 Z',
      'M61 57 C65 54 67 60 65 67 C63 72 58 72 56 67 C55 62 58 58 61 57 Z',
    ]
  },
  'lower-back': {
    label: 'Lower Back',
    paths: [
      'M37 86 C32 83 30 91 32 100 C34 106 41 106 44 100 C46 93 42 87 37 86 Z',
      'M63 86 C68 83 70 91 68 100 C66 106 59 106 56 100 C54 93 58 87 63 86 Z',
    ]
  },
  glutes: {
    label: 'Glutes',
    paths: [
      'M30 105 C23 102 20 112 23 122 C26 130 37 131 42 124 C45 117 38 107 30 105 Z',
      'M70 105 C77 102 80 112 77 122 C74 130 63 131 58 124 C55 117 62 107 70 105 Z',
    ]
  },
  hamstrings: {
    label: 'Hamstrings',
    paths: [
      'M28 132 C23 129 21 139 23 150 C25 158 32 160 37 154 C40 147 37 134 28 132 Z',
      'M72 132 C77 129 79 139 77 150 C75 158 68 160 63 154 C60 147 63 134 72 132 Z',
    ]
  },
  'rear-delts': {
    label: 'Rear Delts',
    paths: [
      'M22 52 C17 47 15 42 20 38 C23 36 28 40 28 47 Z',
      'M78 52 C83 47 85 42 80 38 C77 36 72 40 72 47 Z',
    ]
  },
  triceps: {
    label: 'Triceps',
    paths: [
      'M20 64 C15 60 13 69 15 79 C17 86 24 87 27 80 C29 73 25 66 20 64 Z',
      'M80 64 C85 60 87 69 85 79 C83 86 76 87 73 80 C71 73 75 66 80 64 Z',
    ]
  },
  calves: {
    label: 'Calves (back)',
    paths: [
      'M31 162 C27 158 25 167 27 177 C29 184 34 184 36 177 C38 170 35 164 31 162 Z',
      'M69 162 C73 158 75 167 73 177 C71 184 66 184 64 177 C62 170 65 164 69 162 Z',
    ]
  },
};

// ── Which muscles appear in which view ────────────────────────────────────
const FRONT_MUSCLE_IDS = new Set(Object.keys(FRONT));
const BACK_MUSCLE_IDS  = new Set(Object.keys(BACK));

// ── Normalize muscle names from exercises.js → diagram IDs ────────────────
const MUSCLE_MAP = {
  chest: 'chest', pectorals: 'chest', 'upper-chest': 'chest', 'inner-chest': 'chest',
  triceps: 'triceps', 'long-head': 'triceps', 'lateral-head': 'triceps',
  shoulders: 'shoulders', 'all-delts': 'shoulders',
  'front-delts': 'front-delts',
  'side-delts': 'side-delts',
  'rear-delts': 'rear-delts',
  biceps: 'biceps', brachialis: 'biceps',
  forearms: 'forearms', grip: 'forearms',
  lats: 'lats',
  traps: 'traps',
  rhomboids: 'rhomboids',
  'lower-back': 'lower-back',
  abs: 'abs', core: 'abs', 'lower-abs': 'abs',
  obliques: 'obliques',
  'hip-flexors': 'hip-flexors',
  quads: 'quads',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  calves: 'calves', soleus: 'calves',
  'full-body': null,
  balance: null, cardio: null,
  'rotator-cuff': 'rear-delts',
  'spine-decompression': 'lower-back',
};

// ── Body silhouette path ───────────────────────────────────────────────────
const SILHOUETTE = "M50 6 C42 6 38 11 38 17 C38 22 41 25 46 27 L43 32 C36 34 28 39 23 46 C19 50 18 57 19 65 L14 84 C13 91 14 100 19 105 C23 110 20 124 21 135 C23 145 28 157 30 167 L32 194 L39 194 L40 163 C42 157 44 150 50 149 C56 150 58 157 60 163 L61 194 L68 194 L70 167 C72 157 77 145 79 135 C80 124 77 110 81 105 C86 100 87 91 86 84 L81 65 C82 57 81 50 77 46 C72 39 64 34 57 32 L54 27 C59 25 62 22 62 17 C62 11 58 6 50 6 Z";

function Silhouette() {
  return (
    <path d={SILHOUETTE}
      fill="rgba(255,255,255,0.05)"
      stroke="rgba(255,255,255,0.15)"
      strokeWidth="0.8"
    />
  );
}

// ── Single view SVG ────────────────────────────────────────────────────────
function BodyView({ label, muscleSet, primaryIds, secondaryIds, size }) {
  const w = size;
  const h = size * 2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <svg width={w} height={h} viewBox="0 0 100 200" style={{ display: 'block', overflow: 'visible' }}>
        <Silhouette />

        {/* Secondary muscles — orange glow */}
        {secondaryIds.map(id => {
          const g = muscleSet[id];
          if (!g) return null;
          return g.paths.map((p, i) => (
            <path key={`${id}-s-${i}`} d={p}
              fill="rgba(255,149,0,0.40)"
              stroke="rgba(255,149,0,0.75)"
              strokeWidth="0.7"
            />
          ));
        })}

        {/* Primary muscles — lime glow + pulse */}
        {primaryIds.map(id => {
          const g = muscleSet[id];
          if (!g) return null;
          return g.paths.map((p, i) => (
            <path key={`${id}-p-${i}`} d={p}
              fill="rgba(200,255,0,0.55)"
              stroke="rgba(200,255,0,0.95)"
              strokeWidth="0.8"
              style={{ filter: 'drop-shadow(0 0 3px rgba(200,255,0,0.7))', animation: 'pulseMuscle 2s ease-in-out infinite' }}
            />
          ));
        })}

        {/* View label */}
        <text x="50" y="198" textAnchor="middle" fontSize="7"
          fill="rgba(255,255,255,0.28)" fontFamily="Inter,sans-serif" fontWeight="600"
          letterSpacing="1">
          {label}
        </text>
      </svg>
    </div>
  );
}

// ── Main exported component ────────────────────────────────────────────────
export default function MuscleDiagram({ muscles = [], exerciseId, size = 80 }) {
  // Map all muscle names to diagram IDs
  const allIds   = muscles.map(m => MUSCLE_MAP[m]).filter(Boolean);
  const primIds  = muscles.slice(0, 2).map(m => MUSCLE_MAP[m]).filter(Boolean);
  const secIds   = muscles.slice(2).map(m => MUSCLE_MAP[m]).filter(Boolean);

  // Split into front-view and back-view IDs
  const frontPrim = primIds.filter(id => FRONT_MUSCLE_IDS.has(id));
  const frontSec  = secIds.filter(id => FRONT_MUSCLE_IDS.has(id));
  const backPrim  = primIds.filter(id => BACK_MUSCLE_IDS.has(id));
  const backSec   = secIds.filter(id => BACK_MUSCLE_IDS.has(id));

  // Only show back view if there are back muscles to highlight
  const hasBackMuscles = backPrim.length > 0 || backSec.length > 0;
  const hasFrontMuscles = frontPrim.length > 0 || frontSec.length > 0;

  // If exercise only has back muscles (e.g. pure lat exercise), still show front dimly
  const viewSize = hasBackMuscles && hasFrontMuscles ? size * 0.85 : size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: hasBackMuscles ? 8 : 0, alignItems: 'flex-end' }}>
        {/* Front view — always shown */}
        <BodyView
          label="FRONT"
          muscleSet={FRONT}
          primaryIds={frontPrim}
          secondaryIds={frontSec}
          size={viewSize}
        />

        {/* Back view — only shown when there are back muscles */}
        {hasBackMuscles && (
          <BodyView
            label="BACK"
            muscleSet={BACK}
            primaryIds={backPrim}
            secondaryIds={backSec}
            size={viewSize}
          />
        )}
      </div>

      <style>{`
        @keyframes pulseMuscle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
      `}</style>
    </div>
  );
}

// ── MuscleList — labels with colored dots ─────────────────────────────────
export function MuscleList({ muscles = [] }) {
  if (!muscles.length) return null;
  const primary   = muscles.slice(0, 2);
  const secondary = muscles.slice(2, 5);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {primary.map(m => (
        <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 5px rgba(200,255,0,0.6)', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-0)', textTransform: 'capitalize' }}>
            {m.replace(/-/g, ' ')}
          </span>
        </div>
      ))}
      {secondary.map(m => (
        <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)', opacity: 0.8, flexShrink: 0 }} />
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'capitalize' }}>
            {m.replace(/-/g, ' ')}
          </span>
        </div>
      ))}
    </div>
  );
}
