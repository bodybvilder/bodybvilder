import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePro } from '../hooks/usepro';
import UpgradePrompt from '../components/upgradeprompt';
import { getExerciseById } from '../data/exercises';

const GOALS = [
  { id: 'muscle',    label: 'Build Muscle',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4l12 16M18 4l-12 16"/></svg> },
  { id: 'strength',  label: 'Get Stronger',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { id: 'fat_loss',  label: 'Lose Fat',       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { id: 'endurance', label: 'Endurance',      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { id: 'aesthetic', label: 'Look Aesthetic', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
];

const LEVELS = [
  { id: 'beginner',     label: 'Beginner',     desc: '< 1 year training' },
  { id: 'intermediate', label: 'Intermediate', desc: '1–3 years training' },
  { id: 'advanced',     label: 'Advanced',     desc: '3+ years training' },
];

const EQUIPMENT_OPTIONS = [
  { id: 'none',          label: 'No Equipment' },
  { id: 'dumbbell',      label: 'Dumbbells' },
  { id: 'barbell',       label: 'Barbell' },
  { id: 'pull-up-bar',   label: 'Pull-up Bar' },
  { id: 'cable-machine', label: 'Cable Machine' },
  { id: 'bench',         label: 'Bench' },
];

export default function PlanBuilderPage() {
  const navigate = useNavigate();
  const { isPro } = usePro();

  const [goal, setGoal] = useState('muscle');
  const [level, setLevel] = useState('beginner');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [equipment, setEquipment] = useState(['none']);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(0);

  const toggleEquipment = (id) => {
    if (id === 'none') {
      setEquipment(['none']);
      return;
    }
    setEquipment(prev => {
      const withoutNone = prev.filter(e => e !== 'none');
      return withoutNone.includes(id)
        ? withoutNone.filter(e => e !== id) || ['none']
        : [...withoutNone, id];
    });
  };

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, level, daysPerWeek, equipment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setPlan(data);
      setActiveDay(0);
      // Save to localStorage
      const plans = JSON.parse(localStorage.getItem('bv-plans') || '[]');
      plans.unshift({ ...data, createdAt: new Date().toISOString() });
      localStorage.setItem('bv-plans', JSON.stringify(plans.slice(0, 5)));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: 'max-content', background: 'var(--bg-0)', paddingBottom: 'var(--page-bottom-pad)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 20px 16px', position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg-0)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-0)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            AI Plan Builder
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>
            GPT-4o generates your personalized program
          </p>
        </div>
        {isPro && (
          <div style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '99px', background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.2)', fontSize: '10px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em' }}>
            PRO
          </div>
        )}
      </div>

      {!isPro ? (
        <div style={{ padding: '20px' }}>
          <UpgradePrompt
            feature="AI Plan Builder"
            desc="GPT-4o generates a personalized weekly program based on your goal, level, and equipment."
          />
        </div>
      ) : !plan ? (
        <div style={{ padding: '0 20px', animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>

          {/* Goal */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Goal</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {GOALS.map(g => (
                <button key={g.id} onClick={() => setGoal(g.id)} style={{
                  padding: '14px 12px', borderRadius: '14px',
                  border: `1.5px solid ${goal === g.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: goal === g.id ? 'var(--accent-dim)' : 'var(--bg-1)',
                  color: goal === g.id ? 'var(--accent)' : 'var(--text-2)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '13px', fontWeight: 700,
                  transition: 'all 0.15s ease',
                }}>
                  {g.icon}
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Experience Level</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)} style={{
                  padding: '14px 16px', borderRadius: '14px',
                  border: `1.5px solid ${level === l.id ? 'var(--accent)' : 'var(--border)'}`,
                  background: level === l.id ? 'var(--accent-dim)' : 'var(--bg-1)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: level === l.id ? 'var(--accent)' : 'var(--text-0)' }}>{l.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{l.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Days per week */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Days per week — <span style={{ color: 'var(--accent)' }}>{daysPerWeek} days</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[2, 3, 4, 5, 6].map(d => (
                <button key={d} onClick={() => setDaysPerWeek(d)} style={{
                  flex: 1, padding: '12px 0',
                  borderRadius: '12px',
                  border: `1.5px solid ${daysPerWeek === d ? 'var(--accent)' : 'var(--border)'}`,
                  background: daysPerWeek === d ? 'var(--accent)' : 'transparent',
                  color: daysPerWeek === d ? '#000' : 'var(--text-2)',
                  fontSize: '15px', fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>Equipment Available</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {EQUIPMENT_OPTIONS.map(e => {
                const active = equipment.includes(e.id);
                return (
                  <button key={e.id} onClick={() => toggleEquipment(e.id)} style={{
                    padding: '11px 14px', borderRadius: '12px',
                    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    background: active ? 'var(--accent-dim)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--text-2)',
                    fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.15s ease',
                  }}>
                    {active && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {e.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.2)', color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            onClick={generatePlan}
            disabled={loading}
            style={{
              width: '100%', padding: '18px', borderRadius: '16px', border: 'none',
              background: loading ? 'var(--bg-2)' : 'var(--gradient-accent)',
              color: loading ? 'var(--text-3)' : '#000',
              fontSize: '17px', fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '18px', height: '18px', border: '2.5px solid rgba(0,0,0,0.2)', borderTopColor: 'var(--text-0)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Generating your plan...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
                Generate My Plan
              </>
            )}
          </button>
        </div>
      ) : (
        /* Plan result */
        <div style={{ padding: '0 20px', animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
          {/* Plan header */}
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '18px', padding: '18px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                {plan.planName}
              </h2>
              <button onClick={() => setPlan(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '2px', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '12px' }}>{plan.description}</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[`${plan.daysPerWeek}x/week`, `${plan.weeks} weeks`, level, goal.replace('_', ' ')].map(tag => (
                <span key={tag} style={{ padding: '3px 8px', borderRadius: '8px', background: 'var(--bg-2)', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'capitalize' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Day tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px', marginBottom: '16px' }}>
            {plan.days?.map((day, i) => (
              <button key={i} onClick={() => setActiveDay(i)} style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: '99px',
                border: `1.5px solid ${activeDay === i ? 'var(--accent)' : 'var(--border)'}`,
                background: activeDay === i ? 'var(--accent)' : 'transparent',
                color: activeDay === i ? '#000' : 'var(--text-2)',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}>
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {/* Active day */}
          {plan.days?.[activeDay] && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                  {plan.days[activeDay].name}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>Focus: {plan.days[activeDay].focus}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {plan.days[activeDay].exercises?.map((ex, i) => {
                  const exerciseData = getExerciseById(ex.exerciseId);
                  return (
                    <div key={i} style={{
                      background: 'var(--bg-1)', border: '1px solid var(--border)',
                      borderRadius: '14px', padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: '14px',
                    }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'var(--accent-dim)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 900, color: 'var(--accent)',
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '2px' }}>
                          {exerciseData?.name || ex.exerciseId}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                          {ex.sets} sets × {ex.reps} reps · {ex.rest}s rest
                        </div>
                        {ex.notes && (
                          <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px', fontStyle: 'italic' }}>
                            {ex.notes}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/workout?exercise=${ex.exerciseId}`)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: 'var(--accent)', border: 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0,
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#000"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Start day button */}
              <button
                onClick={() => {
                  const first = plan.days[activeDay].exercises?.[0];
                  if (first) navigate(`/workout?exercise=${first.exerciseId}`);
                }}
                style={{
                  width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                  background: 'var(--gradient-accent)', color: '#000',
                  fontSize: '16px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '-0.01em', marginBottom: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Start Day {plan.days[activeDay].dayNumber}
              </button>

              <button
                onClick={() => setPlan(null)}
                style={{
                  width: '100%', padding: '14px', borderRadius: '16px',
                  border: 'none', background: 'transparent',
                  color: 'var(--text-2)', fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Generate New Plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


