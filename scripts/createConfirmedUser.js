import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Using the service role key to bypass the email confirmation requirement
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables in your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser() {
  console.log('⚡ Injecting an auto-confirmed test account via Supabase Admin API...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'devuser@ekam.com',
    password: 'Password123!',
    email_confirm: true, // Forces status to confirmed immediately
    user_metadata: { displayName: 'Dev Tester' }
  });

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log('💡 Note: devuser@ekam.com is already registered. We will use it for the test.');
    } else {
      console.error('❌ Failed to create user:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Success! User created and auto-confirmed:', data.user.email);
  }
  process.exit(0);
}

createUser();