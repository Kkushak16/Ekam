import pg from 'pg';
const { Client } = pg;

const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const user = 'postgres.ubvuwqoedkgbfbsvuxmk';
const database = 'postgres';
const password = 'MyNewPass123!';

async function debug() {
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
    console.log('Success');
    await client.end();
  } catch (err) {
    console.log('Error Type:', typeof err);
    console.log('Error Name:', err.name);
    console.log('Error Message:', err.message);
    console.log('Error Code:', err.code);
    console.log('Error Stack:', err.stack);
    console.log('Full Error Object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
}

debug();
