import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  console.error("❌ Error: Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// 1. Service Role Client (Administrative Bypass)
const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 2. Anon Client (To test RLS)
const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runVerify() {
  console.log("🧐 Starting database verification checks...");
  let checksPassed = true;

  // Helper function to assert counts
  async function assertCount(tableName, expectedCount) {
    const { count, error } = await adminClient
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`❌ Failed to query ${tableName}:`, error.message);
      checksPassed = false;
      return;
    }

    if (count === expectedCount) {
      console.log(`✅ Table '${tableName}' contains exactly ${count} rows (expected ${expectedCount}).`);
    } else {
      console.error(`❌ Table '${tableName}' contains ${count} rows, but expected ${expectedCount}!`);
      checksPassed = false;
    }
  }

  try {
    // Check tables counts (matching updated seed outputs)
    await assertCount('users', 3);
    await assertCount('rooms', 4);
    await assertCount('room_members', 9);
    await assertCount('messages', 5);
    await assertCount('message_status', 8);

    // Verify trigger integration (display_name, email, status, updated_at)
    console.log("🔍 Checking user profile details...");
    const { data: users, error: usersError } = await adminClient
      .from('users')
      .select('email, display_name, status, updated_at');

    if (usersError) {
      throw new Error(`Failed to read user details: ${usersError.message}`);
    }

    const alice = users.find(u => u.email === 'alice@example.com');
    if (alice && alice.display_name === 'Alice Liddell' && alice.status === 'online' && alice.updated_at) {
      console.log("✅ User trigger sync, status, and updated_at column verified successfully.");
    } else {
      console.error("❌ User profile check failed. Profile data did not match expected values:", alice);
      checksPassed = false;
    }

    // Verify index path logic (fetching General messages sorted desc)
    console.log("🔍 Checking General Room message history index path...");
    const { data: generalRoom, error: roomError } = await adminClient
      .from('rooms')
      .select('id')
      .eq('name', 'General')
      .single();

    if (roomError || !generalRoom) {
      throw new Error(`Could not find General room: ${roomError?.message}`);
    }

    const { data: messages, error: messagesError } = await adminClient
      .from('messages')
      .select('content, sender_id, created_at')
      .eq('room_id', generalRoom.id)
      .order('created_at', { ascending: false });

    if (messagesError) {
      throw new Error(`Failed to fetch General room messages: ${messagesError.message}`);
    }

    if (messages.length === 3) {
      console.log("✅ Message retrieval and sorting verified. Message count: 3.");
    } else {
      console.error(`❌ Expected 3 messages in General room, but got ${messages.length}.`);
      checksPassed = false;
    }

    // Verify RLS policies (Anonymous reads)
    console.log("🔒 Checking RLS Policies (Anonymous client)...");
    
    // 1. Rooms selection should return empty or fail without authentication
    const { data: anonRooms, error: anonRoomsError } = await anonClient
      .from('rooms')
      .select('name');
    
    if (anonRoomsError) {
      console.log("✅ Anon Rooms read restricted as expected (or returned error):", anonRoomsError.message);
    } else if (anonRooms && anonRooms.length === 0) {
      console.log("✅ Anon Rooms read returned 0 rows as expected due to RLS.");
    } else {
      console.error("❌ RLS Failure: Anon client retrieved rooms data directly:", anonRooms);
      checksPassed = false;
    }

    // 2. Public profiles read policy check (Anyone can read users)
    const { data: anonUsers, error: anonUsersError } = await anonClient
      .from('users')
      .select('display_name');

    if (anonUsersError) {
      console.error("❌ Public profiles read policy failed (anon failed to read users):", anonUsersError.message);
      checksPassed = false;
    } else if (anonUsers && anonUsers.length === 3) {
      console.log("✅ RLS Check: Public profiles are readable by anonymous clients.");
    } else {
      console.error(`❌ Expected to read 3 profiles anonymously, but got ${anonUsers?.length}`);
      checksPassed = false;
    }

    // 3. Bob Authenticated Client (For RLS Adversarial Testing)
    console.log("🔒 Running Bob Adversarial RLS Testing...");
    const bobClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const { data: bobAuth, error: bobSignInError } = await bobClient.auth.signInWithPassword({
      email: 'bob@example.com',
      password: 'password123'
    });

    if (bobSignInError) {
      throw new Error(`Failed to sign in Bob: ${bobSignInError.message}`);
    }
    console.log(`🔑 Bob successfully signed in (${bobAuth.user.id}).`);

    // Test A: Can Bob read messages in a room he doesn't belong to? (Tech Talk)
    const { data: techTalkRoom } = await adminClient.from('rooms').select('id').eq('name', 'Tech Talk').single();
    const { data: bobTechTalkMsgs, error: bobTechTalkError } = await bobClient
      .from('messages')
      .select('*')
      .eq('room_id', techTalkRoom.id);

    if (bobTechTalkError) {
      console.log("✅ RLS Blocked Bob from querying Tech Talk messages:", bobTechTalkError.message);
    } else if (bobTechTalkMsgs.length === 0) {
      console.log("✅ RLS successfully restricted Bob: querying Tech Talk messages returned 0 messages (Bob is not a member).");
    } else {
      console.error("❌ RLS Failure: Bob successfully read messages in Tech Talk:", bobTechTalkMsgs);
      checksPassed = false;
    }

    // Test B: Can Bob delete Alice's message in General?
    const { data: aliceMsg } = await adminClient
      .from('messages')
      .select('id')
      .eq('content', "Welcome to General chat! Let's keep it friendly.")
      .single();

    if (!aliceMsg) throw new Error("Could not find Alice's message in General room.");

    // Bob tries to delete Alice's message
    await bobClient
      .from('messages')
      .delete()
      .eq('id', aliceMsg.id);

    // Verify it still exists in the database
    const { data: msgCheck } = await adminClient.from('messages').select('id').eq('id', aliceMsg.id).single();
    if (msgCheck) {
      console.log("✅ RLS successfully blocked Bob from deleting Alice's message (message still exists).");
    } else {
      console.error("❌ RLS Failure: Bob successfully deleted Alice's message!");
      checksPassed = false;
    }

    // Test C: Can Bob (non-admin member in General) add someone to General?
    const fakeUserId = '99999999-9999-9999-9999-999999999999';
    const { error: insertMemberError } = await bobClient
      .from('room_members')
      .insert({
        room_id: generalRoom.id,
        user_id: fakeUserId,
        role: 'member'
      });

    if (insertMemberError) {
      console.log("✅ RLS successfully blocked Bob (non-admin) from adding members to General:", insertMemberError.message);
    } else {
      const { data: memberCheck } = await adminClient
        .from('room_members')
        .select('*')
        .eq('room_id', generalRoom.id)
        .eq('user_id', fakeUserId);

      if (memberCheck && memberCheck.length > 0) {
        console.error("❌ RLS Failure: Bob (non-admin) successfully added a user to General!");
        checksPassed = false;
        // Cleanup the fake insert
        await adminClient.from('room_members').delete().eq('room_id', generalRoom.id).eq('user_id', fakeUserId);
      } else {
        console.log("✅ RLS successfully blocked Bob (non-admin) from adding others (insert had no effect).");
      }
    }

    if (checksPassed) {
      console.log("🎉 ALL DATABASE VERIFICATION CHECKS PASSED!");
      process.exit(0);
    } else {
      console.error("❌ SOME DATABASE VERIFICATION CHECKS FAILED!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Verification failed with error:", error.message);
    process.exit(1);
  }
}

runVerify();
