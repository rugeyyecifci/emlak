export type Media = {
  id: number;
  thumbKey: string | null;
  largeKey: string | null;
  status?: string;
  sortOrder?: number;
};

export type Listing = {
  id: number;
  title: string;
  description?: string | null;
  type: 'satilik' | 'kiralik';
  price: number;
  rooms?: string | null;
  areaM2?: number | null;
  district?: string | null;
  status?: 'taslak' | 'yayinda' | 'kapandi';
  updatedAt?: string;
  media?: Media[];
  _count?: { media: number };
};

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? 'http://localhost:8333/ilanlar';

export const mediaUrl = (key?: string | null) => (key ? `${MEDIA_URL}/${key}` : null);

// Sunucu tarafı (vitrin) için: api'ye doğrudan bağlanır.
export async function getListings(): Promise<Listing[]> {
  const res = await fetch(`${API_URL}/listings`, { cache: 'no-store' });
  if (!res.ok) throw new Error('İlanlar alınamadı');
  return res.json();
}

export async function getListing(id: string): Promise<Listing | null> {
  const res = await fetch(`${API_URL}/listings/${id}`, { cache: 'no-store' });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error('İlan alınamadı');
  return res.json();
}

export const formatPrice = (n: number) => n.toLocaleString('tr-TR') + ' ₺';
export const typeLabel = (t: string) => (t === 'kiralik' ? 'Kiralık' : 'Satılık');
export const statusLabel: Record<string, string> = { taslak: 'Taslak', yayinda: 'Yayında', kapandi: 'Kapandı' };
