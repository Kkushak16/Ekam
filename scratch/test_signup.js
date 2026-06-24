import dotenv from 'dotenv';
dotenv.config();
import { supabaseAdmin } from '../db/supabase.js';

async function test() {
  try {
    const email = `test_${Date.now()}@example.com`;
    const password = 'Password123!';
    const displayName = 'Test User';
    
    console.log('Attempting admin.createUser with:', { email, password, displayName });
    const res = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName }
    });
    console.log('Result:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
test();
