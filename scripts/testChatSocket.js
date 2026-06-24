import { io } from 'socket.io-client';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Defaulting to 3001 based on your server configurations
const API_URL = process.env.API_URL || 'http://localhost:3001';
const WS_URL = process.env.WS_URL || 'http://localhost:3001';

// 💡 TIP: Update these credentials to match a real user account in your database if auth fails!
const TEST_USER = {
  email: 'devuser@ekam.com',
  password: 'Password123!'
};
async function runSocketTest() {
  console.log('🔐 Step 1: Authenticating to obtain valid JWT...');
  let token;
  
  // Try authenticating across the most common endpoint structures dynamically
  const potentialEndpoints = [
    `${API_URL}/api/auth/login`,
    `${API_URL}/auth/login`,
    `${API_URL}/api/v1/auth/login`
  ];

  for (const url of potentialEndpoints) {
    try {
      console.log(`Trying auth endpoint: ${url}`);
      const authResponse = await axios.post(url, TEST_USER);
      if (authResponse.status === 200 || authResponse.status === 201) {
        token = authResponse.data.accessToken || authResponse.data.token || authResponse.data.data?.session?.access_token;
        break; 
      }
    } catch (err) {
      // If it's a 404, continue to the next variation. 
      // If it's a 400/401, the route is correct but the account doesn't exist yet.
      if (err.response && err.response.status !== 404) {
        console.log(`\n📍 Found the correct route (${url}), but server rejected credentials.`);
        console.error(`Status: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        console.log(`\n💡 Fix: Open your database/app dashboard and change the TEST_USER object at the top of this script to match a real registered user.`);
        process.exit(1);
      }
    }
  }

  if (!token) {
    console.error('❌ All authentication endpoints returned 404. Please check your server.js to find where your auth router is mounted.');
    process.exit(1);
  }

  console.log('✅ JWT obtained successfully.');

  console.log('\n🔌 Step 2: Initializing WebSocket connection with JWT authorization...');
  
  const socket = io(WS_URL, {
    auth: { token: token },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log(`✅ Connected to WebSocket Server! Socket ID: ${socket.id}`);
    
    console.log('\n⌨️ Step 3: Emitting "typing" state event...');
    socket.emit('typing', { roomId: 'global-test-room', isTyping: true });
  });

  // Listen for typing broadcasts (server emits 'typing.changed')
  socket.on('typing.changed', (data) => {
    console.log('🔔 [Broadcast] typing.changed received:', data);
  });

  // Listen for presence snapshots (sent on connection) and updates
  socket.on('presence.snapshot', (data) => {
    console.log('👥 [Snapshot] presence snapshot:', data);
  });
  socket.on('presence.changed', (data) => {
    console.log('👥 [Update] presence changed:', data);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ WebSocket Connection Error:', err.message);
    socket.close();
    process.exit(1);
  });

  socket.on('disconnect', (reason) => {
    console.log(`⚠️ Socket disconnected: ${reason}`);
  });

  setTimeout(() => {
    console.log('\n🏁 Test window complete. Disconnecting...');
    socket.disconnect();
    process.exit(0);
  }, 8000);
}

runSocketTest();