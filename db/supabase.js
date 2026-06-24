import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Resolve .env file relative to project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const envPath = resolve(__dirname, '..', '.env');

dotenv.config({ path: envPath });

// Debug: ensure SUPABASE_URL is loaded
if (process.env.SUPABASE_URL) {
  console.log('✅ SUPABASE_URL loaded:', process.env.SUPABASE_URL);
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  console.warn("⚠️ SUPABASE_URL, SUPABASE_ANON_KEY, and/or SUPABASE_SERVICE_ROLE_KEY are missing.");
  console.warn("   Supabase-dependent routes will fail, but the app will still start.");
  // Do NOT process.exit — let non-Supabase routes (e.g. /health) work.
}

// 1. Admin Client (Bypasses RLS - used for token validation and seeds)
export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// 2. Dynamic User Client (Respects RLS - used for user-authenticated operations)
export function createSupabaseUserClient(userJwt) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.");
  }
  if (typeof userJwt !== 'string' || !userJwt) {
    throw new Error("Security Exception: User token must be a non-empty string.");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${userJwt}`
      }
    }
  });
}
