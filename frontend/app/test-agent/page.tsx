'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  action?: { type: string; payload: any };
  timestamp: Date;
}

export default function TestAgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Agent. Send me a test message to see how I respond to clients.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await api.chat({
        client_id: clientId,
        channel: 'api',
        message: text,
        sender_name: 'Dashboard Test',
      });

      setClientId(res.client_id);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.reply,
        action: res.action?.type !== 'none' ? res.action : undefined,
        timestamp: new Date(),
      }]);
    } catch (e) {
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
    create_task: '📋 Trello Task Created',
    send_invoice: '💰 Invoice Generated',
    escalate: '⚡ Escalated to Human',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>TEST</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Test Agent</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setMessages([{ role: 'assistant', content: 'New conversation started.', timestamp: new Date() }]); setClientId(null); }}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--text2)', fontSize: '12px',
                cursor: 'pointer', fontFamily: 'Syne, sans-serif',
              }}>
              New Conversation
            </button>
            {clientId && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg3)', fontSize: '11px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
                ID: {clientId.slice(0, 12)}...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', background: 'var(--bg2)',
        border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px', marginBottom: '16px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '70%', padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
              background: msg.role === 'user' ? 'rgba(124,111,255,0.2)' : 'var(--bg3)',
              border: '1px solid',
              borderColor: msg.role === 'user' ? 'rgba(124,111,255,0.4)' : 'var(--border)',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>
                {msg.role === 'user' ? '👤 YOU' : '🤖 AGENT'}
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
                {msg.content}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {/* Action badge */}
            {msg.action && msg.action.type !== 'none' && (
              <div style={{
                marginTop: '6px', padding: '6px 12px', borderRadius: '6px',
                background: `${actionColor[msg.action.type]}22`,
                border: `1px solid ${actionColor[msg.action.type]}44`,
                color: actionColor[msg.action.type],
                fontSize: '12px', fontWeight: 600,
              }}>
                {actionLabel[msg.action.type] || msg.action.type}
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
            <div style={{
              padding: '12px 16px', borderRadius: '4px 12px 12px 12px',
              background: 'var(--bg3)', border: '1px solid var(--border)',
            }}>
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
          placeholder="Type a message to test the agent... (Enter to send)"
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
