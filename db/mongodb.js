import { MongoClient } from 'mongodb';
import { ulid } from 'ulid';
import dns from 'dns/promises';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

// Load environment variables immediately on module load
dotenv.config();

// TTL: MongoDB is a permanent message store, no auto-expiry policy.

// Strict environment variable validation on startup
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.warn("⚠️ MONGODB_URI or MONGO_URI is not defined. MongoDB-dependent routes will fail.");
  // Do NOT process.exit — let non-MongoDB routes (e.g. /health) work.
}


let client = null;
let db = null;

// Fallback SRV resolution using nslookup (handles Windows Node.js c-ares DNS resolution issues)
async function resolveSrvNslookup(host) {
  try {
    const { stdout } = await execAsync(`nslookup -type=SRV _mongodb._tcp.${host}`);
    const hostnames = [];
    const lines = stdout.split('\n');
    let currentHost = null;
    let currentPort = null;
    
    for (const line of lines) {
      const hostMatch = line.match(/svr hostname\s*=\s*([^\s\r\n]+)/i);
      const portMatch = line.match(/port\s*=\s*(\d+)/i);
      
      if (hostMatch) {
        currentHost = hostMatch[1].replace(/\.$/, '');
      }
      if (portMatch) {
        currentPort = portMatch[1];
      }
      
      if (currentHost && currentPort) {
        hostnames.push({ name: currentHost, port: parseInt(currentPort) });
        currentHost = null;
        currentPort = null;
      }
    }
    return hostnames;
  } catch (err) {
    console.warn("⚠️ nslookup SRV fallback failed:", err.message);
    return [];
  }
}

// Fallback TXT resolution using nslookup
async function resolveTxtNslookup(host) {
  try {
    const { stdout } = await execAsync(`nslookup -type=TXT ${host}`);
    const lines = stdout.split('\n');
    for (const line of lines) {
      const match = line.match(/"([^"]+)"/);
      if (match) {
        return match[1];
      }
    }
  } catch (err) {
    console.warn("⚠️ nslookup TXT fallback failed:", err.message);
  }
  return "";
}

// Resolve a mongodb+srv:// URI to a standard replica-set mongodb:// connection string
async function resolveSrvUri(srvUri) {
  if (!srvUri.startsWith('mongodb+srv://')) return srvUri;
  
  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?#]+)([^?#]*)(.*)$/);
    if (!match) return srvUri;
    
    const [_, username, password, host, database, optionsStr] = match;
    
    console.log(`ℹ️ Bypassing node DNS. Attempting manual DNS SRV resolution for: ${host}...`);
    
    let srvRecords = [];
    try {
      srvRecords = await dns.resolveSrv(`_mongodb._tcp.${host}`);
    } catch (dnsErr) {
      console.warn(`⚠️ Node.js dns.resolveSrv failed: ${dnsErr.message}. Trying nslookup fallback...`);
      srvRecords = await resolveSrvNslookup(host);
    }
    
    if (!srvRecords || srvRecords.length === 0) {
      throw new Error(`Could not resolve SRV records for host: ${host}`);
    }
    
    const hostList = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
    
    let txtOptions = "";
    try {
      const txtRecords = await dns.resolveTxt(host);
      if (txtRecords && txtRecords.length > 0) {
        txtOptions = txtRecords[0].join('&');
      }
    } catch (e) {
      console.warn(`⚠️ Failed to resolve DNS TXT records via Node.js dns: ${e.message}. Trying nslookup fallback...`);
      txtOptions = await resolveTxtNslookup(host);
    }
    
    let finalOptions = "ssl=true";
    if (txtOptions) finalOptions += `&${txtOptions}`;
    
    const dbPath = database || "/";
    const standardUri = `mongodb://${username}:${password}@${hostList}${dbPath}?${finalOptions}`;
    console.log("✅ Successfully constructed standard fallback connection string.");
    return standardUri;
  } catch (err) {
    console.error("❌ Manual DNS resolution failed:", err.message);
    return srvUri;
  }
}

// Connect to MongoDB and cache the connection
export async function connectToDatabase() {
  if (db) return { client, db };

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  const hasTlsOption = uri.includes('tlsInsecure') || uri.includes('tlsAllowInvalidCertificates');
  const mongoOptions = hasTlsOption ? {} : { tlsAllowInvalidCertificates: true };

  try {
    client = new MongoClient(uri, mongoOptions);
    await client.connect();
    db = client.db();
    return { client, db };
  } catch (err) {
    if (err.message.includes('querySrv') || err.code === 'ECONNREFUSED' || err.message.includes('ECONNREFUSED')) {
      console.warn("⚠️ DNS SRV query failed. Attempting standard connection string fallback...");
      try {
        const fallbackUri = await resolveSrvUri(uri);
        const hasFallbackTlsOption = fallbackUri.includes('tlsInsecure') || fallbackUri.includes('tlsAllowInvalidCertificates');
        const fallbackOptions = hasFallbackTlsOption ? {} : { tlsAllowInvalidCertificates: true };
        client = new MongoClient(fallbackUri, fallbackOptions);
        await client.connect();
        db = client.db();
        return { client, db };
      } catch (fallbackErr) {
        throw new Error(`Failed to connect using both SRV and fallback connection strings. Fallback error: ${fallbackErr.message}. Original error: ${err.message}`);
      }
    }
    throw err;
  }
}

