'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { formatPhone, kindLabel, LEAD_STATUSES, timeAgo, type Lead } from '@/lib/leads';
import { panelApi } from '@/lib/panel-api';

type Counts = Record<string, number>;

export default function LeadsPage() {
  const [tab, setTab] = useState<string>('yeni');
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [counts, setCounts] = useState<Counts>({});
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const q = tab === 'hepsi' ? '' : `?durum=${tab}`;
    const [list, c] = await Promise.all([panelApi<Lead[]>(`/admin/leads${q}`), panelApi<Counts>('/admin/leads/sayilar')]);
    setLeads(list);
    setCounts(c);
  }, [tab]);

  useEffect(() => {
    setLeads(null);
    load().catch((e) => setError(e.message));
    const t = setInterval(() => load().catch(() => {}), 30000); // 30 sn'de bir yeni talep var mı bak
    return () => clearInterval(t);
  }, [load]);

  async function update(lead: Lead, data: Partial<Pick<Lead, 'status' | 'note'>>) {
    const updated = await panelApi<Lead>(`/admin/leads/${lead.id}`, { method: 'PATCH', body: JSON.stringify(data) });
    // Durumu değiştiyse bu sekmeden çıkar
    setLeads((prev) =>
      prev?.flatMap((l) => (l.id !== lead.id ? [l] : tab !== 'hepsi' && updated.status !== tab ? [] : [updated])) ?? null,
    );
    panelApi<Counts>('/admin/leads/sayilar').then(setCounts).catch(() => {});
    window.dispatchEvent(new Event('talepler-degisti'));
  }

  async function remove(lead: Lead) {
    if (!window.confirm(`${lead.name} adlı kişinin talebi ve bilgileri kalıcı olarak silinsin mi?`)) return;
    await panelApi(`/admin/leads/${lead.id}`, { method: 'DELETE' });
    setLeads((prev) => prev?.filter((l) => l.id !== lead.id) ?? null);
    panelApi<Counts>('/admin/leads/sayilar').then(setCounts).catch(() => {});
    window.dispatchEvent(new Event('talepler-degisti'));
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tabs = [...LEAD_STATUSES.map((s) => ({ key: s.key as string, label: s.label, n: counts[s.key] ?? 0 })), { key: 'hepsi', label: 'Tümü', n: total }];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Talepler</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm ${tab === t.key ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            {t.label} <span className="opacity-70">({t.n})</span>
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
      {!leads && !error && <p className="text-gray-500">Yükleniyor…</p>}
      {leads?.length === 0 && <p className="text-gray-500">Bu bölümde talep yok.</p>}

      <div className="space-y-3">
        {leads?.map((l) => <LeadCard key={l.id} lead={l} onUpdate={update} onRemove={remove} />)}
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  onUpdate,
  onRemove,
}: {
  lead: Lead;
  onUpdate: (l: Lead, d: Partial<Pick<Lead, 'status' | 'note'>>) => Promise<void>;
  onRemove: (l: Lead) => void;
}) {
  const [note, setNote] = useState(lead.note ?? '');
  const [saved, setSaved] = useState(false);
  const status = LEAD_STATUSES.find((s) => s.key === lead.status)!;
  const waText = encodeURIComponent(
    `Merhaba ${lead.name}, ${lead.listing ? `"${lead.listing.title}" ilanı için` : ''} talebiniz üzerine yazıyorum.`,
  );

  async function saveNote() {
    await onUpdate(lead, { note });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
            <span className="text-xs text-gray-500">{kindLabel[lead.kind]}</span>
            <span className="text-xs text-gray-400">· {timeAgo(lead.createdAt)}</span>
          </div>
          <p className="mt-1 text-lg font-semibold">{lead.name}</p>
          <p className="text-sm text-gray-700">
            {formatPhone(lead.phone)}
            {lead.email && <span className="text-gray-500"> · {lead.email}</span>}
            {lead.preferredTime && <span className="text-gray-500"> · {lead.preferredTime}</span>}
          </p>
          {lead.listing && (
            <Link href={`/panel/ilan/${lead.listing.id}`} className="mt-1 inline-block text-sm text-teal-700">
              İlan: {lead.listing.title}
            </Link>
          )}
        </div>

        <div className="flex gap-2">
          <a href={`tel:+90${lead.phone}`} className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-semibold text-white">Ara</a>
          <a
            href={`https://wa.me/90${lead.phone}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {lead.message && <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-gray-700">{lead.message}</p>}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1">
          <label className="text-xs text-gray-500">Notum</label>
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ör. Cumartesi 14:00 gösterim, bütçesi 5M"
              className="w-full rounded-lg border px-3 py-1.5 text-sm"
            />
            <button onClick={saveNote} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
              {saved ? '✓' : 'Kaydet'}
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500">Durum</label>
          <select
            value={lead.status}
            onChange={(e) => onUpdate(lead, { status: e.target.value as Lead['status'] })}
            className="block rounded-lg border px-3 py-1.5 text-sm"
          >
            {LEAD_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <button onClick={() => onRemove(lead)} className="px-2 py-1.5 text-sm text-red-600 hover:underline">Sil</button>
      </div>
    </div>
  );
}
