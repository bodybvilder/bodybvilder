import React from 'react';

/**
 * SVG silhouette references for each bodybuilding pose.
 * Displayed as a semi-transparent overlay guide in Pose Practice Mode.
 * User matches their live skeleton to this reference.
 */

// ── Shared stick figure dimensions ───────────────────────────────────────
const HEAD_R = 8;
const STROKE = 5;
const STROKE_THIN = 3;

function PoseSVG({ children, width = 140, height = 220, flip = false }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        transform: flip ? 'scaleX(-1)' : 'none',
        filter: 'drop-shadow(0 0 12px rgba(200,255,0,0.3))',
      }}
    >
      {children}
    </svg>
  );
}

// Common style for reference silhouette
const S = {
  stroke: 'rgba(200,255,0,0.7)',
  strokeWidth: STROKE,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
};
const ST = { ...S, strokeWidth: STROKE_THIN };

// ── 1. Front Double Biceps ───────────────────────────────────────────────
export function FrontDoubleBicepsRef() {
  return (
    <PoseSVG>
      {/* Head */}
      <circle cx="70" cy="18" r={HEAD_R} stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.15)" />
      {/* Neck */}
      <line x1="70" y1="26" x2="70" y2="38" {...S} />
      {/* Torso */}
      <line x1="70" y1="38" x2="70" y2="110" {...S} />
      {/* Shoulders wide */}
      <line x1="70" y1="42" x2="30" y2="48" {...S} />
      <line x1="70" y1="42" x2="110" y2="48" {...S} />
      {/* Left upper arm — raised */}
      <line x1="30" y1="48" x2="12" y2="72" {...S} />
      {/* Left forearm — flex up */}
      <line x1="12" y1="72" x2="18" y2="48" {...S} />
      {/* Right upper arm — raised */}
      <line x1="110" y1="48" x2="128" y2="72" {...S} />
      {/* Right forearm — flex up */}
      <line x1="128" y1="72" x2="122" y2="48" {...S} />
      {/* Hips */}
      <line x1="55" y1="110" x2="85" y2="110" {...S} />
      {/* Left leg */}
      <line x1="55" y1="110" x2="48" y2="170" {...ST} />
      <line x1="48" y1="170" x2="44" y2="210" {...ST} />
      {/* Right leg */}
      <line x1="85" y1="110" x2="92" y2="170" {...ST} />
      <line x1="92" y1="170" x2="96" y2="210" {...ST} />
      {/* Lat width indicator */}
      <path d="M30 48 Q10 75 30 100" stroke="rgba(200,255,0,0.35)" strokeWidth="2" fill="none" strokeDasharray="4,3" />
      <path d="M110 48 Q130 75 110 100" stroke="rgba(200,255,0,0.35)" strokeWidth="2" fill="none" strokeDasharray="4,3" />
    </PoseSVG>
  );
}

// ── 2. Front Lat Spread ──────────────────────────────────────────────────
export function FrontLatSpreadRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="38" {...S} />
      <line x1="70" y1="38" x2="70" y2="110" {...S} />
      {/* Very wide shoulders (lat spread) */}
      <line x1="70" y1="42" x2="22" y2="52" {...S} />
      <line x1="70" y1="42" x2="118" y2="52" {...S} />
      {/* Arms down, hands on hips */}
      <line x1="22" y1="52" x2="28" y2="90" {...S} />
      <line x1="28" y1="90" x2="42" y2="98" {...S} />
      <line x1="118" y1="52" x2="112" y2="90" {...S} />
      <line x1="112" y1="90" x2="98" y2="98" {...S} />
      {/* Hips narrow */}
      <line x1="58" y1="110" x2="82" y2="110" {...S} />
      <line x1="58" y1="110" x2="50" y2="170" {...ST} />
      <line x1="50" y1="170" x2="46" y2="210" {...ST} />
      <line x1="82" y1="110" x2="90" y2="170" {...ST} />
      <line x1="90" y1="170" x2="94" y2="210" {...ST} />
      {/* V-taper lines */}
      <line x1="22" y1="52" x2="58" y2="110" stroke="rgba(200,255,0,0.3)" strokeWidth="2" strokeDasharray="5,3" />
      <line x1="118" y1="52" x2="82" y2="110" stroke="rgba(200,255,0,0.3)" strokeWidth="2" strokeDasharray="5,3" />
    </PoseSVG>
  );
}

