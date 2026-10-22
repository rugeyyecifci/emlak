import { Worker } from 'bullmq';

// Docker içinde REDIS_HOST=redis, Mac'te doğrudan çalışınca localhost.
const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 };

const worker = new Worker(
  'listing.changed',
  async (job) => {
    console.log(`[notify] Yeni ilan #${job.data.id} geldi, eşleşen müşteriler aranıyor...`);

    // İLERİDE: kayıtlı taleplerle eşleştir, emlakçıya e-posta/SMS gönder.
    await new Promise((r) => setTimeout(r, 2000)); // uzun süren iş taklidi

    console.log(`[notify] İlan #${job.data.id} işlendi.`);
  },
  { connection },
);

worker.on('failed', (job, err) => console.error('[notify] Hata:', job?.id, err.message));
console.log(`[notify] Worker çalışıyor, Redis: ${connection.host}. İş bekleniyor...`);
