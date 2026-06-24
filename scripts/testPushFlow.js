import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("❌ Environment Validation Error: REDIS_URL is missing from .env");
  process.exit(1);
}

// Sanitize Upstash URL for secure TLS
if (redisUrl.includes('redis-cli')) {
  const match = redisUrl.match(/(rediss?:\/\/[^\s]+)/);
  if (match) redisUrl = match[1];
}
if (redisUrl.startsWith('redis://')) {
  redisUrl = redisUrl.replace('redis://', 'rediss://');
}

// Create isolated client just for pushing the test job
const queueConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  tls: { rejectUnauthorized: false }
});

const testQueue = new Queue('pushNotifications', { connection: queueConnection });

async function runTest() {
  console.log('⏳ Enqueuing dummy push notification job directly to Upstash...');
  
  await testQueue.add('testJob', {
    userId: 'test-user-123',
    endpoint: 'https://example.com/fake-endpoint',
    title: 'Test Notification',
    body: 'Hello from the self-contained pipeline test!'
  });

  console.log('✅ Test push job enqueued – check your worker logs for processing.');
  
  // Clean disconnect
  await queueConnection.quit();
  process.exit(0);
}

runTest().catch(err => {
  console.error('❌ Failed to enqueue test job:', err);
  process.exit(1);
});