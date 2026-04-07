'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {api} from "@/lib/api";

export default function EscalationsPage() {
  const [escalated, setEscalated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConversations('escalated').then(setEscalated).finally(() => setLoading(false));
  }, []);

  const resolve = async (id: string) => {
    await api.updateStatus(id, 'resolved');
    setEscalated(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>ESCALATIONS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>Needs Attention</h1>
          {escalated.length > 0 && (
            <span style={{
              background: 'rgba(255,79,111,0.2)', color: 'var(--red)',
              padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 600,
            }}>
              {escalated.length} pending
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text2)', padding: '40px' }}>Loading...</div>
      ) : escalated.length === 0 ? (
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px',
          padding: '60px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
          <div style={{ color: 'var(--green)', fontSize: '16px', fontWeight: 600 }}>All clear!</div>
          <div style={{ color: 'var(--text2)', fontSize: '13px', marginTop: '8px' }}>No pending escalations</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {escalated.map((conv) => (
            <div key={conv.id} style={{
              background: 'var(--bg2)', border: '1px solid rgba(255,79,111,0.3)',
              borderRadius: '12px', padding: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--text)' }}>
                    {conv.id.slice(0, 20)}...
                  </span>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                    background: conv.channel === 'whatsapp' ? 'rgba(79,255,176,0.15)' : 'rgba(124,111,255,0.15)',
                    color: conv.channel === 'whatsapp' ? 'var(--green)' : 'var(--accent)',
                    textTransform: 'capitalize',
                  }}>
                    {conv.channel}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {new Date(conv.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href={`/conversations/${conv.id}`} style={{ textDecoration: 'none' }}>
                  <button style={{
                    padding: '8px 16px', borderRadius: '6px',
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text2)', fontSize: '12px', cursor: 'pointer',
                    fontFamily: 'Syne, sans-serif',
                  }}>
                    View Chat
                  </button>
                </Link>
                <button onClick={() => resolve(conv.id)} style={{
                  padding: '8px 16px', borderRadius: '6px',
                  border: '1px solid var(--green)', background: 'rgba(79,255,176,0.1)',
                  color: 'var(--green)', fontSize: '12px', cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif',
                }}>
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
