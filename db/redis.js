import { Redis } from '@upstash/redis';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const restUrl = process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
let redisUrl = process.env.REDIS_URL;

if (!restUrl || !restToken || !redisUrl) {
  console.error("❌ Environment Validation Error: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, and REDIS_URL must be defined in your .env file.");
  process.exit(1);
}

// Auto-sanitize REDIS_URL if it contains redis-cli commands
if (redisUrl.includes('redis-cli')) {
  const match = redisUrl.match(/(rediss?:\/\/[^\s]+)/);
  if (match) {
    let extracted = match[1];
    if (extracted.startsWith('redis://') && redisUrl.includes('--tls')) {
      extracted = extracted.replace('redis://', 'rediss://');
    }
    redisUrl = extracted;
  }
}

// 1. Upstash HTTP/REST client for stateless command execution (SET, GET, DEL, etc.)
export const redisRest = new Redis({
  url: restUrl,
  token: restToken,
});

// 2. Standard TCP/TLS client with cloud-resilient keep-alives
export const redisTcpSubscriber = createClient({
  url: redisUrl,
  socket: {
    tls: true,
    rejectUnauthorized: false, // Prevents local Windows CA certificate handshake drops
    keepAlive: 5000,           // Keeps the underlying TCP socket active
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
  },
  pingInterval: 15000          // Fires a background ping every 15 seconds to keep the serverless pipeline open
});

redisTcpSubscriber.on('error', (err) => {
  console.error('❌ Redis TCP Subscriber Connection Error:', err.message);
});

redisTcpSubscriber.on('reconnecting', () => {
  console.log('🔄 Redis TCP Subscriber: Reconnecting...');
});

redisTcpSubscriber.on('ready', () => {
  console.log('✅ Redis TCP Subscriber: Connection Ready!');
});

export async function connectRedis() {
  if (!redisTcpSubscriber.isOpen) {
    await redisTcpSubscriber.connect();
  }
}

export async function closeRedis() {
  if (redisTcpSubscriber.isOpen) {
    await redisTcpSubscriber.disconnect();
  }
}