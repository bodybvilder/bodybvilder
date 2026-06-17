import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePro } from '../hooks/usepro';
import UpgradePrompt from '../components/upgradeprompt';

// ── Measurement fields ────────────────────────────────────────────────────
const FIELDS = [
  { id: 'weight',   label: 'Body Weight', unit: 'kg',  icon: '⚖️',  color: '#C8FF00', step: 0.1 },
  { id: 'chest',    label: 'Chest',       unit: 'cm',  icon: '💪',  color: '#4ECDC4', step: 0.5 },
  { id: 'waist',    label: 'Waist',       unit: 'cm',  icon: '📏',  color: '#FF9500', step: 0.5 },
  { id: 'hips',     label: 'Hips',        unit: 'cm',  icon: '🦴',  color: '#FF6B6B', step: 0.5 },
  { id: 'neck',     label: 'Neck',        unit: 'cm',  icon: '🔵',  color: '#9B59B6', step: 0.5 },
  { id: 'lArm',     label: 'Left Arm',    unit: 'cm',  icon: '💪',  color: '#E74C3C', step: 0.5 },
  { id: 'rArm',     label: 'Right Arm',   unit: 'cm',  icon: '💪',  color: '#E74C3C', step: 0.5 },
  { id: 'lThigh',   label: 'Left Thigh',  unit: 'cm',  icon: '🦵',  color: '#3498DB', step: 0.5 },
  { id: 'rThigh',   label: 'Right Thigh', unit: 'cm',  icon: '🦵',  color: '#3498DB', step: 0.5 },
  { id: 'calf',     label: 'Calves',      unit: 'cm',  icon: '🦵',  color: '#1ABC9C', step: 0.5 },
  { id: 'shoulder', label: 'Shoulders',   unit: 'cm',  icon: '🏋️',  color: '#F39C12', step: 0.5 },
  { id: 'bodyFat',  label: 'Body Fat',    unit: '%',   icon: '📊',  color: '#E67E22', step: 0.1 },
];

