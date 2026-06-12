import { useEffect, useRef, useState, useCallback } from 'react';

const POSE_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],
  [9,10],[11,12],[11,13],[13,15],[15,17],[15,19],[15,21],
  [17,19],[12,14],[14,16],[16,18],[16,20],[16,22],[18,20],
  [11,23],[12,24],[23,24],[23,25],[25,27],[27,29],[27,31],
  [29,31],[24,26],[26,28],[28,30],[28,32],[30,32]
];

export function usePoseDetection(videoRef, canvasRef, enabled) {
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [repCount, setRepCount] = useState(0);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const repStateRef = useRef({ phase: 'ready', count: 0, lastTime: 0 });
  const scoreHistoryRef = useRef([]);
  const isActiveRef = useRef(true);

  const calculateAngle = useCallback((a, b, c) => {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  }, []);

  // ── Rep counting helper ────────────────────────────────────────────────────
  const countRep = useCallback((condition, resetCondition, debounce) => {
    const now = Date.now();
    const phase = repStateRef.current.phase;
    if (condition && phase === 'up' && now - repStateRef.current.lastTime > debounce) {
      repStateRef.current.phase = 'down';
    } else if (resetCondition && phase === 'down') {
      repStateRef.current.phase = 'up';
      repStateRef.current.count += 1;
      repStateRef.current.lastTime = now;
    } else if (phase === 'ready' && resetCondition) {
      repStateRef.current.phase = 'up';
    }
  }, []);

  const analyzeForm = useCallback((landmarks, exerciseId) => {
    if (!landmarks || !landmarks.length) return { score: 0, feedback: 'No pose detected' };

    let formScore = 0;
    let feedbackText = 'Get in position...';
    const lm = landmarks;
    const sl = (idx) => lm[idx] || { x: 0, y: 0, visibility: 0 };

    // ── PUSH-UP GROUP ────────────────────────────────────────────────────────
    if (['pushup', 'incline-pushup', 'decline-pushup', 'diamond-pushup', 'wide-pushup'].includes(exerciseId)) {
      const shoulder = sl(11);
      const hip = sl(23);
      const ankle = sl(27);
      const elbow = sl(13);
      const wrist = sl(15);
      const bodyAngle = calculateAngle(shoulder, hip, ankle);
      const elbowAngle = calculateAngle(shoulder, elbow, wrist);
      const bodyStraight = Math.abs(bodyAngle - 180) < 15;
      if (bodyStraight && elbowAngle < 90) { formScore = 95; feedbackText = 'Perfect form!'; }
      else if (bodyStraight && elbowAngle < 120) { formScore = 75; feedbackText = 'Go deeper'; }
      else if (!bodyStraight) { formScore = 60; feedbackText = 'Keep body straight'; }
      else { formScore = 50; feedbackText = 'Check form'; }
      countRep(elbowAngle < 90, elbowAngle > 160, 500);
    }

    // ── SQUAT ────────────────────────────────────────────────────────────────
    else if (exerciseId === 'squat') {
      const hip = sl(23);
      const knee = sl(25);
      const ankle = sl(27);
      const shoulder = sl(11);
      const kneeAngle = calculateAngle(hip, knee, ankle);
      const torsoAngle = calculateAngle(shoulder, hip, knee);
      const kneeForward = Math.abs(knee.x - ankle.x);
      if (kneeAngle < 90 && torsoAngle > 60 && kneeForward < 0.15) { formScore = 95; feedbackText = 'Deep squat!'; }
      else if (kneeAngle < 120 && torsoAngle > 60) { formScore = 80; feedbackText = 'Go deeper'; }
      else if (torsoAngle <= 60) { formScore = 65; feedbackText = 'Chest up'; }
      else if (kneeForward >= 0.15) { formScore = 70; feedbackText = 'Knees over toes'; }
      else { formScore = 60; feedbackText = 'Keep form'; }
      countRep(kneeAngle < 90, kneeAngle > 160, 600);
    }

    // ── BICEP CURL / HAMMER / CONCENTRATION ─────────────────────────────────
    else if (['bicep-curl', 'hammer-curl', 'concentration-curl'].includes(exerciseId)) {
      const shoulder = sl(11);
      const elbow = sl(13);
      const wrist = sl(15);
      const curlAngle = calculateAngle(shoulder, elbow, wrist);
      const elbowHeight = Math.abs(elbow.y - shoulder.y);
      const elbowStable = elbowHeight < 0.1;
      if (curlAngle < 45 && elbowStable) { formScore = 95; feedbackText = 'Peak contraction!'; }
      else if (curlAngle < 90 && elbowStable) { formScore = 80; feedbackText = 'Squeeze bicep'; }
      else if (!elbowStable) { formScore = 65; feedbackText = 'Keep elbow still'; }
      else { formScore = 55; feedbackText = 'Curl higher'; }
      // inverted: down = arm extended, up = arm curled
      const now = Date.now();
      if (curlAngle < 45 && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 500) {
        repStateRef.current.phase = 'up';
      } else if (curlAngle > 140 && repStateRef.current.phase === 'up') {
        repStateRef.current.phase = 'down';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now;
      } else if (repStateRef.current.phase === 'ready' && curlAngle > 140) {
        repStateRef.current.phase = 'down';
      }
    }

    // ── LATERAL RAISE / FRONT RAISE ──────────────────────────────────────────
    else if (['lateral-raise', 'front-raise'].includes(exerciseId)) {
      const shoulder = sl(11);
      const elbow = sl(13);
      const wrist = sl(15);
      const armHeight = shoulder.y - wrist.y;
      const armStraight = calculateAngle(shoulder, elbow, wrist) > 150;
      if (armHeight > 0.15 && armStraight) { formScore = 95; feedbackText = 'Perfect raise!'; }
      else if (armHeight > 0.08 && armStraight) { formScore = 80; feedbackText = 'Raise higher'; }
      else if (!armStraight) { formScore = 70; feedbackText = 'Keep arm straight'; }
      else { formScore = 60; feedbackText = 'Control movement'; }
      const now2 = Date.now();
      if (armHeight > 0.15 && repStateRef.current.phase === 'down' && now2 - repStateRef.current.lastTime > 600) {
        repStateRef.current.phase = 'up';
      } else if (armHeight < 0.02 && repStateRef.current.phase === 'up') {
        repStateRef.current.phase = 'down';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now2;
      } else if (repStateRef.current.phase === 'ready' && armHeight < 0.02) {
        repStateRef.current.phase = 'down';
      }
    }

    // ── PIKE PUSH-UP ─────────────────────────────────────────────────────────
    else if (exerciseId === 'pike-pushup') {
      const shoulder = sl(11);
      const elbow = sl(13);
      const wrist = sl(15);
      const hip = sl(23);
      const elbowAngle = calculateAngle(shoulder, elbow, wrist);
      const hipsElevated = hip.y < shoulder.y - 0.1;
      if (hipsElevated && elbowAngle < 90) { formScore = 95; feedbackText = 'Perfect pike!'; }
      else if (hipsElevated && elbowAngle < 120) { formScore = 78; feedbackText = 'Lower your head'; }
      else if (!hipsElevated) { formScore = 60; feedbackText = 'Raise hips higher'; }
      else { formScore = 55; feedbackText = 'Check form'; }
      countRep(elbowAngle < 90, elbowAngle > 155, 500);
    }

    // ── DIPS ─────────────────────────────────────────────────────────────────
    else if (['dip', 'bench-dip'].includes(exerciseId)) {
      const shoulder = sl(11);
      const elbow = sl(13);
      const wrist = sl(15);
      const elbowAngle = calculateAngle(shoulder, elbow, wrist);
      const shoulderBelowElbow = elbow.y - shoulder.y > 0.05;
      if (shoulderBelowElbow && elbowAngle < 95) { formScore = 95; feedbackText = 'Full depth!'; }
      else if (elbowAngle < 110) { formScore = 78; feedbackText = 'Go deeper'; }
      else { formScore = 60; feedbackText = 'Lower more'; }
      countRep(elbowAngle < 95, elbowAngle > 155, 500);
    }

    // ── PULL-UP / CHIN-UP ────────────────────────────────────────────────────
    else if (['pullup', 'chinup'].includes(exerciseId)) {
      const shoulder = sl(11);
      const elbow = sl(13);
      const wrist = sl(15);
      const elbowAngle = calculateAngle(shoulder, elbow, wrist);
      const chinAboveBar = sl(0).y < wrist.y;
      if (chinAboveBar && elbowAngle < 60) { formScore = 95; feedbackText = 'Chin over bar!'; }
      else if (elbowAngle < 90) { formScore = 80; feedbackText = 'Almost there!'; }
      else if (elbowAngle > 160) { formScore = 70; feedbackText = 'Pull up!'; }
      else { formScore = 60; feedbackText = 'Full hang first'; }
      const now3 = Date.now();
      if (elbowAngle < 70 && repStateRef.current.phase === 'down' && now3 - repStateRef.current.lastTime > 600) {
        repStateRef.current.phase = 'up';
      } else if (elbowAngle > 155 && repStateRef.current.phase === 'up') {
        repStateRef.current.phase = 'down';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now3;
      } else if (repStateRef.current.phase === 'ready' && elbowAngle > 155) {
        repStateRef.current.phase = 'down';
      }
    }

    // ── BODYWEIGHT ROW ───────────────────────────────────────────────────────
    else if (exerciseId === 'bodyweight-row') {
      const shoulder = sl(11);
      const elbow = sl(13);
      const wrist = sl(15);
      const elbowAngle = calculateAngle(shoulder, elbow, wrist);
      const pulled = shoulder.y - wrist.y > 0.05 && elbowAngle < 90;
      if (pulled) { formScore = 95; feedbackText = 'Chest to bar!'; }
      else if (elbowAngle < 120) { formScore = 78; feedbackText = 'Pull higher'; }
      else { formScore = 60; feedbackText = 'Keep body straight'; }
      const now4 = Date.now();
      if (elbowAngle < 90 && repStateRef.current.phase === 'down' && now4 - repStateRef.current.lastTime > 500) {
        repStateRef.current.phase = 'up';
      } else if (elbowAngle > 155 && repStateRef.current.phase === 'up') {
        repStateRef.current.phase = 'down';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now4;
      } else if (repStateRef.current.phase === 'ready' && elbowAngle > 155) {
        repStateRef.current.phase = 'down';
      }
    }

    // ── LUNGE ────────────────────────────────────────────────────────────────
    else if (exerciseId === 'lunge') {
      const hip = sl(23);
      const knee = sl(25);
      const ankle = sl(27);
      const shoulder = sl(11);
      const kneeAngle = calculateAngle(hip, knee, ankle);
      const upright = calculateAngle(shoulder, hip, knee) > 70;
      if (kneeAngle < 100 && upright) { formScore = 95; feedbackText = 'Deep lunge!'; }
      else if (kneeAngle < 120 && upright) { formScore = 80; feedbackText = 'Go lower'; }
      else if (!upright) { formScore = 65; feedbackText = 'Keep torso upright'; }
      else { formScore = 60; feedbackText = 'Deeper lunge'; }
      countRep(kneeAngle < 100, kneeAngle > 155, 600);
    }

    // ── GLUTE BRIDGE ─────────────────────────────────────────────────────────
    else if (exerciseId === 'glute-bridge') {
      const shoulder = sl(11);
      const hip = sl(23);
      const knee = sl(25);
      const hipAngle = calculateAngle(shoulder, hip, knee);
      const hipHeight = shoulder.y - hip.y;
      const goodBridge = hipHeight > 0.08 && hipAngle > 150;
      if (goodBridge) { formScore = 95; feedbackText = 'Squeeze glutes!'; }
      else if (hipHeight > 0.03) { formScore = 78; feedbackText = 'Hips higher'; }
      else { formScore = 60; feedbackText = 'Drive hips up'; }
      const now5 = Date.now();
      if (goodBridge && repStateRef.current.phase === 'down' && now5 - repStateRef.current.lastTime > 500) {
        repStateRef.current.phase = 'up';
      } else if (hipHeight < 0.01 && repStateRef.current.phase === 'up') {
        repStateRef.current.phase = 'down';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now5;
      } else if (repStateRef.current.phase === 'ready' && hipHeight < 0.01) {
        repStateRef.current.phase = 'down';
      }
    }

    // ── PLANK ────────────────────────────────────────────────────────────────
    else if (exerciseId === 'plank') {
      const shoulder = sl(11);
      const hip = sl(23);
      const ankle = sl(27);
      const bodyAngle = calculateAngle(shoulder, hip, ankle);
      const hipSag = Math.abs(hip.y - (shoulder.y + ankle.y) / 2);
      const straight = Math.abs(bodyAngle - 180) < 10;
      if (straight && hipSag < 0.05) { formScore = 95; feedbackText = 'Solid plank!'; }
      else if (straight) { formScore = 80; feedbackText = 'Hips sagging'; }
      else { formScore = 65; feedbackText = 'Straighten body'; }
    }

    // ── HOLLOW BODY ──────────────────────────────────────────────────────────
    else if (exerciseId === 'hollow-body') {
      const shoulder = sl(11);
      const hip = sl(23);
      const ankle = sl(27);
      const backContact = Math.abs(hip.y - (shoulder.y + ankle.y) / 2);
      const shoulderLift = hip.y - shoulder.y;
      if (shoulderLift > 0.05 && backContact < 0.08) { formScore = 95; feedbackText = 'Solid hollow!'; }
      else if (shoulderLift > 0.02) { formScore = 75; feedbackText = 'Lower back to floor'; }
      else { formScore = 60; feedbackText = 'Lift shoulders & legs'; }
    }

    // ── DEAD HANG ────────────────────────────────────────────────────────────
    else if (exerciseId === 'dead-hang') {
      const shoulder = sl(11);
      const elbow = sl(13);
      const wrist = sl(15);
      const elbowAngle = calculateAngle(shoulder, elbow, wrist);
      const engaged = shoulder.y < wrist.y - 0.1;
      if (elbowAngle > 155 && engaged) { formScore = 95; feedbackText = 'Perfect hang!'; }
      else if (elbowAngle > 140) { formScore = 80; feedbackText = 'Engage shoulders'; }
      else { formScore = 60; feedbackText = 'Straighten arms'; }
    }

    // ── SUPERMAN ─────────────────────────────────────────────────────────────
    else if (exerciseId === 'superman') {
      const shoulder = sl(11);
      const hip = sl(23);
      const liftHeight = hip.y - shoulder.y;
      if (liftHeight > 0.1) { formScore = 95; feedbackText = 'Great extension!'; }
      else if (liftHeight > 0.05) { formScore = 78; feedbackText = 'Lift higher'; }
      else { formScore = 60; feedbackText = 'Lift arms and legs'; }
      countRep(liftHeight > 0.1, liftHeight < 0.02, 800);
    }

    // ── CRUNCH ───────────────────────────────────────────────────────────────
    else if (exerciseId === 'crunch') {
      const shoulder = sl(11);
      const hip = sl(23);
      const crunchDepth = hip.y - shoulder.y;
      if (crunchDepth > 0.12) { formScore = 95; feedbackText = 'Squeeze at top!'; }
      else if (crunchDepth > 0.06) { formScore = 78; feedbackText = 'Crunch higher'; }
      else { formScore = 60; feedbackText = 'Lift shoulders'; }
      const now6 = Date.now();
      if (crunchDepth > 0.12 && repStateRef.current.phase === 'down' && now6 - repStateRef.current.lastTime > 400) {
        repStateRef.current.phase = 'up';
      } else if (crunchDepth < 0.02 && repStateRef.current.phase === 'up') {
        repStateRef.current.phase = 'down';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now6;
      } else if (repStateRef.current.phase === 'ready' && crunchDepth < 0.02) {
        repStateRef.current.phase = 'down';
      }
    }

    // ── LEG RAISE ────────────────────────────────────────────────────────────
    else if (exerciseId === 'leg-raise') {
      const hip = sl(23);
      const ankle = sl(27);
      const legsUp = hip.y - ankle.y;
      if (legsUp > 0.2) { formScore = 95; feedbackText = 'Legs vertical!'; }
      else if (legsUp > 0.1) { formScore = 78; feedbackText = 'Raise legs higher'; }
      else { formScore = 60; feedbackText = 'Keep legs straight'; }
      const now7 = Date.now();
      if (legsUp > 0.2 && repStateRef.current.phase === 'down' && now7 - repStateRef.current.lastTime > 500) {
        repStateRef.current.phase = 'up';
      } else if (legsUp < 0.02 && repStateRef.current.phase === 'up') {
        repStateRef.current.phase = 'down';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now7;
      } else if (repStateRef.current.phase === 'ready' && legsUp < 0.02) {
        repStateRef.current.phase = 'down';
      }
    }

    // ── MOUNTAIN CLIMBER ─────────────────────────────────────────────────────
    else if (exerciseId === 'mountain-climber') {
      const shoulder = sl(11);
      const hip = sl(23);
      const leftKnee = sl(25);
      const rightKnee = sl(26);
      const hipLevel = Math.abs(hip.y - (shoulder.y + 0.15)) < 0.08;
      const kneeForward = Math.min(shoulder.x - leftKnee.x, shoulder.x - rightKnee.x);
      if (hipLevel && kneeForward > 0.05) { formScore = 95; feedbackText = 'Drive that knee!'; }
      else if (hipLevel) { formScore = 78; feedbackText = 'Drive knees to chest'; }
      else { formScore = 65; feedbackText = 'Keep hips level'; }
      const now8 = Date.now();
      if (kneeForward > 0.05 && repStateRef.current.phase === 'ready' && now8 - repStateRef.current.lastTime > 300) {
        repStateRef.current.phase = 'up';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now8;
      }
    }

    // ── TRICEP EXTENSION ─────────────────────────────────────────────────────
    else if (exerciseId === 'tricep-extension') {
      const shoulder = sl(11);
      const elbow = sl(13);
      const wrist = sl(15);
      const elbowAngle = calculateAngle(shoulder, elbow, wrist);
      const elbowUp = Math.abs(elbow.x - shoulder.x) < 0.08;
      if (elbowAngle > 155 && elbowUp) { formScore = 95; feedbackText = 'Full extension!'; }
      else if (elbowAngle > 130) { formScore = 78; feedbackText = 'Extend fully'; }
      else if (!elbowUp) { formScore = 65; feedbackText = 'Keep elbow up'; }
      else { formScore = 60; feedbackText = 'Lower the weight'; }
      countRep(elbowAngle < 60, elbowAngle > 155, 500);
    }

    // ── RUSSIAN TWIST ────────────────────────────────────────────────────────
    else if (exerciseId === 'russian-twist') {
      const leftShoulder = sl(11);
      const rightShoulder = sl(12);
      const leftWrist = sl(15);
      const rightWrist = sl(16);
      const wristMid = (leftWrist.x + rightWrist.x) / 2;
      const shoulderMid = (leftShoulder.x + rightShoulder.x) / 2;
      const rotation = Math.abs(wristMid - shoulderMid);
      if (rotation > 0.15) { formScore = 95; feedbackText = 'Full rotation!'; }
      else if (rotation > 0.08) { formScore = 78; feedbackText = 'Rotate more'; }
      else { formScore = 60; feedbackText = 'Twist side to side'; }
      const now9 = Date.now();
      if (rotation > 0.15 && repStateRef.current.phase === 'ready' && now9 - repStateRef.current.lastTime > 400) {
        repStateRef.current.phase = 'up';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now9;
      } else if (rotation < 0.03) {
        repStateRef.current.phase = 'ready';
      }
    }

    // ── JUMP SQUAT ───────────────────────────────────────────────────────────
    else if (exerciseId === 'jump-squat') {
      const hip = sl(23);
      const knee = sl(25);
      const ankle = sl(27);
      const shoulder = sl(11);
      const kneeAngle = calculateAngle(hip, knee, ankle);
      const upright = calculateAngle(shoulder, hip, knee) > 60;
      if (kneeAngle < 90 && upright) { formScore = 95; feedbackText = 'Explode up!'; }
      else if (kneeAngle < 120) { formScore = 78; feedbackText = 'Squat deeper'; }
      else { formScore = 60; feedbackText = 'Squat then jump'; }
      countRep(kneeAngle < 90, kneeAngle > 155, 600);
    }

    // ── PISTOL SQUAT ─────────────────────────────────────────────────────────
    else if (exerciseId === 'single-leg-squat') {
      const hip = sl(23);
      const knee = sl(25);
      const ankle = sl(27);
      const shoulder = sl(11);
      const kneeAngle = calculateAngle(hip, knee, ankle);
      const balanced = Math.abs(shoulder.x - hip.x) < 0.12;
      if (kneeAngle < 100 && balanced) { formScore = 95; feedbackText = 'Pistol depth!'; }
      else if (kneeAngle < 130) { formScore = 78; feedbackText = 'Go lower'; }
      else if (!balanced) { formScore = 65; feedbackText = 'Stay balanced'; }
      else { formScore = 60; feedbackText = 'Control descent'; }
      countRep(kneeAngle < 100, kneeAngle > 155, 800);
    }

    // ── CALF RAISE ───────────────────────────────────────────────────────────
    else if (exerciseId === 'calf-raise') {
      const knee = sl(25);
      const ankle = sl(27);
      const foot = sl(31);
      const ankleAngle = calculateAngle(knee, ankle, foot);
      if (ankleAngle < 80) { formScore = 95; feedbackText = 'Full rise!'; }
      else if (ankleAngle < 100) { formScore = 78; feedbackText = 'Rise higher'; }
      else { formScore = 60; feedbackText = 'Push up on toes'; }
      const now10 = Date.now();
      if (ankleAngle < 80 && repStateRef.current.phase === 'down' && now10 - repStateRef.current.lastTime > 400) {
        repStateRef.current.phase = 'up';
      } else if (ankleAngle > 100 && repStateRef.current.phase === 'up') {
        repStateRef.current.phase = 'down';
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now10;
      } else if (repStateRef.current.phase === 'ready' && ankleAngle > 100) {
        repStateRef.current.phase = 'down';
      }
    }

    // ── SHOULDER TAP ─────────────────────────────────────────────────────────
    else if (exerciseId === 'shoulder-tap') {
      const leftShoulder = sl(11);
      const rightShoulder = sl(12);
      const leftWrist = sl(15);
      const rightWrist = sl(16);
      const hip = sl(23);
      const hipSway = Math.abs(hip.x - (leftShoulder.x + rightShoulder.x) / 2);
      const tapDetect = Math.abs(leftWrist.x - rightShoulder.x) < 0.08 || Math.abs(rightWrist.x - leftShoulder.x) < 0.08;
      if (tapDetect && hipSway < 0.08) { formScore = 95; feedbackText = 'Stable tap!'; }
      else if (tapDetect) { formScore = 75; feedbackText = 'Control hip sway'; }
      else { formScore = 60; feedbackText = 'Tap opposite shoulder'; }
      const now11 = Date.now();
      if (tapDetect && now11 - repStateRef.current.lastTime > 400) {
        repStateRef.current.count += 1;
        repStateRef.current.lastTime = now11;
      }
    }

    // ── DEFAULT (generic posture check) ──────────────────────────────────────
    else {
      const leftShoulder = sl(11);
      const rightShoulder = sl(12);
      const leftHip = sl(23);
      const rightHip = sl(24);
      const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y) < 0.05;
      const hipLevel = Math.abs(leftHip.y - rightHip.y) < 0.05;
      if (shoulderLevel && hipLevel) { formScore = 85; feedbackText = 'Good posture'; }
      else { formScore = 70; feedbackText = 'Balance your stance'; }
    }

    return { score: formScore, feedback: feedbackText };
  }, [calculateAngle, countRep]);

  useEffect(() => {
    if (!enabled || !videoRef.current) {
      setIsReady(false);
      return;
    }

    isActiveRef.current = true;

    const initPose = async () => {
      try {
        const { Pose } = await import('@mediapipe/pose');
        const { Camera } = await import('@mediapipe/camera_utils');
        const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');

        const pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
          if (!isActiveRef.current) return;

          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (!canvas || !video || !video.videoWidth) return;

          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
              color: 'rgba(0,255,136,0.6)',
              lineWidth: 2
            });
            drawLandmarks(ctx, results.poseLandmarks, {
              color: '#00FF88',
              lineWidth: 1,
              radius: 3
            });

            const exerciseId = window.currentExerciseId || 'pushup';
            const analysis = analyzeForm(results.poseLandmarks, exerciseId);

            scoreHistoryRef.current.push(analysis.score);
            if (scoreHistoryRef.current.length > 10) scoreHistoryRef.current.shift();
            const avgScore = Math.round(
              scoreHistoryRef.current.reduce((a, b) => a + b, 0) / scoreHistoryRef.current.length
            );

            setScore(avgScore);
            setFeedback(analysis.feedback);
            setRepCount(repStateRef.current.count);
          }
        });

        poseRef.current = pose;

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (isActiveRef.current && poseRef.current && videoRef.current) {
              try {
                await poseRef.current.send({ image: videoRef.current });
              } catch (e) {
                // silent fail on frame errors
              }
            }
          },
          width: 640,
          height: 480
        });

        cameraRef.current = camera;
        await camera.start();
        setIsReady(true);
      } catch (err) {
        console.error('Pose init error:', err);
        setFeedback('Camera error. Check permissions.');
        setIsReady(false);
      }
    };

    initPose();

    return () => {
      isActiveRef.current = false;
      if (cameraRef.current) {
        try { cameraRef.current.stop(); } catch (e) { /* ignore */ }
      }
      if (poseRef.current) {
        try { poseRef.current.close(); } catch (e) { /* ignore */ }
      }
    };
  }, [enabled, videoRef, canvasRef, analyzeForm]);

  const resetRepCount = useCallback(() => {
    repStateRef.current = { phase: 'ready', count: 0, lastTime: 0 };
    setRepCount(0);
    scoreHistoryRef.current = [];
    setScore(0);
    setFeedback('Get in position...');
  }, []);

  return { isReady, score, feedback, repCount, resetRepCount };
}