// ── 3. Side Chest ────────────────────────────────────────────────────────
export function SideChestRef() {
  return (
    <PoseSVG>
      <circle cx="68" cy="18" r={HEAD_R} stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.15)" />
      <line x1="68" y1="26" x2="68" y2="38" {...S} />
      <line x1="68" y1="38" x2="65" y2="112" {...S} />
      {/* Turned sideways — shoulders stacked */}
      <line x1="66" y1="42" x2="50" y2="46" {...S} />
      <line x1="66" y1="42" x2="82" y2="44" {...S} />
      {/* Front arm pressed against chest, elbow bent */}
      <line x1="50" y1="46" x2="40" y2="70" {...S} />
      <line x1="40" y1="70" x2="55" y2="82" {...S} />
      {/* Back arm hidden/behind */}
      <line x1="82" y1="44" x2="88" y2="72" {...ST} strokeDasharray="5,3" />
      {/* Chest pushed forward */}
      <path d="M66 42 Q80 60 66 80" stroke="rgba(200,255,0,0.4)" strokeWidth="2" fill="rgba(200,255,0,0.05)" />
      {/* Legs */}
      <line x1="65" y1="112" x2="60" y2="170" {...ST} />
      <line x1="60" y1="170" x2="58" y2="210" {...ST} />
      <line x1="65" y1="112" x2="72" y2="170" {...ST} strokeDasharray="5,3" />
    </PoseSVG>
  );
}

// ── 4. Abs & Thighs ──────────────────────────────────────────────────────
export function AbsThighsRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="38" {...S} />
      <line x1="70" y1="38" x2="70" y2="108" {...S} />
      {/* Arms raised behind head */}
      <line x1="70" y1="42" x2="40" y2="50" {...S} />
      <line x1="40" y1="50" x2="30" y2="28" {...S} />
      <line x1="30" y1="28" x2="50" y2="24" {...S} />
      <line x1="70" y1="42" x2="100" y2="50" {...S} />
      <line x1="100" y1="50" x2="110" y2="28" {...S} />
      <line x1="110" y1="28" x2="90" y2="24" {...S} />
      {/* Hips */}
      <line x1="56" y1="108" x2="84" y2="108" {...S} />
      {/* One leg forward — quad flex */}
      <line x1="56" y1="108" x2="48" y2="162" {...S} strokeWidth="6" />
      <line x1="48" y1="162" x2="44" y2="210" {...ST} />
      {/* Back leg */}
      <line x1="84" y1="108" x2="90" y2="162" {...ST} />
      <line x1="90" y1="162" x2="92" y2="210" {...ST} />
      {/* Abs crunch indicator */}
      <path d="M62 60 L78 60 M60 72 L80 72 M62 84 L78 84 M64 96 L76 96" stroke="rgba(200,255,0,0.4)" strokeWidth="1.5" strokeLinecap="round" />
    </PoseSVG>
  );
}

// ── 5. Most Muscular (Crab) ──────────────────────────────────────────────
export function MostMuscularRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="22" r={HEAD_R} stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="30" x2="70" y2="42" {...S} />
      {/* Leaning forward */}
      <line x1="70" y1="42" x2="68" y2="105" {...S} />
      {/* Wide shoulders */}
      <line x1="70" y1="46" x2="28" y2="55" {...S} />
      <line x1="70" y1="46" x2="112" y2="55" {...S} />
      {/* Arms drive DOWN toward hips — crab position */}
      <line x1="28" y1="55" x2="20" y2="82" {...S} />
      <line x1="20" y1="82" x2="42" y2="100" {...S} />
      <line x1="112" y1="55" x2="120" y2="82" {...S} />
      <line x1="120" y1="82" x2="98" y2="100" {...S} />
      {/* Trap bulge indicator */}
      <path d="M50 38 Q70 30 90 38" stroke="rgba(200,255,0,0.5)" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Hips */}
      <line x1="57" y1="105" x2="79" y2="105" {...S} />
      <line x1="57" y1="105" x2="50" y2="160" {...ST} />
      <line x1="50" y1="160" x2="46" y2="200" {...ST} />
      <line x1="79" y1="105" x2="86" y2="160" {...ST} />
      <line x1="86" y1="160" x2="90" y2="200" {...ST} />
    </PoseSVG>
  );
}

