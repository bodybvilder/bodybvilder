import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LAST_UPDATED = 'June 18, 2026';
const CONTACT_EMAIL = 'bodybvilder@outlook.com';
const APP_NAME = 'BODYBVILDER';

// ── Collapsible section ────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '0' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-0)', letterSpacing: '-0.01em' }}>
          {title}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: '16px', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function P({ children }) {
  return <p style={{ marginBottom: '10px' }}>{children}</p>;
}

function Ul({ items }) {
  return (
    <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '5px' }}>{item}</li>
      ))}
    </ul>
  );
}

function Tag({ label, color = 'var(--accent)' }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '6px',
      fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em',
      textTransform: 'uppercase',
      background: `${color}18`, color, border: `1px solid ${color}30`,
      marginRight: '4px', marginBottom: '4px',
    }}>
      {label}
    </span>
  );
}

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: 'max-content', background: 'var(--bg-0)', paddingBottom: 'var(--page-bottom-pad)' }}>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }`}</style>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-0)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
            Last updated {LAST_UPDATED}
          </p>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0', animation: 'fadeUp 0.35s both' }}>

        {/* Summary banner */}
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)',
          borderRadius: '16px', padding: '16px', marginBottom: '24px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>
            The short version
          </div>
          <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.7 }}>
            <li>Your camera is used only for AI form coaching — video is never stored or transmitted.</li>
            <li>Your workout data is stored locally on your device.</li>
            <li>We collect minimal data: email for login, payment info via Polar (we never see card numbers).</li>
            <li>We do not sell your data to third parties. Ever.</li>
            <li>You can delete your account and all data at any time.</li>
          </ul>
        </div>

        {/* Data collected summary chips */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Data we collect
          </div>
          <div>
            <Tag label="Email address" color="var(--accent)"/>
            <Tag label="Camera (on-device only)" color="#4ECDC4"/>
            <Tag label="Fitness activity" color="#FF6B6B"/>
            <Tag label="Body measurements" color="#96CEB4"/>
            <Tag label="Payment info (Polar)" color="#FFE66D"/>
            <Tag label="Device info" color="var(--text-3)"/>
          </div>
        </div>

        {/* Sections */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '0 16px', marginBottom: '16px' }}>

          <Section title="1. Who we are" defaultOpen>
            <P>{APP_NAME} ("we", "our", "us") is a fitness application that provides AI-powered form coaching,
            workout tracking, bodybuilding pose practice, and nutrition tools.</P>
            <P>Contact: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a></P>
          </Section>

          <Section title="2. What data we collect">
            <P><strong style={{ color: 'var(--text-0)' }}>Account data</strong></P>
            <Ul items={[
              'Email address — for authentication via Google Sign-In (Firebase Auth)',
              'Display name and profile photo — from your Google account if you choose to sign in',
            ]}/>
            <P><strong style={{ color: 'var(--text-0)' }}>Camera and video</strong></P>
            <Ul items={[
              'Your camera is accessed only during active workout sessions for real-time pose analysis',
              'Camera frames are processed entirely on-device using MediaPipe — no video is sent to our servers',
              'We never record, store, or transmit camera data',
            ]}/>
            <P><strong style={{ color: 'var(--text-0)' }}>Fitness and health data</strong></P>
            <Ul items={[
              'Workout history: exercise name, rep count, form score, duration, calories burned',
              'Body measurements: weight, height, age, sex — used for calorie calculations',
              'Strength log: sets, reps, weight per exercise — stored locally on your device',
              'All fitness data is stored locally in your browser/app (localStorage). It is not uploaded to our servers unless you are signed in and have PRO.',
            ]}/>
            <P><strong style={{ color: 'var(--text-0)' }}>Payment data</strong></P>
            <Ul items={[
              'Subscription payments are processed by Polar.sh — we never see your card number',
              'We receive your email address and subscription status from Polar via secure webhook',
              'Subscription status (PRO/free) is stored in Firebase Firestore and on your device',
            ]}/>
            <P><strong style={{ color: 'var(--text-0)' }}>Usage and device data</strong></P>
            <Ul items={[
              'Device type, operating system, browser version — for compatibility',
              'App crash reports (if you consent)',
              'We do not use advertising trackers or third-party analytics SDKs',
            ]}/>
          </Section>

          <Section title="3. How we use your data">
            <Ul items={[
              'Email: to authenticate your account and send essential service messages',
              'Camera: real-time AI form scoring — entirely on-device, never transmitted',
              'Fitness data: to display your progress, streaks, calorie burn, and strength charts',
              'Body measurements: to calculate personalised calorie and macro targets',
              'Subscription status: to grant or restrict access to PRO features',
              'Device info: to ensure the app works correctly on your device',
            ]}/>
            <P>We do not use your data for advertising, profiling, or sale to third parties.</P>
          </Section>

          <Section title="4. Third-party services">
            <P>We use the following third-party services:</P>
            <Ul items={[
              'Google Firebase (Auth + Firestore) — account authentication and PRO status storage. Privacy policy: firebase.google.com/support/privacy',
              'Google MediaPipe — on-device pose detection. Runs locally, no data sent to Google.',
              'OpenAI — AI coaching responses, food photo analysis. Your messages and photos are sent to OpenAI to generate responses. OpenAI privacy policy: openai.com/policies/privacy-policy',
              'Polar.sh — subscription payment processing. Polar privacy policy: polar.sh/privacy',
              'Vercel — hosting and serverless API functions. Vercel privacy policy: vercel.com/legal/privacy-policy',
            ]}/>
          </Section>

          <Section title="5. Data retention and deletion">
            <P>Locally stored data (workout history, measurements, settings) remains on your device until you clear your browser/app data or uninstall the app.</P>
            <P>Account data in Firebase is retained while your account is active. Subscription data is retained for legal compliance for up to 7 years after a transaction.</P>
            <P><strong style={{ color: 'var(--text-0)' }}>Deleting your account:</strong> You can delete your account and all associated data by going to Profile → Account → Delete Account, or by emailing <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a>. We will process deletion within 30 days.</P>
          </Section>

          <Section title="6. Camera and microphone permissions">
            <P>The app requests camera access solely for AI form coaching. Microphone access is not requested.</P>
            <P>On iOS and Android, you will be asked to grant camera permission before starting a workout. You can revoke this permission at any time in your device settings — the app will continue to function without it (you will not be able to use AI form scoring).</P>
          </Section>

          <Section title="7. Children's privacy">
            <P>{APP_NAME} is not directed to children under 13 (US) or under 16 (EU/EEA). We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a> and we will delete it promptly.</P>
          </Section>

          <Section title="8. Your rights (GDPR / CCPA)">
            <P>Depending on your location, you may have the following rights:</P>
            <Ul items={[
              'Right to access — request a copy of data we hold about you',
              'Right to rectification — correct inaccurate data',
              'Right to erasure — request deletion of your data',
              'Right to data portability — receive your data in a machine-readable format',
              'Right to object — object to certain processing activities',
              'Right to restrict processing',
            ]}/>
            <P>To exercise any of these rights, email <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a>. We will respond within 30 days.</P>
            <P>California residents (CCPA): we do not sell personal information. You have the right to know what data we collect, request deletion, and opt out of sale (which we do not conduct).</P>
          </Section>

          <Section title="9. Security">
            <P>We implement technical and organisational measures to protect your data:</P>
            <Ul items={[
              'All data in transit is encrypted via HTTPS/TLS',
              'Firebase Firestore is protected by server-side security rules',
              'API keys and secrets are stored exclusively in server environment variables — never in app code',
              'Payment webhooks are verified using HMAC-SHA256 signatures',
              'API endpoints are rate-limited and input-validated',
            ]}/>
          </Section>

          <Section title="10. Cookies and local storage">
            <P>We use browser localStorage (not cookies) to store your preferences, workout history, and session data locally on your device. This data does not leave your device except as described in this policy.</P>
            <P>We do not use advertising cookies or cross-site tracking.</P>
          </Section>

          <Section title="11. Changes to this policy">
            <P>We may update this Privacy Policy from time to time. We will notify you of significant changes via an in-app notice. The "Last updated" date at the top of this page reflects the most recent revision.</P>
            <P>Continued use of the app after changes constitutes acceptance of the updated policy.</P>
          </Section>

          <Section title="12. Contact us">
            <P>For privacy questions, data requests, or to exercise your rights:</P>
            <P><a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a></P>
            <P>We aim to respond to all privacy enquiries within 30 days.</P>
          </Section>
        </div>

        <p style={{ fontSize: '11px', color: 'var(--text-3)', textAlign: 'center', paddingBottom: '20px' }}>
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}


