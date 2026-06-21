
import React, { useState } from 'react';

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

const S = {
  stroke: 'rgba(200,255,0,0.7)',
  strokeWidth: STROKE,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
};
const ST = { ...S, strokeWidth: STROKE_THIN };
const FAINT = {
  stroke: 'rgba(200,255,0,0.4)',
  strokeWidth: 2,
  strokeLinecap: 'round',
  fill: 'rgba(200,255,0,0.08)',
};

// ── 1. Front Double Biceps ───────────────────────────────────────────────
export function FrontDoubleBicepsRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="38" {...S} />
      <line x1="70" y1="38" x2="70" y2="100" {...S} />
      <path d="M28 38 C8 32 6 50 26 80" stroke="rgba(200,255,0,0.8)" strokeWidth="3" fill="rgba(200,255,0,0.1)" />
      <path d="M112 38 C122 32 124 50 104 80" stroke="rgba(200,255,0,0.8)" strokeWidth="3" fill="rgba(200,255,0,0.1)" />
      <line x1="70" y1="32" x2="30" y2="40" {...S} />
      <line x1="30" y1="40" x2="24" y2="28" {...S} />
      <line x1="12" y1="40" x2="18" y2="28" stroke="rgba(200,255,0,0.9)" strokeWidth="4" />
      <line x1="70" y1="32" x2="110" y2="40" {...S} />
      <line x1="110" y1="40" x2="116" y2="28" {...S} />
      <line x1="120" y1="40" x2="114" y2="28" stroke="rgba(200,255,0,0.9)" strokeWidth="4" />
      <line x1="70" y1="100" x2="58" y2="160" {...ST} />
      <line x1="58" y1="160" x2="54" y2="200" {...ST} />
      <line x1="70" y1="100" x2="82" y2="160" {...ST} />
      <line x1="82" y1="160" x2="86" y2="200" {...ST} />
    </PoseSVG>
  );
}

// ── 2. Front Lat Spread ──────────────────────────────────────────────────
export function FrontLatSpreadRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="36" {...S} />
      <line x1="70" y1="36" x2="70" y2="98" {...S} />
      <path d="M28 36 C2 30 2 60 28 95" stroke="rgba(200,255,0,0.85)" strokeWidth="3" fill="rgba(200,255,0,0.08)" />
      <path d="M112 36 C148 30 148 60 112 95" stroke="rgba(200,255,0,0.85)" strokeWidth="3" fill="rgba(200,255,0,0.08)" />
      <line x1="70" y1="38" x2="30" y2="46" {...S} />
      <line x1="30" y1="46" x2="26" y2="82" {...S} />
      <line x1="70" y1="38" x2="110" y2="46" {...S} />
      <line x1="110" y1="46" x2="114" y2="82" {...S} />
      <path d="M28 36 L60 98" stroke="rgba(200,255,0,0.35)" strokeWidth="2" strokeDasharray="5,3" />
      <path d="M112 36 L80 98" stroke="rgba(200,255,0,0.35)" strokeWidth="2" strokeDasharray="5,3" />
      <line x1="70" y1="98" x2="60" y2="195" {...ST} />
      <line x1="60" y1="195" x2="56" y2="215" {...ST} />
      <line x1="70" y1="98" x2="80" y2="195" {...ST} />
      <line x1="80" y1="195" x2="84" y2="215" {...ST} />
    </PoseSVG>
  );
}

// ── 3. Side Chest ────────────────────────────────────────────────────────
export function SideChestRef() {
  return (
    <PoseSVG>
      <circle cx="68" cy="18" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="68" y1="26" x2="68" y2="36" {...S} />
      <line x1="68" y1="36" x2="68" y2="105" {...S} />
      <line x1="66" y1="38" x2="50" y2="44" {...S} />
      <line x1="66" y1="38" x2="82" y2="42" {...S} opacity="0.5" />
      <line x1="50" y1="44" x2="44" y2="75" {...S} />
      <line x1="44" y1="75" x2="44" y2="55" stroke="rgba(200,255,0,0.9)" strokeWidth="4" />
      <path d="M68 36 Q80 55 68 80" {...FAINT} />
      <line x1="68" y1="105" x2="60" y2="185" {...ST} />
      <line x1="60" y1="185" x2="56" y2="215" {...ST} />
      <line x1="68" y1="105" x2="76" y2="195" {...ST} opacity="0.5" />
    </PoseSVG>
  );
}

// ── 4. Abs & Thighs ──────────────────────────────────────────────────────
export function AbsThighsRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="36" {...S} />
      <line x1="70" y1="36" x2="70" y2="100" {...S} />
      <line x1="70" y1="32" x2="40" y2="38" {...S} />
      <line x1="40" y1="38" x2="32" y2="22" {...S} />
      <line x1="70" y1="32" x2="100" y2="38" {...S} />
      <line x1="100" y1="38" x2="108" y2="22" {...S} />
      <line x1="60" y1="100" x2="54" y2="180" {...S} strokeWidth="5" />
      <line x1="54" y1="180" x2="50" y2="215" {...ST} />
      <line x1="70" y1="100" x2="80" y2="185" {...ST} opacity="0.5" />
      <path d="M62 60 L78 60 M60 72 L80 72 M62 84 L78 84 M64 96 L76 96" stroke="rgba(200,255,0,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </PoseSVG>
  );
}

