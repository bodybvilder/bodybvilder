import React from 'react';

export default function ScoreBadge({ score, size = 'md' }) {
  const sizes = { sm: { w: 36, fs: 14 }, md: { w: 48, fs: 18 }, lg: { w: 64, fs: 24 } };
  const s = sizes[size];
  
  const getColor = () => {
    if (score >= 90) return 'var(--success)';
    if (score >= 70) return 'var(--warning)';
    return 'var(--danger)';
  };
  
  const circumference = 2 * Math.PI * ((s.w - 4) / 2);
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div style={{ position: 'relative', width: s.w, height: s.w }}>
      <svg width={s.w} height={s.w} viewBox={`0 0 ${s.w} ${s.w}`}>
        <circle
          cx={s.w/2} cy={s.w/2} r={(s.w-4)/2}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3"
        />
        <circle
          cx={s.w/2} cy={s.w/2} r={(s.w-4)/2}
          fill="none" stroke={getColor()} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${s.w/2} ${s.w/2})`}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <span style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: s.fs, fontWeight: 800,
        color: 'var(--text-primary)'
      }}>
        {score}
      </span>
    </div>
  );
}