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
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold text-teal-800">Emlak Ofisi</Link>
            <nav className="flex items-center gap-5 text-sm text-slate-600">
              <Link href="/ilanlar?tur=satilik" className="hidden hover:text-slate-900 sm:inline">Satılık</Link>
              <Link href="/ilanlar?tur=kiralik" className="hidden hover:text-slate-900 sm:inline">Kiralık</Link>
              <Link href="/ilanlar" className="hover:text-slate-900">Tüm ilanlar</Link>
              <Link href="/iletisim" className="rounded-lg bg-teal-700 px-3 py-1.5 font-semibold text-white hover:bg-teal-800">İletişim</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t bg-white">
          <div className="mx-auto flex max-w-6xl justify-between px-4 py-6 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Emlak Ofisi</span>
            <Link href="/kvkk" className="hover:text-gray-700">Aydınlatma metni</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
