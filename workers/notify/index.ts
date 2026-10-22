import { Worker } from 'bullmq';

// notify-worker: bildirim işleri.
// Docker içinde REDIS_HOST=redis, Mac'te doğrudan çalışınca localhost.
const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 };

// 1) İlan eklenince/değişince
const listingWorker = new Worker(
  'listing.changed',
  async (job) => {
    console.log(`[notify] İlan #${job.data.id} ${job.name === 'created' ? 'eklendi' : 'güncellendi'}.`);
    // İLERİDE: kayıtlı taleplerle eşleştir, uygun müşterilere haber ver.
  },
  { connection },
);

// 2) Siteden yeni talep gelince
const kindLabel: Record<string, string> = { gosterim: 'Gösterim isteği', bilgi: 'Bilgi isteği', iletisim: 'İletişim' };

const leadWorker = new Worker(
  'lead.created',
  async (job) => {
    const { id, name, phone, kind, listingTitle } = job.data as {
      id: number;
      name: string;
      phone: string;
      kind: string;
      listingTitle: string | null;
    };
    const phoneText = phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '0$1 $2 $3 $4');
    console.log(
      `[notify] 🔔 YENİ TALEP #${id}: ${kindLabel[kind] ?? kind} — ${name}, ${phoneText}` +
        (listingTitle ? ` — ilan: "${listingTitle}"` : ''),
    );
    // İLERİDE: emlakçıya e-posta / SMS / WhatsApp bildirimi buradan gidecek.
  },
  { connection },
);

for (const w of [listingWorker, leadWorker]) {
  w.on('failed', (job, err) => console.error(`[notify] Hata (${w.name}):`, job?.id, err.message));
}
console.log(`[notify] Worker çalışıyor, Redis: ${connection.host}. Kuyruklar: listing.changed, lead.created`);
