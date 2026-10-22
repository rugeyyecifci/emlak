export type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  preferredTime: string | null;
  kind: 'gosterim' | 'bilgi' | 'iletisim';
  status: 'yeni' | 'arandi' | 'gosterim' | 'kapandi';
  note: string | null;
  createdAt: string;
  listing: { id: number; title: string } | null;
};

export const LEAD_STATUSES = [
  { key: 'yeni', label: 'Yeni', color: 'bg-red-100 text-red-800' },
  { key: 'arandi', label: 'Arandı', color: 'bg-blue-100 text-blue-800' },
  { key: 'gosterim', label: 'Gösterim yapıldı', color: 'bg-amber-100 text-amber-800' },
  { key: 'kapandi', label: 'Kapandı', color: 'bg-gray-200 text-gray-700' },
] as const;

export const kindLabel: Record<string, string> = { gosterim: 'Gösterim isteği', bilgi: 'Bilgi isteği', iletisim: 'İletişim formu' };

export const formatPhone = (p: string) => p.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '0$1 $2 $3 $4');

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'az önce';
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat önce`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} gün önce`;
  return new Date(iso).toLocaleDateString('tr-TR');
}
