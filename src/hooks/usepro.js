import { useState, useEffect, useCallback } from 'react';
import { getProStatus } from '../payments/polar';

/**
 * Hook to get PRO status and feature gates
 * Usage: const { isPro, canUse } = usePro();
 */
export function usePro() {
  const [proData, setProData] = useState(() => getProStatus());

  useEffect(() => {
    // Re-check when tab gains focus (user may have just subscribed)
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
    // Free tier features
    const FREE = new Set([
      'ai_form',
      'rep_counter',
      'basic_stats',
      'exercises_all',
      'streak',
      'share_card',
      'dark_theme',
      'history_10',
      'ffmi',        // FFMI always free
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
  advanced_stats:    { label: 'Form Score Trends',    desc: 'Track improvement over time per exercise' },
  unlimited_history: { label: 'Full Workout History', desc: 'All your sessions, forever' },
  food_scan:         { label: 'Food Scanner',          desc: 'AI macro analysis from photo' },
  themes:            { label: 'All Themes',            desc: 'Light, Cyber, Sunset + exclusive drops' },
  program_builder:   { label: 'Program Builder',       desc: 'Build & save custom workout routines' },
  rest_timer:        { label: 'Smart Rest Timer',      desc: 'Auto rest timer between sets' },
  export_data:       { label: 'Export Data',           desc: 'Download CSV / PDF report' },
  achievements:      { label: 'Achievements',          desc: 'Unlock badges as you progress' },
};
