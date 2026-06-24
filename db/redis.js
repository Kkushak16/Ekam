import { Redis } from '@upstash/redis';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// --- ABSOLUTE PROTOCOL FORCE INTERCEPT ---
if (process.env.REDIS_URL) {
  let cleanedUrl = process.env.REDIS_URL.trim().replace(/^['"]|['"]$/g, '');
  
  // Extract out of copy-pasted redis-cli strings if necessary
  if (cleanedUrl.includes('redis-cli')) {
    const match = cleanedUrl.match(/(rediss?:\/\/[^\s'"]+)/);
    if (match) cleanedUrl = match[1];
  }

  // Force the text to use secure protocol prefix
  if (cleanedUrl.startsWith('redis://')) {
    cleanedUrl = cleanedUrl.replace('redis://', 'rediss://');
  }
  
  // Re-inject it directly into the global process environment
  process.env.REDIS_URL = cleanedUrl;
}
// ───────────────────────────────────────────

const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
const finalRedisUrl = process.env.REDIS_URL;

if (!restUrl || !restToken || !finalRedisUrl) {
  console.error("❌ Environment Validation Error: Missing Upstash/Redis variables.");
  process.exit(1);
}

// Upstash HTTP/REST client
export const redisRest = new Redis({
  url: restUrl,
  token: restToken,
});

// Standard TCP/TLS client
export const redisTcpSubscriber = createClient({
  url: finalRedisUrl, // Now guaranteed to start with rediss://
  socket: {
    tls: true,
    rejectUnauthorized: false, // Prevents cloud/local CA handshake drops
    keepAlive: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
  },
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
}