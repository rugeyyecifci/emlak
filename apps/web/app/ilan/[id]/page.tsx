import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import { formatPrice, getListing, mediaUrl, typeLabel } from '@/lib/api';

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await getListing(id);
  if (!l) notFound();

  const photos = (l.media ?? [])
    .map((m) => ({ large: mediaUrl(m.largeKey), thumb: mediaUrl(m.thumbKey) }))
    .filter((p): p is { large: string; thumb: string } => !!p.large && !!p.thumb);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/" className="text-sm text-teal-700">← Tüm ilanlar</Link>

      <div className="mt-4">
        <Gallery photos={photos} title={l.title} />
      </div>

      <span className="mt-6 block text-xs font-semibold uppercase text-teal-700">{typeLabel(l.type)}</span>
      <h1 className="mt-1 text-3xl font-bold">{l.title}</h1>
      <p className="mt-2 text-2xl font-bold">{formatPrice(l.price)}</p>

      <dl className="mt-6 grid grid-cols-3 gap-4 rounded-xl border bg-white p-4">
        <div><dt className="text-xs text-gray-500">Oda</dt><dd className="font-semibold">{l.rooms ?? '-'}</dd></div>
        <div><dt className="text-xs text-gray-500">Alan</dt><dd className="font-semibold">{l.areaM2 ? `${l.areaM2} m²` : '-'}</dd></div>
        <div><dt className="text-xs text-gray-500">Semt</dt><dd className="font-semibold">{l.district ?? '-'}</dd></div>
      </dl>

      {l.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-gray-700">{l.description}</p>}

      <a
        href="https://wa.me/905000000000"
        className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-3 font-semibold text-white"
      >
        WhatsApp&apos;tan sor
      </a>
    </main>
  );
}
