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
import { upsertSubscription } from './db/pushSubscriptions.js';
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

// Rate Limiting
const ipUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20,
  message: { error: 'Too many uploads from this IP, please try again after 15 minutes.' }
});

const userUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'Upload limit exceeded. You can upload up to 50 files per hour.' }
});

const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'application/pdf'
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: JPEG, PNG, WEBP, GIF, MP4, MOV, PDF'), false);
    }
  }
});

// Authentication Middleware
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, email: payload.email };
      req.token = token;
      return next();
    } catch (localErr) {
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

// REST Endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
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

app.get('/rooms', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabaseAdmin.from('room_members').select('room_id').eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ rooms: data.map(r => r.room_id) });
});

app.get('/messages', requireAuth, async (req, res) => {
  let { room_id, before, limit } = req.query;
  if (!room_id) return res.status(400).json({ error: 'room_id required' });
  if (room_id === 'general') room_id = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
  
  const lim = parseInt(limit) || 50;
  const { db } = await connectToDatabase();
  const query = { room_id };
  if (before) query._id = { $lt: before };
  
  const msgs = await db.collection('messages').find(query).sort({ _id: -1 }).limit(lim).toArray();
  msgs.reverse();
  return res.json({ messages: msgs, nextCursor: msgs.length ? msgs[0]._id : null });
});

