// services/pushService.js
import { redisRest } from '../db/redis.js';
import { getUserSubscriptions, deleteSubscriptionByEndpoint } from '../db/pushSubscriptions.js';

let pushQueue = null;

/** Set the BullMQ queue instance (called from server after queue creation) */
export function setPushQueue(queue) {
  pushQueue = queue;
}

/**
 * Determine if a user should receive a push notification.
 * Offline criteria:
 * - No active sockets (sessions count = 0)
 * - Presence is not "online"
 * - lastSeenAt is older than 60 seconds
 */
export async function isUserOffline(userId) {
  let presence, sessionCount, lastSeenStr;
  try {
    [presence, sessionCount, lastSeenStr] = await Promise.all([
      redisRest.get(`presence:${userId}`),
      redisRest.scard(`sessions:${userId}`),
      redisRest.get(`last_seen:${userId}`)
    ]);
  } catch (err) {
    if (err.message && err.message.includes('WRONGTYPE')) {
      console.warn(`⚠️ WRONGTYPE encountered for user ${userId}. Deleting and resetting sessions key.`);
      try {
        await redisRest.del(`sessions:${userId}`);
      } catch (delErr) {
        console.error(`❌ Failed to delete sessions key for user ${userId}:`, delErr.message);
      }
      sessionCount = 0;
      presence = await redisRest.get(`presence:${userId}`).catch(() => null);
      lastSeenStr = await redisRest.get(`last_seen:${userId}`).catch(() => null);
    } else {
      throw err;
    }
  }

  const isOnline = presence === 'online' && (Number(sessionCount) || 0) > 0;
  if (isOnline) return false;

  const lastSeen = Number(lastSeenStr) || 0; // epoch seconds
  const nowSec = Math.floor(Date.now() / 1000);
  const secondsSinceSeen = nowSec - lastSeen;
  return secondsSinceSeen > 60; // older than 60 s
}

/** Enqueue a push job for a given user */
export async function enqueuePushForUser(userId, payload) {
  if (!pushQueue) {
    throw new Error('Push queue not initialized');
  }
  console.log('[PUSH] Queueing notification', userId);
  let subs = await redisRest.hgetall(`push_sub:${userId}`);
  if (!subs || !Object.keys(subs).length) {
    const dbSubs = await getUserSubscriptions(userId);
    for (const sub of dbSubs) {
      await redisRest.hset(`push_sub:${userId}`, sub.endpoint, JSON.stringify(sub.subscription));
    }
    subs = await redisRest.hgetall(`push_sub:${userId}`) || {};
  }

  for (const [endpoint, subJson] of Object.entries(subs)) {
    const subscription = JSON.parse(subJson);
    await pushQueue.add('push', { endpoint, subscription, payload, recipientId: userId });
  }
}

/**
 * Clean up dead subscription after a 404/410 response from web-push.
 * @param {string} endpoint - The subscription endpoint that is no longer valid.
 * @param {string} userId - The user id the subscription belongs to.
 */
export const pushNotificationProcessor = async (job) => {
  // Remove from Postgres via Supabase admin
  await deleteSubscriptionByEndpoint(endpoint);
  // Remove the cached entry in Redis (hash key per user)
  if (userId) {
    await redisRest.hdel(`push_sub:${userId}`, endpoint);
  }
}