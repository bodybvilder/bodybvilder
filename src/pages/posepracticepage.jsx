import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePoseDetection } from '../hooks/useposedetection';
import { getExerciseById } from '../data/exercises';
import { POSE_REFS } from '../components/posereference';

// Score color
function scoreColor(s) {
  if (s >= 88) return 'var(--accent)';
  if (s >= 70) return 'var(--orange)';
  return 'var(--red)';
}

// Score label
function scoreLabel(s) {
  if (s >= 90) return 'STAGE READY';
  if (s >= 80) return 'LOOKING GOOD';
  if (s >= 65) return 'GETTING THERE';
  if (s >= 50) return 'KEEP TRYING';
  return 'GET IN POSE';
}

export default function PosePracticePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const poseId = searchParams.get('exercise') || 'pose-front-double-biceps';
  const autoStart = searchParams.get('autostart') === '1';
  const pose = getExerciseById(poseId);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`bv-pose-${poseId}`) || '0'); }
    catch { return 0; }
  });
  const [holdProgress, setHoldProgress] = useState(0); // 0–100
  const [holdCount, setHoldCount] = useState(0);       // successful holds
  const [showRef, setShowRef] = useState(true);        // toggle reference overlay
  const [feedback, setFeedback] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | inpose | holding | perfect

  const holdStartRef = useRef(null);
  const HOLD_REQUIRED_MS = 2500; // hold for 2.5s to count

  // cameraEnabled is separate from started — camera must only be enabled
  // after the video element is in the DOM (i.e. after started=true renders)
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const { isReady, score, feedback: aiFeedback, resetRepCount } = usePoseDetection(
    videoRef,
    canvasRef,
    cameraEnabled,
    'user',
    poseId
  );

  // Auto-start after mount when navigated with ?autostart=1
  const autoStartFiredRef = useRef(false);
  useEffect(() => {
    if (autoStart && !autoStartFiredRef.current) {
      autoStartFiredRef.current = true;
      requestAnimationFrame(() => {
        // Frame 1: flip UI to active so video element mounts in DOM
        setStarted(true);
        setPhase('idle');
        setHoldCount(0);

        requestAnimationFrame(() => {
          // Frame 2: video in DOM, safe to enable camera
          setCameraEnabled(true);
          resetRepCount();
        });
      });
    }
  }, []); // eslint-disable-line

  // Update score + hold logic
  useEffect(() => {
    if (!started) return;
    setCurrentScore(score);
    setFeedback(aiFeedback);

    if (score >= 70) {
      if (!holdStartRef.current) {
        holdStartRef.current = Date.now();
        setPhase('inpose');
      }
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min((elapsed / HOLD_REQUIRED_MS) * 100, 100);
      setHoldProgress(progress);

      if (elapsed >= HOLD_REQUIRED_MS) {
        // Successful hold!
        setPhase('perfect');
        setHoldCount(prev => prev + 1);
        holdStartRef.current = null;
        setHoldProgress(0);

        // Save best score
        if (score > bestScore) {
          setBestScore(score);
          localStorage.setItem(`bv-pose-${poseId}`, JSON.stringify(score));
        }

        // Reset after flash
        setTimeout(() => setPhase('inpose'), 1200);
      }
    } else {
      holdStartRef.current = null;
      setHoldProgress(0);
      setPhase('idle');
    }
  }, [score, aiFeedback, started, bestScore, poseId]);

  const handleStart = useCallback(() => {
    resetRepCount();
    setHoldCount(0);
    setBestScore(JSON.parse(localStorage.getItem(`bv-pose-${poseId}`) || '0'));
    setStarted(true);
    setPhase('idle');
    // Enable camera on next frame so video element is in DOM first
    requestAnimationFrame(() => {
      setCameraEnabled(true);
    });
  }, [resetRepCount, poseId]);

  const PoseRef = POSE_REFS[poseId];

  return (
    <div style={{
      height: '100dvh',
      background: '#000',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Camera ── */}
      <video
        ref={videoRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',   /* mirror for selfie view */
          opacity: started ? 1 : 0,
        }}
        playsInline muted
      />
      {/* Canvas stays unflipped — landmarks are mirrored in the hook */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          opacity: started ? 1 : 0,
        }}
      />

      {/* ── POSE REFERENCE OVERLAY ── */}
      {started && showRef && PoseRef && (
        <div style={{
          position: 'absolute',
          bottom: '180px',
          right: '16px',
          opacity: 0.65,
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
          zIndex: 10,
        }}>
          <PoseRef />
          <div style={{
            textAlign: 'center',
            fontSize: '9px',
            color: 'rgba(200,255,0,0.8)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}>
            REFERENCE
          </div>
        </div>
      )}

      {/* ── PERFECT FLASH ── */}
      {phase === 'perfect' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(200,255,0,0.12)',
          zIndex: 15,
          pointerEvents: 'none',
          animation: 'fadeIn 0.1s ease both',
        }} />
      )}

      {/* ── PRE-START SCREEN ── */}
      {!started && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--bg-0)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          opacity: autoStart ? 0 : 1,
          pointerEvents: autoStart ? 'none' : 'auto',
        }}>
          {/* Back */}
          <div style={{ padding: '20px 20px 0' }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px', cursor: 'pointer', color: 'var(--text-0)', display: 'flex' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 20px calc(40px + env(safe-area-inset-bottom))', textAlign: 'center' }}>
            {/* Pose reference preview */}
            {PoseRef && (
              <div style={{ marginBottom: '24px', opacity: 0.9 }}>
                <PoseRef />
              </div>
            )}

            {/* Division badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 14px', borderRadius: '99px',
              background: 'var(--bg-1)', border: '1px solid var(--border)',
              marginBottom: '12px',
              fontSize: '11px', fontWeight: 700, color: 'var(--accent)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--accent)">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {pose?.division === 'mens-physique' ? "Men's Physique" : 'Classic — IFBB Standard'}
            </div>

            <h1 style={{
              fontSize: 'clamp(24px, 6vw, 32px)', fontWeight: 900,
              color: 'var(--text-0)', letterSpacing: '-0.04em',
              lineHeight: 1.05, marginBottom: '10px',
            }}>
              {pose?.name || 'Pose Practice'}
            </h1>

            <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, maxWidth: '260px', marginBottom: '24px' }}>
              {pose?.description}
            </p>

            {/* How it works */}
            <div style={{
              background: 'var(--bg-1)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '16px', marginBottom: '24px',
              width: '100%', maxWidth: '320px', textAlign: 'left',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
                How it works
              </div>
              {[
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
                  text: 'Reference pose shown on screen',
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                  text: 'AI scores your pose in real-time',
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  text: 'Hold 70+ score for 2.5s to count',
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>,
                  text: 'Best score saved per pose',
                },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < 3 ? '8px' : 0 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-dim)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Tips */}
            {pose?.tips && (
              <div style={{ width: '100%', maxWidth: '320px', marginBottom: '24px', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {pose.judgesCriteria ? `Judges look for: ${pose.judgesCriteria}` : 'Form tips'}
                </div>
                {pose.tips.slice(0, 4).map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-dim)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-1)', lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleStart}
              style={{
                width: '100%', maxWidth: '320px',
                padding: '18px', borderRadius: '16px', border: 'none',
                background: 'var(--gradient-accent)', color: '#000',
                fontSize: '17px', fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                letterSpacing: '-0.01em',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Start Practice
            </button>
          </div>
        </div>
      )}

      {/* ── ACTIVE PRACTICE HUD ── */}
      {started && (
        <>
          {/* Top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            padding: '16px 16px 8px',
            background: 'linear-gradient(rgba(0,0,0,0.7), transparent)',
            zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex', backdropFilter: 'blur(10px)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                {pose?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                Best: <span style={{ color: scoreColor(bestScore) }}>{bestScore}</span>
              </div>
            </div>

            {/* Toggle reference */}
            <button
              onClick={() => setShowRef(v => !v)}
              style={{
                background: showRef ? 'rgba(200,255,0,0.2)' : 'rgba(255,255,255,0.12)',
                border: `1px solid ${showRef ? 'rgba(200,255,0,0.4)' : 'transparent'}`,
                borderRadius: '10px', padding: '8px 10px',
                cursor: 'pointer', backdropFilter: 'blur(10px)',
                fontSize: '10px', fontWeight: 700, color: showRef ? 'var(--accent)' : 'rgba(255,255,255,0.6)',
                fontFamily: 'inherit', letterSpacing: '0.04em',
              }}
            >
              GUIDE
            </button>
          </div>

          {/* Center — big score */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10,
          }}>
            <div style={{
              fontSize: '96px', fontWeight: 900,
              color: scoreColor(currentScore),
              lineHeight: 1,
              textShadow: `0 0 40px ${scoreColor(currentScore)}60`,
              transition: 'color 0.2s ease',
              letterSpacing: '-0.04em',
            }}>
              {currentScore}
            </div>
            <div style={{
              fontSize: '12px', fontWeight: 800,
              color: scoreColor(currentScore),
              letterSpacing: '0.12em', textTransform: 'uppercase',
              opacity: 0.9,
            }}>
              {scoreLabel(currentScore)}
            </div>
          </div>

          {/* Hold progress bar */}
          <div style={{
            position: 'absolute',
            bottom: '160px', left: '20px', right: '20px',
            zIndex: 20, pointerEvents: 'none',
          }}>
            {/* Feedback text */}
            <div style={{
              textAlign: 'center', marginBottom: '12px',
              fontSize: '14px', fontWeight: 700,
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              minHeight: '20px',
            }}>
              {feedback}
            </div>

            {/* Hold bar */}
            <div style={{
              height: '6px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '99px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${holdProgress}%`,
                background: holdProgress >= 90 ? 'var(--accent)' : holdProgress > 40 ? 'var(--orange)' : 'rgba(255,255,255,0.5)',
                borderRadius: '99px',
                transition: 'width 0.1s linear, background 0.3s ease',
                boxShadow: holdProgress >= 90 ? '0 0 10px var(--accent)' : 'none',
              }} />
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: '6px',
              fontSize: '10px', color: 'rgba(255,255,255,0.5)',
              fontWeight: 600, letterSpacing: '0.04em',
            }}>
              <span>HOLD {holdProgress >= 90 ? '✓' : ''}</span>
              <span>×{holdCount} holds</span>
            </div>
          </div>

          {/* Bottom — done button */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
            zIndex: 20,
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%', padding: '15px',
                borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                backdropFilter: 'blur(10px)',
              }}
            >
              Done — Best Score: {bestScore}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
