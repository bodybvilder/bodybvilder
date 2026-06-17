import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePro } from '../hooks/usepro';
import UpgradePrompt from '../components/upgradeprompt';

// ── Constants ─────────────────────────────────────────────────────────────
const GOALS = [
  { id: 'cut',           label: 'Cut',           desc: 'Lose fat, preserve muscle', color: '#FF6B6B' },
  { id: 'maintain',      label: 'Maintain',       desc: 'Stay lean & perform',       color: '#4ECDC4' },
  { id: 'bulk',          label: 'Bulk',           desc: 'Build muscle mass',          color: '#C8FF00' },
  { id: 'agressiveBulk', label: 'Aggressive Bulk', desc: 'Max muscle gain',           color: '#FF9500' },
];

const ACTIVITY = [
  { id: 'sedentary',  label: 'Sedentary',    desc: 'Desk job, no exercise' },
  { id: 'light',      label: 'Light',        desc: '1–2 workouts/week' },
  { id: 'moderate',   label: 'Moderate',     desc: '3–4 workouts/week' },
  { id: 'active',     label: 'Active',       desc: '5–6 workouts/week' },
  { id: 'veryActive', label: 'Very Active',  desc: '2× day / hard labor' },
];

const DIETS = [
  { id: 'standard',    label: 'Standard' },
  { id: 'highProtein', label: 'High Protein' },
  { id: 'keto',        label: 'Keto' },
  { id: 'vegetarian',  label: 'Vegetarian' },
  { id: 'vegan',       label: 'Vegan' },
];

// ── Macro ring SVG ────────────────────────────────────────────────────────
function MacroRing({ protein, carbs, fat, totalCal }) {
  const total = protein * 4 + carbs * 4 + fat * 9;
  const pPct = total > 0 ? (protein * 4) / total : 0;
  const cPct = total > 0 ? (carbs * 4) / total : 0;
  const R = 40, circ = 2 * Math.PI * R;
  const pArc = circ * pPct;
  const cArc = circ * cPct;
  const fArc = circ - pArc - cArc;
  let offset = 0;
  const segs = [
    { arc: pArc, color: '#C8FF00', label: 'P', g: protein + 'g' },
    { arc: cArc, color: '#4ECDC4', label: 'C', g: carbs + 'g' },
    { arc: fArc, color: '#FF9500', label: 'F', g: fat + 'g' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        {segs.map((s, i) => {
          const el = (
            <circle key={i} cx="48" cy="48" r={R}
              fill="none" stroke={s.color} strokeWidth="10"
              strokeLinecap="butt"
              strokeDasharray={`${s.arc} ${circ - s.arc}`}
              strokeDashoffset={-(offset)}
              transform="rotate(-90 48 48)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          );
          offset += s.arc;
          return el;
        })}
        <text x="48" y="44" textAnchor="middle" fill="var(--text-0)" fontSize="13" fontWeight="900" fontFamily="inherit">{totalCal}</text>
        <text x="48" y="57" textAnchor="middle" fill="var(--text-3)" fontSize="9" fontWeight="600" fontFamily="inherit">kcal</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {segs.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600, width: '20px' }}>{s.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-0)' }}>{s.g}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Input row ─────────────────────────────────────────────────────────────
function InputRow({ label, unit, value, onChange, min, max, step = 1 }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-2)', borderRadius: '12px', padding: '10px 12px', border: '1px solid var(--border)' }}>
        <button onClick={() => onChange(Math.max(min, value - step))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '0', lineHeight: 1, fontSize: '18px', fontWeight: 300, fontFamily: 'inherit' }}>−</button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: '16px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + step))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '0', lineHeight: 1, fontSize: '18px', fontWeight: 300, fontFamily: 'inherit' }}>+</button>
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-3)', textAlign: 'center', marginTop: '3px' }}>{unit}</div>
    </div>
  );
}

