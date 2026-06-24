import { exec } from 'child_process';
import { io } from 'socket.io-client';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

console.log('🚀 Starting integration test...');

// Start the server
const serverProcess = exec('node server.js', { cwd: 'd:\\Antigravity\\Ekam' });

serverProcess.stdout.on('data', (data) => {
  console.log(`[Server Stdout]: ${data.trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`[Server Stderr]: ${data.trim()}`);
});

// Wait for server to initialize
await new Promise(resolve => setTimeout(resolve, 15000));

try {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  console.log(`👤 Registering user ${testEmail}...`);
  const registerRes = await fetch('http://localhost:3001/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword, displayName: testName })
  });

  if (!registerRes.ok) {
    const errText = await registerRes.text();
    throw new Error(`Registration failed: ${errText}`);
  }

  const { accessToken } = await registerRes.json();
  console.log('✅ User registered successfully. Access Token retrieved.');

  // Connect socket
  console.log('🔌 Connecting to Socket.IO gateway...');
  const socket = io('http://localhost:3001', {
    auth: { token: accessToken },
    reconnectionAttempts: 2
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket Connection Error:', err.message);
    cleanupAndExit(1);
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected successfully.');

    const defaultRoomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
    console.log(`🏠 Joining default room: ${defaultRoomId}`);
    socket.emit('join_room', { roomId: defaultRoomId });

    // Listen for message_ack
    socket.on('message_ack', (ack) => {
      console.log('📩 Received message_ack:', ack);
      if (ack.success) {
        console.log('🎉 SUCCESS: send_message integration test passed perfectly!');
        cleanupAndExit(0);
      } else {
        console.error('❌ FAILURE: Message ack was unsuccessful.');
        cleanupAndExit(1);
      }
    });

    const clientMsgId = randomUUID();
    console.log(`✉️ Dispatching test message with clientMessageId: ${clientMsgId}`);
    socket.emit('send_message', {
      clientMessageId: clientMsgId,
      roomId: defaultRoomId,
      body: 'This is an integration test message via socket.io!'
    });
  });

} catch (err) {
  console.error('❌ Test failed with error:', err.message);
  cleanupAndExit(1);
}

function cleanupAndExit(code) {
  console.log('🧹 Cleaning up server process...');
  serverProcess.kill('SIGINT');
  process.exit(code);
}