// Close the cached connection
export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Initialize database (creates collection with schema validation and indexes)
export async function initializeDatabase() {
  const { db } = await connectToDatabase();

  const collections = await db.listCollections({ name: 'messages' }).toArray();
  
  if (collections.length === 0) {
    console.log("Creating 'messages' collection with JSON schema validation...");
    try {
      await db.createCollection('messages', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['_id', 'room_id', 'sender_id', 'body', 'ts'],
            properties: {
              _id: {
                bsonType: 'string',
                description: 'ULID string - must be a 26 character string'
              },
              room_id: {
                bsonType: 'string',
                description: 'Room ID - must be a string UUID'
              },
              sender_id: {
                bsonType: 'string',
                description: 'Sender ID - must be a string UUID'
              },
              body: {
                bsonType: 'string',
                description: 'Message body - must be a string'
              },
              ts: {
                bsonType: 'date',
                description: 'Timestamp - must be a BSON date object'
              },
              media_url: {
                bsonType: 'string',
                description: 'Optional media URL - must be a string'
              },
              media_type: {
                bsonType: 'string',
                description: 'Optional media type - must be a string'
              },
              status: {
                bsonType: 'string',
                enum: ['sent', 'delivered', 'read'],
                description: 'Optional delivery status'
              },
              supabase_id: {
                bsonType: 'string',
                description: 'Optional Supabase UUID message mapping link'
              }
            }
          }
        }
      });
    } catch (err) {
      if (err.code !== 48) { // 48 is NamespaceExists (already exists)
        throw err;
      }
    }
  }

  // Create compound index { room_id: 1, _id: -1 } for fast pagination
  console.log("Ensuring compound index on (room_id, _id)...");
  await db.collection('messages').createIndex(
    { room_id: 1, _id: -1 },
    { name: 'idx_room_id_message_id' }
  );
  
  console.log("MongoDB initialization completed successfully!");
}

// Parameter validations to safeguard against NoSQL Injection
function validateStringParam(paramName, value) {
  if (typeof value !== 'string') {
    throw new Error(`Security Exception: parameter '${paramName}' must be a string (NoSQL Injection Defense)`);
  }
}

// Helper: Insert Message
export async function insertMessage({ room_id, sender_id, body, media_url, media_type, status = 'sent', ts = new Date(), supabase_id }) {
  validateStringParam('room_id', room_id);
  validateStringParam('sender_id', sender_id);
  validateStringParam('body', body);
  if (media_url) validateStringParam('media_url', media_url);
  if (media_type) validateStringParam('media_type', media_type);
  validateStringParam('status', status);
  if (supabase_id) validateStringParam('supabase_id', supabase_id);

  const { db } = await connectToDatabase();
  const messageId = ulid();
  const timestamp = ts instanceof Date ? ts : new Date(ts);

  // Construct message document omitting optional null fields to satisfy BSON string schema validation
  const doc = {
    _id: messageId,
    room_id,
    sender_id,
    body,
    status,
    ts: timestamp
  };

  if (media_url) doc.media_url = media_url;
  if (media_type) doc.media_type = media_type;
  if (supabase_id) doc.supabase_id = supabase_id;

  await db.collection('messages').insertOne(doc);
  return doc;
}

// Helper: Update Message Status
export async function updateMessageStatus(messageId, status) {
  validateStringParam('messageId', messageId);
  validateStringParam('status', status);
  if (!['sent', 'delivered', 'read'].includes(status)) {
    throw new Error("Invalid status value.");
  }

  const { db } = await connectToDatabase();
  const result = await db.collection('messages').updateOne(
    { _id: messageId },
    { $set: { status } }
  );

  return result.modifiedCount > 0;
}

// Helper: Fetch Last 50 messages in room (initial load)
export async function fetchLast50(room_id) {
  validateStringParam('room_id', room_id);

  const { db } = await connectToDatabase();
  
  // Query using compound index
  const messages = await db.collection('messages')
    .find({ room_id })
    .sort({ _id: -1 })
    .limit(50)
    .toArray();

  // Reverse to return in chronological order (oldest first)
  messages.reverse();

  // The next cursor represents the oldest message ID in the set
  const nextCursor = messages.length > 0 ? messages[0]._id : null;

  return { messages, nextCursor };
}

// Helper: Cursor-based pagination scrolling up (fetching older messages before cursor)
export async function fetchPageBeforeCursor(room_id, cursorId, limit = 50) {
  validateStringParam('room_id', room_id);
  validateStringParam('cursorId', cursorId);
  
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("Limit must be a positive integer.");
  }

  const { db } = await connectToDatabase();
  
  // Find messages before cursorId (older than cursor)
  const messages = await db.collection('messages')
    .find({ room_id, _id: { $lt: cursorId } })
    .sort({ _id: -1 })
    .limit(limit)
    .toArray();

  // Reverse to return in chronological order
  messages.reverse();

  // Next cursor points to the oldest message ID in this returned set
  const nextCursor = messages.length > 0 ? messages[0]._id : null;

  return { messages, nextCursor };
}

// Helper: Delete Message (Compensating Rollback action)
export async function deleteMessage(messageId) {
  validateStringParam('messageId', messageId);

  const { db } = await connectToDatabase();
  const result = await db.collection('messages').deleteOne({ _id: messageId });
  return result.deletedCount > 0;
}
