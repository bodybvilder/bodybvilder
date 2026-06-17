import React from 'react';

/**
 * ExerciseGif — local CSS/SVG stick-figure animations
 * No API key needed, works offline, instant load
 */

// ── Stick figure SVG helpers ────────────────────────────────────────────
// Joint positions for a stick figure (normalized 0-100 in a 100x120 viewBox)
// HEAD: circle at top, BODY: torso line, ARMS, LEGS

const FIG = {
  head: { cx: 50, cy: 12, r: 8 },
  neck: [50, 20],
  shoulder: [50, 30],
  hip: [50, 68],
};

// ── Animation keyframe inject ───────────────────────────────────────────
const KEYFRAMES = `
@keyframes ex-pushup-down { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }
@keyframes ex-pushup-arm  { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(25deg)} }
@keyframes ex-squat-body  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(16px)} }
@keyframes ex-curl-arm    { 0%{transform:rotate(0deg)} 50%{transform:rotate(-75deg)} 100%{transform:rotate(0deg)} }
@keyframes ex-raise-arm   { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-80deg)} }
@keyframes ex-plank-pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
@keyframes ex-pullup-body { 0%,100%{transform:translateY(12px)} 50%{transform:translateY(0)} }
@keyframes ex-crunch-top  { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-28deg)} }
@keyframes ex-lunge-step  { 0%,100%{transform:translateX(0)} 50%{transform:translateX(8px)} }
@keyframes ex-dip-body    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }
@keyframes ex-row-arm     { 0%,100%{transform:rotate(10deg)} 50%{transform:rotate(-30deg)} }
@keyframes ex-bridge-hip  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
@keyframes ex-press-arm   { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-55deg)} }
@keyframes ex-deadlift-torso { 0%,100%{transform:rotate(45deg)} 50%{transform:rotate(0deg)} }
@keyframes ex-leg-raise   { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-80deg)} }
@keyframes ex-twist-torso { 0%,100%{transform:rotate(-25deg)} 50%{transform:rotate(25deg)} }
@keyframes ex-mountain-knee { 0%,100%{transform:translateX(0) translateY(0)} 50%{transform:translateX(10px) translateY(-10px)} }
@keyframes ex-jjump-body  { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-12px)} }
@keyframes ex-pose-arm    { 0%,100%{transform:rotate(-90deg) scaleX(1)} 50%{transform:rotate(-85deg) scaleX(1.05)} }
@keyframes ex-breathe     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
`;

// ── Shared stick-figure parts ──────────────────────────────────────────
const S = { stroke: 'var(--accent)', strokeWidth: 3.5, strokeLinecap: 'round', fill: 'none' };
const SB = { stroke: 'rgba(200,255,0,0.35)', strokeWidth: 2.5, strokeLinecap: 'round', fill: 'none' };
const HEAD = (cx=50, cy=12) => <circle cx={cx} cy={cy} r={8} stroke="var(--accent)" strokeWidth={3} fill="rgba(200,255,0,0.15)"/>;

// ── Individual exercise animations ─────────────────────────────────────

function PushUpAnim({ dur = 1.6 }) {
  return (
    <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }}>
      {/* ground */}
      <line x1="5" y1="74" x2="95" y2="74" {...SB}/>
      <g style={{ animation: `ex-pushup-down ${dur}s ease-in-out infinite`, transformOrigin: '50px 68px' }}>
        {HEAD(50, 28)}
        {/* torso horizontal */}
        <line x1="20" y1="40" x2="75" y2="40" {...S}/>
        {/* arms down */}
        <g style={{ animation: `ex-pushup-arm ${dur}s ease-in-out infinite`, transformOrigin: '20px 40px' }}>
          <line x1="20" y1="40" x2="14" y2="60" {...S}/>
        </g>
        <g style={{ animation: `ex-pushup-arm ${dur}s ease-in-out infinite`, transformOrigin: '75px 40px', animationDirection: 'reverse' }}>
          <line x1="75" y1="40" x2="81" y2="60" {...S}/>
        </g>
        {/* legs */}
        <line x1="60" y1="40" x2="55" y2="72" {...S}/>
        <line x1="55" y1="72" x2="50" y2="72" {...S}/>
      </g>
    </svg>
  );
}

