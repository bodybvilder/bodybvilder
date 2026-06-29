/**
 * BODYBVILDER Icon Library
 * All SVG icons used across the app — no emoji anywhere.
 * Every icon is a clean SVG path, consistent 24x24 viewBox.
 * Usage: <Icon name="chest" size={20} color="var(--accent)" />
 */
import React from 'react';

// ── Individual named icons ────────────────────────────────────────────────

// Muscle group / category icons
export const ChestIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"/>
    <line x1="4" y1="21" x2="20" y2="21"/>
  </svg>
);

export const BackIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="4" x2="20" y2="4" strokeWidth={strokeWidth + 0.5}/>
    <path d="M9 4v4M15 4v4M9 8q3 1 6 0"/>
    <circle cx="12" cy="11" r="2" fill={color} stroke="none"/>
    <line x1="12" y1="13" x2="12" y2="18"/>
    <path d="M12 18l-2 3M12 18l2 3"/>
  </svg>
);

export const LegsIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3h8v6a4 4 0 01-8 0V3z"/>
    <path d="M8 9l-2 12M16 9l2 12"/>
    <path d="M6 21h4M18 21h-4"/>
  </svg>
);

export const ShouldersIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8a4 4 0 100-8 4 4 0 000 8z"/>
    <path d="M4 14c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
    <path d="M2 17h4M18 17h4"/>
  </svg>
);

export const ArmsIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8c0-4 4-7 7-5.5M19 8c0-4-4-7-7-5.5"/>
    <path d="M5 8c-2 3-1 6 2 7l5 1M19 8c2 3 1 6-2 7l-5 1"/>
    <path d="M7 15l1 7M17 15l-1 7"/>
  </svg>
);

export const CoreIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="3" width="10" height="18" rx="3"/>
    <line x1="7" y1="9" x2="17" y2="9"/>
    <line x1="7" y1="15" x2="17" y2="15"/>
    <line x1="12" y1="3" x2="12" y2="21"/>
  </svg>
);

export const CardioIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

// Workout / fitness icons
export const TrophyIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
    <path d="M4 22h16"/>
    <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
    <line x1="12" y1="15" x2="12" y2="22"/>
  </svg>
);

export const FlameIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3C8.928 6.857 9.776 4.946 12 3c.5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-14 0c0-1.153.433-2.294 1-3A2.5 2.5 0 008.5 14.5z"/>
  </svg>
);

export const BoltIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

export const DumbbellIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v16M18 4v16M6 8H4a1 1 0 000 2h2M6 14H4a1 1 0 000 2h2M18 8h2a1 1 0 000-2h-2M18 14h2a1 1 0 000-2h-2M6 8h12v8H6z"/>
  </svg>
);

export const TargetIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

export const StarIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export const CheckCircleIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export const BarChartIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

export const TrendUpIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

export const WeightIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/>
    <path d="M6.5 8a2 2 0 00-1.905 2.568L7 21h10l2.405-10.432A2 2 0 0017.5 8h-11z"/>
  </svg>
);

export const RulerIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 8.7l-9.6 9.6a1 1 0 01-1.4 0l-4.6-4.6a1 1 0 010-1.4l9.6-9.6a1 1 0 011.4 0l4.6 4.6a1 1 0 010 1.4z"/>
    <path d="M7.5 10.5l1.5 1.5M11 7l1.5 1.5M14.5 10.5l1.5 1.5M11 14l1.5 1.5"/>
  </svg>
);

export const MedalIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="15" r="7"/>
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>
    <path d="M15 7l-3-4-3 4 1 2h4l1-2z"/>
  </svg>
);

export const ShieldIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export const CrownIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20M4 20L2 8l6 4 4-8 4 8 6-4-2 12H4z"/>
  </svg>
);

// Nutrition icons
export const FoodIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

export const ProteinIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="12" r="4"/>
    <circle cx="16" cy="8" r="3"/>
    <circle cx="16" cy="16" r="3"/>
    <line x1="11.5" y1="10.5" x2="13.5" y2="9"/>
    <line x1="11.5" y1="13.5" x2="13.5" y2="15"/>
  </svg>
);

// UI / Navigation icons
export const HomeIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export const UserIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const ChatIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

export const ChecklistIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
);

export const PlusIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const ArrowRightIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

export const ArrowLeftIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

export const PlayIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

export const InfoIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export const LockIcon = ({ size = 20, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

// ── Universal Icon component ──────────────────────────────────────────────
const ICONS = {
  chest:        ChestIcon,
  back:         BackIcon,
  legs:         LegsIcon,
  shoulders:    ShouldersIcon,
  arms:         ArmsIcon,
  core:         CoreIcon,
  cardio:       CardioIcon,
  all:          DumbbellIcon,
  poses:        TrophyIcon,
  triceps:      ArmsIcon,
  trophy:       TrophyIcon,
  flame:        FlameIcon,
  bolt:         BoltIcon,
  dumbbell:     DumbbellIcon,
  target:       TargetIcon,
  star:         StarIcon,
  check:        CheckCircleIcon,
  chart:        BarChartIcon,
  trend:        TrendUpIcon,
  weight:       WeightIcon,
  ruler:        RulerIcon,
  medal:        MedalIcon,
  shield:       ShieldIcon,
  crown:        CrownIcon,
  food:         FoodIcon,
  protein:      ProteinIcon,
  home:         HomeIcon,
  user:         UserIcon,
  chat:         ChatIcon,
  checklist:    ChecklistIcon,
  plus:         PlusIcon,
  arrowRight:   ArrowRightIcon,
  arrowLeft:    ArrowLeftIcon,
  play:         PlayIcon,
  info:         InfoIcon,
  lock:         LockIcon,
};

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, filled = false }) {
  const Component = ICONS[name];
  if (!Component) return null;
  return <Component size={size} color={color} strokeWidth={strokeWidth} filled={filled} />;
}

export default Icon;
