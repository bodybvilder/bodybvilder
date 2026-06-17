import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePoseDetection } from '../hooks/useposedetection';
import SkeletonOverlay from '../components/skeletonoverlay';
import WorkoutTimer from '../components/workouttimer';
import ShareCard from '../components/sharecard';
import MuscleDiagram, { MuscleList } from '../components/musclediagram';
import ExerciseGif from '../components/exercisegif';
import { getExerciseById } from '../data/exercises';

// ── SVG ICONS (NO EMOJI) ─────────────────────────────────────────────────
const CameraIcon = ({ size = 48, color = 'var(--accent)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const ArrowLeftIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const InfoIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4M12 8h.01"/>
  </svg>
);

const PlayIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const MinusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CheckIcon = ({ size = 16, color = 'var(--accent)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function WorkoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const exerciseId = searchParams.get('exercise') || 'pushup';
  const exercise = getExerciseById(exerciseId) || getExerciseById('pushup');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [workoutStats, setWorkoutStats] = useState(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [showTips, setShowTips] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(0);

  // Custom sets & reps — user can override exercise defaults
  const [customSets, setCustomSets] = useState(null);
  const [customReps, setCustomReps] = useState(null);

  const targetSets = customSets ?? exercise?.targetSets ?? 3;
  const targetReps = customReps ?? exercise?.targetReps ?? 12;
  
  const { score, feedback, repCount, resetRepCount } = usePoseDetection(
    videoRef, 
    canvasRef, 
    cameraEnabled && isWorkoutActive
  );
  
  const controlsTimeoutRef = useRef(null);
  
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
  
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);
  
  const handleStart = () => {
    setWorkoutStartTime(Date.now());
    setCameraEnabled(true);
    setIsWorkoutActive(true);
    setShowControls(false);
    resetRepCount();
    handleTap();
  };
  
  const stopWorkout = useCallback(() => {
    const duration = Math.floor((Date.now() - workoutStartTime) / 1000);
    setWorkoutStats({
      exercise,
      score: Math.round(score),
      reps: repCount,
      duration: duration || 0
    });
    setIsWorkoutActive(false);
    setShowShareCard(true);
    
    // Save stats
    try {
      const saved = localStorage.getItem('bv-stats');
      const stats = saved ? JSON.parse(saved) : { 
        workoutsCompleted: 0, 
        streak: 0, 
        lastWorkout: null, 
        totalReps: 0,
        totalTime: 0,
        weeklyWorkouts: [0,0,0,0,0,0,0]
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
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
          stats.streak += 1;
        } else if (!lastDate || lastDate.toDateString() !== todayStr) {
          stats.streak = 1;
        }
        stats.lastWorkout = todayStr;
      }
      
      localStorage.setItem('bv-stats', JSON.stringify(stats));
      
      // Save history
      const hist = localStorage.getItem('bv-history');
      const history = hist ? JSON.parse(hist) : [];
      history.push({
        exerciseName: exercise?.name || 'Workout',
        score: Math.round(score),
        reps: repCount,
        duration: duration || 0,
        date: new Date().toISOString()
      });
      localStorage.setItem('bv-history', JSON.stringify(history.slice(-50)));
    } catch (err) {
      console.error('Save workout error:', err);
    }
  }, [workoutStartTime, score, repCount, exercise]);
  
  const nextSet = () => {
    if (currentSet < targetSets) {
      setCurrentSet(currentSet + 1);
      resetRepCount();
    } else {
      stopWorkout();
    }
  };
  
  return (
    <div style={{ 
      height: '100dvh',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Camera Feed */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0,
          background: 'var(--bg-secondary)'
        }}
        onClick={handleTap}
      >
        {cameraEnabled ? (
          <>
            <video
              ref={videoRef}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)'
              }}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: 'scaleX(-1)',
                pointerEvents: 'none'
              }}
            />
            <SkeletonOverlay score={score} feedback={feedback} />
            <WorkoutTimer isRunning={isWorkoutActive} />
            
            {/* Set Counter */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '10px 16px',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>Set </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                {currentSet}/{targetSets}
              </span>
            </div>
            
            {/* Rep Counter - Large */}
            <div style={{
              position: 'absolute',
              bottom: '120px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 10,
              pointerEvents: 'none'
            }}>
              <div style={{
                fontSize: '72px',
                fontWeight: 800,
                color: '#fff',
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                lineHeight: 1
              }}>
                {repCount}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginTop: '4px'
              }}>
                {exercise?.isTimed ? 'Seconds' : 'Reps'}
              </div>
            </div>
          </>
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
          }}>
            {/* Full bleed pre-start layout */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              background: 'var(--bg-0)',
            }}>
              {/* Top — back button */}
              <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    background: 'var(--bg-1)', border: '1px solid var(--border)',
                    borderRadius: '12px', padding: '10px',
                    cursor: 'pointer', color: 'var(--text-0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              </div>

              {/* Middle — exercise info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 24px 16px', textAlign: 'center' }}>
                {/* Camera icon */}
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '2px solid rgba(200,255,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>

                {/* Category badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', borderRadius: '99px',
                  background: 'var(--bg-1)', border: '1px solid var(--border)',
                  margin: '0 auto 12px', fontSize: '11px',
                  fontWeight: 700, color: 'var(--text-2)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {exercise?.category || 'exercise'}
                </div>

                <h2 style={{
                  fontSize: 'clamp(26px, 7vw, 36px)', fontWeight: 900,
                  color: 'var(--text-0)', letterSpacing: '-0.04em',
                  lineHeight: 1.05, marginBottom: '12px',
                }}>
                  {exercise?.name || 'Workout'}
                </h2>

                <p style={{
                  fontSize: '14px', color: 'var(--text-2)',
                  lineHeight: 1.6, maxWidth: '280px', margin: '0 auto 28px',
                }}>
                  {exercise?.description || 'Get in position and start when ready.'}
                </p>

              {/* GIF + Muscle Diagram row */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  {/* Exercise GIF */}
                  <ExerciseGif exerciseId={exerciseId} size={140} />

                  {/* Muscle Diagram */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                    <MuscleDiagram
                      muscles={exercise?.muscles || []}
                      exerciseId={exerciseId}
                      size={90}
                    />
                    <MuscleList muscles={exercise?.muscles || []} />
                  </div>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'flex', gap: '1px',
                  background: 'var(--border)',
                  borderRadius: '16px', overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}>
                  {[
                    { val: `${targetSets}×${exercise?.isTimed ? `${targetReps}s` : targetReps}`, label: 'Target' },
                    { val: exercise?.difficulty || 'beginner', label: 'Level' },
                    { val: exercise?.equipment === 'none' ? 'No gear' : exercise?.equipment || '—', label: 'Equipment' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      flex: 1, padding: '14px 8px', textAlign: 'center',
                      background: 'var(--bg-1)',
                    }}>
                      <div style={{
                        fontSize: '13px', fontWeight: 800,
                        color: i === 0 ? 'var(--accent)' : 'var(--text-0)',
                        letterSpacing: '-0.02em', marginBottom: '3px',
                      }}>
                        {s.val}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sets & Reps Picker */}
                <div style={{
                  marginTop: '20px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Sets &amp; Reps
                    </span>
                    <button
                      onClick={() => { setCustomSets(exercise?.targetSets ?? 3); setCustomReps(exercise?.targetReps ?? 12); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--accent)', fontWeight: 600, fontFamily: 'inherit' }}
                    >
                      Reset
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Sets */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Sets</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <button onClick={() => setCustomSets(Math.max(1, targetSets - 1))}
                          style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                        <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-0)', minWidth: '32px', textAlign: 'center', letterSpacing: '-0.04em' }}>{targetSets}</span>
                        <button onClick={() => setCustomSets(Math.min(20, targetSets + 1))}
                          style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', color: 'var(--text-3)', fontWeight: 300 }}>×</div>
                    {/* Reps */}
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        {exercise?.isTimed ? 'Seconds' : 'Reps'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <button onClick={() => setCustomReps(Math.max(1, targetReps - 1))}
                          style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                        <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--accent)', minWidth: '32px', textAlign: 'center', letterSpacing: '-0.04em' }}>{targetReps}</span>
                        <button onClick={() => setCustomReps(Math.min(200, targetReps + 1))}
                          style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-1)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Start button — inside pre-start, not in overlay */}
                <button
                  onClick={handleStart}
                  style={{
                    marginTop: '16px',
                    width: '100%', padding: '18px',
                    borderRadius: '16px', border: 'none',
                    background: 'var(--gradient-accent)',
                    color: '#000', fontSize: '17px', fontWeight: 800,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    letterSpacing: '-0.01em',
                    boxShadow: 'var(--accent-glow)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Start {targetSets}×{targetReps}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls Overlay — only render when camera is active */}
      {cameraEnabled && (showControls || !isWorkoutActive) && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          zIndex: 20
        }}>
          {/* Exercise Info Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#fff',
                backdropFilter: 'blur(10px)'
              }}
            >
              <ArrowLeftIcon size={20} />
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{exercise?.name || 'Workout'}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                Set {currentSet}/{targetSets}
              </div>
            </div>
            
            <button
              onClick={() => setShowTips(!showTips)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                cursor: 'pointer',
                color: '#fff',
                backdropFilter: 'blur(10px)'
              }}
            >
              <InfoIcon size={20} />
            </button>
          </div>
          
          {/* Tips Panel */}
          {showTips && exercise?.tips && (
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '13px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Form Tips
              </h4>
              {exercise.tips.map((tip, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '6px 0',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px'
                }}>
                  <CheckIcon size={16} color="var(--accent)" />
                  {tip}
                </div>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          {!cameraEnabled ? null : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  resetRepCount();
                  setCameraEnabled(false);
                  setIsWorkoutActive(false);
                  setCurrentSet(1);
                }}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                End
              </button>
              <button
                onClick={nextSet}
                style={{
                  flex: 2,
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'var(--bg-primary)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {currentSet < targetSets ? 'Next Set' : 'Finish Workout'}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Share Card */}
      {showShareCard && workoutStats && (
        <ShareCard
          exercise={workoutStats.exercise}
          score={workoutStats.score}
          reps={workoutStats.reps}
          duration={workoutStats.duration}
          onClose={() => {
            setShowShareCard(false);
            navigate('/');
          }}
        />
      )}
    </div>
  );
}
