import { useEffect, useRef, useState, useCallback } from 'react';

// ── MediaPipe landmark indices ───────────────────────────────────────────
// Left:  shoulder=11, elbow=13, wrist=15, hip=23, knee=25, ankle=27
// Right: shoulder=12, elbow=14, wrist=16, hip=24, knee=26, ankle=28

// Body-only connections (skip face landmarks 0–10 to avoid noisy face lines)
const POSE_CONNECTIONS = [
  // Torso
  [11,12],[11,23],[12,24],[23,24],
  // Left arm
  [11,13],[13,15],[15,17],[15,19],[17,19],
  // Right arm
  [12,14],[14,16],[16,18],[16,20],[18,20],
  // Left leg
  [23,25],[25,27],[27,29],[27,31],[29,31],
  // Right leg
  [24,26],[26,28],[28,30],[28,32],[30,32],
];

// ── Thresholds ─────────────────────────────────────────────────────────
// VIS_THRESHOLD lowered to 0.3 for mobile cameras (especially front cam in poor light)
const VIS_THRESHOLD = 0.3;

// ── Exercise categories ──────────────────────────────────────────────────
const ONE_ARM_EXERCISES = [
  'bicep-curl', 'hammer-curl', 'concentration-curl', 
  'lateral-raise', 'front-raise', 'tricep-extension'
];

const PUSH_UP_EXERCISES = [
  'pushup', 'incline-pushup', 'decline-pushup', 
  'diamond-pushup', 'wide-pushup', 'pike-pushup'
];

const PULL_EXERCISES = [
  'pullup', 'chinup', 'bodyweight-row'
];

const LEG_EXERCISES = [
  'squat', 'lunge', 'glute-bridge', 'single-leg-squat', 
  'jump-squat', 'calf-raise'
];

const TIMED_EXERCISES = [
  'plank', 'hollow-body', 'dead-hang', 'superman'
];

// ── Threshold maps per exercise type ─────────────────────────────────────
const THRESHOLDS = {
  curl: {
    peak: 55,      // fully contracted (was 45)
    half: 100,     // partially contracted
    extended: 130, // arm straight (was 140)
    elbowStable: 0.12
  },
  lateralRaise: {
    parallel: 0.12,  // arm parallel to floor (was 0.15)
    half: 0.05,
    atRest: -0.02
  },
  pushup: {
    bottom: 95,   // elbow angle at bottom (was 90)
    top: 155,     // elbow angle at top
    bodyStraight: 20 // tolerance from 180°
  },
  squat: {
    deep: 95,     // knee angle (was 90)
    half: 125,
    standing: 155,
    torsoUpright: 55,
    kneeDrift: 0.18
  },
  plank: {
    bodyStraight: 12,  // tolerance from 180°
    hipSag: 0.04
  }
};