function SquatAnim({ dur = 1.8 }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <line x1="10" y1="92" x2="90" y2="92" {...SB}/>
      <g style={{ animation: `ex-squat-body ${dur}s ease-in-out infinite`, transformOrigin: '50px 55px' }}>
        {HEAD()}
        <line x1="50" y1="20" x2="50" y2="55" {...S}/>
        {/* arms out */}
        <line x1="50" y1="32" x2="25" y2="45" {...S}/>
        <line x1="50" y1="32" x2="75" y2="45" {...S}/>
        {/* legs */}
        <line x1="50" y1="55" x2="32" y2="78" {...S}/>
        <line x1="32" y1="78" x2="28" y2="92" {...S}/>
        <line x1="50" y1="55" x2="68" y2="78" {...S}/>
        <line x1="68" y1="78" x2="72" y2="92" {...S}/>
      </g>
    </svg>
  );
}

function CurlAnim({ dur = 1.4 }) {
  return (
    <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
      <line x1="10" y1="102" x2="90" y2="102" {...SB}/>
      {HEAD()}
      <line x1="50" y1="20" x2="50" y2="62" {...S}/>
      {/* right arm curl */}
      <g style={{ animation: `ex-curl-arm ${dur}s ease-in-out infinite`, transformOrigin: '62px 38px' }}>
        <line x1="62" y1="38" x2="70" y2="58" {...S}/>
        <circle cx="70" cy="60" r="3" fill="var(--accent)" opacity="0.6"/>
      </g>
      {/* left arm static */}
      <line x1="38" y1="38" x2="30" y2="58" {...S}/>
      {/* legs */}
      <line x1="50" y1="62" x2="38" y2="82" {...S}/><line x1="38" y1="82" x2="35" y2="102" {...S}/>
      <line x1="50" y1="62" x2="62" y2="82" {...S}/><line x1="62" y1="82" x2="65" y2="102" {...S}/>
    </svg>
  );
}

function LateralRaiseAnim({ dur = 1.6 }) {
  return (
    <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
      <line x1="10" y1="102" x2="90" y2="102" {...SB}/>
      {HEAD()}
      <line x1="50" y1="20" x2="50" y2="62" {...S}/>
      <g style={{ animation: `ex-raise-arm ${dur}s ease-in-out infinite`, transformOrigin: '62px 35px' }}>
        <line x1="62" y1="35" x2="80" y2="50" {...S}/>
      </g>
      <g style={{ animation: `ex-raise-arm ${dur}s ease-in-out infinite`, transformOrigin: '38px 35px', animationDirection: 'reverse' }}>
        <line x1="38" y1="35" x2="20" y2="50" {...S}/>
      </g>
      <line x1="50" y1="62" x2="38" y2="82" {...S}/><line x1="38" y1="82" x2="35" y2="102" {...S}/>
      <line x1="50" y1="62" x2="62" y2="82" {...S}/><line x1="62" y1="82" x2="65" y2="102" {...S}/>
    </svg>
  );
}

function PlankAnim({ dur = 2.5 }) {
  return (
    <svg viewBox="0 0 100 70" style={{ width: '100%', height: '100%' }}>
      <line x1="5" y1="62" x2="95" y2="62" {...SB}/>
      <g style={{ animation: `ex-plank-pulse ${dur}s ease-in-out infinite` }}>
        {HEAD(18, 26)}
        <line x1="26" y1="30" x2="78" y2="30" {...S}/>
        <line x1="26" y1="30" x2="20" y2="62" {...S}/>
        <line x1="30" y1="30" x2="24" y2="62" {...S}/>
        <line x1="72" y1="30" x2="70" y2="62" {...S}/>
        <line x1="78" y1="30" x2="76" y2="62" {...S}/>
      </g>
    </svg>
  );
}

function PullUpAnim({ dur = 2.0 }) {
  return (
    <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
      {/* bar */}
      <line x1="15" y1="8" x2="85" y2="8" {...S} strokeWidth={5}/>
      <g style={{ animation: `ex-pullup-body ${dur}s ease-in-out infinite`, transformOrigin: '50px 8px' }}>
        {HEAD(50, 28)}
        <line x1="50" y1="20" x2="50" y2="62" {...S}/>
        <line x1="50" y1="22" x2="30" y2="8" {...S}/>
        <line x1="50" y1="22" x2="70" y2="8" {...S}/>
        <line x1="50" y1="62" x2="38" y2="82" {...S}/>
        <line x1="50" y1="62" x2="62" y2="82" {...S}/>
      </g>
    </svg>
  );
}

