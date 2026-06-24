import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import { 
  connectToDatabase, 
  insertMessage, 
  updateMessageStatus, 
  deleteMessage 
} from './db/mongodb.js';
import { supabaseAdmin, createSupabaseUserClient } from './db/supabase.js';
import dotenv from 'dotenv';
import webpush from 'web-push';
import { Queue } from 'bullmq';
import { upsertSubscription, getUserSubscriptions, deleteSubscriptionByEndpoint } from './db/pushSubscriptions.js';
import { isUserOffline, enqueuePushForUser, setPushQueue } from './services/pushService.js';
import { Server as SocketIOServer } from 'socket.io';
import { WebSocketServer } from 'ws';
import http from 'http';
import { redisRest, redisTcpSubscriber, connectRedis, closeRedis } from './db/redis.js';
import cookieParser from 'cookie-parser';
import authRouter from './auth/controller.js';
import { verifyAccessToken } from './auth/utils/jwt.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL?.trim().replace(/\/$/, '')
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.trim().replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => {
      return cleanOrigin === allowed || cleanOrigin.startsWith(allowed);
    }) || cleanOrigin.startsWith('http://localhost:') 
       || cleanOrigin.startsWith('http://127.0.0.1:')
       || cleanOrigin.endsWith('.vercel.app') 
       || cleanOrigin.endsWith('.netlify.app') 
       || cleanOrigin.endsWith('.onrender.com');

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked access from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 1. IP Rate Limiting for upload endpoint (20 uploads per 15 mins per IP)
const ipUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: { error: 'Too many uploads from this IP, please try again after 15 minutes.' }
});

// 2. Per-User Rate Limiting for upload endpoint (50 uploads per hour per user)
// Keyed strictly on req.user.id (guaranteed by requireAuth running first in route chain)
const userUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  keyGenerator: (req) => req.user.id,
  message: { error: 'Upload limit exceeded. You can upload up to 50 files per hour.' }
});

// 3. Multer Configuration (Memory Storage + MIME Whitelisting)
const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'application/pdf'
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max limit
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, WEBP, GIF, MP4, MOV, PDF'), false);
    }
  }
});

// 4. JWT Authentication Middleware
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    try {
      const payload = verifyAccessToken(token);
      // payload should contain sub (user id) and email
      req.user = { id: payload.sub, email: payload.email };
      req.token = token;
      return next();
    } catch (localErr) {
      // Fallback: verify token using Supabase admin auth client
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        throw new Error(error?.message || 'Invalid or expired token');
      }
      req.user = { id: user.id, email: user.email };
      req.token = token;
      return next();
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// 5. API Endpoints
// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Register auth router
app.use('/auth', authRouter);

app.post('/push/subscribe', requireAuth, async (req, res) => {
  const subscription = req.body.subscription;
  if (!subscription) return res.status(400).json({ error: 'Missing subscription' });
  try {
    await upsertSubscription(req.user.id, subscription);
    return res.json({ success: true });
  } catch (e) {
    console.error('Subscription error:', e);
    return res.status(400).json({ error: e.message });
  }
});

// ---- Auth ----
// POST /auth/login – validate user via Supabase admin, issue JWT
// The /auth/login route is now handled by auth/controller.js. Duplicate endpoint removed.

// ---- Rooms ----
app.get('/rooms', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabaseAdmin.from('room_members').select('room_id').eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  const rooms = data.map(r => r.room_id);
  return res.json({ rooms });
});

// ---- Messages ----
// GET /messages?room_id=...&before=_id (pagination older)
app.get('/messages', requireAuth, async (req, res) => {
  let { room_id, before, limit } = req.query;
  if (!room_id) return res.status(400).json({ error: 'room_id required' });
  if (room_id === 'general') {
    room_id = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
  }
  const lim = parseInt(limit) || 50;
  const { db } = await connectToDatabase();
  const query = { room_id: room_id };
  if (before) query._id = { $lt: before };
  const msgs = await db.collection('messages')
    .find(query)
    .sort({ _id: -1 })
    .limit(lim)
    .toArray();
  msgs.reverse();
  const nextCursor = msgs.length ? msgs[0]._id : null;
  return res.json({ messages: msgs, nextCursor });
});

