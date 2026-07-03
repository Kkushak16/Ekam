import pg from 'pg';
const { Client } = pg;

const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const user = 'postgres.ubvuwqoedkgbfbsvuxmk';
const database = 'postgres';
const password = 'MyNewPass123!';
const ports = [5432, 6543];

async function test() {
  for (const port of ports) {
    console.log(`Connecting to port: ${port}...`);
    const client = new Client({
      host,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    try {
      await client.connect();
      console.log(`✅ SUCCESS on port: ${port}`);
      await client.end();
      return;
    } catch (err) {
      console.error(`Error on port ${port}:`, err.message);
    }
  }
}

test();
