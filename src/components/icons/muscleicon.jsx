import React from 'react';

export default function MuscleIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8c0 2.5-2 4-4 4s-4-1.5-4-4"/>
      <path d="M14 12c0 2.5-2 4-4 4s-4-1.5-4-4"/>
      <path d="M10 16c0 2.5-2 4-4 4s-4-1.5-4-4"/>
      <path d="M18 8c2.5 0 4 2 4 4s-1.5 4-4 4"/>
      <path d="M14 12c2.5 0 4 2 4 4s-1.5 4-4 4"/>
      <path d="M10 16c2.5 0 4 2 4 4s-1.5 4-4 4"/>
    </svg>
  );
}