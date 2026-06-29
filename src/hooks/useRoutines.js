/**
 * useRoutines — persistent routine (program) management
 *
 * Storage key: bv-routines → array of Routine objects
 *
 * Routine shape:
 *   {
 *     id: string,
 *     name: string,
 *     emoji: string,
 *     exercises: [{ exerciseId, name, sets, reps, rest }],
 *     createdAt: ISO string,
 *     lastUsed: ISO string | null,
 *     timesUsed: number,
 *   }
 */

import { useState, useCallback } from 'react';

const KEY = 'bv-routines';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function write(routines) {
  try { localStorage.setItem(KEY, JSON.stringify(routines)); }
  catch {}
}

export function getAllRoutines() {
  return read();
}

export default function useRoutines() {
  const [routines, setRoutines] = useState(() => read());

  const refresh = useCallback(() => setRoutines(read()), []);

  /** Create a new routine */
  const createRoutine = useCallback((name, iconKey, exercises) => {
    const routine = {
      id:        `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name:      name.trim().slice(0, 40),
      iconKey:   iconKey || 'dumbbell',
      exercises: exercises.map(e => ({
        exerciseId: e.exerciseId,
        name:       e.name,
        sets:       Math.min(Math.max(Number(e.sets) || 3, 1), 20),
        reps:       Math.min(Math.max(Number(e.reps) || 12, 1), 100),
        rest:       Math.min(Math.max(Number(e.rest) || 60, 10), 300),
      })),
      createdAt: new Date().toISOString(),
      lastUsed:  null,
      timesUsed: 0,
    };
    const updated = [...read(), routine];
    write(updated);
    setRoutines(updated);
    return routine;
  }, []);

  /** Update an existing routine */
  const updateRoutine = useCallback((id, patch) => {
    const updated = read().map(r => r.id === id ? { ...r, ...patch } : r);
    write(updated);
    setRoutines(updated);
  }, []);

  /** Delete a routine */
  const deleteRoutine = useCallback((id) => {
    const updated = read().filter(r => r.id !== id);
    write(updated);
    setRoutines(updated);
  }, []);

  /** Mark routine as used (updates lastUsed + timesUsed) */
  const markUsed = useCallback((id) => {
    const updated = read().map(r =>
      r.id === id
        ? { ...r, lastUsed: new Date().toISOString(), timesUsed: (r.timesUsed || 0) + 1 }
        : r
    );
    write(updated);
    setRoutines(updated);
  }, []);

  /** Duplicate a routine */
  const duplicateRoutine = useCallback((id) => {
    const src = read().find(r => r.id === id);
    if (!src) return null;
    const copy = {
      ...src,
      id:        `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name:      `${src.name} (Copy)`.slice(0, 40),
      iconKey:   src.iconKey || src.emoji || 'dumbbell',
      createdAt: new Date().toISOString(),
      lastUsed:  null,
      timesUsed: 0,
    };
    const updated = [...read(), copy];
    write(updated);
    setRoutines(updated);
    return copy;
  }, []);

  return { routines, createRoutine, updateRoutine, deleteRoutine, markUsed, duplicateRoutine, refresh };
}
