'use client';

// Panel sayfaları (tarayıcı) için api çağrısı. Giriş çerezi otomatik gider.
export async function panelApi<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: init.body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
  });

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    window.location.href = '/panel/giris';
    throw new Error('Oturum kapandı');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg || 'Bir hata oluştu');
  }
  return data as T;
}
