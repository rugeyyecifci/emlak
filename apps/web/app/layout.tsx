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
            <nav className="flex gap-5 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">İlanlar</Link>
              <Link href="/iletisim" className="hover:text-gray-900">İletişim</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-16 border-t bg-white">
          <div className="mx-auto flex max-w-5xl justify-between p-4 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} Emlak Ofisi</span>
            <Link href="/kvkk" className="hover:text-gray-700">Aydınlatma metni</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
