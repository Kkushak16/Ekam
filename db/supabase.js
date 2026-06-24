import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  console.error("❌ Environment Validation Error: SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY must be defined in your .env file.");
  process.exit(1);
}

// 1. Admin Client (Bypasses RLS - used for token validation and seeds)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 2. Dynamic User Client (Respects RLS - used for user-authenticated operations)
export function createSupabaseUserClient(userJwt) {
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
