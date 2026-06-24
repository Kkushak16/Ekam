import { performance } from 'perf_hooks';
import { 
  connectToDatabase, 
  closeDatabaseConnection, 
  initializeDatabase, 
  insertMessage, 
  fetchPageBeforeCursor 
} from './db/mongodb.js';
import dotenv from 'dotenv';

dotenv.config();

// CLI Argument: --batch=500 (Defaults to 500 if not specified)
let batchSize = 500;
for (const arg of process.argv) {
  if (arg.startsWith('--batch=')) {
    const val = parseInt(arg.split('=')[1], 10);
    if (!isNaN(val) && val > 0) {
      batchSize = val;
    }
  }
}

const TOTAL_MESSAGES = 10000;
const READ_REQUESTS = 1000;
const BENCH_ROOM_ID = "00000000-0000-0000-0000-000000000000"; // Test room UUID
const SENDER_ID = "11111111-1111-1111-1111-111111111111";    // Test sender UUID

async function runBenchmark() {
  console.log(`🚀 Starting MongoDB Performance Benchmark...`);
  console.log(`⚙️ Configured Batch Size: ${batchSize}`);
  console.log(`🔗 Connecting to database...`);

  const { db } = await connectToDatabase();
  await initializeDatabase();

  try {
    // Clean up previous benchmark runs in this room
    console.log("🧹 Cleaning up old benchmark records...");
    await db.collection('messages').deleteMany({ room_id: BENCH_ROOM_ID });

    // --- WRITE BENCHMARK ---
    console.log(`📥 [Write Phase] Inserting ${TOTAL_MESSAGES} mock messages...`);
    const writeStart = performance.now();
    const insertedIds = [];

    for (let i = 0; i < TOTAL_MESSAGES; i += batchSize) {
      const batchPromises = [];
      const currentBatchSize = Math.min(batchSize, TOTAL_MESSAGES - i);

      for (let j = 0; j < currentBatchSize; j++) {
        const msgIndex = i + j;
        batchPromises.push(
          insertMessage({
            room_id: BENCH_ROOM_ID,
            sender_id: SENDER_ID,
            body: `Mock Benchmark Message #${msgIndex}`,
            media_url: msgIndex % 10 === 0 ? "https://example.com/media.png" : null,
            media_type: msgIndex % 10 === 0 ? "image/png" : null,
            status: "sent",
            ts: new Date(Date.now() - (TOTAL_MESSAGES - msgIndex) * 1000) // incrementally increasing timestamps
          })
        );
      }

      // Execute current batch concurrently
      const results = await Promise.all(batchPromises);
      insertedIds.push(...results.map(r => r._id));
      
      if ((i + currentBatchSize) % 2000 === 0 || (i + currentBatchSize) === TOTAL_MESSAGES) {
        console.log(`   Processed ${i + currentBatchSize} / ${TOTAL_MESSAGES} inserts...`);
      }
    }

    const writeEnd = performance.now();
    const writeDurationSec = (writeEnd - writeStart) / 1000;
    const writeThroughput = TOTAL_MESSAGES / writeDurationSec;

    console.log(`\n📊 Write Benchmark Results:`);
    console.log(`   - Total Messages Inserted: ${TOTAL_MESSAGES}`);
    console.log(`   - Time Taken: ${writeDurationSec.toFixed(2)} seconds`);
    console.log(`   - Throughput: ${writeThroughput.toFixed(2)} messages/second`);

    // --- READ BENCHMARK (Cursor-based Pagination) ---
    console.log(`\n📤 [Read Phase] Executing ${READ_REQUESTS} cursor pagination requests...`);
    const readLatencies = [];

    // Ensure we have enough message ids to pick from
    if (insertedIds.length === 0) {
      throw new Error("No messages were written, cannot run read benchmark.");
    }

    const readStart = performance.now();

    for (let r = 0; r < READ_REQUESTS; r++) {
      // Pick a random cursor ID from our inserted messages (excluding the first few to ensure results exist)
      const randomIndex = Math.floor(Math.random() * (insertedIds.length - 100)) + 50;
      const cursorId = insertedIds[randomIndex];

      const reqStart = performance.now();
      
      // Query older messages before cursorId
      const pageResult = await fetchPageBeforeCursor(BENCH_ROOM_ID, cursorId, 50);
      
      const reqEnd = performance.now();
      readLatencies.push(reqEnd - reqStart);

      if (pageResult.messages.length === 0) {
        console.warn(`⚠️ Warning: Read request #${r} returned 0 messages for cursor: ${cursorId}`);
      }

      if ((r + 1) % 200 === 0 || (r + 1) === READ_REQUESTS) {
        console.log(`   Processed ${r + 1} / ${READ_REQUESTS} page reads...`);
      }
    }

    const readEnd = performance.now();
    const totalReadDurationSec = (readEnd - readStart) / 1000;

    // Calculate Latency Percentiles
    readLatencies.sort((a, b) => a - b);
    const sum = readLatencies.reduce((a, b) => a + b, 0);
    const avgLatency = sum / READ_REQUESTS;
    const p95Latency = readLatencies[Math.floor(READ_REQUESTS * 0.95) - 1];
    const p99Latency = readLatencies[Math.floor(READ_REQUESTS * 0.99) - 1];

    console.log(`\n📊 Read Benchmark Results (Cursor Pagination):`);
    console.log(`   - Total Requests: ${READ_REQUESTS}`);
    console.log(`   - Total Duration: ${totalReadDurationSec.toFixed(2)} seconds`);
    console.log(`   - Average Latency: ${avgLatency.toFixed(2)} ms`);
    console.log(`   - 95th Percentile (p95): ${p95Latency.toFixed(2)} ms`);
    console.log(`   - 99th Percentile (p99): ${p99Latency.toFixed(2)} ms`);

    console.log(`\n🎉 Benchmark run finished successfully!`);
  } catch (error) {
    console.error("❌ Benchmark failed with error:", error.message);
  } finally {
    console.log("🔌 Closing connection...");
    await closeDatabaseConnection();
  }
}

runBenchmark();
