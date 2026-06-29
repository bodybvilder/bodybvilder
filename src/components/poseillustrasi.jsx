/**
 * BODYBVILDER Pose Illustrations
 * ================================
 * Accurate SVG illustrations of IFBB mandatory poses.
 * Based on IFBB/NASM official pose descriptions:
 *   - Front Double Biceps: arms raised, elbows at shoulder height, forearms UP
 *   - Front Lat Spread: fists on hips, elbows flared WIDE
 *   - Side Chest: 90° turn, near arm pressed to chest, far leg bent
 *   - Back Double Biceps: facing away, same arm position as front
 *   - Back Lat Spread: facing away, hands on hips, lats spread
 *   - Side Triceps: 90° turn, rear arm extended behind back
 *   - Abs & Thighs: one foot forward, hands behind head, crunch
 *   - Most Muscular (Crab): hands together in front, shoulders hunched forward
 *   - Men's Physique Front/Back/Side: relaxed quarter turns, hands at sides
 *
 * Style: dark muscular silhouette on black, accent highlights on working muscles
 * Each pose loops via CSS keyframe animation (breathing)
 */

import React from 'react';

const BG = '#0a0a0a';
const FIG = '#d0cfc8';       // main figure
const FIG2 = '#8a8880';      // depth/back
const ACC = '#C8FF00';       // accent glow
const SHD = '#3a3a35';       // shadow/definition

// Shared animated wrapper
function PoseWrapper({ children, size = 220 }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <style>{`
        @keyframes poseBreathe {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          50%       { transform: scaleX(1.012) scaleY(1.008); }
        }
        @keyframes poseGlow {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        .pose-figure { 
          animation: poseBreathe 3s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .pose-accent { 
          animation: poseGlow 3s ease-in-out infinite;
        }
      `}</style>
      <svg
        width={size} height={size}
        viewBox="0 0 220 220"
        style={{ background: BG, borderRadius: 14, display: 'block' }}
      >
        {children}
      </svg>
    </div>
  );
}

// ─── Reusable body part helpers ──────────────────────────────────────────────

// Muscular torso with V-taper
function Torso({ cx=110, shoulderY=75, hipY=140, shoulderW=52, hipW=28, facing='front' }) {
  const sw = shoulderW/2, hw = hipW/2;
  const midY = (shoulderY + hipY) / 2;
  return (
    <g className="pose-figure">
      {/* Main torso V-taper */}
      <path d={`M${cx-sw},${shoulderY} Q${cx-sw-4},${midY} ${cx-hw},${hipY} 
                L${cx+hw},${hipY} Q${cx+sw+4},${midY} ${cx+sw},${shoulderY} Z`}
        fill={FIG} />
      {/* Chest definition */}
      {facing === 'front' && <>
        <ellipse cx={cx-14} cy={shoulderY+14} rx={11} ry={8} fill="none" stroke={SHD} strokeWidth="1.2" opacity="0.5"/>
        <ellipse cx={cx+14} cy={shoulderY+14} rx={11} ry={8} fill="none" stroke={SHD} strokeWidth="1.2" opacity="0.5"/>
        {/* Abs */}
        {[0,1,2].map(i => (
          <rect key={i} x={cx-9} y={shoulderY+28+i*11} width={8} height={8} rx={2}
            fill="none" stroke={SHD} strokeWidth="1" opacity="0.4"/>
        ))}
        {[0,1,2].map(i => (
          <rect key={i} x={cx+1} y={shoulderY+28+i*11} width={8} height={8} rx={2}
            fill="none" stroke={SHD} strokeWidth="1" opacity="0.4"/>
        ))}
        <line x1={cx} y1={shoulderY} x2={cx} y2={hipY} stroke={SHD} strokeWidth="1.2" opacity="0.3"/>
      </>}
      {/* Back definition */}
      {facing === 'back' && <>
        <path d={`M${cx-sw},${shoulderY} Q${cx},${shoulderY-4} ${cx+sw},${shoulderY}`}
          fill="none" stroke={SHD} strokeWidth="1.5" opacity="0.5"/>
        <line x1={cx} y1={shoulderY+5} x2={cx} y2={hipY} stroke={SHD} strokeWidth="2" opacity="0.35"/>
        <path d={`M${cx-sw*0.7},${midY-10} Q${cx},${midY-5} ${cx+sw*0.7},${midY-10}`}
          fill="none" stroke={SHD} strokeWidth="1" opacity="0.3"/>
      </>}
    </g>
  );
}

