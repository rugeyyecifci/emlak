'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import ListingForm from '@/components/ListingForm';
import PhotoManager from '@/components/PhotoManager';
import type { Listing } from '@/lib/api';
import { panelApi } from '@/lib/panel-api';

function EditListing() {
  const { id } = useParams<{ id: string }>();
  const isNew = useSearchParams().get('yeni') === '1';
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    panelApi<Listing>(`/admin/listings/${id}`).then(setListing).catch((e) => setError(e.message));
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/panel" className="text-sm text-teal-700">← İlanlarım</Link>
        <h1 className="mt-2 text-2xl font-bold">İlanı düzenle</h1>
      </div>

      {isNew && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          İlan taslak olarak kaydedildi. Fotoğrafları ekle, sonra durumu “Yayında” yapıp kaydet.
        </p>
      )}
      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {!listing && !error && <p className="text-gray-500">Yükleniyor…</p>}

      {listing && (
        <>
          <PhotoManager listingId={listing.id} />
          <ListingForm key={listing.id} listing={listing} />
        </>
      )}
    </div>
  );
}

export default function EditListingPage() {
  return (
    <Suspense>
      <EditListing />
    </Suspense>
  );
}
