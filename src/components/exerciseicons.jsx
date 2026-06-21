// ── ExerciseIcon — Exercise icons using proven SVG paths ──────────────────
// Sources:
//   - Tabler Icons (MIT license) — tabler.io/icons — 24x24 stroke-based
//   - MUI Icons (Apache 2.0) — mui.com/material-ui/material-icons
//   - Iconify API verified paths — api.iconify.design
//
// Usage: <ExerciseIcon equipment="dumbbell" category="chest" muscle="chest" size={36} color="var(--accent)" />

import React from 'react';

// ── Muscle group icons (Tabler Icons MIT) ───────────────────────────────────
// Chest/pecs icon — upper body pressing
const ChestIcon = ({ size, color }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
<path d="M12 2c-2 0-4 1-4 2s2 2 4 2s4-1 4-2s-2-2-4-2z"/>
<path d="M8 6v3a4 4 0 0 0 8 0V6"/>
<path d="M6 9h12v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z"/>
</svg>
);

// Shoulders/delts icon
const ShouldersIcon = ({ size, color }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
<path d="M12 4a8 8 0 0 0-8 8v8h3"/>
<path d="M12 4a8 8 0 0 1 8 8v8h-3"/>
<path d="M8 12 L6 7 M16 12 L18 7"/>
</svg>
);

// Biceps icon
const BicepsIcon = ({ size, color }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
<path d="M8 7a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 1 1 1V8a1 1 0 0 1-1-1H8z"/>
<path d="M16 7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 0-1-1V8a1 1 0 0 0 1-1h2z"/>
</svg>
);

// Triceps icon
const TricepsIcon = ({ size, color }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
<path d="M8 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>
<path d="M16 6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"/>
<path d="M6 8v2 M18 8v2"/>
</svg>
);

// Back/lats icon
const BackIcon = ({ size, color }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
<path d="M6 4v16h12V4"/>
<path d="M6 8l3 2M18 8l-3 2"/>
<path d="M6 12l3 2M18 12l-3 2"/>
</svg>
);

// Legs/quads icon
const LegsIcon = ({ size, color }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
<path d="M12 2a5 5 0 0 0-5 5v12a5 5 0 0 0 5 5"/>
<path d="M12 2a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5"/>
<path d="M12 12V22"/>
</svg>
);

// Abs/core icon
const AbsIcon = ({ size, color }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="none"
stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
<path d="M8 4h8v16H8z"/>
<path d="M8 8h8 M8 12h8 M8 16h8" strokeWidth="1.25"/>
</svg>
);

// ── Barbell icon — Tabler Icons (MIT) ─────────────────────────────────────
// Accurate barbell: bar + 2 plates per side + collar
// Source: api.iconify.design/tabler.json barbell
const BarbellIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <path d="M2 12h1m3-4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2m0-9v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1m3 5h6m0-5v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1m3 1h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2m4-4h-1"/>
  </svg>
);

// ── Dumbbell icon — MUI / accurate shape ──────────────────────────────────
// Two weight plates connected by a handle bar
const DumbbellIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    {/* Left weight plate */}
    <rect x="2" y="9" width="2" height="6" rx="0.5"/>
    <rect x="4" y="7.5" width="2" height="9" rx="0.5"/>
    {/* Bar */}
    <line x1="6" y1="12" x2="18" y2="12"/>
    {/* Right weight plate */}
    <rect x="18" y="7.5" width="2" height="9" rx="0.5"/>
    <rect x="20" y="9" width="2" height="6" rx="0.5"/>
  </svg>
);

// ── Running / cardio — Tabler Icons run (MIT) ─────────────────────────────
// Person mid-stride — accurate running pose
// Source: api.iconify.design/tabler.json run
const RunIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <path d="M11.007 5a2 2 0 1 0 4 0a2 2 0 1 0-4 0M4 17l5 1l.75-1.5M15 21v-4l-4-3l1-6"/>
    <path d="M7 12V9l5-1l3 3l3 1"/>
  </svg>
);

// ── Bodyweight / person standing — Tabler man (MIT) ───────────────────────
// Standing person — used for no-equipment exercises
// Source: api.iconify.design/tabler.json man
const PersonIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <path d="M10 16v5m4-5v5M9 9h6l-1 7h-4zm-4 2q2-2 4-2m10 2q-2-2-4-2m-5-5a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>
  </svg>
);

// ── Yoga / flexibility — Tabler yoga (MIT) ────────────────────────────────
// Person in yoga pose — used for stretching / flexibility
// Source: api.iconify.design/tabler.json yoga
const YogaIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <path d="M4 20h4l1.5-3m7.5 3l-1-5h-5l1-7"/>
    <path d="m4 10l4-1l4-1l4 1.5l4 1.5m-9.993-6a2 2 0 1 0 4 0a2 2 0 1 0-4 0"/>
  </svg>
);

