'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getClients().then(setClients).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>CLIENTS</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px' }}>All Clients</h1>
      </div>

      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 160px 160px 160px',
          padding: '12px 20px', borderBottom: '1px solid var(--border)',
          fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)',
        }}>
          <span>NAME</span>
          <span>PHONE</span>
          <span>SLACK</span>
          <span>JOINED</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>Loading...</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text2)' }}>No clients yet</div>
        ) : clients.map((client, i) => (
          <div key={client.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 160px 160px 160px',
            padding: '14px 20px',
            borderBottom: i < clients.length - 1 ? '1px solid var(--border)' : 'none',
            alignItems: 'center',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{client.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
                {client.id.slice(0, 12)}...
              </div>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
              {client.phone || '—'}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
              {client.slack_user_id || '—'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text2)', fontFamily: 'JetBrains Mono, monospace' }}>
              {new Date(client.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
