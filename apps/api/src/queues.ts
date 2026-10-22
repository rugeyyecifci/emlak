import { Queue } from 'bullmq';

// Redis'e bağlanan iş kuyrukları. Api uzun süren işleri buraya bırakır,
// worker'lar alıp arka planda yapar.
const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 };

const defaultJobOptions = {
  attempts: 3, // hata olursa 3 kez dener
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: 1000,
};

export const listingChangedQueue = new Queue('listing.changed', { connection, defaultJobOptions });
export const mediaQueue = new Queue('media.process', { connection, defaultJobOptions });
export const leadQueue = new Queue('lead.created', { connection, defaultJobOptions });
