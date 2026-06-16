import React from 'react';

export default function ScoreBadge({ score, size = 'md' }) {
  const sizes = {
    sm: { w: 36, fs: 12, sw: 3 },
    md: { w: 48, fs: 16, sw: 3 },
    lg: { w: 64, fs: 22, sw: 4 },
  };
  const s = sizes[size] || sizes.md;

  const color =
    score >= 90 ? 'var(--accent)' :
    score >= 70 ? 'var(--orange)' :
    'var(--red)';

  const r = (s.w - s.sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ position: 'relative', width: s.w, height: s.w, flexShrink: 0 }}>
      <svg width={s.w} height={s.w} viewBox={`0 0 ${s.w} ${s.w}`}>
        <circle
          cx={s.w / 2} cy={s.w / 2} r={r}
          fill="none" stroke="var(--bg-2)" strokeWidth={s.sw}
        />
        <circle
          cx={s.w / 2} cy={s.w / 2} r={r}
          fill="none" stroke={color} strokeWidth={s.sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${s.w / 2} ${s.w / 2})`}
          style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <span style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: s.fs, fontWeight: 900,
        color: 'var(--text-0)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {score}
      </span>
    </div>
  );
}
