import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePro } from '../hooks/usepro';
import UpgradePrompt from '../components/upgradeprompt';

// ── Suggested prompts for new users ──────────────────────────────────────
const SUGGESTIONS = [
  'Analyze my recent workouts',
  'What should I focus on this week?',
  'How do I improve my form scores?',
  'Create a 4-day split for me',
  'Should I bulk or cut right now?',
  'Why are my arms not growing?',
  'Best exercises for V-taper',
  'How much protein do I need?',
];

// ── Message bubble ────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '12px',
      animation: 'fadeUp 0.2s ease both',
    }}>
      {!isUser && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--accent-dim)',
          border: '2px solid rgba(200,255,0,0.3)',
          flexShrink: 0, marginRight: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          alignSelf: 'flex-end',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        </div>
      )}

      <div style={{
        maxWidth: '78%',
        padding: '12px 16px',
        borderRadius: isUser
          ? '18px 18px 4px 18px'
          : '18px 18px 18px 4px',
        background: isUser
          ? 'var(--accent)'
          : 'var(--bg-1)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: isUser ? '#000' : 'var(--text-0)',
        fontSize: '14px',
        fontWeight: isUser ? 600 : 400,
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
        {msg.timestamp && (
          <div style={{
            fontSize: '10px',
            color: isUser ? 'rgba(0,0,0,0.5)' : 'var(--text-3)',
            marginTop: '4px',
            textAlign: 'right',
          }}>
            {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'var(--accent-dim)',
        border: '2px solid rgba(200,255,0,0.3)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
      <div style={{
        padding: '12px 16px',
        borderRadius: '18px 18px 18px 4px',
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        display: 'flex', gap: '5px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: 'var(--text-3)',
            animation: `typingDot 1.4s ${i * 0.2}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function TrainerPage({ user }) {
  const navigate = useNavigate();
  const { isPro } = usePro();
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bv-trainer-chat') || '[]');
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Build user context from localStorage
  const buildUserContext = useCallback(() => {
    try {
      const stats = JSON.parse(localStorage.getItem('bv-stats') || '{}');
      const historyRaw = JSON.parse(localStorage.getItem('bv-history') || '[]');
      const plans = JSON.parse(localStorage.getItem('bv-plans') || '[]');
      return {
        name: user?.displayName?.split(' ')[0] || 'Athlete',
        stats,
        recentWorkouts: historyRaw.slice(-10).reverse(),
        currentPlan: plans[0] || null,
        goals: ['muscle gain'],
        level: 'intermediate',
        equipment: ['bodyweight', 'dumbbell'],
      };
    } catch {
      return { name: user?.displayName?.split(' ')[0] || 'Athlete' };
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Save chat to localStorage (last 40 messages)
  useEffect(() => {
    localStorage.setItem('bv-trainer-chat', JSON.stringify(messages.slice(-40)));
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setShowSuggestions(false);

    const userMsg = { role: 'user', content: msg, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Only send last 10 messages to API to save tokens
      const chatHistory = updatedMessages
        .filter(m => !m.timestamp || true) // include all
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          chatHistory: chatHistory.slice(0, -1), // exclude the one we just added
          userContext: buildUserContext(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      const aiMsg = { role: 'assistant', content: data.reply, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = { role: 'assistant', content: `Sorry, I'm having trouble connecting. Try again in a moment.`, timestamp: Date.now() };
      setMessages(prev => [...prev, errMsg]);
    }
    setLoading(false);
  }, [input, loading, messages, buildUserContext]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear chat history?')) {
      setMessages([]);
      setShowSuggestions(true);
    }
  };

  // FREE users get 3 messages per day
  const todayMsgCount = messages.filter(m => {
    if (m.role !== 'user') return false;
    const d = new Date(m.timestamp);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const freeLimit = 3;
  const canSend = isPro || todayMsgCount < freeLimit;

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg-0)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* CSS for typing animation */}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px',
        background: 'var(--bg-0)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-0)', display: 'flex' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        {/* Coach avatar */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'var(--accent-dim)',
          border: '2px solid rgba(200,255,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          {/* Online indicator */}
          <div style={{
            position: 'absolute', bottom: '1px', right: '1px',
            width: '9px', height: '9px', borderRadius: '50%',
            background: 'var(--green)',
            border: '2px solid var(--bg-0)',
          }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em' }}>
            Coach B
          </div>
          <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600 }}>
            Online · AI Personal Trainer
          </div>
        </div>

        {messages.length > 0 && (
          <button onClick={clearChat} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-3)', display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        )}

        {!isPro && (
          <div style={{
            fontSize: '10px', fontWeight: 700, color: 'var(--text-3)',
            padding: '3px 8px', borderRadius: '99px',
            background: 'var(--bg-2)',
          }}>
            {freeLimit - Math.min(todayMsgCount, freeLimit)}/{freeLimit} left today
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 16px 8px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Welcome message */}
        {messages.length === 0 && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <MessageBubble msg={{
              role: 'assistant',
              content: `Hey ${user?.displayName?.split(' ')[0] || 'Athlete'}! I'm Coach B — your AI personal trainer.\n\nI know your training history and I'm here to help you reach your goals. Ask me anything about your workouts, nutrition, form, or programming.`,
              timestamp: Date.now() - 1000,
            }} />
          </div>
        )}

        {/* Chat history */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions (shown when empty) ── */}
      {showSuggestions && messages.length === 0 && !loading && (
        <div style={{
          padding: '0 16px 12px',
          overflowX: 'auto', scrollbarWidth: 'none',
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '11px', color: 'var(--text-3)', fontWeight: 600,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            marginBottom: '8px', paddingLeft: '2px',
          }}>
            Try asking
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  padding: '8px 14px', borderRadius: '99px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-1)',
                  color: 'var(--text-1)',
                  fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── PRO gate (after free messages used) ── */}
      {!isPro && !canSend && (
        <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
          <UpgradePrompt
            feature="Unlimited AI Coaching"
            desc={`You've used your ${freeLimit} free messages today. PRO gives you unlimited coaching.`}
          />
        </div>
      )}

      {/* ── Input ── */}
      <div style={{
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        background: 'var(--bg-0)',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '10px', alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <div style={{
          flex: 1,
          background: 'var(--bg-1)',
          border: '1.5px solid var(--border)',
          borderRadius: '20px',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center',
          transition: 'border-color 0.15s ease',
        }}
          onFocus={() => {}}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={canSend ? 'Ask Coach B anything...' : 'Upgrade to PRO for unlimited coaching'}
            disabled={!canSend || loading}
            rows={1}
            style={{
              flex: 1,
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-0)', fontSize: '14px', fontFamily: 'inherit',
              resize: 'none', lineHeight: 1.4,
              maxHeight: '80px', overflowY: 'auto',
              scrollbarWidth: 'none',
            }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
            }}
          />
        </div>

        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading || !canSend}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            border: 'none',
            background: input.trim() && canSend ? 'var(--accent)' : 'var(--bg-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() && canSend ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            transition: 'background 0.15s ease',
          }}
        >
          {loading ? (
            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill={input.trim() && canSend ? '#000' : 'var(--text-3)'}>
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
