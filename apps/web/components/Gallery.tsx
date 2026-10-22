'use client';

import { useState } from 'react';

// İlan detayında büyük fotoğraf + altta küçük resimler.
export default function Gallery({ photos, title }: { photos: { large: string; thumb: string }[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!photos.length) {
    return <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-gray-100 text-gray-400">Fotoğraf yok</div>;
  }
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[active].large} alt={title} className="aspect-[16/10] w-full rounded-xl bg-gray-100 object-cover" />
      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {photos.map((p, i) => (
            <button
              key={p.thumb}
              onClick={() => setActive(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${i === active ? 'border-teal-600' : 'border-transparent'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
