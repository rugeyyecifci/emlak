'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { panelApi } from '@/lib/panel-api';

export default function PanelHeader() {
  const path = usePathname();
  const router = useRouter();
  if (path.startsWith('/panel/giris')) return null;

  async function logout() {
    await panelApi('/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace('/panel/giris');
    router.refresh();
  }

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 text-sm">
        <div className="flex gap-4">
          <Link href="/panel" className="font-semibold text-slate-800">Panel</Link>
          <Link href="/panel/ilan/yeni" className="text-slate-600 hover:text-slate-900">+ Yeni ilan</Link>
          <Link href="/" target="_blank" className="text-slate-600 hover:text-slate-900">Siteyi gör ↗</Link>
        </div>
        <button onClick={logout} className="text-slate-500 hover:text-red-600">Çıkış</button>
      </div>
    </div>
  );
}
