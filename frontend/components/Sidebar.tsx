'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview', icon: '▦' },
  { href: '/conversations', label: 'Conversations', icon: '◈' },
  { href: '/tasks', label: 'Trello Tasks', icon: '◫' },
  { href: '/clients', label: 'Clients', icon: '◉' },
  { href: '/test-agent', label: 'Test Agent', icon: '◎' },
  { href: '/settings', label: 'Settings', icon: '⊙' },
  { href: '/analytics', label: 'Analytics', icon: '◬' },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside style={{
      width: '240px',
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
    }}>
      {/* Logo */}
      {/* Logo */}
<div style={{ padding: '0 24px 32px', borderBottom: '1px solid var(--border)' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    
    {/* CF Mark — Squircle with geometric flow */}
    <div style={{
      width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
      background: 'linear-gradient(135deg, #7c6fff 0%, #ff6f91 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* C shape */}
        <rect x="3" y="4" width="13" height="4" rx="2" fill="white" opacity="0.95"/>
        <rect x="3" y="20" width="13" height="4" rx="2" fill="white" opacity="0.95"/>
        <rect x="3" y="4" width="4" height="20" rx="2" fill="white" opacity="0.95"/>
        {/* Flow arrow */}
        <rect x="14" y="12" width="11" height="4" rx="2" fill="white" opacity="0.85"/>
        {/* Dots */}
        <circle cx="23" cy="6" r="2.5" fill="white" opacity="0.65"/>
        <circle cx="23" cy="22" r="2.5" fill="white" opacity="0.65"/>
      </svg>
    </div>

    {/* Wordmark */}
    <div>
      <div style={{
        fontSize: '15px', fontWeight: 800, letterSpacing: '-0.5px',
        lineHeight: 1.2, color: 'var(--text)',
      }}>
        ClientFlow{' '}
        <span style={{
          background: 'linear-gradient(135deg, #7c6fff, #ff6f91)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          AI
        </span>
      </div>
      <div style={{
        fontSize: '9px', color: 'var(--text2)',
        letterSpacing: '0.8px', marginTop: '3px',
        textTransform: 'uppercase',
      }}>
        Client support, on autopilot.
      </div>
    </div>
  </div>
</div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {links.map(({ href, label, icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href));
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                background: active ? 'rgba(124,111,255,0.15)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text2)',
                fontSize: '14px', fontWeight: active ? 600 : 400,
                transition: 'all 0.15s', cursor: 'pointer',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
                <span style={{ fontSize: '16px' }}>{icon}</span>
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--green)', boxShadow: '0 0 8px var(--green)',
          }} />
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Agent Online</span>
        </div>
      </div>
    </aside>
  );
}