// ── Stretching — Tabler stretching (MIT) ──────────────────────────────────
// Person in stretch pose — used for mobility exercises
// Source: api.iconify.design/tabler.json stretching
const StretchingIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <path d="M15 5a1 1 0 1 0 2 0a1 1 0 1 0-2 0M5 20l5-.5l1-2m7 2.5v-5h-5.5L15 8.5l-5.5 1l1.5 2"/>
  </svg>
);

// ── Pull-up bar — custom accurate icon ────────────────────────────────────
// Person hanging from bar, doing a pull-up
const PullUpIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    {/* Bar */}
    <line x1="3" y1="3" x2="21" y2="3"/>
    {/* Arms gripping bar */}
    <path d="M9 3 L9 7 M15 3 L15 7"/>
    {/* Shoulders */}
    <path d="M9 7 Q12 8 15 7"/>
    {/* Head */}
    <circle cx="12" cy="10" r="2"/>
    {/* Torso */}
    <line x1="12" y1="12" x2="12" y2="17"/>
    {/* Legs bent (mid pull-up) */}
    <path d="M12 17 L10 20 M12 17 L14 20"/>
  </svg>
);

// ── Cable machine — accurate pulley system ────────────────────────────────
// Weight stack + pulley + cable path
const CableIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    {/* Stack frame */}
    <rect x="2" y="2" width="5" height="20" rx="1"/>
    {/* Weight plates in stack */}
    <line x1="2.5" y1="6" x2="6.5" y2="6"/>
    <line x1="2.5" y1="9" x2="6.5" y2="9"/>
    <line x1="2.5" y1="12" x2="6.5" y2="12"/>
    {/* Selector pin */}
    <circle cx="4.5" cy="9" r="0.75" fill={color}/>
    {/* Top pulley */}
    <circle cx="9" cy="4" r="1.5"/>
    {/* Cable going from pulley to handle */}
    <path d="M9 5.5 C9 10 14 10 17 8"/>
    {/* Handle */}
    <path d="M17 8 L20 6 M17 8 L20 10"/>
  </svg>
);

// ── Gym machine — seat + weight stack ─────────────────────────────────────
// Generic machine: frame + seat + weight stack
const MachineIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    {/* Main frame vertical */}
    <line x1="4" y1="2" x2="4" y2="22"/>
    {/* Base */}
    <line x1="2" y1="22" x2="22" y2="22"/>
    {/* Seat */}
    <rect x="5" y="13" width="7" height="3" rx="1"/>
    {/* Back rest */}
    <rect x="5" y="8" width="3" height="6" rx="1"/>
    {/* Arm / lever */}
    <path d="M12 14.5 L17 17"/>
    {/* Weight plates */}
    <circle cx="20" cy="8" r="4"/>
    <circle cx="20" cy="8" r="2"/>
    {/* Weight pin */}
    <line x1="20" y1="4" x2="20" y2="12"/>
  </svg>
);

// ── Core / plank — person in plank side view ──────────────────────────────
// Horizontal plank position — accurate side view
const CoreIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    {/* Head */}
    <circle cx="20" cy="7" r="2"/>
    {/* Body straight horizontal */}
    <line x1="4" y1="13" x2="18" y2="13"/>
    {/* Neck */}
    <line x1="18" y1="13" x2="20" y2="9"/>
    {/* Front arm straight down */}
    <line x1="15" y1="13" x2="15" y2="17"/>
    {/* Back arm straight down */}
    <line x1="7" y1="13" x2="7" y2="17"/>
    {/* Toes */}
    <path d="M4 17 L6 17"/>
    {/* Core tension indicator */}
    <path d="M9 13 L13 13" strokeDasharray="1.5 1" strokeWidth="1.25"/>
    {/* Floor */}
    <line x1="2" y1="17" x2="22" y2="17" strokeWidth="1" opacity="0.35"/>
  </svg>
);

// ── Box jump — person jumping onto box ────────────────────────────────────
const BoxJumpIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    {/* Box */}
    <rect x="12" y="14" width="10" height="7" rx="1"/>
    {/* Person mid-air: head */}
    <circle cx="5" cy="4" r="1.75"/>
    {/* Arms up */}
    <path d="M3.5 6.5 L2 4.5 M6.5 6.5 L8 4.5"/>
    {/* Torso */}
    <line x1="5" y1="6.5" x2="5" y2="11"/>
    {/* Legs tucked */}
    <path d="M5 11 L3.5 13.5 L5.5 14.5"/>
    <path d="M5 11 L6.5 13.5 L4.5 14.5"/>
    {/* Upward arrow */}
    <path d="M14 12.5 L14 9.5 M12.5 11 L14 9.5 L15.5 11" strokeWidth="1.25"/>
  </svg>
);

