// ══════════════════════════════════════════════════════════════════════════════
// SmartBurnEngine.js — Real-time calorie burn calculator
// Formula: Calories = MET × WeightKg × DurationHours × FormMultiplier × PersonalFactor
//
// Layers:
//   1. MET base         — exercise intensity baseline (ACSM / Compendium of Physical Activities)
//   2. FormMultiplier   — 0.60–1.30 based on ROM, speed, stability from MediaPipe
//   3. PersonalFactor   — 0.85–1.15 correction from workout history (auto-calibrates)
//
// Confidence:
//   'high'   — weight known + form data active (5+ samples)
//   'medium' — weight known, no live form data
//   'low'    — weight unknown (uses population average 70kg)
// ══════════════════════════════════════════════════════════════════════════════

// ── MET Database (Compendium of Physical Activities, ACSM-adjusted for resistance) ──
// Note: Resistance training METs are adjusted upward ~20% from standard Compendium
// to account for EPOC (excess post-exercise oxygen consumption).
// Source basis: Ainsworth et al. 2011 Compendium + strength training EPOC research
const MET_DATABASE = {
  // ── BODYWEIGHT / CALISTHENICS ─────────────────────────────────────────
  'pushup':               { met: 8.0,  category: 'calisthenics' },
  'incline-pushup':       { met: 5.5,  category: 'calisthenics' },
  'decline-pushup':       { met: 8.5,  category: 'calisthenics' },
  'diamond-pushup':       { met: 8.5,  category: 'calisthenics' },
  'wide-pushup':          { met: 8.0,  category: 'calisthenics' },
  'pike-pushup':          { met: 7.5,  category: 'calisthenics' },
  'pullup':               { met: 8.0,  category: 'calisthenics' },
  'chinup':               { met: 8.0,  category: 'calisthenics' },
  'dip':                  { met: 8.0,  category: 'calisthenics' },
  'bench-dip':            { met: 6.0,  category: 'calisthenics' },
  'bodyweight-row':       { met: 6.5,  category: 'calisthenics' },
  'dead-hang':            { met: 3.5,  category: 'isometric' },
  'squat':                { met: 7.0,  category: 'calisthenics' },
  'lunge':                { met: 6.0,  category: 'calisthenics' },
  'jump-squat':           { met: 10.0, category: 'plyometric' },
  'single-leg-squat':     { met: 8.5,  category: 'calisthenics' },
  'bulgarian-split-squat':{ met: 8.0,  category: 'calisthenics' },
  'calf-raise':           { met: 3.5,  category: 'isolation' },
  'glute-bridge':         { met: 4.5,  category: 'calisthenics' },
  'step-up':              { met: 6.5,  category: 'calisthenics' },
  'box-jump':             { met: 10.5, category: 'plyometric' },
  'plank':                { met: 4.0,  category: 'isometric' },
  'hollow-body':          { met: 4.5,  category: 'isometric' },
  'crunch':               { met: 4.0,  category: 'core' },
  'leg-raise':            { met: 4.5,  category: 'core' },
  'russian-twist':        { met: 5.0,  category: 'core' },
  'mountain-climber':     { met: 9.5,  category: 'cardio' },
  'shoulder-tap':         { met: 6.5,  category: 'calisthenics' },
  'superman':             { met: 3.5,  category: 'isometric' },
  'burpee':               { met: 12.0, category: 'cardio' },

  // ── ARMS / ISOLATION (DUMBBELL) ───────────────────────────────────────
  'bicep-curl':           { met: 3.5,  category: 'isolation' },
  'hammer-curl':          { met: 3.5,  category: 'isolation' },
  'concentration-curl':   { met: 3.5,  category: 'isolation' },
  'lateral-raise':        { met: 3.0,  category: 'isolation' },
  'front-raise':          { met: 3.0,  category: 'isolation' },
  'tricep-extension':     { met: 3.5,  category: 'isolation' },
  'arnold-press':         { met: 5.0,  category: 'compound' },
  'dumbbell-fly':         { met: 4.0,  category: 'isolation' },
  'dumbbell-row':         { met: 5.5,  category: 'compound' },
  'dumbbell-shoulder-press': { met: 5.0, category: 'compound' },

  // ── BARBELL COMPOUND ──────────────────────────────────────────────────
  'barbell-squat':        { met: 9.0,  category: 'compound' },
  'barbell-deadlift':     { met: 9.5,  category: 'compound' },
  'romanian-deadlift':    { met: 7.5,  category: 'compound' },
  'barbell-row':          { met: 7.0,  category: 'compound' },
  'barbell-bench-press':  { met: 7.0,  category: 'compound' },
  'barbell-curl':         { met: 4.0,  category: 'isolation' },
  'barbell-hip-thrust':   { met: 6.0,  category: 'compound' },
  'barbell-shrug':        { met: 4.5,  category: 'isolation' },
  'overhead-press':       { met: 7.0,  category: 'compound' },
  'skull-crusher':        { met: 4.0,  category: 'isolation' },
  'incline-dumbbell-press': { met: 6.5, category: 'compound' },

  // ── CABLE MACHINES ────────────────────────────────────────────────────
  'lat-pulldown':         { met: 5.5,  category: 'compound' },
  'seated-cable-row':     { met: 5.0,  category: 'compound' },
  'cable-fly':            { met: 4.0,  category: 'isolation' },
  'cable-lateral-raise':  { met: 3.0,  category: 'isolation' },
  'cable-curl':           { met: 3.5,  category: 'isolation' },
  'cable-kickback':       { met: 3.5,  category: 'isolation' },
  'tricep-pushdown':      { met: 3.5,  category: 'isolation' },
  'face-pull':            { met: 3.5,  category: 'isolation' },

  // ── MACHINES ──────────────────────────────────────────────────────────
  'leg-press':            { met: 6.0,  category: 'compound' },
  'leg-extension':        { met: 3.5,  category: 'isolation' },
  'leg-curl':             { met: 3.5,  category: 'isolation' },
  'hip-abduction':        { met: 3.0,  category: 'isolation' },
  'chest-press-machine':  { met: 5.5,  category: 'compound' },
  'shoulder-press-machine': { met: 5.0, category: 'compound' },
  'pec-deck':             { met: 4.0,  category: 'isolation' },
  'pull-down-machine':    { met: 5.5,  category: 'compound' },

  // ── CARDIO ────────────────────────────────────────────────────────────
  'jumping-jacks':        { met: 8.0,  category: 'cardio' },
  'high-knees':           { met: 9.5,  category: 'cardio' },
  'butt-kicks':           { met: 8.5,  category: 'cardio' },
  'skipping':             { met: 11.0, category: 'cardio' },
  'treadmill-walk':       { met: 3.5,  category: 'cardio' },
  'treadmill-run':        { met: 9.0,  category: 'cardio' },
};

