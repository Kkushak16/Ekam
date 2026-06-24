import { Redis } from '@upstash/redis';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
let rawUrl = process.env.REDIS_URL?.trim();

if (!rawUrl && !(restUrl && restToken)) {
  console.warn('⚠️ Neither REDIS_URL nor Upstash REST credentials provided. Redis functionality will be disabled.');
  // Do not exit; allow the app to start without Redis.
}
// Optional TCP Redis client – only initialize if REDIS_URL is provided
let redisTcpSubscriber;
if (rawUrl) {
  // 1. Clean up potential wrap quotes from environmental strings
  rawUrl = rawUrl.replace(/^['"]|['"]$/g, '');

  // 2. Extract cleanly if a copy-paste CLI string exists
  if (rawUrl.includes('redis-cli')) {
    const match = rawUrl.match(/(rediss?:\/\/[^\s'"]+)/);
    if (match) rawUrl = match[1];
  }

  // 3. Parse Redis connection string
  let parsed;
  try {
    const processingUrl = rawUrl.includes('://') ? rawUrl : `redis://${rawUrl}`;
    parsed = new URL(processingUrl);
  } catch (e) {
    console.error(`❌ Failed to parse REDIS_URL structure.`);
    process.exit(1);
  }

  // Check if TLS protocol is required (e.g. rediss://)
  const isTls = parsed.protocol === 'rediss:';

  // Standard TCP/TLS client
  redisTcpSubscriber = createClient({
    socket: {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379', 10),
      ...(isTls ? { tls: true, rejectUnauthorized: false } : {}),
      keepAlive: 5000,
      reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
    },
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    pingInterval: 15000,
  });

  redisTcpSubscriber.on('error', (err) => {
    console.error('❌ Redis TCP Subscriber Connection Error:', err.message);
  });

  redisTcpSubscriber.on('ready', () => {
    console.log('✅ Redis TCP Subscriber: Connection Ready!');
  });
} else {
  console.log('ℹ️ REDIS_URL not provided; skipping TCP Redis client initialization.');
}


export async function connectRedis() {
  if (redisTcpSubscriber && !redisTcpSubscriber.isOpen) {
    await redisTcpSubscriber.connect();
  }
}

export async function closeRedis() {
  if (redisTcpSubscriber && redisTcpSubscriber.isOpen) {
    await redisTcpSubscriber.disconnect();
  }
}

// Build adapter or use Upstash client
let redisRestInstance;
if (restUrl && restToken) {
  console.log("🚀 Initializing Upstash HTTP/REST Redis client.");
  redisRestInstance = new Redis({
    url: restUrl,
    token: restToken,
  });
} else {
  console.log("ℹ️ No Upstash REST variables provided. Using standard TCP Redis client wrapper.");
  // Create an adapter that maps upstash commands to the standard TCP connection
  redisRestInstance = {
    async get(key) {
      await connectRedis();
      return await redisTcpSubscriber.get(key);
    },
    async set(key, value, options) {
      await connectRedis();
      const redisOptions = {};
      if (options && options.ex) {
        redisOptions.EX = options.ex;
      }
      return await redisTcpSubscriber.set(key, String(value), redisOptions);
    },
    async del(key) {
      await connectRedis();
      return await redisTcpSubscriber.del(key);
    },
    async sadd(key, ...members) {
      await connectRedis();
      const flat = members.flat();
      return await redisTcpSubscriber.sAdd(key, flat);
    },
    async srem(key, ...members) {
      await connectRedis();
      const flat = members.flat();
      return await redisTcpSubscriber.sRem(key, flat);
    },
    async smembers(key) {
      await connectRedis();
      return await redisTcpSubscriber.sMembers(key);
    },
    async scard(key) {
      await connectRedis();
      return await redisTcpSubscriber.sCard(key);
    },
    async incr(key) {
      await connectRedis();
      return await redisTcpSubscriber.incr(key);
    },
    async decr(key) {
      await connectRedis();
      return await redisTcpSubscriber.decr(key);
    },
    async mget(...keys) {
      await connectRedis();
      const flat = keys.flat();
      return await redisTcpSubscriber.mGet(flat);
    },
    async expire(key, seconds) {
      await connectRedis();
      return await redisTcpSubscriber.expire(key, seconds);
    },
    async hgetall(key) {
      await connectRedis();
      const res = await redisTcpSubscriber.hGetAll(key);
      if (Object.keys(res).length === 0) return null;
      return res;
    },
    async hset(key, field, value) {
      await connectRedis();
      return await redisTcpSubscriber.hSet(key, field, value);
    },
    async hdel(key, field) {
      await connectRedis();
      return await redisTcpSubscriber.hDel(key, field);
    },
    async ping() {
      await connectRedis();
      return await redisTcpSubscriber.ping();
    }
  };
}

export const redisRest = redisRestInstance;
// Last Build Force: 24-06-2026 20:46:24
