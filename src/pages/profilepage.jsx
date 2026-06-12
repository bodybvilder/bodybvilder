import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/logo';
import ThemeToggle from '../components/themetoggle';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ workoutsCompleted: 0, streak: 0, totalReps: 0 });
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  useEffect(() => {
    const saved = localStorage.getItem('bv-stats');
    if (saved) setStats(JSON.parse(saved));
    
    const notif = localStorage.getItem('bv-notifications');
    if (notif !== null) setNotifications(JSON.parse(notif));
    
    const sound = localStorage.getItem('bv-sound');
    if (sound !== null) setSoundEnabled(JSON.parse(sound));
  }, []);
  
  const handleReset = () => {
    if (window.confirm('Reset all progress? This cannot be undone.')) {
      localStorage.removeItem('bv-stats');
      localStorage.removeItem('bv-history');
      setStats({ workoutsCompleted: 0, streak: 0, totalReps: 0 });
    }
  };
  
  const toggleSetting = (key, value, setter) => {
    setter(!value);
    localStorage.setItem(key, JSON.stringify(!value));
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
            color: 'var(--text-primary)'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
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
            border: '3px solid var(--accent)'
          }}>
            <Logo color="accent" size={44} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            BODYBVILDER
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            AI Form Coach v1.0
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
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
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>}
            label="Notifications"
            value={notifications}
            onToggle={() => toggleSetting('bv-notifications', notifications, setNotifications)}
          />
          <SettingRow
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>}
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </div>
              <span style={{ fontSize: '15px', fontWeight: 500 }}>
                Reset All Data
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
        
        {/* About */}
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            BODYBVILDER v1.0
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            AI-powered form coaching for everyone
          </p>
        </div>
      </div>
    </div>
  );
}