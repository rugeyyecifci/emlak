import Link from 'next/link';
import { formatPrice, isNew, mediaUrl, typeLabel, type Listing } from '@/lib/api';

export default function ListingCard({ l }: { l: Listing }) {
  const cover = mediaUrl(l.media?.[0]?.thumbKey);
  return (
    <Link
      href={`/ilan/${l.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={l.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">Fotoğraf yok</div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={`rounded-md px-2 py-1 text-xs font-semibold text-white ${l.type === 'kiralik' ? 'bg-indigo-600' : 'bg-teal-700'}`}>
            {typeLabel(l.type)}
          </span>
          {isNew(l.createdAt) && <span className="rounded-md bg-amber-400 px-2 py-1 text-xs font-semibold text-amber-950">Yeni</span>}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xl font-bold text-slate-900">
          {formatPrice(l.price)}
          {l.type === 'kiralik' && <span className="text-sm font-normal text-slate-500"> /ay</span>}
        </p>
        <h3 className="mt-1 line-clamp-1 font-medium text-slate-800">{l.title}</h3>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-sm text-slate-600">
          {l.rooms && <span>🛏 {l.rooms}</span>}
          {l.areaM2 && <span>📐 {l.areaM2} m²</span>}
          {l.district && <span>📍 {l.district}</span>}
        </div>
      </div>
    </Link>
  );
}
