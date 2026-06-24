import { io } from 'socket.io-client';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

(async () => {
  const testEmail = 'fixedtest@gmail.com'; 
  const testPassword = 'TestPass123!';
  
  console.log(`🚀 Attempting login for static test account: ${testEmail}`);

  // 1. Log in via your backend server on port 3001
  const loginRes = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });

  if (!loginRes.ok) {
    const err = await loginRes.text();
    console.error('❌ Login error:', err);
    process.exit(1);
  }

  const loginData = await loginRes.json();
  console.log('🔍 Debug: Raw Login Response Payload:', loginData);

  // Auto-detect and extract the string regardless of key naming style
  const token = loginData.token || loginData.accessToken || loginData.access_token;

  if (!token) {
    console.error('❌ Key Mismatch: The server response does not contain token, accessToken, or access_token.');
    process.exit(1);
  }
  console.log('✅ Token successfully extracted from payload!');

  // 2. Connect Socket.IO client with verified token
  console.log('🔌 Connecting to WebSocket Gateway...');
  const socket = io('http://localhost:3001', {
    auth: { token },
    reconnectionAttempts: 2,
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connect error:', err.message);
    process.exit(1);
  });

  socket.on('connect', async () => {
    console.log('    Socket client successfully authenticated and online!');
    
    const roomId = `room_${randomUUID()}`;
    socket.emit('join_room', { roomId });
    console.log(`🏠 Joined virtual chatroom: ${roomId}`);

    const message = { 
      room_id: roomId, 
      body: 'Hello from the end-to-end test client!', 
      media_url: null, 
      media_type: null 
    };
    socket.emit('send_message', message);
    console.log('✉️ Test message dispatched to cluster');

    setTimeout(() => {
      console.log('🏁 End-to-end testing loop finished perfectly. Closing pipelines.');
      socket.disconnect();
      process.exit(0);
    }, 1500);
  });
})();