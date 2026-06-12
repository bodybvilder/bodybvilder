import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage';
import WorkoutPage from './pages/workoutpage';
import StatsPage from './pages/statspage';
import ProfilePage from './pages/profilepage';
import BottomNav from './components/bottomnav';
import Logo from './components/logo';

export default function App() {
  return (
    <>
      {/* Desktop sidebar — only visible on wide screens */}
      <style>{`
        @media (min-width: 768px) {
          .app-shell {
            display: flex;
            min-height: 100vh;
            background: var(--bg-primary);
          }
          .app-sidebar {
            display: flex !important;
          }
          .app-main {
            margin-left: 240px;
          }
          .app-bottom-nav {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .app-sidebar {
            display: none !important;
          }
          .app-main {
            margin-left: 0;
          }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content */}
      <div className="app-main" style={{
        maxWidth: '960px',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <div className="app-bottom-nav">
          <BottomNav />
        </div>
      </div>
    </>
  );
}

function DesktopSidebar() {
  const [path, setPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { path: '/workout', label: 'Workout', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg> },
    { path: '/stats', label: 'Stats', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { path: '/profile', label: 'Profile', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <div className="app-sidebar" style={{
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      width: '240px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 16px 24px',
      zIndex: 50,
    }}>
      {/* Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' }}>
        <Logo size={32} color="accent" />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>BODYBVILDER</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Form Coach</div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(item => {
          const active = path === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', item.path); window.dispatchEvent(new PopStateEvent('popstate')); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '14px',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontWeight: active ? 700 : 500,
                fontSize: '14px',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Bottom tag */}
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingLeft: '8px' }}>
        v1.0 · Free Forever
      </div>
    </div>
  );
}
