'use client';
import { useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DEFAULT_PROMPT = `You are Alex, a professional AI assistant.
Our services include: Software development, consulting, and support services.

Your responsibilities:
1. Answer client queries professionally
2. Create Trello tasks when client reports a bug or needs support
3. Generate invoices when client asks about billing
4. Escalate to human when issue is complex`;

export default function SettingsPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [agentName, setAgentName] = useState('Alex');
  const [company, setCompany] = useState('Our Company');
  const [services, setServices] = useState('Software development, consulting, and support services');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save to localStorage for now — Week 5 mein API se connect karenge
    localStorage.setItem('agent_settings', JSON.stringify({ agentName, company, services, prompt }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '12px 16px', color: 'var(--text)',
    fontSize: '14px', fontFamily: 'Syne, sans-serif', outline: 'none',
  };

  const labelStyle = {
    fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)',
    marginBottom: '8px', display: 'block',
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>SETTINGS</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Agent Config</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <label style={labelStyle}>AGENT NAME</label>
          <input value={agentName} onChange={e => setAgentName(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <label style={labelStyle}>COMPANY NAME</label>
          <input value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <label style={labelStyle}>SERVICES</label>
        <input value={services} onChange={e => setServices(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <label style={labelStyle}>SYSTEM PROMPT</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={12}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
        />
        <div style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '8px' }}>
          ⚠️ Changes here affect how the AI agent behaves with all clients
        </div>
      </div>

      <button onClick={handleSave} style={{
        padding: '14px 32px', borderRadius: '8px',
        background: saved ? 'rgba(79,255,176,0.15)' : 'rgba(124,111,255,0.2)',
        border: `1px solid ${saved ? 'var(--green)' : 'var(--accent)'}`,
        color: saved ? 'var(--green)' : 'var(--accent)',
        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'Syne, sans-serif', transition: 'all 0.2s',
      }}>
        {saved ? '✓ Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}