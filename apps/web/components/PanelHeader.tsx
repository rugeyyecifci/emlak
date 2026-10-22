'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { panelApi } from '@/lib/panel-api';

export default function PanelHeader() {
  const path = usePathname();
  const router = useRouter();
  const [newLeads, setNewLeads] = useState(0);
  const onLogin = path.startsWith('/panel/giris');

  // Yeni talep sayısını 30 sn'de bir kontrol et
  useEffect(() => {
    if (onLogin) return;
    const check = () =>
      panelApi<Record<string, number>>('/admin/leads/sayilar')
        .then((c) => setNewLeads(c.yeni ?? 0))
        .catch(() => {});
    check();
    const t = setInterval(check, 30000);
    window.addEventListener('talepler-degisti', check);
    return () => {
      clearInterval(t);
      window.removeEventListener('talepler-degisti', check);
    };
  }, [onLogin]);

  if (onLogin) return null;

  async function logout() {
    await panelApi('/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace('/panel/giris');
    router.refresh();
  }

  const link = (href: string) =>
    `hover:text-slate-900 ${path === href ? 'font-semibold text-slate-900' : 'text-slate-600'}`;

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3 text-sm">
        <div className="flex items-center gap-5">
          <Link href="/panel" className={link('/panel')}>İlanlarım</Link>
          <Link href="/panel/talepler" className={`${link('/panel/talepler')} flex items-center gap-1.5`}>
            Talepler
            {newLeads > 0 && (
              <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">{newLeads}</span>
            )}
          </Link>
          <Link href="/panel/ilan/yeni" className={link('/panel/ilan/yeni')}>+ Yeni ilan</Link>
          <Link href="/" target="_blank" className="text-slate-600 hover:text-slate-900">Siteyi gör ↗</Link>
        </div>
        <button onClick={logout} className="text-slate-500 hover:text-red-600">Çıkış</button>
      </div>
    </div>
  );
}