// GET /messages/sync?roomId=...&after=clientMessageId (missed messages after reconnection)
app.get('/messages/sync', requireAuth, async (req, res) => {
  let { roomId, after } = req.query;
  if (!roomId) return res.status(400).json({ error: 'roomId required' });
  if (roomId === 'general') {
    roomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
  }
  const { db } = await connectToDatabase();
  const query = { room_id: roomId };
  if (after) query.clientMessageId = { $gt: after };
  const msgs = await db.collection('messages')
    .find(query)
    .sort({ clientMessageId: 1 })
    .toArray();
  return res.json({ messages: msgs });
});

// ---- Presence Snapshot ----
app.get('/presence/snapshot', requireAuth, async (req, res) => {
  // Use Redis to get presence map and version
  const versionKey = 'presence:version';
  const version = await redisRest.get(versionKey) || '0';
  const users = await redisRest.smembers('online_users'); // placeholder set
  return res.json({ version: parseInt(version), users });
});

// POST /api/upload: Upload file to Cloudinary with size and type constraints
// Note: Virus/malware scanning (e.g. ClamAV or a third-party scanning API) is deferred to a future milestone.
app.post('/api/upload', requireAuth, ipUploadLimiter, userUploadLimiter, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Custom sub-limit check: Images must not exceed 10MB
    if (req.file.mimetype.startsWith('image/') && req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size exceeds 10MB limit.' });
    }

    // Stream upload directly to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ekam/messages',
        resource_type: 'auto',
        fetch_format: 'auto',
        quality: 'auto'
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Cloudinary upload failed: ' + error.message });
        }

        // Return rich metadata response
        res.json({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          width: result.width || null,
          height: result.height || null,
          duration: result.duration || null
        });
      }
    );

    uploadStream.end(req.file.buffer);
  });
});

// POST /api/messages: Implement the 5-step write flow with compensating rollbacks
app.post('/api/messages', requireAuth, async (req, res) => {
  let { room_id, body, media_url, media_type } = req.body;

  // Input validations
  if (!room_id || typeof room_id !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing room_id parameter.' });
  }
  if (room_id === 'general') {
    room_id = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
  }
  if (!body || typeof body !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing body parameter.' });
  }
  if (media_url && typeof media_url !== 'string') {
    return res.status(400).json({ error: 'Invalid media_url parameter.' });
  }
  if (media_type && typeof media_type !== 'string') {
    return res.status(400).json({ error: 'Invalid media_type parameter.' });
  }

  // Security Check: Ignored any client-supplied sender_id parameter to prevent user impersonation attacks.
  // Extracting sender_id strictly from the verified JWT context:
  const sender_id = req.user.id; 
  let mongoDoc = null;

  try {
    // Step 2: Insert into MongoDB to get ULID
    mongoDoc = await insertMessage({
      room_id,
      sender_id,
      body,
      media_url,
      media_type,
      status: 'sent'
    });

    // Step 3: Insert basic metadata to Supabase (retain for relational lookup)
    const userSupabaseClient = createSupabaseUserClient(req.token);
    const { data: supabaseMessage, error: supabaseError } = await userSupabaseClient
      .from('messages')
      .insert({
        room_id,
        sender_id,
        content: body,
        media_url: media_url || null,
        media_type: media_type || null
      })
      .select('id')
      .single();

    if (supabaseError || !supabaseMessage) {
      throw new Error(supabaseError?.message || 'Failed to retrieve supabase UUID.');
    }

    // Step 4: Link identifiers (set supabase_id in MongoDB to the UUID)
    await updateMessageStatus(mongoDoc._id, 'sent');
    const { db } = await connectToDatabase();
    await db.collection('messages').updateOne(
      { _id: mongoDoc._id },
      { $set: { supabase_id: supabaseMessage.id } }
    );

    // Determine offline participants and enqueue push notifications
    const { data: membersData, error: membersErr } = await supabaseAdmin
      .from('room_members')
      .select('user_id')
      .eq('room_id', room_id);
    if (!membersErr && membersData) {
      const participantIds = membersData.map(m => m.user_id).filter(id => id !== sender_id);
      for (const recipientId of participantIds) {
            if (await isUserOffline(recipientId)) {
            const payload = {
              type: 'message',
              roomId: room_id,
              messageId: mongoDoc._id,
              senderId: sender_id,
              senderName: sender_id, // could be replaced with display name lookup later
              body: body.length > 80 ? body.slice(0, 77) + '…' : body,
              timestamp: Date.now()
            };
            await enqueuePushForUser(recipientId, payload);
        }
      }
    }

    // Fetch and return the linked document
    const finalDoc = await db.collection('messages').findOne({ _id: mongoDoc._id });

    // Step 5: Acknowledge & return finalized linked message to client
    return res.status(201).json(finalDoc);

  } catch (err) {
    // Compensating Rollback Action: Delete the MongoDB document if Supabase sync fails
    if (mongoDoc) {
      console.warn(`⚠️ Supabase sync failed. Rolling back MongoDB message: ${mongoDoc._id}`);
      try {
        await deleteMessage(mongoDoc._id);
      } catch (rollbackErr) {
        console.error(`❌ Critical Rollback Failure for message ${mongoDoc._id}: ${rollbackErr.message}`);
      }
    }
    return res.status(500).json({ error: 'Message synchronization failed: ' + err.message });
  }
});
// Active WebSockets map: Map<userId, Set<WebSocket>>
export const activeSockets = new Map();
const lastTypingWrites = new Map(); // key: `${roomId}:${userId}` => timestamp

