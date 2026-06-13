# 🏋️ BODYBVILDER

> **AI Form Coach + Real-time Rep Counter + Deep Gamification** — The first fitness app that actually watches your form.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Capacitor](https://img.shields.io/badge/Capacitor-6-119EFF?logo=capacitor)](https://capacitorjs.com)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

---

## 🚀 Features (All Ship Day 1)

- 🤖 **AI Form Coach** — Real-time pose estimation with MediaPipe. 33 landmarks, 3D analysis, on-device processing.
- 📐 **Form Scoring** — 0-100 score per rep. Grades S/A/B/C/D/F. Angle + Tempo + Symmetry.
- 🗣️ **AI Voice Coach** — LLM-powered personalized feedback. Not just "bend your knee" — contextual coaching.
- 🎮 **Deep Gamification** — XP system, streaks, PR vault, muscle mastery trees, squad wars, weekly boss battles.
- 👥 **Social + Squads** — 5-person squads, leaderboards, friend duels, activity feed.
- 💎 **3-Tier Monetization** — Free / Pro ($9.99) / Elite ($19.99) via Lemon Squeezy.
- 🎨 **4 Themes** — Neon Gym, Dark Iron, Ocean Flow, Sunset Pump. All SVG icons, zero emoji.
- 📱 **PWA + APK** — Capacitor build for APKPure. Offline-first. Works without internet.

---

## 📁 Project Structure

```
src/
├── core/           # Pose engine, camera, math utilities
├── exercises/      # Exercise definitions + biomechanical rules
├── ai/             # Form scoring, LLM coach, feedback engine
├── gamification/   # XP, streaks, badges, skill trees, squads
├── social/         # Leaderboards, challenges, activity feed
├── auth/           # Firebase auth, profiles, onboarding
├── payments/       # Lemon Squeezy integration, paywalls
├── themes/         # 4 theme systems + SVG icon engine
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
└── utils/          # Helpers, constants, formatters
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 6 |
| Mobile | Capacitor 6 (PWA → APK) |
| Styling | Tailwind CSS + CSS Custom Properties |
| Auth | Firebase Auth (Google, Apple, Anonymous) |
| Database | Firestore (offline-first via IndexedDB) |
| AI/ML | MediaPipe Pose (on-device) + TensorFlow Lite |
| Voice | Web Speech API (TTS) + OpenAI/Claude (LLM) |
| Payments | Lemon Squeezy |
| Analytics | PostHog |
| Icons | Inline SVG (24/48/96px sets) |

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/yourname/bodybvilder.git
cd bodybvilder

# 2. Install
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your Firebase + Lemon Squeezy keys

# 4. Run dev
npm run dev

# 5. Build APK (Android)
npm run build
npx cap sync android
npx cap build android
```

---

## 📦 Modules

| Module | File | Description |
|--------|------|-------------|
| M1 | `src/core/poseEngine.js` | MediaPipe integration, camera abstraction, landmark smoothing |
| M2 | `src/exercises/exerciseLibrary.js` | 18 exercise definitions with biomechanical rules |
| M3 | `src/ai/formScoring.js` | Real-time form scoring, grade system, feedback triggers |
| M4 | `src/ai/aiCoach.js` | LLM context builder, voice coaching, advice cache |
| M5 | `src/gamification/gamificationSystem.js` | XP, streaks, PR vault, muscle trees, challenges |
| M6 | `src/social/socialSystem.js` | Squads, leaderboards, duels, activity feed |
| M7 | `src/auth/firebaseAuth.js` | Auth flow, profiles, offline-first sync |
| M8 | `src/payments/lemonSqueezy.js` | Subscription tiers, paywalls, webhooks |
| M9 | `src/themes/themeSystem.js` | 4 themes, SVG icon engine, dynamic switching |
| M10 | `capacitor.config.json` | Capacitor config, PWA manifest, deploy settings |

---

## 🎯 Launch Checklist

- [ ] Camera works on 90% of Android devices (tested on 5+ real phones)
- [ ] Rep counting accurate (±1 rep)
- [ ] Form scoring feels fair and consistent
- [ ] Free tier is genuinely useful
- [ ] Auth flow smooth (Google + email + anonymous)
- [ ] Offline mode: complete workout without internet
- [ ] Battery: 30-min workout < 15% drain
- [ ] Lemon Squeezy: upgrade/downgrade/restore works
- [ ] All icons are SVG (zero emoji)
- [ ] 4 themes switch instantly without reload
- [ ] PostHog tracking all critical events
- [ ] APKPure listing ready with screenshots

---

## 📄 License

MIT © 2026 BODYBVILDER Team

---

> 💪 *"Build everything. Launch once. No 'coming soon.' Only shipped features."*
