import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import dotenv from 'dotenv';
import Pusher from 'pusher';
import { v2 as cloudinary } from 'cloudinary';
import { 
  connectToDatabase, 
  insertMessage, 
  deleteMessage 
} from './db/mongodb.js';
import { createSupabaseUserClient, supabaseAdmin } from './db/supabase.js';
import authRouter from './auth/controller.js';
import { verifyAccessToken } from './auth/utils/jwt.js';

// Testing & Hardening Requirements
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { WebSocketServer } from 'ws';
import { z } from 'zod';
import { redisRest, connectRedis, closeRedis, getRedisCommandCount } from './db/redis.js';
import { Queue } from 'bullmq';
import { setPushQueue, isUserOffline, enqueuePushForUser } from './services/pushService.js';
import webpush from 'web-push';
import {
  joinRoomSchema,
  socketSendMessageSchema,
  typingSchema,
  rawWsMessageSchema
} from './validation.js';

dotenv.config();

// 1. Initialize Serverless Realtime Engine (Pusher Alternative to Socket.io)
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.PUSHER_CLUSTER || '',
  useTLS: true
});

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  process.env.FRONTEND_URL?.trim().replace(/\/$/, '')
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.trim().replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => cleanOrigin === allowed || cleanOrigin.startsWith(allowed)) ||
                      cleanOrigin.startsWith('http://localhost:') ||
                      cleanOrigin.endsWith('.vercel.app') ||
                      cleanOrigin.endsWith('.netlify.app') ||
                      cleanOrigin.endsWith('.onrender.com');

    if (isAllowed) return callback(null, true);
    return callback(new Error('Blocked by CORS'), false);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Simple memory store fallback for rate-limiting on stateless instances
const ipUploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const userUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  // Use the built‑in ipKeyGenerator for IPv6 safety; fall back to user ID when authenticated
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req)
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
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, displayName: payload.displayName };
    req.token = token;
    return next();
  } catch (err) {
    // Fallback to Supabase admin verification for test scripts / native Supabase sessions
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.display_name || user.email.split('@')[0]
        };
        req.token = token;
        return next();
      }
    } catch (sbErr) {}
    return res.status(401).json({ error: 'Invalid or expired session profile' });
  }
}

// REST Endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.use('/auth', authRouter);

// Pusher Channel Authentication Endpoint
app.post('/api/pusher/auth', requireAuth, (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  
  if (!socketId || !channel) {
    return res.status(400).send('Missing socket_id or channel_name');
  }

  // Presence channel extra info
  const presenceData = {
    user_id: req.user.id,
    user_info: {
      email: req.user.email,
      displayName: req.user.displayName || req.user.email.split('@')[0]
    }
  };
  
  try {
    const authResponse = pusher.authorizeChannel(socketId, channel, presenceData);
    return res.json(authResponse);
  } catch (err) {
    console.error('Pusher Auth error:', err.message);
    return res.status(403).send('Forbidden: ' + err.message);
  }
});

