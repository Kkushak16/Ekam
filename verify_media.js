import { spawn } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { connectToDatabase, closeDatabaseConnection } from './db/mongodb.js';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary for cleanup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function runTests() {
  console.log("🧐 Starting Week 3 Media & Message Sync verification suite...");
  
  let testsPassed = true;
  let serverProcess = null;
  let uploadPublicId = null;
  let baseUrl = '';

  try {
    // 1. Spawn local server with PORT=0 to force dynamic port assignment
    console.log("启动 Local Express server on dynamic port...");
    serverProcess = spawn('node', ['server.js'], { 
      stdio: 'pipe',
      env: { ...process.env, PORT: '0' }
    });

    // Parse dynamic port from SERVER_PORT= stdout line
    await new Promise((resolve, reject) => {
      let resolved = false;

      serverProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('SERVER_PORT=')) {
            const port = parseInt(trimmed.split('=')[1], 10);
            baseUrl = `http://localhost:${port}`;
            console.log(`🚀 Dynamically resolved Base URL: ${baseUrl}`);
            resolved = true;
            resolve();
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
          reject(new Error("Server startup timed out after 10 seconds. Check credentials and db statuses."));
        }
      }, 10000);
    });

    // 2. Fetch authenticated JWT for Alice
    console.log("🔑 Fetching user JWT session for Alice...");
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'alice@example.com',
      password: 'password123'
    });

    if (authError) throw new Error("Supabase auth failed for Alice: " + authError.message);
    const token = authData.session.access_token;
    console.log("   ✅ Valid JWT retrieved.");

    // --- HAPPY PATH TESTS ---

    // Happy Path A: File Upload (MIME and size validation compliance)
    console.log("📸 [Happy Path A] Uploading valid 1-pixel PNG buffer to Cloudinary...");
    
    // Use native global FormData and Blob with a valid 1-pixel PNG base64 to satisfy Cloudinary type detection
    const form = new globalThis.FormData();
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const mockImageBuffer = Buffer.from(pngBase64, 'base64');
    const mockImageBlob = new Blob([mockImageBuffer], { type: 'image/png' });
    form.append('file', mockImageBlob, 'test_avatar.png');

    let uploadedUrl = null;
    let uploadedMime = null;

    const uploadRes = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });

    if (uploadRes.status === 200) {
      const metadata = await uploadRes.json();
      console.log("   ✅ Upload succeeded. Rich metadata response:", metadata);
      
      if (metadata.secure_url && metadata.public_id && metadata.resource_type === 'image') {
        uploadPublicId = metadata.public_id; // track for cleanup
        uploadedUrl = metadata.secure_url;
        uploadedMime = 'image/png';
        console.log("   ✅ Cloudinary fields check passed.");
      } else {
        console.error("   ❌ Missing expected metadata parameters in response:", metadata);
        testsPassed = false;
      }
    } else {
      console.error(`   ❌ Upload failed with status ${uploadRes.status}:`, await uploadRes.text());
      testsPassed = false;
    }

    if (!uploadedUrl) {
      throw new Error("Unable to proceed: Upload failed, cannot chain URL into Happy Path B.");
    }

    // Happy Path B: Insert Message with Media (Chained URL & 5-step sync sequence)
    console.log("💬 [Happy Path B] Sending message with actual uploaded Cloudinary URL (5-step sync check)...");
    
    // Find a valid room ID from Supabase
    const { data: rooms, error: roomError } = await supabase.from('rooms').select('id').limit(1);
    if (roomError || rooms.length === 0) throw new Error("Could not find a valid room in Supabase. Run seed first.");
    const validRoomId = rooms[0].id;

    // Chain the actual upload URL from Happy Path A
    const messagePayload = {
      room_id: validRoomId,
      body: "Check out this image I dynamically uploaded to Cloudinary!",
      media_url: uploadedUrl,
      media_type: uploadedMime
    };

    const msgRes = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(messagePayload)
    });

    if (msgRes.status === 201) {
      const msgDoc = await msgRes.json();
      console.log("   ✅ Message creation succeeded. Final linked document:", msgDoc);
      
      if (msgDoc._id && msgDoc.supabase_id) {
        console.log(`   ✅ 5-Step write verification passed: Mongo ID ${msgDoc._id} linked to Supabase UUID ${msgDoc.supabase_id}`);
      } else {
        console.error("   ❌ Linked IDs check failed. Supabase UUID not returned:", msgDoc);
        testsPassed = false;
      }
    } else {
      console.error(`   ❌ Message creation failed with status ${msgRes.status}:`, await msgRes.text());
      testsPassed = false;
    }

    // Happy Path C: Compensating Delete Rollback Check
    console.log("⚠️ [Happy Path C] Testing database consistency rollback on Supabase insert failure...");
    
    // Send a structurally valid room ID UUID that does NOT exist in the Supabase database.
    // This succeeds in MongoDB (no FK checks) but FAILS in Supabase (foreign key check on rooms), triggering rollback.
    const invalidRoomId = "bc2875a6-7dec-11d0-a765-00a0c91e6bf6";
    const rollbackPayload = {
      room_id: invalidRoomId,
      body: "This message should be rolled back and deleted from MongoDB.",
    };

    const rollbackRes = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(rollbackPayload)
    });

    if (rollbackRes.status === 500) {
      const errorDetails = await rollbackRes.json();
      console.log("   ✅ Server returned expected 500 error:", errorDetails.error);

      // Now query MongoDB to verify that no orphaned message exists
      const { db } = await connectToDatabase();
      const orphanedMessage = await db.collection('messages').findOne({ room_id: invalidRoomId });
      
      if (orphanedMessage === null) {
        console.log("   ✅ Compensating Rollback Action Verified: Orphaned MongoDB document was successfully deleted.");
      } else {
        console.error("   ❌ Rollback failed! Orphaned message document still exists in MongoDB:", orphanedMessage);
        testsPassed = false;
      }
    } else {
      console.error(`   ❌ Server did not return 500. Status: ${rollbackRes.status}`, await rollbackRes.text());
      testsPassed = false;
    }

    // --- FAILURE ADVERSARIAL TESTS ---
    console.log("🔒 Running failure path adversarial checks...");

    // Failure 1: Upload file exceeding size limit (Images cap at 10MB)
    console.log("   - [Failure 1] Uploading 11MB image...");
    const overLimitForm = new globalThis.FormData();
    const largeImageBuffer = Buffer.alloc(11 * 1024 * 1024, 'IMAGE_DATA');
    const largeImageBlob = new Blob([largeImageBuffer], { type: 'image/png' });
    overLimitForm.append('file', largeImageBlob, 'heavy.png');

    const failUploadRes1 = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: overLimitForm
    });

    if (failUploadRes1.status === 400) {
      console.log("   ✅ Blocked image exceeding size limit (400 Bad Request):", (await failUploadRes1.json()).error);
    } else {
      console.error(`   ❌ Failed: Server accepted or returned incorrect status: ${failUploadRes1.status}`);
      testsPassed = false;
    }

    // Failure 2: Upload disallowed MIME type (.txt or .exe)
    console.log("   - [Failure 2] Uploading invalid text file type...");
    const disallowedForm = new globalThis.FormData();
    const textBlob = new Blob([Buffer.from('DISALLOWED_DATA')], { type: 'application/octet-stream' });
    disallowedForm.append('file', textBlob, 'virus.exe');

    const failUploadRes2 = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: disallowedForm
    });

    if (failUploadRes2.status === 400) {
      console.log("   ✅ Blocked invalid file extension (400 Bad Request):", (await failUploadRes2.json()).error);
    } else {
      console.error(`   ❌ Failed: Server accepted or returned incorrect status: ${failUploadRes2.status}`);
      testsPassed = false;
    }

    // Failure 3: Send message with missing room_id parameter
    console.log("   - [Failure 3] Creating message without room_id...");
    const failMsgRes1 = await fetch(`${baseUrl}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ body: "Missing room_id payload" })
    });

    if (failMsgRes1.status === 400) {
      console.log("   ✅ Blocked missing parameters (400 Bad Request):", (await failMsgRes1.json()).error);
    } else {
      console.error(`   ❌ Failed: Server accepted or returned incorrect status: ${failMsgRes1.status}`);
      testsPassed = false;
    }

    // Failure 4: Send message with invalid expired/unauthorized JWT token
    console.log("   - [Failure 4] Uploading using expired/unauthorized credentials...");
    const failUploadRes4 = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer invalid_expired_jwt_token`
      },
      body: form
    });

    if (failUploadRes4.status === 401) {
      console.log("   ✅ Blocked unauthorized request (401 Unauthorized):", (await failUploadRes4.json()).error);
    } else {
      console.error(`   ❌ Failed: Server accepted or returned incorrect status: ${failUploadRes4.status}`);
      testsPassed = false;
    }

  } catch (error) {
    console.error("❌ Test crashed with error:", error.stack);
    testsPassed = false;
  } finally {
    // 3. Cleanup Cloudinary uploads
    if (uploadPublicId) {
      console.log(`🧹 Cleaning up test upload from Cloudinary (public_id: ${uploadPublicId})...`);
      try {
        const destroyResult = await cloudinary.uploader.destroy(uploadPublicId);
        console.log("   ✅ Cloudinary clean:", destroyResult);
      } catch (err) {
        console.error("   ❌ Failed to clean up Cloudinary resource:", err.message);
      }
    }

    // 4. Terminate Express server
    if (serverProcess) {
      console.log("🔌 Stopping Express HTTP server...");
      serverProcess.kill();
    }

    // 5. Close DB connections
    await closeDatabaseConnection();

    if (testsPassed) {
      console.log("🎉 ALL MEDIA INTEGRATION AND MESSAGE SYNC TESTS PASSED!");
      process.exit(0);
    } else {
      console.error("❌ SOME TEST CASES FAILED!");
      process.exit(1);
    }
  }
}

runTests();
