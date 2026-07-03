import dotenv from 'dotenv';
dotenv.config();
import { supabaseAdmin } from '../db/supabase.js';

async function check() {
  try {
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);
    
    if (userError) {
      console.error('Error fetching users:', userError);
    } else {
      console.log('User columns:', users[0] ? Object.keys(users[0]) : 'No users found');
    }

    const { data: rooms, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .limit(1);

    if (roomError) {
      console.error('Error fetching rooms:', roomError);
    } else {
      console.log('Room columns:', rooms[0] ? Object.keys(rooms[0]) : 'No rooms found');
    }

    const { data: roomMembers, error: roomMembersError } = await supabaseAdmin
      .from('room_members')
      .select('*')
      .limit(1);

    if (roomMembersError) {
      console.error('Error fetching room_members:', roomMembersError);
    } else {
      console.log('Room Member columns:', roomMembers[0] ? Object.keys(roomMembers[0]) : 'No room members found');
    }

  } catch (e) {
    console.error('Exception:', e);
  }
}

check();
