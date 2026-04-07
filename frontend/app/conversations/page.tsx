'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const statusColor: Record<string, string> = {
  active: 'var(--green)',
  escalated: 'var(--red)',
  resolved: 'var(--blue)',
};

const channelColor: Record<string, string> = {
  whatsapp: 'var(--green)',
  slack: 'var(--accent)',
  email: 'var(--amber)',
  api: 'var(--text2)',
};

export default function ConversationsPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  const [conversations, setConversations] = useState<any[]>([]);
  const [filter, setFilter] = useState(statusFilter);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getConversations(filter || undefined)
      .then(setConversations)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>CONVERSATIONS</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>All Conversations</h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['', 'active', 'escalated', 'resolved'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '8px 16px', borderRadius: '6px', border: '1px solid',
            borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
            background: filter === s ? 'rgba(124,111,255,0.15)' : 'transparent',
            color: filter === s ? 'var(--accent)' : 'var(--text2)',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 120px 120px 160px 100px',
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)',
        }}>
          <span>CONVERSATION ID</span>
          <span>CHANNEL</span>
          <span>STATUS</span>
          <span>CREATED</span>
          <span>ACTION</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>Loading...</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>No conversations found</div>
        ) : conversations.map((conv, i) => (
          <div key={conv.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 120px 160px 100px',
            padding: '14px 20px', borderBottom: i < conversations.length - 1 ? '1px solid var(--border)' : 'none',
            alignItems: 'center', transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--text)' }}>
              {conv.id.slice(0, 16)}...
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: channelColor[conv.channel] || 'var(--text2)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text2)', textTransform: 'capitalize' }}>{conv.channel}</span>
            </span>
            <span>
              <span style={{
                fontSize: '11px', padding: '3px 10px', borderRadius: '4px',
                background: `${statusColor[conv.status]}22`,
                color: statusColor[conv.status] || 'var(--text2)',
              }}>
                {conv.status}
              </span>
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
              {new Date(conv.created_at).toLocaleDateString()}
            </span>
            <Link href={`/conversations/${conv.id}`} style={{ textDecoration: 'none' }}>
              <span style={{
                fontSize: '12px', color: 'var(--accent)', cursor: 'pointer',
                padding: '4px 12px', border: '1px solid var(--accent)',
                borderRadius: '4px', transition: 'all 0.15s',
              }}>
                View →
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
