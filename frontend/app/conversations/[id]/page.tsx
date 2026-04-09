'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const statusColor: Record<string, string> = {
  active: 'var(--green)',
  escalated: 'var(--red)',
  resolved: 'var(--blue)',
};

export default function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [conv, setConv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.getConversation(id)
      .then(setConv)
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    await api.updateStatus(id, status);
    setConv((prev: any) => ({ ...prev, status }));
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text2)' }}>Loading...</div>;
  if (!conv) return <div style={{ padding: '40px', color: 'var(--red)' }}>Conversation not found</div>;

  return (
    <div>
      {/* Back */}
      <button onClick={() => router.back()} style={{
        background: 'none', border: 'none', color: 'var(--text2)',
        cursor: 'pointer', fontSize: '13px', marginBottom: '24px',
        fontFamily: 'Syne, sans-serif',
      }}>← Back</button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>CONVERSATION</div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{conv.id}</h1>
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
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Channel', value: conv.channel },
          { label: 'Status', value: conv.status },
          { label: 'Messages', value: conv.messages?.length || 0 },
          { label: 'Created', value: new Date(conv.created_at).toLocaleDateString() },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '16px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>
              {label.toUpperCase()}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, textTransform: 'capitalize' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '24px' }}>
          MESSAGES ({conv.messages?.length || 0})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '600px', overflowY: 'auto' }}>
          {conv.messages?.length === 0 && (
            <div style={{ color: 'var(--text2)', textAlign: 'center', padding: '40px' }}>No messages</div>
          )}
          {conv.messages?.map((msg: any) => (
            msg.content && (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-start' : 'flex-end',
              }}>
                <div style={{
                  maxWidth: '70%', padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                  background: msg.role === 'user' ? 'var(--bg3)' : 'rgba(124,111,255,0.15)',
                  border: '1px solid',
                  borderColor: msg.role === 'user' ? 'var(--border)' : 'rgba(124,111,255,0.3)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text2)', marginBottom: '6px', letterSpacing: '1px' }}>
                    {msg.role === 'user' ? '👤 CLIENT' : '🤖 AGENT'}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text)' }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
