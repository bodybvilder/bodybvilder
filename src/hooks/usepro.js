import { useState, useEffect, useCallback } from 'react';
import { getProStatus, setProStatus } from '../payments/polar';

/**
 * usePro — reads PRO status from localStorage (fast, sync)
 * Firebase sync happens separately via webhook → already updates localStorage
 * This keeps it simple and crash-safe
 */
export function usePro() {
  const [proData, setProData] = useState(() => getProStatus());

  useEffect(() => {
    // Re-check on focus (user may have just subscribed in another tab)
    const handleFocus = () => setProData(getProStatus());
    const handleUpdate = () => setProData(getProStatus());

    window.addEventListener('focus', handleFocus);
    window.addEventListener('bv-pro-updated', handleUpdate);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('bv-pro-updated', handleUpdate);
    };
  }, []);

  const canUse = useCallback((feature) => {
    if (proData.isPro) return true;
    const FREE = new Set([
      'ai_form', 'rep_counter', 'basic_stats',
      'exercises_all', 'streak', 'share_card',
      'dark_theme', 'history_10', 'ffmi',
    ]);
    return FREE.has(feature);
  }, [proData.isPro]);

  return {
    isPro: proData.isPro,
    plan: proData.plan,
    expiresAt: proData.expiresAt,
    canUse,
  };
}

export const PRO_FEATURES = {
  advanced_stats:    { label: 'Form Score Trends',    desc: 'Track improvement over time' },
  unlimited_history: { label: 'Full Workout History', desc: 'All sessions, forever' },
  food_scan:         { label: 'Food Scanner',          desc: 'AI macro from photo' },
  themes:            { label: 'All Themes',            desc: 'Light, Cyber, Sunset + more' },
  program_builder:   { label: 'Program Builder',       desc: 'Build custom routines' },
  rest_timer:        { label: 'Smart Rest Timer',      desc: 'Auto countdown between sets' },
  achievements:      { label: 'Achievements',          desc: 'Unlock badges' },
};
