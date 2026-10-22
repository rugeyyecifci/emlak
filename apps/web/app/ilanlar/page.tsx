import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import ListingCard from '@/components/ListingCard';
import SortSelect from '@/components/SortSelect';
import { getSummary, ROOM_OPTIONS, searchListings, toQuery, type ListingPage, type SearchParams } from '@/lib/api';

type Props = { searchParams: Promise<SearchParams> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
const many = (v: string | string[] | undefined) => ([] as string[]).concat(v ?? []).flatMap((x) => x.split(',')).filter(Boolean);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams;
  const tur = one(p.tur);
  const semt = one(p.semt);
  const what = tur === 'kiralik' ? 'Kiralık' : tur === 'satilik' ? 'Satılık' : 'Satılık ve kiralık';
  return { title: `${semt ? semt + ' ' : ''}${what} ilanlar | Emlak Ofisi` };
}

export default async function ListingsPage({ searchParams }: Props) {
  const p = await searchParams;
  const tur = one(p.tur);
  const semt = one(p.semt);
  const rooms = many(p.oda);

  const [summary, data] = await Promise.all([getSummary(), searchListings(p).catch((): ListingPage | null => null)]);
  const error = data ? '' : 'İlanlar alınamadı. API çalışıyor mu?';

  const hasFilter = !!(tur || semt || rooms.length || one(p.min) || one(p.max) || one(p.q));
  const pageLink = (n: number) => {
    const qs = toQuery(p);
    qs.set('sayfa', String(n));
    return `/ilanlar?${qs}`;
  };

  const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
  const label = 'text-xs font-semibold uppercase tracking-wide text-slate-500';

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">
        {tur === 'kiralik' ? 'Kiralık' : tur === 'satilik' ? 'Satılık' : 'Tüm'} ilanlar
        {semt && <span className="text-slate-500"> · {semt}</span>}
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* ---------- FİLTRELER ---------- */}
        <aside>
          <form action="/ilanlar" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-6">
            <div>
              <span className={label}>Kelime</span>
              <input name="q" defaultValue={one(p.q)} placeholder="ör. asansör, bahçe" className={field} />
            </div>

            <div>
              <span className={label}>Tür</span>
              <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 text-sm">
                {[{ v: '', l: 'Tümü' }, { v: 'satilik', l: 'Satılık' }, { v: 'kiralik', l: 'Kiralık' }].map((o) => (
                  <label key={o.v} className="cursor-pointer rounded-md py-1.5 text-center text-slate-600 has-checked:bg-white has-checked:font-semibold has-checked:text-slate-900 has-checked:shadow-sm">
                    <input type="radio" name="tur" value={o.v} defaultChecked={tur === o.v} className="sr-only" />
                    {o.l}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className={label}>Semt</span>
              <select name="semt" defaultValue={semt} className={field}>
                <option value="">Tüm semtler</option>
                {summary.districts.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <span className={label}>Fiyat (₺)</span>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <input name="min" inputMode="numeric" defaultValue={one(p.min)} placeholder="En az" className={`${field} mt-0`} />
                <input name="max" inputMode="numeric" defaultValue={one(p.max)} placeholder="En çok" className={`${field} mt-0`} />
              </div>
            </div>

            <div>
              <span className={label}>Oda</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {ROOM_OPTIONS.map((r) => (
                  <label key={r} className="cursor-pointer rounded-md border border-slate-300 px-2.5 py-1 text-sm text-slate-700 has-checked:border-teal-700 has-checked:bg-teal-700 has-checked:text-white">
                    <input type="checkbox" name="oda" value={r} defaultChecked={rooms.includes(r)} className="sr-only" />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            {one(p.siralama) && <input type="hidden" name="siralama" value={one(p.siralama)} />}

            <button className="w-full rounded-lg bg-teal-700 py-2.5 font-semibold text-white hover:bg-teal-800">Filtrele</button>
            {hasFilter && (
              <Link href="/ilanlar" className="block text-center text-sm text-slate-500 hover:text-slate-800">Filtreleri temizle</Link>
            )}
          </form>
        </aside>

        {/* ---------- SONUÇLAR ---------- */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              {data ? <><strong className="text-slate-900">{data.total}</strong> ilan bulundu</> : ' '}
            </p>
            <Suspense>
              <SortSelect />
            </Suspense>
          </div>

          {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}

          {data?.items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-slate-800">Bu kriterlere uyan ilan yok</p>
              <p className="mt-1 text-slate-500">Filtreleri genişletmeyi deneyin ya da aradığınızı bize söyleyin, uygun ilan çıkınca arayalım.</p>
              <Link href="/iletisim" className="mt-4 inline-block rounded-lg bg-teal-700 px-5 py-2.5 font-semibold text-white">
                Aradığımı anlatayım
              </Link>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {data?.items.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>

          {data && data.pageCount > 1 && (
            <nav className="mt-10 flex justify-center gap-1.5" aria-label="Sayfalar">
              {Array.from({ length: data.pageCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={pageLink(n)}
                  className={`min-w-10 rounded-lg px-3 py-2 text-center text-sm ${n === data.page ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
