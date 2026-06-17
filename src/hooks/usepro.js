import { useState, useEffect, useCallback } from 'react';
import { getProStatus, setProStatus } from '../payments/polar';
import { auth } from '../firebase';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

/**
 * Hook to get PRO status — synced from Firestore when logged in,
 * falls back to localStorage for guest mode.
 */
export function usePro() {
  const [proData, setProData] = useState(() => getProStatus());

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      // Guest mode — use localStorage only
      const handleFocus = () => setProData(getProStatus());
      const handleUpdate = () => setProData(getProStatus());
      window.addEventListener('focus', handleFocus);
      window.addEventListener('bv-pro-updated', handleUpdate);
      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('bv-pro-updated', handleUpdate);
      };
    }

    // Logged in — listen to Firestore subscription field
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);

    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const sub = data.subscription || {};

      const isPro = sub.tier === 'pro' && sub.status === 'active';
      const plan = sub.plan || null;
      const expiresAt = sub.expiresAt?.toDate?.()?.toISOString() || null;

      // Sync to localStorage so getProStatus() works offline too
      if (isPro) {
        setProStatus(plan, expiresAt);
      }

      setProData({ isPro, plan, expiresAt });
    }, (err) => {
      console.error('Firestore subscription watch error:', err);
      // Fallback to localStorage
      setProData(getProStatus());
    });

    return () => unsub();
  }, []);

  const canUse = useCallback((feature) => {
    if (proData.isPro) return true;
    const FREE = new Set([
      'ai_form',
      'rep_counter',
      'basic_stats',
      'exercises_all',
      'streak',
      'share_card',
      'dark_theme',
      'history_10',
      'ffmi',
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
