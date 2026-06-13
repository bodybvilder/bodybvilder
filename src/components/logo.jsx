import React from 'react';

/**
 * BODYBVILDER Official Logo
 * Letter "B" formed by two muscular flexing arms:
 * Vertical spine on left, upper arm = top bump, lower arm = bottom bump
 */
export default function Logo({ color = 'white', size = 40 }) {
  const c = color === 'accent' ? 'var(--accent)' : color;
  const w = size * 0.72;
  const h = size;

  return (
    <svg width={w} height={h} viewBox="0 0 72 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ── Vertical spine (left stroke of "B") ── */}
      <rect x="2" y="4" width="11" height="92" rx="4" fill={c} />

      {/* ══ TOP HALF — upper arm forms top bump of B ══ */}
      {/* Shoulder / upper arm mass */}
      <path d="M13 6 C13 6 22 4 34 8 C44 11 54 17 58 25 C62 33 58 41 50 43 C44 45 36 42 28 36 L13 28 Z" fill={c} />
      {/* Bicep peak */}
      <path d="M28 7 C36 5 50 10 58 22 C64 30 62 40 54 44 C48 47 40 44 34 38" fill={c} />
      {/* Muscle striations upper */}
      <path d="M20 11 C32 8 48 14 56 25" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" fill="none"/>
      <path d="M18 18 C28 14 42 18 52 29" stroke="#000" strokeWidth="1.3" strokeLinecap="round" opacity="0.18" fill="none"/>
      <path d="M16 25 C24 21 36 24 46 33" stroke="#000" strokeWidth="1.1" strokeLinecap="round" opacity="0.15" fill="none"/>
      {/* Elbow connection */}
      <path d="M50 43 C56 46 60 52 56 58 C52 63 44 62 38 56 C32 50 30 42 34 38 C38 34 46 39 50 43 Z" fill={c} />
      {/* Forearm curling inward */}
      <path d="M54 58 C56 64 52 70 46 70 C40 70 34 64 32 56 C30 50 32 44 36 42 L38 56 C42 62 50 64 54 58 Z" fill={c} />
      {/* Fist top arm */}
      <path d="M32 58 C28 60 26 64 28 68 C30 71 35 70 38 66" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M32 62 C30 66 31 69 34 68" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M36 63 C34 67 35 70 38 69" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Forearm striations */}
      <path d="M40 46 C44 52 46 58 44 64" stroke="#000" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" fill="none"/>
      <path d="M36 48 C38 54 40 60 38 66" stroke="#000" strokeWidth="1" strokeLinecap="round" opacity="0.15" fill="none"/>

      {/* Waist — narrow bridge between bumps */}
      <path d="M13 46 C13 44 16 43 22 44 C27 45 29 48 27 52 C25 55 18 56 13 54 Z" fill={c} />

      {/* ══ BOTTOM HALF — lower arm forms bottom bump of B ══ */}
      {/* Shoulder / upper arm mass bottom */}
      <path d="M13 54 C13 54 22 52 34 56 C44 59 56 67 58 76 C60 84 56 92 46 95 C38 97 28 92 20 84 L13 72 Z" fill={c} />
      {/* Bicep peak bottom — bigger/rounder than top */}
      <path d="M26 54 C36 52 52 58 60 72 C66 82 62 93 52 96 C44 98 34 92 26 82" fill={c} />
      {/* Muscle striations lower */}
      <path d="M18 60 C30 56 48 64 56 76" stroke="#000" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" fill="none"/>
      <path d="M16 68 C26 64 42 70 52 82" stroke="#000" strokeWidth="1.3" strokeLinecap="round" opacity="0.18" fill="none"/>
      <path d="M14 76 C22 72 36 76 46 86" stroke="#000" strokeWidth="1.1" strokeLinecap="round" opacity="0.15" fill="none"/>
      {/* Elbow connection lower */}
      <path d="M46 95 C52 96 58 92 58 86 C58 80 52 76 46 76 C40 76 36 82 38 88 C40 93 44 95 46 95 Z" fill={c} />
      {/* Forearm curling inward lower */}
      <path d="M56 86 C58 80 54 74 48 72 C42 70 36 74 36 80 C36 86 40 92 46 94 L46 76 C50 78 56 82 56 86 Z" fill={c} />
      {/* Fist bottom arm */}
      <path d="M36 80 C32 82 30 86 32 90 C34 93 39 92 42 88" stroke={c} strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M36 84 C34 88 35 91 38 90" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M40 85 C38 89 39 92 42 91" stroke={c} strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Forearm striations lower */}
      <path d="M42 74 C46 80 48 86 46 92" stroke="#000" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" fill="none"/>
      <path d="M38 76 C40 82 42 88 40 94" stroke="#000" strokeWidth="1" strokeLinecap="round" opacity="0.15" fill="none"/>
    </svg>
  );
}
