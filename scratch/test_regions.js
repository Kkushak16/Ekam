import pg from 'pg';
const { Client } = pg;

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-central-1',
  'sa-east-1',
  'ca-central-1'
];

async function checkRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const user = 'postgres.ubvuwqoedkgbfbsvuxmk';
  const database = 'postgres';
  const password = 'MyNewPass123!';

  console.log(`Checking region: ${region} (${host})...`);
  const client = new Client({
    host,
    port: 6543,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`\n🎉 SUCCESS! Project found in region: ${region}\n`);
    
    // Add columns
    await client.query(`
      ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_username_change timestamp with time zone;
    `);
    console.log("Successfully altered public.users!");

    await client.query(`
      ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS description text;
    `);
    console.log("Successfully altered public.rooms!");

    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('tenant')) {
      console.log(`Region ${region}: Tenant not found.`);
    } else {
      console.log(`Region ${region} failed with error:`, err.message);
    }
    return false;
  }
}

async function run() {
  for (const r of regions) {
    const ok = await checkRegion(r);
    if (ok) break;
  }
}

run();