function CrunchAnim({ dur = 1.5 }) {
  return (
    <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }}>
      <line x1="5" y1="74" x2="95" y2="74" {...SB}/>
      {/* lower body lying flat */}
      <line x1="50" y1="68" x2="30" y2="74" {...S}/>
      <line x1="50" y1="68" x2="70" y2="74" {...S}/>
      {/* upper body crunching */}
      <g style={{ animation: `ex-crunch-top ${dur}s ease-in-out infinite`, transformOrigin: '50px 68px' }}>
        {HEAD(50, 38)}
        <line x1="50" y1="46" x2="50" y2="68" {...S}/>
        <line x1="50" y1="52" x2="36" y2="60" {...S}/>
        <line x1="50" y1="52" x2="64" y2="60" {...S}/>
      </g>
    </svg>
  );
}

function DipAnim({ dur = 1.6 }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      {/* parallel bars */}
      <line x1="20" y1="30" x2="20" y2="8" {...S} strokeWidth={4}/>
      <line x1="80" y1="30" x2="80" y2="8" {...S} strokeWidth={4}/>
      <line x1="15" y1="8" x2="25" y2="8" {...S} strokeWidth={4}/>
      <line x1="75" y1="8" x2="85" y2="8" {...S} strokeWidth={4}/>
      <g style={{ animation: `ex-dip-body ${dur}s ease-in-out infinite`, transformOrigin: '50px 30px' }}>
        {HEAD()}
        <line x1="50" y1="20" x2="50" y2="55" {...S}/>
        <line x1="50" y1="30" x2="20" y2="30" {...S}/>
        <line x1="50" y1="30" x2="80" y2="30" {...S}/>
        <line x1="50" y1="55" x2="38" y2="75" {...S}/><line x1="38" y1="75" x2="36" y2="92" {...S}/>
        <line x1="50" y1="55" x2="62" y2="75" {...S}/><line x1="62" y1="75" x2="64" y2="92" {...S}/>
      </g>
    </svg>
  );
}

function LungeAnim({ dur = 1.8 }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <line x1="5" y1="92" x2="95" y2="92" {...SB}/>
      <g style={{ animation: `ex-lunge-step ${dur}s ease-in-out infinite`, transformOrigin: '50px 50px' }}>
        {HEAD()}
        <line x1="50" y1="20" x2="50" y2="58" {...S}/>
        <line x1="50" y1="35" x2="35" y2="48" {...S}/>
        <line x1="50" y1="35" x2="65" y2="48" {...S}/>
        {/* front leg bent */}
        <line x1="50" y1="58" x2="30" y2="78" {...S}/>
        <line x1="30" y1="78" x2="28" y2="92" {...S}/>
        {/* back leg */}
        <line x1="50" y1="58" x2="68" y2="72" {...S}/>
        <line x1="68" y1="72" x2="72" y2="58" {...S}/>
        <line x1="72" y1="58" x2="80" y2="92" {...S}/>
      </g>
    </svg>
  );
}

function RowAnim({ dur = 1.5 }) {
  return (
    <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }}>
      <line x1="5" y1="72" x2="95" y2="72" {...SB}/>
      {HEAD(30, 18)}
      {/* torso angled */}
      <line x1="38" y1="24" x2="70" y2="48" {...S}/>
      {/* rowing arm */}
      <g style={{ animation: `ex-row-arm ${dur}s ease-in-out infinite`, transformOrigin: '55px 35px' }}>
        <line x1="55" y1="35" x2="40" y2="55" {...S}/>
        <circle cx="39" cy="57" r="3" fill="var(--accent)" opacity="0.5"/>
      </g>
      {/* support arm */}
      <line x1="38" y1="30" x2="22" y2="50" {...S}/>
      {/* legs */}
      <line x1="70" y1="48" x2="65" y2="72" {...S}/>
      <line x1="70" y1="48" x2="82" y2="72" {...S}/>
    </svg>
  );
}

