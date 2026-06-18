import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Storage keys ───────────────────────────────────────────────────────────
const KEY_SLEEP   = 'bv-sleep-log';
const KEY_HISTORY = 'bv-history';
const KEY_STATS   = 'bv-stats';

// ── Science constants ──────────────────────────────────────────────────────
// Progressive overload: volume landmark per muscle (Schoenfeld 2017)
const MUSCLE_TARGETS = {
  chest: { min: 10, max: 20 },
  back:  { min: 10, max: 20 },
  legs:  { min: 12, max: 20 },
  shoulders: { min: 8, max: 16 },
  arms:  { min: 6, max: 14 },
  core:  { min: 8, max: 16 },
};

// Deload recommended after N weeks of consistent training
const DELOAD_WEEKS = 5;

// ── Helpers ────────────────────────────────────────────────────────────────
function getTodayStr() { return new Date().toDateString(); }

function getSleepLog() {
  try { return JSON.parse(localStorage.getItem(KEY_SLEEP) || '[]'); }
  catch { return []; }
}

function saveSleepLog(log) {
  localStorage.setItem(KEY_SLEEP, JSON.stringify(log.slice(-30)));
}

// Recovery score: 0–100 based on sleep hours (7–9 = ideal)
function calcRecoveryScore(sleepHours) {
  if (!sleepHours) return null;
  if (sleepHours >= 7 && sleepHours <= 9) return 100;
  if (sleepHours >= 6 && sleepHours < 7)  return 78;
  if (sleepHours > 9  && sleepHours <= 10) return 88;
  if (sleepHours >= 5 && sleepHours < 6)  return 52;
  if (sleepHours > 10) return 72;
  return 30; // < 5h
}

function recoveryColor(score) {
  if (score === null) return 'var(--text-3)';
  if (score >= 88) return 'var(--accent)';
  if (score >= 65) return 'var(--orange)';
  return 'var(--red)';
}

function recoveryLabel(score) {
  if (score === null) return '—';
  if (score >= 88) return 'OPTIMAL';
  if (score >= 65) return 'MODERATE';
  return 'LOW';
}

function sleepAdvice(hours) {
  if (!hours) return null;
  if (hours < 6) return 'Critical: <6h sleep raises cortisol +37%. Skip heavy lifts today.';
  if (hours < 7) return 'Suboptimal: GH secretion reduced. Go lighter, focus on form.';
  if (hours >= 7 && hours <= 9) return 'Optimal recovery window. Full intensity training is green-lit.';
  if (hours > 9)  return 'Good rest. Watch for oversleeping as it may indicate over-training.';
  return null;
}

// ── Deload Detector ────────────────────────────────────────────────────────
function useDeloadStatus() {
  // Count consecutive weeks with ≥3 workouts
  try {
    const stats = JSON.parse(localStorage.getItem(KEY_STATS) || '{}');
    const history = JSON.parse(localStorage.getItem(KEY_HISTORY) || '[]');
    if (!history.length) return { needsDeload: false, weeks: 0 };

    // Group workouts by ISO week
    const weekMap = {};
    history.forEach(h => {
      const d = new Date(h.date);
      const week = `${d.getFullYear()}-W${Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 604800000)}`;
      weekMap[week] = (weekMap[week] || 0) + 1;
    });

    // Count consecutive active weeks (≥2 workouts)
    const sortedWeeks = Object.keys(weekMap).sort().reverse();
    let consecutiveWeeks = 0;
    for (const w of sortedWeeks) {
      if (weekMap[w] >= 2) consecutiveWeeks++;
      else break;
    }
    return {
      needsDeload: consecutiveWeeks >= DELOAD_WEEKS,
      weeks: consecutiveWeeks,
    };
  } catch {
    return { needsDeload: false, weeks: 0 };
  }
}

