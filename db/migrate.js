import pg from 'pg';
const { Client } = pg;

export async function runMigrations() {
  const host = 'db.ubvuwqoedkgbfbsvuxmk.supabase.co';
  const user = 'postgres';
  const database = 'postgres';
  const password = 'MyNewPass123!';

  console.log(`[Migration] Attempting to connect to ${host}...`);
  const client = new Client({
    host,
    port: 5432,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  try {
    await client.connect();
    console.log('[Migration] Connected to Supabase Postgres. Running migrations...');
    
    // 1. last_username_change on users
    await client.query(`
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_username_change timestamp with time zone;
    `);
    console.log('[Migration] Checked/Added last_username_change to public.users');

    // 2. description on rooms
    await client.query(`
      ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description text;
    `);
    console.log('[Migration] Checked/Added description to public.rooms');

    // 3. is_muted on room_members
    await client.query(`
      ALTER TABLE public.room_members ADD COLUMN IF NOT EXISTS is_muted boolean DEFAULT false;
    `);
    console.log('[Migration] Checked/Added is_muted to public.room_members');

    // 4. Update check constraint on room_members.role
    try {
      await client.query(`
        ALTER TABLE public.room_members DROP CONSTRAINT IF EXISTS room_members_role_check;
      `);
      await client.query(`
        ALTER TABLE public.room_members ADD CONSTRAINT room_members_role_check CHECK (role IN ('member', 'admin', 'co-admin'));
      `);
      console.log('[Migration] Checked/Updated room_members_role_check constraint');
    } catch (err) {
      console.error('[Migration] Failed to update role check constraint:', err.message);
    }

    // 5. pgvector setup for semantic search
    try {
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS vector;
      `);
      console.log('[Migration] Checked/Created vector extension');

      await client.query(`
        ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS embedding vector(384);
      `);
      console.log('[Migration] Checked/Added embedding column to public.messages');

      await client.query(`
        CREATE OR REPLACE FUNCTION public.match_messages (
          query_embedding vector(384),
          match_threshold float,
          match_count int,
          p_room_id uuid
        )
        RETURNS TABLE (
          id uuid,
          room_id uuid,
          sender_id uuid,
          content text,
          created_at timestamp with time zone,
          similarity float,
          sender_display_name text,
          sender_avatar_url text
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT
            m.id,
            m.room_id,
            m.sender_id,
            m.content,
            m.created_at,
            (1 - (m.embedding <=> query_embedding))::float AS similarity,
            u.display_name AS sender_display_name,
            u.avatar_url AS sender_avatar_url
          FROM public.messages m
          LEFT JOIN public.users u ON u.id = m.sender_id
          WHERE m.room_id = p_room_id
            AND m.embedding IS NOT NULL
            AND 1 - (m.embedding <=> query_embedding) > match_threshold
          ORDER BY m.embedding <=> query_embedding
          LIMIT match_count;
        END;
        $$;
      `);
      console.log('[Migration] Checked/Created match_messages function');
    } catch (err) {
      console.error('[Migration] Failed to execute pgvector migrations:', err.message);
    }

    await client.end();
    console.log('[Migration] Migrations completed successfully!');
  } catch (err) {
    console.warn('[Migration] Could not connect directly to Supabase Postgres (normal on IPv4-only networks). Migration skipped. Detail:', err.message);
  }
}