export function usePoseDetection(videoRef, canvasRef, enabled, facingMode = 'user', exerciseId = 'pushup') {
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [repCount, setRepCount] = useState(0);
  const [activeSide, setActiveSide] = useState('left');

  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const repStateRef = useRef({ phase: 'ready', count: 0, lastTime: 0 });
  const scoreHistoryRef = useRef([]);
  const isActiveRef = useRef(true);
  const activeSideRef = useRef('left');

  // Stable ref so onResults closure always reads the latest exerciseId
  const exerciseIdRef = useRef(exerciseId);
  useEffect(() => { exerciseIdRef.current = exerciseId; }, [exerciseId]);

  // ── Angle between 3 landmarks (degrees) ────────────────────────────────
  const calculateAngle = useCallback((a, b, c) => {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  }, []);

  // ── Visibility check ───────────────────────────────────────────────────
  const isVisible = useCallback((lm, idx) => {
    const pt = lm[idx];
    if (!pt) return false;
    const vis = pt.visibility !== undefined ? pt.visibility : 1;
    return vis >= VIS_THRESHOLD;
  }, []);

  // ── Auto-detect best arm for single-arm exercises ──────────────────────
  const detectBestArm = useCallback((lm) => {
    const leftWrist = lm[15];
    const rightWrist = lm[16];
    const lv = leftWrist?.visibility ?? 0;
    const rv = rightWrist?.visibility ?? 0;
    
    const current = activeSideRef.current;
    const currentVis = current === 'left' ? lv : rv;
    const otherVis = current === 'left' ? rv : lv;
    
    // Hysteresis: only switch if other side is significantly more visible
    if (otherVis > currentVis + 0.25) {
      const newSide = current === 'left' ? 'right' : 'left';
      activeSideRef.current = newSide;
      return newSide;
    }
    return current;
  }, []);

  // ── Get arm landmarks by side ────────────────────────────────────────
  const getArmLandmarks = useCallback((lm, side) => {
    if (side === 'left') {
      return { shoulder: lm[11], elbow: lm[13], wrist: lm[15] };
    }
    return { shoulder: lm[12], elbow: lm[14], wrist: lm[16] };
  }, []);

  // ── Bidirectional rep counter ────────────────────────────────────────
  // direction: 'push' = start UP → go DOWN → return UP = 1 rep
  // direction: 'pull' = start DOWN → go UP → return DOWN = 1 rep
  const repCounter = useCallback((goCondition, returnCondition, debounceMs, direction = 'push') => {
    const now = Date.now();
    const state = repStateRef.current;

    if (direction === 'push') {
      if (state.phase === 'ready') {
        if (returnCondition) state.phase = 'up';
      } else if (state.phase === 'up') {
        if (goCondition && now - state.lastTime > debounceMs) {
          state.phase = 'down';
        }
      } else if (state.phase === 'down') {
        if (returnCondition) {
          state.phase = 'up';
          state.count += 1;
          state.lastTime = now;
        }
      }
    } else {
      // pull direction
      if (state.phase === 'ready') {
        if (returnCondition) state.phase = 'down';
      } else if (state.phase === 'down') {
        if (goCondition && now - state.lastTime > debounceMs) {
          state.phase = 'up';
        }
      } else if (state.phase === 'up') {
        if (returnCondition) {
          state.phase = 'down';
          state.count += 1;
          state.lastTime = now;
        }
      }
    }
  }, []);

  // ── Main form analysis ─────────────────────────────────────────────────
  const analyzeForm = useCallback((landmarks, exerciseId) => {
    // ── GUARD CLAUSE #1: Basic landmark count ──────────────────────────
    if (!landmarks || landmarks.length < 25) {
      return { score: 0, feedback: 'Move closer to camera', side: activeSideRef.current };
    }

    const lm = landmarks;
    let formScore = 0;
    let feedbackText = 'Get in position...';

    // ── GUARD CLAUSE #2: Core body visibility ─────────────────────────
    const shouldersVisible = isVisible(lm, 11) && isVisible(lm, 12);
    const hipsVisible = isVisible(lm, 23) && isVisible(lm, 24);
    
    // For arm-only exercises (curl, raise, etc.) only shoulders need to be visible
    const isArmOnlyExercise = ONE_ARM_EXERCISES.includes(exerciseId) ||
      ['cable-curl','barbell-curl','dumbbell-fly','cable-fly','face-pull',
       'cable-lateral-raise','overhead-press','arnold-press','incline-dumbbell-press',
       'tricep-pushdown','skull-crusher','cable-kickback','lat-pulldown',
       'barbell-row','dumbbell-row','seated-cable-row'].includes(exerciseId);
    
    if (!shouldersVisible) {
      return { 
        score: 0, 
        feedback: 'Show upper body to camera', 
        side: activeSideRef.current 
      };
    }
    if (!isArmOnlyExercise && !hipsVisible) {
      return { 
        score: 0, 
        feedback: 'Step back — show full body', 
        side: activeSideRef.current 
      };
    }

    // ── GUARD CLAUSE #3: Single-arm exercise arm visibility ────────────
    if (ONE_ARM_EXERCISES.includes(exerciseId)) {
      const side = detectBestArm(lm);
      const armIdx = side === 'left' ? { s: 11, e: 13, w: 15 } : { s: 12, e: 14, w: 16 };
      const armVisible = isVisible(lm, armIdx.s) && isVisible(lm, armIdx.e) && isVisible(lm, armIdx.w);
      
      if (!armVisible) {
        return { 
          score: 0, 
          feedback: `Show your ${side} arm to camera`, 
          side 
        };
      }
    }

    // ── Safe landmark getters with fallback ───────────────────────────
    // Only use these AFTER guard clauses pass
    const ls = lm[11] || { x: 0, y: 0 };
    const le = lm[13] || { x: 0, y: 0 };
    const lw = lm[15] || { x: 0, y: 0 };
    const lh = lm[23] || { x: 0, y: 0 };
    const lk = lm[25] || { x: 0, y: 0 };
    const la = lm[27] || { x: 0, y: 0 };

    const rs = lm[12] || { x: 0, y: 0 };
    const re = lm[14] || { x: 0, y: 0 };
    const rw = lm[16] || { x: 0, y: 0 };
    const rh = lm[24] || { x: 0, y: 0 };
    const rk = lm[26] || { x: 0, y: 0 };
    const ra = lm[28] || { x: 0, y: 0 };

    // ── SINGLE-ARM EXERCISES ───────────────────────────────────────────
    if (ONE_ARM_EXERCISES.includes(exerciseId)) {
      const side = detectBestArm(lm);
      const { shoulder, elbow, wrist } = getArmLandmarks(lm, side);

      // ── BICEP CURL / HAMMER CURL / CONCENTRATION CURL ──────────────
      if (['bicep-curl', 'hammer-curl', 'concentration-curl'].includes(exerciseId)) {
        const curlAngle = calculateAngle(shoulder, elbow, wrist);
        const elbowDrift = Math.abs(elbow.x - shoulder.x);
        const elbowStable = elbowDrift < THRESHOLDS.curl.elbowStable;

        const peaked = curlAngle < THRESHOLDS.curl.peak;
        const halfCurl = curlAngle < THRESHOLDS.curl.half;
        const extended = curlAngle > THRESHOLDS.curl.extended;

        if (peaked && elbowStable) { 
          formScore = 95; 
          feedbackText = 'Peak squeeze!'; 
        } else if (halfCurl && elbowStable) { 
          formScore = 80; 
          feedbackText = 'Curl higher'; 
        } else if (!elbowStable) { 
          formScore = 65; 
          feedbackText = 'Elbow fixed!'; 
        } else { 
          formScore = 55; 
          feedbackText = 'Curl up'; 
        }

        repCounter(peaked, extended, 400, 'pull');
        return { score: formScore, feedback: feedbackText, side };
      }

      // ── LATERAL RAISE / FRONT RAISE ────────────────────────────────
      if (['lateral-raise', 'front-raise'].includes(exerciseId)) {
        const armRaised = shoulder.y - wrist.y;
        const parallel = armRaised > THRESHOLDS.lateralRaise.parallel;
        const halfRaise = armRaised > THRESHOLDS.lateralRaise.half;
        const atRest = armRaised < THRESHOLDS.lateralRaise.atRest;

        const elbowStraight = calculateAngle(shoulder, elbow, wrist) > 145;

        if (parallel && elbowStraight) { 
          formScore = 95; 
          feedbackText = 'Parallel!'; 
        } else if (halfRaise) { 
          formScore = 75; 
          feedbackText = 'Raise higher'; 
        } else if (!elbowStraight) { 
          formScore = 65; 
          feedbackText = 'Straighten arm'; 
        } else { 
          formScore = 55; 
          feedbackText = 'Raise your arm'; 
        }

        repCounter(parallel, atRest, 700, 'pull');
        return { score: formScore, feedback: feedbackText, side };
      }

      // ── TRICEP EXTENSION ───────────────────────────────────────────
      if (exerciseId === 'tricep-extension') {
        const elbowAngle = calculateAngle(shoulder, elbow, wrist);
        const extended = elbowAngle > 155;
        const contracted = elbowAngle < 65;
        const elbowUp = Math.abs(elbow.x - shoulder.x) < 0.1;

        if (extended && elbowUp) { 
          formScore = 95; 
          feedbackText = 'Full extension!'; 
        } else if (elbowAngle > 125) { 
          formScore = 78; 
          feedbackText = 'Extend fully'; 
        } else if (!elbowUp) { 
          formScore = 65; 
          feedbackText = 'Keep elbow up'; 
        } else { 
          formScore = 60; 
          feedbackText = 'Extend arm'; 
        }

        repCounter(contracted, extended, 500, 'push');
        return { score: formScore, feedback: feedbackText, side };
      }
    }

    // ── PUSH-UP GROUP ──────────────────────────────────────────────────
    if (PUSH_UP_EXERCISES.includes(exerciseId)) {
      const shoulderY = (ls.y + rs.y) / 2;
      const hipY = (lh.y + rh.y) / 2;
      const ankleY = (la.y + ra.y) / 2;
      const elbowAng = calculateAngle(ls, le, lw);

      const bodyAngle = calculateAngle(
        { x: (ls.x + rs.x) / 2, y: shoulderY },
        { x: (lh.x + rh.x) / 2, y: hipY },
        { x: (la.x + ra.x) / 2, y: ankleY }
      );
      const bodyStraight = Math.abs(bodyAngle - 180) < THRESHOLDS.pushup.bodyStraight;
      const atBottom = elbowAng < THRESHOLDS.pushup.bottom;
      const atTop = elbowAng > THRESHOLDS.pushup.top;

      if (bodyStraight && atBottom) { 
        formScore = 95; 
        feedbackText = 'Full depth!'; 
      } else if (bodyStraight && elbowAng < 120) { 
        formScore = 78; 
        feedbackText = 'Go deeper'; 
      } else if (!bodyStraight) { 
        formScore = 60; 
        feedbackText = 'Keep body straight'; 
      } else { 
        formScore = 50; 
        feedbackText = 'Lower down'; 
      }

      repCounter(atBottom, atTop, 500, 'push');
    }

    // ── SQUAT ──────────────────────────────────────────────────────────
    else if (exerciseId === 'squat') {
      const leftKneeVis = lm[25]?.visibility ?? 0;
      const rightKneeVis = lm[26]?.visibility ?? 0;
      const useSide = leftKneeVis >= rightKneeVis ? 'left' : 'right';

      const hip = useSide === 'left' ? lh : rh;
      const knee = useSide === 'left' ? lk : rk;
      const ankle = useSide === 'left' ? la : ra;
      const shoulder = useSide === 'left' ? ls : rs;

      const kneeAngle = calculateAngle(hip, knee, ankle);
      const torsoUpright = calculateAngle(shoulder, hip, knee) > THRESHOLDS.squat.torsoUpright;
      const kneeDrift = Math.abs(knee.x - ankle.x);

      const deepSquat = kneeAngle < THRESHOLDS.squat.deep;
      const halfSquat = kneeAngle < THRESHOLDS.squat.half;
      const standing = kneeAngle > THRESHOLDS.squat.standing;

      if (deepSquat && torsoUpright) { 
        formScore = 95; 
        feedbackText = 'Deep squat!'; 
      } else if (halfSquat && torsoUpright) { 
        formScore = 80; 
        feedbackText = 'Go deeper'; 
      } else if (!torsoUpright) { 
        formScore = 65; 
        feedbackText = 'Chest up'; 
      } else if (kneeDrift > THRESHOLDS.squat.kneeDrift) { 
        formScore = 70; 
        feedbackText = 'Knees out'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Keep form'; 
      }

      repCounter(deepSquat, standing, 600, 'push');
    }

    // ── PIKE PUSH-UP ───────────────────────────────────────────────────
    else if (exerciseId === 'pike-pushup') {
      const elbowAngle = calculateAngle(ls, le, lw);
      const hipsUp = lh.y < ls.y - 0.08;
      const atBottom = elbowAngle < THRESHOLDS.pushup.bottom;
      const atTop = elbowAngle > THRESHOLDS.pushup.top;

      if (hipsUp && atBottom) { 
        formScore = 95; 
        feedbackText = 'Perfect pike!'; 
      } else if (hipsUp && elbowAngle < 120) { 
        formScore = 78; 
        feedbackText = 'Lower more'; 
      } else if (!hipsUp) { 
        formScore = 60; 
        feedbackText = 'Hips up high'; 
      } else { 
        formScore = 55; 
        feedbackText = 'Check position'; 
      }

      repCounter(atBottom, atTop, 500, 'push');
    }

    // ── DIPS ───────────────────────────────────────────────────────────
    else if (['dip', 'bench-dip'].includes(exerciseId)) {
      const elbowAngle = calculateAngle(ls, le, lw);
      const atBottom = elbowAngle < 100;
      const atTop = elbowAngle > 155;
      const depth = le.y - ls.y;

      if (depth > 0.04 && atBottom) { 
        formScore = 95; 
        feedbackText = 'Full depth!'; 
      } else if (elbowAngle < 115) { 
        formScore = 78; 
        feedbackText = 'Go deeper'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Lower more'; 
      }

      repCounter(atBottom, atTop, 500, 'push');
    }

    // ── PULL-UP / CHIN-UP ──────────────────────────────────────────────
    else if (PULL_EXERCISES.includes(exerciseId)) {
      const elbowAngle = calculateAngle(ls, le, lw);
      const nose = lm[0] || { y: 1 };
      const chinAbove = nose.y < (lw.y - 0.05);
      const atTop = elbowAngle < 75;
      const atHang = elbowAngle > 155;

      if (chinAbove && atTop) { 
        formScore = 95; 
        feedbackText = 'Chin over bar!'; 
      } else if (elbowAngle < 100) { 
        formScore = 80; 
        feedbackText = 'Almost!'; 
      } else if (atHang) { 
        formScore = 70; 
        feedbackText = 'Pull up!'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Full hang first'; 
      }

      repCounter(atTop, atHang, 700, 'pull');
    }

    // ── BODYWEIGHT ROW ─────────────────────────────────────────────────
    else if (exerciseId === 'bodyweight-row') {
      const elbowAngle = calculateAngle(ls, le, lw);
      const pulled = elbowAngle < 95;
      const extended = elbowAngle > 155;

      if (pulled) { 
        formScore = 95; 
        feedbackText = 'Chest to bar!'; 
      } else if (elbowAngle < 120) { 
        formScore = 78; 
        feedbackText = 'Pull higher'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Keep body level'; 
      }

      repCounter(pulled, extended, 500, 'pull');
    }

    // ── LUNGE ────────────────────────────────────────────────────────────
    else if (exerciseId === 'lunge') {
      const leftKneeVis = lm[25]?.visibility ?? 0;
      const rightKneeVis = lm[26]?.visibility ?? 0;
      const useSide = leftKneeVis >= rightKneeVis ? 'left' : 'right';

      const hip = useSide === 'left' ? lh : rh;
      const knee = useSide === 'left' ? lk : rk;
      const ankle = useSide === 'left' ? la : ra;
      const shoulder = useSide === 'left' ? ls : rs;

      const kneeAngle = calculateAngle(hip, knee, ankle);
      const upright = calculateAngle(shoulder, hip, knee) > 65;
      const atBottom = kneeAngle < 105;
      const standing = kneeAngle > 155;

      if (atBottom && upright) { 
        formScore = 95; 
        feedbackText = 'Deep lunge!'; 
      } else if (kneeAngle < 125) { 
        formScore = 80; 
        feedbackText = 'Go lower'; 
      } else if (!upright) { 
        formScore = 65; 
        feedbackText = 'Torso upright'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Step deeper'; 
      }

      repCounter(atBottom, standing, 600, 'push');
    }

    // ── GLUTE BRIDGE ───────────────────────────────────────────────────
    else if (exerciseId === 'glute-bridge') {
      const hipAngle = calculateAngle(ls, lh, lk);
      const hipHeight = ls.y - lh.y;
      const bridgeUp = hipHeight > 0.06 && hipAngle > 145;
      const atFloor = hipHeight < 0.01;

      if (bridgeUp) { 
        formScore = 95; 
        feedbackText = 'Squeeze glutes!'; 
      } else if (hipHeight > 0.02) { 
        formScore = 78; 
        feedbackText = 'Hips higher'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Drive hips up'; 
      }

      repCounter(bridgeUp, atFloor, 500, 'pull');
    }

    // ── PLANK ──────────────────────────────────────────────────────────
    else if (exerciseId === 'plank') {
      const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
      const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
      const midAnkle = { x: (la.x + ra.x) / 2, y: (la.y + ra.y) / 2 };
      const bodyAngle = calculateAngle(midShoulder, midHip, midAnkle);
      const straight = Math.abs(bodyAngle - 180) < THRESHOLDS.plank.bodyStraight;
      const hipSag = Math.abs(midHip.y - (midShoulder.y + midAnkle.y) / 2);

      if (straight && hipSag < THRESHOLDS.plank.hipSag) { 
        formScore = 95; 
        feedbackText = 'Iron plank!'; 
      } else if (straight) { 
        formScore = 78; 
        feedbackText = 'Hips level'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Straighten body'; 
      }
      // Timed — no rep count
    }

    // ── HOLLOW BODY ────────────────────────────────────────────────────
    else if (exerciseId === 'hollow-body') {
      const shoulderLift = lh.y - ls.y;
      const backFlat = Math.abs(lh.y - (ls.y + la.y) / 2) < 0.07;

      if (shoulderLift > 0.05 && backFlat) { 
        formScore = 95; 
        feedbackText = 'Solid hollow!'; 
      } else if (shoulderLift > 0.02) { 
        formScore = 75; 
        feedbackText = 'Back flat'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Lift + tighten'; 
      }
    }

    // ── DEAD HANG ──────────────────────────────────────────────────────
    else if (exerciseId === 'dead-hang') {
      const elbowAngle = calculateAngle(ls, le, lw);
      const shoulders = ls.y < lw.y - 0.08;

      if (elbowAngle > 158 && shoulders) { 
        formScore = 95; 
        feedbackText = 'Perfect hang!'; 
      } else if (elbowAngle > 140) { 
        formScore = 80; 
        feedbackText = 'Shoulders down'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Extend arms'; 
      }
    }

    // ── SUPERMAN ───────────────────────────────────────────────────────
    else if (exerciseId === 'superman') {
      const liftHeight = lh.y - ls.y;
      const lifted = liftHeight > 0.08;
      const atFloor = liftHeight < 0.01;

      if (lifted) { 
        formScore = 95; 
        feedbackText = 'Hold it!'; 
      } else if (liftHeight > 0.03) { 
        formScore = 78; 
        feedbackText = 'Higher!'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Lift chest + legs'; 
      }

      repCounter(lifted, atFloor, 800, 'pull');
    }

    // ── CRUNCH ───────────────────────────────────────────────────────────
    else if (exerciseId === 'crunch') {
      const crunch = lh.y - ls.y;
      const peaked = crunch > 0.10;
      const flat = crunch < 0.02;

      if (peaked) { 
        formScore = 95; 
        feedbackText = 'Squeeze!'; 
      } else if (crunch > 0.05) { 
        formScore = 78; 
        feedbackText = 'Crunch up'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Lift shoulders'; 
      }

      repCounter(peaked, flat, 400, 'pull');
    }

    // ── LEG RAISE ──────────────────────────────────────────────────────
    else if (exerciseId === 'leg-raise') {
      const legsUp = (lh.y + rh.y) / 2 - (la.y + ra.y) / 2;
      const raised = legsUp > 0.18;
      const lowered = legsUp < 0.01;

      if (raised) { 
        formScore = 95; 
        feedbackText = 'Legs up!'; 
      } else if (legsUp > 0.08) { 
        formScore = 78; 
        feedbackText = 'Higher'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Raise legs'; 
      }

      repCounter(raised, lowered, 500, 'pull');
    }

    // ── MOUNTAIN CLIMBER ───────────────────────────────────────────────
    else if (exerciseId === 'mountain-climber') {
      const midShoulderX = (ls.x + rs.x) / 2;
      const leftDrive = midShoulderX - lk.x > 0.08;
      const rightDrive = midShoulderX - rk.x > 0.08;
      const hipLevel = Math.abs((lh.y + rh.y) / 2 - (ls.y + rs.y) / 2 - 0.12) < 0.1;
      const driving = leftDrive || rightDrive;

      if (driving && hipLevel) { 
        formScore = 95; 
        feedbackText = 'Drive!'; 
      } else if (hipLevel) { 
        formScore = 78; 
        feedbackText = 'Knees to chest'; 
      } else { 
        formScore = 65; 
        feedbackText = 'Hips level'; 
      }

      const now = Date.now();
      if (driving && now - repStateRef.current.lastTime > 350) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── JUMP SQUAT ─────────────────────────────────────────────────────
    else if (exerciseId === 'jump-squat') {
      const kneeAngle = calculateAngle(lh, lk, la);
      const upright = calculateAngle(ls, lh, lk) > 55;
      const deepSquat = kneeAngle < THRESHOLDS.squat.deep;
      const standing = kneeAngle > 158;

      if (deepSquat && upright) { 
        formScore = 95; 
        feedbackText = 'Explode!'; 
      } else if (kneeAngle < 125) { 
        formScore = 78; 
        feedbackText = 'Squat deeper'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Squat first'; 
      }

      repCounter(deepSquat, standing, 600, 'push');
    }

    // ── PISTOL SQUAT ───────────────────────────────────────────────────
    else if (exerciseId === 'single-leg-squat') {
      const leftKneeVis = lm[25]?.visibility ?? 0;
      const rightKneeVis = lm[26]?.visibility ?? 0;
      const useSide = leftKneeVis >= rightKneeVis ? 'left' : 'right';

      const hip = useSide === 'left' ? lh : rh;
      const knee = useSide === 'left' ? lk : rk;
      const ankle = useSide === 'left' ? la : ra;
      const shoulder = useSide === 'left' ? ls : rs;

      const kneeAngle = calculateAngle(hip, knee, ankle);
      const balanced = Math.abs(shoulder.x - hip.x) < 0.14;
      const atBottom = kneeAngle < 105;
      const standing = kneeAngle > 158;

      if (atBottom && balanced) { 
        formScore = 95; 
        feedbackText = 'Pistol!'; 
      } else if (kneeAngle < 130) { 
        formScore = 78; 
        feedbackText = 'Go lower'; 
      } else if (!balanced) { 
        formScore = 65; 
        feedbackText = 'Balance!'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Control down'; 
      }

      repCounter(atBottom, standing, 800, 'push');
    }

    // ── CALF RAISE ─────────────────────────────────────────────────────
    else if (exerciseId === 'calf-raise') {
      const knee = lm[25] || { x: 0, y: 0 };
      const ankle = lm[27] || { x: 0, y: 0 };
      const foot = lm[31] || { x: 0, y: 0 };
      const angle = calculateAngle(knee, ankle, foot);
      const raised = angle < 82;
      const flat = angle > 100;

      if (raised) { 
        formScore = 95; 
        feedbackText = 'Full rise!'; 
      } else if (angle < 95) { 
        formScore = 78; 
        feedbackText = 'Rise higher'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Up on toes'; 
      }

      repCounter(raised, flat, 400, 'pull');
    }

    // ── SHOULDER TAP ───────────────────────────────────────────────────
    else if (exerciseId === 'shoulder-tap') {
      const hipMid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
      const shMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
      const hipSway = Math.abs(hipMid.x - shMid.x);
      const leftTap = Math.abs(lw.x - rs.x) < 0.1;
      const rightTap = Math.abs(rw.x - ls.x) < 0.1;
      const tapping = leftTap || rightTap;

      if (tapping && hipSway < 0.1) { 
        formScore = 95; 
        feedbackText = 'Stable!'; 
      } else if (tapping) { 
        formScore = 75; 
        feedbackText = 'Hips still'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Tap shoulder'; 
      }

      const now = Date.now();
      if (tapping && now - repStateRef.current.lastTime > 450) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── RUSSIAN TWIST ──────────────────────────────────────────────────
    else if (exerciseId === 'russian-twist') {
      const wristMid = (lw.x + rw.x) / 2;
      const shoulderMid = (ls.x + rs.x) / 2;
      const rotation = Math.abs(wristMid - shoulderMid);
      const twisted = rotation > 0.12;

      if (twisted) { 
        formScore = 95; 
        feedbackText = 'Full twist!'; 
      } else if (rotation > 0.06) { 
        formScore = 78; 
        feedbackText = 'Twist more'; 
      } else { 
        formScore = 60; 
        feedbackText = 'Rotate side to side'; 
      }

      const now = Date.now();
      if (twisted && now - repStateRef.current.lastTime > 450) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
        repStateRef.current.phase = 'ready';
      }
    }

    // ── BARBELL SQUAT ─────────────────────────────────────────────────
    else if (exerciseId === 'barbell-squat' || exerciseId === 'bulgarian-split-squat') {
      const leftKneeVis = lm[25]?.visibility ?? 0;
      const rightKneeVis = lm[26]?.visibility ?? 0;
      const useSide = leftKneeVis >= rightKneeVis ? 'left' : 'right';
      const hip = useSide === 'left' ? lh : rh;
      const knee = useSide === 'left' ? lk : rk;
      const ankle = useSide === 'left' ? la : ra;
      const shoulder = useSide === 'left' ? ls : rs;
      const kneeAngle = calculateAngle(hip, knee, ankle);
      const torsoAngle = calculateAngle(shoulder, hip, knee);
      const chestUp = torsoAngle > 50;
      const deep = kneeAngle < 95;
      const standing = kneeAngle > 155;
      if (deep && chestUp) { formScore = 95; feedbackText = 'Deep squat!'; }
      else if (kneeAngle < 120 && chestUp) { formScore = 80; feedbackText = 'Go deeper'; }
      else if (!chestUp) { formScore = 65; feedbackText = 'Chest up!'; }
      else { formScore = 60; feedbackText = 'Break parallel'; }
      repCounter(deep, standing, 600, 'push');
    }

    // ── DEADLIFT / RDL ────────────────────────────────────────────────
    else if (['barbell-deadlift', 'romanian-deadlift'].includes(exerciseId)) {
      const hipAngle = calculateAngle(ls, lh, lk);
      const hipHinge = hipAngle < 110;
      const backFlat = Math.abs(ls.x - lh.x) < 0.15;
      const lockout = hipAngle > 165 && Math.abs(ls.y - lh.y) < 0.05;
      const start = hipAngle < 90;
      if (lockout) { formScore = 95; feedbackText = 'Full lockout!'; }
      else if (hipHinge && backFlat) { formScore = 85; feedbackText = 'Good hinge'; }
      else if (!backFlat) { formScore = 60; feedbackText = 'Keep back flat!'; }
      else { formScore = 70; feedbackText = 'Drive hips forward'; }
      repCounter(start, lockout, 700, 'pull');
    }

    // ── BARBELL/DUMBBELL ROW ──────────────────────────────────────────
    else if (['barbell-row', 'dumbbell-row', 'seated-cable-row'].includes(exerciseId)) {
      const side = detectBestArm(lm);
      const arm = getArmLandmarks(lm, side);
      const elbowAngle = calculateAngle(arm.shoulder, arm.elbow, arm.wrist);
      const torsoAngle = calculateAngle(arm.shoulder, lh, { x: lh.x, y: lh.y + 0.3 });
      const torsoOk = exerciseId === 'seated-cable-row' ? torsoAngle > 70 : (torsoAngle > 30 && torsoAngle < 70);
      const pulled = elbowAngle < 90;
      const extended = elbowAngle > 155;
      if (pulled && torsoOk) { formScore = 95; feedbackText = 'Full row!'; }
      else if (pulled) { formScore = 80; feedbackText = 'Good pull'; }
      else if (!torsoOk) { formScore = 65; feedbackText = exerciseId === 'seated-cable-row' ? 'Sit upright' : 'Torso 45°'; }
      else { formScore = 60; feedbackText = 'Pull to hip'; }
      repCounter(pulled, extended, 500, 'pull');
    }

    // ── OVERHEAD PRESS / ARNOLD PRESS ────────────────────────────────
    else if (['overhead-press', 'arnold-press'].includes(exerciseId)) {
      const elbowAngle = calculateAngle(ls, le, lw);
      const wristAboveShoulder = lw.y < ls.y - 0.1;
      const lockout = elbowAngle > 160 && wristAboveShoulder;
      const start = elbowAngle < 100;
      const torsoUpright = Math.abs(ls.x - lh.x) < 0.1;
      if (lockout && torsoUpright) { formScore = 95; feedbackText = 'Full lockout!'; }
      else if (wristAboveShoulder) { formScore = 80; feedbackText = 'Press higher'; }
      else if (!torsoUpright) { formScore = 65; feedbackText = 'Stay upright'; }
      else { formScore = 60; feedbackText = 'Press overhead'; }
      repCounter(start, lockout, 600, 'push');
    }

    // ── INCLINE DUMBBELL PRESS ────────────────────────────────────────
    else if (exerciseId === 'incline-dumbbell-press') {
      const elbowAngle = calculateAngle(ls, le, lw);
      const wristUp = lw.y < ls.y;
      const lockout = elbowAngle > 155;
      const bottom = elbowAngle < 90;
      if (lockout && wristUp) { formScore = 95; feedbackText = 'Full lockout!'; }
      else if (elbowAngle > 130) { formScore = 80; feedbackText = 'Press higher'; }
      else if (bottom) { formScore = 85; feedbackText = 'Good stretch'; }
      else { formScore = 65; feedbackText = 'Full range'; }
      repCounter(bottom, lockout, 600, 'push');
    }

    // ── DUMBBELL FLY / CABLE FLY ─────────────────────────────────────
    else if (['dumbbell-fly', 'cable-fly'].includes(exerciseId)) {
      const armSpan = Math.abs(lw.x - rw.x);
      const armHeight = (ls.y + rs.y) / 2 - (lw.y + rw.y) / 2;
      const wideOpen = armSpan > 0.5;
      const closed = armSpan < 0.2;
      const level = Math.abs(armHeight) < 0.08;
      if (wideOpen && level) { formScore = 90; feedbackText = 'Full stretch!'; }
      else if (closed && level) { formScore = 95; feedbackText = 'Squeeze chest!'; }
      else if (!level) { formScore = 65; feedbackText = 'Keep arms level'; }
      else { formScore = 70; feedbackText = 'Full arc motion'; }
      const now = Date.now();
      if (wideOpen && repStateRef.current.phase !== 'down' && now - repStateRef.current.lastTime > 600) {
        repStateRef.current.phase = 'down';
      } else if (closed && repStateRef.current.phase === 'down') {
        repStateRef.current.phase = 'up';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      } else if (repStateRef.current.phase === 'ready' && wideOpen) {
        repStateRef.current.phase = 'down';
      }
    }

    // ── LAT PULLDOWN ─────────────────────────────────────────────────
    else if (exerciseId === 'lat-pulldown') {
      const elbowAngle = calculateAngle(ls, le, lw);
      const wristAbove = lw.y < ls.y;
      const pullDown = elbowAngle < 85 && !wristAbove;
      const extended = elbowAngle > 155 && wristAbove;
      const leanOk = Math.abs(ls.x - lh.x) < 0.12;
      if (pullDown && leanOk) { formScore = 95; feedbackText = 'Full pull!'; }
      else if (pullDown) { formScore = 80; feedbackText = 'Good pull'; }
      else if (!leanOk) { formScore = 65; feedbackText = 'Slight lean back'; }
      else { formScore = 60; feedbackText = 'Pull to chest'; }
      repCounter(pullDown, extended, 600, 'pull');
    }

    // ── CABLE CURL / BARBELL CURL ────────────────────────────────────
    else if (['cable-curl', 'barbell-curl'].includes(exerciseId)) {
      const elbowAngle = calculateAngle(ls, le, lw);
      const elbowStable = Math.abs(le.x - ls.x) < 0.1;
      const peaked = elbowAngle < 55;
      const extended = elbowAngle > 150;
      if (peaked && elbowStable) { formScore = 95; feedbackText = 'Peak squeeze!'; }
      else if (peaked) { formScore = 80; feedbackText = 'Elbow fixed'; }
      else if (!elbowStable) { formScore = 65; feedbackText = 'Pin elbows'; }
      else { formScore = 60; feedbackText = 'Curl up'; }
      repCounter(peaked, extended, 500, 'pull');
    }

    // ── TRICEP PUSHDOWN / SKULL CRUSHER / CABLE KICKBACK ────────────
    else if (['tricep-pushdown', 'skull-crusher', 'cable-kickback'].includes(exerciseId)) {
      const elbowAngle = calculateAngle(ls, le, lw);
      const elbowFixed = exerciseId !== 'cable-kickback' ? Math.abs(le.x - ls.x) < 0.1 : true;
      const lockout = elbowAngle > 160;
      const contracted = elbowAngle < 70;
      if (lockout && elbowFixed) { formScore = 95; feedbackText = 'Full extension!'; }
      else if (elbowAngle > 130) { formScore = 80; feedbackText = 'Extend fully'; }
      else if (!elbowFixed) { formScore = 65; feedbackText = 'Keep elbow still'; }
      else { formScore = 60; feedbackText = 'Push down'; }
      repCounter(contracted, lockout, 500, 'push');
    }

    // ── FACE PULL ────────────────────────────────────────────────────
    else if (exerciseId === 'face-pull') {
      const elbowAngle = calculateAngle(ls, le, lw);
      const elbowHigh = le.y < ls.y + 0.05;
      const wristAtFace = Math.abs(lw.y - lm[0].y) < 0.15 && lw.y < ls.y;
      const pulled = wristAtFace && elbowHigh;
      const extended = elbowAngle > 155;
      if (pulled) { formScore = 95; feedbackText = 'Elbows high!'; }
      else if (elbowHigh && elbowAngle < 120) { formScore = 80; feedbackText = 'Pull to face'; }
      else if (!elbowHigh) { formScore = 65; feedbackText = 'Elbows up!'; }
      else { formScore = 60; feedbackText = 'Pull higher'; }
      repCounter(pulled, extended, 500, 'pull');
    }

    // ── CABLE LATERAL RAISE ──────────────────────────────────────────
    else if (exerciseId === 'cable-lateral-raise') {
      const side = detectBestArm(lm);
      const arm = getArmLandmarks(lm, side);
      const armHeight = arm.shoulder.y - arm.wrist.y;
      const parallel = armHeight > 0.1;
      const atRest = armHeight < -0.02;
      const straight = calculateAngle(arm.shoulder, arm.elbow, arm.wrist) > 145;
      if (parallel && straight) { formScore = 95; feedbackText = 'Parallel!'; }
      else if (parallel) { formScore = 78; feedbackText = 'Keep arm straight'; }
      else { formScore = 60; feedbackText = 'Raise to parallel'; }
      repCounter(parallel, atRest, 700, 'pull');
    }

    // ══════════════════════════════════════════════════════════════════
    // ── BODYBUILDING POSES ───────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════

    // ── FRONT DOUBLE BICEPS ──────────────────────────────────────────
    else if (exerciseId === 'pose-front-double-biceps') {
      const leftArmAngle = calculateAngle(ls, le, lw);
      const rightArmAngle = calculateAngle(rs, re, rw);
      const leftElbowHeight = le.y < ls.y + 0.02;
      const rightElbowHeight = re.y < rs.y + 0.02;
      const elbowsUp = leftElbowHeight && rightElbowHeight;
      const armsFlexed = leftArmAngle < 100 && rightArmAngle < 100;
      const symmetry = Math.abs(leftArmAngle - rightArmAngle) < 15;
      const shoulderWidth = Math.abs(ls.x - rs.x);
      const hipWidth = Math.abs(lh.x - rh.x);
      const vTaper = shoulderWidth > hipWidth * 1.1;
      const holdScore = elbowsUp && armsFlexed ? (symmetry ? 10 : 5) : 0;
      const taperScore = vTaper ? 15 : 5;
      if (elbowsUp && armsFlexed && symmetry && vTaper) { formScore = 95; feedbackText = 'Stage ready!'; }
      else if (elbowsUp && armsFlexed && symmetry) { formScore = 82; feedbackText = 'Flare your lats!'; }
      else if (elbowsUp && armsFlexed) { formScore = 72; feedbackText = 'Even out both arms'; }
      else if (elbowsUp) { formScore = 60; feedbackText = 'Flex both biceps'; }
      else { formScore = 45; feedbackText = 'Raise elbows to shoulder height'; }
      const now = Date.now();
      if (elbowsUp && armsFlexed && now - repStateRef.current.lastTime > 3000) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── FRONT LAT SPREAD ─────────────────────────────────────────────
    else if (exerciseId === 'pose-front-lat-spread') {
      const shoulderWidth = Math.abs(ls.x - rs.x);
      const hipWidth = Math.abs(lh.x - rh.x);
      const vTaper = shoulderWidth / Math.max(hipWidth, 0.01);
      const handsOnHips = Math.abs(lw.y - lh.y) < 0.12 && Math.abs(rw.y - rh.y) < 0.12;
      const chestUp = ls.y < lh.y - 0.1;
      const goodVTaper = vTaper > 1.2;
      if (handsOnHips && chestUp && goodVTaper) { formScore = 95; feedbackText = 'Maximum V-taper!'; }
      else if (handsOnHips && goodVTaper) { formScore = 82; feedbackText = 'Chest up!'; }
      else if (handsOnHips) { formScore = 68; feedbackText = 'Push lats wider'; }
      else { formScore = 50; feedbackText = 'Hands on hips, spread lats'; }
      const now = Date.now();
      if (handsOnHips && now - repStateRef.current.lastTime > 3000) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── SIDE CHEST ───────────────────────────────────────────────────
    else if (exerciseId === 'pose-side-chest') {
      const shoulderRotation = Math.abs(ls.x - rs.x);
      const turnedSide = shoulderRotation < 0.15;
      const leftElbowAngle = calculateAngle(ls, le, lw);
      const armPress = leftElbowAngle < 100;
      const chestUp = ls.y < lh.y - 0.08;
      if (turnedSide && armPress && chestUp) { formScore = 95; feedbackText = 'Perfect side chest!'; }
      else if (turnedSide && armPress) { formScore = 80; feedbackText = 'Push chest up'; }
      else if (turnedSide) { formScore = 65; feedbackText = 'Press arm into chest'; }
      else { formScore = 50; feedbackText = 'Turn 90 degrees'; }
      const now = Date.now();
      if (turnedSide && armPress && now - repStateRef.current.lastTime > 3000) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── SIDE TRICEPS ─────────────────────────────────────────────────
    else if (exerciseId === 'pose-side-triceps') {
      const shoulderRotation = Math.abs(ls.x - rs.x);
      const turnedSide = shoulderRotation < 0.15;
      const elbowAngle = calculateAngle(ls, le, lw);
      const armExtended = elbowAngle > 155;
      if (turnedSide && armExtended) { formScore = 95; feedbackText = 'Tricep showing!'; }
      else if (turnedSide) { formScore = 70; feedbackText = 'Extend arm back'; }
      else { formScore = 50; feedbackText = 'Turn 90 degrees'; }
      const now = Date.now();
      if (turnedSide && armExtended && now - repStateRef.current.lastTime > 3000) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── ABS & THIGHS ─────────────────────────────────────────────────
    else if (exerciseId === 'pose-abs-thighs') {
      const handsAboveHead = (lw.y + rw.y) / 2 < (ls.y + rs.y) / 2 - 0.1;
      const handsOnHead = Math.abs((lw.y + rw.y) / 2 - lm[0].y) < 0.15;
      const validArms = handsAboveHead || handsOnHead;
      const kneeForward = lk.y > lh.y + 0.05;
      const absEngaged = Math.abs(ls.x - lh.x) < 0.06;
      if (validArms && kneeForward && absEngaged) { formScore = 95; feedbackText = 'Abs showing!'; }
      else if (validArms && kneeForward) { formScore = 78; feedbackText = 'Crunch harder'; }
      else if (validArms) { formScore = 65; feedbackText = 'Step one leg forward'; }
      else { formScore = 50; feedbackText = 'Hands behind head'; }
      const now = Date.now();
      if (validArms && now - repStateRef.current.lastTime > 3000) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── MOST MUSCULAR ────────────────────────────────────────────────
    else if (exerciseId === 'pose-most-muscular') {
      const elbowsDown = le.y > ls.y + 0.05 && re.y > rs.y + 0.05;
      const elbowsForward = Math.abs(le.x - ls.x) < 0.15 && Math.abs(re.x - rs.x) < 0.15;
      const forwardLean = ls.y < lh.y - 0.12;
      const wristsTogether = Math.abs(lw.x - rw.x) < 0.25;
      if (elbowsDown && elbowsForward && forwardLean) { formScore = 95; feedbackText = 'Crab pose! Maximum!'; }
      else if (elbowsDown && forwardLean) { formScore = 80; feedbackText = 'Drive elbows forward'; }
      else if (elbowsDown) { formScore = 65; feedbackText = 'Lean forward more'; }
      else { formScore = 50; feedbackText = 'Drive elbows down to hips'; }
      const now = Date.now();
      if (elbowsDown && elbowsForward && now - repStateRef.current.lastTime > 3000) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── BACK DOUBLE BICEPS / BACK LAT SPREAD ────────────────────────
    else if (['pose-back-double-biceps', 'pose-back-lat-spread'].includes(exerciseId)) {
      const leftArmAngle = calculateAngle(ls, le, lw);
      const rightArmAngle = calculateAngle(rs, re, rw);
      const shoulderWidth = Math.abs(ls.x - rs.x);
      const hipWidth = Math.abs(lh.x - rh.x);
      const vTaper = shoulderWidth > hipWidth * 1.1;
      const isLatSpread = exerciseId === 'pose-back-lat-spread';
      const handsOnHips = Math.abs(lw.y - lh.y) < 0.12 && Math.abs(rw.y - rh.y) < 0.12;
      const armsFlexed = leftArmAngle < 100 && rightArmAngle < 100;
      const elbowsUp = le.y < ls.y + 0.02 && re.y < rs.y + 0.02;
      const poseOk = isLatSpread ? handsOnHips : (armsFlexed && elbowsUp);
      if (poseOk && vTaper) { formScore = 95; feedbackText = 'Maximum width!'; }
      else if (poseOk) { formScore = 72; feedbackText = 'Spread lats wider'; }
      else { formScore = 50; feedbackText = isLatSpread ? 'Hands on hips, flare lats' : 'Raise elbows up'; }
      const now = Date.now();
      if (poseOk && now - repStateRef.current.lastTime > 3000) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── MEN'S PHYSIQUE POSES ─────────────────────────────────────────
    else if (['pose-mp-front', 'pose-mp-back', 'pose-mp-side'].includes(exerciseId)) {
      const isBack = exerciseId === 'pose-mp-back';
      const isSide = exerciseId === 'pose-mp-side';
      const shoulderWidth = Math.abs(ls.x - rs.x);
      const hipWidth = Math.abs(lh.x - rh.x);
      const vTaper = shoulderWidth / Math.max(hipWidth, 0.01);
      const turnedSide = Math.abs(ls.x - rs.x) < 0.18;
      const posture = ls.y < lh.y - 0.1;
      const oneHandOnHip = Math.abs(lw.y - lh.y) < 0.1 || Math.abs(rw.y - rh.y) < 0.1;
      const goodVTaper = vTaper > 1.15;
      if (isSide) {
        if (turnedSide && posture) { formScore = 92; feedbackText = 'Great side profile!'; }
        else if (turnedSide) { formScore = 72; feedbackText = 'Stand tall'; }
        else { formScore = 50; feedbackText = 'Turn 90 degrees'; }
      } else {
        if (posture && oneHandOnHip && goodVTaper) { formScore = 95; feedbackText = 'Stage presence!'; }
        else if (posture && goodVTaper) { formScore = 80; feedbackText = 'Hand on hip'; }
        else if (posture) { formScore = 68; feedbackText = 'Show V-taper'; }
        else { formScore = 55; feedbackText = 'Stand tall, chin up'; }
      }
      const now = Date.now();
      if (posture && now - repStateRef.current.lastTime > 3000) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      }
    }

    // ── DEFAULT FALLBACK ───────────────────────────────────────────────
    else {
      const shLevel = Math.abs(ls.y - rs.y) < 0.06;
      const hipLevel = Math.abs(lh.y - rh.y) < 0.06;
      
      if (shLevel && hipLevel) { 
        formScore = 85; 
        feedbackText = 'Good posture'; 
      } else { 
        formScore = 70; 
        feedbackText = 'Stand balanced'; 
      }
    }

    return { score: formScore, feedback: feedbackText, side: activeSideRef.current };
  }, [calculateAngle, isVisible, repCounter, detectBestArm, getArmLandmarks]);

  // ── Stable ref to latest analyzeForm ──────────────────────────────────
  // Prevents useEffect (camera init) from re-running every frame when
  // analyzeForm identity changes, which was resetting repStateRef & killing counts.
  const analyzeFormRef = useRef(analyzeForm);
  useEffect(() => {
    analyzeFormRef.current = analyzeForm;
  }, [analyzeForm]);

  // ── Reset rep state whenever the exercise changes mid-session ──────────
  useEffect(() => {
    repStateRef.current    = { phase: 'ready', count: 0, lastTime: 0 };
    scoreHistoryRef.current = [];
    activeSideRef.current   = 'left';
    setRepCount(0);
    setScore(0);
    setFeedback('Get in position...');
    setActiveSide('left');
  }, [exerciseId]);

  // ── MediaPipe init & cleanup ───────────────────────────────────────────
  // Keep a stable ref to facingMode so onFrame closure doesn't go stale
  const facingModeRef = useRef(facingMode);
  useEffect(() => { facingModeRef.current = facingMode; }, [facingMode]);

  useEffect(() => {
    if (!enabled) {
      setIsReady(false);
      return;
    }

    isActiveRef.current = true;
    let cleanedUp = false;

    // Reset all state when starting a new session
    repStateRef.current    = { phase: 'ready', count: 0, lastTime: 0 };
    scoreHistoryRef.current = [];
    activeSideRef.current   = 'left';

    const initPose = async () => {
      try {
        // ── STEP 1: Poll for DOM refs (max 5s) ────────────────────────
        let attempts = 0;
        while (attempts < 50) {
          if (videoRef.current && canvasRef.current && !cleanedUp) break;
          await new Promise(r => setTimeout(r, 100));
          attempts++;
        }
        if (cleanedUp || !videoRef.current || !canvasRef.current) {
          if (!cleanedUp) setFeedback('Camera error — try again');
          return;
        }

        // ── STEP 2: getUserMedia FIRST — while user gesture is still fresh ─
        // CRITICAL: must happen before any async script loading.
        // Chrome invalidates the user gesture token after ~1 second.
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingModeRef.current }, width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
        } catch (e1) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: facingModeRef.current } },
              audio: false,
            });
          } catch (e2) {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            } catch (e3) {
              if (!cleanedUp) setFeedback('Camera permission denied — tap Allow when prompted');
              return;
            }
          }
        }

        if (cleanedUp) { stream.getTracks().forEach(t => t.stop()); return; }

        // Attach stream to video element immediately so user sees themselves
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
          setTimeout(resolve, 3000);
        });
        await video.play().catch(() => {});

        if (cleanedUp) { stream.getTracks().forEach(t => t.stop()); return; }

        // ── STEP 3: Load MediaPipe AFTER camera is already streaming ─
        const loadScript = (src) => new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
          const s = document.createElement('script');
          s.src = src;
          s.onload = resolve;
          s.onerror = () => reject(new Error(`Failed to load: ${src}`));
          document.head.appendChild(s);
        });

        // Try local bundle first (works offline/APK), fall back to CDN
        try {
          await loadScript('/mediapipe/pose.js');
        } catch {
          await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js');
        }
        if (cleanedUp) return;

        const PoseClass = window.Pose;
        if (!PoseClass) throw new Error('Pose class not found after load attempts');

        // Load drawing_utils — local first, CDN fallback
        let drawConnectors, drawLandmarks;
        try {
          await loadScript('/mediapipe/drawing_utils.js');
          if (window.drawConnectors && window.drawLandmarks) {
            drawConnectors = window.drawConnectors;
            drawLandmarks  = window.drawLandmarks;
          } else { throw new Error('not in window'); }
        } catch {
          try {
            await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466123/drawing_utils.js');
            if (window.drawConnectors && window.drawLandmarks) {
              drawConnectors = window.drawConnectors;
              drawLandmarks  = window.drawLandmarks;
            } else { throw new Error('not in window after CDN'); }
          } catch {
            const du = await import('@mediapipe/drawing_utils');
            drawConnectors = du.drawConnectors;
            drawLandmarks  = du.drawLandmarks;
          }
        }

        if (cleanedUp) return;

        // locateFile: try local first, if file 404s MediaPipe falls back to CDN
        const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404';
        const pose = new PoseClass({
          locateFile: (file) => {
            // Always serve from CDN — most reliable in production
            return `${CDN_BASE}/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 0,        // LITE model — 3× faster init, still accurate enough for gym exercises
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.45,
          minTrackingConfidence: 0.35,
        });

        pose.onResults((results) => {
          if (!isActiveRef.current) return;

          const canvas = canvasRef.current;
          const video  = videoRef.current;
          if (!canvas || !video) return;

          // Sync canvas size to video resolution
          const vw = video.videoWidth  || 640;
          const vh = video.videoHeight || 480;
          if (canvas.width !== vw)  canvas.width  = vw;
          if (canvas.height !== vh) canvas.height = vh;

          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            // Mirror landmarks horizontally for front cam so skeleton aligns
            // with the CSS-flipped video element
            const landmarks = facingModeRef.current === 'user'
              ? results.poseLandmarks.map(lm => ({ ...lm, x: 1 - lm.x }))
              : results.poseLandmarks;

            // Draw skeleton bones — visibilityMin:0 forces all joints to render
            drawConnectors(ctx, landmarks, POSE_CONNECTIONS, {
              color: 'rgba(200,255,0,0.75)',
              lineWidth: 3,
              visibilityMin: 0,
            });

            // Draw joint dots (body only — hide face landmarks 0–10)
            const bodyLandmarks = landmarks.map((lm, i) =>
              i >= 11 ? lm : { ...lm, visibility: -1 }
            );
            drawLandmarks(ctx, bodyLandmarks, {
              color: '#C8FF00',
              fillColor: 'rgba(200,255,0,0.55)',
              lineWidth: 1,
              visibilityMin: 0,
              radius: (data) => {
                const idx = data.index;
                if ([11,12,23,24].includes(idx)) return 7;
                if ([13,14,25,26].includes(idx)) return 6;
                if ([15,16,27,28].includes(idx)) return 5;
                return 3;
              },
            });

            // Always use original (unmirrored) landmarks for form analysis
            const exerciseId = exerciseIdRef.current || 'pushup';
            const analysis = analyzeFormRef.current(results.poseLandmarks, exerciseId);

            // 3-frame smoothing
            scoreHistoryRef.current.push(analysis.score);
            if (scoreHistoryRef.current.length > 3) scoreHistoryRef.current.shift();
            const avgScore = Math.round(
              scoreHistoryRef.current.reduce((a, b) => a + b, 0) / scoreHistoryRef.current.length
            );

            setScore(avgScore);
            setFeedback(analysis.feedback);
            setRepCount(repStateRef.current.count);
            if (analysis.side) setActiveSide(analysis.side);
          }
        });

        poseRef.current = pose;

        if (cleanedUp || !videoRef.current) return;

        // Video already streaming from STEP 2 above.
        // Wait until videoWidth > 0 so MediaPipe gets real frames.
        let waitTries = 0;
        while ((!videoRef.current?.videoWidth || videoRef.current.videoWidth === 0) && waitTries < 50) {
          await new Promise(r => setTimeout(r, 100));
          waitTries++;
        }

        if (cleanedUp) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        // ── FRAME LOOP — feeds frames to MediaPipe at ~30fps ─────────────
        // Using setInterval instead of async RAF to avoid frame queue overflow.
        // RAF with async/await can send 60+ frames/s before MediaPipe processes
        // them, causing the results callback to never fire.
        let frameInterval;
        let isSending = false; // guard: don't queue multiple sends

        const sendFrame = () => {
          if (!isActiveRef.current || cleanedUp || isSending) return;
          const vid = videoRef.current;
          const p   = poseRef.current;
          if (!vid || vid.readyState < 2 || !p) return;

          isSending = true;
          p.send({ image: vid })
            .catch(() => {})
            .finally(() => { isSending = false; });
        };

        // Store interval handle for cleanup
        cameraRef.current = {
          stop: () => {
            clearInterval(frameInterval);
            stream.getTracks().forEach(t => t.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
          },
        };

        // Start at 30fps — MediaPipe processes ~15-20fps on mobile anyway
        frameInterval = setInterval(sendFrame, 1000 / 30);
        if (!cleanedUp) setIsReady(true);

      } catch (err) {
        console.error('Pose init error:', err);
        if (!cleanedUp) setFeedback('Camera error — check permissions');
        setIsReady(false);
      }
    };

    initPose();

    return () => {
      cleanedUp = true;
      isActiveRef.current = false;
      try { cameraRef.current?.stop(); } catch (e) {}
      try { poseRef.current?.close(); } catch (e) {}
      poseRef.current   = null;
      cameraRef.current = null;
    };
  }, [enabled, facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reset function ─────────────────────────────────────────────────────
  const resetRepCount = useCallback(() => {
    repStateRef.current = { phase: 'ready', count: 0, lastTime: 0 };
    activeSideRef.current = 'left';
    scoreHistoryRef.current = [];
    setRepCount(0);
    setScore(0);
    setActiveSide('left');
    setFeedback('Get in position...');
  }, []);

  return { isReady, score, feedback, repCount, activeSide, resetRepCount };
}