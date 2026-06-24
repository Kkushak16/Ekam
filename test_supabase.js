import { supabaseAdmin, createSupabaseUserClient } from './db/supabase.js';
console.log('Supabase admin client initialized');
console.log('Supabase admin URL:', process.env.SUPABASE_URL);
// Optionally create a user client with a dummy token (will fail if token invalid)
// const userClient = createSupabaseUserClient('dummy-token');
