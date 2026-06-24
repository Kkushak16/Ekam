import { 
  connectToDatabase, 
  closeDatabaseConnection, 
  initializeDatabase, 
  insertMessage, 
  updateMessageStatus,
  fetchLast50, 
  fetchPageBeforeCursor 
} from './db/mongodb.js';
import dotenv from 'dotenv';

dotenv.config();

const TEST_ROOM_ID = "99999999-9999-9999-9999-999999999999";
const SENDER_ID = "88888888-8888-8888-8888-888888888888";

async function runVerify() {
  console.log("🧐 Starting NoSQL message store verification...");
  let testsPassed = true;

  const { db } = await connectToDatabase();
  await initializeDatabase();

  try {
    // 1. Clean up old test data
    console.log("🧹 Clearing previous test data...");
    await db.collection('messages').deleteMany({ room_id: { $in: [TEST_ROOM_ID, "empty-room-uuid", "partial-room-uuid"] } });

    // 2. Index Presence Check
    console.log("🔍 Checking index presence...");
    const indexes = await db.collection('messages').indexes();
    const compoundIndexExists = indexes.some(idx => {
      return idx.key && idx.key.room_id === 1 && idx.key._id === -1;
    });

    if (compoundIndexExists) {
      console.log("✅ Compound index { room_id: 1, _id: -1 } verified on messages collection.");
    } else {
      console.error("❌ Compound index { room_id: 1, _id: -1 } is missing! Found indexes:", indexes);
      testsPassed = false;
    }

    // 3. Schema Schema Validation check ($jsonSchema enforcement)
    console.log("🔍 Checking schema validation rules...");
    try {
      // Missing required 'body' field
      await db.collection('messages').insertOne({
        _id: "01H2V7Y5W48V7R49C4X9K5Y5W1",
        room_id: TEST_ROOM_ID,
        sender_id: SENDER_ID,
        ts: new Date()
        // 'body' is missing, which violates the schema validation rules
      });
      console.error("❌ Schema Validation Failure: Bypassed required fields checks!");
      testsPassed = false;
    } catch (err) {
      if (err.code === 121 || err.message.includes('Document failed validation')) {
        console.log("✅ Schema Validation working: blocked invalid insert as expected.");
      } else {
        console.error("❌ Schema Validation failed with unexpected error:", err.message);
        testsPassed = false;
      }
    }

    // 4. NoSQL Injection Check
    console.log("🔒 Checking NoSQL injection defense...");
    
    // Test case: Attacking room_id parameter with a query operator object { $gt: "" }
    const maliciousInput = { $gt: "" };
    
    try {
      await fetchLast50(maliciousInput);
      console.error("❌ NoSQL Injection Failure: Helper function accepted object input!");
      testsPassed = false;
    } catch (err) {
      if (err.message.includes("NoSQL Injection Defense")) {
        console.log("✅ NoSQL Injection blocked successfully by parameter validation layer.");
      } else {
        console.error("❌ Parameter defense threw unexpected error:", err.message);
        testsPassed = false;
      }
    }

    // 5. Pagination Edge Cases
    console.log("🔍 Running pagination edge cases...");

    // Edge Case A: Empty room query
    const emptyRoomResult = await fetchLast50("empty-room-uuid");
    if (emptyRoomResult.messages.length === 0 && emptyRoomResult.nextCursor === null) {
      console.log("✅ Edge Case A (Empty Room) passed. Messages: [], nextCursor: null.");
    } else {
      console.error("❌ Edge Case A failed:", emptyRoomResult);
      testsPassed = false;
    }

    // Edge Case B: Room with fewer messages than limit (partial page)
    console.log("   Seeding 5 messages for partial room...");
    const msgIds = [];
    for (let i = 0; i < 5; i++) {
      const msg = await insertMessage({
        room_id: "partial-room-uuid",
        sender_id: SENDER_ID,
        body: `Partial Room Msg #${i}`,
        ts: new Date(Date.now() - (5 - i) * 60000)
      });
      msgIds.push(msg._id);
    }

    // Fetch Last 50 (should return 5)
    const partialResult = await fetchLast50("partial-room-uuid");
    if (partialResult.messages.length === 5) {
      console.log(`✅ Edge Case B (Partial Page) - Retrieved all 5 messages.`);
      
      // Chronological check (first element should be Msg #0, last should be Msg #4)
      if (partialResult.messages[0].body === "Partial Room Msg #0" && partialResult.messages[4].body === "Partial Room Msg #4") {
        console.log("✅ Chronological message sorting verified (oldest first).");
      } else {
        console.error("❌ Messages sorted incorrectly:", partialResult.messages.map(m => m.body));
        testsPassed = false;
      }

      // Cursor check: nextCursor should equal the oldest message ID (Msg #0)
      if (partialResult.nextCursor === msgIds[0]) {
        console.log("✅ nextCursor correctly maps to the oldest message ID in the set.");
      } else {
        console.error(`❌ nextCursor mismatch! Expected ${msgIds[0]} but got ${partialResult.nextCursor}`);
        testsPassed = false;
      }
    } else {
      console.error(`❌ Expected 5 messages, but got ${partialResult.messages.length}`);
      testsPassed = false;
    }

    // Edge Case C: Query page before oldest cursor (end of page)
    const oldestCursor = partialResult.nextCursor; // Msg #0 ID
    const endOfPageResult = await fetchPageBeforeCursor("partial-room-uuid", oldestCursor, 10);
    
    if (endOfPageResult.messages.length === 0 && endOfPageResult.nextCursor === null) {
      console.log("✅ Edge Case C (Query older than oldest cursor) passed. Messages: [], nextCursor: null.");
    } else {
      console.error("❌ Edge Case C failed (returned data beyond oldest message):", endOfPageResult);
      testsPassed = false;
    }

    // 6. Test updateMessageStatus Helper
    console.log("🔍 Checking updateMessageStatus helper...");
    const targetMsgId = msgIds[4]; // Msg #4 ID
    const statusUpdateOk = await updateMessageStatus(targetMsgId, 'delivered');
    
    if (statusUpdateOk) {
      const verifyDoc = await db.collection('messages').findOne({ _id: targetMsgId });
      if (verifyDoc && verifyDoc.status === 'delivered') {
        console.log("✅ updateMessageStatus updated the status receipt to 'delivered'.");
      } else {
        console.error("❌ updateMessageStatus returned true but status remains unchanged:", verifyDoc);
        testsPassed = false;
      }
    } else {
      console.error("❌ updateMessageStatus reported update failed.");
      testsPassed = false;
    }

    // 7. Test supabase_id integration mapping
    console.log("🔍 Checking supabase_id integration mapping...");
    
    // Assert insertion without supabase_id (should succeed since it is optional/nullable)
    const msgWithoutSupabaseId = await insertMessage({
      room_id: TEST_ROOM_ID,
      sender_id: SENDER_ID,
      body: "Testing message without supabase_id link"
    });
    if (msgWithoutSupabaseId && msgWithoutSupabaseId.supabase_id === undefined) {
      console.log("✅ Verified insertion without supabase_id succeeds (optional validation check passed).");
    } else {
      console.error("❌ Insertion without supabase_id failed or returned unexpected schema:", msgWithoutSupabaseId);
      testsPassed = false;
    }

    // Assert insertion with supabase_id
    const fakeSupabaseId = "f81d4fae-7dec-11d0-a765-00a0c91e6bf6";
    const mappedMsg = await insertMessage({
      room_id: TEST_ROOM_ID,
      sender_id: SENDER_ID,
      body: "Testing mapped supabase message id",
      supabase_id: fakeSupabaseId
    });

    const verifyMappedDoc = await db.collection('messages').findOne({ _id: mappedMsg._id });
    if (verifyMappedDoc && verifyMappedDoc.supabase_id === fakeSupabaseId) {
      console.log("✅ supabase_id integration mapping verified successfully.");
    } else {
      console.error("❌ Mapped supabase_id check failed:", verifyMappedDoc);
      testsPassed = false;
    }

    // Cleanup tests before exit
    console.log("🧹 Cleaning up verification test records...");
    await db.collection('messages').deleteMany({ room_id: { $in: [TEST_ROOM_ID, "empty-room-uuid", "partial-room-uuid"] } });

    if (testsPassed) {
      console.log("🎉 ALL NOSQL MESSAGE STORE TESTS PASSED!");
      process.exit(0);
    } else {
      console.error("❌ SOME NOSQL MESSAGE STORE TESTS FAILED!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Verification script crashed with error:", error.stack);
    process.exit(1);
  } finally {
    console.log("🔌 Closing connection...");
    await closeDatabaseConnection();
  }
}

runVerify();