// Head with neck
function Head({ cx=110, headY=38, facing='front' }) {
  return (
    <g className="pose-figure">
      {/* Neck */}
      <rect x={cx-6} y={headY+14} width={12} height={12} rx={4} fill={FIG}/>
      {/* Head */}
      <ellipse cx={cx} cy={headY} rx={13} ry={15} fill={FIG}/>
      {/* Hair */}
      <path d={`M${cx-11},${headY-8} Q${cx},${headY-18} ${cx+11},${headY-8}`}
        fill={SHD} strokeWidth="0"/>
    </g>
  );
}

// Muscular upper arm
function UpperArm({ x1, y1, x2, y2, w=13, dim=false }) {
  const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1;
  const px=-dy/len, py=dx/len;
  const bx=(x1+x2)/2+px*4, by=(y1+y2)/2+py*4;
  const hw=w/2;
  return (
    <path className="pose-figure"
      d={`M${x1+px*hw},${y1+py*hw} Q${bx+px*(hw+2)},${by+py*(hw+2)} ${x2+px*(hw-1)},${y2+py*(hw-1)}
          L${x2-px*(hw-1)},${y2-py*(hw-1)} Q${bx-px*(hw+2)},${by-py*(hw+2)} ${x1-px*hw},${y1-py*hw} Z`}
      fill={dim ? FIG2 : FIG}/>
  );
}

// Forearm
function Forearm({ x1, y1, x2, y2, w=9, dim=false }) {
  const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1;
  const px=-dy/len, py=dx/len;
  const hw=w/2;
  return (
    <path className="pose-figure"
      d={`M${x1+px*hw},${y1+py*hw} L${x2+px*(hw-2)},${y2+py*(hw-2)}
          L${x2-px*(hw-2)},${y2-py*(hw-2)} L${x1-px*hw},${y1-py*hw} Z`}
      fill={dim ? FIG2 : FIG}/>
  );
}

// Thigh
function Thigh({ x1, y1, x2, y2, w=19, dim=false }) {
  const dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1;
  const px=-dy/len, py=dx/len;
  const hw=w/2;
  return (
    <path className="pose-figure"
      d={`M${x1+px*hw},${y1+py*hw} L${x2+px*(hw-3)},${y2+py*(hw-3)}
          L${x2-px*(hw-3)},${y2-py*(hw-3)} L${x1-px*hw},${y1-py*hw} Z`}
      fill={dim ? FIG2 : FIG}/>
  );
}

// Shin/calf
function Shin({ x1, y1, x2, y2, w=12, dim=false }) {
  return <Forearm x1={x1} y1={y1} x2={x2} y2={y2} w={w} dim={dim}/>;
}

// Accent glow on muscle group
function MuscleGlow({ cx, cy, rx=18, ry=12, rotate=0 }) {
  return (
    <ellipse className="pose-accent" cx={cx} cy={cy} rx={rx} ry={ry}
      fill={ACC} opacity="0.18" style={{ transform: `rotate(${rotate}deg)`, transformOrigin: `${cx}px ${cy}px` }}/>
  );
}

// Stage floor
function StageFloor({ y=200 }) {
  return <>
    <rect x={0} y={y} width={220} height={220-y} fill="#111118"/>
    <line x1={0} y1={y} x2={220} y2={y} stroke="#22222f" strokeWidth="1.5"/>
  </>;
}