// ── 6. Men's Physique Front ──────────────────────────────────────────────
export function MPFrontRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="38" {...S} />
      <line x1="70" y1="38" x2="70" y2="112" {...S} />
      {/* Relaxed wide shoulders */}
      <line x1="70" y1="42" x2="32" y2="52" {...S} />
      <line x1="70" y1="42" x2="108" y2="52" {...S} />
      {/* One hand on hip, one slightly away */}
      <line x1="32" y1="52" x2="34" y2="85" {...S} />
      <line x1="34" y1="85" x2="48" y2="95" {...S} />
      <line x1="108" y1="52" x2="106" y2="80" {...S} />
      <line x1="106" y1="80" x2="95" y2="90" {...S} />
      {/* Hip pop — slight offset */}
      <line x1="56" y1="112" x2="84" y2="108" {...S} />
      {/* Board shorts */}
      <line x1="54" y1="120" x2="86" y2="118" stroke="rgba(200,255,0,0.5)" strokeWidth="2" />
      {/* Legs */}
      <line x1="56" y1="112" x2="50" y2="168" {...ST} />
      <line x1="50" y1="168" x2="46" y2="210" {...ST} />
      <line x1="84" y1="108" x2="90" y2="164" {...ST} />
      <line x1="90" y1="164" x2="94" y2="210" {...ST} />
    </PoseSVG>
  );
}

// ── 7. Men's Physique Back ───────────────────────────────────────────────
export function MPBackRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="38" {...S} />
      <line x1="70" y1="38" x2="70" y2="110" {...S} />
      {/* Wide lat back */}
      <line x1="70" y1="42" x2="24" y2="55" {...S} />
      <line x1="70" y1="42" x2="116" y2="55" {...S} />
      {/* Arms slightly away showing lats */}
      <line x1="24" y1="55" x2="20" y2="95" {...S} />
      <line x1="116" y1="55" x2="120" y2="95" {...S} />
      {/* V-taper to small waist */}
      <path d="M24 55 L50 110" stroke="rgba(200,255,0,0.4)" strokeWidth="2" strokeDasharray="4,3" />
      <path d="M116 55 L90 110" stroke="rgba(200,255,0,0.4)" strokeWidth="2" strokeDasharray="4,3" />
      {/* Hips */}
      <line x1="53" y1="110" x2="87" y2="110" {...S} />
      <line x1="53" y1="110" x2="46" y2="168" {...ST} />
      <line x1="46" y1="168" x2="42" y2="210" {...ST} />
      <line x1="87" y1="110" x2="94" y2="168" {...ST} />
      <line x1="94" y1="168" x2="98" y2="210" {...ST} />
    </PoseSVG>
  );
}

// ── Map pose ID to component ─────────────────────────────────────────────
export const POSE_REFS = {
  'pose-front-double-biceps': FrontDoubleBicepsRef,
  'pose-front-lat-spread':    FrontLatSpreadRef,
  'pose-side-chest':          SideChestRef,
  'pose-side-triceps':        SideChestRef, // mirrored
  'pose-abs-thighs':          AbsThighsRef,
  'pose-most-muscular':       MostMuscularRef,
  'pose-back-double-biceps':  MPBackRef,
  'pose-back-lat-spread':     MPBackRef,
  'pose-mp-front':            MPFrontRef,
  'pose-mp-back':             MPBackRef,
  'pose-mp-side':             SideChestRef,
};
