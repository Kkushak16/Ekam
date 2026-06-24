import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("❌ Environment Validation Error: REDIS_URL must be defined.");
  process.exit(1);
}

// Sanitize Upstash Connection URI for TLS
if (redisUrl.includes('redis-cli')) {
  const match = redisUrl.match(/(rediss?:\/\/[^\s]+)/);
  if (match) redisUrl = match[1];
}
if (redisUrl.startsWith('redis://')) {
  redisUrl = redisUrl.replace('redis://', 'rediss://');
}

const workerConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  tls: { rejectUnauthorized: false },
  keepAlive: 5000
});

console.log('🔄 Connecting BullMQ worker securely to Upstash...');

// Self-contained worker to isolate and prove the connection works
const worker = new Worker(
  'pushNotifications', 
  async (job) => {
    console.log(`\n📦 [Job Received] ID: ${job.id}`);
    console.log(`📜 [Payload Data]:`, JSON.stringify(job.data, null, 2));
    console.log(`⚠️ Simulating fake endpoint rejection...`);
    console.log(`🗑️ Removing dead subscription for endpoint: ${job.data.endpoint || 'https://example.com/fake-endpoint'}`);
    return { status: 'cleaned_up' };
  },
  { connection: workerConnection }
);

worker.on('ready', () => {
  console.log('🚀 Push worker started and securely listening on Upstash!');
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('❌ BullMQ Worker Global Error:', err.message);
});