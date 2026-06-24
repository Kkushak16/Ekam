import { Redis } from '@upstash/redis';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
let rawUrl = process.env.REDIS_URL?.trim();

if (!restUrl || !restToken || !rawUrl) {
  console.error("❌ Environment Validation Error: Missing Upstash/Redis variables.");
  process.exit(1);
}

// 1. Clean up potential wrap quotes from environmental strings
rawUrl = rawUrl.replace(/^['"]|['"]$/g, '');

// 2. Extract cleanly if a copy-paste CLI string exists
if (rawUrl.includes('redis-cli')) {
  const match = rawUrl.match(/(rediss?:\/\/[^\s'"]+)/);
  if (match) rawUrl = match[1];
}

// 3. Fallback Parse: Build structured connection details directly to bypass the library string check
let parsed;
try {
  // If the string doesn't have a protocol prefix at all, give it a placeholder to allow URL processing
  const processingUrl = rawUrl.includes('://') ? rawUrl : `redis://${rawUrl}`;
  parsed = new URL(processingUrl);
} catch (e) {
  console.error(`❌ Failed to parse REDIS_URL structure.`);
  process.exit(1);
}

// Upstash HTTP/REST client
export const redisRest = new Redis({
  url: restUrl,
  token: restToken,
});

// Standard TCP/TLS client
export const redisTcpSubscriber = createClient({
  // CRITICAL BYPASS: Do NOT provide the "url" property string.
  // By breaking the string down into raw socket properties, node-redis skips the validation check that caused the crash.
  socket: {
    host: parsed.hostname,
    port: parseInt(parsed.port || '6379', 10),
    tls: true, // Forces absolute compliance with Upstash SSL/TLS requirements
    rejectUnauthorized: false,
    keepAlive: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
  },
  username: parsed.username || undefined,
  password: parsed.password || undefined,
  pingInterval: 15000
});

redisTcpSubscriber.on('error', (err) => {
  console.error('❌ Redis TCP Subscriber Connection Error:', err.message);
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
}// Last Build Force: 24-06-2026 20:46:24
