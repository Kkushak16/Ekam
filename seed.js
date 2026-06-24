import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Strict environment validation
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const v of requiredEnvVars) {
  if (!process.env[v]) {
    console.error(`❌ Environment Validation Error: '${v}' is not defined in your .env file.`);
    process.exit(1);
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSeed() {
  console.log("🚀 Starting database seed...");

  try {
    // 1. Clean up existing transactional data (rooms cascade deletes memberships, messages, and receipts)
    console.log("🧹 Cleaning up rooms and transactional data...");
    const { error: cleanupRoomsError } = await supabase
      .from('rooms')
      .delete()
      .neq('name', '___non_existent___');
    
    if (cleanupRoomsError) {
      throw new Error(`Clean rooms failed: ${cleanupRoomsError.message}`);
    }

    // 2. Upsert test users (stable UUIDs, no delete-then-recreate gap windows)
    console.log("👥 Upserting test users in Auth...");
    const usersToCreate = [
      {
        email: 'alice@example.com',
        password: 'password123',
        displayName: 'Alice Liddell',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice',
        status: 'online'
      },
      {
        email: 'bob@example.com',
        password: 'password123',
        displayName: 'Bob Builder',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bob',
        status: 'online'
      },
      {
        email: 'charlie@example.com',
        password: 'password123',
        displayName: 'Charlie Bucket',
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Charlie',
        status: 'away'
      }
    ];

    // Fetch existing users list
    const { data: { users: existingUsers }, error: listUsersError } = await supabase.auth.admin.listUsers();
    if (listUsersError) {
      throw new Error(`Failed to list existing auth users: ${listUsersError.message}`);
    }

    const emailsToKeep = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];
    for (const exUser of existingUsers) {
      if (!emailsToKeep.includes(exUser.email)) {
        console.log(`🧹 Deleting extra user from Auth and database: ${exUser.email} (${exUser.id})`);
        await supabase.auth.admin.deleteUser(exUser.id);
        await supabase.from('users').delete().eq('id', exUser.id);
      }
    }

    // Also clean up any lingering public.users rows that don't match our emails
    await supabase.from('users').delete().not('email', 'in', `(${emailsToKeep.map(e => `'${e}'`).join(',')})`);

    const createdUsers = {};

    for (const u of usersToCreate) {
      const existingUser = existingUsers.find(ex => ex.email === u.email);
      let userId;

      if (existingUser) {
        userId = existingUser.id;
        console.log(`ℹ️ User ${u.email} already exists (${userId}). Updating metadata...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            display_name: u.displayName,
            avatar_url: u.avatarUrl
          }
        });
        if (updateError) throw new Error(`Failed to update auth metadata for ${u.email}: ${updateError.message}`);
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: {
            display_name: u.displayName,
            avatar_url: u.avatarUrl
          }
        });
        if (error) throw new Error(`Failed to create auth user ${u.email}: ${error.message}`);
        userId = data.user.id;
        console.log(`✅ Created Auth User: ${u.email} (${userId})`);
      }

      // Upsert into public.users table to ensure synced and updated fields
      const { error: publicUserUpsertError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: u.email,
          display_name: u.displayName,
          avatar_url: u.avatarUrl,
          status: u.status
        });

      if (publicUserUpsertError) {
        throw new Error(`Failed to upsert public profile for ${u.email}: ${publicUserUpsertError.message}`);
      }

      createdUsers[u.email] = { id: userId, email: u.email, displayName: u.displayName };
    }

    // 3. Create rooms (group and dm types)
    console.log("🏠 Creating rooms...");
    const roomsToCreate = [
      { name: 'General', created_by: createdUsers['alice@example.com'].id, type: 'group' },
      { name: 'Random Chat', created_by: createdUsers['bob@example.com'].id, type: 'group' },
      { name: 'Tech Talk', created_by: createdUsers['charlie@example.com'].id, type: 'group' },
      { name: 'Alice & Bob DM', created_by: createdUsers['alice@example.com'].id, type: 'dm' }
    ];

    const { data: createdRooms, error: roomsError } = await supabase
      .from('rooms')
      .insert(roomsToCreate)
      .select();

    if (roomsError) {
      throw new Error(`Failed to create rooms: ${roomsError.message}`);
    }

    console.log(`✅ Created rooms: ${createdRooms.map(r => `${r.name} (${r.type})`).join(', ')}`);
    const roomMap = createdRooms.reduce((acc, r) => {
      acc[r.name] = r;
      return acc;
    }, {});

    // 4. Add users as members of rooms with designated roles
    console.log("🔗 Creating room memberships...");
    const memberships = [
      // General Room: Alice (admin), Bob (member), Charlie (member)
      { room_id: roomMap['General'].id, user_id: createdUsers['alice@example.com'].id, role: 'admin' },
      { room_id: roomMap['General'].id, user_id: createdUsers['bob@example.com'].id, role: 'member' },
      { room_id: roomMap['General'].id, user_id: createdUsers['charlie@example.com'].id, role: 'member' },

      // Random Chat Room: Bob (admin), Alice (member)
      { room_id: roomMap['Random Chat'].id, user_id: createdUsers['bob@example.com'].id, role: 'admin' },
      { room_id: roomMap['Random Chat'].id, user_id: createdUsers['alice@example.com'].id, role: 'member' },

      // Tech Talk Room: Charlie (admin), Alice (member)
      { room_id: roomMap['Tech Talk'].id, user_id: createdUsers['charlie@example.com'].id, role: 'admin' },
      { room_id: roomMap['Tech Talk'].id, user_id: createdUsers['alice@example.com'].id, role: 'member' },

      // DM Room: Alice (member), Bob (member)
      { room_id: roomMap['Alice & Bob DM'].id, user_id: createdUsers['alice@example.com'].id, role: 'member' },
      { room_id: roomMap['Alice & Bob DM'].id, user_id: createdUsers['bob@example.com'].id, role: 'member' }
    ];

    const { error: membersError } = await supabase
      .from('room_members')
      .insert(memberships);

    if (membersError) {
      throw new Error(`Failed to create room memberships: ${membersError.message}`);
    }
    console.log("✅ Created room memberships.");

    // 5. Seed test messages (with media example)
    console.log("💬 Seeding test messages...");
    const messagesToCreate = [
      {
        room_id: roomMap['General'].id,
        sender_id: createdUsers['alice@example.com'].id,
        content: "Welcome to General chat! Let's keep it friendly."
      },
      {
        room_id: roomMap['General'].id,
        sender_id: createdUsers['bob@example.com'].id,
        content: "Hey Alice, thanks for setting this up!"
      },
      {
        room_id: roomMap['General'].id,
        sender_id: createdUsers['charlie@example.com'].id,
        content: "Hello world! Ready for some discussion."
      },
      {
        room_id: roomMap['Tech Talk'].id,
        sender_id: createdUsers['charlie@example.com'].id,
        content: "Has anyone tried the new Supabase Realtime Presence engine?"
      },
      {
        room_id: roomMap['Alice & Bob DM'].id,
        sender_id: createdUsers['bob@example.com'].id,
        content: "Hey Alice, check out this blueprint image for the new dashboard!",
        media_url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
        media_type: "image/jpeg"
      }
    ];

    const { data: createdMessages, error: messagesError } = await supabase
      .from('messages')
      .insert(messagesToCreate)
      .select();

    if (messagesError) {
      throw new Error(`Failed to create test messages: ${messagesError.message}`);
    }
    console.log(`✅ Seeded ${createdMessages.length} messages.`);

    // 6. Seed message status receipts (read/delivered statuses)
    console.log("🧾 Seeding message status receipts...");
    const receiptsToCreate = [
      // General Msg 1 (Alice): Read by Bob and Charlie
      { message_id: createdMessages[0].id, user_id: createdUsers['bob@example.com'].id, status: 'read' },
      { message_id: createdMessages[0].id, user_id: createdUsers['charlie@example.com'].id, status: 'read' },

      // General Msg 2 (Bob): Read by Alice, Delivered to Charlie
      { message_id: createdMessages[1].id, user_id: createdUsers['alice@example.com'].id, status: 'read' },
      { message_id: createdMessages[1].id, user_id: createdUsers['charlie@example.com'].id, status: 'delivered' },

      // General Msg 3 (Charlie): Read by Alice, Delivered to Bob
      { message_id: createdMessages[2].id, user_id: createdUsers['alice@example.com'].id, status: 'read' },
      { message_id: createdMessages[2].id, user_id: createdUsers['bob@example.com'].id, status: 'delivered' },

      // Tech Talk Msg 4 (Charlie): Read by Alice
      { message_id: createdMessages[3].id, user_id: createdUsers['alice@example.com'].id, status: 'read' },

      // DM Msg 5 (Bob): Read by Alice
      { message_id: createdMessages[4].id, user_id: createdUsers['alice@example.com'].id, status: 'read' }
    ];

    const { error: receiptsError } = await supabase
      .from('message_status')
      .insert(receiptsToCreate);

    if (receiptsError) {
      throw new Error(`Failed to create message status receipts: ${receiptsError.message}`);
    }
    console.log("✅ Seeded message status receipts.");

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed with error:", error.message);
    process.exit(1);
  }
}

runSeed();
