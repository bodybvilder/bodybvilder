import React from 'react';

/**
 * MuscleMap — SVG body diagram with highlighted muscles
 * Shows primary (bright) and secondary (dim) muscle groups
 * Front and back view based on exercise
 */

// Muscle group → SVG path data (simplified anatomical shapes)
// Viewbox: 0 0 120 240 — front body silhouette
const FRONT_MUSCLES = {
  chest: {
    label: 'Chest',
    paths: [
      'M35 68 C38 60 50 58 55 62 C57 65 57 72 55 76 C50 80 40 80 36 75 Z',
      'M85 68 C82 60 70 58 65 62 C63 65 63 72 65 76 C70 80 80 80 84 75 Z',
    ]
  },
  shoulders: {
    label: 'Shoulders',
    paths: [
      'M28 62 C22 58 20 50 24 46 C28 42 36 44 38 50 C40 56 36 62 28 62 Z',
      'M92 62 C98 58 100 50 96 46 C92 42 84 44 82 50 C80 56 84 62 92 62 Z',
    ]
  },
  'front-delts': {
    label: 'Front Delts',
    paths: [
      'M28 62 C22 58 20 50 24 46 C28 42 36 44 38 50 Z',
      'M92 62 C98 58 100 50 96 46 C92 42 84 44 82 50 Z',
    ]
  },
  'side-delts': {
    label: 'Side Delts',
    paths: [
      'M24 52 C18 50 16 60 20 66 C24 70 30 68 30 60 Z',
      'M96 52 C102 50 104 60 100 66 C96 70 90 68 90 60 Z',
    ]
  },
  biceps: {
    label: 'Biceps',
    paths: [
      'M26 76 C22 72 20 80 22 90 C24 98 30 100 34 94 C36 88 32 78 26 76 Z',
      'M94 76 C98 72 100 80 98 90 C96 98 90 100 86 94 C84 88 88 78 94 76 Z',
    ]
  },
  forearms: {
    label: 'Forearms',
    paths: [
      'M22 100 C18 96 16 106 18 118 C20 126 26 126 28 118 C30 110 26 102 22 100 Z',
      'M98 100 C102 96 104 106 102 118 C100 126 94 126 92 118 C90 110 94 102 98 100 Z',
    ]
  },
  abs: {
    label: 'Abs',
    paths: [
      'M45 82 C42 82 40 90 40 98 C40 106 42 110 45 110 L55 110 L55 82 Z',
      'M65 82 C68 82 70 90 70 98 C70 106 68 110 65 110 L55 110 L55 82 Z',
    ]
  },
  obliques: {
    label: 'Obliques',
    paths: [
      'M35 88 C30 88 28 96 30 108 C32 116 38 118 42 112 C44 104 40 90 35 88 Z',
      'M85 88 C90 88 92 96 90 108 C88 116 82 118 78 112 C76 104 80 90 85 88 Z',
    ]
  },
  quads: {
    label: 'Quads',
    paths: [
      'M38 128 C32 124 28 134 30 150 C32 162 40 166 46 160 C50 154 48 136 38 128 Z',
      'M44 128 C48 126 52 136 52 152 C52 162 48 164 44 158 Z',
      'M76 128 C82 124 86 134 90 150 C88 162 80 166 74 160 C70 154 72 136 76 128 Z',
      'M76 128 C72 126 68 136 68 152 C68 162 72 164 76 158 Z',
    ]
  },
  calves: {
    label: 'Calves',
    paths: [
      'M36 192 C32 188 30 198 32 210 C34 218 40 218 42 210 C44 202 40 194 36 192 Z',
      'M84 192 C88 188 90 198 88 210 C86 218 80 218 78 210 C76 202 80 194 84 192 Z',
    ]
  },
  'hip-flexors': {
    label: 'Hip Flexors',
    paths: [
      'M44 112 C40 108 38 116 40 122 C42 128 48 128 50 122 Z',
      'M76 112 C80 108 82 116 80 122 C78 128 72 128 70 122 Z',
    ]
  },
};

