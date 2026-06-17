import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { openPolarCheckout, POLAR_PRICES } from '../payments/polar';

const FEATURE_ROWS = [
  { label: 'AI Form Analysis',         free: true,  pro: true,  core: true },
  { label: 'Rep Counter',              free: true,  pro: true,  core: true },
  { label: 'All 31 Exercises',         free: true,  pro: true  },
  { label: 'Basic Stats',              free: true,  pro: true  },
  { label: 'Last 10 Workouts',         free: true,  pro: false },
  { label: 'Full Workout History',     free: false, pro: true  },
  { label: 'Form Score Trends',        free: false, pro: true  },
  { label: 'Program Builder',          free: false, pro: true  },
  { label: 'Smart Rest Timer',         free: false, pro: true  },
  { label: 'All Themes',               free: false, pro: true  },
  { label: 'Export Data (CSV/PDF)',    free: false, pro: true  },
  { label: 'Achievements & Badges',   free: false, pro: true  },
];

const PRO_HIGHLIGHTS = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    title: 'Form Score Trends',
    desc: 'See exactly how your form improves over weeks. Per-exercise progress chart.'
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    title: 'Program Builder',
    desc: 'Design custom routines. Save your 20×4 layout. Run it every time.'
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: 'Smart Rest Timer',
    desc: 'Auto countdown between sets. Vibration alert when ready.'
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
    title: 'Achievements',
    desc: '50+ badges. Unlock as you hit milestones. Flex on your share card.'
  },
];

export default function ProPage({ user }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = () => {
    setLoading(true);
    openPolarCheckout(selectedPlan, user?.email);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-0)',
      paddingBottom: '40px',
      overflowX: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 20px',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '8px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 600 }}>
          Cancel anytime
        </span>
      </div>

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: '8px 24px 32px',
        animation: 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--accent-dim)',
          border: '1px solid rgba(200,255,0,0.2)',
          marginBottom: '20px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em' }}>
            BODYBVILDER PRO
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 7vw, 40px)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.05,
          color: 'var(--text-0)',
          marginBottom: '14px',
        }}>
          Train like a pro.<br />
          <span style={{
            background: 'var(--gradient-accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Track like one too.
          </span>
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.6, maxWidth: '300px', margin: '0 auto' }}>
          The AI form coach is always free. PRO adds everything a serious lifter needs.
        </p>
      </div>

      {/* PRO Highlights */}
      <div style={{
        padding: '0 16px 32px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        animation: 'fadeUp 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        {PRO_HIGHLIGHTS.map((item, i) => (
          <div key={i} style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}>
            <div style={{
              width: '40px', height: '40px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '10px',
            }}>
              {item.icon}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '4px' }}>
              {item.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.5 }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Plan Selector */}
      <div style={{
        padding: '0 16px 20px',
        animation: 'fadeUp 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            style={{
              flex: 1, padding: '16px 12px',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${selectedPlan === 'monthly' ? 'var(--accent)' : 'var(--border)'}`,
              background: selectedPlan === 'monthly' ? 'var(--accent-dim)' : 'var(--bg-1)',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '4px' }}>
              MONTHLY
            </div>
            <div style={{
              fontSize: '20px', fontWeight: 800,
              color: selectedPlan === 'monthly' ? 'var(--accent)' : 'var(--text-0)',
              letterSpacing: '-0.03em',
            }}>
              $4.99
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{POLAR_PRICES.monthly.label}</div>
          </button>

          {/* Yearly — recommended */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            style={{
              flex: 1, padding: '16px 12px',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${selectedPlan === 'yearly' ? 'var(--accent)' : 'var(--border)'}`,
              background: selectedPlan === 'yearly' ? 'var(--accent-dim)' : 'var(--bg-1)',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Best value badge */}
            <div style={{
              position: 'absolute', top: '0', right: '0',
              background: 'var(--accent)',
              color: '#000',
              fontSize: '9px', fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '0 var(--radius-lg) 0 var(--radius-sm)',
              letterSpacing: '0.05em',
            }}>
              SAVE 50%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '4px' }}>
              YEARLY
            </div>
            <div style={{
              fontSize: '20px', fontWeight: 800,
              color: selectedPlan === 'yearly' ? 'var(--accent)' : 'var(--text-0)',
              letterSpacing: '-0.03em',
            }}>
              $29.99
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>$2.50 / month</div>
          </button>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        padding: '0 16px 20px',
        animation: 'fadeUp 0.5s 0.25s cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: loading ? 'var(--bg-3)' : 'var(--gradient-accent)',
            color: '#000',
            fontSize: '16px',
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.15s ease',
            boxShadow: loading ? 'none' : 'var(--accent-glow)',
          }}
        >
          {loading ? (
            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Start 7-Day Free Trial
            </>
          )}
        </button>
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-3)', marginTop: '10px' }}>
          {selectedPlan === 'yearly' ? POLAR_PRICES.yearly.label : POLAR_PRICES.monthly.label} · Cancel anytime · Powered by Polar
        </p>
      </div>

      {/* Feature comparison table */}
      <div style={{ padding: '0 16px', animation: 'fadeUp 0.5s 0.3s cubic-bezier(0.16,1,0.3,1) both' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-0)', marginBottom: '12px', paddingLeft: '4px' }}>
          What you get
        </h3>
        <div style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 60px 60px',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-2)',
          }}>
            <div />
            <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.04em' }}>FREE</div>
            <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em' }}>PRO</div>
          </div>
          {FEATURE_ROWS.map((row, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 60px 60px',
              padding: '11px 16px',
              borderBottom: i < FEATURE_ROWS.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center',
              background: row.core ? 'rgba(200,255,0,0.03)' : 'transparent',
            }}>
              <div style={{ fontSize: '13px', color: row.core ? 'var(--text-0)' : 'var(--text-1)', fontWeight: row.core ? 600 : 400 }}>
                {row.label}
                {row.core && <span style={{ fontSize: '10px', color: 'var(--accent)', marginLeft: '6px', fontWeight: 700 }}>CORE</span>}
              </div>
              <div style={{ textAlign: 'center' }}>
                {row.free ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div style={{ padding: '24px 16px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.6 }}>
          Trusted by athletes worldwide · Powered by MediaPipe AI · Built with privacy in mind
        </p>
      </div>
    </div>
  );
}
