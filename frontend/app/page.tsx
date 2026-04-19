'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface StatsCard {
  label: string;
  value: number | string;
  color: string;
  href: string;
}

export default function HomePage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getConversations(), api.getClients()])
      .then(([convs, cls]) => {
        setConversations(convs);
        setClients(cls);
      })
      .finally(() => setLoading(false));
  }, []);

  const active = conversations.filter((c) => c.status === 'active').length;
  const escalated = conversations.filter((c) => c.status === 'escalated').length;
  const resolved = conversations.filter((c) => c.status === 'resolved').length;
  const whatsapp = conversations.filter((c) => c.channel === 'whatsapp').length;
  const slack = conversations.filter((c) => c.channel === 'slack').length;

  const stats: StatsCard[] = [
    { label: 'Total Clients', value: clients.length, color: 'var(--accent)', href: '/clients' },
    { label: 'Active Conversations', value: active, color: 'var(--green)', href: '/conversations?status=active' },
    { label: 'Escalations', value: escalated, color: 'var(--red)', href: '/escalations' },
    { label: 'Resolved', value: resolved, color: 'var(--blue)', href: '/conversations?status=resolved' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '8px' }}>
          OVERVIEW
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', color: 'var(--text)' }}>
          ClientFlow AI
        </h1>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {stats.map(({ label, value, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div style={{ fontSize: '36px', fontWeight: 800, color, marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                {loading ? '—' : value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Channel breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '20px' }}>CHANNELS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'WhatsApp', value: whatsapp, color: 'var(--green)' },
              { label: 'Slack', value: slack, color: 'var(--accent)' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{label}</span>
                  <span style={{ fontSize: '13px', color, fontFamily: 'JetBrains Mono, monospace' }}>{loading ? '—' : value}</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg3)', borderRadius: '2px' }}>
                  <div style={{
                    height: '100%',
                    width: conversations.length ? `${(value / conversations.length) * 100}%` : '0%',
                    background: color,
                    borderRadius: '2px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent conversations */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text2)', marginBottom: '20px' }}>RECENT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ color: 'var(--text2)', fontSize: '13px' }}>Loading...</div>
            ) : conversations.slice(0, 5).map((conv) => (
              <Link key={conv.id} href={`/conversations/${conv.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px', borderRadius: '6px',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: conv.channel === 'whatsapp' ? 'var(--green)' : 'var(--accent)',
                    }} />
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}>
                      {conv.id.slice(0, 8)}...
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                    background: conv.status === 'escalated' ? 'rgba(255,79,111,0.15)' :
                      conv.status === 'active' ? 'rgba(79,255,176,0.15)' : 'rgba(79,184,255,0.15)',
                    color: conv.status === 'escalated' ? 'var(--red)' :
                      conv.status === 'active' ? 'var(--green)' : 'var(--blue)',
                  }}>
                    {conv.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
