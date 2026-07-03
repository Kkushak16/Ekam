import pg from 'pg';
const { Client } = pg;

const host = 'aws-0-ap-south-1.pooler.supabase.com';
const user = 'postgres.ubvuwqoedkgbfbsvuxmk';
const database = 'postgres';
const password = 'MyNewPass123!';

async function test() {
  console.log(`Connecting to ${host} with user ${user}...`);
  const client = new Client({
    host,
    port: 6543,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    console.log(`✅ SUCCESS connecting via pooler!`);
    
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
    console.error(`Failed to connect via pooler:`, err.message);
  }
}

test();
