import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ── FFMI Formulas ─────────────────────────────────────────────────────────
// Based on Kouri et al. 1995 + standard normalization
function calculateFFMI(weightKg, heightCm, bodyFatPct) {
  const heightM = heightCm / 100;
  const lbm = weightKg * (1 - bodyFatPct / 100);       // lean body mass kg
  const rawFFMI = lbm / (heightM * heightM);             // raw FFMI
  const adjFFMI = rawFFMI + 6.1 * (1.8 - heightM);     // normalized to 1.8m
  return { lbm: +lbm.toFixed(1), rawFFMI: +rawFFMI.toFixed(1), adjFFMI: +adjFFMI.toFixed(1) };
}

// ── FFMI classification ───────────────────────────────────────────────────
function classifyFFMI(ffmi, gender) {
  const limits = gender === 'male'
    ? [
        { max: 17,   label: 'Below Average',  color: '#888',         desc: 'Below typical untrained male' },
        { max: 18.5, label: 'Average',         color: '#aaa',         desc: 'Typical untrained to lightly active' },
        { max: 20,   label: 'Above Average',   color: 'var(--orange)', desc: 'Some gym experience showing' },
        { max: 22,   label: 'Excellent',       color: 'var(--accent)', desc: 'Dedicated training visible' },
        { max: 23,   label: 'Superior',        color: 'var(--accent)', desc: 'Competitive amateur level' },
        { max: 25,   label: 'Elite Natural',   color: '#00e5ff',      desc: 'Top natural physique limit' },
        { max: 99,   label: 'Enhanced',        color: 'var(--red)',   desc: 'Exceeds natural limits — likely enhanced' },
      ]
    : [
        { max: 14,   label: 'Below Average',  color: '#888',         desc: 'Below typical untrained female' },
        { max: 16,   label: 'Average',         color: '#aaa',         desc: 'Typical untrained to lightly active' },
        { max: 17.5, label: 'Above Average',   color: 'var(--orange)', desc: 'Some gym experience showing' },
        { max: 19,   label: 'Excellent',       color: 'var(--accent)', desc: 'Dedicated training visible' },
        { max: 21,   label: 'Superior',        color: 'var(--accent)', desc: 'Competitive amateur level' },
        { max: 22,   label: 'Elite Natural',   color: '#00e5ff',      desc: 'Top natural physique limit' },
        { max: 99,   label: 'Enhanced',        color: 'var(--red)',   desc: 'Exceeds natural limits' },
      ];

  return limits.find(l => ffmi <= l.max) || limits[limits.length - 1];
}

// Max natural FFMI by gender
const MAX_NATURAL = { male: 25, female: 22 };

// ── Casey Butt max lean mass formula ─────────────────────────────────────
function maxNaturalLBM(heightCm, gender) {
  // Simplified Casey Butt formula
  const h = heightCm / 2.54; // to inches
  if (gender === 'male') {
    return +(1.1 * h - 60).toFixed(1); // rough estimate in kg
  }
  return +(0.82 * h - 42).toFixed(1);
}

