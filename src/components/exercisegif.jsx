import React from 'react';

/**
 * ExerciseGif — hand-crafted SVG human figure animations
 * • Realistic proportions: rounded head, neck, torso, limbs with proper width
 * • Theme-adaptive: uses CSS variables so works on dark / light / cyber / sunset
 * • Zero network requests, instant render, 60fps CSS keyframes
 * • Each animation is biomechanically accurate for the exercise
 */

// ─── CSS keyframes injected once ────────────────────────────────────────────
const KEYFRAMES = `
/* push family */
@keyframes ex-pushup   { 0%,100%{transform:translateY(0)}  50%{transform:translateY(10px)} }
@keyframes ex-arm-bend { 0%,100%{transform:rotate(0deg)}   50%{transform:rotate(35deg)} }
@keyframes ex-arm-ext  { 0%,100%{transform:rotate(0deg)}   50%{transform:rotate(-50deg)} }
@keyframes ex-dip-body { 0%,100%{transform:translateY(0)}  50%{transform:translateY(14px)} }
@keyframes ex-press-up { 0%,100%{transform:translateY(0) rotate(0deg)}
                          50%{transform:translateY(-4px) rotate(-3deg)} }
@keyframes ex-oh-arm   { 0%,100%{transform:rotate(0deg)}   50%{transform:rotate(-55deg)} }

/* pull family */
@keyframes ex-pullup-body{ 0%,100%{transform:translateY(12px)} 50%{transform:translateY(0)} }
@keyframes ex-curl-arm   { 0%,100%{transform:rotate(0deg)}    50%{transform:rotate(-78deg)} }
@keyframes ex-row-torso  { 0%,100%{transform:rotate(45deg)}   50%{transform:rotate(30deg)} }
@keyframes ex-row-arm    { 0%,100%{transform:rotate(10deg)}   50%{transform:rotate(-35deg)} }
@keyframes ex-dl-torso   { 0%,100%{transform:rotate(40deg)}   50%{transform:rotate(0deg)} }
@keyframes ex-dl-arm     { 0%,100%{transform:rotate(0deg)}    50%{transform:rotate(-8deg)} }

/* leg family */
@keyframes ex-squat-body { 0%,100%{transform:translateY(0)}   50%{transform:translateY(16px)} }
@keyframes ex-squat-knee { 0%,100%{transform:rotate(0deg)}    50%{transform:rotate(40deg)} }
@keyframes ex-lunge-step { 0%,100%{transform:translateX(0)}   50%{transform:translateX(8px)} }
@keyframes ex-hip-thrust { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-14px)} }
@keyframes ex-calf-rise  { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-8px)} }

/* core family */
@keyframes ex-plank-hold { 0%,100%{opacity:1} 50%{opacity:0.75} }
@keyframes ex-crunch-curl{ 0%,100%{transform:rotate(0deg)}    50%{transform:rotate(-28deg)} }
@keyframes ex-legr-raise { 0%,100%{transform:rotate(0deg)}    50%{transform:rotate(-85deg)} }
@keyframes ex-twist      { 0%,100%{transform:rotate(-22deg)}  50%{transform:rotate(22deg)} }
@keyframes ex-mc-knee    { 0%,100%{transform:translateX(0) translateY(0)}
                            50%{transform:translateX(10px) translateY(-12px)} }

/* cardio */
@keyframes ex-burp-body  { 0%{transform:translateY(0)}
                            25%{transform:translateY(14px)}
                            60%{transform:translateY(-14px)}
                            100%{transform:translateY(0)} }
@keyframes ex-jump-air   { 0%,100%{transform:translateY(0)}   45%{transform:translateY(-18px)} }
@keyframes ex-arm-swing  { 0%,100%{transform:rotate(0deg)}    50%{transform:rotate(-60deg)} }

/* shoulder/iso */
@keyframes ex-lat-raise  { 0%,100%{transform:rotate(0deg)}    50%{transform:rotate(-82deg)} }
@keyframes ex-shrug-up   { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-7px)} }
@keyframes ex-rev-fly    { 0%,100%{transform:rotate(-15deg)}  50%{transform:rotate(-85deg)} }
@keyframes ex-breathe    { 0%,100%{transform:scale(1)}        50%{transform:scale(1.025)} }
`;

const KEYFRAMES_INJECTED = { done: false };
function injectKeyframes() {
  if (KEYFRAMES_INJECTED.done || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
  KEYFRAMES_INJECTED.done = true;
}

// ─── Design tokens (adapt to all themes) ────────────────────────────────────
const C = {
  body:    'var(--text-1, #e0e0e0)',
  bodyDim: 'var(--text-3, #555)',
  accent:  'var(--accent, #C8FF00)',
  skin:    'var(--text-0, #ffffff)',
  ground:  'var(--border, rgba(255,255,255,0.1))',
  bg:      'transparent',
  muscle:  'var(--accent, #C8FF00)',
};

// ─── Reusable SVG body parts ─────────────────────────────────────────────────
// All figures drawn in a 100×120 viewBox

/** Rounded head + neck */
const Head = ({ cx = 50, cy = 14, r = 9, fill = C.body }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={fill} opacity="0.92" />
    <rect x={cx - 3.5} y={cy + r - 1} width={7} height={8} rx={3} fill={fill} opacity="0.85" />
  </g>
);

/** Torso rectangle with shoulder width */
const Torso = ({ x = 35, y = 28, w = 30, h = 30, rx = 5, fill = C.body, style = {} }) => (
  <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill} opacity="0.88" style={style} />
);