const BACK_MUSCLES = {
  lats: {
    label: 'Lats',
    paths: [
      'M30 72 C24 68 20 76 22 90 C24 102 32 108 40 102 C46 96 44 80 30 72 Z',
      'M90 72 C96 68 100 76 98 90 C96 102 88 108 80 102 C74 96 76 80 90 72 Z',
    ]
  },
  traps: {
    label: 'Traps',
    paths: [
      'M45 48 C38 44 32 50 34 60 C36 68 44 70 50 64 C54 58 52 50 45 48 Z',
      'M75 48 C82 44 88 50 86 60 C84 68 76 70 70 64 C66 58 68 50 75 48 Z',
      'M52 46 C48 40 52 36 60 36 C68 36 72 40 68 46 Z',
    ]
  },
  rhomboids: {
    label: 'Rhomboids',
    paths: [
      'M46 68 C42 64 40 72 42 80 C44 86 50 86 52 80 C54 74 50 70 46 68 Z',
      'M74 68 C78 64 80 72 78 80 C76 86 70 86 68 80 C66 74 70 70 74 68 Z',
    ]
  },
  'lower-back': {
    label: 'Lower Back',
    paths: [
      'M44 102 C38 98 36 108 38 118 C40 126 48 126 52 118 C54 110 50 104 44 102 Z',
      'M76 102 C82 98 84 108 82 118 C80 126 72 126 68 118 C66 110 70 104 76 102 Z',
    ]
  },
  glutes: {
    label: 'Glutes',
    paths: [
      'M36 124 C28 120 24 132 28 144 C32 154 44 156 50 148 C54 140 46 126 36 124 Z',
      'M84 124 C92 120 96 132 92 144 C88 154 76 156 70 148 C66 140 74 126 84 124 Z',
    ]
  },
  hamstrings: {
    label: 'Hamstrings',
    paths: [
      'M34 156 C28 152 26 164 28 178 C30 188 38 190 44 184 C48 176 44 158 34 156 Z',
      'M86 156 C92 152 94 164 92 178 C90 188 82 190 76 184 C72 176 76 158 86 156 Z',
    ]
  },
  'rear-delts': {
    label: 'Rear Delts',
    paths: [
      'M26 62 C20 56 18 50 24 46 C28 44 34 48 34 56 Z',
      'M94 62 C100 56 102 50 96 46 C92 44 86 48 86 56 Z',
    ]
  },
  triceps: {
    label: 'Triceps',
    paths: [
      'M24 76 C18 72 16 82 18 94 C20 102 28 104 32 96 C34 88 30 78 24 76 Z',
      'M96 76 C102 72 104 82 102 94 C100 102 92 104 88 96 C86 88 90 78 96 76 Z',
    ]
  },
};

// Map exercise muscle names to diagram muscle IDs
const MUSCLE_MAP = {
  'chest': 'chest', 'pectorals': 'chest',
  'triceps': 'triceps', 'long-head': 'triceps',
  'shoulders': 'shoulders', 'front-delts': 'front-delts',
  'side-delts': 'side-delts', 'all-delts': 'shoulders',
  'rear-delts': 'rear-delts',
  'biceps': 'biceps', 'brachialis': 'biceps',
  'forearms': 'forearms',
  'lats': 'lats',
  'traps': 'traps',
  'rhomboids': 'rhomboids',
  'lower-back': 'lower-back',
  'upper-chest': 'chest', 'inner-chest': 'chest',
  'abs': 'abs', 'obliques': 'obliques',
  'hip-flexors': 'hip-flexors',
  'quads': 'quads',
  'glutes': 'glutes', 'hamstrings': 'hamstrings',
  'calves': 'calves', 'soleus': 'calves',
  'core': 'abs',
  'grip': 'forearms',
};

// Which exercises show back view
const BACK_VIEW_EXERCISES = [
  'pullup', 'chinup', 'barbell-deadlift', 'romanian-deadlift',
  'barbell-row', 'dumbbell-row', 'seated-cable-row', 'lat-pulldown',
  'bodyweight-row', 'dead-hang', 'superman', 'face-pull',
  'pose-back-double-biceps', 'pose-back-lat-spread', 'pose-mp-back',
];