// ─── POSE 1: FRONT DOUBLE BICEPS ─────────────────────────────────────────────
// Arms raised, elbows at shoulder height, forearms pointing UP
// Lats flared. Quads contracted. Wide stance.
export function PoseFrontDoubleBiceps({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      {/* Legs — wide stance */}
      <Thigh x1={cx-20} y1={140} x2={cx-22} y2={180}/>
      <Thigh x1={cx+20} y1={140} x2={cx+22} y2={180}/>
      <Shin  x1={cx-22} y1={180} x2={cx-20} y2={198}/>
      <Shin  x1={cx+22} y1={180} x2={cx+20} y2={198}/>
      {/* Feet */}
      <ellipse cx={cx-24} cy={200} rx={12} ry={4} fill={FIG}/>
      <ellipse cx={cx+24} cy={200} rx={12} ry={4} fill={FIG}/>
      {/* Torso */}
      <Torso cx={cx} shoulderY={75} hipY={142} shoulderW={52} hipW={28}/>
      {/* LEFT ARM — upper arm horizontal out, forearm UP (L-shape, 90°) */}
      {/* Shoulder → Elbow: goes LEFT and slightly down */}
      <UpperArm x1={cx-26} y1={83} x2={cx-68} y2={92}/>
      {/* Elbow → Wrist: goes UP from elbow */}
      <Forearm  x1={cx-68} y1={92} x2={cx-62} y2={55}/>
      {/* RIGHT ARM (mirror) */}
      <UpperArm x1={cx+26} y1={83} x2={cx+68} y2={92}/>
      <Forearm  x1={cx+68} y1={92} x2={cx+62} y2={55}/>
      {/* Hands (fists) */}
      <ellipse cx={cx-60} cy={52} rx={6} ry={5} fill={FIG}/>
      <ellipse cx={cx+60} cy={52} rx={6} ry={5} fill={FIG}/>
      {/* Head */}
      <Head cx={cx} headY={50}/>
      {/* Muscle glows */}
      <MuscleGlow cx={cx-60} cy={73} rx={16} ry={10} rotate={-70}/>
      <MuscleGlow cx={cx+60} cy={73} rx={16} ry={10} rotate={70}/>
      <MuscleGlow cx={cx} cy={88} rx={22} ry={10}/>
      {/* Elbow accent dots */}
      <circle cx={cx-68} cy={92} r={4} fill={ACC} opacity="0.9"/>
      <circle cx={cx+68} cy={92} r={4} fill={ACC} opacity="0.9"/>
      {/* Label */}
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">FRONT DOUBLE BICEPS</text>
    </PoseWrapper>
  );
}

// ─── POSE 2: FRONT LAT SPREAD ────────────────────────────────────────────────
// Fists/thumbs on hips/waist, elbows flared WIDE
// Lats spread maximally to show V-taper width
export function PoseFrontLatSpread({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      <Thigh x1={cx-16} y1={140} x2={cx-18} y2={180}/>
      <Thigh x1={cx+16} y1={140} x2={cx+18} y2={180}/>
      <Shin  x1={cx-18} y1={180} x2={cx-16} y2={198}/>
      <Shin  x1={cx+18} y1={180} x2={cx+16} y2={198}/>
      <ellipse cx={cx-18} cy={200} rx={11} ry={4} fill={FIG}/>
      <ellipse cx={cx+18} cy={200} rx={11} ry={4} fill={FIG}/>
      {/* Wide torso with extra lat flare */}
      <Torso cx={cx} shoulderY={75} hipY={142} shoulderW={58} hipW={28}/>
      {/* LEFT ARM — upper arm goes WIDE out horizontally, forearm DOWN to hip */}
      <UpperArm x1={cx-29} y1={83} x2={cx-72} y2={100}/>
      <Forearm  x1={cx-72} y1={100} x2={cx-48} y2={130}/>
      {/* RIGHT ARM */}
      <UpperArm x1={cx+29} y1={83} x2={cx+72} y2={100}/>
      <Forearm  x1={cx+72} y1={100} x2={cx+48} y2={130}/>
      {/* Fists at hips */}
      <ellipse cx={cx-46} cy={133} rx={7} ry={5} fill={FIG}/>
      <ellipse cx={cx+46} cy={133} rx={7} ry={5} fill={FIG}/>
      <Head cx={cx} headY={50}/>
      {/* Lat glow */}
      <MuscleGlow cx={cx-52} cy={108} rx={20} ry={12} rotate={-20}/>
      <MuscleGlow cx={cx+52} cy={108} rx={20} ry={12} rotate={20}/>
      <circle cx={cx-72} cy={100} r={4} fill={ACC} opacity="0.9"/>
      <circle cx={cx+72} cy={100} r={4} fill={ACC} opacity="0.9"/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">FRONT LAT SPREAD</text>
    </PoseWrapper>
  );
}