// Sync/Fetch Messages via REST HTTP
app.get('/messages', requireAuth, async (req, res) => {
  let { room_id, before, limit } = req.query;
  if (!room_id) return res.status(400).json({ error: 'room_id required' });
  if (room_id === 'general') room_id = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';
  
  try {
    const lim = parseInt(limit, 10) || 50;
    const { db } = await connectToDatabase();
    const query = { room_id };
    if (before) query._id = { $lt: before };
    
    const msgs = await db.collection('messages').find(query).sort({ _id: -1 }).limit(lim).toArray();
    msgs.reverse();
    return res.json({ messages: msgs, nextCursor: msgs.length ? msgs[0]._id : null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// File Upload directly to Cloudinary via API stream
app.post('/api/upload', requireAuth, ipUploadLimiter, userUploadLimiter, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file selected' });
    }

    // Enforce 10MB size limit for images
    if (req.file.mimetype.startsWith('image/') && req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image file size exceeds the 10MB limit' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'ekam/messages', resource_type: 'auto' },
      (error, result) => {
        if (error) return res.status(500).json({ error: 'Cloudinary error: ' + error.message });
        res.json({ secure_url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type || 'image' });
      }
    );
    uploadStream.end(req.file.buffer);
  });
});

async function isRateLimited(userId) {
  const key = `rate_limit:send_message:${userId}`;
  try {
    const current = await redisRest.incr(key);
    if (current === 1) {
      await redisRest.expire(key, 10);
    }
    return current > 20;
  } catch (err) {
    console.error("Redis rate limiter error:", err.message);
    return false;
  }
}

// Complete Transactional Write Flow
app.post('/api/messages', requireAuth, async (req, res) => {
  let { room_id, body, media_url, media_type } = req.body;
  if (!room_id || !body) return res.status(400).json({ error: 'Missing payload requirements' });
  if (room_id === 'general') room_id = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

  const sender_id = req.user.id; 

  // Rate limit check: max 20 messages / 10s
  const rateLimitExceeded = await isRateLimited(sender_id);
  if (rateLimitExceeded) {
    return res.status(429).json({ error: 'Rate limit exceeded: max 20 messages per 10 seconds' });
  }

  let mongoDoc = null;

  try {
    // Step 2: Write to MongoDB
    mongoDoc = await insertMessage({ room_id, sender_id, body, media_url, media_type, status: 'sent' });

    // Step 3: Write to relational database layer (Supabase) using admin client to bypass token mismatch issues
    const { data: supabaseMessage, error: supabaseError } = await supabaseAdmin
      .from('messages')
      .insert({ room_id, sender_id, content: body, media_url: media_url || null, media_type: media_type || null })
      .select('id').single();

    if (supabaseError || !supabaseMessage) throw new Error(supabaseError?.message || 'Supabase rejection');

    // Step 4: Interlink references inside MongoDB index context
    const { db } = await connectToDatabase();
    await db.collection('messages').updateOne({ _id: mongoDoc._id }, { $set: { supabase_id: supabaseMessage.id } });

    // Step 5: Broadcast real-time packet state over serverless web-hubs (Pusher)
    if (process.env.PUSHER_APP_ID) {
      await pusher.trigger(`room-${room_id}`, 'new-message', {
        _id: mongoDoc._id,
        room_id,
        sender_id,
        body,
        supabase_id: supabaseMessage.id,
        ts: Date.now()
      }).catch(e => console.error("Realtime Broadcast Skip:", e.message));
    }

    return res.status(201).json({ ...mongoDoc, supabase_id: supabaseMessage.id });
  } catch (err) {
    if (mongoDoc) {
      await deleteMessage(mongoDoc._id).catch(() => {});
    }
    return res.status(500).json({ error: 'Serverless execution rollback triggered: ' + err.message });
  }
});

// CRITICAL FOR VERCEL DEPLOYMENT: Export the plain app instance without calling server.listen()
export default app;

let ioInstance = null;

async function checkDatabaseSize() {
  try {
    const { db } = await connectToDatabase();
    const stats = await db.command({ dbStats: 1 });
    const storageSize = stats.storageSize || stats.dataSize || 0; // bytes
    const storageSizeMB = storageSize / (1024 * 1024);
    console.log(`📊 [MongoDB Monitor] Current database size: ${storageSizeMB.toFixed(2)} MB`);
    if (storageSizeMB >= 400) {
      console.warn(`⚠️ [MongoDB Monitor] WARNING: MongoDB database storage has reached ${storageSizeMB.toFixed(2)} MB, which is >= 80% of the 512 MB free tier limit!`);
    }
  } catch (err) {
    console.error('❌ Failed to check MongoDB storage size:', err.message);
  }
}

// Database query helpers
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

async function getRoomMembers(roomId) {
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

async function startServer() {
  console.log("🔗 Verifying external service connections...");
  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });
    await checkDatabaseSize();
    
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.api.ping();
    }
    
    const { error: pgError } = await supabaseAdmin.from('users').select('id').limit(1);
    if (pgError) throw pgError;

    await connectRedis();
    console.log("✅ Core Cloud services connected and validated.");
  } catch (err) {
    console.warn("⚠️ Service Startup Check Warning: " + err.message + " - Proceeding to allow partial boot.");
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const server = http.createServer(app);
  
  const io = new SocketIOServer(server, { 
    cors: { 
      origin: allowedOrigins,
      credentials: true
    } 
  });
  
  ioInstance = io;

  // Socket.IO authentication middleware
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

    // Join room with Zod payload validation
    socket.on('join_room', async (payload) => {
      try {
        const result = joinRoomSchema.safeParse(payload);
        if (!result.success) {
          return socket.emit('error', { event: 'join_room', error: 'Malformed payload: ' + JSON.stringify(result.error.format()) });
        }
        const roomId = payload.roomId || payload.room_id;
        const targetRoom = roomId === 'general' ? 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' : roomId;
        await socket.join(targetRoom);
      } catch (err) { console.error('Socket join_room error:', err.message); }
    });

    // Send message with Zod payload validation & Redis rate limiting
    socket.on('send_message', async (message, ack) => {
      try {
        // Zod input validation
        const normalized = {
          roomId: message?.roomId || message?.room_id,
          body: message?.body || message?.content,
          clientMessageId: message?.clientMessageId || message?.client_message_id || message?.id,
          mediaUrl: message?.mediaUrl || message?.media_url || '',
          mediaType: message?.mediaType || message?.media_type || ''
        };
        const validation = socketSendMessageSchema.safeParse(normalized);
        if (!validation.success) {
          const errData = { success: false, error: 'Malformed payload: ' + JSON.stringify(validation.error.format()) };
          if (typeof ack === 'function') ack(errData);
          socket.emit('error', errData);
          return;
        }

        let roomId = normalized.roomId;
        const clientMessageId = normalized.clientMessageId;
        const body = normalized.body;
        const mediaUrl = normalized.mediaUrl;
        const mediaType = normalized.mediaType;

        if (roomId === 'general') roomId = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

        // Redis-based Rate Limiter: max 20 messages / 10s
        const rateLimitExceeded = await isRateLimited(userId);
        if (rateLimitExceeded) {
          const rateErr = { success: false, error: 'Rate limit exceeded: max 20 messages per 10 seconds' };
          if (typeof ack === 'function') ack(rateErr);
          socket.emit('error', rateErr);
          return;
        }

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

    // Typing with Zod payload validation
    socket.on('typing', async (payload) => {
      try {
        const result = typingSchema.safeParse(payload);
        if (!result.success) {
          return socket.emit('error', { event: 'typing', error: 'Malformed payload: ' + JSON.stringify(result.error.format()) });
        }
        const roomId = payload.roomId || payload.room_id;
        const isTyping = payload.isTyping;
        const members = await getRoomMembers(roomId);
        if (members.includes(userId)) {
          socket.to(roomId).emit('typing.changed', { roomId, userId, isTyping });
        }
      } catch (err) {
        console.error('Socket typing error:', err.message);
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

  // Raw WebSocket server implementation
  const wss = new WebSocketServer({ noServer: true });
  
  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/socket.io')) return;
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
        // Zod payload validation for raw ws message
        const result = rawWsMessageSchema.safeParse(parsed);
        if (!result.success) {
          ws.send(JSON.stringify({ event: 'error', message: 'Malformed message payload: ' + JSON.stringify(result.error.format()) }));
          return;
        }

        if (!isAuthenticated) {
          if (authFailed) return;
          pendingMessages.push(parsed);
        } else {
          handleParsedMessage(parsed);
        }
      } catch (err) {
        ws.send(JSON.stringify({ event: 'error', message: 'Malformed JSON payload' }));
      }
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

  const sweeperInterval = setInterval(() => {
    const now = Date.now();
    wss.clients.forEach((ws) => {
      if (now - ws.lastActivity > 30000) {
        console.log(`🧹 Sweeping stale raw WebSocket connection for user: ${ws.userId}`);
        ws.terminate();
      }
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

  server.listen(PORT, () => {
    console.log(`SERVER_PORT=${server.address().port}`);
    console.log(`🚀 Unified Node Server Running on Port: ${server.address().port}`);
  });

  process.on('SIGTERM', async () => {
    clearInterval(sweeperInterval);
    wss.close();
    await closeRedis();
    process.exit(0);
  });
}

if (!process.env.VERCEL) {
  startServer();
}