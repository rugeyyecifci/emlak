'use client';

import Link from 'next/link';
import { useState } from 'react';

type Props = {
  listingId?: number;
  kind?: 'gosterim' | 'bilgi' | 'iletisim';
  title?: string;
};

const TIMES = ['Fark etmez', 'Hafta içi gündüz', 'Hafta içi akşam', 'Hafta sonu'];

// Ziyaretçinin doldurduğu talep formu. İlan sayfasında ve İletişim'de kullanılır.
export default function LeadForm({ listingId, kind = 'gosterim', title = 'Gösterim iste' }: Props) {
  const [f, setF] = useState({ name: '', phone: '', email: '', preferredTime: TIMES[0], message: '', kvkk: false, website: '' });
  const [state, setState] = useState<'bos' | 'gonderiliyor' | 'tamam'>('bos');
  const [error, setError] = useState('');

  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!f.kvkk) return setError('Devam etmek için aydınlatma metnini onaylayın');
    setState('gonderiliyor');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, listingId, kind }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(Array.isArray(data?.message) ? data.message.join(', ') : data?.message || 'Gönderilemedi');
      setState('tamam');
    } catch (err) {
      setError((err as Error).message);
      setState('bos');
    }
  }

  if (state === 'tamam') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
        <p className="text-lg font-semibold">Talebiniz bize ulaştı ✓</p>
        <p className="mt-1 text-sm">En kısa sürede sizi arayacağız. Teşekkür ederiz.</p>
      </div>
    );
  }

  const input = 'mt-1 w-full rounded-lg border bg-white px-3 py-2';

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-semibold">{title}</h2>

      {/* Bot tuzağı: insanlar görmez */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={f.website}
        onChange={(e) => set('website', e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Adınız *</label>
          <input className={input} required autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Telefon *</label>
          <input
            className={input}
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="05xx xxx xx xx"
            value={f.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">E-posta</label>
          <input className={input} type="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Size uygun zaman</label>
          <select className={input} value={f.preferredTime} onChange={(e) => set('preferredTime', e.target.value)}>
            {TIMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Mesajınız</label>
        <textarea className={`${input} min-h-24`} value={f.message} onChange={(e) => set('message', e.target.value)} />
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input type="checkbox" className="mt-1" checked={f.kvkk} onChange={(e) => set('kvkk', e.target.checked)} />
        <span>
          <Link href="/kvkk" target="_blank" className="text-teal-700 underline">Aydınlatma metnini</Link> okudum, bilgilerimin
          talebimle ilgili olarak benimle iletişime geçilmesi için işlenmesini kabul ediyorum.
        </span>
      </label>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button disabled={state === 'gonderiliyor'} className="w-full rounded-lg bg-teal-700 py-3 font-semibold text-white disabled:opacity-60">
        {state === 'gonderiliyor' ? 'Gönderiliyor…' : 'Gönder'}
      </button>
    </form>
  );
}
