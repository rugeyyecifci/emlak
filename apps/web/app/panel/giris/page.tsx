'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { panelApi } from '@/lib/panel-api';

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('sonra') || '/panel';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await panelApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      router.replace(next.startsWith('/panel') ? next : '/panel');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-16 max-w-sm rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold">Panele giriş</h1>
      <p className="mt-1 text-sm text-gray-500">Emlak ofisi yönetim paneli</p>

      <label className="mt-6 block text-sm font-medium">E-posta</label>
      <input
        type="email"
        required
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-2"
      />

      <label className="mt-4 block text-sm font-medium">Şifre</label>
      <input
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1 w-full rounded-lg border px-3 py-2"
      />

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <button disabled={busy} className="mt-6 w-full rounded-lg bg-teal-700 py-2.5 font-semibold text-white disabled:opacity-60">
        {busy ? 'Giriş yapılıyor…' : 'Giriş yap'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
