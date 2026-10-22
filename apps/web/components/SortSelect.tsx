'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
  { value: 'yeni', label: 'En yeni' },
  { value: 'ucuz', label: 'Fiyat: düşükten yükseğe' },
  { value: 'pahali', label: 'Fiyat: yüksekten düşüğe' },
  { value: 'buyuk', label: 'En geniş' },
];

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function change(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set('siralama', value);
    next.delete('sayfa');
    router.push(`${pathname}?${next}`);
  }

  return (
    <select
      value={params.get('siralama') ?? 'yeni'}
      onChange={(e) => change(e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      aria-label="Sıralama"
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
