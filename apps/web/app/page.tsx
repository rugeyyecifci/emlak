import Link from 'next/link';
import { formatPrice, getListings, mediaUrl, typeLabel, type Listing } from '@/lib/api';

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
      {!error && listings.length === 0 && <p className="text-gray-500">Şu an yayında ilan yok.</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => {
          const cover = mediaUrl(l.media?.[0]?.thumbKey);
          return (
            <Link
              key={l.id}
              href={`/ilan/${l.id}`}
              className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-[4/3] bg-gray-100">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={l.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">Fotoğraf yok</div>
                )}
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold uppercase text-teal-700">{typeLabel(l.type)}</span>
                <h2 className="mt-1 font-semibold">{l.title}</h2>
                <p className="text-sm text-gray-600">
                  {[l.rooms, l.areaM2 && `${l.areaM2} m²`, l.district].filter(Boolean).join(' · ')}
                </p>
                <p className="mt-2 text-lg font-bold">{formatPrice(l.price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
