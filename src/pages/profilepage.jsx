import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/themetoggle';
import { signOutUser } from '../firebase';
import { usePro } from '../hooks/usepro';

// ── SVG ICONS (NO EMOJI) ─────────────────────────────────────────────────
const UserIcon = ({ size = 32, color = 'var(--accent)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ArrowLeftIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const SunIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const BellIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const SoundIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
    <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
  </svg>
);

const TrashIcon = ({ size = 18, color = 'var(--danger)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);

const ChevronRightIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const SignOutIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

// ── SAFE DEFAULT STATS ───────────────────────────────────────────────────
const DEFAULT_STATS = {
  workoutsCompleted: 0,
  streak: 0,
  totalReps: 0
};

export default function ProfilePage({ user, isGuest }) {
  const navigate = useNavigate();
  const { isPro, plan } = usePro();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bv-stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats({
          workoutsCompleted: parsed.workoutsCompleted || 0,
          streak: parsed.streak || 0,
          totalReps: parsed.totalReps || 0
        });
      }
      
      const notif = localStorage.getItem('bv-notifications');
      if (notif !== null) setNotifications(JSON.parse(notif));
      
      const sound = localStorage.getItem('bv-sound');
      if (sound !== null) setSoundEnabled(JSON.parse(sound));
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleReset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      try {
        localStorage.removeItem('bv-stats');
        localStorage.removeItem('bv-history');
        setStats({ workoutsCompleted: 0, streak: 0, totalReps: 0 });
      } catch (err) {
        console.error('Reset error:', err);
      }
    }
  };
  
  const toggleSetting = (key, value, setter) => {
    try {
      setter(!value);
      localStorage.setItem(key, JSON.stringify(!value));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };
  
  const SettingRow = ({ icon, label, value, onToggle }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: '1px solid rgba(255,255,255,0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)'
        }}>
          {icon}
        </div>
        <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {label}
        </span>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: '48px',
          height: '28px',
          borderRadius: '14px',
          border: 'none',
          background: value ? 'var(--accent)' : 'var(--bg-tertiary)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s'
        }}
      >
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '3px',
          left: value ? '23px' : '3px',
          transition: 'left 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
  
  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--bg-tertiary)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)',
      paddingBottom: '84px'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '24px 20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Profile
        </h1>
      </div>
      
      {/* Profile Card */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '24px',
          padding: '28px',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--accent-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '3px solid var(--accent)',
            overflow: 'hidden',
          }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserIcon size={32} color="var(--accent)" />
            )}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {isGuest ? 'Guest Athlete' : (user?.displayName || 'BODYBVILDER')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isGuest ? 'Sign in to sync progress' : (user?.email || 'AI Form Coach')}
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)' }}>
                {stats.workoutsCompleted}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Workouts
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.streak}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Day Streak
              </div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.totalReps}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Reps
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings */}
      <div style={{ padding: '0 20px' }}>

        {/* ── PRO Status Card ── */}
        {isPro ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(200,255,0,0.12) 0%, rgba(57,255,20,0.06) 100%)',
            border: '1px solid rgba(200,255,0,0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.01em', marginBottom: '2px' }}>
                BODYBVILDER PRO
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                {plan === 'yearly' ? 'Yearly plan · Active' : 'Monthly plan · Active'}
              </div>
            </div>
            <div style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent)',
              fontSize: '10px', fontWeight: 800,
              color: '#000', letterSpacing: '0.04em',
            }}>
              ACTIVE
            </div>
          </div>
        ) : (
          <div
            onClick={() => navigate('/pro')}
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: '40px', height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '2px' }}>
                Upgrade to PRO
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                Full history, trends, program builder · from $2.50/mo
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        )}

        <h3 style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '8px',
          paddingLeft: '4px'
        }}>
          Appearance
        </h3>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          padding: '0 20px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                <SunIcon size={18} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                Theme
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        <h3 style={{ 
          fontSize: '13px', 
          fontWeight: 700, 
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '8px',
          paddingLeft: '4px'
        }}>
          Preferences
        </h3>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          padding: '0 20px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <SettingRow
            icon={<BellIcon size={18} />}
            label="Notifications"
            value={notifications}
            onToggle={() => toggleSetting('bv-notifications', notifications, setNotifications)}
          />
          <SettingRow
            icon={<SoundIcon size={18} />}
            label="Sound Effects"
            value={soundEnabled}
            onToggle={() => toggleSetting('bv-sound', soundEnabled, setSoundEnabled)}
          />
        </div>
        
        <h3 style={{ 
          fontSize: '13px', 
          fontWeight: 700, 
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '8px',
          paddingLeft: '4px'
        }}>
          Data
        </h3>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '20px',
          padding: '0 20px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.03)'
        }}>
          <button
            onClick={handleReset}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--danger)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255,68,68,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrashIcon size={18} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>
                Reset All Data
              </span>
            </div>
            <ChevronRightIcon size={16} />
          </button>
        </div>
        
        {/* Sign Out */}
        {!isGuest && (
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '20px',
            padding: '0 20px',
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.03)'
          }}>
            <button
              onClick={() => signOutUser()}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <SignOutIcon size={18} />
                </div>
                <span style={{ fontSize: '15px', fontWeight: 500 }}>Sign Out</span>
              </div>
              <ChevronRightIcon size={16} />
            </button>
          </div>
        )}
        
        {/* About */}
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>BODYBVILDER v1.0</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>AI-powered form coaching for everyone</p>
        </div>
      </div>
    </div>
  );
}