function BodySilhouette({ isBack }) {
  return isBack ? (
    // Back silhouette
    <path
      d="M60 8 C50 8 46 14 46 20 C46 26 50 30 55 32 L52 38 C44 40 34 46 28 54 C24 58 22 66 24 76 L18 100 C16 108 18 120 24 126 C28 132 24 148 26 162 C28 174 34 188 36 200 L38 232 L46 232 L48 196 C50 188 52 180 60 178 C68 180 70 188 72 196 L74 232 L82 232 L84 200 C86 188 92 174 94 162 C96 148 92 132 96 126 C102 120 104 108 102 100 L96 76 C98 66 96 58 92 54 C86 46 76 40 68 38 L65 32 C70 30 74 26 74 20 C74 14 70 8 60 8 Z"
      fill="rgba(255,255,255,0.06)"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="1"
    />
  ) : (
    // Front silhouette
    <path
      d="M60 8 C50 8 46 14 46 20 C46 26 50 30 55 32 L52 38 C44 40 34 46 28 54 C24 58 22 66 24 76 L18 100 C16 108 18 120 24 126 C28 132 24 148 26 162 C28 174 34 188 36 200 L38 232 L46 232 L48 196 C50 188 52 180 60 178 C68 180 70 188 72 196 L74 232 L82 232 L84 200 C86 188 92 174 94 162 C96 148 92 132 96 126 C102 120 104 108 102 100 L96 76 C98 66 96 58 92 54 C86 46 76 40 68 38 L65 32 C70 30 74 26 74 20 C74 14 70 8 60 8 Z"
      fill="rgba(255,255,255,0.06)"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="1"
    />
  );
}

export default function MuscleDiagram({ muscles = [], exerciseId, size = 120 }) {
  const isBack = BACK_VIEW_EXERCISES.includes(exerciseId);
  const muscleGroups = isBack ? BACK_MUSCLES : FRONT_MUSCLES;

  // Map exercise muscle names to diagram IDs
  const primaryMuscleIds = muscles.slice(0, 2).map(m => MUSCLE_MAP[m]).filter(Boolean);
  const secondaryMuscleIds = muscles.slice(2).map(m => MUSCLE_MAP[m]).filter(Boolean);

  const scale = size / 120;
  const height = size * 2;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        width={size}
        height={height}
        viewBox="0 0 120 240"
        style={{ display: 'block' }}
      >
        {/* Body silhouette */}
        <BodySilhouette isBack={isBack} />

        {/* Secondary muscles — dim highlight */}
        {secondaryMuscleIds.map(id => {
          const group = muscleGroups[id];
          if (!group) return null;
          return group.paths.map((path, i) => (
            <path
              key={`${id}-sec-${i}`}
              d={path}
              fill="rgba(255,107,0,0.35)"
              stroke="rgba(255,107,0,0.6)"
              strokeWidth="0.8"
            />
          ));
        })}

        {/* Primary muscles — bright highlight */}
        {primaryMuscleIds.map(id => {
          const group = muscleGroups[id];
          if (!group) return null;
          return group.paths.map((path, i) => (
            <path
              key={`${id}-pri-${i}`}
              d={path}
              fill="rgba(200,255,0,0.5)"
              stroke="rgba(200,255,0,0.9)"
              strokeWidth="0.8"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(200,255,0,0.6))',
                animation: 'pulseMuscle 2s ease-in-out infinite',
              }}
            />
          ));
        })}

        {/* View label */}
        <text
          x="60"
          y="238"
          textAnchor="middle"
          fontSize="8"
          fill="rgba(255,255,255,0.3)"
          fontFamily="Inter, sans-serif"
        >
          {isBack ? 'BACK' : 'FRONT'}
        </text>
      </svg>

      {/* CSS animation */}
      <style>{`
        @keyframes pulseMuscle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

/**
 * MuscleList — shows primary and secondary muscle labels
 */
export function MuscleList({ muscles = [] }) {
  if (!muscles.length) return null;

  const primary = muscles.slice(0, 2);
  const secondary = muscles.slice(2, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {primary.map(m => (
        <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 6px rgba(200,255,0,0.6)',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-0)', textTransform: 'capitalize' }}>
            {m.replace(/-/g, ' ')}
          </span>
        </div>
      ))}
      {secondary.map(m => (
        <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--orange)',
            opacity: 0.7,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-2)', textTransform: 'capitalize' }}>
            {m.replace(/-/g, ' ')}
          </span>
        </div>
      ))}
    </div>
  );
}
