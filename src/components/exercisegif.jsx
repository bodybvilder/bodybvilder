import React, { useState, useEffect } from 'react';

/**
 * ExerciseGIF — fetches animated GIF from ExerciseDB API
 * Free, no API key needed for v1 dataset
 * Falls back gracefully if not found
 */

// Map BODYBVILDER exercise IDs to ExerciseDB exercise names
// ExerciseDB uses lowercase names for search
const EXERCISE_NAME_MAP = {
  'pushup':              'push-up',
  'incline-pushup':      'push-up (incline)',
  'decline-pushup':      'push-up (decline)',
  'diamond-pushup':      'diamond push-up',
  'wide-pushup':         'wide push-up',
  'pike-pushup':         'pike push-up',
  'pullup':              'pull-up',
  'chinup':              'chin-up',
  'dip':                 'chest dip',
  'bench-dip':           'bench dip',
  'squat':               'bodyweight squat',
  'lunge':               'forward lunge',
  'glute-bridge':        'glute bridge',
  'jump-squat':          'jump squat',
  'calf-raise':          'calf raise',
  'plank':               'plank',
  'crunch':              'crunch',
  'mountain-climber':    'mountain climber',
  'leg-raise':           'leg raise',
  'russian-twist':       'russian twist',
  'bicep-curl':          'dumbbell biceps curl',
  'hammer-curl':         'dumbbell hammer curl',
  'concentration-curl':  'dumbbell concentration curl',
  'lateral-raise':       'dumbbell lateral raise',
  'front-raise':         'dumbbell front raise',
  'barbell-squat':       'barbell squat',
  'barbell-deadlift':    'barbell deadlift',
  'romanian-deadlift':   'romanian deadlift',
  'barbell-row':         'barbell bent over row',
  'overhead-press':      'barbell overhead press',
  'barbell-curl':        'barbell curl',
  'skull-crusher':       'skull crusher',
  'dumbbell-row':        'dumbbell bent over row',
  'dumbbell-fly':        'dumbbell fly',
  'incline-dumbbell-press': 'incline dumbbell press',
  'arnold-press':        'arnold press',
  'lat-pulldown':        'cable lat pulldown',
  'seated-cable-row':    'cable seated row',
  'cable-curl':          'cable biceps curl',
  'tricep-pushdown':     'cable push-down',
  'face-pull':           'cable face pull',
  'tricep-extension':    'dumbbell triceps extension',
  'bulgarian-split-squat': 'split squat',
  'single-leg-squat':    'pistol squat',
  'superman':            'back extension',
  'hollow-body':         'ab wheel',
  'dead-hang':           'pull-up',
};

// Cache GIF URLs to avoid repeated API calls
const gifCache = {};

async function fetchExerciseGif(exerciseId) {
  if (gifCache[exerciseId] !== undefined) return gifCache[exerciseId];

  const searchName = EXERCISE_NAME_MAP[exerciseId];
  if (!searchName) {
    gifCache[exerciseId] = null;
    return null;
  }

  try {
    const encoded = encodeURIComponent(searchName);
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encoded}?limit=1&offset=0`,
      {
        headers: {
          // This uses the free public endpoint — no key needed for basic usage
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
      }
    );

    // Try open endpoint first (no key)
    if (!res.ok) {
      // Fallback: try ExerciseDB open API
      const res2 = await fetch(
        `https://v2.exercisedb.io/exercises?name=${encoded}&limit=1`
      );
      if (!res2.ok) {
        gifCache[exerciseId] = null;
        return null;
      }
      const data2 = await res2.json();
      const gif = data2?.exercises?.[0]?.gifUrl || data2?.[0]?.gifUrl || null;
      gifCache[exerciseId] = gif;
      return gif;
    }

    const data = await res.json();
    const gif = data?.[0]?.gifUrl || null;
    gifCache[exerciseId] = gif;
    return gif;
  } catch {
    gifCache[exerciseId] = null;
    return null;
  }
}

export default function ExerciseGif({ exerciseId, size = 160 }) {
  const [gifUrl, setGifUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!exerciseId || exerciseId.startsWith('pose-')) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    fetchExerciseGif(exerciseId).then(url => {
      setGifUrl(url);
      setLoading(false);
      if (!url) setError(true);
    });
  }, [exerciseId]);

  // Don't render for poses — they have their own animation
  if (exerciseId?.startsWith('pose-')) return null;

  if (loading) {
    return (
      <div style={{
        width: size, height: size,
        borderRadius: '16px',
        background: 'var(--bg-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{
          width: '24px', height: '24px',
          border: '2.5px solid var(--bg-3)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    );
  }

  if (error || !gifUrl) return null;

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <img
        src={gifUrl}
        alt="Exercise demo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
}
