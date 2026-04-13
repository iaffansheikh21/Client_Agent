'use client';
import { useEffect, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Formal and corporate' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm and approachable' },
  { value: 'formal', label: 'Formal', desc: 'Very corporate and strict' },
  { value: 'casual', label: 'Casual', desc: 'Relaxed and conversational' },
];

export default function SettingsPage() {
  const [form, setForm] = useState({
    agent_name: '',
    company_name: '',
    services: '',
    tone: 'professional',
    extra_instructions: '',
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [updatedAt, setUpdatedAt] = useState('');

  useEffect(() => {
    fetch(`${BASE}/settings/`)
      .then(r => r.json())
      .then(data => {
        setForm({
          agent_name: data.agent_name,
          company_name: data.company_name,
          services: data.services,
          tone: data.tone,
          extra_instructions: data.extra_instructions || '',
        });
        setPreview(data.system_prompt);
        setUpdatedAt(data.updated_at);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8000/settings/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setPreview(data.system_prompt);
      setUpdatedAt(data.updated_at);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch(err) {
      console.error('FETCH ERROR:', err);
      alert('Error: ' + err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'Syne, sans-serif',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: '11px',
    letterSpacing: '2px',
    color: 'var(--text2)',
    marginBottom: '8px',
    display: 'block',
  };

  if (loading) return (
    <div style={{ padding: '40px', color: 'var(--text2)' }}>Loading settings...</div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>SETTINGS</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Agent Config</h1>
          {updatedAt && (
            <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
              Last saved: {new Date(updatedAt).toLocaleString()}
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text2)', fontSize: '14px', marginTop: '8px', lineHeight: '1.6' }}>
          Changes here affect how the agent talks to ALL clients across WhatsApp and Slack — no restart needed.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Left col — form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Agent name + Company */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <label style={labelStyle}>AGENT NAME</label>
              <input
                value={form.agent_name}
                onChange={e => handleChange('agent_name', e.target.value)}
                placeholder="e.g. Alex"
                style={inputStyle}
              />
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '8px' }}>
                Name clients will see in responses
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <label style={labelStyle}>COMPANY NAME</label>
              <input
                value={form.company_name}
                onChange={e => handleChange('company_name', e.target.value)}
                placeholder="e.g. DSTech"
                style={inputStyle}
              />
              <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '8px' }}>
                Company name in agent responses
              </p>
            </div>
          </div>

          {/* Services */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <label style={labelStyle}>SERVICES</label>
            <textarea
              value={form.services}
              onChange={e => handleChange('services', e.target.value)}
              rows={3}
              placeholder="e.g. Web development, Mobile apps, SEO, Cloud hosting"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
            />
            <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '8px' }}>
              Agent will use these when answering {"what do you offer?"}
            </p>
          </div>

          {/* Tone */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <label style={labelStyle}>TONE</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {TONES.map(t => (
                <div key={t.value} onClick={() => handleChange('tone', t.value)} style={{
                  padding: '12px', borderRadius: '8px', cursor: 'pointer',
                  border: '1px solid',
                  borderColor: form.tone === t.value ? 'var(--accent)' : 'var(--border)',
                  background: form.tone === t.value ? 'rgba(124,111,255,0.15)' : 'var(--bg3)',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: form.tone === t.value ? 'var(--accent)' : 'var(--text)', marginBottom: '4px' }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)' }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra instructions */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <label style={labelStyle}>EXTRA INSTRUCTIONS (OPTIONAL)</label>
            <textarea
              value={form.extra_instructions}
              onChange={e => handleChange('extra_instructions', e.target.value)}
              rows={4}
              placeholder="e.g. Always respond in both English and Urdu. Never discuss competitor pricing."
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', fontSize: '13px' }}
            />
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={saving} style={{
            padding: '14px 32px', borderRadius: '8px',
            background: saved ? 'rgba(79,255,176,0.15)' : 'rgba(124,111,255,0.2)',
            border: `1px solid ${saved ? 'var(--green)' : 'var(--accent)'}`,
            color: saved ? 'var(--green)' : 'var(--accent)',
            fontSize: '14px', fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Syne, sans-serif',
            transition: 'all 0.2s',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Saving...' : saved ? '✓ Saved! Agent updated.' : 'Save Changes'}
          </button>
        </div>

        {/* Right col — preview */}
        <div style={{ position: 'sticky', top: '32px', alignSelf: 'start' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '16px' }}>
              SYSTEM PROMPT PREVIEW
            </div>
            <div style={{
              background: 'var(--bg3)', borderRadius: '8px', padding: '16px',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
              lineHeight: '1.7', color: 'var(--text2)',
              whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto',
            }}>
              {preview || 'Fill in the form to see the generated prompt...'}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text2)', marginTop: '12px' }}>
              This is exactly what the AI receives before every client message.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