function GluteBridgeAnim({ dur = 1.8 }) {
  return (
    <svg viewBox="0 0 100 70" style={{ width: '100%', height: '100%' }}>
      <line x1="5" y1="64" x2="95" y2="64" {...SB}/>
      {HEAD(18, 52)}
      {/* shoulders on ground */}
      <line x1="26" y1="56" x2="55" y2="50" {...S}/>
      {/* hips rising */}
      <g style={{ animation: `ex-bridge-hip ${dur}s ease-in-out infinite`, transformOrigin: '55px 50px' }}>
        <line x1="55" y1="50" x2="72" y2="64" {...S}/>
        <line x1="72" y1="64" x2="80" y2="64" {...S}/>
      </g>
      {/* other leg */}
      <line x1="55" y1="50" x2="65" y2="64" {...S}/>
    </svg>
  );
}

function OverheadPressAnim({ dur = 1.6 }) {
  return (
    <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
      <line x1="10" y1="102" x2="90" y2="102" {...SB}/>
      {HEAD()}
      <line x1="50" y1="20" x2="50" y2="62" {...S}/>
      <g style={{ animation: `ex-press-arm ${dur}s ease-in-out infinite`, transformOrigin: '50px 32px' }}>
        <line x1="50" y1="32" x2="25" y2="25" {...S}/>
        <line x1="50" y1="32" x2="75" y2="25" {...S}/>
        {/* barbell */}
        <line x1="18" y1="22" x2="82" y2="22" {...S} strokeWidth={4}/>
      </g>
      <line x1="50" y1="62" x2="38" y2="82" {...S}/><line x1="38" y1="82" x2="35" y2="102" {...S}/>
      <line x1="50" y1="62" x2="62" y2="82" {...S}/><line x1="62" y1="82" x2="65" y2="102" {...S}/>
    </svg>
  );
}

function DeadliftAnim({ dur = 2.0 }) {
  return (
    <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
      <line x1="10" y1="102" x2="90" y2="102" {...SB}/>
      <g style={{ animation: `ex-deadlift-torso ${dur}s ease-in-out infinite`, transformOrigin: '50px 65px' }}>
        {HEAD(50, 18)}
        <line x1="50" y1="26" x2="50" y2="65" {...S}/>
        <line x1="50" y1="38" x2="30" y2="60" {...S}/>
        <line x1="50" y1="38" x2="70" y2="60" {...S}/>
        {/* barbell */}
        <line x1="22" y1="58" x2="78" y2="58" {...S} strokeWidth={4}/>
        <circle cx="22" cy="58" r="6" stroke="var(--accent)" strokeWidth={2.5} fill="rgba(200,255,0,0.1)"/>
        <circle cx="78" cy="58" r="6" stroke="var(--accent)" strokeWidth={2.5} fill="rgba(200,255,0,0.1)"/>
      </g>
      <line x1="50" y1="65" x2="38" y2="85" {...S}/><line x1="38" y1="85" x2="35" y2="102" {...S}/>
      <line x1="50" y1="65" x2="62" y2="85" {...S}/><line x1="62" y1="85" x2="65" y2="102" {...S}/>
    </svg>
  );
}

function LegRaiseAnim({ dur = 1.8 }) {
  return (
    <svg viewBox="0 0 100 70" style={{ width: '100%', height: '100%' }}>
      <line x1="5" y1="62" x2="95" y2="62" {...SB}/>
      {HEAD(22, 52)}
      <line x1="30" y1="56" x2="70" y2="56" {...S}/>
      <line x1="60" y1="56" x2="50" y2="62" {...S}/>
      <g style={{ animation: `ex-leg-raise ${dur}s ease-in-out infinite`, transformOrigin: '70px 56px' }}>
        <line x1="70" y1="56" x2="90" y2="40" {...S}/>
        <line x1="90" y1="40" x2="96" y2="40" {...S}/>
      </g>
    </svg>
  );
}