app.post('/api/upload', requireAuth, ipUploadLimiter, userUploadLimiter, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    if (req.file.mimetype.startsWith('image/') && req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image size exceeds 10MB limit.' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'ekam/messages', resource_type: 'auto', fetch_format: 'auto', quality: 'auto' },
      (error, result) => {
        if (error) return res.status(500).json({ error: 'Cloudinary failure: ' + error.message });
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

app.post('/api/messages', requireAuth, async (req, res) => {
  let { room_id, body, media_url, media_type } = req.body;
  if (!room_id || !body) return res.status(400).json({ error: 'Missing parameter entries' });
  if (room_id === 'general') room_id = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

  const sender_id = req.user.id; 
  let mongoDoc = null;

  try {
    mongoDoc = await insertMessage({ room_id, sender_id, body, media_url, media_type, status: 'sent' });

    const userSupabaseClient = createSupabaseUserClient(req.token);
    const { data: supabaseMessage, error: supabaseError } = await userSupabaseClient
      .from('messages')
      .insert({ room_id, sender_id, content: body, media_url: media_url || null, media_type: media_type || null })
      .select('id').single();

    if (supabaseError || !supabaseMessage) throw new Error(supabaseError?.message || 'Supabase failure');

    const { db } = await connectToDatabase();
    await db.collection('messages').updateOne({ _id: mongoDoc._id }, { $set: { supabase_id: supabaseMessage.id } });

    const members = await getRoomMembers(room_id);
    const offlineRecipients = members.filter(id => id !== sender_id);
    
    // Batch query presence metrics using Redis MGET
    if (offlineRecipients.length > 0) {
      const keys = offlineRecipients.map(id => `presence:${id}`);
      const presenceStates = await redisRest.mget(...keys);
      
      for (let i = 0; i < offlineRecipients.length; i++) {
        if (presenceStates[i] !== 'online') {
          const payload = {
            type: 'message',
            roomId: room_id,
            messageId: mongoDoc._id,
            senderId: sender_id,
            body: body.length > 80 ? body.slice(0, 77) + '…' : body,
            timestamp: Date.now()
          };
          await enqueuePushForUser(offlineRecipients[i], payload).catch(err => console.error("Push Enqueue Error:", err));
        }
      }
    }

    const finalDoc = await db.collection('messages').findOne({ _id: mongoDoc._id });
    return res.status(201).json(finalDoc);
  } catch (err) {
    if (mongoDoc) {
      console.warn(`⚠️ Rolling back MongoDB message payload: ${mongoDoc._id}`);
      await deleteMessage(mongoDoc._id).catch(e => console.error(`Critical Rollback Failure: ${e.message}`));
    }
    return res.status(500).json({ error: 'Synchronization failed: ' + err.message });
  }
});

// Cache Helpers
async function getRoomMembers(roomId) {
  if (roomId === 'general') roomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
  const cacheKey = `room_members:${roomId}`;
  try {
    const cached = await redisRest.smembers(cacheKey);
    if (cached?.length > 0) return cached;
  } catch (err) { console.error('Redis cache fetch error:', err.message); }

  const { data, error } = await supabaseAdmin.from('room_members').select('user_id').eq('room_id', roomId);
  if (error || !data) return [];

  const memberIds = data.map(m => m.user_id);
  if (memberIds.length > 0) {
    await redisRest.sadd(cacheKey, ...memberIds).catch(() => {});
    await redisRest.expire(cacheKey, 300).catch(() => {});
  }
  return memberIds;
}

async function getUserRooms(userId) {
  const cacheKey = `user_rooms:${userId}`;
  try {
    const cached = await redisRest.smembers(cacheKey);
    if (cached?.length > 0) return cached;
  } catch (err) { console.error('Redis fetch error:', err.message); }

  const { data, error } = await supabaseAdmin.from('room_members').select('room_id').eq('user_id', userId);
  if (error || !data) return [];

  const roomIds = data.map(r => r.room_id);
  if (roomIds.length > 0) {
    await redisRest.sadd(cacheKey, ...roomIds).catch(() => {});
    await redisRest.expire(cacheKey, 300).catch(() => {});
  }
  return roomIds;
}

async function getUserContacts(userId) {
  const roomIds = await getUserRooms(userId);
  const contactSets = new Set();
  for (const roomId of roomIds) {
    const members = await getRoomMembers(roomId);
    for (const memberId of members) {
      if (memberId !== userId) contactSets.add(memberId);
    }
  }
  return [...contactSets];
}

let ioInstance;

async function startPubSubSubscriber() {
  await redisTcpSubscriber.subscribe('user_status', async (message) => {
    try {
      const { userId, status, lastSeen } = JSON.parse(message);
      const contactIds = await getUserContacts(userId);
      const envelope = { v: 1, event: "presence.changed", userId, status, timestamp: Math.floor(Date.now() / 1000) };
      if (status === 'offline' && lastSeen !== undefined) envelope.lastSeen = lastSeen;

      for (const contactId of contactIds) {
        if (ioInstance) ioInstance.to(contactId).emit('presence.changed', envelope);
      }
    } catch (err) { console.error('❌ Error on user_status processing:', err.message); }
  });

  await redisTcpSubscriber.subscribe('typing_events', async (message) => {
    try {
      const { roomId, userId, isTyping } = JSON.parse(message);
      const members = await getRoomMembers(roomId);
      const envelope = { v: 1, event: "typing.changed", roomId, userId, isTyping, timestamp: Math.floor(Date.now() / 1000) };

      for (const memberId of members) {
        if (memberId !== userId && ioInstance) ioInstance.to(memberId).emit('typing.changed', envelope);
      }
    } catch (err) { console.error('❌ Error processing typing_events:', err.message); }
  });
}

async function startServer() {
  console.log("🔗 Verifying external service connections...");
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    await cloudinary.api.ping();
    
    const { error: pgError } = await supabaseAdmin.from('users').select('id').limit(1);
    if (pgError) throw pgError;

    await connectRedis();
    await startPubSubSubscriber();
    console.log("✅ Core Cloud services connected and validated.");
  } catch (err) {
    console.error("❌ Service Startup Check Failed: " + err.message);
    process.exit(1);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const server = http.createServer(app);
  
  const io = new SocketIOServer(server, { 
    cors: { 
      origin: allowedOrigins,
      credentials: true
    } 
  });
  
  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = verifyAccessToken(token);
      socket.user = { id: payload.sub, email: payload.email };
      return next();
    } catch (e) {
      supabaseAdmin.auth.getUser(token).then(({ data: { user }, error }) => {
        if (error || !user) return next(new Error('Authentication validation failed'));
        socket.user = { id: user.id, email: user.email };
        next();
      }).catch(() => next(new Error('Authentication validation exception')));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(userId);

    (async () => {
      try {
        const contactIds = await getUserContacts(userId);
        const onlineContacts = [];
        if (contactIds.length > 0) {
          const values = await redisRest.mget(...contactIds.map(id => `presence:${id}`));
          contactIds.forEach((id, idx) => {
            if (values[idx] === 'online') onlineContacts.push({ userId: id, status: 'online' });
          });
        }

        socket.emit('presence.snapshot', { onlineUsers: onlineContacts, timestamp: Math.floor(Date.now() / 1000) });
        await redisRest.sadd(`sessions:${userId}`, socket.id);
        const sessionCount = await redisRest.scard(`sessions:${userId}`);
        
        if (sessionCount === 1) {
          await redisRest.set(`presence:${userId}`, 'online', { ex: 30 });
          io.emit('presence.changed', { userId, status: 'online' });
        }
      } catch (err) { console.error('Socket init error:', err.message); }
    })();

    socket.on('join_room', async ({ roomId }) => {
      try {
        if (!roomId) return;
        const targetRoom = roomId === 'general' ? 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' : roomId;
        await socket.join(targetRoom);
      } catch (err) { console.error('Socket join_room error:', err.message); }
    });

    socket.on('send_message', async (message, ack) => {
      try {
        let roomId = message.roomId || message.room_id;
        const clientMessageId = message.clientMessageId || message.client_message_id || message.id;
        const body = message.body || message.content;
        const mediaUrl = message.mediaUrl || message.media_url;
        const mediaType = message.mediaType || message.media_type;

        if (!roomId || !body) throw new Error('Missing roomId or payload string data');
        if (roomId === 'general') roomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

        const mongoDoc = await insertMessage({ room_id: roomId, sender_id: userId, body, media_url: mediaUrl, media_type: mediaType, status: 'sent' });

        const { data: supabaseMessage, error: supabaseError } = await supabaseAdmin
          .from('messages')
          .insert({ room_id: roomId, sender_id: userId, content: body, media_url: mediaUrl || null, media_type: mediaType || null })
          .select('id').single();

        if (supabaseError || !supabaseMessage) throw new Error(supabaseError?.message || 'Supabase structural insert rejected');

        const { db } = await connectToDatabase();
        await db.collection('messages').updateOne({ _id: mongoDoc._id }, { $set: { supabase_id: supabaseMessage.id } });

        const members = await getRoomMembers(roomId);
        
        const ackData = { success: true, clientMessageId, status: 'sent', messageId: mongoDoc._id };
        if (typeof ack === 'function') ack(ackData);
        socket.emit('message_ack', ackData);

        const broadcastPayload = {
          _id: mongoDoc._id, clientMessageId, room_id: roomId, sender_id: userId,
          body, ts: Date.now(), status: 'sent', media_url: mediaUrl || null,
          media_type: mediaType || null, supabase_id: supabaseMessage.id
        };

        for (const memberId of members) {
          if (memberId !== userId) io.to(memberId).emit('message', broadcastPayload);
        }
      } catch (err) {
        console.error('Socket send_message failure handling logic:', err.message);
        if (typeof ack === 'function') ack({ success: false, error: err.message });
      }
    });

    socket.on('disconnect', async () => {
      try {
        await redisRest.srem(`sessions:${userId}`, socket.id);
        const sessionCount = await redisRest.scard(`sessions:${userId}`);
        if (sessionCount <= 0) {
          await redisRest.del(`presence:${userId}`);
          const now = Math.floor(Date.now() / 1000);
          await redisRest.set(`last_seen:${userId}`, String(now));
          io.emit('presence.changed', { userId, status: 'offline', lastSeen: now });
          await redisRest.del(`sessions:${userId}`);
        }
      } catch (e) { console.error('Disconnect parsing exception:', e); }
    });
  });

  // Raw fallback WS implementation mapping
  const wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/socket.io')) return;
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  const sweeperInterval = setInterval(() => {
    const now = Date.now();
    wss.clients.forEach((ws) => {
      if (now - ws.lastActivity > 30000) ws.terminate();
    });
  }, 5000);

  // Parse Redis URI safely for BullMQ setup engine
  const redisUrl = process.env.REDIS_URL ? new URL(process.env.REDIS_URL) : null;
  const pushQueue = new Queue('pushNotifications', {
    connection: redisUrl ? {
      host: redisUrl.hostname,
      port: parseInt(redisUrl.port, 10) || 6379,
      username: redisUrl.username || undefined,
      password: redisUrl.password || undefined,
      tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null
    } : { host: '127.0.0.1', port: 6379, maxRetriesPerRequest: null }
  });
  setPushQueue(pushQueue);

  webpush.setVapidDetails('mailto:admin@example.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

  server.listen(PORT, () => console.log(`🚀 Node Server Process Running Active on Unified Port: ${PORT}`));

  process.on('SIGTERM', async () => {
    clearInterval(sweeperInterval);
    wss.close();
    await closeRedis();
    process.exit(0);
  });
}

startServer();