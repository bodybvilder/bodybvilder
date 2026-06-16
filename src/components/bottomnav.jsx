import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--accent)' : 'var(--text-3)'}
        strokeWidth={active ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path: '/workout',
    label: 'Workout',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--accent)' : 'var(--text-3)'}
        strokeWidth={active ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10 8 16 12 10 16 10 8" fill={active ? 'var(--accent)' : 'none'} stroke="none"/>
        <polygon points="10 8 16 12 10 16 10 8" fill="none"
          stroke={active ? 'var(--accent)' : 'var(--text-3)'}
          strokeWidth={active ? '2.5' : '2'}/>
      </svg>
    ),
  },
  {
    path: '/stats',
    label: 'Progress',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--accent)' : 'var(--text-3)'}
        strokeWidth={active ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? 'var(--accent)' : 'var(--text-3)'}
        strokeWidth={active ? '2.5' : '2'} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on workout page (fullscreen camera)
  if (location.pathname === '/workout') return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: '60px',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 100,
    }}>
      {NAV_ITEMS.map(item => {
        const active = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              height: '100%',
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              cursor: 'pointer',
              padding: '0',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
            }}
          >
            {/* Active indicator dot */}
            {active && (
              <div style={{
                position: 'absolute',
                top: '6px',
                width: '4px', height: '4px',
                borderRadius: '50%',
                background: 'var(--accent)',
              }} />
            )}

            {item.icon(active)}

            <span style={{
              fontSize: '9px',
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--accent)' : 'var(--text-3)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontFamily: 'inherit',
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
