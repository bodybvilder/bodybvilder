import React, { useState, useEffect } from 'react';

const themes = [
  { id: 'dark', name: 'Dark', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
  { id: 'light', name: 'Light', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
  { id: 'cyber', name: 'Cyber', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { id: 'sunset', name: 'Sunset', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 18a5 5 0 00-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/></svg> }
];

export default function ThemeToggle() {
  const [current, setCurrent] = useState('dark');
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    setCurrent(window.BodyBilderTheme.get());
  }, []);
  
  const handleTheme = (themeId) => {
    window.BodyBilderTheme.set(themeId);
    setCurrent(themeId);
    setOpen(false);
  };
  
  const currentTheme = themes.find(t => t.id === current);
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '10px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {currentTheme?.icon}
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{currentTheme?.name}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '8px',
            minWidth: '180px',
            zIndex: 100,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleTheme(theme.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: current === theme.id ? 'var(--accent-dim)' : 'transparent',
                  color: current === theme.id ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: current === theme.id ? 700 : 500,
                  transition: 'all 0.15s'
                }}
              >
                {theme.icon}
                {theme.name}
                {current === theme.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: 'auto' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}