// ─── POSE 3: SIDE CHEST ──────────────────────────────────────────────────────
// Turn 90° (showing left side). Near arm pressed UP against chest.
// Far arm gripping near wrist. Front leg slightly bent + calf flexed.
export function PoseSideChest({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      {/* Side legs — front leg slightly bent */}
      <Thigh x1={cx-5}  y1={140} x2={cx-3}  y2={180} dim={true}/>  {/* back leg */}
      <Thigh x1={cx+5}  y1={140} x2={cx+8}  y2={178}/>               {/* front leg */}
      <Shin  x1={cx-3}  y1={180} x2={cx-5}  y2={198} dim={true}/>
      <Shin  x1={cx+8}  y1={178} x2={cx+6}  y2={198}/>
      <ellipse cx={cx-4}  cy={200} rx={10} ry={4} fill={FIG2}/>
      <ellipse cx={cx+7}  cy={200} rx={10} ry={4} fill={FIG}/>
      {/* Side torso — puffed chest */}
      <path d={`M${cx-20},75 Q${cx+10},72 ${cx+28},82 Q${cx+32},110 ${cx+22},142
                L${cx-14},142 Q${cx-22},110 ${cx-20},75 Z`} fill={FIG}/>
      {/* Chest definition */}
      <path d={`M${cx-5},80 Q${cx+20},78 ${cx+26},90 Q${cx+22},105 ${cx+8},108`}
        fill="none" stroke={SHD} strokeWidth="1.5" opacity="0.5"/>
      {/* NEAR ARM (front): upper arm pressed into chest, elbow forward and UP */}
      <UpperArm x1={cx+10} y1={88} x2={cx+35} y2={108}/>
      <Forearm  x1={cx+35} y1={108} x2={cx+30} y2={130}/>
      {/* FAR ARM (back): grips near wrist, elbow flared back */}
      <UpperArm x1={cx-12} y1={90} x2={cx-40} y2={105} dim={true}/>
      <Forearm  x1={cx-40} y1={105} x2={cx+28} y2={128} dim={true}/>
      <Head cx={cx+5} headY={50}/>
      <MuscleGlow cx={cx+18} cy={90} rx={18} ry={12} rotate={15}/>
      <circle cx={cx+35} cy={108} r={4} fill={ACC} opacity="0.9"/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">SIDE CHEST</text>
    </PoseWrapper>
  );
}

// ─── POSE 4: BACK DOUBLE BICEPS ──────────────────────────────────────────────
// Facing AWAY. Same arm position as front double biceps.
// Back muscles: traps, lats, erectors, glutes, hamstrings visible.
export function PoseBackDoubleBiceps({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      <Thigh x1={cx-20} y1={140} x2={cx-22} y2={180}/>
      <Thigh x1={cx+20} y1={140} x2={cx+22} y2={180}/>
      <Shin  x1={cx-22} y1={180} x2={cx-20} y2={198}/>
      <Shin  x1={cx+22} y1={180} x2={cx+20} y2={198}/>
      <ellipse cx={cx-24} cy={200} rx={12} ry={4} fill={FIG}/>
      <ellipse cx={cx+24} cy={200} rx={12} ry={4} fill={FIG}/>
      {/* Back torso */}
      <Torso cx={cx} shoulderY={75} hipY={142} shoulderW={52} hipW={28} facing="back"/>
      {/* Traps */}
      <path d={`M${cx-26},75 Q${cx},68 ${cx+26},75 Q${cx+18},88 ${cx},85 Q${cx-18},88 ${cx-26},75 Z`}
        fill={FIG} opacity="0.9"/>
      {/* ARMS — same as front double biceps */}
      <UpperArm x1={cx-26} y1={83} x2={cx-68} y2={92}/>
      <Forearm  x1={cx-68} y1={92} x2={cx-62} y2={55}/>
      <UpperArm x1={cx+26} y1={83} x2={cx+68} y2={92}/>
      <Forearm  x1={cx+68} y1={92} x2={cx+62} y2={55}/>
      <ellipse cx={cx-60} cy={52} rx={6} ry={5} fill={FIG}/>
      <ellipse cx={cx+60} cy={52} rx={6} ry={5} fill={FIG}/>
      <Head cx={cx} headY={50}/>
      <MuscleGlow cx={cx-60} cy={73} rx={16} ry={10} rotate={-70}/>
      <MuscleGlow cx={cx+60} cy={73} rx={16} ry={10} rotate={70}/>
      <MuscleGlow cx={cx} cy={108} rx={20} ry={18}/>
      <circle cx={cx-68} cy={92} r={4} fill={ACC} opacity="0.9"/>
      <circle cx={cx+68} cy={92} r={4} fill={ACC} opacity="0.9"/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">BACK DOUBLE BICEPS</text>
    </PoseWrapper>
  );
}

