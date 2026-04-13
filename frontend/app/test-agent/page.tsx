'use client';
import { useState, useRef, useEffect } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  action?: { type: string; payload: any };
  timestamp: Date;
}

export default function TestAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [testerName, setTesterName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setMessages([{
      role: 'assistant',
      content: 'Hello! I am your AI Agent. Send me a test message to see how I respond to clients.',
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSetName = () => {
    if (testerName.trim()) setNameSet(true);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          channel: 'api',
          message: text,
          sender_name: testerName.trim() || 'Test User',
          dry_run: dryRun,
        }),
      });
      const data = await res.json();
      setClientId(data.client_id);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        action: data.action?.type !== 'none' ? data.action : undefined,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error connecting to agent. Is the backend running?',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const actionColor: Record<string, string> = {
    create_task: 'var(--amber)',
    send_invoice: 'var(--green)',
    escalate: 'var(--red)',
  };

  const actionLabel: Record<string, string> = {
    create_task: '📋 Trello Task Would Be Created',
    send_invoice: '💰 Invoice Would Be Sent',
    escalate: '⚡ Would Escalate to Human',
  };

  const actionLabelReal: Record<string, string> = {
    create_task: '📋 Trello Task Created',
    send_invoice: '💰 Invoice Sent',
    escalate: '⚡ Escalated to Human',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>TEST</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Test Agent</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Dry Run Toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', borderRadius: '8px',
              background: dryRun ? 'rgba(255,184,79,0.1)' : 'rgba(255,79,111,0.1)',
              border: `1px solid ${dryRun ? 'var(--amber)' : 'var(--red)'}`,
            }}>
              <div style={{ fontSize: '12px', color: dryRun ? 'var(--amber)' : 'var(--red)', fontWeight: 600 }}>
                {dryRun ? '🔒 Dry Run ON' : '⚡ Live Mode'}
              </div>
              <div
                onClick={() => setDryRun(!dryRun)}
                style={{
                  width: '36px', height: '20px', borderRadius: '10px',
                  background: dryRun ? 'var(--amber)' : 'var(--red)',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px',
                  left: dryRun ? '3px' : '19px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: 'white', transition: 'left 0.2s',
                }} />
              </div>
            </div>

            {/* New conversation */}
            <button onClick={() => {
              setMessages([{ role: 'assistant', content: 'New conversation started.', timestamp: new Date() }]);
              setClientId(null);
            }} style={{
              padding: '8px 16px', borderRadius: '6px',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text2)', fontSize: '12px', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif',
            }}>
              New Chat
            </button>

            {clientId && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg3)', fontSize: '11px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
                ID: {clientId.slice(0, 12)}...
              </div>
            )}
          </div>
        </div>

        {/* Tester name input */}
        {!nameSet ? (
          <div style={{
            marginTop: '12px', padding: '12px 16px', borderRadius: '8px',
            background: 'rgba(124,111,255,0.08)',
            border: '1px solid rgba(124,111,255,0.25)',
            display: 'flex', gap: '10px', alignItems: 'center',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>Your name:</span>
            <input
              placeholder="Enter your name for testing..."
              value={testerName}
              onChange={e => setTesterName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSetName()}
              style={{
                flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: '6px', padding: '8px 12px', color: 'var(--text)',
                fontSize: '13px', fontFamily: 'Syne, sans-serif', outline: 'none',
              }}
            />
            <button onClick={handleSetName} style={{
              padding: '8px 16px', borderRadius: '6px',
              background: 'rgba(124,111,255,0.2)', border: '1px solid var(--accent)',
              color: 'var(--accent)', fontSize: '12px', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap',
            }}>
              Set Name
            </button>
          </div>
        ) : (
          <div style={{
            marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '12px', color: 'var(--text2)',
          }}>
            Testing as:
            <strong style={{ color: 'var(--accent)' }}>{testerName}</strong>
            <span
              onClick={() => setNameSet(false)}
              style={{ cursor: 'pointer', color: 'var(--text2)', textDecoration: 'underline' }}
            >
              change
            </span>
          </div>
        )}

        {/* Dry run explanation */}
        <div style={{
          marginTop: '12px', padding: '10px 16px', borderRadius: '8px',
          background: dryRun ? 'rgba(255,184,79,0.08)' : 'rgba(255,79,111,0.08)',
          border: `1px solid ${dryRun ? 'rgba(255,184,79,0.2)' : 'rgba(255,79,111,0.2)'}`,
          fontSize: '12px', color: 'var(--text2)',
        }}>
          {dryRun
            ? '🔒 Dry Run: AI will respond normally but NO actual Trello tasks, emails, or Slack alerts will be created.'
            : '⚡ Live Mode: Real actions WILL happen — Trello tasks will be created, escalations will fire.'}
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '24px', marginBottom: '16px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '70%', padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
              background: msg.role === 'user' ? 'rgba(124,111,255,0.2)' : 'var(--bg3)',
              border: '1px solid',
              borderColor: msg.role === 'user' ? 'rgba(124,111,255,0.4)' : 'var(--border)',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>
                {msg.role === 'user' ? `👤 ${testerName || 'YOU'}` : '🤖 AGENT'}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                {mounted ? msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
              </div>
            </div>

            {/* Action badge */}
            {msg.action && msg.action.type !== 'none' && (
              <div style={{
                marginTop: '6px', padding: '6px 14px', borderRadius: '6px',
                background: `${actionColor[msg.action.type]}22`,
                border: `1px solid ${actionColor[msg.action.type]}44`,
                color: actionColor[msg.action.type],
                fontSize: '12px', fontWeight: 600,
              }}>
                {dryRun ? actionLabel[msg.action.type] : actionLabelReal[msg.action.type]}
                {msg.action.payload?.title && (
                  <span style={{ fontWeight: 400, color: 'var(--text2)', marginLeft: '8px' }}>
                    — {msg.action.payload.title}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '4px 12px 12px 12px', background: 'var(--bg3)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--accent)',
                    animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Type a test message... (Enter to send)"
          style={{
            flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '14px 18px', color: 'var(--text)',
            fontSize: '14px', fontFamily: 'Syne, sans-serif', outline: 'none',
          }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          padding: '14px 28px', borderRadius: '8px',
          background: loading ? 'var(--bg3)' : 'rgba(124,111,255,0.2)',
          border: '1px solid var(--accent)',
          color: 'var(--accent)', fontSize: '14px', fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Syne, sans-serif',
        }}>
          {loading ? '...' : 'Send →'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}