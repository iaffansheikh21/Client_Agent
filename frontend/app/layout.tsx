import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'AI Agent Dashboard',
  description: 'Client communication management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, marginLeft: '240px', padding: '32px', maxWidth: 'calc(100vw - 240px)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
