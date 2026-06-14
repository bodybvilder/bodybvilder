import { useState, useEffect, useCallback } from 'react';
import { getProStatus } from '../payments/lemonsqueezy';

/**
 * Hook to get PRO status and feature gates
 * Usage: const { isPro, canUse } = usePro();
 *        canUse('advanced_stats') → true/false
 */
export function usePro() {
  const [proData, setProData] = useState(() => getProStatus());

  useEffect(() => {
    // Re-check when tab comes back into focus (user may have just subscribed)
    const handleFocus = () => setProData(getProStatus());
    window.addEventListener('focus', handleFocus);
    // Also listen for custom event from webhook sync
    const handleProUpdate = () => setProData(getProStatus());
    window.addEventListener('bv-pro-updated', handleProUpdate);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('bv-pro-updated', handleProUpdate);
    };
  }, []);

  const canUse = useCallback((feature) => {
    if (proData.isPro) return true;
    // Features available to free users
    const freeFeatures = new Set([
      'ai_form',           // core AI coaching — always free
      'rep_counter',       // rep counting — always free
      'basic_stats',       // weekly chart + totals
      'exercises_all',     // all 31 exercises
      'streak',            // streak tracking
      'share_card',        // sharing workout
      'dark_theme',        // default dark theme only
      'history_10',        // last 10 workouts
    ]);
    return freeFeatures.has(feature);
  }, [proData.isPro]);

  return {
    isPro: proData.isPro,
    plan: proData.plan,
    expiresAt: proData.expiresAt,
    canUse,
  };
}

/**
 * Feature definitions — used for gating UI and showing upgrade prompts
 */
export const PRO_FEATURES = {
  advanced_stats:    { label: 'Form Score Trends',    desc: 'Track improvement over time per exercise' },
  unlimited_history: { label: 'Full Workout History', desc: 'All your sessions, forever' },
  themes:            { label: 'All Themes',            desc: 'Light, Cyber, Sunset + exclusive drops' },
  program_builder:   { label: 'Program Builder',       desc: 'Build & save custom workout routines' },
  rest_timer:        { label: 'Smart Rest Timer',      desc: 'Auto rest timer between sets' },
  export_data:       { label: 'Export Data',           desc: 'Download CSV / PDF report' },
  achievements:      { label: 'Achievements',          desc: 'Unlock badges as you progress' },
};
