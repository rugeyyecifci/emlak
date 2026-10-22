import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import LeadForm from '@/components/LeadForm';
import { formatPrice, getListing, mediaUrl, typeLabel } from '@/lib/api';

// WhatsApp numarası: ofisinkiyle değiştir (90 ile başlayan, boşluksuz)
const WHATSAPP = '905000000000';

type Props = { params: Promise<{ id: string }> };

// Google ve WhatsApp paylaşımında görünen başlık, açıklama ve fotoğraf
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await getListing((await params).id).catch(() => null);
  if (!l) return { title: 'İlan bulunamadı' };
  const title = `${l.title} – ${formatPrice(l.price)} | Emlak Ofisi`;
  const description = [typeLabel(l.type), l.rooms, l.areaM2 && `${l.areaM2} m²`, l.district].filter(Boolean).join(' · ');
  const image = mediaUrl(l.media?.[0]?.largeKey);
  return { title, description, openGraph: { title, description, images: image ? [image] : [] } };
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const l = await getListing(id);
  if (!l) notFound();

  const photos = (l.media ?? [])
    .map((m) => ({ large: mediaUrl(m.largeKey), thumb: mediaUrl(m.thumbKey) }))
    .filter((p): p is { large: string; thumb: string } => !!p.large && !!p.thumb);

  const waText = encodeURIComponent(`Merhaba, "${l.title}" (ilan no: ${l.id}) hakkında bilgi almak istiyorum.`);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <Link href="/ilanlar" className="text-sm text-teal-700">← Tüm ilanlar</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <Gallery photos={photos} title={l.title} />

          <span className="mt-6 block text-xs font-semibold uppercase text-teal-700">{typeLabel(l.type)}</span>
          <h1 className="mt-1 text-3xl font-bold">{l.title}</h1>
          <p className="mt-2 text-2xl font-bold">{formatPrice(l.price)}</p>

          <dl className="mt-6 grid grid-cols-3 gap-4 rounded-xl border bg-white p-4">
            <div><dt className="text-xs text-gray-500">Oda</dt><dd className="font-semibold">{l.rooms ?? '-'}</dd></div>
            <div><dt className="text-xs text-gray-500">Alan</dt><dd className="font-semibold">{l.areaM2 ? `${l.areaM2} m²` : '-'}</dd></div>
            <div><dt className="text-xs text-gray-500">Semt</dt><dd className="font-semibold">{l.district ?? '-'}</dd></div>
          </dl>

          {l.description && <p className="mt-6 whitespace-pre-line leading-relaxed text-gray-700">{l.description}</p>}
          <p className="mt-6 text-xs text-gray-400">İlan no: {l.id}</p>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <LeadForm listingId={l.id} />
          <a
            href={`https://wa.me/${WHATSAPP}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg bg-green-600 py-3 text-center font-semibold text-white"
          >
            WhatsApp&apos;tan sor
          </a>
        </aside>
      </div>
    </main>
  );
}
