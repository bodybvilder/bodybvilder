import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoutines from '../hooks/useRoutines';
import { exercises as ALL_EXERCISES } from '../data/exercises';
import Icon from '../components/icons';

// ── Category icon map ─────────────────────────────────────────────────────
const CAT_ICON = {
  chest: 'chest', back: 'back', legs: 'legs', shoulders: 'shoulders',
  arms: 'arms', core: 'core', triceps: 'arms', cardio: 'cardio',
};
function getCatIcon(cat) { return CAT_ICON[cat] || 'dumbbell'; }

// ── Shared tiny components ────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '16px', ...style }}>
      {children}
    </div>
  );
}
function Stepper({ value, min, max, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button onClick={() => onChange(Math.max(min, value - 1))}
        style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-0)', minWidth: 26, textAlign: 'center' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))}
        style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-0)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  );
}

const ROUTINE_ICONS = [
  { key: 'chest',    label: 'Chest' },
  { key: 'back',     label: 'Back' },
  { key: 'legs',     label: 'Legs' },
  { key: 'shoulders',label: 'Shoulders' },
  { key: 'arms',     label: 'Arms' },
  { key: 'core',     label: 'Core' },
  { key: 'flame',    label: 'Burn' },
  { key: 'bolt',     label: 'Power' },
  { key: 'target',   label: 'Goal' },
  { key: 'trophy',   label: 'Win' },
  { key: 'dumbbell', label: 'Lift' },
  { key: 'star',     label: 'Best' },
];
const SEARCHABLE = ALL_EXERCISES.filter(e => e.id && !e.id.startsWith('pose-'));

