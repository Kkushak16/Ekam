import { MongoClient } from 'mongodb';
import { ulid } from 'ulid';
import dns from 'dns/promises';
import dotenv from 'dotenv';

// Load environment variables immediately on module load
dotenv.config();

// TTL: MongoDB is a permanent message store, no auto-expiry policy.

// Strict environment variable validation on startup
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ Environment Validation Error: MONGODB_URI or MONGO_URI is not defined.");
  process.exit(1);
}


let client = null;
let db = null;

// Resolve a mongodb+srv:// URI to a standard replica-set mongodb:// connection string
async function resolveSrvUri(srvUri) {
  if (!srvUri.startsWith('mongodb+srv://')) return srvUri;
  
  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?#]+)([^?#]*)(.*)$/);
    if (!match) return srvUri;
    
    const [_, username, password, host, database, optionsStr] = match;
    
    console.log(`ℹ️ Node.js querySrv failed. Attempting manual DNS SRV resolution for: ${host}...`);
    
    const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${host}`);
    const hostList = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
    
    let txtOptions = "";
    try {
      const txtRecords = await dns.resolveTxt(host);
      if (txtRecords && txtRecords.length > 0) {
        txtOptions = txtRecords[0].join('&');
      }
    } catch (e) {
      console.warn("⚠️ Failed to resolve DNS TXT records:", e.message);
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