// ── Meal card ─────────────────────────────────────────────────────────────
function MealCard({ meal, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', animation: `fadeUp 0.35s ${index * 0.06}s both` }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Time badge */}
        <div style={{ background: 'var(--bg-2)', borderRadius: '10px', padding: '6px 10px', textAlign: 'center', flexShrink: 0, minWidth: '52px' }}>
          <div style={{ fontSize: '9px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.04em' }}>TIME</div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1.2 }}>{meal.time || '—'}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', marginBottom: '2px' }}>{meal.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
            {meal.calories} kcal · {meal.macros?.protein}g P · {meal.macros?.carbs}g C · {meal.macros?.fat}g F
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {meal.foods?.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-2)', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-0)', fontWeight: 500, flex: 1 }}>{f.name}</span>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', color: '#C8FF00', fontWeight: 700 }}>{f.protein}P</span>
                  <span style={{ fontSize: '11px', color: '#4ECDC4', fontWeight: 700 }}>{f.carbs}C</span>
                  <span style={{ fontSize: '11px', color: '#FF9500', fontWeight: 700 }}>{f.fat}F</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>{f.calories}cal</span>
                </div>
              </div>
            ))}
          </div>
          {meal.notes && (
            <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--accent-dim)', borderRadius: '10px', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
              💡 {meal.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function MealPlanPage() {
  const navigate = useNavigate();
  const { isPro } = usePro();

  // Form state
  const [weightKg, setWeightKg]   = useState(80);
  const [heightCm, setHeightCm]   = useState(175);
  const [age, setAge]             = useState(25);
  const [sex, setSex]             = useState('male');
  const [activityLevel, setActivity] = useState('moderate');
  const [goal, setGoal]           = useState('bulk');
  const [mealsPerDay, setMeals]   = useState(4);
  const [dietType, setDiet]       = useState('standard');

  // Result state
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Load last saved plan
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bv-meal-plan');
      if (saved) setPlan(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weightKg, heightCm, age, sex, activityLevel, goal, mealsPerDay, dietType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setPlan(data);
      localStorage.setItem('bv-meal-plan', JSON.stringify(data));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const goalColor = GOALS.find(g => g.id === goal)?.color || 'var(--accent)';

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', paddingBottom: '80px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 20px 16px', position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg-0)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-0)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>AI Meal Plan</h1>
          <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>Personalized nutrition for your goal</p>
        </div>
        {isPro && <div style={{ padding: '4px 10px', borderRadius: '99px', background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)', fontSize: '10px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em' }}>PRO</div>}
      </div>

      {!isPro ? (
        <div style={{ padding: '20px' }}>
          <UpgradePrompt feature="AI Meal Plan" desc="Get a GPT-4o generated full-day meal plan based on your TDEE, macros, and bodybuilding goal." />
        </div>
      ) : plan ? (
        /* ── PLAN RESULT ── */
        <div style={{ padding: '0 16px', animation: 'fadeUp 0.4s both' }}>

          {/* Summary card */}
          <div style={{ margin: '16px 0', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '3px' }}>Daily Target</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 900, color: goalColor, letterSpacing: '-0.04em', lineHeight: 1 }}>{plan.targetCalories}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 600 }}>kcal</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
                  TDEE: {plan.tdee} kcal · {plan.goal}
                </div>
              </div>
              <MacroRing
                protein={plan.macros?.protein || 0}
                carbs={plan.macros?.carbs || 0}
                fat={plan.macros?.fat || 0}
                totalCal={plan.targetCalories}
              />
            </div>
          </div>

          {/* Meals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {plan.meals?.map((meal, i) => <MealCard key={i} meal={meal} index={i} />)}
          </div>

          {/* Tips */}
          {plan.tips?.length > 0 && (
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Nutrition Tips</div>
              {plan.tips.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0', fontSize: '13px', color: 'var(--text-1)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>
                  {t}
                </div>
              ))}
            </div>
          )}

          {/* Supplements */}
          {plan.supplements?.length > 0 && (
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Supplements</div>
              {plan.supplements.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0', fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>•</span>{s}
                </div>
              ))}
            </div>
          )}

          {/* Regenerate */}
          <button onClick={() => { setPlan(null); localStorage.removeItem('bv-meal-plan'); }}
            style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            New Plan
          </button>
        </div>
      ) : (
        /* ── FORM ── */
        <div style={{ padding: '16px 16px 0', animation: 'fadeUp 0.4s both' }}>

          {/* Sex toggle */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Sex</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['male', 'female'].map(s => (
                <button key={s} onClick={() => setSex(s)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `1.5px solid ${sex === s ? 'var(--accent)' : 'var(--border)'}`, background: sex === s ? 'var(--accent-dim)' : 'transparent', color: sex === s ? 'var(--accent)' : 'var(--text-2)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize', transition: 'all 0.12s ease' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Body stats */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Body Stats</div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <InputRow label="Weight" unit="kg" value={weightKg} onChange={setWeightKg} min={40} max={200} step={0.5} />
              <InputRow label="Height" unit="cm" value={heightCm} onChange={setHeightCm} min={140} max={230} />
            </div>
            <InputRow label="Age" unit="years" value={age} onChange={setAge} min={14} max={80} />
          </div>

          {/* Goal */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Goal</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)}
                  style={{ padding: '12px', borderRadius: '14px', border: `1.5px solid ${goal === g.id ? g.color : 'var(--border)'}`, background: goal === g.id ? `${g.color}18` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.12s ease' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: goal === g.id ? g.color : 'var(--text-0)', marginBottom: '2px' }}>{g.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Activity Level</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {ACTIVITY.map(a => (
                <button key={a.id} onClick={() => setActivity(a.id)}
                  style={{ padding: '12px 14px', borderRadius: '12px', border: `1.5px solid ${activityLevel === a.id ? 'var(--accent)' : 'var(--border)'}`, background: activityLevel === a.id ? 'var(--accent-dim)' : 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.12s ease' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: activityLevel === a.id ? 'var(--accent)' : 'var(--text-0)' }}>{a.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{a.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Meals per day + Diet */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Meals/Day</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[3, 4, 5, 6].map(n => (
                  <button key={n} onClick={() => setMeals(n)}
                    style={{ flex: 1, padding: '11px 0', borderRadius: '10px', border: `1.5px solid ${mealsPerDay === n ? 'var(--accent)' : 'var(--border)'}`, background: mealsPerDay === n ? 'var(--accent)' : 'transparent', color: mealsPerDay === n ? '#000' : 'var(--text-2)', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s ease' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Diet type */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Diet Preference</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {DIETS.map(d => (
                <button key={d.id} onClick={() => setDiet(d.id)}
                  style={{ padding: '8px 14px', borderRadius: '99px', border: `1.5px solid ${dietType === d.id ? 'var(--accent)' : 'var(--border)'}`, background: dietType === d.id ? 'var(--accent-dim)' : 'transparent', color: dietType === d.id ? 'var(--accent)' : 'var(--text-2)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s ease' }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.2)', color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button onClick={generate} disabled={loading}
            style={{ width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: loading ? 'var(--bg-2)' : 'var(--gradient-accent)', color: loading ? 'var(--text-3)' : '#000', fontSize: '17px', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            {loading ? (
              <><div style={{ width: '18px', height: '18px', border: '2.5px solid rgba(0,0,0,0.2)', borderTopColor: 'var(--text-1)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Generating meal plan...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>Generate My Meal Plan</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