// ─── POSE 5: BACK LAT SPREAD ─────────────────────────────────────────────────
// Facing away. Thumbs/hands on lower back/hips. Elbows flared wide.
// Lats spread to maximum width.
export function PoseBackLatSpread({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      <Thigh x1={cx-16} y1={140} x2={cx-18} y2={180}/>
      <Thigh x1={cx+16} y1={140} x2={cx+18} y2={180}/>
      <Shin  x1={cx-18} y1={180} x2={cx-16} y2={198}/>
      <Shin  x1={cx+18} y1={180} x2={cx+16} y2={198}/>
      <ellipse cx={cx-18} cy={200} rx={11} ry={4} fill={FIG}/>
      <ellipse cx={cx+18} cy={200} rx={11} ry={4} fill={FIG}/>
      {/* Extra wide back torso */}
      <Torso cx={cx} shoulderY={75} hipY={142} shoulderW={60} hipW={28} facing="back"/>
      <path d={`M${cx-30},75 Q${cx},68 ${cx+30},75 Q${cx+20},88 ${cx},85 Q${cx-20},88 ${cx-30},75 Z`}
        fill={FIG} opacity="0.9"/>
      {/* ARMS — elbows wide, forearms going DOWN to lower back */}
      <UpperArm x1={cx-30} y1={83} x2={cx-74} y2={100}/>
      <Forearm  x1={cx-74} y1={100} x2={cx-44} y2={132}/>
      <UpperArm x1={cx+30} y1={83} x2={cx+74} y2={100}/>
      <Forearm  x1={cx+74} y1={100} x2={cx+44} y2={132}/>
      <ellipse cx={cx-42} cy={135} rx={7} ry={5} fill={FIG}/>
      <ellipse cx={cx+42} cy={135} rx={7} ry={5} fill={FIG}/>
      <Head cx={cx} headY={50}/>
      <MuscleGlow cx={cx-56} cy={108} rx={22} ry={13} rotate={-18}/>
      <MuscleGlow cx={cx+56} cy={108} rx={22} ry={13} rotate={18}/>
      <circle cx={cx-74} cy={100} r={4} fill={ACC} opacity="0.9"/>
      <circle cx={cx+74} cy={100} r={4} fill={ACC} opacity="0.9"/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">BACK LAT SPREAD</text>
    </PoseWrapper>
  );
}

// ─── POSE 6: SIDE TRICEPS ────────────────────────────────────────────────────
// 90° side turn. Rear arm pulled BEHIND body, elbow locked straight.
// Tricep visible from side. Front leg slightly in front.
export function PoseSideTriceps({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      <Thigh x1={cx-5}  y1={140} x2={cx-3}  y2={180} dim={true}/>
      <Thigh x1={cx+5}  y1={140} x2={cx+8}  y2={180}/>
      <Shin  x1={cx-3}  y1={180} x2={cx-5}  y2={198} dim={true}/>
      <Shin  x1={cx+8}  y1={178} x2={cx+6}  y2={198}/>
      <ellipse cx={cx-4}  cy={200} rx={10} ry={4} fill={FIG2}/>
      <ellipse cx={cx+7}  cy={200} rx={10} ry={4} fill={FIG}/>
      {/* Side torso */}
      <path d={`M${cx-18},75 Q${cx+10},72 ${cx+26},82 Q${cx+30},110 ${cx+20},142
                L${cx-12},142 Q${cx-20},112 ${cx-18},75 Z`} fill={FIG}/>
      {/* REAR ARM — straight behind back, elbow locked */}
      <UpperArm x1={cx-14} y1={92} x2={cx-45} y2={115}/>
      <Forearm  x1={cx-45} y1={115} x2={cx-18} y2={148}/>
      {/* FRONT ARM — bent at side */}
      <UpperArm x1={cx+8} y1={88} x2={cx+32} y2={108}/>
      <Forearm  x1={cx+32} y1={108} x2={cx+28} y2={130}/>
      <Head cx={cx+4} headY={50}/>
      {/* Tricep glow on rear arm */}
      <MuscleGlow cx={cx-32} cy={108} rx={16} ry={9} rotate={-30}/>
      <circle cx={cx-45} cy={115} r={4} fill={ACC} opacity="0.9"/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">SIDE TRICEPS</text>
    </PoseWrapper>
  );
}

