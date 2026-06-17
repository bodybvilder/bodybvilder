import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Macro ring chart ──────────────────────────────────────────────────────
function MacroRing({ protein, carbs, fat, calories }) {
  const total = protein * 4 + carbs * 4 + fat * 9;
  if (total === 0) return null;

  const R = 44;
  const circ = 2 * Math.PI * R;
  const pPct = (protein * 4 / total) * 100;
  const cPct = (carbs * 4 / total) * 100;
  const fPct = (fat * 9 / total) * 100;
  const pDash = (pPct / 100) * circ;
  const cDash = (cPct / 100) * circ;
  const fDash = (fPct / 100) * circ;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--bg-2)" strokeWidth="10" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--red)" strokeWidth="10"
            strokeDasharray={`${fDash} ${circ}`} strokeDashoffset={0} strokeLinecap="round" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--orange)" strokeWidth="10"
            strokeDasharray={`${cDash} ${circ}`} strokeDashoffset={-fDash} strokeLinecap="round" />
          <circle cx="50" cy="50" r={R} fill="none" stroke="var(--accent)" strokeWidth="10"
            strokeDasharray={`${pDash} ${circ}`} strokeDashoffset={-(fDash + cDash)} strokeLinecap="round" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-0)', lineHeight: 1 }}>{calories}</div>
          <div style={{ fontSize: '9px', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.05em' }}>kcal</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { label: 'Protein', value: protein, color: 'var(--accent)', pct: pPct },
          { label: 'Carbs',   value: carbs,   color: 'var(--orange)', pct: cPct },
          { label: 'Fat',     value: fat,     color: 'var(--red)',    pct: fPct },
        ].map(m => (
          <div key={m.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: m.color }}>{m.label}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-0)' }}>{m.value}g</span>
            </div>
            <div style={{ height: '4px', background: 'var(--bg-2)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: '99px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Call our backend (not OpenAI directly) ────────────────────────────────
async function analyzeFoodViaBackend(base64Image) {
  const response = await fetch('/api/analyze-food', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Analysis failed');
  }

  return data;
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function FoodScanPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bv-food-history') || '[]'); }
    catch { return []; }
  });

  const handleImage = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(',')[1];
      setImage(base64);
      setImageUrl(dataUrl);
      setResult(null);
      setError('');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e) => handleImage(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); handleImage(e.dataTransfer.files[0]); };

  const analyze = useCallback(async () => {
    if (!image) { setError('Select a photo first'); return; }

    setLoading(true);
    setError('');
    try {
      const data = await analyzeFoodViaBackend(image);
      setResult(data);

      // Save to history
      const entry = {
        date: new Date().toISOString(),
        imageUrl,
        total: data.total,
        foods: data.foods.map(f => f.name).join(', '),
      };
      const newHistory = [entry, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('bv-food-history', JSON.stringify(newHistory));
    } catch (err) {
      setError(err.message || 'Analysis failed. Try again.');
    }
    setLoading(false);
  }, [image, imageUrl, history]);

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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>Food Scanner</h1>
          <p style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>AI macro analysis from photo</p>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* Info banner */}
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '14px 16px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '10px',
          animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-dim)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.5 }}>
            Take a photo of your meal and get instant protein, carbs, fat breakdown powered by AI.
          </p>
        </div>

        {/* Photo picker */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          style={{
            border: `2px dashed ${imageUrl ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '20px', overflow: 'hidden',
            cursor: 'pointer', marginBottom: '14px',
            transition: 'border-color 0.2s ease',
            minHeight: imageUrl ? 'auto' : '180px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: imageUrl ? 'transparent' : 'var(--bg-1)',
            animation: 'fadeUp 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Food" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'var(--accent-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '4px' }}>Tap to photograph meal</p>
              <p style={{ fontSize: '12px', color: 'var(--text-2)' }}>or drag & drop an image</p>
            </div>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

        {/* Change photo */}
        {imageUrl && (
          <button onClick={() => fileInputRef.current?.click()} style={{
            width: '100%', padding: '12px', borderRadius: '14px',
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-2)', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', marginBottom: '12px',
          }}>
            Change Photo
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '12px',
            background: 'rgba(255,59,59,0.1)', border: '1px solid rgba(255,59,59,0.2)',
            color: 'var(--red)', fontSize: '13px', marginBottom: '12px', lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={!image || loading}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: image && !loading ? 'var(--gradient-accent)' : 'var(--bg-2)',
            color: image && !loading ? '#000' : 'var(--text-3)',
            fontSize: '16px', fontWeight: 800,
            cursor: image && !loading ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', letterSpacing: '-0.01em', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}
        >
          {loading ? (
            <>
              <div style={{ width: '18px', height: '18px', border: '2.5px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Analyzing...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Analyze Nutrition
            </>
          )}
        </button>

        {/* Results */}
        {result && <FoodResult result={result} />}

        {/* History */}
        {history.length > 0 && !result && (
          <div style={{ marginTop: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Recent Scans
            </h3>
            {history.slice(0, 5).map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg-1)', border: '1px solid var(--border)',
                borderRadius: '14px', padding: '12px 14px', marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '12px',
                animation: `fadeUp 0.3s ${i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
              }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.foods}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                    {item.total?.calories} kcal · {item.total?.protein}g protein
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', flexShrink: 0 }}>
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FoodResult({ result }) {
  const { foods, total, confidence, notes } = result;
  const confColor = confidence === 'high' ? 'var(--green)' : confidence === 'medium' ? 'var(--orange)' : 'var(--red)';

  return (
    <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>

      {/* Total macros */}
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '20px', marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>
            Total Nutrition
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '99px', background: `${confColor}15` }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: confColor }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: confColor, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {confidence}
            </span>
          </div>
        </div>
        <MacroRing protein={total.protein} carbs={total.carbs} fat={total.fat} calories={total.calories} />
        {total.fiber > 0 && (
          <div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--bg-2)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-2)' }}>
            Fiber: <strong style={{ color: 'var(--text-1)' }}>{total.fiber}g</strong>
          </div>
        )}
      </div>

      {/* Per food */}
      {foods.length > 1 && (
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-0)', marginBottom: '10px', letterSpacing: '-0.02em' }}>
            Breakdown
          </h3>
          {foods.map((food, i) => (
            <div key={i} style={{
              background: 'var(--bg-1)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '14px', marginBottom: '8px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '2px' }}>{food.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{food.portion}</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.03em' }}>
                  {food.calories} kcal
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'P', value: food.protein, color: 'var(--accent)' },
                  { label: 'C', value: food.carbs,   color: 'var(--orange)' },
                  { label: 'F', value: food.fat,     color: 'var(--red)' },
                ].map(m => (
                  <div key={m.label} style={{ flex: 1, padding: '6px', background: 'var(--bg-2)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: m.color }}>{m.value}g</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-3)', fontWeight: 600 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div style={{
          padding: '12px 14px', borderRadius: '12px',
          background: 'var(--bg-1)', border: '1px solid var(--border)',
          marginBottom: '16px',
          display: 'flex', gap: '8px', alignItems: 'flex-start',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" style={{ marginTop: '1px', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.5 }}>{notes}</p>
        </div>
      )}
    </div>
  );
}
