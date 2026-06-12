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

  const analyzeForm = useCallback((landmarks, exerciseId) => {
    if (!landmarks || !landmarks.length) return { score: 0, feedback: 'No pose detected' };
    
    let formScore = 0;
    let feedbackText = 'Get in position...';
    const lm = landmarks;

    const safeLm = (idx) => lm[idx] || { x: 0, y: 0, visibility: 0 };

    switch(exerciseId) {
      case 'pushup':
      case 'incline-pushup': {
        const shoulder = safeLm(11);
        const hip = safeLm(23);
        const ankle = safeLm(27);
        const elbow = safeLm(13);
        const wrist = safeLm(15);
        
        const bodyAngle = calculateAngle(shoulder, hip, ankle);
        const elbowAngle = calculateAngle(shoulder, elbow, wrist);
        
        const bodyStraight = Math.abs(bodyAngle - 180) < 15;
        const goodDepth = elbowAngle < 90;
        const partialDepth = elbowAngle < 120;
        
        if (bodyStraight && goodDepth) { formScore = 95; feedbackText = 'Perfect form'; }
        else if (bodyStraight && partialDepth) { formScore = 75; feedbackText = 'Go deeper'; }
        else if (!bodyStraight) { formScore = 60; feedbackText = 'Keep body straight'; }
        else { formScore = 50; feedbackText = 'Check form'; }
        
        const now = Date.now();
        if (elbowAngle < 90 && repStateRef.current.phase === 'up' && now - repStateRef.current.lastTime > 500) {
          repStateRef.current.phase = 'down';
        } else if (elbowAngle > 160 && repStateRef.current.phase === 'down') {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && elbowAngle > 160) {
          repStateRef.current.phase = 'up';
        }
        break;
      }
      
      case 'squat': {
        const hip = safeLm(23);
        const knee = safeLm(25);
        const ankle = safeLm(27);
        const shoulder = safeLm(11);
        
        const kneeAngle = calculateAngle(hip, knee, ankle);
        const torsoAngle = calculateAngle(shoulder, hip, knee);
        const kneeForward = knee.x - ankle.x;
        
        const goodDepth = kneeAngle < 90;
        const partialDepth = kneeAngle < 120;
        const upright = torsoAngle > 60;
        const kneesOk = Math.abs(kneeForward) < 0.15;
        
        if (goodDepth && upright && kneesOk) { formScore = 95; feedbackText = 'Deep squat'; }
        else if (partialDepth && upright) { formScore = 80; feedbackText = 'Go deeper'; }
        else if (!upright) { formScore = 65; feedbackText = 'Chest up'; }
        else if (!kneesOk) { formScore = 70; feedbackText = 'Knees over toes'; }
        else { formScore = 60; feedbackText = 'Keep form'; }
        
        const now = Date.now();
        if (kneeAngle < 90 && repStateRef.current.phase === 'up' && now - repStateRef.current.lastTime > 600) {
          repStateRef.current.phase = 'down';
        } else if (kneeAngle > 160 && repStateRef.current.phase === 'down') {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && kneeAngle > 160) {
          repStateRef.current.phase = 'up';
        }
        break;
      }
      
      case 'bicep-curl':
      case 'hammer-curl': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);
        
        const curlAngle = calculateAngle(shoulder, elbow, wrist);
        const elbowHeight = elbow.y - shoulder.y;
        
        const fullCurl = curlAngle < 45;
        const goodCurl = curlAngle < 90;
        const elbowStable = Math.abs(elbowHeight) < 0.1;
        
        if (fullCurl && elbowStable) { formScore = 95; feedbackText = 'Peak contraction'; }
        else if (goodCurl && elbowStable) { formScore = 80; feedbackText = 'Squeeze bicep'; }
        else if (!elbowStable) { formScore = 65; feedbackText = 'Keep elbow still'; }
        else { formScore = 55; feedbackText = 'Curl higher'; }
        
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
        break;
      }
      
      case 'lateral-raise': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);
        
        const raiseAngle = calculateAngle(shoulder, elbow, wrist);
        const armHeight = shoulder.y - wrist.y;
        
        const goodHeight = armHeight > 0.15;
        const partialHeight = armHeight > 0.08;
        const goodForm = raiseAngle > 150;
        
        if (goodHeight && goodForm) { formScore = 95; feedbackText = 'Perfect raise'; }
        else if (partialHeight && goodForm) { formScore = 80; feedbackText = 'Raise higher'; }
        else if (!goodForm) { formScore = 70; feedbackText = 'Keep arm straight'; }
        else { formScore = 60; feedbackText = 'Control movement'; }
        
        const now = Date.now();
        if (armHeight > 0.15 && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 600) {
          repStateRef.current.phase = 'up';
        } else if (armHeight < 0.02 && repStateRef.current.phase === 'up') {
          repStateRef.current.phase = 'down';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && armHeight < 0.02) {
          repStateRef.current.phase = 'down';
        }
        break;
      }
      
      case 'pike-pushup': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);
        const hip = safeLm(23);

        const elbowAngle = calculateAngle(shoulder, elbow, wrist);
        const hipAngle = calculateAngle(shoulder, hip, safeLm(27));

        const goodHip = hip.y < shoulder.y - 0.1; // hips elevated
        const goodDepth = elbowAngle < 90;
        const partialDepth = elbowAngle < 120;

        if (goodHip && goodDepth) { formScore = 95; feedbackText = 'Perfect pike!'; }
        else if (goodHip && partialDepth) { formScore = 78; feedbackText = 'Lower your head more'; }
        else if (!goodHip) { formScore = 60; feedbackText = 'Raise your hips higher'; }
        else { formScore = 55; feedbackText = 'Check your form'; }

        const now = Date.now();
        if (elbowAngle < 90 && repStateRef.current.phase === 'up' && now - repStateRef.current.lastTime > 500) {
          repStateRef.current.phase = 'down';
        } else if (elbowAngle > 155 && repStateRef.current.phase === 'down') {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && elbowAngle > 155) {
          repStateRef.current.phase = 'up';
        }
        break;
      }

      case 'dip':
      case 'bench-dip': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);

        const elbowAngle = calculateAngle(shoulder, elbow, wrist);
        const shoulderDepth = elbow.y - shoulder.y;

        const goodDepth = shoulderDepth > 0.05; // shoulder below elbow level
        const partialDepth = elbowAngle < 110;

        if (goodDepth && elbowAngle < 95) { formScore = 95; feedbackText = 'Full depth!'; }
        else if (partialDepth) { formScore = 78; feedbackText = 'Go deeper'; }
        else { formScore = 60; feedbackText = 'Lower more'; }

        const now = Date.now();
        if (elbowAngle < 95 && repStateRef.current.phase === 'up' && now - repStateRef.current.lastTime > 500) {
          repStateRef.current.phase = 'down';
        } else if (elbowAngle > 155 && repStateRef.current.phase === 'down') {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && elbowAngle > 155) {
          repStateRef.current.phase = 'up';
        }
        break;
      }

      case 'pullup':
      case 'chinup': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);

        const elbowAngle = calculateAngle(shoulder, elbow, wrist);
        const chinHeight = safeLm(0).y; // nose as proxy for chin
        const wristHeight = wrist.y;

        const chinOverBar = chinHeight < wristHeight;
        const fullHang = elbowAngle > 160;

        if (chinOverBar && elbowAngle < 60) { formScore = 95; feedbackText = 'Chin over bar!'; }
        else if (elbowAngle < 90) { formScore = 80; feedbackText = 'Almost there!'; }
        else if (fullHang) { formScore = 70; feedbackText = 'Pull up!'; }
        else { formScore = 60; feedbackText = 'Full hang first'; }

        const now = Date.now();
        if (elbowAngle < 70 && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 600) {
          repStateRef.current.phase = 'up';
        } else if (elbowAngle > 155 && repStateRef.current.phase === 'up') {
          repStateRef.current.phase = 'down';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && elbowAngle > 155) {
          repStateRef.current.phase = 'down';
        }
        break;
      }

      case 'bodyweight-row': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);

        const elbowAngle = calculateAngle(shoulder, elbow, wrist);
        const pullDepth = shoulder.y - wrist.y; // positive = pulled up

        const goodPull = pullDepth > 0.05 && elbowAngle < 90;
        const partialPull = elbowAngle < 120;

        if (goodPull) { formScore = 95; feedbackText = 'Chest to bar!'; }
        else if (partialPull) { formScore = 78; feedbackText = 'Pull higher'; }
        else { formScore = 60; feedbackText = 'Keep body straight'; }

        const now = Date.now();
        if (elbowAngle < 90 && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 500) {
          repStateRef.current.phase = 'up';
        } else if (elbowAngle > 155 && repStateRef.current.phase === 'up') {
          repStateRef.current.phase = 'down';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && elbowAngle > 155) {
          repStateRef.current.phase = 'down';
        }
        break;
      }

      case 'lunge': {
        const hip = safeLm(23);
        const knee = safeLm(25);
        const ankle = safeLm(27);
        const shoulder = safeLm(11);

        const kneeAngle = calculateAngle(hip, knee, ankle);
        const torsoAngle = calculateAngle(shoulder, hip, knee);
        const upright = torsoAngle > 70;

        if (kneeAngle < 100 && upright) { formScore = 95; feedbackText = 'Deep lunge!'; }
        else if (kneeAngle < 120 && upright) { formScore = 80; feedbackText = 'Go lower'; }
        else if (!upright) { formScore = 65; feedbackText = 'Keep torso upright'; }
        else { formScore = 60; feedbackText = 'Deeper lunge'; }

        const now = Date.now();
        if (kneeAngle < 100 && repStateRef.current.phase === 'up' && now - repStateRef.current.lastTime > 600) {
          repStateRef.current.phase = 'down';
        } else if (kneeAngle > 155 && repStateRef.current.phase === 'down') {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && kneeAngle > 155) {
          repStateRef.current.phase = 'up';
        }
        break;
      }

      case 'glute-bridge': {
        const shoulder = safeLm(11);
        const hip = safeLm(23);
        const knee = safeLm(25);
        const ankle = safeLm(27);

        const hipAngle = calculateAngle(shoulder, hip, knee);
        const hipHeight = shoulder.y - hip.y; // positive = hip elevated

        const goodBridge = hipHeight > 0.08 && hipAngle > 150;
        const partialBridge = hipHeight > 0.03;

        if (goodBridge) { formScore = 95; feedbackText = 'Squeeze glutes!'; }
        else if (partialBridge) { formScore = 78; feedbackText = 'Hips higher'; }
        else { formScore = 60; feedbackText = 'Drive hips up'; }

        const now = Date.now();
        if (goodBridge && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 500) {
          repStateRef.current.phase = 'up';
        } else if (hipHeight < 0.01 && repStateRef.current.phase === 'up') {
          repStateRef.current.phase = 'down';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && hipHeight < 0.01) {
          repStateRef.current.phase = 'down';
        }
        break;
      }

      case 'hollow-body': {
        const shoulder = safeLm(11);
        const hip = safeLm(23);
        const ankle = safeLm(27);

        const bodyAngle = calculateAngle(shoulder, hip, ankle);
        const backContact = Math.abs(hip.y - (shoulder.y + ankle.y) / 2);
        const shoulderLift = hip.y - shoulder.y; // positive = shoulder lifted

        const hollow = shoulderLift > 0.05 && backContact < 0.08;
        const partialHollow = shoulderLift > 0.02;

        if (hollow) { formScore = 95; feedbackText = 'Solid hollow!'; }
        else if (partialHollow) { formScore = 75; feedbackText = 'Lower back to floor'; }
        else { formScore = 60; feedbackText = 'Lift shoulders & legs'; }
        // Timed — no rep counting needed
        break;
      }

      case 'dead-hang': {
        const leftShoulder = safeLm(11);
        const rightShoulder = safeLm(12);
        const leftElbow = safeLm(13);
        const leftWrist = safeLm(15);

        const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        const shoulderEngaged = leftShoulder.y < leftWrist.y - 0.1;
        const stillBody = Math.abs(leftShoulder.x - rightShoulder.x - 0.15) < 0.05;

        if (elbowAngle > 155 && shoulderEngaged) { formScore = 95; feedbackText = 'Perfect hang!'; }
        else if (elbowAngle > 140) { formScore = 80; feedbackText = 'Engage shoulders'; }
        else { formScore = 60; feedbackText = 'Straighten arms'; }
        // Timed — no rep counting needed
        break;
      }

      case 'superman': {
        const shoulder = safeLm(11);
        const hip = safeLm(23);
        const ankle = safeLm(27);

        const liftHeight = hip.y - shoulder.y; // positive when shoulder lifted from prone

        if (liftHeight > 0.1) { formScore = 95; feedbackText = 'Great extension!'; }
        else if (liftHeight > 0.05) { formScore = 78; feedbackText = 'Lift higher'; }
        else { formScore = 60; feedbackText = 'Lift arms and legs'; }

        const now = Date.now();
        if (liftHeight > 0.1 && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 800) {
          repStateRef.current.phase = 'up';
        } else if (liftHeight < 0.02 && repStateRef.current.phase === 'up') {
          repStateRef.current.phase = 'down';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && liftHeight < 0.02) {
          repStateRef.current.phase = 'down';
        }
        break;
      }

      case 'crunch': {
        const shoulder = safeLm(11);
        const hip = safeLm(23);

        const crunchDepth = hip.y - shoulder.y; // positive = shoulders raised off floor

        if (crunchDepth > 0.12) { formScore = 95; feedbackText = 'Squeeze at top!'; }
        else if (crunchDepth > 0.06) { formScore = 78; feedbackText = 'Crunch higher'; }
        else { formScore = 60; feedbackText = 'Lift shoulders'; }

        const now = Date.now();
        if (crunchDepth > 0.12 && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 400) {
          repStateRef.current.phase = 'up';
        } else if (crunchDepth < 0.02 && repStateRef.current.phase === 'up') {
          repStateRef.current.phase = 'down';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && crunchDepth < 0.02) {
          repStateRef.current.phase = 'down';
        }
        break;
      }

      case 'leg-raise': {
        const hip = safeLm(23);
        const knee = safeLm(25);
        const ankle = safeLm(27);

        const legAngle = calculateAngle(safeLm(11), hip, ankle);
        const legsUp = hip.y - ankle.y; // positive = legs raised

        if (legsUp > 0.2) { formScore = 95; feedbackText = 'Legs vertical!'; }
        else if (legsUp > 0.1) { formScore = 78; feedbackText = 'Raise legs higher'; }
        else { formScore = 60; feedbackText = 'Keep legs straight'; }

        const now = Date.now();
        if (legsUp > 0.2 && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 500) {
          repStateRef.current.phase = 'up';
        } else if (legsUp < 0.02 && repStateRef.current.phase === 'up') {
          repStateRef.current.phase = 'down';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && legsUp < 0.02) {
          repStateRef.current.phase = 'down';
        }
        break;
      }

      case 'mountain-climber': {
        const shoulder = safeLm(11);
        const hip = safeLm(23);
        const leftKnee = safeLm(25);
        const rightKnee = safeLm(26);

        const hipLevel = Math.abs(hip.y - (shoulder.y + 0.15)) < 0.08;
        const kneeForward = Math.min(shoulder.x - leftKnee.x, shoulder.x - rightKnee.x);

        if (hipLevel && kneeForward > 0.05) { formScore = 95; feedbackText = 'Drive that knee!'; }
        else if (hipLevel) { formScore = 78; feedbackText = 'Drive knees to chest'; }
        else { formScore = 65; feedbackText = 'Keep hips level'; }

        const now = Date.now();
        if (kneeForward > 0.05 && repStateRef.current.phase === 'ready' && now - repStateRef.current.lastTime > 300) {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        }
        break;
      }

      case 'tricep-extension': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);

        const elbowAngle = calculateAngle(shoulder, elbow, wrist);
        const upperArmVertical = Math.abs(elbow.x - shoulder.x) < 0.08;

        if (elbowAngle > 155 && upperArmVertical) { formScore = 95; feedbackText = 'Full extension!'; }
        else if (elbowAngle > 130) { formScore = 78; feedbackText = 'Extend fully'; }
        else if (!upperArmVertical) { formScore = 65; feedbackText = 'Keep elbow up'; }
        else { formScore = 60; feedbackText = 'Lower the weight'; }

        const now = Date.now();
        if (elbowAngle < 60 && repStateRef.current.phase === 'up' && now - repStateRef.current.lastTime > 500) {
          repStateRef.current.phase = 'down';
        } else if (elbowAngle > 155 && repStateRef.current.phase === 'down') {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && elbowAngle > 155) {
          repStateRef.current.phase = 'up';
        }
        break;
      }

      case 'front-raise': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);

        const armHeight = shoulder.y - wrist.y;
        const armStraight = calculateAngle(shoulder, elbow, wrist) > 150;

        if (armHeight > 0.15 && armStraight) { formScore = 95; feedbackText = 'Arm parallel!'; }
        else if (armHeight > 0.08) { formScore = 78; feedbackText = 'Raise to parallel'; }
        else { formScore = 60; feedbackText = 'Raise your arm'; }

        const now = Date.now();
        if (armHeight > 0.15 && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 600) {
          repStateRef.current.phase = 'up';
        } else if (armHeight < 0.02 && repStateRef.current.phase === 'up') {
          repStateRef.current.phase = 'down';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && armHeight < 0.02) {
          repStateRef.current.phase = 'down';
        }
        break;
      }

      case 'calf-raise': {
        const hip = safeLm(23);
        const knee = safeLm(25);
        const ankle = safeLm(27);
        const foot = safeLm(31);

        const ankleAngle = calculateAngle(knee, ankle, foot);
        const riseDetect = ankle.y - foot.y; // positive = on toes

        if (ankleAngle < 80) { formScore = 95; feedbackText = 'Full rise!'; }
        else if (ankleAngle < 100) { formScore = 78; feedbackText = 'Rise higher'; }
        else { formScore = 60; feedbackText = 'Push up on toes'; }

        const now = Date.now();
        if (ankleAngle < 80 && repStateRef.current.phase === 'down' && now - repStateRef.current.lastTime > 400) {
          repStateRef.current.phase = 'up';
        } else if (ankleAngle > 100 && repStateRef.current.phase === 'up') {
          repStateRef.current.phase = 'down';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && ankleAngle > 100) {
          repStateRef.current.phase = 'down';
        }
        break;
      }

      case 'russian-twist': {
        const leftShoulder = safeLm(11);
        const rightShoulder = safeLm(12);
        const leftWrist = safeLm(15);
        const rightWrist = safeLm(16);

        const wristMidX = (leftWrist.x + rightWrist.x) / 2;
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const rotation = Math.abs(wristMidX - shoulderMidX);

        if (rotation > 0.15) { formScore = 95; feedbackText = 'Full rotation!'; }
        else if (rotation > 0.08) { formScore = 78; feedbackText = 'Rotate more'; }
        else { formScore = 60; feedbackText = 'Twist side to side'; }

        const now = Date.now();
        if (rotation > 0.15 && repStateRef.current.phase === 'ready' && now - repStateRef.current.lastTime > 400) {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (rotation < 0.03) {
          repStateRef.current.phase = 'ready';
        }
        break;
      }

      case 'jump-squat': {
        const hip = safeLm(23);
        const knee = safeLm(25);
        const ankle = safeLm(27);
        const shoulder = safeLm(11);

        const kneeAngle = calculateAngle(hip, knee, ankle);
        const goodDepth = kneeAngle < 90;
        const upright = calculateAngle(shoulder, hip, knee) > 60;

        if (goodDepth && upright) { formScore = 95; feedbackText = 'Explode up!'; }
        else if (kneeAngle < 120) { formScore = 78; feedbackText = 'Squat deeper'; }
        else { formScore = 60; feedbackText = 'Squat then jump'; }

        const now = Date.now();
        if (kneeAngle < 90 && repStateRef.current.phase === 'up' && now - repStateRef.current.lastTime > 600) {
          repStateRef.current.phase = 'down';
        } else if (kneeAngle > 155 && repStateRef.current.phase === 'down') {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && kneeAngle > 155) {
          repStateRef.current.phase = 'up';
        }
        break;
      }

      case 'single-leg-squat': {
        const hip = safeLm(23);
        const knee = safeLm(25);
        const ankle = safeLm(27);
        const shoulder = safeLm(11);

        const kneeAngle = calculateAngle(hip, knee, ankle);
        const goodDepth = kneeAngle < 100;
        const balanced = Math.abs(shoulder.x - hip.x) < 0.12;

        if (goodDepth && balanced) { formScore = 95; feedbackText = 'Pistol depth!'; }
        else if (kneeAngle < 130) { formScore = 78; feedbackText = 'Go lower'; }
        else if (!balanced) { formScore = 65; feedbackText = 'Stay balanced'; }
        else { formScore = 60; feedbackText = 'Control descent'; }

        const now = Date.now();
        if (kneeAngle < 100 && repStateRef.current.phase === 'up' && now - repStateRef.current.lastTime > 800) {
          repStateRef.current.phase = 'down';
        } else if (kneeAngle > 155 && repStateRef.current.phase === 'down') {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && kneeAngle > 155) {
          repStateRef.current.phase = 'up';
        }
        break;
      }

      case 'shoulder-tap': {
        const leftShoulder = safeLm(11);
        const rightShoulder = safeLm(12);
        const leftWrist = safeLm(15);
        const rightWrist = safeLm(16);
        const hip = safeLm(23);

        const hipSway = Math.abs(hip.x - (leftShoulder.x + rightShoulder.x) / 2);
        const tapDetect = Math.abs(leftWrist.x - rightShoulder.x) < 0.08 || Math.abs(rightWrist.x - leftShoulder.x) < 0.08;

        if (tapDetect && hipSway < 0.08) { formScore = 95; feedbackText = 'Stable tap!'; }
        else if (tapDetect) { formScore = 75; feedbackText = 'Control hip sway'; }
        else { formScore = 60; feedbackText = 'Tap opposite shoulder'; }

        const now = Date.now();
        if (tapDetect && now - repStateRef.current.lastTime > 400) {
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        }
        break;
      }

      case 'concentration-curl': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);

        const curlAngle = calculateAngle(shoulder, elbow, wrist);
        const elbowBraced = elbow.y > shoulder.y + 0.05; // elbow below shoulder (seated)

        if (curlAngle < 45 && elbowBraced) { formScore = 95; feedbackText = 'Peak squeeze!'; }
        else if (curlAngle < 90 && elbowBraced) { formScore = 80; feedbackText = 'Curl higher'; }
        else if (!elbowBraced) { formScore = 65; feedbackText = 'Brace elbow on thigh'; }
        else { formScore = 55; feedbackText = 'Curl the weight'; }

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
        break;
      }

      case 'decline-pushup':
      case 'diamond-pushup':
      case 'wide-pushup': {
        const shoulder = safeLm(11);
        const elbow = safeLm(13);
        const wrist = safeLm(15);
        const hip = safeLm(23);
        const ankle = safeLm(27);

        const bodyAngle = calculateAngle(shoulder, hip, ankle);
        const elbowAngle = calculateAngle(shoulder, elbow, wrist);
        const bodyStraight = Math.abs(bodyAngle - 180) < 15;
        const goodDepth = elbowAngle < 90;
        const partialDepth = elbowAngle < 120;

        if (bodyStraight && goodDepth) { formScore = 95; feedbackText = 'Perfect form!'; }
        else if (bodyStraight && partialDepth) { formScore = 75; feedbackText = 'Go deeper'; }
        else if (!bodyStraight) { formScore = 60; feedbackText = 'Keep body straight'; }
        else { formScore = 50; feedbackText = 'Check form'; }

        const now = Date.now();
        if (elbowAngle < 90 && repStateRef.current.phase === 'up' && now - repStateRef.current.lastTime > 500) {
          repStateRef.current.phase = 'down';
        } else if (elbowAngle > 160 && repStateRef.current.phase === 'down') {
          repStateRef.current.phase = 'up';
          repStateRef.current.count += 1;
          repStateRef.current.lastTime = now;
        } else if (repStateRef.current.phase === 'ready' && elbowAngle > 160) {
          repStateRef.current.phase = 'up';
        }
        break;
      }
        const shoulder = safeLm(11);
        const hip = safeLm(23);
        const ankle = safeLm(27);
        
        const bodyAngle = calculateAngle(shoulder, hip, ankle);
        const hipSag = Math.abs(hip.y - (shoulder.y + ankle.y) / 2);
        
        const straight = Math.abs(bodyAngle - 180) < 10;
        const noSag = hipSag < 0.05;
        
        if (straight && noSag) { formScore = 95; feedbackText = 'Solid plank'; }
        else if (straight) { formScore = 80; feedbackText = 'Hips sagging'; }
        else { formScore = 65; feedbackText = 'Straighten body'; }
        break;
      }
      
      default: {
        const leftShoulder = safeLm(11);
        const rightShoulder = safeLm(12);
        const leftHip = safeLm(23);
        const rightHip = safeLm(24);
        
        const shoulderLevel = Math.abs(leftShoulder.y - rightShoulder.y) < 0.05;
        const hipLevel = Math.abs(leftHip.y - rightHip.y) < 0.05;
        
        if (shoulderLevel && hipLevel) { formScore = 85; feedbackText = 'Good posture'; }
        else { formScore = 70; feedbackText = 'Balance your stance'; }
      }
    }
    
    return { score: formScore, feedback: feedbackText };
  }, [calculateAngle]);

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
            const avgScore = Math.round(scoreHistoryRef.current.reduce((a,b) => a+b, 0) / scoreHistoryRef.current.length);
            
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
                // Silent fail on frame errors
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
        try { cameraRef.current.stop(); } catch(e) {}
      }
      if (poseRef.current) {
        try { poseRef.current.close(); } catch(e) {}
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