// Local helper to decode JWT payload (without validation, which getUser does)
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch (err) {
    return null;
  }
}

// Helper to authenticate WS token during upgrade handshake
async function authenticateToken(token) {
  if (!token) return null;

  // Zero-network JWT expiration checking
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    console.warn("⚠️ Token is expired or malformed (exp validation failed).");
    return null;
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (err) {
    return null;
  }
}

// Cache helpers for Room members & User rooms in Redis
async function getRoomMembers(roomId) {
  if (roomId === 'general') {
    roomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
  }
  const cacheKey = `room_members:${roomId}`;
  try {
    const cached = await redisRest.smembers(cacheKey);
    if (cached && cached.length > 0) {
      return cached;
    }
  } catch (err) {
    console.error('Redis cache fetch error:', err.message);
  }

  // Cache miss: query Supabase
  const { data, error } = await supabaseAdmin
    .from('room_members')
    .select('user_id')
    .eq('room_id', roomId);

  if (error || !data) {
    console.error('Supabase fetch room members error:', error?.message);
    return [];
  }

  const memberIds = data.map(m => m.user_id);
  if (memberIds.length > 0) {
    try {
      await redisRest.sadd(cacheKey, ...memberIds);
      await redisRest.expire(cacheKey, 300); // 5 minutes TTL
    } catch (err) {
      console.error('Redis cache save error:', err.message);
    }
  }
  return memberIds;
}

async function getUserRooms(userId) {
  const cacheKey = `user_rooms:${userId}`;
  try {
    const cached = await redisRest.smembers(cacheKey);
    if (cached && cached.length > 0) {
      return cached;
    }
  } catch (err) {
    console.error('Redis cache fetch error:', err.message);
  }

  // Cache miss: query Supabase
  const { data, error } = await supabaseAdmin
    .from('room_members')
    .select('room_id')
    .eq('user_id', userId);

  if (error || !data) {
    console.error('Supabase fetch user rooms error:', error?.message);
    return [];
  }

  const roomIds = data.map(r => r.room_id);
  if (roomIds.length > 0) {
    try {
      await redisRest.sadd(cacheKey, ...roomIds);
      await redisRest.expire(cacheKey, 300); // 5 minutes TTL
    } catch (err) {
      console.error('Redis cache save error:', err.message);
    }
  }
  return roomIds;
}

async function getUserContacts(userId) {
  const roomIds = await getUserRooms(userId);
  const contactSets = new Set();
  for (const roomId of roomIds) {
    const members = await getRoomMembers(roomId);
    for (const memberId of members) {
      if (memberId !== userId) {
        contactSets.add(memberId);
      }
    }
  }
  return [...contactSets];
}

// Global reference to Socket.IO instance for use in Pub/Sub handlers
let ioInstance;

