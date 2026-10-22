import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Worker } from 'bullmq';
import pg from 'pg';
import sharp from 'sharp';

// image-worker: yüklenen her fotoğraftan iki WebP üretir.
//   thumb  -> 640px genişlik, ilan kartları için
//   large  -> 1600px genişlik, ilan detay galerisi için
// Fotoğraftaki EXIF bilgileri (GPS konumu dahil) silinir, yön düzeltilir.

const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 };
const BUCKET = process.env.S3_BUCKET ?? 'ilanlar';

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:8333',
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? 'emlak',
    secretAccessKey: process.env.S3_SECRET_KEY ?? 'emlak',
  },
});

const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const SIZES = [
  { name: 'thumb', width: 640, quality: 72 },
  { name: 'large', width: 1600, quality: 82 },
] as const;

async function download(key: string): Promise<Buffer> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const bytes = await res.Body!.transformToByteArray();
  return Buffer.from(bytes);
}

const worker = new Worker(
  'media.process',
  async (job) => {
    const { mediaId, listingId, key } = job.data as { mediaId: number; listingId: number; key: string };
    const started = Date.now();

    const original = await download(key);
    const keys: Record<string, string> = {};

    for (const size of SIZES) {
      const out = await sharp(original)
        .rotate() // EXIF'e göre yönü düzelt (yan çekilmiş telefon fotoğrafları)
        .resize({ width: size.width, withoutEnlargement: true })
        .webp({ quality: size.quality })
        .toBuffer(); // sharp varsayılan olarak tüm metadata'yı (GPS dahil) atar

      const outKey = `ilan/${listingId}/${mediaId}-${size.name}.webp`;
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: outKey,
          Body: out,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      keys[size.name] = outKey;
    }

    await db.query(`UPDATE "Media" SET "thumbKey" = $1, "largeKey" = $2, status = 'hazir' WHERE id = $3`, [
      keys.thumb,
      keys.large,
      mediaId,
    ]);

    console.log(`[image] Fotoğraf #${mediaId} hazır (${Date.now() - started} ms)`);
  },
  { connection, concurrency: 2 },
);

worker.on('failed', async (job, err) => {
  console.error('[image] Hata:', job?.data?.mediaId, err.message);
  // Son deneme de başarısızsa panelde "hata" olarak görünsün.
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
    await db.query(`UPDATE "Media" SET status = 'hata' WHERE id = $1`, [job.data.mediaId]).catch(() => {});
  }
});

console.log(`[image] Worker çalışıyor. Redis: ${connection.host}, depo: ${process.env.S3_ENDPOINT ?? 'http://localhost:8333'}`);