// ── Exercise picker sheet ─────────────────────────────────────────────────
function ExercisePicker({ onAdd, onClose }) {
  const [q, setQ] = useState('');
  const filtered = SEARCHABLE.filter(e =>
    e.name.toLowerCase().includes(q.toLowerCase()) ||
    (e.muscles || []).some(m => m.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg-1)', borderRadius: '24px 24px 0 0',
        padding: '16px 20px', maxHeight: '78dvh', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border)', margin: '0 auto 14px' }}/>

        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Add Exercise
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-2)', borderRadius: '14px', padding: '10px 14px', marginBottom: '12px' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search exercises…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text-0)', fontFamily: 'inherit' }}
            autoFocus
          />
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none' }}>
          {filtered.slice(0, 60).map(ex => (
            <button key={ex.id} onClick={() => onAdd(ex)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 12px', borderRadius: '12px', border: 'none',
                background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                textAlign: 'left', transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={getCatIcon(ex.category)} size={17} color="var(--accent)" strokeWidth={2}/>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)' }}>{ex.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '1px', textTransform: 'capitalize' }}>
                  {(ex.muscles || []).slice(0, 2).join(' · ')}
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '13px', padding: '24px 0' }}>No exercises found</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Builder sheet (create / edit) ─────────────────────────────────────────
function RoutineBuilder({ initial, onSave, onClose }) {
  const [name,       setName]       = useState(initial?.name    || '');
  const [iconKey,    setIconKey]    = useState(initial?.iconKey || 'chest');
  const [exList,     setExList]     = useState(initial?.exercises || []);
  const [showPicker, setShowPicker] = useState(false);
  const [error,      setError]      = useState('');

  const addExercise = (ex) => {
    setExList(prev => [...prev, { exerciseId: ex.id, name: ex.name, sets: 3, reps: 12, rest: 60 }]);
    setShowPicker(false);
  };
  const removeExercise = (i) => setExList(prev => prev.filter((_, idx) => idx !== i));
  const updateEx = (i, field, val) => setExList(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  const handleSave = () => {
    if (!name.trim()) { setError('Give your routine a name'); return; }
    if (exList.length === 0) { setError('Add at least one exercise'); return; }
    onSave(name, iconKey, exList);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--bg-0)', display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.2s both',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 20px 14px', flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-0)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1 style={{ flex: 1, fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em' }}>
          {initial ? 'Edit Routine' : 'New Routine'}
        </h1>
        <button onClick={handleSave}
          style={{ padding: '9px 20px', borderRadius: '99px', border: 'none', background: 'var(--accent)', color: '#000', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          Save
        </button>
      </div>

      {error && (
        <div style={{ margin: '0 20px 8px', padding: '8px 14px', background: 'rgba(255,59,59,0.12)', borderRadius: '10px', fontSize: '12px', color: 'var(--red)', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px', scrollbarWidth: 'none' }}>

        {/* Name + emoji */}
        <Card style={{ marginBottom: '14px' }}>
          {/* Icon picker row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {ROUTINE_ICONS.map(ic => (
              <button key={ic.key} onClick={() => setIconKey(ic.key)}
                style={{
                  width: 42, height: 42, borderRadius: '12px',
                  border: `2px solid ${iconKey === ic.key ? 'var(--accent)' : 'transparent'}`,
                  background: iconKey === ic.key ? 'var(--accent-dim)' : 'var(--bg-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.12s ease',
                }}>
                <Icon name={ic.key} size={18} color={iconKey === ic.key ? 'var(--accent)' : 'var(--text-2)'} strokeWidth={2}/>
              </button>
            ))}
          </div>
          <input
            value={name} onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Push Day A"
            maxLength={40}
            style={{ width: '100%', padding: '13px 14px', borderRadius: '12px', border: `1.5px solid ${error && !name.trim() ? 'var(--red)' : 'var(--border)'}`, background: 'var(--bg-2)', color: 'var(--text-0)', fontSize: '16px', fontWeight: 700, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', letterSpacing: '-0.01em' }}
          />
        </Card>

        {/* Exercises */}
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Exercises · {exList.length}
        </div>

        {exList.map((ex, i) => (
          <Card key={i} style={{ marginBottom: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)' }}>{ex.name}</div>
              <button onClick={() => removeExercise(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '4px', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Sets',  val: ex.sets, min: 1, max: 20, field: 'sets' },
                { label: 'Reps',  val: ex.reps, min: 1, max: 100, field: 'reps' },
                { label: 'Rest s',val: ex.rest, min: 10, max: 300, field: 'rest', step: 15 },
              ].map(f => (
                <div key={f.field} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '6px' }}>{f.label}</div>
                  <Stepper value={f.val} min={f.min} max={f.max}
                    onChange={v => updateEx(i, f.field, v)}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}

        <button onClick={() => setShowPicker(true)}
          style={{
            width: '100%', padding: '14px', borderRadius: '16px',
            border: '1.5px dashed var(--border)',
            background: 'transparent', color: 'var(--text-2)',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Exercise
        </button>
      </div>

      {showPicker && <ExercisePicker onAdd={addExercise} onClose={() => setShowPicker(false)}/>}
    </div>
  );
}

// ── Routine card (in list view) ───────────────────────────────────────────
function RoutineCard({ routine, onStart, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const daysAgo = routine.lastUsed
    ? Math.floor((Date.now() - new Date(routine.lastUsed).getTime()) / 86400000)
    : null;
  const lastLabel = daysAgo === null ? 'Never used'
    : daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  return (
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: '20px', overflow: 'hidden', marginBottom: '12px',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Top row */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-dim)', border: '1px solid rgba(200,255,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={routine.iconKey || routine.emoji || 'dumbbell'} size={22} color="var(--accent)" strokeWidth={1.8}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {routine.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-3)', fontWeight: 600 }}>
            <span>{routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span>{lastLabel}</span>
            {routine.timesUsed > 0 && <>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span>{routine.timesUsed}× done</span>
            </>}
          </div>
        </div>
        {/* Menu */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-3)', display: 'flex' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, zIndex: 50,
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '6px', minWidth: '130px',
              boxShadow: 'var(--shadow-md)',
              animation: 'scaleIn 0.15s cubic-bezier(0.34,1.56,0.64,1) both',
            }}>
              {[
                { label: 'Edit',   color: 'var(--text-0)', action: () => { setMenuOpen(false); onEdit(); } },
                { label: 'Delete', color: 'var(--red)',    action: () => { setMenuOpen(false); onDelete(); } },
              ].map(item => (
                <button key={item.label} onClick={item.action}
                  style={{ width: '100%', padding: '9px 12px', border: 'none', background: 'none', cursor: 'pointer', color: item.color, fontSize: '13px', fontWeight: 600, textAlign: 'left', fontFamily: 'inherit', borderRadius: '8px', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exercise chips */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {routine.exercises.slice(0, 5).map((ex, i) => (
          <div key={i} style={{ padding: '3px 9px', borderRadius: '8px', background: 'var(--bg-2)', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)' }}>
            {ex.name}
          </div>
        ))}
        {routine.exercises.length > 5 && (
          <div style={{ padding: '3px 9px', borderRadius: '8px', background: 'var(--bg-2)', fontSize: '11px', fontWeight: 600, color: 'var(--text-3)' }}>
            +{routine.exercises.length - 5} more
          </div>
        )}
      </div>

      {/* Start button */}
      <div style={{ padding: '0 12px 12px' }}>
        <button onClick={onStart}
          style={{
            width: '100%', padding: '13px', borderRadius: '14px', border: 'none',
            background: 'var(--gradient-accent)', color: '#000',
            fontSize: '14px', fontWeight: 800, cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: 'var(--accent-glow)',
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Start Workout
        </button>
      </div>
    </div>
  );
}

// ── Active routine runner (shows exercise queue during workout) ────────────
function RoutineRunner({ routine, onClose }) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const ex = routine.exercises[idx];
  const isLast = idx === routine.exercises.length - 1;

  const goNext = () => {
    if (isLast) { onClose(); navigate('/'); }
    else setIdx(i => i + 1);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'var(--bg-0)', display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.2s both',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-0)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
            {routine.name}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)' }}>
            Exercise {idx + 1} of {routine.exercises.length}
          </div>
        </div>
      </div>

      {/* Progress strip */}
      <div style={{ display: 'flex', gap: '4px', padding: '0 20px 20px' }}>
        {routine.exercises.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= idx ? 'var(--accent)' : 'var(--bg-3)', transition: 'background 0.2s' }}/>
        ))}
      </div>

      {/* Exercise card */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', gap: '20px' }}>
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.25s both' }} key={idx}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Up Next
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '16px' }}>
            {ex.name}
          </div>

          {/* Sets × Reps chips */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            {[
              { label: 'Sets', val: ex.sets },
              { label: 'Reps', val: ex.reps },
              { label: 'Rest', val: `${ex.rest}s` },
            ].map(c => (
              <div key={c.label} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '14px', padding: '10px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.03em', lineHeight: 1 }}>{c.val}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '3px' }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming exercises */}
          {idx < routine.exercises.length - 1 && (
            <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>
              Next: <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{routine.exercises[idx + 1].name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ padding: '0 20px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => navigate(`/workout?exercise=${ex.exerciseId}&autostart=1`)}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: 'var(--gradient-accent)', color: '#000',
            fontSize: '16px', fontWeight: 800, cursor: 'pointer',
            fontFamily: 'inherit', marginBottom: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: 'var(--accent-glow)',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Open with AI Coach
        </button>
        <button onClick={goNext}
          style={{
            width: '100%', padding: '14px', borderRadius: '16px',
            border: '1.5px solid var(--border)', background: 'transparent',
            color: 'var(--text-1)', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
          {isLast ? 'Finish Routine' : 'Skip to Next'}
        </button>
      </div>
    </div>
  );
}

// ── Main RoutinesPage ─────────────────────────────────────────────────────
export default function RoutinesPage() {
  const navigate = useNavigate();
  const { routines, createRoutine, updateRoutine, deleteRoutine, markUsed } = useRoutines();

  const [showBuilder,  setShowBuilder]  = useState(false);
  const [editRoutine,  setEditRoutine]  = useState(null); // routine being edited
  const [runRoutine,   setRunRoutine]   = useState(null); // routine being run

  const handleSave = useCallback((name, iconKey, exercises) => {
    if (editRoutine) {
      updateRoutine(editRoutine.id, { name, iconKey, exercises });
    } else {
      createRoutine(name, iconKey, exercises);
    }
    setShowBuilder(false);
    setEditRoutine(null);
  }, [editRoutine, createRoutine, updateRoutine]);

  const handleDelete = (id) => {
    if (window.confirm('Delete this routine?')) deleteRoutine(id);
  };

  const handleStart = (routine) => {
    markUsed(routine.id);
    setRunRoutine(routine);
  };

  // STARTER TEMPLATES — shown when no routines exist
  const TEMPLATES = [
    {
      name: 'Push Day',   iconKey: 'chest',
      exercises: [
        { exerciseId: 'pushup',              name: 'Push-Up',             sets: 4, reps: 15, rest: 60 },
        { exerciseId: 'dumbbell-shoulder-press', name: 'Shoulder Press', sets: 3, reps: 12, rest: 60 },
        { exerciseId: 'dumbbell-fly',        name: 'Dumbbell Fly',        sets: 3, reps: 12, rest: 60 },
        { exerciseId: 'tricep-extension',    name: 'Tricep Extension',    sets: 3, reps: 12, rest: 60 },
      ],
    },
    {
      name: 'Pull Day',   iconKey: 'back',
      exercises: [
        { exerciseId: 'pullup',       name: 'Pull-Up',       sets: 4, reps: 8,  rest: 90 },
        { exerciseId: 'barbell-row',  name: 'Barbell Row',   sets: 3, reps: 10, rest: 75 },
        { exerciseId: 'barbell-curl', name: 'Barbell Curl',  sets: 3, reps: 12, rest: 60 },
      ],
    },
    {
      name: 'Leg Day',    iconKey: 'legs',
      exercises: [
        { exerciseId: 'barbell-squat',       name: 'Barbell Squat',       sets: 4, reps: 8,  rest: 120 },
        { exerciseId: 'romanian-deadlift',   name: 'Romanian Deadlift',   sets: 3, reps: 10, rest: 90  },
        { exerciseId: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', sets: 3, reps: 10, rest: 75 },
        { exerciseId: 'calf-raise',          name: 'Calf Raise',          sets: 4, reps: 20, rest: 45  },
      ],
    },
  ];

  return (
    <div style={{ minHeight: 'max-content', background: 'var(--bg-0)', paddingBottom: 'var(--page-bottom-pad)' }}>
      <style>{`
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes slideUp   { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px', position: 'sticky', top: 0, zIndex: 40, background: 'var(--glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-0)', display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em' }}>
            My Routines
          </h1>
        </div>
        <button onClick={() => { setEditRoutine(null); setShowBuilder(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '99px', border: 'none', background: 'var(--accent)', color: '#000', fontSize: '13px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New
        </button>
      </div>

      <div style={{ padding: '16px 20px 0', animation: 'fadeUp 0.35s both' }}>

        {/* Empty state with templates */}
        {routines.length === 0 && (
          <div>
            <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
              <div style={{width:52,height:52,borderRadius:14,background:"var(--bg-2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"12px"}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><path d="M6 4v16M18 4v16M6 8H4a1 1 0 000 2h2M6 14H4a1 1 0 000 2h2M18 8h2a1 1 0 000-2h-2M18 14h2a1 1 0 000-2h-2M6 8h12v8H6z"/></svg></div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
                No routines yet
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '24px' }}>
                Create your first routine or start from a template
              </div>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Quick Start Templates
            </div>
            {TEMPLATES.map((tmpl, i) => (
              <div key={i} style={{
                background: 'var(--bg-1)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '14px 16px', marginBottom: '10px',
                display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
                onClick={() => createRoutine(tmpl.name, tmpl.iconKey, tmpl.exercises)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(200,255,0,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={tmpl.iconKey||"dumbbell"} size={20} color="var(--accent)" strokeWidth={1.8}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>{tmpl.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{tmpl.exercises.length} exercises</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* Routines list */}
        {routines.map(r => (
          <RoutineCard
            key={r.id}
            routine={r}
            onStart={() => handleStart(r)}
            onEdit={() => { setEditRoutine(r); setShowBuilder(true); }}
            onDelete={() => handleDelete(r.id)}
          />
        ))}

      </div>

      {/* Builder overlay */}
      {showBuilder && (
        <RoutineBuilder
          initial={editRoutine}
          onSave={handleSave}
          onClose={() => { setShowBuilder(false); setEditRoutine(null); }}
        />
      )}

      {/* Runner overlay */}
      {runRoutine && (
        <RoutineRunner
          routine={runRoutine}
          onClose={() => setRunRoutine(null)}
        />
      )}
    </div>
  );
}


