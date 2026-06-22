// ── useFormScore — aggregates per-frame formScore into set-level metrics ──
import { useRef } from 'react';

export function useFormScore() {
  const samplesRef = useRef([]);
  const peakRef    = useRef(0);

  const addSample = (score) => {
    if (typeof score !== 'number' || score <= 0) return;
    const now = Date.now();
    samplesRef.current.push({ score, ts: now });
    if (score > peakRef.current) peakRef.current = score;
    const cutoff = now - 5 * 60 * 1000;
    samplesRef.current = samplesRef.current.filter(s => s.ts > cutoff);
  };

  const getAverage = () => {
    const s = samplesRef.current;
    if (s.length === 0) return 0;
    return s.reduce((acc, x) => acc + x.score, 0) / s.length;
  };

  const getPeak = () => peakRef.current;

  // score 0-100 → multiplier 0.60–1.30
  const getFormMultiplier = () => {
    const avg = getAverage();
    if (avg === 0) return 1.0;
    if (avg >= 95) return 1.30;
    if (avg >= 85) return 1.20;
    if (avg >= 75) return 1.10;
    if (avg >= 65) return 1.00;
    if (avg >= 55) return 0.90;
    if (avg >= 45) return 0.80;
    return 0.70;
  };

  const reset = () => {
    samplesRef.current = [];
    peakRef.current    = 0;
  };

  const getSnapshot = () => ({
    avg:            Math.round(getAverage()),
    peak:           Math.round(getPeak()),
    formMultiplier: getFormMultiplier(),
    sampleCount:    samplesRef.current.length,
  });

  return { addSample, getAverage, getPeak, getFormMultiplier, reset, getSnapshot };
}