// Redis Pub/Sub Subscriber worker setup
async function startPubSubSubscriber() {
  await redisTcpSubscriber.subscribe('user_status', async (message) => {
    try {
      const payload = JSON.parse(message);
      const { userId, status, lastSeen } = payload;

      // Determine contacts of userId from cache/db
      const contactIds = await getUserContacts(userId);

      // Emit presence change to each contact via Socket.IO rooms
      const envelope = {
        v: 1,
        event: "presence.changed",
        userId,
        status,
        timestamp: Math.floor(Date.now() / 1000)
      };
      if (status === 'offline' && lastSeen !== undefined) {
        envelope.lastSeen = lastSeen;
      }

      for (const contactId of contactIds) {
        if (ioInstance) {
          ioInstance.to(contactId).emit('presence.changed', envelope);
        }
      }
    } catch (err) {
      console.error('❌ Error handling user_status pub/sub message:', err.message);
    }
  });

  await redisTcpSubscriber.subscribe('typing_events', async (message) => {
    try {
      const { roomId, userId, isTyping } = JSON.parse(message);

      // Get members from cache/db
      const members = await getRoomMembers(roomId);

      const envelope = {
        v: 1,
        event: "typing.changed",
        roomId,
        userId,
        isTyping,
        timestamp: Math.floor(Date.now() / 1000)
      };

      // Emit typing events to room members (excluding sender)
      for (const memberId of members) {
        if (memberId === userId) continue;
        if (ioInstance) {
          ioInstance.to(memberId).emit('typing.changed', envelope);
        }
      }
    } catch (err) {
      console.error('❌ Error handling typing_events pub/sub message:', err.message);
    }
  });
}

