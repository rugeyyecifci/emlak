'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatPrice, mediaUrl, statusLabel, typeLabel, type Listing } from '@/lib/api';
import { panelApi } from '@/lib/panel-api';

const statusColor: Record<string, string> = {
  yayinda: 'bg-green-100 text-green-800',
  taslak: 'bg-amber-100 text-amber-800',
  kapandi: 'bg-gray-200 text-gray-700',
};

export default function PanelHome() {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    panelApi<Listing[]>('/admin/listings').then(setListings).catch((e) => setError(e.message));
  }, []);

  async function remove(l: Listing) {
    if (!window.confirm(`"${l.title}" silinsin mi? Fotoğrafları da silinir.`)) return;
    await panelApi(`/admin/listings/${l.id}`, { method: 'DELETE' });
    setListings((prev) => prev?.filter((x) => x.id !== l.id) ?? null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">İlanlarım</h1>
        <Link href="/panel/ilan/yeni" className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
          + Yeni ilan
        </Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {!listings && !error && <p className="text-gray-500">Yükleniyor…</p>}
      {listings?.length === 0 && <p className="text-gray-500">Henüz ilan yok. “Yeni ilan” ile başla.</p>}

      <div className="space-y-3">
        {listings?.map((l) => {
          const cover = mediaUrl(l.media?.[0]?.thumbKey);
          return (
            <div key={l.id} className="flex items-center gap-4 rounded-xl border bg-white p-3">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[l.status ?? 'taslak']}`}>
                    {statusLabel[l.status ?? 'taslak']}
                  </span>
                  <span className="text-xs text-gray-500">{typeLabel(l.type)}</span>
                  <span className="text-xs text-gray-400">· {l._count?.media ?? 0} fotoğraf</span>
                </div>
                <p className="mt-1 truncate font-semibold">{l.title}</p>
                <p className="text-sm text-gray-600">{formatPrice(l.price)}</p>
              </div>
              <Link href={`/panel/ilan/${l.id}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
                Düzenle
              </Link>
              <button onClick={() => remove(l)} className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                Sil
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
