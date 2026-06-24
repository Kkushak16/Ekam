import { supabaseAdmin, createSupabaseUserClient } from './db/supabase.js';

console.log('✅ SUPABASE_URL loaded:', process.env.SUPABASE_URL);

// Create a test user client (requires a valid token, replace with a real token for real test)
const dummyToken = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!dummyToken) {
  console.warn('⚠️ No SUPABASE_SERVICE_ROLE_KEY provided; skipping user client test');
} else {
  const userClient = createSupabaseUserClient(dummyToken);
  console.log('✅ Created user client');
}

console.log('✅ Supabase admin client ready');
