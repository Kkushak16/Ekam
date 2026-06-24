// scripts/generateVapidKeys.js
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

// Generate VAPID key pair
const { publicKey, privateKey } = webpush.generateVAPIDKeys();

// Paths to .env files (backend and frontend)
const backendEnvPath = path.resolve(process.cwd(), '.env');
const frontendEnvPath = path.resolve(process.cwd(), 'public', '.env'); // using public folder for demo

function appendKey(filePath, keyName, keyValue) {
  const line = `${keyName}=${keyValue}\n`;
  try {
    fs.appendFileSync(filePath, line, { encoding: 'utf8' });
    console.log(`✅ Appended ${keyName} to ${filePath}`);
  } catch (e) {
    console.error(`❌ Failed to write to ${filePath}:`, e.message);
  }
}

appendKey(backendEnvPath, 'VAPID_PUBLIC_KEY', publicKey);
appendKey(backendEnvPath, 'VAPID_PRIVATE_KEY', privateKey);
appendKey(frontendEnvPath, 'VAPID_PUBLIC_KEY', publicKey);

console.log('Generated VAPID keys:');
console.log('Public:', publicKey);
console.log('Private:', privateKey);
