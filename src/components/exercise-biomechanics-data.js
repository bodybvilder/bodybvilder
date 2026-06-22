/**
 * EXERCISE BIOMECHANICS DATA
 * Comprehensive joint angle data for animation accuracy.
 * Sources: NASM/NSCA/ACSM guidelines, peer-reviewed studies (PubMed, Frontiers,
 * JSCR, IJSPT, PMC). All angles in degrees unless otherwise noted.
 *
 * CONVENTION:
 *   0° = anatomical position (full extension) for most joints
 *   Flexion angles are positive
 *   Torso angle measured from vertical (0° = upright)
 *   Spine angle (neutral lordosis maintained unless stated)
 */

export const EXERCISE_BIOMECHANICS = {

  // ─────────────────────────────────────────────────────────────────────────
  // 1. PUSH-UP
  // Sources: Dondanville & Lisman (2016), NSCA Essentials, exrx.net
  // ─────────────────────────────────────────────────────────────────────────
  "push-up": {
    view: "side",
    primaryMuscles: ["pectoralis_major", "anterior_deltoid", "triceps"],
    phases: ["top (start)", "bottom"],

    startingPosition: {
      description: "High plank — arms fully extended, hands slightly wider than shoulders",
      joints: {
        elbow: 170,           // near-full extension, ~10° soft lock
        shoulder_flexion: 0,  // arms vertical
        shoulder_abduction: 45, // hands ~1.5x shoulder width → ~45° abduction angle
        hip: 180,             // full extension, neutral
        knee: 180,
        ankle: 90,            // dorsiflexed to neutral
        torso_from_vertical: 90, // horizontal
      },
      bodyAlignment: "Head-spine-heel straight line; shoulders packed, scapulae protracted slightly",
      handPosition: "1–1.5x shoulder-width, fingers spread, ~45° external rotation of wrists",
    },

    bottomPosition: {
      description: "Chest 1–3 cm from floor, elbows at ~75° flare",
      joints: {
        elbow: 90,           // ~80–100° per Donandville et al. 2016
        shoulder_flexion: 45, // humerus angled forward
        shoulder_abduction: 45,
        hip: 180,
        knee: 180,
        torso_from_vertical: 90,
      },
    },

    keyMovement: {
      primaryMove: "Elbow flexion/extension in sagittal plane; shoulder horizontal adduction",
      rangeOfMotion_elbow: "~80° (170° → 90°)",
      fixed: "Hip and knee remain fully extended; spine neutral throughout",
    },

    criticalFormCues: [
      "Elbows track at 45–75° relative to torso — NOT straight out to sides (90° = shoulder impingement risk)",
      "Shoulder blades protract at top (serratus anterior activation), retract slightly at bottom",
      "Core braced: slight posterior pelvic tilt prevents lumbar hyperextension",
      "Head neutral — don't crane neck forward or drop chin to chest",
      "Lower chest to floor, NOT nose/forehead",
    ],

    commonErrors: [
      "Elbows flared >90° from torso — increases anterior shoulder stress",
      "Hips sagging (lumbar hyperextension) — indicates weak core",
      "Hips piked up — reduces pec engagement",
      "Partial range of motion — not achieving 90° elbow flexion",
      "Head drooping forward — cervical strain",
    ],

    safetyNote: "Wrist pain: neutral wrist option (fists or handles). Shoulder pain: reduce elbow flare angle.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. BODYWEIGHT SQUAT
  // Sources: Schoenfeld 2010 (JSCR), StrengthLog deep-squat review (2023)
  //          parallel = knee ≈90°; deep = knee ≈130–140°
  // ─────────────────────────────────────────────────────────────────────────
  "squat-bodyweight": {
    view: "side",
    primaryMuscles: ["quadriceps", "gluteus_maximus", "hamstrings"],
    phases: ["standing (start/end)", "parallel bottom"],

    startingPosition: {
      description: "Standing upright, feet shoulder-width, toes 10–30° external rotation",
      joints: {
        knee: 0,              // full extension
        hip: 0,               // full extension
        ankle: 0,             // neutral (~90° foot-to-shin)
        torso_from_vertical: 0,
      },
      bodyAlignment: "Feet shoulder-width; weight distributed over mid-foot",
    },

    bottomPosition: {
      description: "Parallel — thighs parallel to floor",
      joints: {
        knee: 90,             // parallel = 90°; deep squat = 120–140°
        hip: 90,              // ~80–100° at parallel
        ankle_dorsiflexion: 25, // ~20–30° dorsiflexion required
        torso_from_vertical: 30, // slight forward lean is anatomically normal
        lumbar: "neutral (natural lordosis maintained)",
      },
    },

    keyMovement: {
      primaryMove: "Simultaneous hip and knee flexion (descend) / extension (ascend)",
      rangeOfMotion_knee: "0° → 90° (parallel) or 0° → 130°+ (deep)",
      rangeOfMotion_hip: "0° → 90°+ flexion",
      fixed: "Spine neutral; heels on floor; knees track over 2nd–4th toes",
    },

    criticalFormCues: [
      "Push knees OUT in line with toes — avoid valgus collapse",
      "Chest stays up, spine neutral — not rounding the back",
      "Weight through entire foot — neither heels rising nor toes lifting",
      "Hip crease must reach at least knee height for parallel",
      "Brace abs before descent — intra-abdominal pressure protects spine",
    ],

    commonErrors: [
      "Knee valgus (knees caving in) — high ACL/MCL injury risk",
      "Heels rising — ankle mobility limitation",
      "Excessive forward trunk lean — shifts load to lower back",
      "Half-reps — insufficient depth reduces glute and quad stimulus",
      "Butt wink (posterior pelvic tilt at bottom) — lumbar flexion under load",
    ],

    safetyNote: "Butt wink at depth indicates limited hip/ankle mobility. Do not force depth under load.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. BARBELL BACK SQUAT
  // Sources: Schoenfeld 2010, Hales et al., NSCA CSCS manual
  // ─────────────────────────────────────────────────────────────────────────
  "barbell-squat": {
    view: "side",
    primaryMuscles: ["quadriceps", "gluteus_maximus", "hamstrings", "erector_spinae"],
    phases: ["standing unrack", "descent", "bottom", "ascent"],

    startingPosition: {
      description: "Barbell on upper traps (high bar) or rear delts (low bar), feet slightly wider than shoulder-width",
      joints: {
        knee: 0,
        hip: 0,
        torso_from_vertical: 5,  // very slight forward lean with bar on back
        bar_position_high: "C7/T1 junction, above posterior deltoids",
        bar_position_low: "3–5 cm below spine of scapula on posterior deltoid shelf",
      },
    },

    bottomPosition: {
      description: "Parallel or below-parallel",
      joints: {
        knee: 90,             // parallel minimum; competition depth often 110–120°
        hip: 95,              // hip crease below top of knee
        ankle_dorsiflexion: 25,
        torso_from_vertical: 35, // more lean than BW squat due to bar on back
        lumbar: "neutral lordosis — not flexed",
      },
    },

    keyMovement: {
      primaryMove: "Hip and knee flexion/extension; knee tracks toe direction",
      rangeOfMotion_knee: "0° → 90–120°",
      fixed: "Elbows pointed slightly back (high bar) or down (low bar); wrists neutral",
    },

    criticalFormCues: [
      "High bar: torso more upright (~20–35° forward lean)",
      "Low bar: more forward lean (~40–45°) shifts load to posterior chain",
      "Break at hips AND knees simultaneously — not hips first",
      "Brace 360° around core before unracking",
      "Drive elbows forward and up during ascent to maintain bar position",
      "Knees stay pushed out in line with toes at all times",
    ],

    commonErrors: [
      "Good-morning squat — hips rise faster than shoulders at bottom",
      "Knee valgus under load — high injury risk",
      "Bar roll on neck — improper rack position",
      "Caving chest at bottom — thoracic flexion",
      "Half-depth squats — insufficient hip flexion",
    ],

    safetyNote: "Low back rounding (butt wink) under barbell load is dangerous. Never force depth beyond mobility.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. BARBELL CONVENTIONAL DEADLIFT
  // Sources: Edington et al. 2018 (PMC6162543), Moran et al. (Frontiers 2025),
  //          Pubmed 36237649 (thoracolumbar alignment), NSCA manual
  //          Start: torso ~45–60° from vertical; hip ~50–60° flexion; knee ~50–65°
  // ─────────────────────────────────────────────────────────────────────────
  "barbell-deadlift": {
    view: "side",
    primaryMuscles: ["erector_spinae", "gluteus_maximus", "hamstrings", "quadriceps", "trapezius"],
    phases: ["setup (floor)", "lift-off", "lockout (standing)"],

    startingPosition: {
      description: "Bar over mid-foot (~2.5 cm from shins), hip-width stance, double overhand grip",
      joints: {
        hip: 55,              // ~50–60° flexion from vertical at setup (Edington 2018: CDL torso ~23.7°±11.3° from vertical = hip ~66°)
        knee: 55,             // ~45–65° flexion
        torso_from_vertical: 45, // approximately 40–50° forward from vertical
        ankle: 20,            // slight dorsiflexion
        elbow: 180,           // fully extended, arms vertical
        lumbar: "neutral – natural lordosis maintained; NOT flexed",
        shoulder_position: "directly over or 1–2 cm in front of barbell",
      },
      bodyAlignment: "Bar touching shins; shoulder blades over bar; hips between shoulders and knees in height",
    },

    lockoutPosition: {
      description: "Full hip extension, knees locked, bar at hip crease",
      joints: {
        hip: 0,               // full extension
        knee: 0,              // full extension
        torso_from_vertical: 0, // upright
        elbow: 180,           // arms hanging straight
        lumbar: "neutral with chest up",
      },
    },

    keyMovement: {
      primaryMove: "Simultaneous knee extension and hip extension — bar travels vertically",
      rangeOfMotion_hip: "~55° flexion → 0° (full extension)",
      rangeOfMotion_knee: "~55° → 0°",
      fixed: "Arms remain straight throughout; bar stays in contact with legs; spine neutral",
    },

    criticalFormCues: [
      "Lat activation ('protect your armpits') keeps bar close to body",
      "Push floor away on lift-off — think leg press, not pull",
      "Hips and shoulders rise at same rate from floor (no hips-first jerk)",
      "Lock out by squeezing glutes — don't hyperextend lumbar at top",
      "Breath: big air before descent, hold Valsalva through lift, exhale at lockout",
      "Bar path must be vertical — any horizontal drift increases spinal moment arm",
    ],

    commonErrors: [
      "Bar drifting away from body — dramatically increases lumbar moment",
      "Lumbar flexion (rounding lower back) — especially dangerous under load",
      "Hips rising faster than shoulders (turning into stiff-leg DL) — stress transfers to lumbar",
      "Hyperextending at lockout — lumbar compression",
      "Bar over toes at setup (not mid-foot) — poor mechanical leverage",
    ],

    safetyNote: "CRITICAL: Lumbar flexion under maximal load is a primary mechanism of disc injury. Neutral spine is non-negotiable.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. ROMANIAN DEADLIFT (RDL)
  // Sources: PMC8835508, physio-pedia, simplifaster, liftmanual
  //          RDL: knees soft (15–20° flexion); hip hinge is dominant
  // ─────────────────────────────────────────────────────────────────────────
  "romanian-deadlift": {
    view: "side",
    primaryMuscles: ["hamstrings", "gluteus_maximus", "erector_spinae"],
    phases: ["standing (top)", "bottom of hinge"],

    startingPosition: {
      description: "Standing upright, bar at hip crease, shoulder-width stance",
      joints: {
        knee: 15,             // soft bend — maintained throughout
        hip: 0,               // full extension at top
        torso_from_vertical: 0,
        elbow: 180,           // arms hang straight
        lumbar: "neutral lordosis",
      },
    },

    bottomPosition: {
      description: "Bar at approximately mid-shin, maximum hip hinge, hamstring stretch",
      joints: {
        knee: 15,             // SAME soft bend as start — does not change
        hip: 70,              // ~60–80° flexion at bottom (depends on hamstring mobility)
        torso_from_vertical: 65, // torso nearly parallel to floor
        elbow: 180,
        lumbar: "neutral — natural lordosis preserved",
      },
    },

    keyMovement: {
      primaryMove: "Hip hinge — hips push back as torso descends; knees do NOT change angle",
      rangeOfMotion_hip: "0° → ~70° flexion",
      fixed: "Knee angle stays constant at ~15°; spine neutral; bar close to legs",
    },

    criticalFormCues: [
      "Push hips BACK (not just bend forward) — feel hamstrings load with tension",
      "Knee angle is set at start and does NOT change — if knees bend more, it becomes a squat",
      "Bar stays in contact with legs throughout (drag the bar down the legs)",
      "Stop descent when lumbar starts to round — this is your end range",
      "Shoulder blades retracted and depressed — prevents upper back rounding",
    ],

    commonErrors: [
      "Knees bending during descent — changes mechanics to a conventional DL",
      "Lumbar flexion at bottom — most common injury risk",
      "Bar drifting away from body — multiplies moment on spine",
      "Incomplete hip hinge — just bending at waist with flexed spine",
    ],

    safetyNote: "Stop descent before lumbar neutral is lost. Greater flexibility allows more range, but never sacrifice spine position.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. DUMBBELL BICEP CURL
  // Sources: Frontiers Physiology 2021 (734509), Examine.com curl ROM study,
  //          Human Kinetics mechanics of biceps, HuggingFace posecoach knowledge base
  //          Full ROM: ~170° (extended) → ~40° (peak flex); max tension at 90°
  // ─────────────────────────────────────────────────────────────────────────
  "bicep-curl": {
    view: "side",
    primaryMuscles: ["biceps_brachii", "brachialis", "brachioradialis"],
    phases: ["bottom (start/end)", "midpoint (90°)", "top (peak flex)"],

    startingPosition: {
      description: "Standing, arms hanging, dumbbells at sides, palms forward (supinated)",
      joints: {
        elbow: 170,           // near-full extension (not hyperextended): ~160–175°
        shoulder: 0,          // neutral — arm at side
        forearm: "supinated (palms forward)",
        torso_from_vertical: 0,
        wrist: "neutral",
      },
      bodyAlignment: "Feet hip-width, slight knee bend, core braced, shoulders retracted",
    },

    topPosition: {
      description: "Maximum elbow flexion — dumbbell near shoulder",
      joints: {
        elbow: 40,            // ~30–50° at peak contraction; full ROM top
        shoulder: 0,          // stays neutral — no forward shoulder swing
        forearm: "supinated throughout",
        wrist: "neutral — no extension/flexion cheat",
      },
    },

    peakTensionPoint: {
      elbow: 90,              // mechanical advantage and gravitational load peak at 90° (Human Kinetics)
      description: "Forearm parallel to floor — highest torque on biceps",
    },

    keyMovement: {
      primaryMove: "Elbow flexion in sagittal plane; forearm supination maintained",
      rangeOfMotion_elbow: "~130° (170° → 40°)",
      fixed: "Upper arm perpendicular to floor; elbow stays at side; no shoulder swing",
    },

    criticalFormCues: [
      "Elbow is the ONLY joint moving — nothing else should move",
      "Upper arm stays vertical and pressed against side of torso",
      "Pause at top 1 sec for peak contraction; slow eccentric (3 sec) down",
      "Wrist remains neutral — no curling the wrist to 'help' at top",
      "Full extension at bottom (without hyperextending or locking out)",
    ],

    commonErrors: [
      "Swinging torso backward — momentum transfers load away from biceps",
      "Shoulder rising (anterior deltoid taking over at top)",
      "Partial ROM — not achieving full extension at bottom",
      "Wrist deviation at top — reduces biceps peak contraction",
      "Elbows drifting forward (like a hammer curl) — changes muscle emphasis",
    ],

    safetyNote: "Supinate the wrist fully from start. Pronated or neutral grip biases brachioradialis over biceps brachii.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. DUMBBELL LATERAL RAISE
  // Sources: gxmmat.us biomechanics guide, shoulder abduction mechanics,
  //          scapulohumeral rhythm (2:1 ratio), NASM deltoid training guidelines
  //          Scapular plane = 30° anterior to frontal plane
  // ─────────────────────────────────────────────────────────────────────────
  "lateral-raise": {
    view: "front_45",
    primaryMuscles: ["deltoid_medial", "supraspinatus", "trapezius_upper"],
    phases: ["sides (start/end)", "top (arms parallel to floor = 90°)"],

    startingPosition: {
      description: "Standing, dumbbells at sides, slight forward lean, elbows ~5–10° flexed",
      joints: {
        shoulder_abduction: 0,  // arms at sides
        elbow: 170,             // slight soft bend prevents elbow joint stress
        torso_from_vertical: 5, // very slight forward lean shifts load to mid-deltoid
        wrist: "neutral with slight pronation (thumbs slightly down at bottom)",
        scapula: "neutral — blades not elevated",
      },
    },

    topPosition: {
      description: "Arms at 90° abduction in scapular plane (30° forward of frontal plane)",
      joints: {
        shoulder_abduction: 90,   // goal is parallel to floor (NOT above 90° with this load)
        scapular_plane_angle: 30, // arms 30° forward of pure lateral = reduces impingement
        elbow: 170,               // maintain slight soft bend
        wrist_position: "thumbs slightly down (pinky slightly up at top) OR neutral",
        scapula: "upward rotation begins at 30° abduction (scapulohumeral rhythm 2:1)",
      },
    },

    keyMovement: {
      primaryMove: "Shoulder abduction in scapular plane to 90°",
      rangeOfMotion: "0° → 90° abduction",
      fixed: "Elbow angle stays constant; no shrugging (trap elevation) — lead with elbows",
      scapulohumeral_rhythm: "For every 2° humeral elevation, scapula rotates 1° upward",
    },

    criticalFormCues: [
      "Raise in SCAPULAR PLANE (30° forward of side) — reduces rotator cuff impingement",
      "Lead with elbows, not wrists — keeps deltoid as prime mover",
      "Slight pinky-up rotation at top (external rotation) clears acromion for supraspinatus",
      "Do NOT shrug shoulders at top — upper trap compensation",
      "Control eccentric (lower slowly, 2–3 sec) for maximum muscle damage and growth",
      "Stop at shoulder height (90°) — above 90° requires scapular rotation that outpaces deltoid",
    ],

    commonErrors: [
      "Arms straight out to strict coronal plane — increases impingement risk",
      "Thumbs-up grip without external rotation — supraspinatus impingement",
      "Shrugging at top — upper trap dominates over medial delt",
      "Elbow bending progressively to reduce load — cheats range",
      "Momentum/swinging — reduces time under tension",
    ],

    safetyNote: "Shoulder impingement risk above 90° without proper external rotation. Stay at or below parallel.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. PULL-UP (Overhand / Pronated Grip)
  // Sources: UMich MVS330 biomechanics (max flex 32°, max ext 168°, ROM 136°),
  //          exrx.net (elbow ROM ~145°), NSCA Pull-up JSCR 2014
  //          Grip: pronated, ~1.5–2x shoulder-width
  // ─────────────────────────────────────────────────────────────────────────
  "pull-up": {
    view: "front",
    primaryMuscles: ["latissimus_dorsi", "biceps_brachii", "teres_major", "rhomboids"],
    phases: ["dead hang (start/end)", "top (chin over bar)"],

    startingPosition: {
      description: "Dead hang — arms fully extended overhead, pronated grip, shoulder-width to 1.5x shoulder-width",
      joints: {
        elbow: 168,           // near-full extension (~165–180°; UMich: 168° at hang)
        shoulder_flexion: 180, // arms straight overhead (full shoulder flexion = ~170–180°)
        shoulder_abduction: 60, // ~45–90° depending on grip width
        torso_from_vertical: 0, // body hangs vertically
        wrist: "neutral-to-pronated",
        grip: "pronated (palms away), 1.5–2x shoulder-width",
      },
    },

    topPosition: {
      description: "Chin clears bar, elbow fully flexed",
      joints: {
        elbow: 32,            // UMich study: 32° max flexion at top of pull-up
        shoulder_flexion: 90,  // decreased from overhead as elbows come to sides
        shoulder_extension: 45, // elbows driven down and back
        torso_from_vertical: 15, // slight lean back to clear chin
      },
    },

    keyMovement: {
      primaryMove: "Shoulder adduction + extension + elbow flexion simultaneously",
      rangeOfMotion_elbow: "~136° (168° → 32°) per UMich biomechanics study",
      fixed: "Body stays vertical (no excessive swinging/kipping in strict form)",
    },

    criticalFormCues: [
      "Start with shoulder blades 'packed' (depressed and retracted) before pulling",
      "Think 'elbows to hips' — pulls with lats, not biceps",
      "Chest up and slightly forward — slight torso lean back at top",
      "Full extension at bottom — DO NOT start from a partial hang",
      "Chin must clearly pass over bar (not just level with bar)",
      "Controlled descent (eccentric) — 3 seconds down",
    ],

    commonErrors: [
      "Starting with shrugged shoulders — traps dominate",
      "Kipping (swinging hips) — removes lats from eccentric, transfers load to shoulders",
      "Half reps — stopping when elbows at 90° reduces lat full-ROM engagement",
      "Looking down — promotes thoracic rounding",
    ],

    safetyNote: "Shoulder pain in dead hang: check for labral issues. Avoid full hang if hypermobile shoulders.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. CHIN-UP (Supinated / Underhand Grip)
  // Sources: exrx.net muscular analysis, NASM chin-up guide (2023),
  //          UMich MVS330 chin-up: ROM 140°
  //          Supinated grip → shoulder extension dominant; more biceps activation
  // ─────────────────────────────────────────────────────────────────────────
  "chin-up": {
    view: "front",
    primaryMuscles: ["biceps_brachii", "latissimus_dorsi", "teres_major"],
    phases: ["dead hang (start/end)", "top (chin over bar)"],

    startingPosition: {
      description: "Dead hang — arms extended overhead, supinated (underhand) grip, shoulder-width or slightly narrower",
      joints: {
        elbow: 170,           // UMich chin-up: starts at ~170° extension
        shoulder_flexion: 175, // arms straight overhead
        grip: "supinated (palms toward face), shoulder-width",
      },
    },

    topPosition: {
      description: "Chin clears bar; elbows fully flexed",
      joints: {
        elbow: 30,            // UMich chin-up: ~30° at top; ROM 140°
        shoulder_extension: 50, // elbows pulled DOWN and back (shoulder extension dominant)
        torso_from_vertical: 10, // slight lean back
      },
    },

    keyMovement: {
      primaryMove: "Shoulder extension + elbow flexion (supinated = more biceps brachii activation than pull-up)",
      rangeOfMotion_elbow: "~140° (170° → 30°)",
      vs_pullup: "Chin-up: more biceps, more shoulder extension movement; Pull-up: more lat horizontal adduction",
    },

    criticalFormCues: [
      "Supinated grip increases bicep moment arm vs. pronated pull-up",
      "Drive elbows DOWN and toward hips (shoulder extension) — not flared outward",
      "Shoulder blades depress and retract before initiating pull",
      "Pause at top, chin clearly over bar, hold 1 sec",
      "Full hang at bottom — complete range of motion",
    ],

    commonErrors: [
      "Elbows drifting forward at top — shoulder flexion instead of extension",
      "Grip too wide for supinated grip — reduces supination benefit",
      "Not clearing chin — stopping short of bar",
    ],

    safetyNote: "Supinated grip places elbow in more vulnerable position under extreme loads — use moderate weight for weighted chin-ups.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. PARALLEL BAR DIP
  // Sources: McKenzie et al. 2022 PMC9603242 (bench vs bar vs ring dips),
  //          PMC9659300 (bar dip kinematics), NSCA guidelines
  //          Bar dip: elbow ~15° at top, ~90° at bottom; shoulder ~25° at top, ~50° at bottom
  // ─────────────────────────────────────────────────────────────────────────
  "dip": {
    view: "side",
    primaryMuscles: ["pectoralis_major", "triceps", "anterior_deltoid"],
    phases: ["top (start/end)", "bottom"],

    startingPosition: {
      description: "Arms extended on parallel bars, body vertical or slightly forward",
      joints: {
        elbow: 170,           // near-full extension — not hyperextended
        torso_from_vertical: 5,  // upright for triceps focus; lean forward for pec focus
        shoulder: 0,          // neutral at sides
        knee: 90,             // legs bent behind or straight for clearance
      },
      bodyAlignment: "Wrists neutral, shoulders packed down (depressed), scapulae retracted",
    },

    bottomPosition: {
      description: "Elbows at 90°, upper arms parallel to floor; shoulders ~50° hyperextension",
      joints: {
        elbow: 90,            // standard cue; going deeper (120°) increases pec stretch
        shoulder_extension: 45, // shoulder moves into extension as descent deepens
        torso_from_vertical: 15, // slight forward lean maintains neutral balance point
        wrist: "neutral",
      },
    },

    keyMovement: {
      primaryMove: "Elbow flexion (descent) / extension (ascent); shoulder extension",
      rangeOfMotion_elbow: "~80° (170° → 90°)",
      fixed: "Wrists neutral; shoulders stay packed (not shrugged)",
      emphasis_tricep: "Torso vertical, elbows tucked to sides",
      emphasis_pec: "Torso forward ~15–30°, elbows slightly flared",
    },

    criticalFormCues: [
      "Stop descent at 90° elbow OR when shoulders feel stressed — do NOT go past 90° if shoulder discomfort",
      "Shoulders stay BELOW ear level — no shrugging upward",
      "Elbows stay relatively close to body (~30–45° flare from torso, NOT 90°)",
      "Push through palms to full extension at top (lockout)",
      "Controlled descent — 2–3 seconds down",
    ],

    commonErrors: [
      "Elbow flare >60° from torso — anterior shoulder capsule stress",
      "Dipping below 90° with poor shoulder mobility — anterior capsule and biceps tendon strain",
      "Shrugging shoulders upward at bottom — trapezius compensation",
      "Forward head position — cervical strain",
    ],

    safetyNote: "Dips are HIGH-risk for shoulder impingement and anterior capsule stress. Those with shoulder issues should limit depth or avoid entirely.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 11. BENCH DIP (Tricep-focused)
  // Sources: McKenzie et al. 2022 PMC9603242
  //          Bench dip: higher shoulder extension ROM than bar dip; lower peak tricep activation
  //          Elbow: ~15° top, ~90° bottom; shoulder extension increases throughout descent
  // ─────────────────────────────────────────────────────────────────────────
  "bench-dip": {
    view: "side",
    primaryMuscles: ["triceps", "anterior_deltoid"],
    phases: ["top (start/end)", "bottom"],

    startingPosition: {
      description: "Hands on bench behind body, feet on floor or elevated surface",
      joints: {
        elbow: 170,           // near-full extension
        shoulder_extension: 0, // arms near neutral at sides/behind
        hip: 90,              // seated — feet out in front
        knee: 90,             // legs extended or bent
        wrist: "neutral, fingers pointing forward",
      },
    },

    bottomPosition: {
      description: "Elbows at 90°; significant shoulder extension/hyperextension",
      joints: {
        elbow: 90,            // ~80–100° flexion
        shoulder_extension: 50, // shoulder driven into extension (greater than bar dip — this is the key biomechanical difference)
        torso_from_vertical: 85, // nearly vertical torso when arms behind body
      },
    },

    keyMovement: {
      primaryMove: "Elbow flexion/extension; shoulder extension",
      rangeOfMotion_elbow: "~80°",
      note: "Shoulder extension range is GREATER in bench dip than bar dip — this elevates anterior shoulder stress",
    },

    criticalFormCues: [
      "Keep body close to the bench — do not drift hips forward",
      "Elbows point STRAIGHT BACK, not flared outward",
      "Stop at 90° elbow — do not let shoulders drop below hands",
      "Hips close to bench throughout movement",
    ],

    commonErrors: [
      "Hips drifting too far forward — increased shoulder hyperextension",
      "Elbow flare — anterior deltoid overload",
      "Excessive depth — anterior capsule, biceps tendon strain",
    ],

    safetyNote: "Bench dip causes GREATER shoulder extension than bar dip (PMC9603242). High risk for anterior shoulder impingement, biceps tendon stress. Bar dip is safer progression.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12. FORWARD LUNGE
  // Sources: PMC3396296 (NCBI lunge biomechanics), Cleveland Clinic,
  //          NASM lunge programming, Runner's World form guide
  //          Front knee: ~90°; back knee: ~90° (hovering 2–5 cm from floor); front shin: vertical
  // ─────────────────────────────────────────────────────────────────────────
  "lunge": {
    view: "side",
    primaryMuscles: ["quadriceps", "gluteus_maximus", "hamstrings", "hip_flexors"],
    phases: ["standing (start)", "lunge bottom", "return to standing"],

    startingPosition: {
      description: "Standing, feet hip-width, torso upright",
      joints: {
        knee: 0,
        hip: 0,
        torso_from_vertical: 0,
      },
    },

    bottomPosition: {
      description: "Front knee at 90°, back knee hovering ~2–5 cm off floor",
      joints: {
        front_knee: 90,       // Cleveland Clinic and NSCA standard
        back_knee: 90,        // hovering near floor, ~85–100° flexion
        front_hip: 90,        // hip flexion on lead leg
        back_hip: 15,         // slight hip extension on trail leg
        front_shin: "vertical — tibia perpendicular to floor",
        torso_from_vertical: 5,  // minimal forward lean for balance
        front_ankle_dorsiflexion: 15, // tibia over foot
      },
      bodyAlignment: "Front knee in line with 2nd–3rd toe; torso vertical; hips level",
    },

    keyMovement: {
      primaryMove: "Step forward, descend vertically until front knee = 90°; return by driving off front heel",
      rangeOfMotion_front_knee: "0° → 90°",
      fixed: "Torso upright; spine neutral; hips level (no tilting)",
    },

    criticalFormCues: [
      "Front shin stays vertical — knee should NOT travel far past toes (minor forward travel is acceptable for healthy knees)",
      "Torso stays vertical — don't lean forward into the lunge",
      "Front knee tracks in line with 2nd toe — no medial collapse (valgus)",
      "Land with HEEL of front foot first, then full foot",
      "Back knee hovers ~2–5 cm off ground at bottom — doesn't slam down",
      "Drive BACK to start through front heel (not toe) to maximize glute activation",
    ],

    commonErrors: [
      "Front knee collapsing inward (valgus) — ACL and MCL stress",
      "Torso leaning too far forward — excess load on front knee",
      "Step too short — front knee far exceeds 90° or foot not flat",
      "Step too long — loss of torso control and hip flexor overstress",
      "Back knee slamming into floor — lack of control",
    ],

    safetyNote: "Front knee going far past toes increases patellofemoral compressive force. Maintain shin vertical or only slightly forward.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 13. GLUTE BRIDGE
  // Sources: PMC5080170 (bridge knee angle variations), Verywellfit, inspireusafoundation
  //          Setup: knees ~90°; top: hip extends to ~0° (full extension — straight line)
  // ─────────────────────────────────────────────────────────────────────────
  "glute-bridge": {
    view: "side",
    primaryMuscles: ["gluteus_maximus", "hamstrings", "erector_spinae"],
    phases: ["floor (start/end)", "top bridge"],

    startingPosition: {
      description: "Supine on floor, knees bent ~90°, feet flat, arms at sides palms down",
      joints: {
        knee: 90,             // optimal for gluteus maximus activation
        hip: 90,              // hip flexed at rest
        ankle: 0,             // neutral
        lumbar: "neutral on floor",
      },
      bodyAlignment: "Feet hip-width, heels directly under knees",
    },

    topPosition: {
      description: "Hips lifted — straight diagonal line shoulder → knee",
      joints: {
        hip: 0,               // full extension (pelvis neutral)
        knee: 90,             // stays at 90° — knees don't straighten
        lumbar: "neutral — NOT hyperextended",
        shoulder_blade_contact: true, // upper back stays on floor
      },
    },

    keyMovement: {
      primaryMove: "Hip extension — glutes and hamstrings drive hips up",
      rangeOfMotion_hip: "~90° → 0° (full extension)",
      fixed: "Knee angle holds at 90° throughout; lower back maintains neutral (no hyperextension at top)",
    },

    criticalFormCues: [
      "SQUEEZE glutes hard at top — hold 1–2 seconds",
      "Posterior pelvic tilt slightly at top — prevents lumbar hyperextension",
      "Drive through HEELS, not toes — increases hamstring and glute activation",
      "Knees stay hip-width throughout — no collapsing inward or outward",
      "Lower back neutral at top — if ribs flare, lumbar is hyperextending",
    ],

    commonErrors: [
      "Hyperextending lumbar at top — ribs flare, low back arches",
      "Feet too far forward — shifts load to hamstrings over glutes",
      "Feet too close — reduces hip extension range",
      "Knee valgus at top — glute medius weakness",
    ],

    safetyNote: "Avoid lumbar hyperextension at top — squeeze glutes, not lower back. If hamstrings cramp, move feet slightly closer.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 14. CRUNCH
  // Sources: Brookbush Institute crunch progression, NSCA crunch analysis,
  //          Drummond Education forensic crunch analysis, physio-pedia spinal ROM
  //          Thoracic flexion: ~15–30°; lumbar: should NOT flex (stay neutral)
  //          Hip: 90° (feet flat on floor with knees bent)
  // ─────────────────────────────────────────────────────────────────────────
  "crunch": {
    view: "side",
    primaryMuscles: ["rectus_abdominis", "external_oblique", "internal_oblique"],
    phases: ["floor (start/end)", "top of crunch"],

    startingPosition: {
      description: "Supine, knees bent ~90°, feet flat, hands lightly behind ears or crossed on chest",
      joints: {
        knee: 90,
        hip: 90,              // legs bent at 90° — prevents hip flexor dominance
        lumbar: 0,            // flat/neutral on floor
        thoracic: 0,          // flat on floor
      },
      bodyAlignment: "Low back lightly pressed to floor; chin slightly tucked (finger-width gap jaw-to-chest)",
    },

    topPosition: {
      description: "Shoulder blades lifted off floor — thoracic flexion; lumbar stays on floor",
      joints: {
        thoracic_flexion: 30,   // shoulder blades ~3–5 cm off floor = ~25–35° thoracic flex
        lumbar: 0,              // lumbar stays neutral/in contact with floor — key differentiator from sit-up
        hip: 90,                // unchanged — legs don't move
        neck: "neutral — slight chin tuck, NOT pulled forward",
      },
    },

    keyMovement: {
      primaryMove: "THORACIC flexion only — upper back curls; lower back stays down",
      rangeOfMotion: "~30° thoracic flexion; shoulder blades lift ~3–5 cm from floor",
      fixed: "Lumbar spine; hips (feet stay grounded); hip flexors NOT the prime mover",
      vs_situp: "Crunch: lumbar stays down; sit-up: full trunk flexion including lumbar and hip flexors",
    },

    criticalFormCues: [
      "CURL the upper spine — imagine bringing ribs toward pelvis",
      "Lower back stays in contact with floor throughout",
      "Hands behind head: elbows point to sides, DO NOT pull neck forward",
      "Exhale fully at top to maximize rectus abdominis contraction (TVA co-activation)",
      "Pause at top 1–2 sec; slow controlled descent",
      "Chin stays tucked — space the size of a tennis ball between chin and chest",
    ],

    commonErrors: [
      "Pulling neck with hands — cervical strain, false range of motion",
      "Hips flexing (feet lifting or hip flexors engaging) — transforms into sit-up",
      "Lower back arching off floor — lumbar extension instead of neutral",
      "Jerking or momentum — reduces muscular time under tension",
    ],

    safetyNote: "Crunch ONLY moves thoracic spine. Lumbar flexion under load (especially sit-ups) increases disc pressure. Spinal disc compression is highest in lumbar flexion.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 15. PLANK (Forearm Plank)
  // Sources: NASM plank exercise library, Hugging Face PoseCoach (hip 170–180°),
  //          muscleandstrong.com plank biomechanics
  //          Full body isometric hold: body should be a rigid plank from head to heel
  // ─────────────────────────────────────────────────────────────────────────
  "plank": {
    view: "side",
    primaryMuscles: ["transverse_abdominis", "rectus_abdominis", "erector_spinae", "glutes"],
    phases: ["single static position — isometric hold"],

    position: {
      description: "Forearm plank: forearms flat, elbows under shoulders, body straight",
      joints: {
        elbow: 90,            // forearm-to-upper-arm at 90°; elbows under shoulders
        shoulder_flexion: 90, // upper arm vertical, forearm on floor
        hip: 175,             // 170–180° — nearly straight line (not piked, not sagged)
        knee: 180,            // fully extended
        ankle: 90,            // dorsiflexed, on toes
        lumbar: "neutral — natural curve maintained (slight lordosis)",
        pelvis: "posterior tilt — abs braced, glutes squeezed slightly",
        torso: "horizontal — parallel to floor ±5°",
      },
      bodyAlignment: "Ear-shoulder-hip-ankle in one straight line when viewed from side",
    },

    keyMovement: {
      primaryMove: "NONE — pure isometric contraction; resist extension of lumbar spine",
      resistedForce: "Gravity pulling hips down (extension) AND up (flexion)",
    },

    criticalFormCues: [
      "Slight posterior pelvic tilt — abs and glutes co-contracted",
      "Push forearms into floor (elbow flexors isometric) to engage serratus anterior",
      "Head neutral — eyes looking down at floor, not forward",
      "Breathe steadily — diaphragm bracing technique",
      "Squeeze glutes to support pelvis against gravity",
      "If form breaks, rest — don't hold a bad plank (reinforces poor motor patterns)",
    ],

    commonErrors: [
      "Hips sagging (dropping below line) — lumbar hyperextension, core disengaged",
      "Hips piked (too high) — hip flexors taking over, not core",
      "Head dropping — cervical strain",
      "Holding breath — increases blood pressure; breathe normally",
      "Elbows too far forward — shifts load away from shoulder girdle",
    ],

    safetyNote: "Hypertension contraindication: plank significantly raises blood pressure. Breathe steadily.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 16. HOLLOW BODY HOLD
  // Sources: GMB Fitness, Barbend, Verywellfit, xcelerategyms (gymnastics)
  //          Gymnastics-standard: arms overhead, legs ~45° off floor
  //          Core: maximal posterior pelvic tilt; lumbar pressed into floor
  // ─────────────────────────────────────────────────────────────────────────
  "hollow-body-hold": {
    view: "side",
    primaryMuscles: ["rectus_abdominis", "transverse_abdominis", "hip_flexors", "obliques"],
    phases: ["single static isometric position"],

    position: {
      description: "Supine; lower back pressed flat; arms extended overhead; legs straight and raised",
      joints: {
        hip_flexion: 45,        // legs raised ~30–45° off floor (beginner to advanced)
        knee: 180,              // legs fully extended (straight)
        shoulder_flexion: 180,  // arms overhead, biceps by ears
        lumbar: 0,              // FLAT — posterior pelvic tilt; natural lordosis eliminated
        pelvis: "maximal posterior tilt — ribs drawn toward hips, low back pressed to floor",
        torso: "upper thoracic slightly lifted — shoulder blades ~2–3 cm off floor",
      },
      progressions: {
        beginner: "Knees bent 90°, thighs raised; arms at sides",
        intermediate: "Legs raised 45°, arms overhead",
        advanced: "Legs as low as possible without lumbar arching (~15–20° from floor)",
      },
    },

    keyMovement: {
      primaryMove: "ISOMETRIC — resist gravity pulling legs down and back extending lumbar",
      goal: "Maintain maximal abdominal bracing while legs are as low as possible",
      scalingRule: "Lower the legs ONLY until lower back lifts off floor — stop there",
    },

    criticalFormCues: [
      "LOW BACK MUST BE FLAT ON FLOOR — the moment it lifts, lower leg height",
      "Posterior pelvic tilt actively maintained — 'press ribs down toward hips'",
      "Arms stretch long behind head, biceps by ears — shoulder flexors active",
      "Squeeze legs together, toes pointed",
      "Breathe: exhale fully first, then maintain brace while breathing shallowly",
    ],

    commonErrors: [
      "Lumbar arching off floor — hip flexors dominating, abs disengaged",
      "Legs too low for current strength — lumbar lifts",
      "Arms dropping (shoulder fatigue) — breaks the hollow position",
      "Head jutting forward instead of ears between arms",
    ],

    safetyNote: "Lumbar arching off floor completely negates the exercise and loads the hip flexors. Start with legs high and progress down.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 17. MOUNTAIN CLIMBER
  // Sources: NSCA core exercise database, upliftlabs biomechanics
  //          Start: plank position; drive knee to ~90° hip flexion
  // ─────────────────────────────────────────────────────────────────────────
  "mountain-climber": {
    view: "side",
    primaryMuscles: ["hip_flexors", "rectus_abdominis", "shoulder_stabilizers", "quadriceps"],
    phases: ["plank (start)", "knee drive (working)"],

    startingPosition: {
      description: "High plank — arms extended, wrists under shoulders, body straight",
      joints: {
        elbow: 175,           // nearly fully extended
        shoulder_flexion: 85, // upper arm slightly forward of vertical
        hip: 175,             // near-full extension (flat body line)
        knee: 175,            // near-full extension
        torso: "horizontal — same as push-up top position",
      },
    },

    workingPosition: {
      description: "One knee driven toward chest; other leg extended",
      joints: {
        driving_knee: 90,     // hip flexes ~90°; knee pulled toward chest
        driving_hip: 90,      // ~80–100° hip flexion at full drive
        extended_leg_hip: 175, // maintains near-full extension
        extended_leg_knee: 175,
        torso: "stays parallel to floor — NO hip pike",
        elbow: 175,           // arms stay extended throughout
      },
    },

    keyMovement: {
      primaryMove: "Alternating hip flexion (knee drive) while maintaining plank position",
      tempo: "Fast for cardio; slow for core stability",
      fixed: "Hips do NOT rise during knee drive; spine stays neutral",
    },

    criticalFormCues: [
      "Hips stay level with shoulders — no piking up during knee drive",
      "Drive knee toward CHEST (not hip), maximizing hip flexion",
      "Wrists stay under shoulders — do not walk hands forward",
      "Foot returns to full extension before other leg drives",
      "Core braced throughout — resist rotational force during alternation",
    ],

    commonErrors: [
      "Hips piking up — compromises plank position, reduces core demand",
      "Bouncing hips — hip rotational momentum substitutes for core stability",
      "Insufficient knee drive — reduces hip flexor ROM and core demand",
      "Shoulder protraction collapse — elbows bending under fatigue",
    ],

    safetyNote: "Wrist pain: use hex dumbbells as handles for neutral wrist. Shoulder fatigue: ensure scapulae are protracted and stabilized.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 18. RUSSIAN TWIST
  // Sources: genghisfitness.com, NASM Russian twist, ritfitsports.com
  //          Torso: ~45° from floor; trunk rotation: ~30–45° each side
  // ─────────────────────────────────────────────────────────────────────────
  "russian-twist": {
    view: "45_overhead",
    primaryMuscles: ["external_oblique", "internal_oblique", "rectus_abdominis"],
    phases: ["center (start)", "rotated (side)"],

    startingPosition: {
      description: "Seated on floor, knees bent ~90°, heels grounded or slightly raised, torso ~45° from floor",
      joints: {
        torso_from_floor: 45, // ~40–50° lean back (closer to vertical = easier; more lean = harder)
        knee: 90,             // knees bent
        hip: 45,              // hip flexed to match torso angle
        lumbar: "slight flexion — but C-curve maintained, not collapsed",
        arms_position: "extended forward, hands clasped or holding weight at chest level",
      },
    },

    rotatedPosition: {
      description: "Trunk rotated to one side — weight touches floor beside hip",
      joints: {
        trunk_rotation: 45,   // ~30–50° rotation from center line (normal trunk rotation ROM = 30–40°)
        torso_from_floor: 45, // same lean maintained
        arms: "extended, hands/weight moved to rotated side",
      },
    },

    keyMovement: {
      primaryMove: "Trunk rotation in transverse plane, alternating left and right",
      rangeOfMotion: "~30–45° each side (total 60–90° rotation)",
      fixed: "Torso lean (45°) stays constant; hips do NOT rotate with trunk",
    },

    criticalFormCues: [
      "Rotate from the THORACIC spine — ribs rotate, hips stay fixed",
      "Keep feet together and minimize hip rotation — obliques do the work",
      "Maintain 45° torso lean throughout — don't sit up or drop back",
      "Exhale on each rotation; controlled tempo (not fast swinging)",
      "Weight stays close to body — don't extend arms far out",
    ],

    commonErrors: [
      "Hips rotating with trunk — hip flexors and TFL doing the work",
      "Collapsing torso angle — losing the isometric hip flexor demand",
      "Momentum swinging — reduces oblique activation",
      "Flexing lumbar spine under rotation — disc pressure concern under load",
    ],

    safetyNote: "Spinal rotation under flexion and load (especially heavy weight) increases lumbar disc stress. Use bodyweight or light load. Not appropriate for those with disc pathology.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 19. LEG RAISE (Lying Straight-Leg Raise)
  // Sources: PMC4395661 (NCBI rectus femoris/abdominis ratio), NFPT analysis,
  //          exrx.net lying leg raise goni (good = 80–100°), liftmanual
  //          Hip flexion: 0° → 90° (vertical); lower abs isometric from ~0–90°
  // ─────────────────────────────────────────────────────────────────────────
  "leg-raise": {
    view: "side",
    primaryMuscles: ["iliopsoas", "rectus_abdominis_lower", "hip_flexors", "rectus_femoris"],
    phases: ["floor (start/end)", "legs vertical (top)"],

    startingPosition: {
      description: "Supine, legs straight, arms at sides palms down for support",
      joints: {
        hip: 0,               // legs flat on floor (full hip extension)
        knee: 180,            // fully extended
        lumbar: "neutral",
        pelvis: "neutral — not anterior tilted",
      },
    },

    topPosition: {
      description: "Legs raised to vertical (90° hip flexion)",
      joints: {
        hip: 90,              // legs perpendicular to floor = peak contraction
        knee: 180,            // legs remain straight
        lumbar: "neutral or slight posterior tilt to protect lower back",
      },
    },

    keyMovement: {
      primaryMove: "Hip flexion 0° → 90°; abs stabilize pelvis isometrically against hip flexor pull",
      rangeOfMotion_hip: "0° → 90°",
      critical_mechanics: "Below 90°: iliopsoas + rectus femoris + adductors active; above 90°: iliopsoas only",
      fixed: "Lumbar spine — must NOT arch off floor during descent",
    },

    criticalFormCues: [
      "Press lower back INTO floor before lifting — activate TVA first",
      "Lower legs SLOWLY (3–5 sec) — this is where abs work hardest (eccentric isometric)",
      "Stop descent just before lower back arches — this is YOUR active range",
      "Legs stay together, toes pointed",
      "Breathe: exhale on the way up; inhale on controlled descent",
    ],

    commonErrors: [
      "Lower back arching off floor during descent — hip flexors dominating, ab control lost",
      "Legs dropping quickly (momentum) — loses eccentric stimulus",
      "Partial range (only going to 45°) — missing the hardest part of the movement",
      "Knees bending — reduces leverage and hip flexor length",
    ],

    safetyNote: "When back arches off floor, STOP — this means you've exceeded your current core strength. Bend knees slightly to regress if needed.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 20. BARBELL BENCH PRESS
  // Sources: Stronglifts bench press guide (elbow 75°), JSAMS grip/angle study,
  //          UMich biomechanics (narrow ROM 125°, wide ROM 66°),
  //          StrongerByScience bench press guide
  //          Standard grip: 1.5–2x shoulder-width; elbows ~45–75° from torso
  // ─────────────────────────────────────────────────────────────────────────
  "barbell-bench-press": {
    view: "side",
    primaryMuscles: ["pectoralis_major", "anterior_deltoid", "triceps"],
    phases: ["top (start/end — arms extended)", "bottom (bar to chest)"],

    startingPosition: {
      description: "Supine on bench, bar locked out overhead, grip 1.5–2x shoulder-width",
      joints: {
        elbow: 175,           // near-full extension at lockout
        shoulder_flexion: 90, // upper arm perpendicular to torso in sagittal plane
        shoulder_abduction: 45, // elbows at 45–75° from torso (NOT 90° — reduces impingement)
        wrist: "neutral — NOT extended; forearm vertical when bar at chest",
        lumbar: "slight natural arch — 'arch' does not mean excessive hyperextension",
        upper_back: "retracted and depressed scapulae — 'chest up' position",
        feet: "flat on floor or elevated — braced into floor",
      },
      bodyAlignment: "5 points of contact: feet, glutes, upper back, both hands on bar",
    },

    bottomPosition: {
      description: "Bar touches mid-sternum or lower pec line",
      joints: {
        elbow: 90,            // ~80–100° at bar touch; forearm perpendicular to floor (vertical)
        shoulder_abduction: 55, // elbows at ~45–75° from torso — NOT 90° (powerlifting tuck is 45°; bodybuilding is ~60–75°)
        shoulder_flexion: 60,   // slight shoulder horizontal abduction when bar at chest
        wrist: "neutral — forearm vertical = maximum force transfer",
        bar_touchpoint: "mid-sternum to lower pec; NOT throat or upper chest",
      },
    },

    keyMovement: {
      primaryMove: "Shoulder horizontal adduction + elbow extension; bar travels in slight arc (not straight up)",
      rangeOfMotion_elbow: "~85° (175° → 90°)",
      barPath: "Slight arc: starts over shoulders at lockout, moves to lower chest at bottom",
      fixed: "Shoulder blades stay retracted and depressed; wrists neutral; feet braced",
    },

    criticalFormCues: [
      "Elbows at 45–75° angle from torso — NOT flared to 90° (reduces anterior shoulder stress)",
      "Forearms VERTICAL at bottom — ensures proper mechanical advantage",
      "Scapulae retracted and depressed before unracking — 'proud chest' position",
      "Bar touches chest — not hovering 5 cm above",
      "Drive feet into floor and squeeze glutes for leg drive and stability",
      "Arc the bar — liftoff over shoulder line, lower to chest, press back over shoulder",
    ],

    commonErrors: [
      "Elbows flared to 90° — anterior shoulder stress, pec minor tightening",
      "Bouncing bar off chest — removes eccentric stimulus and dangerous to sternum",
      "Wrists hyperextended — forces at wrist joint instead of through forearm",
      "Butt rising off bench — spinal compression, loses stability base",
      "Bar over throat or face — dangerous bar path",
    ],

    safetyNote: "ALWAYS use a spotter or safety bars. Elbow flare >75° significantly increases anterior shoulder injury risk.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 21. BARBELL BENT-OVER ROW
  // Sources: liftmanual.com, strongermobileapp, startingstrength, barbend
  //          Torso: ~45° from horizontal (or ~45° from vertical); elbows to hips
  // ─────────────────────────────────────────────────────────────────────────
  "barbell-row": {
    view: "side",
    primaryMuscles: ["latissimus_dorsi", "rhomboids", "trapezius_mid", "biceps", "posterior_deltoid"],
    phases: ["hanging (start/end)", "row (bar to lower chest/upper abs)"],

    startingPosition: {
      description: "Hip-hinge position, torso ~45° from horizontal, bar hanging, overhand grip",
      joints: {
        torso_from_horizontal: 45, // ~40–50° from horizontal = 40–50° forward from vertical
        hip: 45,              // hip flexion equals torso angle
        knee: 20,             // slight bend for stability
        elbow: 175,           // fully extended — arms hang straight
        lumbar: "neutral lordosis",
        grip: "double-overhand, ~1.5x shoulder-width",
      },
      bodyAlignment: "Bar directly under shoulder joint; weight balanced over mid-foot",
    },

    topPosition: {
      description: "Bar pulled to lower sternum / upper abs; elbows past torso",
      joints: {
        elbow: 90,            // approximately 90° at bar contact — elbows pulled past torso level
        shoulder_extension: 30, // humerus pulled back past torso
        scapula: "fully retracted and slightly depressed at top",
        torso_from_horizontal: 45, // stays same — no hip drive
        wrist: "neutral",
      },
    },

    keyMovement: {
      primaryMove: "Shoulder extension + horizontal adduction + elbow flexion (elbows drive back)",
      rangeOfMotion_elbow: "~85° (175° → 90°)",
      pullTarget: "Overhand: bar to lower sternum/navel area; elbows ~45° from torso",
      fixed: "Torso angle stays fixed; no hip extension 'cheat'; spine neutral",
    },

    criticalFormCues: [
      "Drive ELBOWS back past torso line — don't just bend arms",
      "Squeeze shoulder blades together at top — full retraction",
      "Torso angle stays constant — using hip extension to row is cheating",
      "Bar stays close to body, dragging along legs in descent",
      "Breathe: inhale before pull, exhale at row, inhale on descent",
    ],

    commonErrors: [
      "Using hip extension to swing bar up — lumbar risk, lat not loaded",
      "Elbow flare >45° — shifts from lat to posterior deltoid/rear delt emphasis",
      "Torso rounding (spinal flexion under load) — lumbar disc risk",
      "Half reps — not achieving full scapular retraction at top",
    ],

    safetyNote: "Back remains neutral at all times. Rounding under heavy barbell row loads is a primary mechanism of lumbar disc injury.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 22. OVERHEAD PRESS (Barbell, Standing)
  // Sources: ResearchGate OHP exploration study, UMich MVS330 (min 182°, max 312° = 130° ROM),
  //          larsonsportsortho (45° arm angle), Frontiers sticking region analysis
  //          Start: bar at clavicle/chin level, elbows ~70° below horizontal;
  //          End: bar locked out directly overhead, arms vertical
  // ─────────────────────────────────────────────────────────────────────────
  "overhead-press": {
    view: "side",
    primaryMuscles: ["deltoid_anterior", "deltoid_medial", "triceps", "trapezius_upper", "serratus"],
    phases: ["rack/start position (bar at clavicle)", "lockout (overhead)"],

    startingPosition: {
      description: "Bar at upper chest/clavicle, elbows slightly forward of torso, grip ~1.5x shoulder-width",
      joints: {
        elbow: 90,              // ~80–100° at start, upper arm parallel to floor at rack
        shoulder_flexion: 20,    // arms slightly forward of torso in sagittal plane
        shoulder_abduction: 45,  // elbows at ~45° from torso — in scapular plane
        torso_from_vertical: 0,  // upright
        wrist: "neutral — bar rests on heel of palm",
        bar_position: "touching upper chest/clavicle, chin slightly tilted back",
      },
    },

    lockoutPosition: {
      description: "Arms locked out directly overhead; bar over mid-foot",
      joints: {
        elbow: 175,             // near-full extension
        shoulder_flexion: 180,   // arms fully overhead (shoulder in full flexion)
        torso_from_vertical: 0,  // torso stays vertical
        bar_over: "directly over mid-foot — balance point",
      },
    },

    keyMovement: {
      primaryMove: "Shoulder flexion (press overhead) + elbow extension; slight torso lean back at start, then head moves through as bar passes face",
      rangeOfMotion_elbow: "~85° (90° → 175°)",
      rangeOfMotion_shoulder: "~20° → 180° flexion",
      barPath: "Slight arc to avoid forehead: back at start, vertical after clearing forehead",
    },

    criticalFormCues: [
      "At start: elbows SLIGHTLY in front of bar (not behind), upper arm roughly parallel to floor",
      "Press bar UP — then head moves THROUGH as bar clears head level",
      "Lock hips and glutes before pressing — prevents lumbar hyperextension",
      "Bar finishes over mid-foot, over base of support — not drifting forward",
      "Wrists stay stacked over elbows — not bent back",
      "Breathe: big breath before press, hold through sticking region (~70% of way up)",
    ],

    commonErrors: [
      "Elbow flare beyond 90° at start — shoulder impingement",
      "Lumbar hyperextension during press — abs not braced, hip not locked",
      "Bar path too far forward — imbalances and reduced mechanical advantage",
      "Pressing with upright torso when bar is in front of body — moment arm on low back",
      "Wrist extension (bent back) — pain and reduced force transfer",
    ],

    safetyNote: "Avoid excessive lumbar hyperextension. If unable to press overhead without lumbar arch, mobility work needed (lat/thoracic).",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 23. CALF RAISE (Standing, Double-Leg)
  // Sources: ResearchGate gastrocnemius ROM study (ROM -25° to +25°, 0° = neutral),
  //          Normal ankle: dorsiflexion ~20°, plantarflexion ~50°; ACSM ankle norms
  // ─────────────────────────────────────────────────────────────────────────
  "calf-raise": {
    view: "side",
    primaryMuscles: ["gastrocnemius", "soleus"],
    phases: ["bottom (dorsiflexed/heel drop)", "top (plantarflexed/heel rise)"],

    startingPosition: {
      description: "Standing on edge of step, heels hanging below platform level",
      joints: {
        ankle_dorsiflexion: 20, // ~15–25° dorsiflexion at bottom (heels below platform)
        knee: 0,                // fully extended — targets gastrocnemius
        hip: 0,                 // standing upright
        torso_from_vertical: 0,
      },
      note: "Bent-knee variation: knee ~20–30° flexion — shifts emphasis to soleus (bypasses gastrocnemius bi-articular limit)",
    },

    topPosition: {
      description: "Maximum plantarflexion — up on toes, heels high",
      joints: {
        ankle_plantarflexion: 45, // ~40–50° plantarflexion at peak; full ROM = ~65–70° passive
        knee: 0,
        torso_from_vertical: 0,
      },
    },

    keyMovement: {
      primaryMove: "Ankle plantarflexion (dorsiflexion at bottom to plantarflexion at top)",
      rangeOfMotion_ankle: "~65° total (25° dorsiflexion → 40° plantarflexion)",
      fixed: "Knee stays extended throughout (straight-leg = gastrocnemius target)",
    },

    criticalFormCues: [
      "Full ROM: complete the bottom stretch (heel drop) AND full rise",
      "Pause at top 2 sec to maximize gastrocnemius peak contraction",
      "Controlled eccentric (3–5 sec down) — gastrocnemius is most responsive to eccentric load",
      "Don't rotate toes inward or outward — neutral foot position targets even gastrocnemius heads",
      "Keep weight over ball of foot — not drifting to big or little toe",
    ],

    commonErrors: [
      "Partial ROM — no heel drop at bottom (loses stretch-shortening benefit)",
      "Fast, bouncing reps — momentum replaces muscular work",
      "Knee bent (on a straight-leg variation) — changes muscle emphasis",
      "Excessive forward lean of torso — load shifts",
    ],

    safetyNote: "Achilles tendinopathy: avoid deep stretch at bottom. Begin with reduced ROM and progress gradually.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 24. JUMP SQUAT
  // Sources: Frontiers 2025 SJ biomechanics (knee 70°/90°/110° at takeoff),
  //          upliftlabs squat jump (knees ~90° at initiation), JSCR 2010 squat kinematics
  // ─────────────────────────────────────────────────────────────────────────
  "jump-squat": {
    view: "side",
    primaryMuscles: ["quadriceps", "gluteus_maximus", "gastrocnemius", "hamstrings"],
    phases: ["descent (squat)", "takeoff", "flight", "landing"],

    descentPosition: {
      description: "Quarter-to-parallel squat for jump initiation",
      joints: {
        knee: 90,             // ~70–100° at takeoff initiation (Frontiers 2025: SJ90 is standard)
        hip: 70,
        ankle_dorsiflexion: 20,
        torso_from_vertical: 20,
      },
    },

    takeoffPosition: {
      description: "Triple extension — hip, knee, and ankle fully extended",
      joints: {
        knee: 0,              // full extension at toe-off
        hip: 0,               // full extension
        ankle_plantarflexion: 40, // plantarflexion drives takeoff
        torso_from_vertical: 5,
      },
    },

    landingPosition: {
      description: "Soft landing — simultaneous knee, hip, ankle flexion to absorb impact",
      joints: {
        knee: 45,             // ~30–60° at initial contact — load absorption
        hip: 40,
        ankle_dorsiflexion: 20,
        torso_from_vertical: 20,
      },
      note: "Landing mechanics are CRITICAL for ACL injury prevention",
    },

    keyMovement: {
      primaryMove: "Triple extension (hip + knee + ankle) for takeoff; triple flexion for landing",
      rangeOfMotion_knee: "~90° → 0° (takeoff); 0° → 45° (landing)",
    },

    criticalFormCues: [
      "Full triple extension at takeoff — don't leave knees bent",
      "Arms swing up for momentum and power transfer",
      "Land softly — balls of feet first, then heels drop to absorb",
      "Knees track over toes on landing — NO knee valgus",
      "Land with knees ~45° flexed — not stiff-legged",
    ],

    commonErrors: [
      "Stiff-legged landing — joint impact forces 3–7x BW transferred to knees and hips",
      "Knee valgus on landing — primary mechanism of non-contact ACL injuries",
      "Insufficient descent depth — reduced power output",
      "Landing on heels only — shock concentrated in spine",
    ],

    safetyNote: "CRITICAL: Knee valgus on landing is the #1 ACL injury mechanism in jump sports. Always cue 'knees out' on landing.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 25. BURPEE
  // Sources: genghisfitness.com, NASM squat-thrust burpees, liftmanual burpee
  //          Multi-phase: stand → squat → plank → push-up → squat → jump
  // ─────────────────────────────────────────────────────────────────────────
  "burpee": {
    view: "side",
    primaryMuscles: ["full_body", "quadriceps", "pectoralis", "triceps", "core", "glutes"],
    phases: ["stand", "squat-down", "plank", "push-up", "squat-up", "jump"],

    phaseAngles: {
      standing: {
        knee: 0, hip: 0, elbow: 175, torso: 0,
      },
      squat_down: {
        knee: 90,             // squat to ~90° to place hands
        hip: 90,
        elbow: 175,
        torso_from_vertical: 45,
      },
      plank: {
        // same as push-up start
        elbow: 175, hip: 175, knee: 175, torso_from_vertical: 90,
        bodyLine: "Head-spine-heel straight line",
      },
      push_up_bottom: {
        elbow: 90, hip: 175, knee: 175,
      },
      squat_up: {
        knee: 90, hip: 90, torso_from_vertical: 45,
        jumpReady: "Feet land under hips from plank jump",
      },
      jump: {
        knee: 0, hip: 0, ankle: "full plantarflexion",
        arms: "fully extended overhead",
      },
    },

    keyMovement: {
      primaryMove: "6-phase sequence: stand → squat + hand plant → jump-back to plank → push-up → jump-forward to squat → vertical jump",
      tempo: "Continuous fluid movement; each phase transitions without pause",
    },

    criticalFormCues: [
      "Hands land directly under shoulders in plank — not too wide or narrow",
      "Keep plank form during push-up — no hip sag",
      "Jump feet back AS FAR as squat position (under hips), not partial",
      "Full extension at jump — arms overhead, ankles plantarflexed",
      "Land softly from final jump — knees absorbing, not stiff",
    ],

    commonErrors: [
      "Hips sagging in plank/push-up phase — lumbar load",
      "Not jumping feet fully back under hips — creates crouched awkward posture",
      "No push-up in push-up phase — skipping key stimulus",
      "Stiff-legged landing from jump — excessive joint impact",
    ],

    safetyNote: "High repetition burpees at speed with deteriorating form are a significant injury risk. Prioritize form over speed.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 26. DUMBBELL SHOULDER PRESS (Seated or Standing)
  // Sources: kinxlearning.com seated OHP mechanics, NASM DB press,
  //          UMich MVS330 shoulder press (182°–312°, ROM 130°)
  //          Similar to barbell OHP but wider initial shoulder abduction
  // ─────────────────────────────────────────────────────────────────────────
  "dumbbell-shoulder-press": {
    view: "front_side",
    primaryMuscles: ["deltoid_anterior", "deltoid_medial", "triceps", "trapezius"],
    phases: ["start (dumbbells at ear level)", "lockout overhead"],

    startingPosition: {
      description: "Seated/standing, dumbbells at ear level, elbows bent ~90°, elbows ~90° below horizontal",
      joints: {
        elbow: 90,              // ~90° at start (upper arms parallel to floor — or slightly higher)
        shoulder_abduction: 90,  // upper arms out to sides — 90° abduction at start
        shoulder_flexion: 15,   // slightly forward of pure lateral (in scapular plane)
        wrist: "neutral — dumbbells face forward (pronated grip)",
        torso_from_vertical: 0,
      },
      dumbbell_position: "At jaw/ear level, palms facing forward",
    },

    lockoutPosition: {
      description: "Arms locked overhead, elbows slightly soft, dumbbells together or close",
      joints: {
        elbow: 165,             // near-full extension (not hyperextended)
        shoulder_flexion: 175,  // full overhead position
        torso_from_vertical: 0,
      },
    },

    keyMovement: {
      primaryMove: "Shoulder flexion + abduction combined → overhead; elbow extension",
      rangeOfMotion_elbow: "~75° (90° → 165°)",
      rangeOfMotion_shoulder: "~90° abduction → 175° flexion (arms come closer overhead)",
    },

    criticalFormCues: [
      "Start with elbows below shoulder height — upper arms parallel to floor or slightly lower",
      "Press dumbbells slightly inward as they rise — follow the natural arc",
      "Core braced — no lumbar hyperextension to assist press",
      "Retract and depress scapulae before pressing",
      "Avoid touching/banging dumbbells overhead — excessive adduction",
    ],

    commonErrors: [
      "Elbows too far forward at start (like chin-up grip) — front delt only",
      "Lumbar hyperextension under heavy load — compressive disc force",
      "Shrugging at top — upper trap compensating for weak deltoid",
    ],

    safetyNote: "Rotator cuff caution: if shoulder pain at start position, reduce elbow height below horizontal. In-line with or just below shoulder is safer.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 27. ARNOLD PRESS
  // Sources: genghisfitness.com Arnold press EMG, barbend, liftmanual, healthline
  //          Start: palms facing body (like end of bicep curl), elbows at chest level
  //          Rotation: internal → external rotation as dumbbells press overhead
  // ─────────────────────────────────────────────────────────────────────────
  "arnold-press": {
    view: "front_side",
    primaryMuscles: ["deltoid_anterior", "deltoid_medial", "deltoid_posterior", "triceps"],
    phases: ["start (palms in)", "mid (rotation)", "lockout (palms forward/out)"],

    startingPosition: {
      description: "Seated, dumbbells at shoulder height, palms facing body (like reverse curl position), elbows ~90° in front of body",
      joints: {
        elbow: 90,
        shoulder_flexion: 70,   // arms forward — like holding a heavy ball in front of chest
        shoulder_rotation: "internally rotated — palms facing you",
        torso_from_vertical: 0,
      },
      dumbbell_position: "Dumbbells close together in front of face, palms facing face",
    },

    lockoutPosition: {
      description: "Arms locked overhead, palms facing away (fully externally rotated)",
      joints: {
        elbow: 165,
        shoulder_flexion: 175,
        shoulder_rotation: "externally rotated — palms facing forward/outward at top",
      },
    },

    rotationMechanism: {
      description: "As dumbbells press up, wrists rotate externally (palms go from facing body → facing forward)",
      rotation_range: "~180° wrist rotation (pronation → supination of forearm / internal → external humeral rotation)",
      when: "Rotation happens throughout the press — starts rotating immediately at initiation",
    },

    keyMovement: {
      primaryMove: "Shoulder press + simultaneous external rotation of humerus throughout ROM",
      advantage_vs_standard: "Greater anterior deltoid activation at start due to internal rotation starting position; broader shoulder recruitment via rotation",
    },

    criticalFormCues: [
      "Start with elbows close together in front of face — very different from standard DB press start",
      "Rotation is CONTINUOUS — don't rotate all at once or wait until top",
      "At top: palms fully face away — complete the external rotation",
      "Reverse exactly on way down: rotate back to palms-in as elbows return to front",
      "Keep core braced — the rotational movement can induce lateral torso lean",
    ],

    commonErrors: [
      "Not completing rotation — partial internal-to-external rotation reduces range benefit",
      "Starting with arms too wide (like standard DB press) — misses the key starting position",
      "Rotating at wrist only (forearm rotation only) instead of full shoulder external rotation",
      "Leaning back to assist press — lumbar hyperextension",
    ],

    safetyNote: "The rotational component increases shoulder joint complexity. Those with shoulder impingement should get clearance before performing Arnold press.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 28. TRICEP DIP (= PARALLEL BAR DIP re-labeled as tricep-focused variant)
  // This entry covers the TRICEP-FOCUSED DIP variant with upright torso
  // See also: "dip" (general) and "bench-dip" entries above
  // ─────────────────────────────────────────────────────────────────────────
  "tricep-dip": {
    view: "side",
    primaryMuscles: ["triceps", "anterior_deltoid"],
    note: "This is the upright-torso variant of the parallel bar dip, emphasizing triceps over pectorals",

    startingPosition: {
      description: "Parallel bars, arms extended, torso UPRIGHT (vertical), minimal forward lean",
      joints: {
        elbow: 170,
        torso_from_vertical: 0,  // KEY DIFFERENCE from pec dip — torso vertical
        shoulder: "neutral",
        legs: "straight down or crossed behind",
      },
    },

    bottomPosition: {
      description: "Elbows at ~90°, torso stays upright",
      joints: {
        elbow: 90,
        shoulder_extension: 30,
        torso_from_vertical: 5,  // minimal lean — stays mostly vertical
      },
    },

    keyMovement: {
      primaryMove: "Elbow flexion/extension with upright torso",
      tricep_emphasis: "Upright torso keeps humerus more vertical, loading triceps as primary mover (elbow extension focus)",
      pec_emphasis: "Forward torso lean shifts load to pectorals",
    },

    criticalFormCues: [
      "Keep torso as vertical as possible — this maximizes triceps activation",
      "Elbows stay close to body — track at sides (~30° flare, NOT 90°)",
      "Full extension at top — squeeze triceps at lockout",
      "Stop at 90° elbow — not below if any shoulder discomfort",
    ],

    commonErrors: [
      "Torso leaning forward excessively — pec dip, not tricep dip",
      "Elbows flaring — anterior shoulder stress",
      "Not locking out — missing tricep peak contraction",
    ],

    safetyNote: "Same as parallel bar dip. Anterior shoulder stress increases with depth. Stop at 90° elbow flexion.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 29. SKULL CRUSHER (Lying Triceps Extension / EZ Bar)
  // Sources: Men's Health skull crusher guide, fitbod, gravitus, inspireusa
  //          Upper arm: ~90° from floor (vertical); elbow moves from 180° → ~20–30° at bottom
  // ─────────────────────────────────────────────────────────────────────────
  "skull-crusher": {
    view: "side",
    primaryMuscles: ["triceps_long_head", "triceps_lateral_head", "triceps_medial_head"],
    phases: ["extended (start/end — bar overhead)", "bottom (bar near forehead)"],

    startingPosition: {
      description: "Supine on flat bench, arms extended overhead holding bar directly over face/forehead, upper arms VERTICAL",
      joints: {
        elbow: 175,             // near full extension
        shoulder_flexion: 90,   // upper arms perpendicular to torso (pointing toward ceiling)
        shoulder_angle: "~91–92° — slightly past vertical per Men's Health (to keep tension)",
        wrist: "neutral grip on EZ bar or pronated on straight bar",
        lumbar: "neutral — slight natural arch",
      },
      upper_arm_position: "VERTICAL to floor and stays fixed throughout — CRITICAL",
    },

    bottomPosition: {
      description: "Bar lowered to 1 cm above forehead (skull crusher origin), elbows fully flexed",
      joints: {
        elbow: 20,              // ~20–30° at full flexion — bar near forehead
        shoulder_flexion: 90,   // upper arm STAYS VERTICAL — does NOT move
        wrist: "neutral",
      },
    },

    keyMovement: {
      primaryMove: "Elbow flexion only; upper arm stays fixed vertical",
      rangeOfMotion_elbow: "~155° (175° → 20°)",
      fixed: "UPPER ARM — any shoulder movement reduces tricep isolation",
      emphasis_long_head: "Long head of triceps is stretched maximally when shoulder is flexed (arm overhead)",
    },

    criticalFormCues: [
      "Upper arms MUST remain vertical and stationary throughout — only elbows move",
      "Lower bar to forehead or slightly behind head (not to chin/chest — different exercise)",
      "Control the descent — skull crusher got its name for a reason",
      "Squeeze triceps at full extension — don't hyperextend elbow",
      "Elbows stay shoulder-width — don't let them flare out or pinch in excessively",
    ],

    commonErrors: [
      "Upper arms drifting forward during descent — becomes a pullover/combined movement",
      "Bar path going to chest instead of forehead — losing tricep isolation",
      "Elbows flaring wide — elbow joint stress",
      "Too fast on descent — control is essential with bar near head",
    ],

    safetyNote: "ALWAYS use a spotter or work with moderate load. Bar near face with arm fatigue is genuinely dangerous. Elbow tendinopathy is common with excessive frequency.",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 30. FACE PULL (Cable Rope, Rear Delt / External Rotation)
  // Sources: wellfitinsider, liftmanual, gravitus, exerciselibrary, fitbod
  //          Cable at face height; elbows driven out and BACK; end: hands wide, thumbs back
  // ─────────────────────────────────────────────────────────────────────────
  "face-pull": {
    view: "side_front",
    primaryMuscles: ["posterior_deltoid", "infraspinatus", "teres_minor", "rhomboids", "trapezius_mid"],
    phases: ["extended (start — arms forward)", "pulled (end — rope at face)"],

    startingPosition: {
      description: "Standing, cable at head height, arms extended, rope gripped with neutral hands",
      joints: {
        elbow: 170,             // near-full extension
        shoulder_flexion: 90,   // arms horizontal, pointing toward cable
        shoulder_horizontal_abduction: 0, // arms directly forward
        torso_from_vertical: 0,
        cable_height: "set at approximately nose/eye level",
      },
    },

    topPosition: {
      description: "Rope pulled to face; hands wide of ears, thumbs pointed back; elbows flared UP and BACK",
      joints: {
        elbow: 90,              // ~90° elbow flexion at end position
        shoulder_horizontal_abduction: 90, // elbows out ~90° from torso (horizontal abduction)
        shoulder_external_rotation: 90, // forearms point upward at end — 90° external rotation
        shoulder_height: "elbows at or above shoulder height — CRITICAL for posterior delt activation",
        wrist: "neutral — thumbs pointing posteriorly at end",
      },
      handPosition: "Hands come to face level, wide apart, thumbs pointing back and away",
    },

    keyMovement: {
      primaryMove: "Shoulder horizontal abduction + external rotation; rope pulled to face level",
      rangeOfMotion_shoulder_abduction: "0° → 90° horizontal abduction",
      rangeOfMotion_external_rotation: "0° → 90°",
      fixed: "Torso upright; no hip extension; elbows stay above shoulder height",
    },

    criticalFormCues: [
      "Drive elbows OUT and UP — not just back horizontally",
      "At end position: forearms point toward ceiling, creating 'W' or 'Y' shape",
      "Squeeze shoulder blades together at end — full scapular retraction",
      "Keep elbows at or above shoulder height throughout pull",
      "Rotate the rope apart (pull rope ends wide) as you pull back",
    ],

    commonErrors: [
      "Elbows dropping below shoulder level — shifts from posterior delt/rotators to mid-lat",
      "Not completing external rotation — forearms staying horizontal instead of pointing up",
      "Pulling with biceps only (no shoulder external rotation) — no rotator cuff benefit",
      "Excessive weight — causes form breakdown and spinal compensation",
    ],

    safetyNote: "Face pull is one of the safest shoulder exercises when done correctly. It directly opposes impingement. Dropping elbows makes it less safe and less effective.",
  },

}; // end EXERCISE_BIOMECHANICS

// ─────────────────────────────────────────────────────────────────────────────
// JOINT ANGLE REFERENCE TABLE (Quick lookup for animation keyframes)
// All angles in degrees; standard convention: 0° = anatomical position
// ─────────────────────────────────────────────────────────────────────────────
export const JOINT_ANGLE_REFERENCE = {
  push_up:              { elbow_bottom: 90, elbow_top: 170, shoulder_abduction: 45 },
  squat_parallel:       { knee: 90, hip: 90, torso_forward: 30, ankle_df: 25 },
  squat_deep:           { knee: 130, hip: 100, torso_forward: 35, ankle_df: 30 },
  deadlift_start:       { knee: 55, hip: 55, torso_from_vertical: 45 },
  deadlift_lockout:     { knee: 0, hip: 0, torso_from_vertical: 0 },
  rdl_bottom:           { knee: 15, hip: 70, torso_from_vertical: 65 },
  bicep_curl_bottom:    { elbow: 170 },
  bicep_curl_top:       { elbow: 40 },
  bicep_curl_max_torque:{ elbow: 90 },
  lateral_raise_top:    { shoulder_abduction: 90, scapular_plane: 30 },
  pull_up_hang:         { elbow: 168, shoulder_flexion: 180 },
  pull_up_top:          { elbow: 32 },
  chin_up_top:          { elbow: 30 },
  dip_bottom:           { elbow: 90, shoulder_extension: 45 },
  bench_dip_bottom:     { elbow: 90, shoulder_extension: 50 },
  lunge_bottom:         { front_knee: 90, back_knee: 90, front_shin: "vertical" },
  glute_bridge_top:     { hip: 0, knee: 90 },
  crunch_top:           { thoracic_flexion: 30, lumbar: 0 },
  plank:                { hip: 175, knee: 180, elbow: 90 },
  hollow_body:          { hip_flexion: 45, knee: 180, shoulder_flexion: 180 },
  mountain_climber_drive: { driving_hip: 90, driving_knee: 90 },
  russian_twist:        { torso_lean: 45, trunk_rotation: 45 },
  leg_raise_top:        { hip_flexion: 90, knee: 180 },
  bench_press_bottom:   { elbow: 90, shoulder_abduction: 55 },
  bench_press_top:      { elbow: 175 },
  barbell_row_top:      { elbow: 90, torso_from_horizontal: 45 },
  ohp_start:            { elbow: 90, shoulder_abduction: 45 },
  ohp_lockout:          { elbow: 175, shoulder_flexion: 180 },
  calf_raise_top:       { ankle_pf: 45 },
  calf_raise_bottom:    { ankle_df: 20 },
  jump_squat_takeoff:   { knee: 90, hip: 70 },
  jump_squat_landing:   { knee: 45, hip: 40 },
  skull_crusher_bottom: { elbow: 20, shoulder_flexion: 90 },
  skull_crusher_top:    { elbow: 175, shoulder_flexion: 90 },
  face_pull_end:        { elbow: 90, shoulder_horizontal_abduction: 90, shoulder_ext_rotation: 90 },
  arnold_start:         { elbow: 90, shoulder_flexion: 70, rotation: "internal" },
  arnold_end:           { elbow: 165, shoulder_flexion: 175, rotation: "external" },
};

export default EXERCISE_BIOMECHANICS;