function RussianTwistAnim({ dur = 1.2 }) {
  return (
    <svg viewBox="0 0 100 80" style={{ width: '100%', height: '100%' }}>
      <line x1="5" y1="72" x2="95" y2="72" {...SB}/>
      {/* legs angled */}
      <line x1="48" y1="60" x2="35" y2="72" {...S}/>
      <line x1="52" y1="60" x2="65" y2="72" {...S}/>
      <g style={{ animation: `ex-twist-torso ${dur}s ease-in-out infinite`, transformOrigin: '50px 55px' }}>
        {HEAD()}
        <line x1="50" y1="20" x2="50" y2="55" {...S}/>
        <line x1="50" y1="38" x2="28" y2="50" {...S}/>
        <line x1="50" y1="38" x2="72" y2="50" {...S}/>
      </g>
    </svg>
  );
}

function MountainClimberAnim({ dur = 0.7 }) {
  return (
    <svg viewBox="0 0 100 70" style={{ width: '100%', height: '100%' }}>
      <line x1="5" y1="64" x2="95" y2="64" {...SB}/>
      {HEAD(20, 24)}
      <line x1="28" y1="30" x2="72" y2="30" {...S}/>
      <line x1="28" y1="30" x2="18" y2="58" {...S}/>
      <line x1="25" y1="30" x2="15" y2="58" {...S}/>
      <g style={{ animation: `ex-mountain-knee ${dur}s ease-in-out infinite`, transformOrigin: '60px 30px' }}>
        <line x1="72" y1="30" x2="60" y2="50" {...S}/>
        <line x1="60" y1="50" x2="65" y2="64" {...S}/>
      </g>
      <g style={{ animation: `ex-mountain-knee ${dur}s ease-in-out infinite`, transformOrigin: '72px 30px', animationDelay: `${dur/2}s`, animationDirection: 'reverse' }}>
        <line x1="72" y1="30" x2="80" y2="58" {...S}/>
        <line x1="80" y1="58" x2="82" y2="64" {...S}/>
      </g>
    </svg>
  );
}

function JumpSquatAnim({ dur = 1.2 }) {
  return (
    <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
      <line x1="10" y1="100" x2="90" y2="100" {...SB}/>
      <g style={{ animation: `ex-jjump-body ${dur}s ease-in-out infinite`, transformOrigin: '50px 60px' }}>
        {HEAD()}
        <line x1="50" y1="20" x2="50" y2="58" {...S}/>
        <line x1="50" y1="32" x2="28" y2="48" {...S}/>
        <line x1="50" y1="32" x2="72" y2="48" {...S}/>
        <line x1="50" y1="58" x2="35" y2="82" {...S}/><line x1="35" y1="82" x2="33" y2="100" {...S}/>
        <line x1="50" y1="58" x2="65" y2="82" {...S}/><line x1="65" y1="82" x2="67" y2="100" {...S}/>
      </g>
    </svg>
  );
}

function PoseAnim({ dur = 2.5 }) {
  // Front double biceps pose
  return (
    <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }}>
      <line x1="10" y1="112" x2="90" y2="112" {...SB}/>
      <g style={{ animation: `ex-breathe ${dur}s ease-in-out infinite` }}>
        {HEAD()}
        <line x1="50" y1="20" x2="50" y2="68" {...S}/>
        {/* arms raised */}
        <g style={{ animation: `ex-pose-arm ${dur}s ease-in-out infinite`, transformOrigin: '62px 32px' }}>
          <line x1="62" y1="32" x2="78" y2="22" {...S}/>
          <line x1="78" y1="22" x2="72" y2="14" {...S}/>
        </g>
        <g style={{ animation: `ex-pose-arm ${dur}s ease-in-out infinite`, transformOrigin: '38px 32px', animationDirection: 'reverse' }}>
          <line x1="38" y1="32" x2="22" y2="22" {...S}/>
          <line x1="22" y1="22" x2="28" y2="14" {...S}/>
        </g>
        <line x1="50" y1="68" x2="36" y2="90" {...S}/><line x1="36" y1="90" x2="33" y2="112" {...S}/>
        <line x1="50" y1="68" x2="64" y2="90" {...S}/><line x1="64" y1="90" x2="67" y2="112" {...S}/>
      </g>
    </svg>
  );
}