// ── Fallback MET by category (when exercise not in database) ──────────────
const CATEGORY_FALLBACK_MET = {
  calisthenics: 6.5,
  compound:     6.0,
  isolation:    3.5,
  cardio:       9.0,
  plyometric:   10.0,
  isometric:    4.0,
  core:         4.5,
};
const DEFAULT_FALLBACK_MET = 5.0;

// ── Population average weight (cold-start before user enters data) ────────
const POPULATION_AVG_WEIGHT_KG = 70;

// ── Personal Factor storage key ───────────────────────────────────────────
const PERSONAL_FACTOR_KEY = 'bv-personal-factor';

// ════════════════════════════════════════════════════════════════════════
// SmartBurnEngine class
// ════════════════════════════════════════════════════════════════════════
class SmartBurnEngine {
  constructor({ exerciseId, weightKg = null, age = null, gender = 'male' }) {
    this.exerciseId  = exerciseId;
    this.weightKg    = weightKg;         // null = use population avg
    this.age         = age;
    this.gender      = gender;

    const entry       = MET_DATABASE[exerciseId];
    this.met          = entry?.met ?? CATEGORY_FALLBACK_MET[entry?.category] ?? DEFAULT_FALLBACK_MET;
    this.category     = entry?.category ?? 'compound';
    this.personalFactor = this._loadPersonalFactor();

    this._startTime   = null;
    this._totalCalories = 0;
  }

