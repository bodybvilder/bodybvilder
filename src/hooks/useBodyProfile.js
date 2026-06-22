// ── useBodyProfile — persists user body data needed for calorie calculation ──
import { useState } from 'react';

const STORAGE_KEY = 'bv-body-profile';

const DEFAULT_PROFILE = {
  weight: '',
  unit: 'kg',
  age: '',
  gender: 'male',
  height: '',
  heightUnit: 'cm',
};

export function useBodyProfile() {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const saveProfile = (updates) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const weightKg = (() => {
    const w = parseFloat(profile.weight);
    if (!w || isNaN(w)) return null;
    return profile.unit === 'lb' ? w * 0.453592 : w;
  })();

  const isComplete = !!(profile.weight && profile.age && profile.gender);

  return { profile, saveProfile, weightKg, isComplete };
}
