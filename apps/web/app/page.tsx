import Link from 'next/link';
import { formatPrice, getListings, typeLabel, type Listing } from '@/lib/api';

export default async function Home() {
  let listings: Listing[] = [];
  let error = '';
  try {
    listings = await getListings();
  } catch {
    error = "API'ye ulaşılamadı. apps/api klasöründe 'pnpm dev' çalışıyor mu?";
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">İlanlar</h1>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {!error && listings.length === 0 && (
        <p className="text-gray-500">Henüz ilan yok. README'deki curl komutuyla bir ilan ekle.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <Link
            key={l.id}
            href={`/ilan/${l.id}`}
            className="rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <span className="text-xs font-semibold uppercase text-teal-700">{typeLabel(l.type)}</span>
            <h2 className="mt-1 font-semibold">{l.title}</h2>
            <p className="text-sm text-gray-600">
              {[l.rooms, l.areaM2 && `${l.areaM2} m²`, l.district].filter(Boolean).join(' · ')}
            </p>
            <p className="mt-2 text-lg font-bold">{formatPrice(l.price)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