export default function FFMIPage() {
  const navigate = useNavigate();
  const [gender, setGender] = useState('male');
  const [unit, setUnit] = useState('metric'); // metric | imperial
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculate = useCallback(() => {
    setError('');
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const bf = parseFloat(bodyFat);

    if (!w || !h || !bf) { setError('Fill in all fields'); return; }
    if (bf < 3 || bf > 60) { setError('Body fat must be 3–60%'); return; }

    const wKg = unit === 'imperial' ? w * 0.453592 : w;
    const hCm = unit === 'imperial' ? h * 2.54 : h;

    if (hCm < 130 || hCm > 230) { setError('Height must be 130–230 cm'); return; }
    if (wKg < 30 || wKg > 200) { setError('Weight seems out of range'); return; }

    const { lbm, rawFFMI, adjFFMI } = calculateFFMI(wKg, hCm, bf);
    const classification = classifyFFMI(adjFFMI, gender);
    const maxNatural = MAX_NATURAL[gender];
    const pctOfLimit = Math.min((adjFFMI / maxNatural) * 100, 105);
    const lbmToAdd = Math.max(0, maxNaturalLBM(hCm, gender) - lbm);

    setResult({ lbm, rawFFMI, adjFFMI, classification, pctOfLimit, lbmToAdd, maxNatural, hCm, wKg, bf });
  }, [weight, height, bodyFat, unit, gender]);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-0)', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '20px 20px 16px',
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--bg-0)',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-0)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>FFMI Calculator</h1>
          <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>Fat-Free Mass Index — Natural Limit Checker</p>
        </div>
      </div>

      <div style={{ padding: '0 20px', animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* What is FFMI */}
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '16px', marginBottom: '20px',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6 }}>
            FFMI measures your muscle mass relative to your height. The natural limit is <strong style={{ color: 'var(--accent)' }}>25 for men</strong> and <strong style={{ color: 'var(--accent)' }}>22 for women</strong> (Kouri et al. 1995). Elite natural bodybuilders rarely exceed this.
          </p>
        </div>

        {/* Gender toggle */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Gender</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['male', 'female'].map(g => (
              <button key={g} onClick={() => setGender(g)} style={{
                flex: 1, padding: '12px',
                borderRadius: '12px', border: `1.5px solid ${gender === g ? 'var(--accent)' : 'var(--border)'}`,
                background: gender === g ? 'var(--accent-dim)' : 'transparent',
                color: gender === g ? 'var(--accent)' : 'var(--text-2)',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}>
                {g === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>

        {/* Unit toggle */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>Units</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[{ id: 'metric', label: 'kg / cm' }, { id: 'imperial', label: 'lbs / inches' }].map(u => (
              <button key={u.id} onClick={() => setUnit(u.id)} style={{
                flex: 1, padding: '12px',
                borderRadius: '12px', border: `1.5px solid ${unit === u.id ? 'var(--accent)' : 'var(--border)'}`,
                background: unit === u.id ? 'var(--accent-dim)' : 'transparent',
                color: unit === u.id ? 'var(--accent)' : 'var(--text-2)',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}>
                {u.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: `Weight (${unit === 'metric' ? 'kg' : 'lbs'})`, key: 'weight', setter: setWeight, val: weight, placeholder: unit === 'metric' ? '80' : '176' },
            { label: `Height (${unit === 'metric' ? 'cm' : 'inches'})`, key: 'height', setter: setHeight, val: height, placeholder: unit === 'metric' ? '178' : '70' },
            { label: 'Body Fat %', key: 'bf', setter: setBodyFat, val: bodyFat, placeholder: '12' },
          ].map(field => (
            <div key={field.key}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                {field.label}
              </div>
              <input
                type="number"
                inputMode="decimal"
                placeholder={field.placeholder}
                value={field.val}
                onChange={e => field.setter(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px',
                  borderRadius: '14px', border: '1.5px solid var(--border)',
                  background: 'var(--bg-1)', color: 'var(--text-0)',
                  fontSize: '16px', fontWeight: 600, fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.2)', color: 'var(--red)', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <button
          onClick={calculate}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: 'var(--gradient-accent)', color: '#000',
            fontSize: '16px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
            letterSpacing: '-0.01em', marginBottom: '24px',
          }}
        >
          Calculate FFMI
        </button>

        {/* Result */}
        {result && <FFMIResult result={result} gender={gender} />}
      </div>
    </div>
  );
}

function FFMIResult({ result, gender }) {
  const { adjFFMI, lbm, pctOfLimit, classification, lbmToAdd, maxNatural, rawFFMI } = result;
  const gaugeAngle = Math.min((adjFFMI / 30) * 180, 180); // 0–30 mapped to 0–180deg

  return (
    <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>

      {/* Main score card */}
      <div style={{
        background: 'var(--bg-1)', border: `1px solid ${classification.color}30`,
        borderRadius: '20px', padding: '24px', marginBottom: '16px',
        textAlign: 'center',
        boxShadow: `0 0 40px ${classification.color}15`,
      }}>
        {/* FFMI number */}
        <div style={{
          fontSize: '72px', fontWeight: 900,
          color: classification.color,
          letterSpacing: '-0.06em', lineHeight: 1,
          marginBottom: '4px',
        }}>
          {adjFFMI}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Adjusted FFMI
        </div>

        {/* Classification badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 20px', borderRadius: '99px',
          background: `${classification.color}15`,
          border: `1px solid ${classification.color}30`,
          marginBottom: '8px',
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: classification.color }} />
          <span style={{ fontSize: '14px', fontWeight: 800, color: classification.color, letterSpacing: '0.02em' }}>
            {classification.label}
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, maxWidth: '260px', margin: '0 auto' }}>
          {classification.desc}
        </p>
      </div>

      {/* Progress to natural limit */}
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '18px', marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)' }}>Natural limit progress</span>
          <span style={{ fontSize: '13px', fontWeight: 800, color: classification.color }}>
            {adjFFMI} / {maxNatural}
          </span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg-2)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(pctOfLimit, 100)}%`,
            background: pctOfLimit > 100
              ? 'var(--red)'
              : `linear-gradient(90deg, var(--accent) 0%, ${classification.color} 100%)`,
            borderRadius: '99px',
            transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600 }}>0</span>
          <span style={{ fontSize: '10px', color: 'var(--text-2)', fontWeight: 600 }}>{pctOfLimit.toFixed(0)}% of natural limit</span>
          <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600 }}>{maxNatural}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        {[
          { label: 'Lean Body Mass', value: `${lbm} kg`, sub: 'fat-free weight' },
          { label: 'Raw FFMI', value: rawFFMI, sub: 'before height adj.' },
          { label: 'Body Fat', value: `${result.bf}%`, sub: 'of total weight' },
          { label: 'LBM to gain', value: lbmToAdd > 0 ? `+${lbmToAdd} kg` : 'At limit', sub: 'to reach natural max' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '14px',
          }}>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', marginBottom: '2px' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Scale reference */}
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '16px', marginBottom: '20px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '12px' }}>
          FFMI Scale ({gender === 'male' ? 'Male' : 'Female'})
        </div>
        {[
          { range: gender === 'male' ? '< 18' : '< 16', label: 'Below Average', color: '#888' },
          { range: gender === 'male' ? '18–20' : '16–17.5', label: 'Average to Above', color: '#aaa' },
          { range: gender === 'male' ? '20–22' : '17.5–19', label: 'Excellent', color: 'var(--orange)' },
          { range: gender === 'male' ? '22–25' : '19–22', label: 'Elite Natural', color: 'var(--accent)' },
          { range: gender === 'male' ? '> 25' : '> 22', label: 'Enhanced Territory', color: 'var(--red)' },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 0',
            borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
            background: row.label === (adjFFMI > maxNatural ? 'Enhanced Territory' : 
              adjFFMI >= (gender === 'male' ? 22 : 19) ? 'Elite Natural' :
              adjFFMI >= (gender === 'male' ? 20 : 17.5) ? 'Excellent' :
              adjFFMI >= (gender === 'male' ? 18 : 16) ? 'Average to Above' : 'Below Average') 
              ? `${row.color}10` : 'transparent',
            borderRadius: '8px', paddingLeft: '8px',
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: row.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{row.label}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 500 }}>{row.range}</span>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: '11px', color: 'var(--text-3)', lineHeight: 1.6, textAlign: 'center', paddingBottom: '20px' }}>
        FFMI is a statistical tool. Outlier genetics exist. Use as guidance, not judgment. 
        Based on Kouri et al. (1995) research on competitive bodybuilders.
      </p>
    </div>
  );
}