// ── 5. Most Muscular (Crab) ──────────────────────────────────────────────
export function MostMuscularRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="22" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="30" x2="70" y2="42" {...S} />
      <line x1="70" y1="42" x2="68" y2="100" {...S} />
      <line x1="70" y1="36" x2="32" y2="45" {...S} />
      <line x1="32" y1="45" x2="20" y2="85" {...S} />
      <line x1="20" y1="85" x2="42" y2="98" {...S} />
      <line x1="70" y1="36" x2="68" y2="45" {...S} />
      <line x1="68" y1="45" x2="78" y2="85" {...S} />
      <line x1="78" y1="85" x2="58" y2="98" {...S} />
      <path d="M45 30 Q50 25 55 30" stroke="rgba(200,255,0,0.7)" strokeWidth="4" fill="none" />
      <line x1="64" y1="100" x2="56" y2="185" {...ST} />
      <line x1="56" y1="185" x2="52" y2="215" {...ST} />
      <line x1="72" y1="100" x2="80" y2="185" {...ST} />
      <line x1="80" y1="185" x2="84" y2="215" {...ST} />
    </PoseSVG>
  );
}

// ── 6. Men's Physique Front ──────────────────────────────────────────────
export function MPFrontRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="38" {...S} />
      <line x1="70" y1="38" x2="70" y2="95" {...S} />
      <path d="M30 38 C15 35 15 55 30 60" stroke="rgba(200,255,0,0.6)" strokeWidth="2.5" fill="rgba(200,255,0,0.06)" />
      <path d="M110 38 C125 35 125 55 110 60" stroke="rgba(200,255,0,0.6)" strokeWidth="2.5" fill="rgba(200,255,0,0.06)" />
      <line x1="70" y1="36" x2="32" y2="42" {...S} />
      <line x1="32" y1="42" x2="28" y2="75" {...S} />
      <line x1="70" y1="36" x2="110" y2="42" {...S} />
      <line x1="110" y1="42" x2="106" y2="75" {...S} />
      <line x1="66" y1="95" x2="60" y2="185" {...ST} />
      <line x1="60" y1="185" x2="56" y2="210" {...ST} />
      <line x1="74" y1="95" x2="82" y2="185" {...ST} />
      <line x1="82" y1="185" x2="86" y2="210" {...ST} />
    </PoseSVG>
  );
}

// ── 7. Men's Physique Back ───────────────────────────────────────────────
export function MPBackRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="36" {...S} />
      <line x1="70" y1="36" x2="70" y2="95" {...S} />
      <path d="M30 36 C8 30 8 60 30 65" stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.08)" />
      <path d="M110 36 C132 30 132 60 110 65" stroke="rgba(200,255,0,0.7)" strokeWidth="3" fill="rgba(200,255,0,0.08)" />
      <line x1="70" y1="38" x2="30" y2="46" {...S} />
      <line x1="30" y1="46" x2="26" y2="80" {...S} />
      <line x1="70" y1="38" x2="110" y2="46" {...S} />
      <line x1="110" y1="46" x2="114" y2="80" {...S} />
      <line x1="66" y1="95" x2="60" y2="185" {...ST} />
      <line x1="60" y1="185" x2="56" y2="212" {...ST} />
      <line x1="74" y1="95" x2="82" y2="185" {...ST} />
      <line x1="82" y1="185" x2="86" y2="212" {...ST} />
    </PoseSVG>
  );
}

// ── 8. Side Triceps ────────────────────────────────────────────────────────
export function SideTricepsRef() {
  return (
    <PoseSVG>
      <circle cx="68" cy="18" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="68" y1="26" x2="68" y2="36" {...S} />
      <line x1="68" y1="36" x2="68" y2="100" {...S} />
      <line x1="68" y1="36" x2="32" y2="45" {...S} />
      <line x1="32" y1="45" x2="28" y2="90" {...S} />
      <line x1="28" y1="90" x2="42" y2="98" {...S} strokeWidth="4" />
      <line x1="68" y1="38" x2="110" y2="42" {...S} />
      <line x1="110" y1="42" x2="114" y2="80" {...S} />
      <line x1="68" y1="100" x2="60" y2="185" {...ST} />
      <line x1="60" y1="185" x2="56" y2="210" {...ST} />
      <path d="M70 50 Q85 70 70 90" {...FAINT} />
    </PoseSVG>
  );
}