// ── Mini sparkline ────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.value).filter(Boolean);
  if (vals.length < 2) return null;
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const W = 60, H = 24;
  const pts = vals.slice(-8).map((v, i, arr) => {
    const x = (i / (arr.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const last = vals[vals.length - 1];
  const prev = vals[vals.length - 2];
  const delta = last - prev;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts.split(' ').pop().split(',')[0]} cy={pts.split(' ').pop().split(',')[1]} r="2.5" fill={color} />
      </svg>
      <span style={{ fontSize: '11px', fontWeight: 700, color: delta > 0 ? '#4ECDC4' : delta < 0 ? '#FF6B6B' : 'var(--text-3)' }}>
        {delta > 0 ? '+' : ''}{delta.toFixed(1)}
      </span>
    </div>
  );
}

// ── Mini line chart (full) ────────────────────────────────────────────────
function LineChart({ data, color, unit }) {
  if (!data || data.length < 2) return (
    <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '12px' }}>
      Add more entries to see trend
    </div>
  );
  const vals = data.map(d => d.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const W = 300, H = 80;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 12) - 6;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`0,${H} ${pts} ${W},${H}`}
          fill={`url(#grad-${color.replace('#','')})`}
        />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {vals.map((v, i) => {
          const x = (i / (vals.length - 1)) * W;
          const y = H - ((v - min) / range) * (H - 12) - 6;
          return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
        })}
        {/* Min/max labels */}
        <text x="2" y={H - 2} fill="var(--text-3)" fontSize="9" fontFamily="inherit">{min}{unit}</text>
        <text x="2" y="10" fill="var(--text-3)" fontSize="9" fontFamily="inherit">{max}{unit}</text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: '9px', color: 'var(--text-3)', transform: 'rotate(-30deg)', transformOrigin: 'top left', display: 'inline-block', width: '24px' }}>
            {new Date(d.date).toLocaleDateString('en', { month: 'numeric', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Field card ────────────────────────────────────────────────────────────
function FieldCard({ field, history, currentValue, onChange, onSave, expanded, onToggle }) {
  const latest = history[history.length - 1];
  const latestVal = latest?.value ?? '';
  return (
    <div style={{ background: 'var(--bg-1)', border: `1px solid ${expanded ? field.color + '44' : 'var(--border)'}`, borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.15s ease' }}>
      <div onClick={onToggle} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Color dot + label */}
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: field.color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)', letterSpacing: '-0.01em' }}>{field.label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '1px' }}>
            {latestVal ? `${latestVal} ${field.unit}` : '—'}
          </div>
        </div>
        {/* Sparkline */}
        <Sparkline data={history} color={field.color} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px' }}>
          {/* Input row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-2)', borderRadius: '12px', padding: '10px 14px', border: `1px solid ${field.color}33` }}>
              <button onClick={() => onChange(Math.max(0, parseFloat(currentValue || latestVal || 0) - field.step).toFixed(field.step < 1 ? 1 : 0))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '20px', padding: '0', lineHeight: 1, fontFamily: 'inherit' }}>−</button>
              <input
                type="number" step={field.step} min="0"
                value={currentValue}
                onChange={e => onChange(e.target.value)}
                placeholder={latestVal ? String(latestVal) : '0'}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '18px', fontWeight: 800, color: field.color, textAlign: 'center', fontFamily: 'inherit', width: '60px' }}
              />
              <button onClick={() => onChange((parseFloat(currentValue || latestVal || 0) + field.step).toFixed(field.step < 1 ? 1 : 0))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '20px', padding: '0', lineHeight: 1, fontFamily: 'inherit' }}>+</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', borderRadius: '10px', padding: '0 12px', fontSize: '13px', fontWeight: 700, color: 'var(--text-2)' }}>{field.unit}</div>
            <button onClick={() => onSave(field.id, currentValue)}
              disabled={!currentValue}
              style={{ padding: '0 18px', borderRadius: '12px', border: 'none', background: currentValue ? field.color : 'var(--bg-2)', color: currentValue ? '#000' : 'var(--text-3)', fontSize: '13px', fontWeight: 800, cursor: currentValue ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s ease' }}>
              Log
            </button>
          </div>

          {/* Chart */}
          {history.length >= 2 && (
            <div style={{ background: 'var(--bg-0)', borderRadius: '12px', padding: '12px' }}>
              <LineChart data={history} color={field.color} unit={field.unit} />
            </div>
          )}

          {/* Last 5 entries */}
          {history.length > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[...history].reverse().slice(0, 5).map((entry, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderRadius: '8px', background: i === 0 ? `${field.color}12` : 'transparent' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                    {new Date(entry.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: i === 0 ? 800 : 600, color: i === 0 ? field.color : 'var(--text-2)' }}>
                    {entry.value} {field.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function MeasurementsPage() {
  const navigate = useNavigate();
  const { isPro } = usePro();

  // history: { [fieldId]: [{value, date}] }
  const [history, setHistory] = useState({});
  // current input values per field
  const [inputs, setInputs] = useState({});
  const [expanded, setExpanded] = useState('weight');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bv-measurements');
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const handleSave = useCallback((fieldId, value) => {
    if (!value || isNaN(parseFloat(value))) return;
    const entry = { value: parseFloat(value), date: new Date().toISOString() };
    setHistory(prev => {
      const updated = { ...prev, [fieldId]: [...(prev[fieldId] || []), entry] };
      try { localStorage.setItem('bv-measurements', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setInputs(prev => ({ ...prev, [fieldId]: '' }));
    setSaved(fieldId);
    setTimeout(() => setSaved(''), 1500);
  }, []);

  // Summary: latest values for key metrics
  const latestWeight = history.weight?.at(-1)?.value;
  const latestBodyFat = history.bodyFat?.at(-1)?.value;
  const latestChest   = history.chest?.at(-1)?.value;
  const latestArm     = history.lArm?.at(-1)?.value;

  // Free users see only weight, chest, waist, arms
  const freeFields = ['weight', 'chest', 'waist', 'lArm'];
  const visibleFields = isPro ? FIELDS : FIELDS.filter(f => freeFields.includes(f.id));

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', paddingBottom: '80px' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}} @keyframes pop{0%{transform:scale(0.8)}60%{transform:scale(1.1)}100%{transform:scale(1)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 20px 16px', position: 'sticky', top: 0, zIndex: 40, background: 'var(--bg-0)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-0)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>Measurements</h1>
          <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>Track your body composition over time</p>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Quick stats row */}
        {(latestWeight || latestBodyFat || latestChest || latestArm) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', margin: '16px 0', animation: 'fadeUp 0.35s both' }}>
            {[
              { label: 'Weight', val: latestWeight, unit: 'kg', color: '#C8FF00' },
              { label: 'Body Fat', val: latestBodyFat, unit: '%', color: '#FF9500' },
              { label: 'Chest', val: latestChest, unit: 'cm', color: '#4ECDC4' },
              { label: 'Arm', val: latestArm, unit: 'cm', color: '#E74C3C' },
            ].map((s, i) => s.val ? (
              <div key={i} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 900, color: s.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '3px' }}>{s.val}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: '9px', color: 'var(--text-3)' }}>{s.unit}</div>
              </div>
            ) : null)}
          </div>
        )}

        {/* Field cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {visibleFields.map((field, i) => (
            <div key={field.id} style={{ animation: `fadeUp 0.35s ${i * 0.04}s both`, position: 'relative' }}>
              <FieldCard
                field={field}
                history={history[field.id] || []}
                currentValue={inputs[field.id] || ''}
                onChange={val => setInputs(prev => ({ ...prev, [field.id]: val }))}
                onSave={handleSave}
                expanded={expanded === field.id}
                onToggle={() => setExpanded(expanded === field.id ? null : field.id)}
              />
              {/* Saved flash */}
              {saved === field.id && (
                <div style={{ position: 'absolute', top: '12px', right: '48px', background: 'var(--accent)', color: '#000', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '99px', pointerEvents: 'none', animation: 'pop 0.3s both' }}>
                  Saved!
                </div>
              )}
            </div>
          ))}
        </div>

        {/* PRO upsell for locked fields */}
        {!isPro && (
          <div style={{ marginBottom: '16px' }}>
            <UpgradePrompt feature="Full Body Tracking" desc="PRO unlocks hips, neck, thighs, calves, shoulders, body fat — with unlimited history and trend charts." />
          </div>
        )}

        {/* Reset */}
        {Object.keys(history).length > 0 && (
          <button
            onClick={() => { if (window.confirm('Clear all measurement history?')) { setHistory({}); localStorage.removeItem('bv-measurements'); }}}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'transparent', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Clear All Data
          </button>
        )}
      </div>
    </div>
  );
}
