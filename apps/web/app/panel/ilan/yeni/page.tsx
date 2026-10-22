import Link from 'next/link';
import ListingForm from '@/components/ListingForm';

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/panel" className="text-sm text-teal-700">← İlanlarım</Link>
        <h1 className="mt-2 text-2xl font-bold">Yeni ilan</h1>
      </div>
      <ListingForm />
    </div>
  );
}