// Start Server & verify service connectivity on startup
async function startServer() {
  console.log("🔗 Verifying external service connections...");
  try {
    // 1. Check MongoDB
    console.log("⏳ [1/4] Verifying MongoDB connection...");
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    console.log("   ✅ MongoDB connection: OK");

    // 2. Check Cloudinary
    console.log("⏳ [2/4] Verifying Cloudinary connection...");
    const pingResult = await cloudinary.api.ping();
    if (pingResult.status !== 'ok') throw new Error("Cloudinary status not OK");
    console.log("   ✅ Cloudinary connection: OK");

    // 3. Check Supabase
    console.log("⏳ [3/4] Verifying Supabase connection...");
    const { error: pgError } = await supabaseAdmin.from('users').select('id').limit(1);
    if (pgError) throw new Error(pgError.message);
    console.log("   ✅ Supabase connection: OK");

    // 4. Check Redis
    console.log("⏳ [4/4] Verifying Redis connection...");
    await connectRedis();
    const redisPing = await redisRest.ping();
    if (redisPing !== 'PONG' && redisPing !== 'ok' && redisPing !== 'OK') throw new Error("Redis REST ping failed");
    console.log("   ✅ Redis connection: OK");

    // Start subscriber worker
    await startPubSubSubscriber();
    console.log("   ✅ Redis Pub/Sub Subscriber worker: Started");

  } catch (err) {
    console.error("❌ Service Startup Check Failed: " + err.message);
    process.exit(1);
  }

  //  NEW / UNIFIED WEBSOCKET AUTHENTICATION
  const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 3001;
  const server = http.createServer(app);
  const io = new SocketIOServer(server, { 
    cors: { 
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.trim().replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(allowed => {
          return cleanOrigin === allowed || cleanOrigin.startsWith(allowed);
        }) || cleanOrigin.startsWith('http://localhost:') 
           || cleanOrigin.startsWith('http://127.0.0.1:')
           || cleanOrigin.endsWith('.vercel.app') 
           || cleanOrigin.endsWith('.netlify.app') 
           || cleanOrigin.endsWith('.onrender.com');

        if (isAllowed) {
          return callback(null, true);
        } else {
          return callback(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true
    } 
  });
  
  // Store reference for Pub/Sub handlers
  ioInstance = io;

  // Single source of truth for WebSocket security
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication error'));
    
    try {
      const payload = verifyAccessToken(token);
      // Map the JWT 'sub' field (User UUID) directly to id so socket loops read it cleanly
      socket.user = { id: payload.sub, email: payload.email };
      next();
    } catch (e) {
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) {
          socket.user = { id: user.id, email: user.email };
          return next();
        }
      } catch (err) {}
      console.warn('⚠️ WebSocket JWT verification failed.');
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 Socket connection established for user: ${userId}`);
    socket.join(userId);

    // Asynchronously perform initialization to prevent blocking listener registration
    (async () => {
      try {
        console.log(`🔍 Fetching contacts for user: ${userId}...`);
        const contactIds = await getUserContacts(userId);
        console.log(`✅ Contacts fetched: ${contactIds.length} found.`);
        const onlineContacts = [];
        if (contactIds.length > 0) {
          const keys = contactIds.map(id => `presence:${id}`);
          const values = await redisRest.mget(...keys);
          contactIds.forEach((id, idx) => {
            if (values[idx] === 'online') onlineContacts.push({ userId: id, status: 'online' });
          });
        }

        console.log(`📤 Emitting presence.snapshot with ${onlineContacts.length} online contacts.`);
        socket.emit('presence.snapshot', { onlineUsers: onlineContacts, timestamp: Math.floor(Date.now() / 1000) });

        console.log(`🔄 Adding socket ${socket.id} to sessions Set for user: ${userId}`);
        await redisRest.sadd(`sessions:${userId}`, socket.id);
        const sessionCount = await redisRest.scard(`sessions:${userId}`);
        console.log(`ℹ️ Session count for user ${userId} is now ${sessionCount}`);
        if (sessionCount === 1) {
          await redisRest.set(`presence:${userId}`, 'online', { ex: 30 });
          io.emit('presence.changed', { userId, status: 'online' });
          console.log(`🟢 User status broadcasted: online`);
        }
      } catch (err) {
        console.error('❌ Error during async socket connection initialization:', err.message);
      }
    })();

    socket.on('join_room', async ({ roomId }) => {
      if (!roomId) return;
      if (roomId === 'general') roomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
      socket.join(roomId);
      console.log(`👤 Socket ${socket.id} (user ${userId}) joined room ${roomId}`);
    });

    socket.on('send_message', async (message, ack) => {
      let roomId = message.roomId || message.room_id;
      const clientMessageId = message.clientMessageId || message.client_message_id || message.id;
      const body = message.body || message.content;
      const mediaUrl = message.mediaUrl || message.media_url;
      const mediaType = message.mediaType || message.media_type;

      console.log(`✉️ Received send_message from ${userId} for room ${roomId}. Client ID: ${clientMessageId}`);

      if (!roomId || !body) {
        console.warn(`⚠️ Invalid send_message payload: roomId or body is missing.`);
        if (typeof ack === 'function') ack({ success: false, error: 'roomId and body required' });
        return;
      }

      if (roomId === 'general') {
        roomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
      }

      const senderId = userId;
      let mongoDoc = null;

      try {
        // Step 2: Insert into MongoDB
        console.log(`⏳ [Step 2/5] Inserting message into MongoDB...`);
        mongoDoc = await insertMessage({
          room_id: roomId,
          sender_id: senderId,
          body: body,
          media_url: mediaUrl,
          media_type: mediaType,
          status: 'sent'
        });
        console.log(`✅ [Step 2/5] MongoDB insert succeeded. ID: ${mongoDoc._id}`);

        // Step 3: Insert basic metadata to Supabase
        console.log(`⏳ [Step 3/5] Syncing message metadata to Supabase...`);
        const { data: supabaseMessage, error: supabaseError } = await supabaseAdmin
          .from('messages')
          .insert({
            room_id: roomId,
            sender_id: senderId,
            content: body,
            media_url: mediaUrl || null,
            media_type: mediaType || null
          })
          .select('id')
          .single();

        if (supabaseError || !supabaseMessage) {
          throw new Error(supabaseError?.message || 'Failed to retrieve supabase UUID.');
        }
        console.log(`✅ [Step 3/5] Supabase sync succeeded. UUID: ${supabaseMessage.id}`);

        // Step 4: Link identifiers (set supabase_id in MongoDB to the UUID)
        console.log(`⏳ [Step 4/5] Linking identifiers in MongoDB...`);
        const { db } = await connectToDatabase();
        await db.collection('messages').updateOne(
          { _id: mongoDoc._id },
          { $set: { supabase_id: supabaseMessage.id } }
        );

        mongoDoc.supabase_id = supabaseMessage.id;
        mongoDoc.clientMessageId = clientMessageId;
        console.log(`✅ [Step 4/5] Identifiers linked successfully.`);

        // Determine offline participants and enqueue push notifications
        console.log(`⏳ [Step 5/5] Fetching room members and checking offline status...`);
        const members = await getRoomMembers(roomId);
        console.log(`ℹ️ Room members for ${roomId}: ${JSON.stringify(members)}`);
        const participantIds = members.filter(id => id !== senderId);
        for (const recipientId of participantIds) {
          if (await isUserOffline(recipientId)) {
            console.log(`🔔 Recipient ${recipientId} is offline. Enqueuing push notification...`);
            const payload = {
              type: 'message',
              roomId: roomId,
              messageId: mongoDoc._id,
              senderId: senderId,
              senderName: senderId,
              body: body.length > 80 ? body.slice(0, 77) + '…' : body,
              timestamp: Date.now()
            };
            await enqueuePushForUser(recipientId, payload);
          }
        }
        console.log(`✅ [Step 5/5] Push notification check done.`);

        // Emit message_ack to the sender (acknowledgment with status 'sent')
        const ackData = { success: true, clientMessageId, status: 'sent', messageId: mongoDoc._id };
        if (typeof ack === 'function') {
          console.log(`📤 Executing ack callback...`);
          ack(ackData);
        }
        console.log(`📤 Emitting message_ack event...`);
        socket.emit('message_ack', ackData);

        // Broadcast message to other online room members
        console.log(`📤 Broadcasting message to room members...`);
        const broadcastPayload = {
          _id: mongoDoc._id,
          clientMessageId,
          room_id: roomId,
          sender_id: senderId,
          body: body,
          ts: Date.now(),
          status: 'sent',
          media_url: mediaUrl || null,
          media_type: mediaType || null,
          supabase_id: mongoDoc.supabase_id
        };

        // Send to each room member
        for (const memberId of members) {
          if (memberId === senderId) continue;
          io.to(memberId).emit('message', broadcastPayload);
        }
        console.log(`🎉 send_message transactional flow completed successfully!`);

      } catch (err) {
        console.error('❌ Error handling send_message socket event:', err.stack);
        if (mongoDoc) {
          console.warn(`⚠️ Supabase sync failed. Rolling back MongoDB message: ${mongoDoc._id}`);
          try {
            await deleteMessage(mongoDoc._id);
            console.log(`✅ Rollback successful. Message deleted from MongoDB.`);
          } catch (rollbackErr) {
            console.error(`❌ Critical Rollback Failure for message ${mongoDoc._id}: ${rollbackErr.message}`);
          }
        }
        if (typeof ack === 'function') {
          ack({ success: false, error: err.message });
        }
        socket.emit('message_ack', { success: false, clientMessageId, error: err.message });
      }
    });

    socket.on('typing', async ({ roomId, isTyping }) => {
      const members = await getRoomMembers(roomId);
      if (members.includes(userId)) {
        socket.to(roomId).emit('typing.changed', { roomId, userId, isTyping });
      }
    });

    socket.on('disconnect', async () => {
      console.log(`🔄 Removing socket ${socket.id} from sessions Set for user: ${userId}`);
      await redisRest.srem(`sessions:${userId}`, socket.id);
      const sessionCount = await redisRest.scard(`sessions:${userId}`);
      console.log(`ℹ️ Session count for user ${userId} after disconnect is now ${sessionCount}`);
      if (sessionCount <= 0) {
        await redisRest.del(`presence:${userId}`);
        const now = Math.floor(Date.now() / 1000);
        await redisRest.set(`last_seen:${userId}`, String(now));
        io.emit('presence.changed', { userId, status: 'offline', lastSeen: now });
        await redisRest.del(`sessions:${userId}`);
      }
    });
  });

  // Setup Raw WebSocket Server on the same HTTP server (for verification scripts/compatibility)
  const wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/socket.io')) {
      return; // Handled by Socket.io
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws, request) => {
    ws.lastActivity = Date.now();
    ws.messageTimestamps = [];
    ws.socketId = Math.random().toString(36).substring(2) + Date.now();
    
    let isAuthenticated = false;
    let authFailed = false;
    let userId = null;
    const pendingMessages = [];

    const handleParsedMessage = (parsed) => {
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    };

    ws.on('message', (data) => {
      ws.lastActivity = Date.now();
      
      const now = Date.now();
      ws.messageTimestamps = ws.messageTimestamps.filter(t => now - t < 60000);
      if (ws.messageTimestamps.length >= 50) {
        ws.send(JSON.stringify({ event: 'error', message: 'Rate limit exceeded' }));
        return;
      }
      ws.messageTimestamps.push(now);

      try {
        const parsed = JSON.parse(data.toString());
        if (!isAuthenticated) {
          if (authFailed) return;
          pendingMessages.push(parsed);
        } else {
          handleParsedMessage(parsed);
        }
      } catch (err) {}
    });

    ws.on('close', async () => {
      if (isAuthenticated && userId) {
        try {
          await redisRest.srem(`sessions:${userId}`, ws.socketId);
          const sessionCount = await redisRest.scard(`sessions:${userId}`);
          if (sessionCount <= 0) {
            await redisRest.del(`presence:${userId}`);
            const now = Math.floor(Date.now() / 1000);
            await redisRest.set(`last_seen:${userId}`, String(now));
            io.emit('presence.changed', { userId, status: 'offline', lastSeen: now });
            await redisRest.del(`sessions:${userId}`);
          }
        } catch (err) {
          console.error(`Error handling close for user ${userId}:`, err.message);
        }
      }
    });

    ws.on('error', () => {
      ws.close();
    });

    // Run async authentication in the background
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const token = url.searchParams.get('token');

    const authenticate = async () => {
      if (!token) throw new Error('Missing token');
      try {
        const payload = verifyAccessToken(token);
        return { id: payload.sub, email: payload.email };
      } catch (e) {
        const { data: { user: sbUser }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !sbUser) throw new Error('Invalid token');
        return { id: sbUser.id, email: sbUser.email };
      }
    };

    authenticate().then(async (user) => {
      isAuthenticated = true;
      userId = user.id;
      ws.userId = userId;

      // Update session/presence in Redis
      try {
        await redisRest.sadd(`sessions:${userId}`, ws.socketId);
        await redisRest.set(`presence:${userId}`, 'online', { ex: 30 });
        const sessionCount = await redisRest.scard(`sessions:${userId}`);
        if (sessionCount === 1) {
          io.emit('presence.changed', { userId, status: 'online' });
        }
      } catch (err) {
        console.error(`Error updating presence for user ${userId}:`, err.message);
      }

      // Process any pending messages that arrived during auth
      while (pendingMessages.length > 0) {
        const msg = pendingMessages.shift();
        handleParsedMessage(msg);
      }
    }).catch((err) => {
      authFailed = true;
      ws.close(4001, 'Authentication error');
    });
  });

  // Sweeper to clean up stale raw connections
  const sweeperInterval = setInterval(() => {
    const now = Date.now();
    wss.clients.forEach((ws) => {
      if (now - ws.lastActivity > 30000) {
        console.log(`🧹 Sweeping stale raw WebSocket connection for user: ${ws.userId}`);
        ws.terminate();
      }
    });
  }, 5000);

  // Initialize Push Notification Queue with Cloud URL parsing
  const redisUrl = process.env.REDIS_URL ? new URL(process.env.REDIS_URL) : null;
  
  const pushQueue = new Queue('pushNotifications', {
    connection: redisUrl ? {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port) || 6379,
      username: redisUrl.username || undefined,
      password: redisUrl.password || undefined,
      tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null
    } : {
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null
    }
  });
  // Register the queue with the push service abstraction
  setPushQueue(pushQueue);

  // Configure VAPID details for web-push
  webpush.setVapidDetails(
    'mailto:admin@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  server.listen(PORT, () => console.log(`SERVER_PORT=${server.address().port}`));

  process.on('SIGTERM', async () => {
    console.log('[Server] SIGTERM received. Closing connection...');
    clearInterval(sweeperInterval);
    wss.close();
    await closeRedis();
    process.exit(0);
  });
}

// Auto-run if executed directly
startServer();
export default app;
