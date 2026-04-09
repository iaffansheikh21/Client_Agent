'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const statusColor: Record<string, string> = {
  active: 'var(--green)',
  escalated: 'var(--red)',
  resolved: 'var(--blue)',
};

const channelColor: Record<string, string> = {
  whatsapp: '#25D366',
  slack: 'var(--accent)',
  email: 'var(--amber)',
  api: 'var(--text2)',
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [clients, setClients] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getConversations(), api.getClients()])
      .then(([convs, clientList]) => {
        setConversations(convs);
        const map: Record<string, any> = {};
        clientList.forEach((c: any) => { map[c.id] = c; });
        setClients(map);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>CONVERSATIONS</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>All Conversations</h1>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 120px 120px 160px 100px',
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)',
        }}>
          <span>CLIENT</span>
          <span>CHANNEL</span>
          <span>STATUS</span>
          <span>DATE</span>
          <span>ACTION</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>Loading...</div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>No conversations found</div>
        ) : conversations.map((conv, i) => {
          const client = clients[conv.client_id];
          const clientName = client?.name || client?.phone || client?.slack_user_id || 'Unknown';
          return (
            <div key={conv.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px 160px 100px',
              padding: '14px 20px',
              borderBottom: i < conversations.length - 1 ? '1px solid var(--border)' : 'none',
              alignItems: 'center',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{clientName}</div>
                <div style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {conv.id.slice(0, 12)}...
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: channelColor[conv.channel] || 'var(--text2)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text2)', textTransform: 'capitalize' }}>{conv.channel}</span>
              </div>

              <span style={{
                fontSize: '11px', padding: '3px 10px', borderRadius: '4px', width: 'fit-content',
                background: `${statusColor[conv.status] || 'var(--text2)'}22`,
                color: statusColor[conv.status] || 'var(--text2)',
              }}>{conv.status}</span>

              <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
                {new Date(conv.created_at).toLocaleDateString()}
              </span>

              <Link href={`/conversations/${conv.id}`} style={{ textDecoration: 'none' }}>
                <span style={{
                  fontSize: '12px', color: 'var(--accent)', cursor: 'pointer',
                  padding: '4px 12px', border: '1px solid var(--accent)', borderRadius: '4px',
                }}>View →</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