// ── 9. Back Double Biceps ───────────────────────────────────────────────────
export function BackDoubleBicepsRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="36" {...S} />
      <line x1="70" y1="36" x2="70" y2="98" {...S} />
      <path d="M28 36 C2 30 2 60 28 95" stroke="rgba(200,255,0,0.85)" strokeWidth="3" fill="rgba(200,255,0,0.08)" />
      <path d="M112 36 C148 30 148 60 112 95" stroke="rgba(200,255,0,0.85)" strokeWidth="3" fill="rgba(200,255,0,0.08)" />
      <line x1="70" y1="38" x2="30" y2="46" {...S} />
      <line x1="30" y1="46" x2="24" y2="28" {...S} />
      <line x1="12" y1="40" x2="18" y2="28" stroke="rgba(200,255,0,0.9)" strokeWidth="4" />
      <line x1="70" y1="38" x2="110" y2="46" {...S} />
      <line x1="110" y1="46" x2="116" y2="28" {...S} />
      <line x1="120" y1="40" x2="114" y2="28" stroke="rgba(200,255,0,0.9)" strokeWidth="4" />
      <line x1="70" y1="98" x2="60" y2="185" {...ST} />
      <line x1="60" y1="185" x2="56" y2="210" {...ST} />
      <line x1="70" y1="98" x2="80" y2="185" {...ST} />
      <line x1="80" y1="185" x2="84" y2="210" {...ST} />
    </PoseSVG>
  );
}

// ── 10. Back Lat Spread ─────────────────────────────────────────────────────
export function BackLatSpreadRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="36" {...S} />
      <line x1="70" y1="36" x2="70" y2="98" {...S} />
      <path d="M30 36 C8 30 8 60 30 95" stroke="rgba(200,255,0,0.85)" strokeWidth="3" fill="rgba(200,255,0,0.08)" />
      <path d="M110 36 C132 30 132 60 110 95" stroke="rgba(200,255,0,0.85)" strokeWidth="3" fill="rgba(200,255,0,0.08)" />
      <line x1="70" y1="38" x2="30" y2="46" {...S} />
      <line x1="30" y1="46" x2="26" y2="82" {...S} />
      <line x1="70" y1="38" x2="110" y2="46" {...S} />
      <line x1="110" y1="46" x2="114" y2="82" {...S} />
      <line x1="70" y1="98" x2="60" y2="195" {...ST} />
      <line x1="60" y1="195" x2="56" y2="215" {...ST} />
      <line x1="70" y1="98" x2="80" y2="195" {...ST} />
      <line x1="80" y1="195" x2="84" y2="215" {...ST} />
    </PoseSVG>
  );
}

// ── 11. Men's Physique Side ─────────────────────────────────────────────────
export function MPSideRef() {
  return (
    <PoseSVG>
      <circle cx="70" cy="18" r={HEAD_R} {...S} fill="rgba(200,255,0,0.15)" />
      <line x1="70" y1="26" x2="70" y2="36" {...S} />
      <line x1="70" y1="36" x2="70" y2="100" {...S} />
      <line x1="70" y1="36" x2="32" y2="42" {...S} />
      <line x1="32" y1="42" x2="28" y2="75" {...S} />
      <line x1="70" y1="34" x2="110" y2="40" {...S} />
      <line x1="110" y1="40" x2="106" y2="80" {...S} />
      <line x1="66" y1="100" x2="58" y2="185" {...ST} />
      <line x1="58" y1="185" x2="54" y2="210" {...ST} />
      <path d="M68 60 Q82 80 68 100" {...FAINT} />
    </PoseSVG>
  );
}

// ── GIF/SVG-based pose reference (loads from /exercise-gifs/) ───────────────
// Falls back to SVG component if image not found.
function makePoseImgRef(poseId, FallbackSVG) {
  return function PoseImgRef() {
    const [failed, setFailed] = useState(false);
    if (failed) return <FallbackSVG />;
    return (
      <img
        src={`/exercise-gifs/${poseId}.svg?v=3`}
        alt={poseId}
        onError={(e) => {
          // Try GIF as fallback
          e.target.src = `/exercise-gifs/${poseId}.gif?v=3`;
          e.target.onerror = () => setFailed(true);
        }}
        style={{
          width: 140,
          height: 220,
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 0 12px rgba(200,255,0,0.4))',
          borderRadius: 8,
        }}
      />
    );
  };
}

// ── Map pose ID to component ─────────────────────────────────────────────
export const POSE_REFS = {
  'pose-front-double-biceps': makePoseImgRef('pose-front-double-biceps', FrontDoubleBicepsRef),
  'pose-front-lat-spread':    makePoseImgRef('pose-front-lat-spread',    FrontLatSpreadRef),
  'pose-side-chest':          makePoseImgRef('pose-side-chest',          SideChestRef),
  'pose-side-triceps':        makePoseImgRef('pose-side-triceps',        SideTricepsRef),
  'pose-abs-thighs':          makePoseImgRef('pose-abs-thighs',          AbsThighsRef),
  'pose-most-muscular':       makePoseImgRef('pose-most-muscular',       MostMuscularRef),
  'pose-back-double-biceps':  makePoseImgRef('pose-back-double-biceps',  BackDoubleBicepsRef),
  'pose-back-lat-spread':     makePoseImgRef('pose-back-lat-spread',     BackLatSpreadRef),
  'pose-mp-front':            makePoseImgRef('pose-mp-front',            MPFrontRef),
  'pose-mp-back':             makePoseImgRef('pose-mp-back',             MPBackRef),
  'pose-mp-side':             makePoseImgRef('pose-mp-side',             MPSideRef),
};
