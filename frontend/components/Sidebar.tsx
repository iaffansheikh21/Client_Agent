'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Overview', icon: '▦' },
  { href: '/conversations', label: 'Conversations', icon: '◈' },
  { href: '/escalations', label: 'Escalations', icon: '⚡' },
  { href: '/clients', label: 'Clients', icon: '◉' },
  { href: '/settings', label: 'Settings', icon: '◎' },
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
      <div style={{ padding: '0 24px 32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', letterSpacing: '3px', color: 'var(--text2)', marginBottom: '6px' }}>
          AI AGENT
        </div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
          Dashboard
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {links.map(({ href, label, icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href));
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                background: active ? 'rgba(124,111,255,0.15)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text2)',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
                cursor: 'pointer',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
                <span style={{ fontSize: '16px' }}>{icon}</span>
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Status indicator */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--green)',
            boxShadow: '0 0 8px var(--green)',
          }} />
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Agent Online</span>
        </div>
      </div>
    </aside>
  );
}
