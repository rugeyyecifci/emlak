'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Listing } from '@/lib/api';
import { panelApi } from '@/lib/panel-api';

type FormState = {
  title: string;
  description: string;
  type: 'satilik' | 'kiralik';
  price: string;
  rooms: string;
  areaM2: string;
  district: string;
  status: 'taslak' | 'yayinda' | 'kapandi';
};

const ROOM_OPTIONS = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '5+2', '6+'];

export default function ListingForm({ listing }: { listing?: Listing }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>({
    title: listing?.title ?? '',
    description: listing?.description ?? '',
    type: listing?.type ?? 'satilik',
    price: listing ? String(listing.price) : '',
    rooms: listing?.rooms ?? '',
    areaM2: listing?.areaM2 ? String(listing.areaM2) : '',
    district: listing?.district ?? '',
    status: listing?.status ?? 'taslak',
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((prev) => ({ ...prev, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body = JSON.stringify({ ...f, price: f.price.replace(/\D/g, '') });
      if (listing) {
        await panelApi(`/admin/listings/${listing.id}`, { method: 'PATCH', body });
        setMsg({ ok: true, text: 'Kaydedildi' });
        router.refresh();
      } else {
        const created = await panelApi<Listing>('/admin/listings', { method: 'POST', body });
        // Yeni ilan kaydedilince fotoğraf eklemek için düzenleme sayfasına geç
        router.replace(`/panel/ilan/${created.id}?yeni=1`);
      }
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const input = 'mt-1 w-full rounded-lg border px-3 py-2';
  const pricePreview = Number(f.price.replace(/\D/g, '')) || 0;

  return (
    <form onSubmit={save} className="space-y-5 rounded-2xl border bg-white p-6">
      <div>
        <label className="text-sm font-medium">Başlık *</label>
        <input className={input} required maxLength={120} value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="ör. Merkezde asansörlü 3+1 daire" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Tip *</label>
          <select className={input} value={f.type} onChange={(e) => set('type', e.target.value as FormState['type'])}>
            <option value="satilik">Satılık</option>
            <option value="kiralik">Kiralık</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Fiyat (₺) *</label>
          <input className={input} required inputMode="numeric" value={f.price} onChange={(e) => set('price', e.target.value)} placeholder="4500000" />
          {pricePreview > 0 && <p className="mt-1 text-xs text-gray-500">{pricePreview.toLocaleString('tr-TR')} ₺</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Durum</label>
          <select className={input} value={f.status} onChange={(e) => set('status', e.target.value as FormState['status'])}>
            <option value="taslak">Taslak (sitede görünmez)</option>
            <option value="yayinda">Yayında</option>
            <option value="kapandi">Kapandı (satıldı/kiralandı)</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Oda</label>
          <select className={input} value={f.rooms} onChange={(e) => set('rooms', e.target.value)}>
            <option value="">Seçin</option>
            {ROOM_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Alan (m²)</label>
          <input className={input} inputMode="numeric" value={f.areaM2} onChange={(e) => set('areaM2', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Semt</label>
          <input className={input} value={f.district} onChange={(e) => set('district', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Açıklama</label>
        <textarea className={`${input} min-h-32`} value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Bina yaşı, kat, ısınma, otopark, okula/ulaşıma yakınlık…" />
      </div>

      <div className="flex items-center gap-3">
        <button disabled={busy} className="rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white disabled:opacity-60">
          {busy ? 'Kaydediliyor…' : listing ? 'Kaydet' : 'Kaydet ve fotoğraf ekle →'}
        </button>
        {msg && <span className={`text-sm ${msg.ok ? 'text-green-700' : 'text-red-600'}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