// ── Sleep Logger Component ─────────────────────────────────────────────────
function SleepLogger({ onScoreChange }) {
  const [hours, setHours]   = useState('');
  const [log, setLog]       = useState(getSleepLog);
  const [saved, setSaved]   = useState(false);

  // Pre-fill today's entry if exists
  useEffect(() => {
    const today = log.find(e => e.date === getTodayStr());
    if (today) { setHours(String(today.hours)); onScoreChange(calcRecoveryScore(today.hours)); }
  }, []);

  const handleSave = () => {
    const h = parseFloat(hours);
    if (!h || h < 1 || h > 24) return;
    const entry = { date: getTodayStr(), hours: h };
    const updated = [...log.filter(e => e.date !== getTodayStr()), entry];
    setLog(updated);
    saveSleepLog(updated);
    onScoreChange(calcRecoveryScore(h));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const last7 = (() => {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const entry = log.find(e => e.date === ds);
      out.push({ label: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], hours: entry?.hours || 0, isToday: i === 0 });
    }
    return out;
  })();

  const maxH = Math.max(...last7.map(d => d.hours), 9);
  const advice = sleepAdvice(parseFloat(hours) || log.find(e => e.date === getTodayStr())?.hours);

  return (
    <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:'20px', padding:'20px', marginBottom:'16px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
        <div style={{ width:32,height:32,borderRadius:'10px',background:'rgba(120,80,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9b59f5" strokeWidth="2.5" strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize:'15px',fontWeight:800,color:'var(--text-0)',letterSpacing:'-0.02em' }}>Sleep Tracker</div>
          <div style={{ fontSize:'11px',color:'var(--text-3)' }}>GH released during deep sleep · 7–9h optimal</div>
        </div>
      </div>

      {/* Bar chart — last 7 days */}
      <div style={{ display:'flex',alignItems:'flex-end',gap:'5px',height:'72px',marginBottom:'14px' }}>
        {last7.map(({ label, hours: h, isToday }, i) => {
          const pct = h > 0 ? Math.max((h / maxH) * 100, 6) : 4;
          const color = h >= 7 ? 'var(--accent)' : h >= 6 ? 'var(--orange)' : h > 0 ? 'var(--red)' : 'var(--bg-3)';
          return (
            <div key={i} style={{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px' }}>
              {h > 0 && <div style={{ fontSize:'9px',fontWeight:700,color,letterSpacing:'-0.01em' }}>{h}h</div>}
              <div style={{ flex:1,width:'100%',display:'flex',alignItems:'flex-end' }}>
                <div style={{ width:'100%',height:`${pct}%`,minHeight:'4px',background:isToday?color:'var(--bg-3)',opacity:isToday?1:0.5,borderRadius:'4px 4px 2px 2px',outline:isToday?`2px solid ${color}`:'none',outlineOffset:'1px' }}/>
              </div>
              <span style={{ fontSize:'9px',fontWeight:isToday?700:500,color:isToday?'var(--text-1)':'var(--text-3)' }}>{label}</span>
            </div>
          );
        })}
      </div>

      {/* Input row */}
      <div style={{ display:'flex',gap:'8px',alignItems:'center',marginBottom: advice ? '12px' : '0' }}>
        <div style={{ flex:1,position:'relative' }}>
          <input type="number" inputMode="decimal" min="1" max="24" step="0.5"
            value={hours} onChange={e => setHours(e.target.value)}
            placeholder="Hours slept tonight"
            style={{ width:'100%',padding:'12px 16px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--bg-2)',color:'var(--text-0)',fontSize:'16px',fontWeight:800,outline:'none',fontFamily:'inherit',boxSizing:'border-box' }}
          />
        </div>
        <button onClick={handleSave} style={{ padding:'12px 18px',borderRadius:'12px',border:'none',background:saved?'rgba(200,255,0,0.2)':hours?'var(--accent)':'var(--bg-3)',color:saved?'var(--accent)':hours?'#000':'var(--text-3)',fontSize:'13px',fontWeight:800,cursor:hours?'pointer':'default',fontFamily:'inherit',transition:'all 0.15s ease',whiteSpace:'nowrap',flexShrink:0 }}>
          {saved ? '✓ Saved' : 'Log Sleep'}
        </button>
      </div>

      {advice && (
        <div style={{ background:'rgba(155,89,245,0.08)',border:'1px solid rgba(155,89,245,0.2)',borderRadius:'10px',padding:'10px 12px',fontSize:'12px',color:'var(--text-1)',lineHeight:1.5,marginTop:'12px' }}>
          💡 {advice}
        </div>
      )}
    </div>
  );
}

// ── Recovery Score Ring ────────────────────────────────────────────────────
function RecoveryRing({ score }) {
  const r = 52, circ = 2 * Math.PI * r;
  const pct = score !== null ? score / 100 : 0;
  const color = recoveryColor(score);
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:'24px',background:'var(--bg-1)',border:'1px solid var(--border)',borderRadius:'20px',marginBottom:'16px' }}>
      <div style={{ fontSize:'11px',fontWeight:700,color:'var(--text-3)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'16px' }}>Today's Recovery</div>
      <div style={{ position:'relative',width:120,height:120,marginBottom:'14px' }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform:'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-3)" strokeWidth="10"/>
          <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}/>
        </svg>
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' }}>
          <div style={{ fontSize:'32px',fontWeight:900,color,letterSpacing:'-0.04em',lineHeight:1 }}>
            {score !== null ? score : '—'}
          </div>
          {score !== null && <div style={{ fontSize:'9px',fontWeight:700,color,letterSpacing:'0.08em',marginTop:'2px' }}>{recoveryLabel(score)}</div>}
        </div>
      </div>
      {score === null && (
        <div style={{ fontSize:'12px',color:'var(--text-3)',textAlign:'center' }}>Log your sleep to see recovery score</div>
      )}
      {score !== null && (
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',width:'100%' }}>
          {[
            { label:'Sleep Debt', value: score >= 88 ? '0h' : score >= 65 ? '~1–2h' : '>2h', color: recoveryColor(score) },
            { label:'GH Output', value: score >= 88 ? 'High' : score >= 65 ? 'Med' : 'Low', color: recoveryColor(score) },
            { label:'Intensity', value: score >= 88 ? '100%' : score >= 65 ? '80%' : '60%', color: recoveryColor(score) },
          ].map((m,i) => (
            <div key={i} style={{ background:'var(--bg-2)',borderRadius:'12px',padding:'10px 8px',textAlign:'center' }}>
              <div style={{ fontSize:'13px',fontWeight:800,color:m.color }}>{m.value}</div>
              <div style={{ fontSize:'9px',color:'var(--text-3)',fontWeight:600,marginTop:'2px',textTransform:'uppercase',letterSpacing:'0.04em' }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Deload Banner ──────────────────────────────────────────────────────────
function DeloadBanner({ weeks }) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('bv-deload-dismissed') === new Date().toDateString()
  );
  if (dismissed) return null;
  const needsDeload = weeks >= DELOAD_WEEKS;
  return (
    <div style={{ background: needsDeload ? 'rgba(255,59,59,0.08)' : 'rgba(200,255,0,0.06)', border:`1px solid ${needsDeload ? 'rgba(255,59,59,0.25)' : 'rgba(200,255,0,0.2)'}`, borderRadius:'16px', padding:'16px', marginBottom:'16px', position:'relative' }}>
      <button onClick={() => { localStorage.setItem('bv-deload-dismissed', new Date().toDateString()); setDismissed(true); }}
        style={{ position:'absolute',top:10,right:12,background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',fontSize:'16px',lineHeight:1 }}>×</button>
      <div style={{ display:'flex',alignItems:'flex-start',gap:'12px' }}>
        <div style={{ width:32,height:32,borderRadius:8,background:needsDeload?'rgba(255,59,59,0.15)':'rgba(200,255,0,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'2px' }}>
          {needsDeload
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          }
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'14px',fontWeight:800,color:'var(--text-0)',marginBottom:'4px',letterSpacing:'-0.02em' }}>
            {needsDeload ? 'Deload Week Recommended' : `${weeks} Consecutive Training Weeks`}
          </div>
          <div style={{ fontSize:'12px',color:'var(--text-2)',lineHeight:1.5 }}>
            {needsDeload
              ? `You've trained hard for ${weeks} weeks straight. Science shows deloading every 4–6 weeks prevents overtraining syndrome and maximizes long-term gains. Reduce weight by 40–50% this week.`
              : `${DELOAD_WEEKS - weeks} more week${DELOAD_WEEKS - weeks !== 1 ? 's' : ''} until recommended deload. Keep the intensity up — you're in the growth zone.`
            }
          </div>
          {needsDeload && (
            <div style={{ marginTop:'10px',display:'flex',gap:'8px',flexWrap:'wrap' }}>
              {['50% weight','Same reps','Focus form','Active recovery'].map(tip => (
                <span key={tip} style={{ fontSize:'10px',fontWeight:700,color: needsDeload ? 'var(--red)' : 'var(--accent)',background: needsDeload ? 'rgba(255,59,59,0.12)' : 'var(--accent-dim)',borderRadius:'99px',padding:'3px 8px' }}>{tip}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Nutrition Tips ─────────────────────────────────────────────────────────
function NutritionTips({ score }) {
  const TIP_ICONS = {
    protein: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    drop:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
    zap:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    moon:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
    alert:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  };
  const tips = [
    { iconKey:'protein', color:'#C8FF00', title:'Protein Timing', body:'0.4g/kg per meal, 4×/day. Post-workout: consume within 2h for max MPS. Leucine threshold: ~3g per serving triggers muscle protein synthesis.', always: true },
    { iconKey:'drop',    color:'#38bdf8', title:'Hydration', body:'Even 2% dehydration cuts strength by 10–15%. Aim for 35ml/kg bodyweight/day. Add electrolytes on training days.', always: true },
    { iconKey:'zap',     color:'#fbbf24', title:'Pre-Workout Carbs', body:'30–60g fast carbs 1h before training tops up glycogen. Don\'t train fasted if building muscle is the goal.', always: true },
    { iconKey:'moon',    color:'#a78bfa', title:'Creatine + Sleep Synergy', body:'Creatine monohydrate 3–5g/day. Combines with deep sleep (stage 3 NREM) where 80% of daily GH is secreted for maximum muscle repair.', always: true },
    { iconKey:'alert',   color:'var(--red)', title:'Sleep Debt & Muscle Loss', body:'Sleeping <6h for 2 weeks = same cognitive impairment as 48h no sleep. Cortisol spikes, testosterone drops, lean mass decreases.', show: score !== null && score < 65 },
  ].filter(t => t.always || t.show);

  return (
    <div style={{ background:'var(--bg-1)',border:'1px solid var(--border)',borderRadius:'20px',padding:'20px',marginBottom:'16px' }}>
      <div style={{ display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
        <div style={{ fontSize:'15px',fontWeight:800,color:'var(--text-0)',letterSpacing:'-0.02em' }}>Muscle Science</div>
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
        {tips.map((t,i) => (
          <div key={i} style={{ display:'flex',gap:'12px',padding:'12px',background:'var(--bg-2)',borderRadius:'12px' }}>
            <div style={{ width:28,height:28,borderRadius:8,background:`${t.color}18`,border:`1px solid ${t.color}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:t.color }}>
              {TIP_ICONS[t.iconKey]}
            </div>
            <div>
              <div style={{ fontSize:'13px',fontWeight:700,color:'var(--text-0)',marginBottom:'3px' }}>{t.title}</div>
              <div style={{ fontSize:'11px',color:'var(--text-2)',lineHeight:1.55 }}>{t.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function RecoveryPage() {
  const navigate = useNavigate();
  const [recoveryScore, setRecoveryScore] = useState(() => {
    try {
      const log = getSleepLog();
      const today = log.find(e => e.date === getTodayStr());
      return today ? calcRecoveryScore(today.hours) : null;
    } catch { return null; }
  });
  const { needsDeload, weeks } = useDeloadStatus();

  return (
    <div style={{ minHeight:'100dvh',background:'var(--bg-0)',paddingBottom:'90px' }}>

      {/* Header */}
      <div style={{ display:'flex',alignItems:'center',gap:'4px',padding:'20px 20px 16px',position:'sticky',top:0,zIndex:40,background:'var(--bg-0)' }}>
        <button onClick={() => navigate('/')} style={{ background:'none',border:'none',cursor:'pointer',padding:'8px',color:'var(--text-0)',display:'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize:'20px',fontWeight:900,color:'var(--text-0)',letterSpacing:'-0.03em',lineHeight:1 }}>Recovery</h1>
          <p style={{ fontSize:'11px',color:'var(--text-3)',fontWeight:500,marginTop:'1px' }}>Sleep · Nutrition · Deload</p>
        </div>
      </div>

      <div style={{ padding:'0 20px' }}>
        {/* Deload banner */}
        <DeloadBanner weeks={weeks} />

        {/* Recovery ring */}
        <RecoveryRing score={recoveryScore} />

        {/* Sleep Logger */}
        <SleepLogger onScoreChange={setRecoveryScore} />

        {/* Muscle science tips */}
        <NutritionTips score={recoveryScore} />

        {/* Quick links */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'16px' }}>
          {[
            { label:'Meal Plan', sub:'AI nutrition', path:'/meal',
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12h8M12 8v8"/></svg> },
            { label:'Food Scanner', sub:'Macro from photo', path:'/food',
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg> },
            { label:'Measurements', sub:'Body tracker', path:'/measurements',
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg> },
            { label:'FFMI Check', sub:'Natural limit', path:'/ffmi',
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
          ].map(l => (
            <button key={l.path} onClick={() => navigate(l.path)}
              style={{ background:'var(--bg-1)',border:'1px solid var(--border)',borderRadius:'16px',padding:'14px',cursor:'pointer',textAlign:'left',fontFamily:'inherit',transition:'border-color 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='rgba(200,255,0,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{ width:34,height:34,borderRadius:10,background:'var(--accent-dim)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'8px' }}>{l.icon}</div>
              <div style={{ fontSize:'12px',fontWeight:800,color:'var(--text-0)',marginBottom:'2px' }}>{l.label}</div>
              <div style={{ fontSize:'10px',color:'var(--text-3)' }}>{l.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
