import dotenv from 'dotenv';
dotenv.config();
import { supabaseAdmin } from '../db/supabase.js';

async function test() {
  console.log('Testing listUsers...');
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 10 });
    if (error) {
      console.error('listUsers returned error:', error);
    } else {
      console.log('listUsers succeeded! Total users found in page 1:', data?.users?.length);
      if (data?.users?.length > 0) {
        console.log('First user metadata:', JSON.stringify(data.users[0].user_metadata, null, 2));
      }
    }
  } catch (err) {
    console.error('listUsers threw exception:', err);
  }
}

test();
