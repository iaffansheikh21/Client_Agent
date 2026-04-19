import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'ClientFlow AI',
  description: 'Client support, on autopilot.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%237c6fff'/><stop offset='100%25' stop-color='%23ff6f91'/></linearGradient></defs><rect width='100' height='100' rx='22' fill='url(%23g)'/><rect x='18' y='22' width='38' height='12' rx='6' fill='white'/><rect x='18' y='66' width='38' height='12' rx='6' fill='white'/><rect x='18' y='22' width='12' height='56' rx='6' fill='white'/><rect x='52' y='44' width='30' height='12' rx='6' fill='white' opacity='.85'/><circle cx='76' cy='28' r='7' fill='white' opacity='.7'/><circle cx='76' cy='72' r='7' fill='white' opacity='.7'/></svg>",
  },
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
