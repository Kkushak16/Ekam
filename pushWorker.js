// pushWorker.js
import { Worker, QueueEvents } from 'bullmq';
import webpush from 'web-push';
import { cleanupDeadSubscription } from './services/pushService.js'; 
import dotenv from 'dotenv';

dotenv.config();

// Configure web-push VAPID
webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Dynamically parse the cloud REDIS_URL from your .env file
const redisUrl = process.env.REDIS_URL ? new URL(process.env.REDIS_URL) : null;

const connection = redisUrl ? {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port) || 6379,
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  tls: redisUrl.protocol === 'rediss:' ? {} : undefined, 
  maxRetriesPerRequest: null 
} : {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null
};

const worker = new Worker('pushNotifications', async job => {
  const { endpoint, subscription, payload, recipientId } = job.data;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    // If subscription is no longer valid (expired or uninstalled), run unified cleanup
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.warn(`🗑️ Removing dead subscription for endpoint ${endpoint}`);
      // Pass both parameters to satisfy the updated services/pushService.js file
      await cleanupDeadSubscription(endpoint, recipientId); 
    } else {
      console.error('Push send error:', err);
      throw err;
    }
  }
}, { connection });

// Listen to completed/failed events for logging
const events = new QueueEvents('pushNotifications', { connection });

events.on('completed', ({ jobId }) => {
  console.log(`✅ Push job ${jobId} completed`);
});

events.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Push job ${jobId} failed:`, failedReason);
});

worker.on('error', err => {
  console.error('Worker error:', err);
});

console.log('🚀 Push worker started');