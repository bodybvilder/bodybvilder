import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/homepage';
import WorkoutPage from './pages/workoutpage';
import StatsPage from './pages/statspage';
import ProfilePage from './pages/profilepage';
import AuthPage from './pages/authpage';
import ProPage from './pages/propage';
import PosePracticePage from './pages/posepracticepage';
import FFMIPage from './pages/ffmipage';
import FoodScanPage from './pages/foodscanpage';
import BottomNav from './components/bottomnav';
import SplashScreen from './components/splashscreen';
import Logo from './components/logo';
import { onAuthChange } from './firebase';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [authState, setAuthState] = useState('loading'); // 'loading' | 'authenticated' | 'guest' | 'none'
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      if (u) {
        setUser(u);
        setAuthState('authenticated');
      } else {
        // Keep guest state if set
        setAuthState(prev => prev === 'guest' ? 'guest' : 'none');
      }
    });
    return unsub;
  }, []);

  const handleGuest = () => setAuthState('guest');

  // Show splash first
  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  // Auth loading
  if (authState === 'loading') {
    return (
      <div style={{
        height: '100dvh', background: 'var(--bg-0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '28px', height: '28px',
          border: '2.5px solid var(--bg-3)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    );
  }

  // Not logged in and not guest → show auth page
  if (authState === 'none') {
    return <AuthPage onGuest={handleGuest} />;
  }

  // Logged in (google or guest) → show main app
  return <MainApp user={user} isGuest={authState === 'guest'} />;
}

function MainApp({ user, isGuest }) {
  return (
    <>
      {/* Desktop sidebar CSS */}
      <style>{`
        @media (min-width: 768px) {
          .app-sidebar { display: flex !important; }
          .app-content { margin-left: 220px; }
          .app-bottom-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .app-sidebar { display: none !important; }
          .app-content { margin-left: 0; }
        }
      `}</style>

      <DesktopSidebar user={user} isGuest={isGuest} />

      <div className="app-content" style={{
        height: '100dvh',
        overflow: 'hidden auto',
        background: 'var(--bg-0)',
        maxWidth: '100%',
      }}>
        <Routes>
          <Route path="/" element={<HomePage user={user} isGuest={isGuest} />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/pose" element={<PosePracticePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/ffmi" element={<FFMIPage />} />
          <Route path="/food" element={<FoodScanPage />} />
          <Route path="/profile" element={<ProfilePage user={user} isGuest={isGuest} />} />
          <Route path="/pro" element={<ProPage user={user} />} />
        </Routes>
        <div className="app-bottom-nav">
          <BottomNav />
        </div>
      </div>
    </>
  );
}

function DesktopSidebar({ user, isGuest }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/', label: 'Home',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    },
    {
      path: '/workout', label: 'Workout',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
    },
    {
      path: '/stats', label: 'Progress',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    },
    {
      path: '/profile', label: 'Profile',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
  ];

  return (
    <aside className="app-sidebar" style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: '220px',
      background: 'var(--bg-1)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 12px 20px',
      zIndex: 50,
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '4px 12px 28px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '12px',
      }}>
        <Logo color="accent" size={34} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.03em' }}>BODYBVILDER</div>
          <div style={{ fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.04em', fontWeight: 600 }}>AI FORM COACH</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-2)',
                fontWeight: active ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.12s ease',
                textAlign: 'left',
                letterSpacing: '-0.01em',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}>
        {isGuest ? (
          <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-1)', marginBottom: '2px' }}>Guest Mode</div>
            Progress saved locally
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>{user?.displayName?.[0] || 'U'}</span>
              </div>
            )}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-0)' }}>
                {user?.displayName?.split(' ')[0] || 'User'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>Signed in</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
