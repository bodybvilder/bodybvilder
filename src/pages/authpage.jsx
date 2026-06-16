import React, { useState } from 'react';
import Logo from '../components/logo';
import { signInWithGoogle } from '../firebase';

export default function AuthPage({ onGuest }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // onAuthChange in App will handle redirect
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Sign in failed. Try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg-0)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background ambient orbs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '50%',
        transform: 'translateX(-50%)',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,255,0,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-20%',
        width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,255,0,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Top section — Logo + headline */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <Logo color="accent" size={72} />

        <div style={{ marginTop: '28px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(28px, 8vw, 42px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            marginBottom: '12px',
            color: 'var(--text-0)',
          }}>
            Your AI<br />
            <span style={{
              background: 'var(--gradient-accent)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Form Coach.
            </span>
          </h1>
          <p style={{
            fontSize: '15px',
            color: 'var(--text-2)',
            lineHeight: 1.6,
            maxWidth: '260px',
            margin: '0 auto',
          }}>
            Real-time pose analysis, rep counting, and form scoring — right from your browser.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '28px',
          animation: 'fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {['AI Form Score', 'Rep Counter', '31 Exercises', 'No Equipment'].map(f => (
            <span key={f} style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-2)',
              letterSpacing: '0.01em',
              background: 'var(--bg-card)',
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom section — CTA buttons */}
      <div style={{
        padding: '24px 24px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'fadeUp 0.6s 0.25s cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,59,59,0.1)',
            border: '1px solid rgba(255,59,59,0.2)',
            color: 'var(--red)',
            fontSize: '14px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--border-strong)',
            background: 'var(--bg-1)',
            color: 'var(--text-0)',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontFamily: 'inherit',
            transition: 'all 0.15s ease',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <div style={{
              width: '20px', height: '20px',
              border: '2px solid var(--border)',
              borderTopColor: 'var(--text-0)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Guest mode */}
        <button
          onClick={onGuest}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-2)',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'color 0.15s ease',
          }}
        >
          Continue as guest
        </button>

        <p style={{
          fontSize: '11px',
          color: 'var(--text-3)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
