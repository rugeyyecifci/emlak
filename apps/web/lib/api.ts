export type Listing = {
  id: number;
  title: string;
  type: 'satilik' | 'kiralik';
  price: number;
  rooms?: string | null;
  areaM2?: number | null;
  district?: string | null;
};

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export async function getListings(): Promise<Listing[]> {
  const res = await fetch(`${API_URL}/listings`, { cache: 'no-store' });
  if (!res.ok) throw new Error('İlanlar alınamadı');
  return res.json();
}

export async function getListing(id: string): Promise<Listing | null> {
  const res = await fetch(`${API_URL}/listings/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('İlan alınamadı');
  return res.json();
}

export const formatPrice = (n: number) => n.toLocaleString('tr-TR') + ' ₺';
export const typeLabel = (t: string) => (t === 'kiralik' ? 'Kiralık' : 'Satılık');