function GenericAnim({ dur = 2.0 }) {
  return (
    <svg viewBox="0 0 100 110" style={{ width: '100%', height: '100%' }}>
      <line x1="10" y1="102" x2="90" y2="102" {...SB}/>
      <g style={{ animation: `ex-breathe ${dur}s ease-in-out infinite` }}>
        {HEAD()}
        <line x1="50" y1="20" x2="50" y2="62" {...S}/>
        <line x1="50" y1="32" x2="30" y2="48" {...S}/>
        <line x1="50" y1="32" x2="70" y2="48" {...S}/>
        <line x1="50" y1="62" x2="38" y2="82" {...S}/><line x1="38" y1="82" x2="35" y2="102" {...S}/>
        <line x1="50" y1="62" x2="62" y2="82" {...S}/><line x1="62" y1="82" x2="65" y2="102" {...S}/>
      </g>
    </svg>
  );
}

// ── Exercise → animation map ────────────────────────────────────────────
const ANIM_MAP = {
  // Push variants
  'pushup': PushUpAnim, 'incline-pushup': PushUpAnim,
  'decline-pushup': PushUpAnim, 'diamond-pushup': PushUpAnim,
  'wide-pushup': PushUpAnim, 'pike-pushup': PushUpAnim,
  'incline-dumbbell-press': OverheadPressAnim,
  'dumbbell-fly': LateralRaiseAnim, 'cable-fly': LateralRaiseAnim,

  // Pull
  'pullup': PullUpAnim, 'chinup': PullUpAnim, 'dead-hang': PullUpAnim,
  'bodyweight-row': RowAnim, 'barbell-row': RowAnim,
  'dumbbell-row': RowAnim, 'seated-cable-row': RowAnim,
  'lat-pulldown': PullUpAnim,

  // Shoulders
  'lateral-raise': LateralRaiseAnim, 'front-raise': LateralRaiseAnim,
  'cable-lateral-raise': LateralRaiseAnim,
  'overhead-press': OverheadPressAnim, 'arnold-press': OverheadPressAnim,
  'face-pull': RowAnim, 'shoulder-tap': PlankAnim,

  // Arms
  'bicep-curl': CurlAnim, 'hammer-curl': CurlAnim,
  'concentration-curl': CurlAnim, 'barbell-curl': CurlAnim,
  'cable-curl': CurlAnim,
  'dip': DipAnim, 'bench-dip': DipAnim,
  'tricep-extension': CurlAnim, 'skull-crusher': CurlAnim,
  'tricep-pushdown': CurlAnim, 'cable-kickback': CurlAnim,

  // Legs
  'squat': SquatAnim, 'barbell-squat': SquatAnim,
  'lunge': LungeAnim, 'bulgarian-split-squat': LungeAnim,
  'single-leg-squat': SquatAnim, 'jump-squat': JumpSquatAnim,
  'glute-bridge': GluteBridgeAnim,
  'calf-raise': SquatAnim,
  'barbell-deadlift': DeadliftAnim, 'romanian-deadlift': DeadliftAnim,

  // Core
  'plank': PlankAnim, 'hollow-body': PlankAnim,
  'crunch': CrunchAnim, 'leg-raise': LegRaiseAnim,
  'mountain-climber': MountainClimberAnim,
  'russian-twist': RussianTwistAnim,
  'superman': PlankAnim,

  // Poses
  'pose-front-double-biceps': PoseAnim,
  'pose-front-lat-spread': PoseAnim,
  'pose-side-chest': PoseAnim,
  'pose-side-triceps': PoseAnim,
  'pose-abs-thighs': PoseAnim,
  'pose-most-muscular': PoseAnim,
  'pose-back-double-biceps': PoseAnim,
  'pose-back-lat-spread': PoseAnim,
  'pose-mp-front': PoseAnim,
  'pose-mp-back': PoseAnim,
  'pose-mp-side': PoseAnim,
};

// ── Main export ─────────────────────────────────────────────────────────
export default function ExerciseGif({ exerciseId, size = 160 }) {
  const AnimComponent = ANIM_MAP[exerciseId] || GenericAnim;

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '16px',
      overflow: 'hidden',
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      position: 'relative',
    }}>
      <style>{KEYFRAMES}</style>
      {/* Subtle accent glow bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 60%, rgba(200,255,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <AnimComponent />
    </div>
  );
}
