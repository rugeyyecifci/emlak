import { Queue } from 'bullmq';

// Redis'e bağlanan iş kuyrukları. Api uzun süren işleri buraya bırakır,
// worker'lar alıp arka planda yapar.
const connection = { host: process.env.REDIS_HOST ?? 'localhost', port: 6379 };

export const listingChangedQueue = new Queue('listing.changed', { connection });
