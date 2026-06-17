import React, { useMemo } from 'react';

/**
 * StreakCalendar — last 10 weeks heatmap
 * Shows workout activity per day — like GitHub contribution graph
 */
export default function StreakCalendar({ history = [] }) {
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Build a map of date → workout count from history
  const activityMap = useMemo(() => {
    const map = {};
    history.forEach(item => {
      if (!item.date) return;
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [history]);

  // Build last 70 days (10 weeks × 7 days)
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 69; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      result.push({
        key,
        date: d,
        count: activityMap[key] || 0,
        isToday: i === 0,
      });
    }
    return result;
  }, [activityMap]);

  // Group into weeks (columns of 7)
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const getColor = (count, isToday) => {
    if (isToday && count === 0) return 'rgba(200,255,0,0.15)';
    if (count === 0) return 'var(--bg-2)';
    if (count === 1) return 'rgba(200,255,0,0.35)';
    if (count === 2) return 'rgba(200,255,0,0.6)';
    return 'rgba(200,255,0,0.9)';
  };

  const totalWorkouts = days.filter(d => d.count > 0).length;
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 70; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (activityMap[key]) streak++;
      else if (i > 0) break;
    }
    return streak;
  }, [activityMap]);

  return (
    <div style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', marginBottom: '2px' }}>
            Activity
          </h3>
          <p style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 500 }}>
            {totalWorkouts} active days in 10 weeks
          </p>
        </div>
        {currentStreak > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '5px 10px', borderRadius: '99px',
            background: 'var(--accent-dim)',
            border: '1px solid rgba(200,255,0,0.2)',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent)' }}>
              {currentStreak}d
            </span>
          </div>
        )}
      </div>

      {/* Day labels */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '4px', paddingLeft: '2px' }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} style={{
            width: '12px', fontSize: '9px',
            color: 'var(--text-3)', fontWeight: 600,
            textAlign: 'center', letterSpacing: '0.02em',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid — transposed: rows = days of week, cols = weeks */}
      <div style={{ display: 'flex', gap: '3px' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {week.map((day, di) => (
              <div
                key={day.key}
                title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.count} workout${day.count !== 1 ? 's' : ''}`}
                style={{
                  width: '12px', height: '12px',
                  borderRadius: '3px',
                  background: getColor(day.count, day.isToday),
                  border: day.isToday ? '1px solid rgba(200,255,0,0.5)' : 'none',
                  transition: 'background 0.2s ease',
                  cursor: 'default',
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 500 }}>Less</span>
        {[0, 1, 2, 3].map(level => (
          <div key={level} style={{
            width: '10px', height: '10px', borderRadius: '2px',
            background: level === 0 ? 'var(--bg-2)' : `rgba(200,255,0,${0.25 + level * 0.25})`,
          }} />
        ))}
        <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 500 }}>More</span>
      </div>
    </div>
  );
}
