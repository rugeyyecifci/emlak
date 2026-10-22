import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Emlak Ofisi',
  description: 'Satılık ve kiralık ilanlar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <Link href="/" className="text-xl font-bold text-teal-700">Emlak Ofisi</Link>
            <nav className="text-sm text-gray-600">İlanlar</nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
