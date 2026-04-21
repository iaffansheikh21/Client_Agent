'use client';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Providers from '@/components/Providers';
import { usePathname } from 'next/navigation';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const noSidebar = path === '/' || path === '/login';

  if (noSidebar) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '240px', padding: '32px', maxWidth: 'calc(100vw - 240px)' }}>
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
