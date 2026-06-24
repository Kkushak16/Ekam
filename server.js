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
import { createSupabaseUserClient } from './db/supabase.js';
import authRouter from './auth/controller.js';
import { verifyAccessToken } from './auth/utils/jwt.js';

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
app.use(cookieParser());

// Simple memory store fallback for rate-limiting on stateless instances
const ipUploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const userUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  // Use the built‑in ipKeyGenerator for IPv6 safety; fall back to user ID when authenticated
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req)
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
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
    req.user = { id: payload.sub, email: payload.email };
    req.token = token;
    return next();
  } catch (err) {
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
      email: req.user.email
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
    if (err || !req.file) return res.status(400).json({ error: err?.message || 'No file selected' });

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'ekam/messages', resource_type: 'auto' },
      (error, result) => {
        if (error) return res.status(500).json({ error: 'Cloudinary error: ' + error.message });
        res.json({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    uploadStream.end(req.file.buffer);
  });
});

// Complete Transactional Write Flow
app.post('/api/messages', requireAuth, async (req, res) => {
  let { room_id, body, media_url, media_type } = req.body;
  if (!room_id || !body) return res.status(400).json({ error: 'Missing payload requirements' });
  if (room_id === 'general') room_id = 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a';

  const sender_id = req.user.id; 
  let mongoDoc = null;

  try {
    // Step 2: Write to MongoDB
    mongoDoc = await insertMessage({ room_id, sender_id, body, media_url, media_type, status: 'sent' });

    // Step 3: Write to relational database layer (Supabase)
    const userSupabaseClient = createSupabaseUserClient(req.token);
    const { data: supabaseMessage, error: supabaseError } = await userSupabaseClient
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

// Start the server only in non‑production (local dev) environments
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
}