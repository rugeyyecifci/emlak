import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import { getSummary, ROOM_OPTIONS, searchListings, type ListingPage, type Summary } from '@/lib/api';

export default async function Home() {
  let latest: ListingPage | null = null;
  let summary: Summary = { districts: [], counts: { satilik: 0, kiralik: 0 } };
  let error = '';
  try {
    [latest, summary] = await Promise.all([searchListings({ siralama: 'yeni' }), getSummary()]);
  } catch {
    error = "API'ye ulaşılamadı. apps/api klasöründe 'pnpm dev' çalışıyor mu?";
  }

  const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-slate-800';

  return (
    <main>
      {/* ---------- HERO + ARAMA ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-200">Emlak Ofisi</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Aradığınız evi birlikte bulalım.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-teal-100">
            Güncel satılık ve kiralık ilanlar, gerçek fotoğraflar ve aynı gün dönüş.
          </p>

          <form action="/ilanlar" className="mt-10 rounded-2xl bg-white/10 p-3 shadow-2xl ring-1 ring-white/20 backdrop-blur">
            <div className="mb-3 inline-flex rounded-lg bg-white/10 p-1 text-sm">
              {[
                { v: '', l: 'Tümü' },
                { v: 'satilik', l: 'Satılık' },
                { v: 'kiralik', l: 'Kiralık' },
              ].map((o) => (
                <label
                  key={o.v}
                  className="cursor-pointer rounded-md px-4 py-1.5 text-teal-50 has-checked:bg-white has-checked:font-semibold has-checked:text-teal-900"
                >
                  <input type="radio" name="tur" value={o.v} defaultChecked={o.v === ''} className="sr-only" />
                  {o.l}
                </label>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <select name="semt" className={field} defaultValue="">
                <option value="">Tüm semtler</option>
                {summary.districts.map((d) => <option key={d}>{d}</option>)}
              </select>
              <select name="oda" className={field} defaultValue="">
                <option value="">Oda sayısı</option>
                {ROOM_OPTIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
              <input name="max" inputMode="numeric" placeholder="En fazla fiyat (₺)" className={field} />
              <button className="rounded-lg bg-amber-400 px-8 py-3 font-semibold text-amber-950 transition hover:bg-amber-300">
                Ara
              </button>
            </div>
          </form>

          <div className="mt-6 flex gap-6 text-sm text-teal-100">
            <Link href="/ilanlar?tur=satilik" className="hover:text-white">
              <strong className="text-white">{summary.counts.satilik}</strong> satılık ilan →
            </Link>
            <Link href="/ilanlar?tur=kiralik" className="hover:text-white">
              <strong className="text-white">{summary.counts.kiralik}</strong> kiralık ilan →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- SON İLANLAR ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Son eklenen ilanlar</h2>
            <p className="text-slate-500">Portföyümüze yeni katılanlar</p>
          </div>
          <Link href="/ilanlar" className="text-sm font-semibold text-teal-700 hover:text-teal-900">Tüm ilanlar →</Link>
        </div>

        {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
        {latest && latest.items.length === 0 && <p className="text-slate-500">Şu an yayında ilan yok.</p>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest?.items.slice(0, 6).map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
      </section>

      {/* ---------- NEDEN BİZ ---------- */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:grid-cols-3">
          {[
            { icon: '📸', t: 'Gerçek fotoğraflar', d: 'Her ilanı yerinde görüp kendimiz fotoğraflıyoruz. Gördüğünüz ev, gezeceğiniz ev.' },
            { icon: '⚡', t: 'Aynı gün dönüş', d: 'Bıraktığınız her talebe gün içinde dönüyor, gösterimi size uygun saate ayarlıyoruz.' },
            { icon: '🤝', t: 'Baştan sona yanınızda', d: 'Fiyat değerlendirmesinden tapu gününe kadar sürecin her adımında destek oluyoruz.' },
          ].map((f) => (
            <div key={f.t}>
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{f.t}</h3>
              <p className="mt-1 text-slate-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- MÜLK SAHİBİ CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-slate-900 p-8 text-white sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="text-2xl font-bold">Mülkünüzü satmak ya da kiralamak mı istiyorsunuz?</h2>
            <p className="mt-2 text-slate-300">Ücretsiz değer tespiti için bize ulaşın, aynı gün sizi arayalım.</p>
          </div>
          <Link href="/iletisim" className="shrink-0 rounded-lg bg-amber-400 px-6 py-3 font-semibold text-amber-950 hover:bg-amber-300">
            Bize ulaşın
          </Link>
        </div>
      </section>
    </main>
  );
}
