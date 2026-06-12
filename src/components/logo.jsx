import React from 'react';

/**
 * BODYBVILDER Official Logo
 * Letter "B" formed by two muscular flexing arms:
 * - Vertical spine/bar on the left
 * - Upper arm creates the top bump of "B"
 * - Lower arm creates the bottom bump of "B"
 */
export default function Logo({ color = 'white', size = 40 }) {
  const fill = color === 'accent' ? 'var(--accent)' : color;
  const aspect = 75 / 100; // logo is taller than wide
  const w = size * aspect;
  const h = size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 75 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── SPINE / Vertical bar (left side of "B") ── */}
      <rect x="4" y="5" width="10" height="90" rx="3" fill={fill} />

      {/* ══════════════════════════════════════════
          UPPER ARM — forms the TOP bump of "B"
          Upper arm goes right from spine, elbow bends
          down, forearm curls back left (fist visible)
      ══════════════════════════════════════════ */}

      {/* Upper arm / shoulder mass (top-right bulge) */}
      <path
        d="
          M14 10
          C14 8, 18 6, 24 8
          C32 10, 42 12, 50 18
          C56 22, 60 28, 58 34
          C56 40, 50 42, 44 40
          C40 39, 36 36, 32 32
          L14 28
          Z
        "
        fill={fill}
      />

      {/* Bicep peak on upper arm */}
      <path
        d="
          M28 8
          C34 6, 46 8, 54 16
          C60 22, 62 30, 58 36
          C55 40, 48 42, 42 39
        "
        stroke={fill}
        strokeWidth="1"
        fill={fill}
        opacity="0"
      />

      {/* Muscle definition lines on upper arm */}
      <path d="M22 12 C30 10, 44 14, 52 22" stroke="black" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" fill="none" />
      <path d="M20 18 C26 16, 38 18, 46 26" stroke="black" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" fill="none" />
      <path d="M18 24 C24 22, 34 24, 40 30" stroke="black" strokeWidth="1" strokeLinecap="round" opacity="0.25" fill="none" />

      {/* Elbow area (upper arm connects to forearm) */}
      <path
        d="
          M44 40
          C48 41, 52 44, 54 48
          C56 52, 54 56, 50 56
          C46 56, 40 52, 36 48
          L32 32
          C36 36, 40 39, 44 40
          Z
        "
        fill={fill}
      />

      {/* Upper forearm / wrist curling back */}
      <path
        d="
          M50 56
          C52 60, 50 64, 46 66
          C42 68, 36 66, 32 62
          C28 58, 26 54, 28 50
          C30 46, 36 44, 40 46
          C44 48, 48 54, 50 56
          Z
        "
        fill={fill}
      />

      {/* Fist / hand fingers upper arm */}
      <path d="M32 62 C30 64, 28 66, 30 68 C32 70, 36 68, 38 66" stroke={fill} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M34 64 C33 67, 34 69, 36 68" stroke={fill} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 65 C37 68, 38 70, 40 69" stroke={fill} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Forearm muscle definition */}
      <path d="M40 46 C44 50, 46 54, 46 58" stroke="black" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" fill="none" />
      <path d="M36 48 C38 52, 40 56, 40 60" stroke="black" strokeWidth="1" strokeLinecap="round" opacity="0.25" fill="none" />

      {/* ══════════════════════════════════════════
          LOWER ARM — forms the BOTTOM bump of "B"
          Mirror/similar to upper but positioned lower
          and slightly different angle
      ══════════════════════════════════════════ */}

      {/* Connection between upper and lower (narrow waist of "B") */}
      <path
        d="M14 58 C14 56, 18 55, 24 56 C28 57, 30 59, 28 62 C26 64, 20 64, 14 64 Z"
        fill={fill}
      />

      {/* Lower arm / shoulder mass (bottom-right bulge) */}
      <path
        d="
          M14 64
          C14 62, 18 60, 26 62
          C34 64, 46 68, 54 76
          C60 82, 62 90, 58 94
          C54 97, 46 96, 40 92
          C36 89, 32 84, 28 78
          L14 72
          Z
        "
        fill={fill}
      />

      {/* Lower bicep peak — bigger, rounder */}
      <path
        d="
          M24 62
          C34 60, 50 66, 58 76
          C64 84, 62 93, 56 96
        "
        stroke={fill}
        strokeWidth="1"
        fill={fill}
        opacity="0"
      />

      {/* Muscle definition lines on lower arm */}
      <path d="M20 66 C30 64, 46 70, 54 80" stroke="black" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" fill="none" />
      <path d="M18 72 C26 70, 40 74, 48 84" stroke="black" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" fill="none" />
      <path d="M16 78 C22 76, 34 80, 42 88" stroke="black" strokeWidth="1" strokeLinecap="round" opacity="0.25" fill="none" />

      {/* Lower elbow area */}
      <path
        d="
          M40 92
          C44 93, 50 92, 52 88
          C54 84, 52 80, 48 78
          C44 76, 38 76, 34 80
          L28 78
          C32 84, 36 89, 40 92
          Z
        "
        fill={fill}
      />

      {/* Lower forearm curling back */}
      <path
        d="
          M48 78
          C52 76, 54 72, 50 68
          C46 64, 40 64, 36 66
          C32 68, 30 72, 32 76
          C34 80, 40 82, 44 80
          C46 79, 48 78, 48 78
          Z
        "
        fill={fill}
      />

      {/* Fist / hand fingers lower arm */}
      <path d="M32 76 C29 78, 27 80, 29 82 C31 84, 35 83, 37 80" stroke={fill} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M34 78 C32 81, 33 83, 35 82" stroke={fill} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 79 C36 82, 37 84, 39 83" stroke={fill} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Forearm muscle definition lower */}
      <path d="M40 64 C42 68, 44 72, 44 76" stroke="black" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" fill="none" />
      <path d="M36 66 C36 70, 38 74, 38 78" stroke="black" strokeWidth="1" strokeLinecap="round" opacity="0.25" fill="none" />
    </svg>
  );
}
