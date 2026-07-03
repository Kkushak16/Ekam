import dotenv from 'dotenv';
dotenv.config();
import { supabaseAdmin } from '../db/supabase.js';

async function test() {
  console.log('Fetching user from Supabase API...');
  const { data: users, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .limit(1);

  if (userError) {
    console.error('User fetch error:', userError);
  } else {
    console.log('User keys:', users.length > 0 ? Object.keys(users[0]) : 'Empty table');
    console.log('User data:', users);
  }

  console.log('Fetching room from Supabase API...');
  const { data: rooms, error: roomError } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .limit(1);

  if (roomError) {
    console.error('Room fetch error:', roomError);
  } else {
    console.log('Room keys:', rooms.length > 0 ? Object.keys(rooms[0]) : 'Empty table');
    console.log('Room data:', rooms);
  }
}

test();