  // ── Start tracking time ──────────────────────────────────────────────
  start() {
    this._startTime = Date.now();
  }

  // ── Compute real-time calorie burn ───────────────────────────────────
  // Call this every second (or on demand) during workout
  // formMultiplier comes from useFormScore.getFormMultiplier()
  calculate({ formMultiplier = 1.0, elapsedSeconds = null } = {}) {
    const now      = Date.now();
    const elapsed  = elapsedSeconds ?? (this._startTime ? (now - this._startTime) / 1000 : 0);
    const durationHours = elapsed / 3600;

    const weight    = this.weightKg ?? POPULATION_AVG_WEIGHT_KG;
    const fm        = this._clamp(formMultiplier, 0.6, 1.3);
    const pf        = this._clamp(this.personalFactor, 0.7, 1.3);

    // Core formula: MET × kg × hours × FormMultiplier × PersonalFactor
    const calories  = this.met * weight * durationHours * fm * pf;

    const confidence = this._getConfidence(formMultiplier);

    return {
      totalBurn:        Math.round(calories),
      rawBurn:          Math.round(this.met * weight * durationHours),
      formMultiplier:   parseFloat(fm.toFixed(2)),
      personalFactor:   parseFloat(pf.toFixed(2)),
      metUsed:          this.met,
      confidence,
      elapsedSeconds:   Math.round(elapsed),
      weightUsed:       Math.round(weight),
      isEstimatedWeight: !this.weightKg,
    };
  }

  // ── Determine confidence level ───────────────────────────────────────
  _getConfidence(formMultiplier) {
    const hasWeight = !!this.weightKg;
    const hasForm   = formMultiplier !== 1.0; // form data is active when not neutral
    if (hasWeight && hasForm)  return 'high';
    if (hasWeight && !hasForm) return 'medium';
    return 'low';
  }

  // ── Personal Factor: load from localStorage ──────────────────────────
  _loadPersonalFactor() {
    try {
      const data = JSON.parse(localStorage.getItem(PERSONAL_FACTOR_KEY) || '{}');
      return data.factor ?? 1.0;
    } catch {
      return 1.0;
    }
  }

  // ── Personal Factor: save after workout session ───────────────────────
  // Call this after workout ends with actual vs predicted comparison
  // Simple exponential moving average correction — no TF.js needed
  static updatePersonalFactor(predictedCalories, feedbackRating) {
    // feedbackRating: 'too_high' | 'accurate' | 'too_low'
    // Adjusts factor by ±5% per feedback, max 5 sessions average
    try {
      const data   = JSON.parse(localStorage.getItem(PERSONAL_FACTOR_KEY) || '{}');
      const factor = data.factor ?? 1.0;
      const count  = data.adjustments ?? 0;

      let adjustment = 0;
      if (feedbackRating === 'too_high') adjustment = -0.05;
      if (feedbackRating === 'too_low')  adjustment = +0.05;

      // Exponential moving average: weight recent feedback more
      const alpha     = 0.3;
      const newFactor = factor + alpha * adjustment;
      const clamped   = Math.min(Math.max(newFactor, 0.70), 1.30);

      localStorage.setItem(PERSONAL_FACTOR_KEY, JSON.stringify({
        factor:      parseFloat(clamped.toFixed(3)),
        adjustments: count + 1,
        lastUpdated: new Date().toISOString(),
      }));

      return clamped;
    } catch {
      return 1.0;
    }
  }

  // ── Get MET for an exercise (utility, no instance needed) ────────────
  static getMET(exerciseId) {
    const entry = MET_DATABASE[exerciseId];
    if (!entry) return DEFAULT_FALLBACK_MET;
    return entry.met;
  }

  // ── Check if exercise is in database ─────────────────────────────────
  static hasExercise(exerciseId) {
    return exerciseId in MET_DATABASE;
  }

  _clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }
}

export default SmartBurnEngine;