// ─── POSE 7: ABDOMINALS & THIGHS ─────────────────────────────────────────────
// One foot stepped FORWARD, front knee bent. Both hands clasped BEHIND head.
// Crunch forward showing abs. Front quad contracted.
export function PoseAbsThighs({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      {/* Back leg straight */}
      <Thigh x1={cx+14} y1={138} x2={cx+16} y2={178} dim={true}/>
      <Shin  x1={cx+16} y1={178} x2={cx+14} y2={198} dim={true}/>
      <ellipse cx={cx+16} cy={200} rx={11} ry={4} fill={FIG2}/>
      {/* Front leg stepped forward, knee bent */}
      <Thigh x1={cx-14} y1={138} x2={cx-22} y2={170}/>
      <Shin  x1={cx-22} y1={170} x2={cx-10} y2={198}/>
      <ellipse cx={cx-12} cy={200} rx={12} ry={4} fill={FIG}/>
      {/* Torso — slightly crunched forward */}
      <path d={`M${cx-26},78 Q${cx-28},110 ${cx-18},140 L${cx+18},140
                Q${cx+28},110 ${cx+26},78 Q${cx+10},72 ${cx-10},72 Z`} fill={FIG}/>
      {/* Abs definition — very prominent */}
      {[0,1,2,3].map(i => (
        <rect key={i} x={cx-11} y={82+i*13} width={10} height={10} rx={2}
          fill="none" stroke={SHD} strokeWidth="1.5" opacity="0.6"/>
      ))}
      {[0,1,2,3].map(i => (
        <rect key={i} x={cx+1} y={82+i*13} width={10} height={10} rx={2}
          fill="none" stroke={SHD} strokeWidth="1.5" opacity="0.6"/>
      ))}
      {/* Arms — hands clasped behind head, elbows out */}
      <UpperArm x1={cx-22} y1={82} x2={cx-55} y2={72}/>
      <Forearm  x1={cx-55} y1={72} x2={cx-20} y2={55}/>
      <UpperArm x1={cx+22} y1={82} x2={cx+55} y2={72}/>
      <Forearm  x1={cx+55} y1={72} x2={cx+20} y2={55}/>
      {/* Clasped hands behind head */}
      <ellipse cx={cx} cy={53} rx={12} ry={6} fill={FIG}/>
      <Head cx={cx} headY={42}/>
      <MuscleGlow cx={cx} cy={105} rx={22} ry={28}/>
      <circle cx={cx-55} cy={72} r={4} fill={ACC} opacity="0.9"/>
      <circle cx={cx+55} cy={72} r={4} fill={ACC} opacity="0.9"/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">ABDOMINALS & THIGHS</text>
    </PoseWrapper>
  );
}

