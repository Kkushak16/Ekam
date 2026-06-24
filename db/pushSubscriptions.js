// db/pushSubscriptions.js
import { supabaseAdmin } from './supabase.js';
import { z } from 'zod';

// Zod schema for validation
export const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

/** Upsert a subscription for a user */
export async function upsertSubscription(userId, subscription) {
  // Validate first
  const parsed = subscriptionSchema.safeParse(subscription);
  if (!parsed.success) {
    throw new Error('Invalid subscription payload');
  }
  const { endpoint } = parsed.data;
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      endpoint,
      subscription: parsed.data,
      updated_at: now
    }, { onConflict: 'endpoint' })
    .select();
  if (error) throw error;
  return data;
}

/** Get all active subscriptions for a user */
export async function getUserSubscriptions(userId) {
  const { data, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('endpoint, subscription')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

/** Delete subscription by endpoint (used when 404/410) */
export async function deleteSubscriptionByEndpoint(endpoint) {
  const { error } = await supabaseAdmin
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);
  if (error) throw error;
}
