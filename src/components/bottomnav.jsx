import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home', icon: (a) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )},
  { path: '/workout', label: 'Workout', icon: (a) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  )},
  { path: '/stats', label: 'Stats', icon: (a) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
  { path: '/profile', label: 'Profile', icon: (a) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )}
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      background: 'var(--glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        const color = isActive ? 'var(--accent)' : 'var(--text-muted)';
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: color,
              transition: 'all 0.2s',
              transform: isActive ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {item.icon(color)}
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', color }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}