// ─── POSE 8: MOST MUSCULAR (CRAB POSE) ───────────────────────────────────────
// Hands clasped/fists TOGETHER in front at waist level.
// Shoulders hunched FORWARD aggressively. Arms tensed. Neck thick.
// Most dramatic pose — maximum muscle display.
export function PoseMostMuscular({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      {/* Legs — feet shoulder-width, knees slightly bent */}
      <Thigh x1={cx-22} y1={145} x2={cx-24} y2={182}/>
      <Thigh x1={cx+22} y1={145} x2={cx+24} y2={182}/>
      <Shin  x1={cx-24} y1={182} x2={cx-20} y2={198}/>
      <Shin  x1={cx+24} y1={182} x2={cx+20} y2={198}/>
      <ellipse cx={cx-22} cy={200} rx={13} ry={4} fill={FIG}/>
      <ellipse cx={cx+22} cy={200} rx={13} ry={4} fill={FIG}/>
      {/* Torso — wide, hunched forward: shoulders wider than normal */}
      <path d={`M${cx-42},80 Q${cx-38},88 ${cx-26},95
                L${cx-24},145 L${cx+24},145 L${cx+26},95
                Q${cx+38},88 ${cx+42},80
                Q${cx+22},70 ${cx},68
                Q${cx-22},70 ${cx-42},80 Z`} fill={FIG}/>
      {/* Traps prominent */}
      <path d={`M${cx-38},78 Q${cx-15},68 ${cx},66 Q${cx+15},68 ${cx+38},78
                Q${cx+30},85 ${cx},82 Q${cx-30},85 ${cx-38},78 Z`}
        fill={FIG} opacity="0.9"/>
      {/* Thick neck */}
      <rect x={cx-10} y={58} width={20} height={14} rx={5} fill={FIG}/>
      {/* ARMS — forearms DOWN and inward to clasped hands */}
      <UpperArm x1={cx-34} y1={92} x2={cx-60} y2={118}/>
      <Forearm  x1={cx-60} y1={118} x2={cx-14} y2={148}/>
      <UpperArm x1={cx+34} y1={92} x2={cx+60} y2={118}/>
      <Forearm  x1={cx+60} y1={118} x2={cx+14} y2={148}/>
      {/* Clasped fists in center */}
      <ellipse cx={cx} cy={150} rx={16} ry={8} fill={FIG}/>
      {/* Head */}
      <Head cx={cx} headY={50}/>
      {/* Massive muscle glow everywhere */}
      <MuscleGlow cx={cx-52} cy={100} rx={18} ry={12} rotate={-25}/>
      <MuscleGlow cx={cx+52} cy={100} rx={18} ry={12} rotate={25}/>
      <MuscleGlow cx={cx} cy={80} rx={28} ry={12}/>
      <circle cx={cx-60} cy={118} r={4} fill={ACC} opacity="0.9"/>
      <circle cx={cx+60} cy={118} r={4} fill={ACC} opacity="0.9"/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">MOST MUSCULAR</text>
    </PoseWrapper>
  );
}

// ─── POSE 9: MEN'S PHYSIQUE FRONT ────────────────────────────────────────────
// RELAXED quarter turn. Arms slightly away from sides (not clenched).
// Board shorts. More relaxed/aesthetic vs classic bodybuilding.
export function PoseMPFront({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      <Thigh x1={cx-16} y1={140} x2={cx-16} y2={180}/>
      <Thigh x1={cx+16} y1={140} x2={cx+16} y2={180}/>
      <Shin  x1={cx-16} y1={180} x2={cx-15} y2={198}/>
      <Shin  x1={cx+16} y1={180} x2={cx+15} y2={198}/>
      <ellipse cx={cx-16} cy={200} rx={11} ry={4} fill={FIG}/>
      <ellipse cx={cx+16} cy={200} rx={11} ry={4} fill={FIG}/>
      {/* Board shorts */}
      <path d={`M${cx-22},140 L${cx-20},165 L${cx},162 L${cx+20},165 L${cx+22},140 Z`}
        fill="#2a2a35"/>
      {/* Torso — aesthetic, narrower waist */}
      <Torso cx={cx} shoulderY={78} hipY={142} shoulderW={46} hipW={24}/>
      {/* Arms — relaxed at sides, slightly away from body */}
      <UpperArm x1={cx-24} y1={88} x2={cx-36} y2={132}/>
      <Forearm  x1={cx-36} y1={132} x2={cx-32} y2={170}/>
      <UpperArm x1={cx+24} y1={88} x2={cx+36} y2={132}/>
      <Forearm  x1={cx+36} y1={132} x2={cx+32} y2={170}/>
      <Head cx={cx} headY={55}/>
      <MuscleGlow cx={cx} cy={100} rx={18} ry={10}/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">MEN'S PHYSIQUE — FRONT</text>
    </PoseWrapper>
  );
}