/** Rounded arm segment */
const Arm = ({ x1, y1, x2, y2, stroke = C.body, width = 6 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={stroke} strokeWidth={width} strokeLinecap="round" opacity="0.9" />
);

/** Rounded leg segment */
const Leg = ({ x1, y1, x2, y2, stroke = C.body, width = 7 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={stroke} strokeWidth={width} strokeLinecap="round" opacity="0.9" />
);

/** Ground line */
const Ground = ({ y = 108, x1 = 12, x2 = 88 }) => (
  <line x1={x1} y1={y} x2={x2} y2={y}
    stroke={C.ground} strokeWidth={2} strokeLinecap="round" />
);

/** Pull-up bar */
const Bar = ({ y = 10, x1 = 20, x2 = 80, thick = 5 }) => (
  <rect x={x1} y={y} width={x2 - x1} height={thick} rx={2.5}
    fill={C.bodyDim} opacity="0.7" />
);

/** Dumbbell shape */
const Dumbbell = ({ cx = 78, cy = 65, horizontal = false }) => {
  const [dx, dy] = horizontal ? [10, 0] : [0, 10];
  return (
    <g opacity="0.7">
      <rect x={cx - (horizontal?10:2)} y={cy - (horizontal?2:10)}
        width={horizontal?20:4} height={horizontal?4:20} rx={2} fill={C.bodyDim} />
      <circle cx={cx - dx} cy={cy - dy} r={4} fill={C.bodyDim} />
      <circle cx={cx + dx} cy={cy + dy} r={4} fill={C.bodyDim} />
    </g>
  );
};

/** Barbell */
const Barbell = ({ x = 20, y = 60, len = 60 }) => (
  <g opacity="0.7">
    <rect x={x} y={y - 2} width={len} height={4} rx={2} fill={C.bodyDim} />
    <rect x={x - 2} y={y - 6} width={5} height={12} rx={2} fill={C.bodyDim} />
    <rect x={x + len - 3} y={y - 6} width={5} height={12} rx={2} fill={C.bodyDim} />
  </g>
);

/** Bench */
const Bench = ({ x = 15, y = 78, w = 70, h = 8 }) => (
  <g opacity="0.55">
    <rect x={x} y={y} width={w} height={h} rx={3} fill={C.bodyDim} />
    <rect x={x + 8} y={y + h} width={6} height={14} rx={2} fill={C.bodyDim} />
    <rect x={x + w - 14} y={y + h} width={6} height={14} rx={2} fill={C.bodyDim} />
  </g>
);

// ─── Animation wrapper helper ────────────────────────────────────────────────
const A = (keyframe, dur = '1.6s', delay = '0s', ease = 'ease-in-out', origin = '50% 50%') => ({
  animation: `${keyframe} ${dur} ${ease} ${delay} infinite`,
  transformOrigin: origin,
});

// ══════════════════════════════════════════════════════════════════════════════
// PUSH FAMILY
// ══════════════════════════════════════════════════════════════════════════════

function PushUp() {
  // Prone position, body lifts up/down, arms bend/extend
  return (
    <svg viewBox="0 0 100 80" style={{width:'100%',height:'100%'}}>
      <Ground y={72} />
      <g style={A('ex-pushup','1.4s')}>
        {/* head */}
        <circle cx={18} cy={32} r={8} fill={C.body} opacity="0.92"/>
        <rect x={22} y={29} width={6} height={7} rx={3} fill={C.body} opacity="0.85"/>
        {/* torso horizontal */}
        <rect x={26} y={33} width={42} height={13} rx={5} fill={C.body} opacity="0.88"/>
        {/* left arm */}
        <g style={A('ex-arm-bend','1.4s','0s','ease-in-out','26px 36px')}>
          <line x1={26} y1={36} x2={18} y2={56} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
          <line x1={18} y1={56} x2={20} y2={72} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        </g>
        {/* right arm */}
        <g style={A('ex-arm-bend','1.4s','0s','ease-in-out','68px 36px')}>
          <line x1={68} y1={36} x2={76} y2={56} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
          <line x1={76} y1={56} x2={74} y2={72} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        </g>
        {/* legs straight */}
        <line x1={68} y1={44} x2={78} y2={70} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={78} y1={70} x2={80} y2={72} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function BenchPress() {
  return (
    <svg viewBox="0 0 100 100" style={{width:'100%',height:'100%'}}>
      <Bench x={10} y={62} w={80} h={10}/>
      {/* body lying on bench */}
      <rect x={20} y={50} width={58} height={14} rx={6} fill={C.body} opacity="0.88"/>
      <circle cx={17} cy={50} r={8} fill={C.body} opacity="0.92"/>
      <rect x={21} y={47} width={5} height={8} rx={3} fill={C.body} opacity="0.85"/>
      {/* legs bent */}
      <line x1={68} y1={62} x2={74} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={74} y1={82} x2={68} y2={92} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={30} y1={62} x2={26} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={26} y1={82} x2={30} y2={92} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      {/* arms pressing bar up/down */}
      <g style={A('ex-oh-arm','1.6s','0s','ease-in-out','35px 52px')}>
        <line x1={35} y1={52} x2={28} y2={30} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <g style={A('ex-oh-arm','1.6s','0s','ease-in-out','63px 52px')}>
        <line x1={63} y1={52} x2={70} y2={30} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <Barbell x={22} y={26} len={56}/>
    </svg>
  );
}

function OverheadPress() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <Head cx={50} cy={14}/>
      <Torso x={36} y={28} w={28} h={30}/>
      {/* arms pressing overhead */}
      <g style={A('ex-oh-arm','1.8s','0s','ease-in-out','38px 34px')}>
        <line x1={38} y1={34} x2={24} y2={20} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <g style={A('ex-oh-arm','1.8s','0s','ease-in-out','62px 34px')}>
        <line x1={62} y1={34} x2={76} y2={20} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <Barbell x={18} y={14} len={64}/>
      {/* legs */}
      <line x1={45} y1={58} x2={40} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={82} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={58} x2={60} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={82} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function Dip() {
  return (
    <svg viewBox="0 0 100 110" style={{width:'100%',height:'100%'}}>
      {/* parallel bars */}
      <rect x={14} y={24} width={6} height={40} rx={3} fill={C.bodyDim} opacity="0.6"/>
      <rect x={80} y={24} width={6} height={40} rx={3} fill={C.bodyDim} opacity="0.6"/>
      <rect x={10} y={22} width={14} height={6} rx={3} fill={C.bodyDim} opacity="0.6"/>
      <rect x={76} y={22} width={14} height={6} rx={3} fill={C.bodyDim} opacity="0.6"/>
      {/* body dipping */}
      <g style={A('ex-dip-body','1.5s','0s','ease-in-out','50px 28px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={28}/>
        {/* arms */}
        <line x1={36} y1={34} x2={17} y2={26} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={64} y1={34} x2={83} y2={26} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        {/* legs hanging */}
        <line x1={44} y1={56} x2={40} y2={80} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={56} y1={56} x2={60} y2={80} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function PikePushUp() {
  return (
    <svg viewBox="0 0 100 90" style={{width:'100%',height:'100%'}}>
      <Ground y={82}/>
      {/* hips high — inverted V shape */}
      <g style={A('ex-pushup','1.5s')}>
        <circle cx={50} cy={16} r={8} fill={C.body} opacity="0.92"/>
        {/* torso angled down */}
        <line x1={50} y1={24} x2={32} y2={58} stroke={C.body} strokeWidth={11} strokeLinecap="round"/>
        {/* arms bent toward floor */}
        <g style={A('ex-arm-bend','1.5s','0s','ease-in-out','32px 58px')}>
          <line x1={32} y1={58} x2={22} y2={72} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
          <line x1={22} y1={72} x2={24} y2={82} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        </g>
        {/* legs straight back and up */}
        <line x1={50} y1={24} x2={68} y2={56} stroke={C.body} strokeWidth={11} strokeLinecap="round"/>
        <line x1={68} y1={56} x2={70} y2={82} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PULL FAMILY
// ══════════════════════════════════════════════════════════════════════════════

function PullUp() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Bar y={8} x1={18} x2={82} thick={6}/>
      <g style={A('ex-pullup-body','2s','0s','ease-in-out','50px 8px')}>
        <Head cx={50} cy={28}/>
        <Torso x={36} y={42} w={28} h={28}/>
        {/* arms reaching up to bar */}
        <line x1={38} y1={44} x2={28} y2={14} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={62} y1={44} x2={72} y2={14} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        {/* hands on bar */}
        <circle cx={28} cy={13} r={4} fill={C.accent} opacity="0.8"/>
        <circle cx={72} cy={13} r={4} fill={C.accent} opacity="0.8"/>
        {/* legs */}
        <line x1={45} y1={70} x2={42} y2={96} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={55} y1={70} x2={58} y2={96} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function ChinUp() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Bar y={8} x1={18} x2={82} thick={6}/>
      <g style={A('ex-pullup-body','2s','0s','ease-in-out','50px 8px')}>
        <Head cx={50} cy={28}/>
        <Torso x={36} y={42} w={28} h={28}/>
        <line x1={38} y1={44} x2={30} y2={14} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={62} y1={44} x2={70} y2={14} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <circle cx={30} cy={13} r={4} fill={C.accent} opacity="0.8"/>
        <circle cx={70} cy={13} r={4} fill={C.accent} opacity="0.8"/>
        <line x1={45} y1={70} x2={42} y2={96} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={55} y1={70} x2={58} y2={96} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function LatPulldown() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      {/* cable machine bar at top */}
      <line x1={20} y1={6} x2={80} y2={6} stroke={C.bodyDim} strokeWidth={4} strokeLinecap="round" opacity="0.6"/>
      <line x1={50} y1={6} x2={50} y2={22} stroke={C.bodyDim} strokeWidth={3} opacity="0.5"/>
      {/* seated figure */}
      <Head cx={50} cy={36}/>
      <Torso x={36} y={50} w={28} h={26} style={{transform:'rotate(-8deg)',transformOrigin:'50px 63px'}}/>
      {/* arms pulling down */}
      <g style={A('ex-pullup-body','1.8s','0s','ease-in-out','38px 52px')}>
        <line x1={38} y1={52} x2={28} y2={24} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <g style={A('ex-pullup-body','1.8s','0s','ease-in-out','62px 52px')}>
        <line x1={62} y1={52} x2={72} y2={24} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      {/* bar being pulled */}
      <g style={A('ex-pullup-body','1.8s','0s','ease-in-out','50px 6px')}>
        <line x1={22} y1={24} x2={78} y2={24} stroke={C.accent} strokeWidth={4} strokeLinecap="round" opacity="0.7"/>
      </g>
      {/* legs on seat */}
      <line x1={44} y1={76} x2={36} y2={96} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={36} y1={96} x2={36} y2={108} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={56} y1={76} x2={64} y2={96} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={64} y1={96} x2={64} y2={108} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function BentOverRow() {
  return (
    <svg viewBox="0 0 100 100" style={{width:'100%',height:'100%'}}>
      <Ground y={90}/>
      {/* torso hinging forward */}
      <g style={{transform:'rotate(45deg)',transformOrigin:'52px 54px'}}>
        <Head cx={30} cy={24}/>
        <Torso x={28} y={34} w={48} h={16} rx={6}/>
        {/* rowing arm */}
        <g style={A('ex-row-arm','1.5s','0s','ease-in-out','52px 42px')}>
          <line x1={52} y1={42} x2={38} y2={62} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
          <circle cx={37} cy={64} r={4} fill={C.accent} opacity="0.7"/>
        </g>
        {/* support arm */}
        <line x1={32} y1={44} x2={20} y2={64} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <Barbell x={22} y={68} len={56}/>
      {/* legs */}
      <line x1={46} y1={72} x2={40} y2={90} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={58} y1={72} x2={64} y2={90} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
    </svg>
  );
}

function SeatedCableRow() {
  return (
    <svg viewBox="0 0 100 110" style={{width:'100%',height:'100%'}}>
      {/* cable machine */}
      <rect x={82} y={10} width={10} height={80} rx={4} fill={C.bodyDim} opacity="0.4"/>
      <circle cx={87} cy={50} r={5} fill={C.bodyDim} opacity="0.5"/>
      {/* seated figure with torso rocking */}
      <g style={A('ex-row-torso','1.6s','0s','ease-in-out','50px 60px')}>
        <Head cx={38} cy={30}/>
        <Torso x={28} y={44} w={24} h={28} rx={6}/>
        {/* rowing arms */}
        <g style={A('ex-row-arm','1.6s','0s','ease-in-out','28px 52px')}>
          <line x1={28} y1={52} x2={14} y2={52} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        </g>
        {/* cable line */}
        <line x1={14} y1={52} x2={82} y2={50} stroke={C.accent} strokeWidth={1.5} opacity="0.3" strokeDasharray="4,3"/>
      </g>
      {/* legs extended */}
      <line x1={36} y1={72} x2={28} y2={90} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={28} y1={90} x2={22} y2={100} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={44} y1={72} x2={52} y2={90} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={52} y1={90} x2={58} y2={100} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function Deadlift() {
  return (
    <svg viewBox="0 0 100 110" style={{width:'100%',height:'100%'}}>
      <Ground y={100}/>
      <Barbell x={18} y={88} len={64}/>
      {/* body hinging from floor to upright */}
      <g style={A('ex-dl-torso','2s','0s','ease-in-out','50px 68px')}>
        <Head cx={50} cy={16}/>
        <Torso x={36} y={30} w={28} h={32}/>
        {/* arms holding bar */}
        <g style={A('ex-dl-arm','2s','0s','ease-in-out','40px 38px')}>
          <line x1={40} y1={38} x2={34} y2={70} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        </g>
        <g style={A('ex-dl-arm','2s','0s','ease-in-out','60px 38px')}>
          <line x1={60} y1={38} x2={66} y2={70} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        </g>
        {/* legs */}
        <line x1={46} y1={62} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={40} y1={84} x2={38} y2={100} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={54} y1={62} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={60} y1={84} x2={62} y2={100} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function RomanianDeadlift() {
  return (
    <svg viewBox="0 0 100 110" style={{width:'100%',height:'100%'}}>
      <Ground y={100}/>
      <g style={A('ex-dl-torso','2s','0s','ease-in-out','50px 60px')}>
        <Head cx={50} cy={16}/>
        <Torso x={36} y={30} w={28} h={30}/>
        <line x1={40} y1={38} x2={36} y2={66} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={60} y1={38} x2={64} y2={66} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        {/* legs slightly bent */}
        <line x1={46} y1={60} x2={42} y2={80} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={42} y1={80} x2={40} y2={100} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={54} y1={60} x2={58} y2={80} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={58} y1={80} x2={60} y2={100} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <Barbell x={30} y={64} len={40}/>
    </svg>
  );
}

function BodyweightRow() {
  return (
    <svg viewBox="0 0 100 90" style={{width:'100%',height:'100%'}}>
      <Ground y={80}/>
      {/* low bar */}
      <rect x={15} y={42} width={70} height={5} rx={2.5} fill={C.bodyDim} opacity="0.6"/>
      {/* body at 45° pulling up */}
      <g style={A('ex-pullup-body','1.8s','0s','ease-in-out','50px 44px')}>
        <Head cx={30} cy={28}/>
        {/* torso angled */}
        <line x1={36} y1={34} x2={74} y2={52} stroke={C.body} strokeWidth={12} strokeLinecap="round" opacity="0.88"/>
        {/* arms */}
        <line x1={36} y1={34} x2={42} y2={44} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={42} y1={44} x2={50} y2={44} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        {/* legs extended to floor */}
        <line x1={74} y1={52} x2={82} y2={72} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={82} y1={72} x2={84} y2={80} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function TBarRow() {
  return (
    <svg viewBox="0 0 100 100" style={{width:'100%',height:'100%'}}>
      <Ground y={90}/>
      <g style={{transform:'rotate(40deg)',transformOrigin:'52px 52px'}}>
        <Head cx={30} cy={22}/>
        <Torso x={26} y={32} w={48} h={16} rx={6}/>
        <g style={A('ex-row-arm','1.5s','0s','ease-in-out','50px 40px')}>
          <line x1={50} y1={40} x2={36} y2={58} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
          <line x1={50} y1={40} x2={60} y2={58} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        </g>
      </g>
      {/* T-bar */}
      <line x1={50} y1={95} x2={50} y2={20} stroke={C.bodyDim} strokeWidth={4} opacity="0.5"/>
      <line x1={28} y1={65} x2={72} y2={65} stroke={C.accent} strokeWidth={4} opacity="0.6"/>
      <line x1={46} y1={68} x2={50} y2={90} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={54} y1={68} x2={58} y2={90} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function BicepCurl() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <Head cx={50} cy={14}/>
      <Torso x={36} y={28} w={28} h={30}/>
      {/* right arm curling */}
      <g style={A('ex-curl-arm','1.4s','0s','ease-in-out','66px 38px')}>
        <line x1={66} y1={38} x2={76} y2={62} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Dumbbell cx={78} cy={66} horizontal/>
      </g>
      {/* left arm static down */}
      <line x1={34} y1={38} x2={24} y2={62} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <Dumbbell cx={22} cy={66} horizontal/>
      {/* legs */}
      <line x1={45} y1={58} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={84} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={58} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function HammerCurl() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <Head cx={50} cy={14}/>
      <Torso x={36} y={28} w={28} h={30}/>
      <g style={A('ex-curl-arm','1.4s','0s','ease-in-out','66px 38px')}>
        <line x1={66} y1={38} x2={74} y2={58} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Dumbbell cx={74} cy={64}/>
      </g>
      <line x1={34} y1={38} x2={26} y2={58} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <Dumbbell cx={26} cy={64}/>
      <line x1={45} y1={58} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={84} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={58} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function PreacherCurl() {
  return (
    <svg viewBox="0 0 100 110" style={{width:'100%',height:'100%'}}>
      {/* preacher pad */}
      <rect x={30} y={52} width={50} height={8} rx={4} fill={C.bodyDim} opacity="0.5"/>
      <rect x={56} y={60} width={6} height={30} rx={3} fill={C.bodyDim} opacity="0.4"/>
      <Head cx={32} cy={28}/>
      <Torso x={22} y={40} w={22} h={20} rx={5} style={{transform:'rotate(-20deg)',transformOrigin:'32px 50px'}}/>
      {/* arm on pad curling */}
      <g style={A('ex-curl-arm','1.5s','0s','ease-in-out','52px 52px')}>
        <line x1={52} y1={52} x2={64} y2={70} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Dumbbell cx={66} cy={74} horizontal/>
      </g>
      <line x1={32} y1={52} x2={52} y2={52} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function InclineCurl() {
  return (
    <svg viewBox="0 0 100 110" style={{width:'100%',height:'100%'}}>
      <Bench x={20} y={54} w={60} h={8}/>
      <rect x={20} y={38} width={10} height={22} rx={5} fill={C.bodyDim} opacity="0.4"/>
      {/* seated on incline, arms hang back */}
      <Head cx={42} cy={32}/>
      <Torso x={30} y={44} w={22} h={18} rx={5} style={{transform:'rotate(15deg)',transformOrigin:'41px 53px'}}/>
      <g style={A('ex-curl-arm','1.5s','0s','ease-in-out','52px 52px')}>
        <line x1={52} y1={52} x2={62} y2={72} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Dumbbell cx={64} cy={76} horizontal/>
      </g>
      <g style={A('ex-curl-arm','1.5s','0.6s','ease-in-out','30px 52px')}>
        <line x1={30} y1={52} x2={20} y2={72} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Dumbbell cx={18} cy={76} horizontal/>
      </g>
      <line x1={44} y1={62} x2={40} y2={80} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={80} x2={38} y2={96} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function SkullCrusher() {
  return (
    <svg viewBox="0 0 100 100" style={{width:'100%',height:'100%'}}>
      <Bench x={10} y={62} w={80} h={10}/>
      <rect x={22} y={50} width={56} height={14} rx={6} fill={C.body} opacity="0.88"/>
      <circle cx={17} cy={50} r={8} fill={C.body} opacity="0.92"/>
      <line x1={30} y1={62} x2={26} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={26} y1={82} x2={28} y2={92} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={68} y1={62} x2={72} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={72} y1={82} x2={70} y2={92} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      {/* arms extending up */}
      <g style={A('ex-curl-arm','1.6s','0s','ease-in-out','42px 54px')}>
        <line x1={42} y1={54} x2={38} y2={30} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <g style={A('ex-curl-arm','1.6s','0s','ease-in-out','56px 54px')}>
        <line x1={56} y1={54} x2={62} y2={30} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <Barbell x={30} y={26} len={40}/>
    </svg>
  );
}

function TricepPushdown() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <rect x={44} y={4} width={12} height={28} rx={4} fill={C.bodyDim} opacity="0.5"/>
      <line x1={50} y1={32} x2={50} y2={50} stroke={C.accent} strokeWidth={2} opacity="0.4" strokeDasharray="3,2"/>
      <Head cx={50} cy={18}/>
      <Torso x={36} y={32} w={28} h={30}/>
      <g style={A('ex-arm-bend','1.4s','0s','ease-in-out','38px 40px')}>
        <line x1={38} y1={40} x2={32} y2={64} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={32} y1={64} x2={30} y2={88} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
      </g>
      <g style={A('ex-arm-bend','1.4s','0s','ease-in-out','62px 40px')}>
        <line x1={62} y1={40} x2={68} y2={64} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={68} y1={64} x2={70} y2={88} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
      </g>
      <line x1={45} y1={62} x2={40} y2={86} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={86} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={62} x2={60} y2={86} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={86} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function CableFly() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <line x1={6} y1={20} x2={6} y2={90} stroke={C.bodyDim} strokeWidth={4} opacity="0.5"/>
      <line x1={94} y1={20} x2={94} y2={90} stroke={C.bodyDim} strokeWidth={4} opacity="0.5"/>
      <Head cx={50} cy={18}/>
      <Torso x={36} y={32} w={28} h={30}/>
      <g style={A('ex-lat-raise','1.8s','0s','ease-in-out','38px 40px')}>
        <line x1={38} y1={40} x2={12} y2={50} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={12} y1={50} x2={6} y2={46} stroke={C.accent} strokeWidth={2} opacity="0.5" strokeDasharray="3,2"/>
      </g>
      <g style={A('ex-lat-raise','1.8s','0s','ease-in-out','62px 40px')}>
        <line x1={62} y1={40} x2={88} y2={50} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={88} y1={50} x2={94} y2={46} stroke={C.accent} strokeWidth={2} opacity="0.5" strokeDasharray="3,2"/>
      </g>
      <line x1={45} y1={62} x2={40} y2={86} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={86} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={62} x2={60} y2={86} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={86} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEG FAMILY
// ══════════════════════════════════════════════════════════════════════════════

function Squat() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <g style={A('ex-squat-body','1.8s','0s','ease-in-out','50px 56px')}>
        <Head cx={50} cy={16}/>
        <Torso x={36} y={30} w={28} h={30}/>
        {/* arms forward for balance */}
        <line x1={36} y1={42} x2={18} y2={46} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={64} y1={42} x2={82} y2={46} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        {/* left leg bending */}
        <g style={A('ex-squat-knee','1.8s','0s','ease-in-out','44px 60px')}>
          <line x1={44} y1={60} x2={36} y2={86} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={36} y1={86} x2={34} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
        {/* right leg bending */}
        <g style={A('ex-squat-knee','1.8s','0s','ease-in-out','56px 60px')}>
          <line x1={56} y1={60} x2={64} y2={86} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={64} y1={86} x2={66} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}

function BarbellSquat() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <g style={A('ex-squat-body','1.8s','0s','ease-in-out','50px 56px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={30}/>
        <Barbell x={22} y={24} len={56}/>
        {/* hands gripping bar */}
        <circle cx={26} cy={24} r={4} fill={C.accent} opacity="0.7"/>
        <circle cx={74} cy={24} r={4} fill={C.accent} opacity="0.7"/>
        <g style={A('ex-squat-knee','1.8s','0s','ease-in-out','44px 58px')}>
          <line x1={44} y1={58} x2={36} y2={84} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={36} y1={84} x2={34} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
        <g style={A('ex-squat-knee','1.8s','0s','ease-in-out','56px 58px')}>
          <line x1={56} y1={58} x2={64} y2={84} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={64} y1={84} x2={66} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}

function Lunge() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <g style={A('ex-lunge-step','1.8s','0s','ease-in-out','50px 60px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={30}/>
        <line x1={36} y1={42} x2={22} y2={50} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={64} y1={42} x2={78} y2={50} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        {/* front leg bent deep */}
        <line x1={46} y1={58} x2={28} y2={80} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={28} y1={80} x2={26} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        {/* back leg */}
        <line x1={54} y1={58} x2={70} y2={78} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={70} y1={78} x2={78} y2={62} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={78} y1={62} x2={82} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function BulgarianSplitSquat() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      {/* rear bench */}
      <rect x={62} y={78} width={30} height={7} rx={3} fill={C.bodyDim} opacity="0.5"/>
      <g style={A('ex-squat-body','1.8s','0s','ease-in-out','44px 60px')}>
        <Head cx={44} cy={14}/>
        <Torso x={30} y={28} w={28} h={30}/>
        <line x1={30} y1={42} x2={16} y2={48} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={58} y1={42} x2={72} y2={48} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        {/* front leg deep bend */}
        <g style={A('ex-squat-knee','1.8s','0s','ease-in-out','40px 58px')}>
          <line x1={40} y1={58} x2={28} y2={82} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={28} y1={82} x2={26} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
        {/* rear leg elevated on bench */}
        <line x1={48} y1={58} x2={62} y2={72} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={62} y1={72} x2={68} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function GluteBridge() {
  return (
    <svg viewBox="0 0 100 80" style={{width:'100%',height:'100%'}}>
      <Ground y={72}/>
      {/* head on floor */}
      <circle cx={18} cy={56} r={8} fill={C.body} opacity="0.92"/>
      {/* shoulders on floor */}
      <rect x={22} y={52} width={28} height={12} rx={5} fill={C.body} opacity="0.88"/>
      {/* hips thrusting up */}
      <g style={A('ex-hip-thrust','1.6s','0s','ease-in-out','60px 56px')}>
        <rect x={48} y={42} width={22} height={18} rx={5} fill={C.body} opacity="0.88"/>
        {/* legs bent, feet on floor */}
        <line x1={56} y1={60} x2={46} y2={72} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={64} y1={60} x2={74} y2={72} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        {/* glute highlight when up */}
        <circle cx={59} cy={48} r={5} fill={C.accent} opacity="0.25"/>
      </g>
    </svg>
  );
}

function HipThrust() {
  return (
    <svg viewBox="0 0 100 100" style={{width:'100%',height:'100%'}}>
      <Ground y={92}/>
      <Bench x={8} y={54} w={36} h={10}/>
      <g style={A('ex-hip-thrust','1.6s','0s','ease-in-out','62px 54px')}>
        {/* upper back on bench */}
        <rect x={20} y={44} width={24} height={14} rx={5} fill={C.body} opacity="0.88"/>
        <circle cx={18} cy={44} r={8} fill={C.body} opacity="0.92"/>
        {/* hips drive up */}
        <rect x={46} y={36} width={26} height={20} rx={6} fill={C.body} opacity="0.88"/>
        <Barbell x={40} y={34} len={32}/>
        {/* legs */}
        <line x1={54} y1={56} x2={44} y2={76} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={44} y1={76} x2={42} y2={92} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={64} y1={56} x2={74} y2={76} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={74} y1={76} x2={76} y2={92} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function JumpSquat() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <g style={A('ex-jump-air','1.2s','0s','ease-in-out','50px 56px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={28}/>
        {/* arms swinging up on jump */}
        <g style={A('ex-arm-swing','1.2s','0s','ease-in-out','36px 38px')}>
          <line x1={36} y1={38} x2={20} y2={24} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        </g>
        <g style={A('ex-arm-swing','1.2s','0s','ease-in-out','64px 38px')}>
          <line x1={64} y1={38} x2={80} y2={24} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        </g>
        {/* legs tuck in air */}
        <g style={A('ex-squat-knee','1.2s','0s','ease-in-out','44px 56px')}>
          <line x1={44} y1={56} x2={36} y2={80} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={36} y1={80} x2={34} y2={108} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
        <g style={A('ex-squat-knee','1.2s','0s','ease-in-out','56px 56px')}>
          <line x1={56} y1={56} x2={64} y2={80} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={64} y1={80} x2={66} y2={108} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}

function CalfRaise() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      {/* step edge */}
      <rect x={28} y={104} width={44} height={6} rx={3} fill={C.bodyDim} opacity="0.5"/>
      <g style={A('ex-calf-rise','1.2s','0s','ease-in-out','50px 70px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={30}/>
        <line x1={36} y1={42} x2={22} y2={50} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={64} y1={42} x2={78} y2={50} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={45} y1={58} x2={42} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={42} y1={82} x2={40} y2={104} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={55} y1={58} x2={58} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={58} y1={82} x2={60} y2={104} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function LegPress() {
  return (
    <svg viewBox="0 0 100 100" style={{width:'100%',height:'100%'}}>
      {/* machine frame */}
      <rect x={60} y={10} width={32} height={60} rx={4} fill={C.bodyDim} opacity="0.3"/>
      <rect x={64} y={14} width={24} height={52} rx={3} fill={C.bodyDim} opacity="0.2"/>
      {/* weight plate */}
      <rect x={56} y={20} width={10} height={40} rx={5} fill={C.bodyDim} opacity="0.5"/>
      {/* seated figure */}
      <rect x={8} y={48} width={44} height={12} rx={5} fill={C.bodyDim} opacity="0.35"/>
      <Head cx={18} cy={38}/>
      <Torso x={8} y={50} w={22} h={22} rx={5}/>
      {/* legs pressing plate */}
      <g style={A('ex-squat-knee','1.6s','0s','ease-in-out','36px 54px')}>
        <line x1={36} y1={54} x2={50} y2={36} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={50} y1={36} x2={58} y2={28} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <g style={A('ex-squat-knee','1.6s','0s','ease-in-out','36px 64px')}>
        <line x1={36} y1={64} x2={50} y2={46} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={50} y1={46} x2={58} y2={40} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function LegExtension() {
  return (
    <svg viewBox="0 0 100 110" style={{width:'100%',height:'100%'}}>
      <rect x={8} y={42} width={52} height={12} rx={5} fill={C.bodyDim} opacity="0.35"/>
      <rect x={54} y={42} width={8} height={44} rx={4} fill={C.bodyDim} opacity="0.4"/>
      <Head cx={22} cy={28}/>
      <Torso x={10} y={42} w={22} h={26} rx={5}/>
      {/* legs extending from seated */}
      <g style={A('ex-arm-bend','1.4s','0s','ease-in-out','36px 68px')}>
        <line x1={36} y1={68} x2={56} y2={80} stroke={C.body} strokeWidth={7} strokeLinecap="round" style={{transformOrigin:'36px 68px',animation:'ex-leg-ext 1.4s ease-in-out infinite'}}/>
        <line x1={56} y1={80} x2={72} y2={68} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <g style={{animation:'ex-arm-bend 1.4s ease-in-out infinite',transformOrigin:'36px 76px'}}>
        <line x1={36} y1={76} x2={56} y2={88} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={56} y1={88} x2={72} y2={76} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function LegCurl() {
  return (
    <svg viewBox="0 0 100 90" style={{width:'100%',height:'100%'}}>
      <Bench x={8} y={40} w={84} h={10}/>
      {/* lying prone */}
      <circle cx={16} cy={36} r={8} fill={C.body} opacity="0.92"/>
      <rect x={20} y={32} width={50} height={12} rx={5} fill={C.body} opacity="0.88"/>
      {/* legs curling up */}
      <line x1={70} y1={40} x2={80} y2={54} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <g style={A('ex-curl-arm','1.4s','0s','ease-in-out','80px 54px')}>
        <line x1={80} y1={54} x2={86} y2={36} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <line x1={62} y1={40} x2={72} y2={54} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <g style={A('ex-curl-arm','1.4s','0.2s','ease-in-out','72px 54px')}>
        <line x1={72} y1={54} x2={78} y2={36} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function HackSquat() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      {/* machine back pad */}
      <rect x={70} y={20} width={16} height={80} rx={6} fill={C.bodyDim} opacity="0.3"/>
      <g style={A('ex-squat-body','1.8s','0s','ease-in-out','50px 56px')}>
        <Head cx={52} cy={14}/>
        <Torso x={38} y={28} w={26} h={56} rx={5}/>
        <g style={A('ex-squat-knee','1.8s','0s','ease-in-out','44px 84px')}>
          <line x1={44} y1={84} x2={36} y2={96} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={36} y1={96} x2={34} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
        <g style={A('ex-squat-knee','1.8s','0s','ease-in-out','56px 84px')}>
          <line x1={56} y1={84} x2={64} y2={96} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={64} y1={96} x2={66} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHOULDER FAMILY
// ══════════════════════════════════════════════════════════════════════════════

function LateralRaise() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <Head cx={50} cy={14}/>
      <Torso x={36} y={28} w={28} h={30}/>
      <g style={A('ex-lat-raise','1.6s','0s','ease-in-out','36px 36px')}>
        <line x1={36} y1={36} x2={16} y2={48} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Dumbbell cx={13} cy={50} horizontal/>
      </g>
      <g style={A('ex-lat-raise','1.6s','0s','ease-in-out','64px 36px')}>
        <line x1={64} y1={36} x2={84} y2={48} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Dumbbell cx={87} cy={50} horizontal/>
      </g>
      <line x1={45} y1={58} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={84} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={58} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function FrontRaise() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <Head cx={50} cy={14}/>
      <Torso x={36} y={28} w={28} h={30}/>
      <g style={A('ex-oh-arm','1.6s','0s','ease-in-out','38px 38px')}>
        <line x1={38} y1={38} x2={26} y2={20} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Dumbbell cx={23} cy={17} horizontal/>
      </g>
      <line x1={62} y1={38} x2={74} y2={58} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <Dumbbell cx={76} cy={62} horizontal/>
      <line x1={45} y1={58} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={84} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={58} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function ArnoldPress() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <Head cx={50} cy={14}/>
      <Torso x={36} y={28} w={28} h={30}/>
      <g style={A('ex-press-up','1.8s','0s','ease-in-out','50px 42px')}>
        <g style={A('ex-oh-arm','1.8s','0s','ease-in-out','36px 36px')}>
          <line x1={36} y1={36} x2={22} y2={16} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
          <Dumbbell cx={20} cy={13} horizontal/>
        </g>
        <g style={A('ex-oh-arm','1.8s','0s','ease-in-out','64px 36px')}>
          <line x1={64} y1={36} x2={78} y2={16} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
          <Dumbbell cx={80} cy={13} horizontal/>
        </g>
      </g>
      <line x1={45} y1={58} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={84} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={58} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function FacePull() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <rect x={84} y={30} width={10} height={50} rx={4} fill={C.bodyDim} opacity="0.4"/>
      <circle cx={89} cy={48} r={5} fill={C.bodyDim} opacity="0.5"/>
      <Head cx={44} cy={18}/>
      <Torso x={30} y={32} w={28} h={28}/>
      <g style={A('ex-row-arm','1.5s','0s','ease-in-out','30px 42px')}>
        <line x1={30} y1={42} x2={14} y2={48} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <g style={A('ex-row-arm','1.5s','0s','ease-in-out','58px 42px')}>
        <line x1={58} y1={42} x2={74} y2={36} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={74} y1={36} x2={84} y2={46} stroke={C.accent} strokeWidth={2} opacity="0.4" strokeDasharray="3,2"/>
      </g>
      <line x1={44} y1={60} x2={38} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={38} y1={84} x2={36} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={54} y1={60} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function CableLateralRaise() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <rect x={4} y={20} width={8} height={80} rx={4} fill={C.bodyDim} opacity="0.4"/>
      <Head cx={54} cy={14}/>
      <Torso x={40} y={28} w={28} h={30}/>
      <line x1={40} y1={40} x2={24} y2={50} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
      <line x1={24} y1={50} x2={12} y2={48} stroke={C.accent} strokeWidth={2} opacity="0.4" strokeDasharray="3,2"/>
      <g style={A('ex-lat-raise','1.6s','0s','ease-in-out','68px 36px')}>
        <line x1={68} y1={36} x2={86} y2={48} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Dumbbell cx={88} cy={51} horizontal/>
      </g>
      <line x1={49} y1={58} x2={44} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={44} y1={84} x2={42} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={59} y1={58} x2={64} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={64} y1={84} x2={66} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function UprightRow() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <Head cx={50} cy={14}/>
      <Torso x={36} y={28} w={28} h={30}/>
      <g style={A('ex-row-arm','1.5s','0s','ease-in-out','44px 40px')}>
        <line x1={44} y1={40} x2={30} y2={24} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <g style={A('ex-row-arm','1.5s','0s','ease-in-out','56px 40px')}>
        <line x1={56} y1={40} x2={70} y2={24} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <g style={A('ex-row-arm','1.5s','0s','ease-in-out','50px 62px')}>
        <Barbell x={28} y={62} len={44}/>
      </g>
      <line x1={45} y1={58} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={84} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={58} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function BarbellShrug() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <g style={A('ex-shrug-up','1s','0s','ease-in-out','50px 40px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={30}/>
        <line x1={36} y1={38} x2={24} y2={60} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={64} y1={38} x2={76} y2={60} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <Barbell x={18} y={60} len={64}/>
        {/* trap highlight */}
        <ellipse cx={42} cy={30} rx={8} ry={5} fill={C.accent} opacity="0.15"/>
        <ellipse cx={58} cy={30} rx={8} ry={5} fill={C.accent} opacity="0.15"/>
      </g>
      <line x1={45} y1={58} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={40} y1={84} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={55} y1={58} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
    </svg>
  );
}

function ReverseFly() {
  return (
    <svg viewBox="0 0 100 100" style={{width:'100%',height:'100%'}}>
      <Ground y={92}/>
      <g style={{transform:'rotate(42deg)',transformOrigin:'50px 52px'}}>
        <Head cx={32} cy={22}/>
        <Torso x={28} y={32} w={42} h={14} rx={6}/>
        <g style={A('ex-rev-fly','1.5s','0s','ease-in-out','28px 38px')}>
          <line x1={28} y1={38} x2={12} y2={28} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
          <Dumbbell cx={10} cy={26} horizontal/>
        </g>
        <g style={A('ex-rev-fly','1.5s','0s','ease-in-out','70px 38px')}>
          <line x1={70} y1={38} x2={86} y2={28} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
          <Dumbbell cx={88} cy={26} horizontal/>
        </g>
      </g>
      <line x1={44} y1={70} x2={38} y2={92} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      <line x1={56} y1={70} x2={62} y2={92} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
    </svg>
  );
}

function ShoulderTap() {
  return (
    <svg viewBox="0 0 100 80" style={{width:'100%',height:'100%'}}>
      <Ground y={72}/>
      <g style={A('ex-plank-hold','2s')}>
        <circle cx={18} cy={28} r={8} fill={C.body} opacity="0.92"/>
        <rect x={24} y={24} width={54} height={12} rx={5} fill={C.body} opacity="0.88"/>
        {/* one hand on floor, one tapping shoulder */}
        <line x1={26} y1={32} x2={18} y2={56} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={18} y1={56} x2={20} y2={72} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <g style={A('ex-arm-bend','1s','0s','ease-in-out','72px 28px')}>
          <line x1={72} y1={28} x2={60} y2={24} stroke={C.accent} strokeWidth={6} strokeLinecap="round"/>
          <circle cx={58} cy={23} r={4} fill={C.accent} opacity="0.8"/>
        </g>
        {/* legs */}
        <line x1={74} y1={34} x2={80} y2={58} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={80} y1={58} x2={82} y2={72} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function GoodMorning() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <g style={A('ex-dl-torso','2s','0s','ease-in-out','50px 58px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={30}/>
        <Barbell x={22} y={24} len={56}/>
        <circle cx={26} cy={24} r={4} fill={C.accent} opacity="0.7"/>
        <circle cx={74} cy={24} r={4} fill={C.accent} opacity="0.7"/>
        <line x1={36} y1={38} x2={28} y2={28} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={64} y1={38} x2={72} y2={28} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={46} y1={58} x2={42} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={42} y1={82} x2={40} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={54} y1={58} x2={58} y2={82} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={58} y1={82} x2={60} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CORE FAMILY
// ══════════════════════════════════════════════════════════════════════════════

function Plank() {
  return (
    <svg viewBox="0 0 100 70" style={{width:'100%',height:'100%'}}>
      <Ground y={62}/>
      <g style={A('ex-plank-hold','3s')}>
        <circle cx={16} cy={26} r={8} fill={C.body} opacity="0.92"/>
        <rect x={22} y={22} width={58} height={12} rx={5} fill={C.body} opacity="0.88"/>
        <line x1={24} y1={30} x2={16} y2={54} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={16} y1={54} x2={18} y2={62} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={28} y1={30} x2={20} y2={54} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={20} y1={54} x2={22} y2={62} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={74} y1={32} x2={78} y2={56} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={78} y1={56} x2={80} y2={62} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        {/* core highlight */}
        <ellipse cx={50} cy={27} rx={14} ry={4} fill={C.accent} opacity="0.12"/>
      </g>
    </svg>
  );
}

function Crunch() {
  return (
    <svg viewBox="0 0 100 80" style={{width:'100%',height:'100%'}}>
      <Ground y={72}/>
      {/* upper body crunching up */}
      <g style={A('ex-crunch-curl','1.4s','0s','ease-in-out','50px 56px')}>
        <circle cx={50} cy={28} r={8} fill={C.body} opacity="0.92"/>
        <rect x={36} y={40} width={28} height={18} rx={6} fill={C.body} opacity="0.88"/>
        <line x1={36} y1={48} x2={24} y2={42} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={64} y1={48} x2={76} y2={42} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        {/* abs highlight */}
        <ellipse cx={50} cy={52} rx={8} ry={5} fill={C.accent} opacity="0.2"/>
      </g>
      {/* lower body on floor */}
      <line x1={44} y1={58} x2={32} y2={72} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
      <line x1={56} y1={58} x2={68} y2={72} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
    </svg>
  );
}

function LegRaise() {
  return (
    <svg viewBox="0 0 100 80" style={{width:'100%',height:'100%'}}>
      <Ground y={72}/>
      <circle cx={18} cy={56} r={8} fill={C.body} opacity="0.92"/>
      <rect x={22} y={52} width={30} height={12} rx={5} fill={C.body} opacity="0.88"/>
      {/* legs raising */}
      <g style={A('ex-legr-raise','1.8s','0s','ease-in-out','60px 56px')}>
        <line x1={60} y1={56} x2={78} y2={38} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={78} y1={38} x2={80} y2={24} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={52} y1={56} x2={66} y2={42} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={66} y1={42} x2={68} y2={28} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      {/* lower abs highlight */}
      <ellipse cx={42} cy={54} rx={6} ry={4} fill={C.accent} opacity="0.2"/>
    </svg>
  );
}

function RussianTwist() {
  return (
    <svg viewBox="0 0 100 90" style={{width:'100%',height:'100%'}}>
      <Ground y={82}/>
      {/* legs bent up */}
      <line x1={44} y1={64} x2={32} y2={80} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
      <line x1={56} y1={64} x2={68} y2={80} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
      {/* torso twisting */}
      <g style={A('ex-twist','1.2s','0s','ease-in-out','50px 52px')}>
        <circle cx={50} cy={30} r={8} fill={C.body} opacity="0.92"/>
        <rect x={36} y={44} width={28} height={22} rx={6} fill={C.body} opacity="0.88"/>
        <line x1={36} y1={52} x2={18} y2={44} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={64} y1={52} x2={82} y2={44} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <circle cx={18} cy={43} r={4} fill={C.accent} opacity="0.7"/>
        {/* oblique highlight */}
        <ellipse cx={42} cy={56} rx={6} ry={4} fill={C.accent} opacity="0.2"/>
      </g>
    </svg>
  );
}

function MountainClimber() {
  return (
    <svg viewBox="0 0 100 80" style={{width:'100%',height:'100%'}}>
      <Ground y={72}/>
      <circle cx={18} cy={24} r={8} fill={C.body} opacity="0.92"/>
      <rect x={24} y={20} width={44} height={12} rx={5} fill={C.body} opacity="0.88"/>
      <line x1={26} y1={28} x2={18} y2={52} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={18} y1={52} x2={20} y2={72} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
      <line x1={58} y1={28} x2={66} y2={52} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      <line x1={66} y1={52} x2={68} y2={72} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
      {/* alternating knee drive */}
      <g style={{animation:'ex-mc-knee 0.7s ease-in-out infinite',transformOrigin:'56px 28px'}}>
        <line x1={56} y1={28} x2={44} y2={48} stroke={C.accent} strokeWidth={7} strokeLinecap="round"/>
        <line x1={44} y1={48} x2={46} y2={64} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function HollowBody() {
  return (
    <svg viewBox="0 0 100 70" style={{width:'100%',height:'100%'}}>
      <Ground y={62}/>
      <g style={A('ex-plank-hold','2.5s')}>
        {/* lying on back, arms overhead, legs raised */}
        <circle cx={18} cy={42} r={7} fill={C.body} opacity="0.92"/>
        <rect x={22} y={38} width={30} height={12} rx={5} fill={C.body} opacity="0.88"/>
        {/* arms straight overhead */}
        <line x1={22} y1={42} x2={8} y2={30} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={26} y1={38} x2={12} y2={26} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        {/* legs raised ~25° */}
        <line x1={52} y1={44} x2={70} y2={34} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={70} y1={34} x2={88} y2={28} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <ellipse cx={50} cy={42} rx={10} ry={4} fill={C.accent} opacity="0.15"/>
      </g>
    </svg>
  );
}

function Superman() {
  return (
    <svg viewBox="0 0 100 70" style={{width:'100%',height:'100%'}}>
      <Ground y={62}/>
      <g style={A('ex-plank-hold','2s')}>
        {/* prone, arms and legs lifting */}
        <circle cx={18} cy={40} r={7} fill={C.body} opacity="0.92"/>
        <rect x={22} y={36} width={36} height={12} rx={5} fill={C.body} opacity="0.88"/>
        <line x1={22} y1={40} x2={8} y2={28} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={26} y1={36} x2={12} y2={24} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={58} y1={42} x2={74} y2={34} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={74} y1={34} x2={90} y2={28} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <ellipse cx={42} cy={40} rx={10} ry={3} fill={C.accent} opacity="0.15"/>
      </g>
    </svg>
  );
}

function DeadHang() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Bar y={8} x1={18} x2={82} thick={6}/>
      <g style={A('ex-breathe','3s')}>
        <Head cx={50} cy={28}/>
        <Torso x={36} y={42} w={28} h={30}/>
        <line x1={38} y1={44} x2={28} y2={14} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={62} y1={44} x2={72} y2={14} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <circle cx={28} cy={13} r={4} fill={C.accent} opacity="0.8"/>
        <circle cx={72} cy={13} r={4} fill={C.accent} opacity="0.8"/>
        <line x1={45} y1={72} x2={42} y2={100} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={55} y1={72} x2={58} y2={100} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CARDIO / COMPOUND
// ══════════════════════════════════════════════════════════════════════════════

function Burpee() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <g style={A('ex-burp-body','1.4s','0s','ease-in-out','50px 60px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={30}/>
        <g style={A('ex-arm-swing','1.4s','0s','ease-in-out','36px 36px')}>
          <line x1={36} y1={36} x2={18} y2={22} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        </g>
        <g style={A('ex-arm-swing','1.4s','0s','ease-in-out','64px 36px')}>
          <line x1={64} y1={36} x2={82} y2={22} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        </g>
        <g style={A('ex-squat-knee','1.4s','0s','ease-in-out','44px 58px')}>
          <line x1={44} y1={58} x2={36} y2={84} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={36} y1={84} x2={34} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
        <g style={A('ex-squat-knee','1.4s','0s','ease-in-out','56px 58px')}>
          <line x1={56} y1={58} x2={64} y2={84} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={64} y1={84} x2={66} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}

function BoxJump() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      {/* box */}
      <rect x={30} y={82} width={40} height={28} rx={4} fill={C.bodyDim} opacity="0.4"/>
      <g style={A('ex-jump-air','1.2s','0s','ease-in-out','50px 56px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={28}/>
        <g style={A('ex-arm-swing','1.2s','0s','ease-in-out','36px 38px')}>
          <line x1={36} y1={38} x2={20} y2={24} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        </g>
        <g style={A('ex-arm-swing','1.2s','0s','ease-in-out','64px 38px')}>
          <line x1={64} y1={38} x2={80} y2={24} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        </g>
        <g style={A('ex-squat-knee','1.2s','0s','ease-in-out','44px 56px')}>
          <line x1={44} y1={56} x2={36} y2={78} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={36} y1={78} x2={34} y2={108} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
        <g style={A('ex-squat-knee','1.2s','0s','ease-in-out','56px 56px')}>
          <line x1={56} y1={56} x2={64} y2={78} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
          <line x1={64} y1={78} x2={66} y2={108} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}

function StepUp() {
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <rect x={28} y={84} width={44} height={26} rx={4} fill={C.bodyDim} opacity="0.4"/>
      <g style={A('ex-lunge-step','1.6s','0s','ease-in-out','50px 56px')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={30}/>
        <line x1={36} y1={42} x2={22} y2={52} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={64} y1={42} x2={78} y2={52} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        {/* front leg stepping up on box */}
        <line x1={46} y1={58} x2={38} y2={78} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={38} y1={78} x2={36} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        {/* back leg straight down */}
        <line x1={54} y1={58} x2={62} y2={82} stroke={C.body} strokeWidth={8} strokeLinecap="round"/>
        <line x1={62} y1={82} x2={64} y2={110} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
      </g>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// POSE (static hold with glow)
// ══════════════════════════════════════════════════════════════════════════════

function PoseAnim({ name }) {
  const label = name?.replace('pose-','').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) || 'Pose';
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <g style={A('ex-breathe','2.5s')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={30}/>
        {/* both arms raised — double biceps pose */}
        <line x1={36} y1={34} x2={20} y2={24} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={20} y1={24} x2={24} y2={14} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={64} y1={34} x2={80} y2={24} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={80} y1={24} x2={76} y2={14} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        {/* bicep highlight */}
        <ellipse cx={22} cy={20} rx={5} ry={3} fill={C.accent} opacity="0.35" transform="rotate(-30,22,20)"/>
        <ellipse cx={78} cy={20} rx={5} ry={3} fill={C.accent} opacity="0.35" transform="rotate(30,78,20)"/>
        {/* lats */}
        <ellipse cx={40} cy={44} rx={6} ry={10} fill={C.accent} opacity="0.1" transform="rotate(-10,40,44)"/>
        <ellipse cx={60} cy={44} rx={6} ry={10} fill={C.accent} opacity="0.1" transform="rotate(10,60,44)"/>
        <line x1={45} y1={58} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={40} y1={84} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={55} y1={58} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <text x="50" y="118" textAnchor="middle" fontSize="6"
        fill="var(--accent)" fontWeight="700" opacity="0.7" fontFamily="inherit">
        {label.toUpperCase()}
      </text>
    </svg>
  );
}

function GenericAnim({ exerciseId }) {
  const label = (exerciseId||'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  return (
    <svg viewBox="0 0 100 120" style={{width:'100%',height:'100%'}}>
      <Ground y={110}/>
      <g style={A('ex-breathe','2s')}>
        <Head cx={50} cy={14}/>
        <Torso x={36} y={28} w={28} h={30}/>
        <line x1={36} y1={38} x2={22} y2={52} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={64} y1={38} x2={78} y2={52} stroke={C.body} strokeWidth={5} strokeLinecap="round"/>
        <line x1={45} y1={58} x2={40} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={40} y1={84} x2={38} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
        <line x1={55} y1={58} x2={60} y2={84} stroke={C.body} strokeWidth={7} strokeLinecap="round"/>
        <line x1={60} y1={84} x2={62} y2={110} stroke={C.body} strokeWidth={6} strokeLinecap="round"/>
      </g>
      <text x="50" y="118" textAnchor="middle" fontSize="5.5" fill="var(--text-3)"
        fontFamily="inherit" fontWeight="600">{label}</text>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EXERCISE → COMPONENT MAP
// ══════════════════════════════════════════════════════════════════════════════

const ANIM_MAP = {
  // Push / Chest
  'pushup':                 PushUp,
  'incline-pushup':         PushUp,
  'decline-pushup':         PushUp,
  'diamond-pushup':         PushUp,
  'wide-pushup':            PushUp,
  'pike-pushup':            PikePushUp,
  'incline-dumbbell-press': BenchPress,
  'dumbbell-fly':           CableFly,
  'cable-fly':              CableFly,
  'barbell-bench-press':    BenchPress,
  // Pull / Back
  'pullup':                 PullUp,
  'chinup':                 ChinUp,
  'dead-hang':              DeadHang,
  'bodyweight-row':         BodyweightRow,
  'barbell-row':            BentOverRow,
  'dumbbell-row':           BentOverRow,
  'lat-pulldown':           LatPulldown,
  'seated-cable-row':       SeatedCableRow,
  'superman':               Superman,
  'barbell-deadlift':       Deadlift,
  'romanian-deadlift':      RomanianDeadlift,
  't-bar-row':              TBarRow,
  'good-morning':           GoodMorning,
  // Shoulders
  'lateral-raise':          LateralRaise,
  'front-raise':            FrontRaise,
  'overhead-press':         OverheadPress,
  'arnold-press':           ArnoldPress,
  'face-pull':              FacePull,
  'cable-lateral-raise':    CableLateralRaise,
  'shoulder-tap':           ShoulderTap,
  'dumbbell-shoulder-press':OverheadPress,
  'upright-row':            UprightRow,
  'barbell-shrug':          BarbellShrug,
  'reverse-fly':            ReverseFly,
  // Triceps
  'dip':                    Dip,
  'bench-dip':              Dip,
  'tricep-extension':       TricepPushdown,
  'skull-crusher':          SkullCrusher,
  'tricep-pushdown':        TricepPushdown,
  'cable-kickback':         TricepPushdown,
  // Arms / Biceps
  'bicep-curl':             BicepCurl,
  'hammer-curl':            HammerCurl,
  'concentration-curl':     BicepCurl,
  'barbell-curl':           BicepCurl,
  'cable-curl':             BicepCurl,
  'preacher-curl':          PreacherCurl,
  'incline-dumbbell-curl':  InclineCurl,
  'incline-hammer-curl':    InclineCurl,
  // Legs
  'squat':                  Squat,
  'barbell-squat':          BarbellSquat,
  'lunge':                  Lunge,
  'glute-bridge':           GluteBridge,
  'jump-squat':             JumpSquat,
  'single-leg-squat':       Squat,
  'calf-raise':             CalfRaise,
  'bulgarian-split-squat':  BulgarianSplitSquat,
  'leg-press':              LegPress,
  'leg-extension':          LegExtension,
  'leg-curl':               LegCurl,
  'hack-squat':             HackSquat,
  'barbell-hip-thrust':     HipThrust,
  'step-up':                StepUp,
  // Core
  'plank':                  Plank,
  'hollow-body':            HollowBody,
  'crunch':                 Crunch,
  'mountain-climber':       MountainClimber,
  'leg-raise':              LegRaise,
  'russian-twist':          RussianTwist,
  // Cardio
  'burpee':                 Burpee,
  'box-jump':               BoxJump,
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTAINER + MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════

const containerStyle = (size) => ({
  width: size,
  height: size,
  borderRadius: '14px',
  overflow: 'hidden',
  background: 'var(--bg-2, #1a1a1a)',
  border: '1px solid var(--border, rgba(255,255,255,0.08))',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: '6px',
  boxSizing: 'border-box',
});

export default function ExerciseGif({ exerciseId, size = 160 }) {
  injectKeyframes();

  const isPose = exerciseId?.startsWith('pose-');

  if (isPose) {
    return (
      <div style={containerStyle(size)}>
        <PoseAnim name={exerciseId} />
      </div>
    );
  }

  const AnimComponent = ANIM_MAP[exerciseId];

  return (
    <div style={containerStyle(size)}>
      {AnimComponent
        ? <AnimComponent />
        : <GenericAnim exerciseId={exerciseId} />
      }
    </div>
  );
}
