/**
 * useWorkoutLog — persistent workout session logger
 *
 * Storage keys:
 *   bv-wlog-sessions   → array of completed sessions (last 100)
 *   bv-wlog-prs        → { [exerciseId]: { weight, unit, reps, date } }
 *   bv-wlog-active     → current in-progress session (survives refresh)
 *
 * Each session:
 *   { id, exerciseId, exerciseName, date, sets: [{weight,unit,reps,rpe}], duration, notes }
 *
 * Progressive overload suggestion:
 *   Look at last 3 sessions for same exercise.
 *   If user completed all target reps in last session → suggest +2.5kg
 *   If user failed target reps → suggest same weight
 *   If 2 consecutive successful sessions → suggest +5% weight
 */

import { useState, useCallback } from 'react';

const SESSIONS_KEY = 'bv-wlog-sessions';
const PRS_KEY      = 'bv-wlog-prs';
const ACTIVE_KEY   = 'bv-wlog-active';

// ── Storage helpers ────────────────────────────────────────────────────────
function readSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
  catch { return []; }
}
function writeSessions(sessions) {
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(-100))); }
  catch {}
}
function readPRs() {
  try { return JSON.parse(localStorage.getItem(PRS_KEY) || '{}'); }
  catch { return {}; }
}
function writePRs(prs) {
  try { localStorage.setItem(PRS_KEY, JSON.stringify(prs)); }
  catch {}
}
function readActive() {
  try { return JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null'); }
  catch { return null; }
}
function writeActive(session) {
  try {
    if (session) localStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {}
}

// ── Progressive overload algorithm ────────────────────────────────────────
/**
 * Returns { suggestedWeight, unit, reason } for next session.
 * Based on last 3 sessions for the exercise.
 */
export function getProgressionSuggestion(exerciseId, targetReps) {
  const sessions = readSessions();
  const exerciseSessions = sessions
    .filter(s => s.exerciseId === exerciseId && s.sets?.length > 0)
    .slice(-3)
    .reverse(); // most recent first

  if (!exerciseSessions.length) return null;

  const last = exerciseSessions[0];
  if (!last.sets?.length) return null;

  const unit = last.sets[0]?.unit || 'kg';
  const increment = unit === 'lb' ? 5 : 2.5;

  // Best set in last session (max weight × reps)
  const bestSet = last.sets.reduce((best, s) =>
    (s.weight * s.reps > best.weight * best.reps ? s : best), last.sets[0]);

  const lastWeight = bestSet.weight;
  const lastReps   = bestSet.reps;

  // Did they hit target reps?
  const hitTarget = lastReps >= (targetReps || 8);

  // Check 2 consecutive successful sessions
  const twoSuccessful = exerciseSessions.length >= 2 &&
    exerciseSessions[0].sets.some(s => s.reps >= (targetReps || 8)) &&
    exerciseSessions[1].sets.some(s => s.reps >= (targetReps || 8));

  let suggestedWeight, reason;

  if (twoSuccessful) {
    suggestedWeight = Math.round((lastWeight * 1.05) / increment) * increment;
    reason = '2 strong sessions → +5%';
  } else if (hitTarget) {
    suggestedWeight = lastWeight + increment;
    reason = `Hit ${lastReps} reps → +${increment}${unit}`;
  } else {
    suggestedWeight = lastWeight;
    reason = 'Missed target reps → hold weight';
  }

  return { suggestedWeight, unit, reason, lastWeight, lastReps };
}

// ── PR check ────────────────────────────────────────────────────────────────
function checkAndUpdatePR(exerciseId, exerciseName, weight, unit, reps) {
  const prs = readPRs();
  const current = prs[exerciseId];
  const isNewPR = !current || weight > current.weight;
  if (isNewPR) {
    prs[exerciseId] = { weight, unit, reps, date: new Date().toISOString(), exerciseName };
    writePRs(prs);
  }
  return isNewPR;
}

// ── Public helpers ─────────────────────────────────────────────────────────
export function getAllPRs() {
  return readPRs();
}

export function getExerciseSessions(exerciseId, limit = 20) {
  return readSessions()
    .filter(s => s.exerciseId === exerciseId)
    .slice(-limit)
    .reverse(); // most recent first
}

export function getAllSessions(limit = 50) {
  return readSessions().slice(-limit).reverse();
}

export function getWeeklyVolume() {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const sessions = readSessions().filter(s => new Date(s.date).getTime() > oneWeekAgo);

  const MUSCLE_MAP = {
    chest:     ['chest', 'push', 'fly', 'bench', 'pec'],
    back:      ['pull', 'row', 'dead', 'lat', 'back'],
    legs:      ['squat', 'lunge', 'leg', 'glute', 'calf', 'hip', 'hamstring', 'quad'],
    shoulders: ['shoulder', 'press', 'delt', 'raise', 'arnold', 'shrug'],
    arms:      ['curl', 'tricep', 'bicep', 'dip', 'extension'],
    core:      ['plank', 'crunch', 'core', 'ab', 'oblique', 'situp'],
  };

  const volume = { chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0, core: 0 };
  sessions.forEach(s => {
    const name = (s.exerciseName || s.exerciseId || '').toLowerCase();
    for (const [muscle, keywords] of Object.entries(MUSCLE_MAP)) {
      if (keywords.some(k => name.includes(k))) {
        volume[muscle] += s.sets?.length || 3;
        break;
      }
    }
  });

  return volume;
}

export function getTotalStats() {
  const sessions = readSessions();
  const totalSets    = sessions.reduce((n, s) => n + (s.sets?.length || 0), 0);
  const totalReps    = sessions.reduce((n, s) => n + (s.sets?.reduce((a, set) => a + (set.reps || 0), 0) || 0), 0);
  const totalVolume  = sessions.reduce((n, s) => n + (s.sets?.reduce((a, set) => a + (set.weight || 0) * (set.reps || 0), 0) || 0), 0);
  const totalWorkouts = sessions.length;
  return { totalSets, totalReps, totalVolume: Math.round(totalVolume), totalWorkouts };
}

// ── Hook ───────────────────────────────────────────────────────────────────
export default function useWorkoutLog() {
  const [activeSession, setActiveSessionState] = useState(() => readActive());
  const [lastPR, setLastPR] = useState(null); // { weight, unit, exerciseName }

  const setActiveSession = useCallback((session) => {
    writeActive(session);
    setActiveSessionState(session);
  }, []);

  /** Start a new session for an exercise */
  const startSession = useCallback((exerciseId, exerciseName) => {
    const existing = readActive();
    if (existing?.exerciseId === exerciseId) {
      setActiveSessionState(existing);
      return existing;
    }
    const session = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      exerciseId,
      exerciseName,
      date: new Date().toISOString(),
      sets: [],
      startTime: Date.now(),
    };
    setActiveSession(session);
    return session;
  }, [setActiveSession]);

  /** Log a set to the active session */
  const logSet = useCallback((weight, unit, reps, rpe = null) => {
    const session = readActive();
    if (!session) return null;

    const setEntry = { weight: parseFloat(weight), unit, reps: parseInt(reps), rpe, time: new Date().toISOString() };
    const updated  = { ...session, sets: [...(session.sets || []), setEntry] };
    setActiveSession(updated);

    // Check PR
    const isNewPR = checkAndUpdatePR(session.exerciseId, session.exerciseName, parseFloat(weight), unit, parseInt(reps));
    if (isNewPR) {
      setLastPR({ weight: parseFloat(weight), unit, exerciseName: session.exerciseName });
    }

    return { setEntry, isNewPR, sessionSets: updated.sets };
  }, [setActiveSession]);

  /** Remove last logged set */
  const undoLastSet = useCallback(() => {
    const session = readActive();
    if (!session || !session.sets?.length) return;
    const updated = { ...session, sets: session.sets.slice(0, -1) };
    setActiveSession(updated);
  }, [setActiveSession]);

  /** Finish the session and persist */
  const finishSession = useCallback((notes = '') => {
    const session = readActive();
    if (!session) return null;

    const completed = {
      ...session,
      duration: Math.floor((Date.now() - session.startTime) / 1000),
      notes,
      endDate: new Date().toISOString(),
    };

    const sessions = readSessions();
    sessions.push(completed);
    writeSessions(sessions);
    writeActive(null);
    setActiveSessionState(null);

    return completed;
  }, []);

  /** Discard active session without saving */
  const discardSession = useCallback(() => {
    writeActive(null);
    setActiveSessionState(null);
  }, []);

  /** Clear PR celebration */
  const clearPR = useCallback(() => setLastPR(null), []);

  return {
    activeSession,
    lastPR,
    startSession,
    logSet,
    undoLastSet,
    finishSession,
    discardSession,
    clearPR,
  };
}
