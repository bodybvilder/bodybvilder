import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePoseDetection } from '../hooks/useposedetection';
import SkeletonOverlay from '../components/skeletonoverlay';
import WorkoutTimer from '../components/workouttimer';
import ShareCard from '../components/sharecard';
import MuscleDiagram, { MuscleList } from '../components/musclediagram';
import ExerciseGif from '../components/exercisegif';
import SmartRestTimer from '../components/resttimer';
import { usePro } from '../hooks/usepro';
import { getExerciseById } from '../data/exercises';

// ── Icons ──────────────────────────────────────────────────────────────────
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ── Strength Logger (set-by-set weight log) ────────────────────────────────
function StrengthLogger({ exerciseId, exerciseName, currentSet, targetSets, targetReps }) {
  const STORAGE_KEY = 'bv-strength-log';
  const [sets, setSets] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved[exerciseId]?.today || [];
    } catch { return []; }
  });
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('kg');
  const [open, setOpen] = useState(false);

  const logSet = () => {
    if (!weight) return;
    const entry = { set: currentSet, weight: parseFloat(weight), unit, reps: targetReps, date: new Date().toISOString() };
    const updated = [...sets, entry];
    setSets(updated);
    setWeight('');
    // Persist
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!all[exerciseId]) all[exerciseId] = {};
      all[exerciseId].today = updated;
      all[exerciseId].lastDate = new Date().toDateString();
      // Keep history for PR tracking
      if (!all[exerciseId].history) all[exerciseId].history = [];
      const maxWeight = Math.max(...updated.map(s => s.weight));
      const lastPR = all[exerciseId].history[0]?.maxWeight || 0;
      if (maxWeight > lastPR) {
        all[exerciseId].history.unshift({ date: new Date().toISOString(), maxWeight, unit });
        all[exerciseId].history = all[exerciseId].history.slice(0, 20);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {}
  };

  // Previous best
  const prevBest = (() => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const h = all[exerciseId]?.history;
      if (h?.length > 0) return `${h[0].maxWeight} ${h[0].unit}`;
    } catch {}
    return null;
  })();

  return (
    <div style={{ marginBottom: '8px' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '14px', border: `1px solid ${open ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.1)'}`, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.02em' }}>Log Weight</span>
          {sets.length > 0 && <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', padding: '1px 7px' }}>{sets.length} sets</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {prevBest && <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>PR: {prevBest}</span>}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </button>

      {open && (
        <div style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 14px', marginTop: '4px', animation: 'slideUp 0.2s both' }}>
          {/* Logged sets */}
          {sets.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {sets.map((s, i) => (
                <div key={i} style={{ background: 'rgba(200,255,0,0.12)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>
                  Set {s.set}: {s.weight}{s.unit} × {s.reps}
                </div>
              ))}
            </div>
          )}
          {/* Input row */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="number" inputMode="decimal" min="0" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="Weight" onKeyDown={e => e.key === 'Enter' && logSet()}
              style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '16px', fontWeight: 800, outline: 'none', fontFamily: 'inherit', textAlign: 'center' }} />
            {/* kg/lb toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '2px' }}>
              {['kg','lb'].map(u => (
                <button key={u} onClick={() => setUnit(u)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', background: unit === u ? 'var(--accent)' : 'transparent', color: unit === u ? '#000' : 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s ease' }}>
                  {u}
                </button>
              ))}
            </div>
            <button onClick={logSet} disabled={!weight}
              style={{ padding: '10px 14px', borderRadius: '10px', border: 'none', background: weight ? 'var(--accent)' : 'rgba(255,255,255,0.1)', color: weight ? '#000' : 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 800, cursor: weight ? 'pointer' : 'not-allowed', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}>
              + Log Set {currentSet}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Overlay modes ──────────────────────────────────────────────────────────
// 'clean'     → raw video only
// 'skeleton'  → video + skeleton bones
// 'hud'       → video + skeleton + score/rep HUD burned in
const OVERLAY_MODES = [
  { id: 'clean',    label: 'Clean',    icon: '▷' },
  { id: 'skeleton', label: 'Bones',    icon: '⬡' },
  { id: 'hud',      label: 'HUD',      icon: '◈' },
];

// ── Score color helper ─────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 88) return '#C8FF00';
  if (s >= 65) return '#FF9500';
  return '#FF3B3B';
}

// ── Toast notification ────────────────────────────────────────────────────
function Toast({ msg, visible }) {
  return (
    <div style={{
      position: 'absolute', bottom: '110px', left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : '12px'})`,
      opacity: visible ? 1 : 0,
      transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(16px)',
      borderRadius: '99px', padding: '10px 20px',
      color: '#fff', fontSize: '13px', fontWeight: 700,
      pointerEvents: 'none', zIndex: 50,
      border: '1px solid rgba(255,255,255,0.12)',
      whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  );
}

// ── Countdown overlay ─────────────────────────────────────────────────────
function CountdownOverlay({ count }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 40, pointerEvents: 'none',
    }}>
      <div key={count} style={{
        fontSize: '120px', fontWeight: 900,
        color: '#fff', lineHeight: 1,
        letterSpacing: '-0.06em',
        textShadow: '0 0 60px rgba(200,255,0,0.6), 0 4px 24px rgba(0,0,0,0.8)',
        animation: 'countPop 0.9s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        {count}
      </div>
    </div>
  );
}

// ── Recording progress ring (bottom center) ────────────────────────────────
function RecordRing({ isRecording, elapsed, maxSec = 60 }) {
  const R = 24, circ = 2 * Math.PI * R;
  const pct = Math.min(elapsed / maxSec, 1);
  const offset = circ * (1 - pct);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  if (!isRecording) return null;
  return (
    <div style={{
      position: 'absolute', bottom: '96px', left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      zIndex: 20, pointerEvents: 'none',
    }}>
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={R} fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.12)" strokeWidth="3"/>
        <circle cx="30" cy="30" r={R} fill="none" stroke="#FF3B3B"
          strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 30 30)"
          style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 6px #FF3B3B)' }}
        />
        <text x="30" y="35" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="inherit">
          {mins}:{secs}
        </text>
      </svg>
    </div>
  );
}

export default function WorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isPro } = usePro();
  const exerciseId = searchParams.get('exercise') || 'pushup';
  const exercise = getExerciseById(exerciseId) || getExerciseById('pushup');

  // ── Refs ─────────────────────────────────────────────────────────────
  const videoRef = useRef(null);
  const canvasRef = useRef(null);          // MediaPipe skeleton canvas
  const compositeRef = useRef(null);       // off-screen composite canvas for recording
  const compositeLoopRef = useRef(null);   // rAF loop id
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const controlsTimeoutRef = useRef(null);
  const recordElapsedRef = useRef(null);

  // ── Camera state ──────────────────────────────────────────────────────
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  // ── Workout state ─────────────────────────────────────────────────────
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [workoutStartTime, setWorkoutStartTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [showShareCard, setShowShareCard] = useState(false);
  const [workoutStats, setWorkoutStats] = useState(null);

  // ── UI state ──────────────────────────────────────────────────────────
  const [showControls, setShowControls] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [customSets, setCustomSets] = useState(null);
  const [customReps, setCustomReps] = useState(null);

  // ── Camera capture state ──────────────────────────────────────────────
  const [overlayMode, setOverlayMode] = useState('hud');   // clean | skeleton | hud
  const [isRecording, setIsRecording] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const [captureFlash, setCaptureFlash] = useState(false);
  const [countdownVal, setCountdownVal] = useState(null);  // null | 3 | 2 | 1
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const targetSets = customSets ?? exercise?.targetSets ?? 3;
  const targetReps = customReps ?? exercise?.targetReps ?? 12;

  const { score, feedback, repCount, resetRepCount } = usePoseDetection(
    videoRef, canvasRef, cameraEnabled && isWorkoutActive, facingMode
  );

  // ── Toast helper ──────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  // ── Controls auto-hide ────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isWorkoutActive) setShowControls(false);
    }, 3000);
  }, [isWorkoutActive]);

  useEffect(() => {
    window.currentExerciseId = exerciseId;
    return () => { window.currentExerciseId = null; };
  }, [exerciseId]);

  useEffect(() => () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
  }, []);

  // ── Start workout ─────────────────────────────────────────────────────
  const handleStart = () => {
    setWorkoutStartTime(Date.now());
    setCameraEnabled(true);
    setIsWorkoutActive(true);
    setShowControls(false);
    resetRepCount();
    handleTap();
  };

  // ── Stop / save workout ───────────────────────────────────────────────
  const stopWorkout = useCallback(() => {
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    setWorkoutStats({ exercise, score: Math.round(score), reps: repCount, duration: duration || 0 });
    setIsWorkoutActive(false);
    setShowShareCard(true);
    try {
      const saved = localStorage.getItem('bv-stats');
      const stats = saved ? JSON.parse(saved) : {
        workoutsCompleted: 0, streak: 0, lastWorkout: null,
        totalReps: 0, totalTime: 0, weeklyWorkouts: [0,0,0,0,0,0,0]
      };
      stats.workoutsCompleted += 1;
      stats.totalReps += repCount;
      stats.totalTime += (duration || 0);
      const today = new Date();
      const dayIndex = today.getDay();
      stats.weeklyWorkouts[dayIndex] = (stats.weeklyWorkouts[dayIndex] || 0) + 1;
      const todayStr = today.toDateString();
      if (stats.lastWorkout !== todayStr) {
        const lastDate = stats.lastWorkout ? new Date(stats.lastWorkout) : null;
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate && lastDate.toDateString() === yesterday.toDateString()) stats.streak += 1;
        else if (!lastDate || lastDate.toDateString() !== todayStr) stats.streak = 1;
        stats.lastWorkout = todayStr;
      }
      localStorage.setItem('bv-stats', JSON.stringify(stats));
      const hist = localStorage.getItem('bv-history');
      const history = hist ? JSON.parse(hist) : [];
      history.push({ exerciseName: exercise?.name || 'Workout', score: Math.round(score), reps: repCount, duration: duration || 0, date: new Date().toISOString() });
      localStorage.setItem('bv-history', JSON.stringify(history.slice(-50)));
    } catch (err) { console.error('Save workout error:', err); }
  }, [workoutStartTime, score, repCount, exercise]);

  // ── Next set / rest ───────────────────────────────────────────────────
  const nextSet = () => {
    if (currentSet < targetSets) {
      if (isPro) {
        const diff = exercise?.difficulty || 'beginner';
        setRestDuration(diff === 'advanced' ? 90 : diff === 'intermediate' ? 75 : 60);
        setShowRestTimer(true);
        setIsWorkoutActive(false);
      } else {
        setCurrentSet(prev => prev + 1);
        resetRepCount();
      }
    } else {
      stopWorkout();
    }
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    setCurrentSet(prev => prev + 1);
    resetRepCount();
    setIsWorkoutActive(true);
  };

  // ── Camera flip ───────────────────────────────────────────────────────
  const handleFlipCamera = useCallback(() => {
    if (isRecording) return; // safety: don't flip mid-record
    setCameraEnabled(false);
    setTimeout(() => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
      setCameraEnabled(true);
    }, 200);
  }, [isRecording]);

  // ── Build composite canvas frame ──────────────────────────────────────
  // Returns a fully drawn canvas (video + optional skeleton + optional HUD)
  const buildCompositeFrame = useCallback((targetCanvas) => {
    const video = videoRef.current;
    const skelCanvas = canvasRef.current;
    if (!video || !video.videoWidth) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (targetCanvas.width !== w) targetCanvas.width = w;
    if (targetCanvas.height !== h) targetCanvas.height = h;

    const ctx = targetCanvas.getContext('2d');
    ctx.save();

    // Mirror for front cam
    if (facingMode === 'user') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    // Skeleton overlay (skeleton or hud mode)
    if ((overlayMode === 'skeleton' || overlayMode === 'hud') && skelCanvas) {
      ctx.save();
      if (facingMode === 'user') {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(skelCanvas, 0, 0, w, h);
      ctx.restore();
    }

    // HUD: score + rep counter + watermark burned in
    if (overlayMode === 'hud') {
      const col = scoreColor(score);
      // Score pill (top-left)
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      roundRect(ctx, 16, 16, 80, 54, 12);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '700 10px system-ui';
      ctx.fillText('FORM', 28, 34);
      ctx.fillStyle = col;
      ctx.font = '900 28px system-ui';
      ctx.fillText(String(score), 24, 62);

      // Rep counter (bottom center)
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      roundRect(ctx, w / 2 - 44, h - 82, 88, 56, 14);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '900 36px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(String(repCount), w / 2, h - 46);
      ctx.font = '700 10px system-ui';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText(exercise?.isTimed ? 'SECONDS' : 'REPS', w / 2, h - 34);
      ctx.textAlign = 'left';

      // Watermark
      ctx.fillStyle = 'rgba(200,255,0,0.75)';
      ctx.font = '800 11px system-ui';
      ctx.fillText('BODYBVILDER', w - 112, h - 12);
    }
  }, [facingMode, overlayMode, score, repCount, exercise]);

  // Helper: roundRect polyfill
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ── Screenshot ────────────────────────────────────────────────────────
  const handleScreenshot = useCallback(() => {
    const snap = document.createElement('canvas');
    buildCompositeFrame(snap);

    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 280);

    snap.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `bodybvilder-${exerciseId}.jpg`, { type: 'image/jpeg' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        navigator.share({ title: 'BODYBVILDER', text: `${exercise?.name} · Score ${score}`, files: [file] }).catch(() => {});
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
      }
      showToast('📸 Photo saved!');
    }, 'image/jpeg', 0.93);
  }, [buildCompositeFrame, exerciseId, exercise, score, showToast]);

  // ── Countdown then record ─────────────────────────────────────────────
  const handleCountdownRecord = useCallback((delaySeconds) => {
    let n = delaySeconds;
    setCountdownVal(n);
    const tick = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(tick);
        setCountdownVal(null);
        startRecording();
      } else {
        setCountdownVal(n);
      }
    }, 1000);
  }, []); // eslint-disable-line

  // ── Start recording (from composite canvas) ───────────────────────────
  const startRecording = useCallback(() => {
    const comp = document.createElement('canvas');
    compositeRef.current = comp;
    recordedChunksRef.current = [];

    // Drive composite at ~30fps via rAF loop
    const loop = () => {
      buildCompositeFrame(comp);
      compositeLoopRef.current = requestAnimationFrame(loop);
    };
    compositeLoopRef.current = requestAnimationFrame(loop);

    const stream = comp.captureStream(30);
    const mimeTypes = [
      'video/webm;codecs=vp9', 'video/webm;codecs=vp8',
      'video/webm', 'video/mp4',
    ];
    const mime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
    let recorder;
    try { recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {}); }
    catch { recorder = new MediaRecorder(stream); }

    recorder.ondataavailable = e => { if (e.data?.size > 0) recordedChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      cancelAnimationFrame(compositeLoopRef.current);
      const ext = mime.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunksRef.current, { type: mime || 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bodybvilder-${exerciseId}-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('🎬 Video saved!');
    };
    recorder.start(500);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordElapsed(0);
    recordElapsedRef.current = setInterval(() => {
      setRecordElapsed(s => s + 1);
    }, 1000);
  }, [buildCompositeFrame, exerciseId, showToast]);

  // ── Stop recording ────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    clearInterval(recordElapsedRef.current);
    setIsRecording(false);
    setRecordElapsed(0);
  }, []);

  // ── Toggle record ─────────────────────────────────────────────────────
  const handleToggleRecord = useCallback(() => {
    if (isRecording) { stopRecording(); }
    else { handleCountdownRecord(3); }
  }, [isRecording, stopRecording, handleCountdownRecord]);

  // ── PRE-START SCREEN ──────────────────────────────────────────────────
  if (!cameraEnabled) {
    return (
      <div style={{ height: '100dvh', background: 'var(--bg-0)', overflowY: 'auto' }}>
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
          @keyframes countPop { from { opacity:0; transform:scale(0.4); } to { opacity:1; transform:scale(1); } }
          @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        `}</style>

        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--text-0)', display: 'flex' }}>
            <ArrowLeftIcon />
          </button>
        </div>

        <div style={{ padding: '20px 20px calc(40px + env(safe-area-inset-bottom))', textAlign: 'center' }}>
          {/* Camera icon badge */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid rgba(200,255,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'fadeUp 0.4s both' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
            </svg>
          </div>

          {/* Category */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '99px', background: 'var(--bg-1)', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px', animation: 'fadeUp 0.4s 0.04s both' }}>
            {exercise?.category || 'exercise'}
          </div>

          <h2 style={{ fontSize: 'clamp(26px,7vw,36px)', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: '12px', animation: 'fadeUp 0.4s 0.07s both' }}>
            {exercise?.name || 'Workout'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto 24px', animation: 'fadeUp 0.4s 0.1s both' }}>
            {exercise?.description || 'Get in position and start when ready.'}
          </p>

          {/* GIF + Muscle row */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', animation: 'fadeUp 0.4s 0.12s both' }}>
            <ExerciseGif exerciseId={exerciseId} size={140} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              <MuscleDiagram muscles={exercise?.muscles || []} exerciseId={exerciseId} size={90} />
              <MuscleList muscles={exercise?.muscles || []} />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1px', background: 'var(--border)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '20px', animation: 'fadeUp 0.4s 0.14s both' }}>
            {[
              { val: `${targetSets}×${exercise?.isTimed ? `${targetReps}s` : targetReps}`, label: 'Target' },
              { val: exercise?.difficulty || 'beginner', label: 'Level' },
              { val: exercise?.equipment === 'none' ? 'No gear' : exercise?.equipment || '—', label: 'Equipment' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '14px 8px', textAlign: 'center', background: 'var(--bg-1)' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: i === 0 ? 'var(--accent)' : 'var(--text-0)', marginBottom: '3px' }}>{s.val}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Sets & Reps picker */}
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '16px', animation: 'fadeUp 0.4s 0.16s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sets &amp; Reps</span>
              <button onClick={() => { setCustomSets(exercise?.targetSets ?? 3); setCustomReps(exercise?.targetReps ?? 12); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--accent)', fontWeight: 600, fontFamily: 'inherit' }}>Reset</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {[
                { label: 'Sets', val: targetSets, min: 1, max: 20, set: v => setCustomSets(v) },
                { label: exercise?.isTimed ? 'Seconds' : 'Reps', val: targetReps, min: 1, max: 200, set: v => setCustomReps(v), accent: true },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {i === 1 && <div style={{ fontSize: '20px', color: 'var(--text-3)', fontWeight: 300 }}>×</div>}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>{item.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <button onClick={() => item.set(Math.max(item.min, item.val - 1))}
                        style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                      <span style={{ fontSize: '26px', fontWeight: 900, color: item.accent ? 'var(--accent)' : 'var(--text-0)', minWidth: '32px', textAlign: 'center', letterSpacing: '-0.04em' }}>{item.val}</span>
                      <button onClick={() => item.set(Math.min(item.max, item.val + 1))}
                        style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button onClick={handleStart}
            style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: 'var(--gradient-accent)', color: '#000', fontSize: '17px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '-0.01em', boxShadow: 'var(--accent-glow)', animation: 'fadeUp 0.4s 0.18s both' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Start {targetSets}×{targetReps}
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE CAMERA SCREEN ──────────────────────────────────────────────
  return (
    <div style={{ height: '100dvh', background: '#000', position: 'relative', overflow: 'hidden' }} onClick={handleTap}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes countPop { 0%{opacity:0;transform:scale(0.3)} 60%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
      `}</style>

      {/* ── Video feed ── */}
      <video ref={videoRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        playsInline muted />

      {/* ── Skeleton canvas ── */}
      <canvas ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none', pointerEvents: 'none',
          opacity: overlayMode === 'clean' ? 0 : 1, transition: 'opacity 0.2s ease' }} />

      {/* ── Score + feedback overlay (visible in skeleton/hud modes) ── */}
      {overlayMode !== 'clean' && isWorkoutActive && (
        <SkeletonOverlay score={score} feedback={feedback} />
      )}

      {/* ── Workout timer ── */}
      <WorkoutTimer isRunning={isWorkoutActive} />

      {/* ── Capture flash ── */}
      {captureFlash && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 45, pointerEvents: 'none', animation: 'fadeIn 0.05s' }} />
      )}

      {/* ── Countdown overlay ── */}
      {countdownVal !== null && <CountdownOverlay count={countdownVal} />}

      {/* ── Recording progress ring ── */}
      <RecordRing isRecording={isRecording} elapsed={recordElapsed} />

      {/* ── Toast ── */}
      <Toast msg={toastMsg} visible={toastVisible} />

      {/* ── REC badge ── */}
      {isRecording && (
        <div style={{ position: 'absolute', top: 'calc(20px + env(safe-area-inset-top))', left: '16px', display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,40,40,0.88)', backdropFilter: 'blur(8px)', borderRadius: '99px', padding: '5px 10px', zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', animation: 'pulseDot 1s ease-in-out infinite' }} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>REC</span>
        </div>
      )}

      {/* ── Rep counter (large, bottom-center) ── */}
      {isWorkoutActive && (
        <div style={{ position: 'absolute', bottom: '130px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ fontSize: '80px', fontWeight: 900, color: '#fff', textShadow: '0 2px 24px rgba(0,0,0,0.6)', lineHeight: 1, letterSpacing: '-0.05em' }}>{repCount}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '2px' }}>{exercise?.isTimed ? 'Seconds' : 'Reps'}</div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          RIGHT SIDEBAR — TikTok/IG style vertical controls
      ════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '10px', zIndex: 20,
        opacity: showControls || !isWorkoutActive ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: showControls || !isWorkoutActive ? 'auto' : 'none',
      }}>

        {/* Set counter pill */}
        <div style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '14px', padding: '8px 10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', minWidth: '48px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1px' }}>Set</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{currentSet}<span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>/{targetSets}</span></div>
        </div>

        {/* Flip camera */}
        <SidebarBtn onClick={handleFlipCamera} disabled={isRecording} title="Flip">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
        </SidebarBtn>

        {/* Overlay mode toggle */}
        <div style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          {OVERLAY_MODES.map(m => (
            <button key={m.id} onClick={e => { e.stopPropagation(); setOverlayMode(m.id); }}
              title={m.label}
              style={{ display: 'block', width: '44px', padding: '9px 0', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em', background: overlayMode === m.id ? 'var(--accent)' : 'transparent', color: overlayMode === m.id ? '#000' : 'rgba(255,255,255,0.7)', transition: 'all 0.15s ease', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Screenshot */}
        <SidebarBtn onClick={e => { e.stopPropagation(); handleScreenshot(); }} title="Photo">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
          </svg>
        </SidebarBtn>

        {/* Record toggle */}
        <SidebarBtn
          onClick={e => { e.stopPropagation(); handleToggleRecord(); }}
          active={isRecording}
          activeColor="#FF3B3B"
          title={isRecording ? 'Stop' : 'Record'}>
          {isRecording
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
            : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          }
        </SidebarBtn>

        {/* Tips toggle */}
        {exercise?.tips && (
          <SidebarBtn onClick={e => { e.stopPropagation(); setShowTips(v => !v); }} active={showTips} title="Tips">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
          </SidebarBtn>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          BOTTOM CONTROLS BAR
      ════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        zIndex: 20,
        opacity: showControls || !isWorkoutActive ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: showControls || !isWorkoutActive ? 'auto' : 'none',
      }}>

        {/* Tips panel */}
        {showTips && exercise?.tips && (
          <div style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '16px', padding: '14px 16px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.08)', animation: 'slideUp 0.25s both' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Form Tips</p>
            {exercise.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '4px 0', color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: 1.4 }}>
                <CheckIcon size={14} />
                {tip}
              </div>
            ))}
          </div>
        )}

        {/* Exercise name bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
            <ArrowLeftIcon />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{exercise?.name || 'Workout'}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '1px' }}>Set {currentSet} of {targetSets}</div>
          </div>
          {/* Score mini pill */}
          <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '6px 12px', border: `1px solid ${scoreColor(score)}40` }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1px' }}>Form</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: scoreColor(score), lineHeight: 1, letterSpacing: '-0.04em' }}>{score}</div>
          </div>
        </div>

        {/* Strength logger */}
        {isWorkoutActive && (
          <StrengthLogger
            exerciseId={exerciseId}
            exerciseName={exercise?.name}
            currentSet={currentSet}
            targetSets={targetSets}
            targetReps={targetReps}
          />
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { resetRepCount(); setCameraEnabled(false); setIsWorkoutActive(false); setCurrentSet(1); if (isRecording) stopRecording(); }}
            style={{ flex: 1, padding: '15px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)', fontFamily: 'inherit' }}>
            End
          </button>
          <button onClick={nextSet}
            style={{ flex: 2, padding: '15px', borderRadius: '16px', border: 'none', background: 'var(--accent)', color: '#000', fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em' }}>
            {currentSet < targetSets ? `Next Set →` : 'Finish Workout'}
          </button>
        </div>
      </div>

      {/* ── Rest timer ── */}
      {showRestTimer && (
        <SmartRestTimer isActive={showRestTimer} duration={restDuration} onComplete={handleRestComplete} onSkip={handleRestComplete} />
      )}

      {/* ── Share card ── */}
      {showShareCard && workoutStats && (
        <ShareCard exercise={workoutStats.exercise} score={workoutStats.score} reps={workoutStats.reps} duration={workoutStats.duration}
          onClose={() => { setShowShareCard(false); navigate('/'); }} />
      )}

      {/* ── Post-workout protein reminder ── */}
      {showShareCard && workoutStats && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(135deg, rgba(200,255,0,0.12), rgba(0,200,100,0.08))',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(200,255,0,0.25)',
          padding: '14px 20px calc(14px + env(safe-area-inset-bottom))',
          zIndex: 200,
          display: 'flex', alignItems: 'center', gap: '12px',
          animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
          animationDelay: '0.6s',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(200,255,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 010 8h-1"/>
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.01em' }}>
              Protein window open — 2h left
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>
              0.4g/kg triggers max muscle protein synthesis
            </div>
          </div>
          <button
            onClick={() => navigate('/meal')}
            style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: 'var(--accent)', color: '#000', fontSize: '12px', fontWeight: 800, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>
            Meal Plan
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sidebar button component ───────────────────────────────────────────────
function SidebarBtn({ onClick, children, disabled, active, activeColor = 'rgba(200,255,0,0.9)', title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: '44px', height: '44px',
        borderRadius: '50%',
        border: `1.5px solid ${active ? activeColor : 'rgba(255,255,255,0.14)'}`,
        background: active ? activeColor : 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: active ? (activeColor === 'rgba(200,255,0,0.9)' ? '#000' : '#fff') : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
