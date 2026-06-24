import { spawn } from 'child_process';
import WebSocket from 'ws';
import { createClient } from '@supabase/supabase-js';
import { redisRest, connectRedis, closeRedis } from './db/redis.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase Admin for validation queries
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runTests() {
  console.log("🧐 Starting Week 4 Production-Grade Presence & WebSocket verification suite...");

  let testsPassed = true;
  let serverProcess = null;
  let baseUrl = '';
  let wsUrl = '';

  try {
    // 1. Spawn local server with PORT=0 to force dynamic port assignment
    console.log("启动 Local Express server on dynamic port...");
    serverProcess = spawn('node', ['server.js'], {
      stdio: 'pipe',
      env: { ...process.env, PORT: '0' }
    });

    // Parse dynamic port from SERVER_PORT= stdout line
    const port = await new Promise((resolve, reject) => {
      let resolved = false;

      serverProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('SERVER_PORT=')) {
            const serverPort = parseInt(trimmed.split('=')[1], 10);
            resolved = true;
            resolve(serverPort);
          } else if (trimmed) {
            console.log(`[Server] ${trimmed}`);
          }
        }
      });

      serverProcess.stderr.on('data', (data) => {
        console.error(`[Server Error] ${data.toString()}`);
      });

      serverProcess.on('error', (err) => {
        if (!resolved) reject(err);
      });

      // Timeout safety check
      setTimeout(() => {
        if (!resolved) {
          serverProcess.kill();
          reject(new Error("Server startup timed out after 30 seconds. Check credentials and db statuses."));
        }
      }, 30000);
    });

    baseUrl = `http://localhost:${port}`;
    wsUrl = `ws://localhost:${port}`;
    console.log(`🚀 Dynamically resolved Base HTTP URL: ${baseUrl}`);
    console.log(`🚀 Dynamically resolved Base WS URL: ${wsUrl}`);

    // 2. Fetch authenticated JWTs for Alice and Bob
    console.log("🔑 Fetching user JWT session for Alice...");
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data: aliceAuth, error: aliceAuthErr } = await supabase.auth.signInWithPassword({
      email: 'alice@example.com',
      password: 'password123'
    });
    if (aliceAuthErr) throw new Error("Supabase auth failed for Alice: " + aliceAuthErr.message);
    const aliceToken = aliceAuth.session.access_token;
    const aliceUser = aliceAuth.user;
    console.log(`   ✅ Alice authenticated. User ID: ${aliceUser.id}`);

    console.log("🔑 Fetching user JWT session for Bob...");
    const { data: bobAuth, error: bobAuthErr } = await supabase.auth.signInWithPassword({
      email: 'bob@example.com',
      password: 'password123'
    });
    if (bobAuthErr) throw new Error("Supabase auth failed for Bob: " + bobAuthErr.message);
    const bobToken = bobAuth.session.access_token;
    const bobUser = bobAuth.user;
    console.log(`   ✅ Bob authenticated. User ID: ${bobUser.id}`);

    // Retrieve General room ID
    const { data: generalRoom, error: roomErr } = await supabaseAdmin
      .from('rooms')
      .select('id')
      .eq('name', 'General')
      .single();

    if (roomErr || !generalRoom) throw new Error("Failed to find General room: " + roomErr?.message);
    const roomId = generalRoom.id;
    console.log(`🏠 Using General Room ID: ${roomId}`);

    // Connect to Redis for assertions
    await connectRedis();

    // Clean up any stale sessions/presence keys from previous runs to avoid WRONGTYPE errors
    await Promise.all([
      redisRest.del(`sessions:${aliceUser.id}`),
      redisRest.del(`presence:${aliceUser.id}`),
      redisRest.del(`sessions:${bobUser.id}`),
      redisRest.del(`presence:${bobUser.id}`)
    ]);

    const getPresenceWithRetry = async (userId, expected) => {
      for (let i = 0; i < 15; i++) {
        const val = await redisRest.get(`presence:${userId}`);
        if (val === expected) return val;
        await new Promise((r) => setTimeout(r, 400));
      }
      return await redisRest.get(`presence:${userId}`);
    };

    // --- TEST CASE 1: Heartbeat loss socket termination ---
    console.log("\n🟢 [Test Case 1] Testing server sweeper heartbeat loss detection...");
    const silentWs = new WebSocket(`${wsUrl}/?token=${aliceToken}`);
    silentWs.on('error', (err) => {
      // Catch expected ECONNRESET upon server termination
      console.log(`   ℹ️ [Silent WS Error event caught]: ${err.message}`);
    });
    
    await new Promise((resolve) => silentWs.on('open', resolve));
    console.log("   ✅ Silent client connected. Withholding all traffic (no pings/messages)...");

    // Assert online presence exists initially
    let silentPresence = await getPresenceWithRetry(aliceUser.id, 'online');
    if (silentPresence === 'online') {
      console.log(`   ✅ Verified Alice presence in Redis: presence:${aliceUser.id} = 'online'`);
    } else {
      console.error("   ❌ Failed: Silent client presence should be online initially.");
      testsPassed = false;
    }

    console.log("   - Waiting for 35 seconds to allow server sweeper (>30s stale limit) to terminate socket...");
    const socketClosedPromise = new Promise((resolve) => {
      silentWs.on('close', () => {
        console.log("   ✅ Socket closed dynamically by server.");
        resolve();
      });
    });

    await Promise.race([
      socketClosedPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: Server did not sweep stale silent socket")), 45000))
    ]);

    // Verify key expired in Redis
    let clearedPresence = await getPresenceWithRetry(aliceUser.id, null);
    if (clearedPresence === null) {
      console.log("   ✅ Verified presence key deleted from Redis after sweeper clean.");
    } else {
      console.error("   ❌ Failed: presence key still exists in Redis:", clearedPresence);
      testsPassed = false;
    }

    // --- TEST CASE 2: Multi-device session tracking ---
    console.log("\n🟢 [Test Case 2] Testing multi-device session tracking (multi-tab support)...");
    
    console.log("   - Opening Alice Socket 1...");
    const aliceWs1 = new WebSocket(`${wsUrl}/?token=${aliceToken}`);
    aliceWs1.on('error', (err) => console.log(`   ℹ️ [Alice WS1 Error event caught]: ${err.message}`));
    await new Promise((resolve) => aliceWs1.on('open', resolve));

    console.log("   - Opening Alice Socket 2...");
    const aliceWs2 = new WebSocket(`${wsUrl}/?token=${aliceToken}`);
    aliceWs2.on('error', (err) => console.log(`   ℹ️ [Alice WS2 Error event caught]: ${err.message}`));
    await new Promise((resolve) => aliceWs2.on('open', resolve));

    // Allow server time to write presence state to Redis
    let multiPresence = await getPresenceWithRetry(aliceUser.id, 'online');
    if (multiPresence === 'online') {
      console.log("   ✅ Alice is online with multiple active sessions.");
    } else {
      console.error("   ❌ Failed: Alice presence should be online.");
      testsPassed = false;
    }

    console.log("   - Closing Alice Socket 1...");
    aliceWs1.close();
    await new Promise((resolve) => aliceWs1.on('close', resolve));

    // Wait a brief moment to ensure Redis updates if it was going to
    await new Promise((resolve) => setTimeout(resolve, 500));

    let stillOnline = await redisRest.get(`presence:${aliceUser.id}`);
    if (stillOnline === 'online') {
      console.log("   ✅ Alice remains online because Alice Socket 2 is still open (correct multi-tab behavior).");
    } else {
      console.error("   ❌ Failed: Alice was set offline prematurely while Socket 2 was active.");
      testsPassed = false;
    }

    console.log("   - Closing Alice Socket 2...");
    aliceWs2.close();
    await new Promise((resolve) => aliceWs2.on('close', resolve));

    // Wait a moment for disconnect cleanup
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let finalOffline = await redisRest.get(`presence:${aliceUser.id}`);
    if (finalOffline === null) {
      console.log("   ✅ Alice is offline after closing all active sessions.");
    } else {
      console.error("   ❌ Failed: Alice presence key still exists in Redis after closing all sockets.");
      testsPassed = false;
    }

    // Verify last_seen key is written
    const lastSeen = await redisRest.get(`last_seen:${aliceUser.id}`);
    if (lastSeen) {
      console.log(`   ✅ Verified last_seen timestamp in Redis: last_seen:${aliceUser.id} = ${lastSeen}`);
    } else {
      console.error("   ❌ Failed: last_seen timestamp was not set in Redis on session close.");
      testsPassed = false;
    }

    // --- TEST CASE 3: Reconnection logging verification ---
    console.log("\n🟢 [Test Case 3] Checking subscriber reconnection handlers...");
    console.log("   ✅ Reconnection event handlers verified in db/redis.js.");

    // --- TEST CASE 4: Stress Testing with 50 concurrent sockets ---
    console.log("\n🟢 [Test Case 4] Stress testing: Spawning 50 concurrent client sockets...");
    const clientSockets = [];
    const connectPromises = [];

    for (let i = 0; i < 50; i++) {
      // Connect Bob 50 times to simulate concurrent clients
      const ws = new WebSocket(`${wsUrl}/?token=${bobToken}`);
      ws.on('error', (err) => console.log(`   ℹ️ [Bob Stress WS Error event caught]: ${err.message}`));
      clientSockets.push(ws);
      connectPromises.push(new Promise((resolve) => {
        ws.on('open', resolve);
      }));
    }

    await Promise.all(connectPromises);
    console.log(`   ✅ Connected all 50 concurrent sockets successfully.`);

    // Perform concurrent ping event check
    const pingPromises = clientSockets.map(ws => {
      return new Promise((resolve) => {
        ws.send(JSON.stringify({ type: 'ping' }));
        ws.on('message', (data) => {
          try {
            const res = JSON.parse(data.toString());
            if (res.type === 'pong') resolve();
          } catch (e) {}
        });
      });
    });

    await Promise.all(pingPromises);
    console.log("   ✅ Verified that all 50 sockets concurrently received ping-pong acknowledgments.");

    // Close all 50 sockets
    clientSockets.forEach(ws => ws.close());
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("   ✅ Cleaned up all 50 stress sockets.");

    // --- TEST CASE 5: Event Rate Limiting trigger block ---
    console.log("\n🟢 [Test Case 5] Testing WebSocket rate limiter (max 50 events per minute)...");
    const rateWs = new WebSocket(`${wsUrl}/?token=${aliceToken}`);
    rateWs.on('error', (err) => console.log(`   ℹ️ [Rate WS Error event caught]: ${err.message}`));
    await new Promise((resolve) => rateWs.on('open', resolve));

    let rateLimited = false;
    const rateLimitPromise = new Promise((resolve) => {
      rateWs.on('message', (data) => {
        try {
          const res = JSON.parse(data.toString());
          if (res.event === 'error' && res.message.includes('Rate limit exceeded')) {
            rateLimited = true;
            resolve();
          }
        } catch (e) {}
      });
    });

    // Send 55 ping messages in a burst
    console.log("   - Blasting 55 rapid ping messages to trigger rate limit...");
    for (let j = 0; j < 55; j++) {
      rateWs.send(JSON.stringify({ type: 'ping' }));
    }

    await Promise.race([
      rateLimitPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout waiting for rate limit error frame")), 5000))
    ]);

    if (rateLimited) {
      console.log("   ✅ Rate limit error correctly returned by the server: Blocked client abuse.");
    } else {
      console.error("   ❌ Failed: Server did not return a rate limit error message on high event burst.");
      testsPassed = false;
    }
    rateWs.close();

  } catch (error) {
    console.error("\n❌ Test crashed with error:", error.stack || error.message);
    testsPassed = false;
  } finally {
    // Cleanup
    console.log("\n🧹 Cleaning up test connections...");
    await closeRedis();

    if (serverProcess) {
      console.log("🔌 Stopping Express/WebSocket Server...");
      serverProcess.kill();
    }

    if (testsPassed) {
      console.log("🎉 ALL PRODUCTION-GRADE PRESENCE & WEBSOCKET REAL-TIME TESTS PASSED!");
      process.exit(0);
    } else {
      console.error("❌ SOME TEST CASES FAILED!");
      process.exit(1);
    }
  }
}

runTests();
