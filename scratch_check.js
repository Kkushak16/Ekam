import { supabaseAdmin } from './db/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  console.log("Checking tables...");
  
  // Try querying 'friends'
  const { data: friendsData, error: friendsError } = await supabaseAdmin
    .from('friends')
    .select('*')
    .limit(1);
  console.log("friends table:", { friendsData, friendsError });

  // Try querying 'friend_requests'
  const { data: reqData, error: reqError } = await supabaseAdmin
    .from('friend_requests')
    .select('*')
    .limit(1);
  console.log("friend_requests table:", { reqData, reqError });

  // Try querying 'users'
  const { data: usersData, error: usersError } = await supabaseAdmin
    .from('users')
    .select('*')
    .limit(5);
  console.log("users table:", { usersData, usersError });
}

check();
