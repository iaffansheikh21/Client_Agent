'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ConversationDetailPage({ params }: { params: { id: string } }) {
  const [conv, setConv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.getConversation(params.id)
      .then(setConv)
      .finally(() => setLoading(false));
  }, [params.id]);

  const updateStatus = async (status: string) => {
    await api.updateStatus(params.id, status);
    setConv((prev: any) => ({ ...prev, status }));
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text2)' }}>
      Loading...
    </div>
  );

  if (!conv) return (
    <div style={{ color: 'var(--red)', padding: '40px' }}>Conversation not found</div>
  );

  const statusColor: Record<string, string> = {
    active: 'var(--green)', escalated: 'var(--red)', resolved: 'var(--blue)',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'var(--text2)',
          cursor: 'pointer', fontSize: '13px', marginBottom: '16px',
          fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>
              CONVERSATION
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.5px' }}>
              {conv.id.slice(0, 20)}...
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['active', 'resolved', 'escalated'].map((s) => (
              <button key={s} onClick={() => updateStatus(s)} style={{
                padding: '8px 16px', borderRadius: '6px', border: '1px solid',
                borderColor: conv.status === s ? statusColor[s] : 'var(--border)',
                background: conv.status === s ? `${statusColor[s]}22` : 'transparent',
                color: conv.status === s ? statusColor[s] : 'var(--text2)',
                fontSize: '12px', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                textTransform: 'capitalize',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px',
      }}>
        {[
          { label: 'Channel', value: conv.channel },
          { label: 'Status', value: conv.status },
          { label: 'Messages', value: conv.messages?.length || 0 },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '16px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: '16px', fontWeight: 600, textTransform: 'capitalize' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '24px' }}>
          MESSAGES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {conv.messages?.map((msg: any) => (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                background: msg.role === 'user' ? 'var(--bg3)' : 'rgba(124,111,255,0.15)',
                border: '1px solid',
                borderColor: msg.role === 'user' ? 'var(--border)' : 'rgba(124,111,255,0.3)',
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {msg.role === 'user' ? 'Client' : 'Agent'}
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
                  {msg.content}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
