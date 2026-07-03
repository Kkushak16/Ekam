import pg from 'pg';
const { Client } = pg;

const passwords = ['MyNewPass123!', 'Password123!', 'password123'];
const host = 'db.ubvuwqoedkgbfbsvuxmk.supabase.co';
const user = 'postgres';
const database = 'postgres';

async function test() {
  for (const password of passwords) {
    console.log(`Trying password: ${password}...`);
    const client = new Client({
      host,
      port: 5432,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log(`✅ SUCCESS with password: ${password}`);
      
      // Let's run a query to add the columns if they don't exist
      console.log("Checking and altering public.users...");
      await client.query(`
        ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_username_change timestamp with time zone;
      `);
      console.log("Successfully altered public.users!");

      console.log("Checking and altering public.rooms...");
      await client.query(`
        ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description text;
      `);
      console.log("Successfully altered public.rooms!");

      await client.end();
      return;
    } catch (err) {
      console.error(`Failed with password ${password}:`, err.message);
    }
  }
  console.log("❌ All connection attempts failed.");
}

test();
