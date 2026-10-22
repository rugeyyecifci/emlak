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
  createdAt?: string;
  updatedAt?: string;
  media?: Media[];
  _count?: { media: number };
};

export type ListingPage = { items: Listing[]; total: number; page: number; pageCount: number };
export type Summary = { districts: string[]; counts: { satilik: number; kiralik: number } };

// Sitede kullanılan arama parametreleri (URL'deki ?tur=...&oda=... kısmı)
export type SearchParams = Record<string, string | string[] | undefined>;

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? 'http://localhost:8333/ilanlar';

export const mediaUrl = (key?: string | null) => (key ? `${MEDIA_URL}/${key}` : null);

export const ROOM_OPTIONS = ['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '5+2', '6+'];

// URL parametrelerini api sorgusuna çevirir (oda birden fazla seçilebilir)
export function toQuery(params: SearchParams) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    for (const item of ([] as string[]).concat(v ?? [])) if (item) qs.append(k, item);
  }
  return qs;
}

export async function searchListings(params: SearchParams = {}): Promise<ListingPage> {
  const res = await fetch(`${API_URL}/listings?${toQuery(params)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('İlanlar alınamadı');
  return res.json();
}

export async function getSummary(): Promise<Summary> {
  const res = await fetch(`${API_URL}/listings/ozet`, { cache: 'no-store' });
  if (!res.ok) return { districts: [], counts: { satilik: 0, kiralik: 0 } };
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

export function isNew(iso?: string) {
  return !!iso && Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000;
}
