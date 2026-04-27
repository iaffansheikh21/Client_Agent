'use client';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #7c6fff 0%, #ff6f91 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="4" width="13" height="4" rx="2" fill="white" opacity="0.95"/>
            <rect x="3" y="20" width="13" height="4" rx="2" fill="white" opacity="0.95"/>
            <rect x="3" y="4" width="4" height="20" rx="2" fill="white" opacity="0.95"/>
            <rect x="14" y="12" width="11" height="4" rx="2" fill="white" opacity="0.85"/>
            <circle cx="23" cy="6" r="2.5" fill="white" opacity="0.65"/>
            <circle cx="23" cy="22" r="2.5" fill="white" opacity="0.65"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            ClientFlow <span style={{ background: 'linear-gradient(135deg, #7c6fff, #ff6f91)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
          </div>
          <div style={{ fontSize: '11px', color: '#666', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>
            Client support, on autopilot.
          </div>
        </div>
      </div>

      {/* Hero */}
      <h1 style={{
        fontSize: '52px', fontWeight: 900, color: '#fff',
        textAlign: 'center', letterSpacing: '-2px', lineHeight: 1.1,
        marginBottom: '20px', maxWidth: '600px',
      }}>
        AI-Powered<br />
        <span style={{ background: 'linear-gradient(135deg, #7c6fff, #ff6f91)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Client Support
        </span>
      </h1>

      <p style={{ fontSize: '17px', color: '#888', textAlign: 'center', maxWidth: '440px', lineHeight: 1.6, marginBottom: '48px' }}>
        Automate client conversations across WhatsApp & Slack. Create tasks, send notifications, and never miss a follow-up.
      </p>

      {/* Features */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['WhatsApp & Slack', 'Trello Integration', 'Email Notifications', 'AI Agent'].map((f) => (
          <div key={f} style={{
            padding: '6px 14px', borderRadius: '20px',
            border: '1px solid #2a2a3e', color: '#aaa', fontSize: '13px',
            background: '#1a1a2e',
          }}>
            {f}
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link href="/login" style={{ textDecoration: 'none' }}>
        <button style={{
          padding: '14px 40px',
          background: 'linear-gradient(135deg, #7c6fff, #ff6f91)',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontSize: '16px', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(124,111,255,0.3)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(124,111,255,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(124,111,255,0.3)'; }}
        >
          Sign In to Dashboard →
        </button>
      </Link>
    </div>
  );
}