// ─── POSE 10: MEN'S PHYSIQUE BACK ────────────────────────────────────────────
export function PoseMPBack({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      <Thigh x1={cx-16} y1={140} x2={cx-16} y2={180}/>
      <Thigh x1={cx+16} y1={140} x2={cx+16} y2={180}/>
      <Shin  x1={cx-16} y1={180} x2={cx-15} y2={198}/>
      <Shin  x1={cx+16} y1={180} x2={cx+15} y2={198}/>
      <ellipse cx={cx-16} cy={200} rx={11} ry={4} fill={FIG}/>
      <ellipse cx={cx+16} cy={200} rx={11} ry={4} fill={FIG}/>
      <path d={`M${cx-22},140 L${cx-20},165 L${cx},162 L${cx+20},165 L${cx+22},140 Z`}
        fill="#2a2a35"/>
      <Torso cx={cx} shoulderY={78} hipY={142} shoulderW={46} hipW={24} facing="back"/>
      <UpperArm x1={cx-24} y1={88} x2={cx-36} y2={132} dim={true}/>
      <Forearm  x1={cx-36} y1={132} x2={cx-32} y2={170} dim={true}/>
      <UpperArm x1={cx+24} y1={88} x2={cx+36} y2={132} dim={true}/>
      <Forearm  x1={cx+36} y1={132} x2={cx+32} y2={170} dim={true}/>
      <Head cx={cx} headY={55}/>
      <MuscleGlow cx={cx} cy={108} rx={20} ry={14}/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">MEN'S PHYSIQUE — BACK</text>
    </PoseWrapper>
  );
}

// ─── POSE 11: MEN'S PHYSIQUE SIDE ────────────────────────────────────────────
export function PoseMPSide({ size=220 }) {
  const cx=110;
  return (
    <PoseWrapper size={size}>
      <StageFloor y={198}/>
      <Thigh x1={cx-5}  y1={140} x2={cx-3}  y2={180} dim={true}/>
      <Thigh x1={cx+5}  y1={140} x2={cx+7}  y2={180}/>
      <Shin  x1={cx-3}  y1={180} x2={cx-5}  y2={198} dim={true}/>
      <Shin  x1={cx+7}  y1={180} x2={cx+5}  y2={198}/>
      <ellipse cx={cx-4}  cy={200} rx={10} ry={4} fill={FIG2}/>
      <ellipse cx={cx+6}  cy={200} rx={10} ry={4} fill={FIG}/>
      <path d={`M${cx-10},140 L${cx-8},165 L${cx+10},165 L${cx+12},140 Z`} fill="#2a2a35"/>
      <path d={`M${cx-16},78 Q${cx+8},75 ${cx+22},84 Q${cx+25},112 ${cx+16},142
                L${cx-10},142 Q${cx-18},112 ${cx-16},78 Z`} fill={FIG}/>
      <UpperArm x1={cx-10} y1={90} x2={cx-32} y2={130}/>
      <Forearm  x1={cx-32} y1={130} x2={cx-28} y2={165}/>
      <UpperArm x1={cx+8} y1={90} x2={cx+28} y2={130} dim={true}/>
      <Forearm  x1={cx+28} y1={130} x2={cx+24} y2={165} dim={true}/>
      <Head cx={cx+2} headY={55}/>
      <text x={cx} y={215} textAnchor="middle" fill="#444" fontSize="8" fontFamily="system-ui" fontWeight="600" letterSpacing="1">MEN'S PHYSIQUE — SIDE</text>
    </PoseWrapper>
  );
}

// ─── Export map ───────────────────────────────────────────────────────────────
export const POSE_ILLUSTRATIONS = {
  'pose-front-double-biceps': PoseFrontDoubleBiceps,
  'pose-front-lat-spread':    PoseFrontLatSpread,
  'pose-side-chest':          PoseSideChest,
  'pose-back-double-biceps':  PoseBackDoubleBiceps,
  'pose-back-lat-spread':     PoseBackLatSpread,
  'pose-side-triceps':        PoseSideTriceps,
  'pose-abs-thighs':          PoseAbsThighs,
  'pose-most-muscular':       PoseMostMuscular,
  'pose-mp-front':            PoseMPFront,
  'pose-mp-back':             PoseMPBack,
  'pose-mp-side':             PoseMPSide,
};
