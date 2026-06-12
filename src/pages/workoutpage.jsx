import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePoseDetection } from '../hooks/useposedetection';
import SkeletonOverlay from '../components/skeletonoverlay';
import WorkoutTimer from '../components/workouttimer';
import ShareCard from '../components/sharecard';
import { getExerciseById } from '../data/exercises';

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
      exerciseName: exercise.name,
      score: Math.round(score),
      reps: repCount,
      duration: duration || 0,
      date: new Date().toISOString()
    });
    localStorage.setItem('bv-history', JSON.stringify(history.slice(-50)));
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
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
              {exercise?.name || 'Workout'}
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.6 }}>
              {exercise?.description || 'Select an exercise to begin'}
            </p>
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>
                  {targetSets}x{exercise?.isTimed ? `${targetReps}s` : targetReps}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Target</div>
              </div>
              <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {exercise?.difficulty || 'beginner'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Level</div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls Overlay */}
      {(showControls || !isWorkoutActive) && (
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {tip}
                </div>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          {!cameraEnabled ? (
            <>
              {/* Customize Sets & Reps */}
              <div style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Sets & Reps
                  </span>
                  <button
                    onClick={() => {
                      setCustomSets(exercise?.targetSets ?? 3);
                      setCustomReps(exercise?.targetReps ?? 12);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--accent)', fontWeight: 600 }}
                  >
                    Reset default
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* Sets */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Sets</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <button
                        onClick={() => setCustomSets(Math.max(1, targetSets - 1))}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >−</button>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#fff', minWidth: '36px', textAlign: 'center' }}>{targetSets}</span>
                      <button
                        onClick={() => setCustomSets(Math.min(20, targetSets + 1))}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >+</button>
                    </div>
                  </div>

                  <div style={{ fontSize: '22px', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>×</div>

                  {/* Reps */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{exercise?.isTimed ? 'Secs' : 'Reps'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <button
                        onClick={() => setCustomReps(Math.max(1, targetReps - 1))}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >−</button>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent)', minWidth: '36px', textAlign: 'center' }}>{targetReps}</span>
                      <button
                        onClick={() => setCustomReps(Math.min(200, targetReps + 1))}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStart}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'var(--accent)',
                  color: 'var(--bg-primary)',
                  fontSize: '17px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Start {targetSets}×{targetReps} Workout
              </button>
            </>
          ) : (
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