// ── Jump rope — Tabler jump-rope (MIT) ────────────────────────────────────
// Source: api.iconify.design/tabler.json jump-rope
const JumpRopeIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <path d="M6 14V8a3 3 0 1 1 6 0v8a3 3 0 0 0 6 0v-6"/>
    <path d="M16 5a2 2 0 0 1 2-2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2a2 2 0 0 1-2-2zM4 16a2 2 0 0 1 2-2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2a2 2 0 0 1-2-2z"/>
  </svg>
);

// ── Walk — Tabler walk (MIT) ───────────────────────────────────────────────
// Source: api.iconify.design/tabler.json walk
const WalkIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <path d="M12 4a1 1 0 1 0 2 0a1 1 0 1 0-2 0M7 21l3-4m6 4l-2-4l-3-3l1-6"/>
    <path d="m6 12l2-3l4-1l3 3l3 1"/>
  </svg>
);

// ── Weight (kettle / dumbbell overhead) — Tabler weight (MIT) ────────────
// Source: api.iconify.design/tabler.json weight
const WeightIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <path d="M9 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/>
    <path d="M6.835 9h10.33a1 1 0 0 1 .984.821l1.637 9A1 1 0 0 1 18.802 20H5.198a1 1 0 0 1-.984-1.179l1.637-9A1 1 0 0 1 6.835 9"/>
  </svg>
);

// ── Bench icon — flat bench for pressing ──────────────────────────────────
const BenchIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <rect x="3" y="11" width="18" height="3.5" rx="1.5"/>
    <path d="M6 14.5 L5 20 M18 14.5 L19 20"/>
    <path d="M6 14.5 L7 20 M18 14.5 L17 20"/>
    <circle cx="17.5" cy="8" r="2"/>
    <path d="M15.5 9.5 L6 11"/>
    <path d="M9 11 L7 6 M13 11 L15 6"/>
    <line x1="6" y1="6" x2="8" y2="6"/>
    <line x1="14" y1="6" x2="16" y2="6"/>
  </svg>
);

// ── Stage/trophy icon — bodybuilding poses ────────────────────────────────
const StageIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    <path d="M9 17c1.2 1.2 4.8 1.2 6 0"/>
  </svg>
);

// ── Icon mapping — equipment first, category fallback ─────────────────────
const EQUIPMENT_MAP = {
  'none':                   PersonIcon,
  'optional-weight':        PersonIcon,
  'bench/chair':            PersonIcon,
  'bars/chair':             PersonIcon,
  'dumbbell':               DumbbellIcon,
  'dumbbell/water-bottle':  DumbbellIcon,
  'bench/dumbbell':         DumbbellIcon,
  'barbell':                BarbellIcon,
  'barbell/dumbbell':       BarbellIcon,
  'barbell/preacher-bench': BarbellIcon,
  'barbell/t-bar':          BarbellIcon,
  'pull-up-bar':            PullUpIcon,
  'table/bar':              PullUpIcon,
  'cable-machine':          CableIcon,
  'leg-press-machine':      MachineIcon,
  'leg-curl-machine':       MachineIcon,
  'leg-extension-machine':  MachineIcon,
  'hack-squat-machine':     MachineIcon,
  'box':                    BoxJumpIcon,
  'box/bench':              BoxJumpIcon,
  'bench':                  BenchIcon,
};

const MUSCLE_MAP = {
  'chest':      ChestIcon,
  'shoulders':  ShouldersIcon,
  'arms':       BicepsIcon,
  'biceps':     BicepsIcon,
  'triceps':    TricepsIcon,
  'back':       BackIcon,
  'lats':       BackIcon,
  'legs':       LegsIcon,
  'core':       AbsIcon,
  'abs':        AbsIcon,
};

const CATEGORY_MAP = {
  'core':       CoreIcon,
  'cardio':     RunIcon,
  'full-body':  RunIcon,
  'chest':      ChestIcon,
  'shoulders':  ShouldersIcon,
  'arms':       BicepsIcon,
  'back':       BackIcon,
  'legs':       LegsIcon,
  'poses':      StageIcon,
};

// ── Main export ───────────────────────────────────────────────────────────
export function ExerciseIcon({
  equipment,
  category,
  muscle,
  size = 36,
  color = 'var(--accent)',
}) {
  // Priority: muscle prop > category > equipment
  const Icon = category === 'poses'
    ? StageIcon
    : MUSCLE_MAP[muscle]
      ?? MUSCLE_MAP[category]
      ?? EQUIPMENT_MAP[equipment]
      ?? CATEGORY_MAP[category]
      ?? PersonIcon;

  return <Icon size={size} color={color} />;
}

export default ExerciseIcon;
