import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homepage';
import WorkoutPage from './pages/workoutpage';
import StatsPage from './pages/statspage';
import ProfilePage from './pages/profilepage';
import BottomNav from './components/bottomnav';

export default function App() {
  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '0 auto', 
      minHeight: '100vh',
      position: 'relative',
      background: 'var(--bg-primary)',
      boxShadow: '0 0 60px rgba(0,0,0,0.3)'
    }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}