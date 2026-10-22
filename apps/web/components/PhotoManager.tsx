'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { mediaUrl, type Media } from '@/lib/api';
import { panelApi } from '@/lib/panel-api';

// İlan fotoğrafları: yükle, işlenmesini bekle, kapak yap, sil.
export default function PhotoManager({ listingId }: { listingId: number }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const l = await panelApi<{ media: Media[] }>(`/admin/listings/${listingId}`);
    setMedia(l.media);
  }, [listingId]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  // image-worker işlerken 2 saniyede bir kontrol et
  const processing = media.some((m) => m.status === 'isleniyor');
  useEffect(() => {
    if (!processing) return;
    const t = setInterval(() => load().catch(() => {}), 2000);
    return () => clearInterval(t);
  }, [processing, load]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('photos', f));
      await panelApi(`/admin/listings/${listingId}/media`, { method: 'POST', body: fd });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function remove(id: number) {
    await panelApi(`/admin/media/${id}`, { method: 'DELETE' });
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  async function makeCover(id: number) {
    await panelApi(`/admin/media/${id}/kapak`, { method: 'POST' });
    await load();
  }

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Fotoğraflar</h2>
          <p className="text-sm text-gray-500">İlk fotoğraf kapak olur. Birden fazla seçebilirsin.</p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {uploading ? 'Yükleniyor…' : '+ Fotoğraf ekle'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div
        className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
      >
        {media.map((m, i) => (
          <div key={m.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
            {m.status === 'hazir' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(m.thumbKey)!} alt="" className="h-full w-full object-cover" />
            )}
            {m.status === 'isleniyor' && (
              <div className="flex h-full items-center justify-center text-xs text-gray-500">İşleniyor…</div>
            )}
            {m.status === 'hata' && (
              <div className="flex h-full items-center justify-center text-xs text-red-600">İşlenemedi</div>
            )}
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-semibold text-white">KAPAK</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1.5 opacity-0 transition group-hover:opacity-100">
              {i !== 0 ? (
                <button type="button" onClick={() => makeCover(m.id)} className="text-xs text-white">Kapak yap</button>
              ) : <span />}
              <button type="button" onClick={() => remove(m.id)} className="text-xs text-red-200">Sil</button>
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <div className="col-span-full rounded-lg border-2 border-dashed p-8 text-center text-sm text-gray-400">
            Fotoğrafları buraya sürükle ya da “Fotoğraf ekle”ye bas
          </div>
        )}
      </div>
    </div>
  );
}
