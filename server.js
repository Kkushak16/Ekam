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
  // Use the builtâ€‘in ipKeyGenerator for IPv6 safety; fall back to user ID when authenticated
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

import crypto from 'crypto';

// REST Endpoints
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));
app.get('/api/diagnose', (req, res) => {
  const mask = (val) => {
    if (!val) return 'MISSING';
    if (val.length <= 6) return '***';
    return val.substring(0, 3) + '...' + val.substring(val.length - 3);
  };
  const expectedUri = 'mongodb+srv://<db_username>:<db_password>@cluster0.xxxx.mongodb.net/ekam?retryWrites=true&w=majority';
  res.json({
    MONGODB_URI: mask(process.env.MONGODB_URI || process.env.MONGO_URI),
    MONGODB_URI_MATCHES_LOCAL: (process.env.MONGODB_URI || process.env.MONGO_URI) === expectedUri,
    SUPABASE_URL: mask(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: mask(process.env.SUPABASE_SERVICE_ROLE_KEY),
    JWT_SECRET: mask(process.env.JWT_SECRET),
    JWT_ACCESS_SECRET: mask(process.env.JWT_ACCESS_SECRET),
    JWT_REFRESH_SECRET: mask(process.env.JWT_REFRESH_SECRET),
    PUSHER_APP_ID: mask(process.env.PUSHER_APP_ID),
    CLOUDINARY_CLOUD_NAME: mask(process.env.CLOUDINARY_CLOUD_NAME)
  });
});
app.use('/auth', authRouter);

// Search users in Supabase by display_name, email, or username
app.get('/api/users/search', requireAuth, async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim()) {
    return res.json({ users: [] });
  }

  try {
    const queryStr = q.trim();
    
    // 1. Try querying with the username column
    try {
      const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('id, display_name, email, avatar_url, status, username')
        .or(`display_name.ilike.%${queryStr}%,email.ilike.%${queryStr}%,username.ilike.%${queryStr}%`)
        .neq('id', req.user.id)
        .limit(20);

      if (!error && users) {
        return res.json({ users });
      }
      
      if (error && !error.message.includes('column') && !error.message.includes('does not exist')) {
        throw error;
      }
    } catch (dbErr) {
      // Fall through to fallback
    }

    // 2. Fallback: query without username column, then fetch usernames from auth
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, display_name, email, avatar_url, status')
      .or(`display_name.ilike.%${queryStr}%,email.ilike.%${queryStr}%`)
      .neq('id', req.user.id)
      .limit(20);

    if (error) {
      throw error;
    }

    // Fetch auth users to see if we can match by username metadata
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const authUsers = authData?.users || [];

    const queryLower = queryStr.toLowerCase();
    const mergedUsers = (users || []).map(u => {
      const au = authUsers.find(a => a.id === u.id);
      return {
        ...u,
        username: au?.user_metadata?.username || u.email.split('@')[0]
      };
    });

    // Also add any auth users that match by username but weren't in the DB search
    for (const au of authUsers) {
      if (au.id === req.user.id) continue;
      const username = au.user_metadata?.username?.toLowerCase() || '';
      if (username.includes(queryLower)) {
        if (!mergedUsers.some(u => u.id === au.id)) {
          mergedUsers.push({
            id: au.id,
            display_name: au.user_metadata?.display_name || au.email.split('@')[0],
            email: au.email,
            avatar_url: au.user_metadata?.avatar_url || null,
            status: 'offline',
            username: au.user_metadata?.username
          });
        }
      }
    }

    return res.json({ users: mergedUsers.slice(0, 20) });
  } catch (err) {
    console.error('Error searching users:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Add a friend (Send request or accept if already sent by the other user)
app.post('/api/friends', requireAuth, async (req, res) => {
  const { friend_id, message } = req.body;
  if (!friend_id) {
    return res.status(400).json({ error: 'friend_id is required' });
  }
  if (friend_id === req.user.id) {
    return res.status(400).json({ error: 'You cannot add yourself as a friend' });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Check if friendship or request already exists
    const existing = await db.collection('friendships').findOne({
      users: { $all: [req.user.id, friend_id] }
    });

    if (existing) {
      if (!existing.status || existing.status === 'accepted') {
        return res.status(400).json({ error: 'You are already friends with this user' });
      }
      if (existing.status === 'pending') {
        if (existing.sender_id === req.user.id) {
          return res.status(400).json({ error: 'Friend request already sent' });
        } else {
          // The other user sent a request to us, so clicking Add Friend accepts it!
          return await acceptFriendship(req.user.id, friend_id, existing._id, res);
        }
      }
    }

    // Insert pending friendship request
    await db.collection('friendships').insertOne({
      users: [req.user.id, friend_id],
      status: 'pending',
      sender_id: req.user.id,
      message: message || '',
      created_at: new Date()
    });

    return res.status(201).json({ message: 'Friend request sent successfully' });
  } catch (err) {
    console.error('Error sending friend request:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Helper function to accept friendship and create DM room
async function acceptFriendship(userId, friendId, friendshipId, res) {
  const { db } = await connectToDatabase();
  
  await db.collection('friendships').updateOne(
    { _id: friendshipId },
    { $set: { status: 'accepted' } }
  );

  // Automatically create a DM room in Supabase for them so they can chat
  const { data: friendUser } = await supabaseAdmin
    .from('users')
    .select('display_name')
    .eq('id', friendId)
    .single();

  const { data: meUser } = await supabaseAdmin
    .from('users')
    .select('display_name')
    .eq('id', userId)
    .single();

  const friendName = friendUser?.display_name || 'User';
  const myName = meUser?.display_name || 'User';
  const roomName = `${myName} & ${friendName} DM`;

  const roomId = crypto.randomUUID();
  
  // Insert room in Supabase
  const { error: roomError } = await supabaseAdmin
    .from('rooms')
    .insert({
      id: roomId,
      name: roomName,
      created_by: userId,
      type: 'dm'
    });

  if (!roomError) {
    // Add memberships
    await supabaseAdmin.from('room_members').insert([
      { room_id: roomId, user_id: userId, role: 'member' },
      { room_id: roomId, user_id: friendId, role: 'member' }
    ]);
  }

  return res.status(200).json({ message: 'Friend request accepted', room_id: roomId });
}

// Accept a friend request
app.post('/api/friends/accept', requireAuth, async (req, res) => {
  const { friend_id } = req.body;
  if (!friend_id) {
    return res.status(400).json({ error: 'friend_id is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const existing = await db.collection('friendships').findOne({
      users: { $all: [req.user.id, friend_id] },
      status: 'pending'
    });

    if (!existing) {
      return res.status(404).json({ error: 'No pending friend request found' });
    }

    return await acceptFriendship(req.user.id, friend_id, existing._id, res);
  } catch (err) {
    console.error('Error accepting friend request:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Decline a friend request
app.post('/api/friends/decline', requireAuth, async (req, res) => {
  const { friend_id } = req.body;
  if (!friend_id) {
    return res.status(400).json({ error: 'friend_id is required' });
  }

  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('friendships').deleteOne({
      users: { $all: [req.user.id, friend_id] },
      status: 'pending'
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No pending friend request found' });
    }

    return res.json({ message: 'Friend request declined successfully' });
  } catch (err) {
    console.error('Error declining friend request:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Get incoming friend requests
app.get('/api/friends/requests', requireAuth, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const pendingRequests = await db.collection('friendships').find({
      users: req.user.id,
      status: 'pending',
      sender_id: { $ne: req.user.id }
    }).toArray();

    if (pendingRequests.length === 0) {
      return res.json({ requests: [] });
    }

    const senderIds = pendingRequests.map(r => r.sender_id);

    // Fetch user details from Supabase
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, display_name, email, avatar_url, status')
      .in('id', senderIds);

    if (error) throw error;

    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const authUsers = authData?.users || [];

    const mappedRequests = pendingRequests.map(reqDoc => {
      const u = (users || []).find(user => user.id === reqDoc.sender_id);
      const au = authUsers.find(a => a.id === reqDoc.sender_id);
      return {
        id: reqDoc.sender_id,
        message: reqDoc.message,
        created_at: reqDoc.created_at,
        display_name: u?.display_name || u?.email?.split('@')[0] || 'User',
        email: u?.email,
        avatar_url: u?.avatar_url,
        username: au?.user_metadata?.username || u?.email?.split('@')[0]
      };
    });

    return res.json({ requests: mappedRequests });
  } catch (err) {
    console.error('Error getting friend requests:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Get current user's profile
app.get('/api/users/me', requireAuth, async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, display_name, email, avatar_url, status, username')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Fetch activity description from MongoDB
    const { db } = await connectToDatabase();
    const activityDoc = await db.collection('user_activities').findOne({ userId: req.user.id });
    user.activity_description = activityDoc ? activityDoc.activity_description : null;

    return res.json({ user });
  } catch (err) {
    console.error('Error fetching current user profile:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Update current user's activity description
app.put('/api/users/activity', requireAuth, async (req, res) => {
  const { activity_description } = req.body;
  if (activity_description === undefined) {
    return res.status(400).json({ error: 'activity_description is required' });
  }

  try {
    const { db } = await connectToDatabase();
    await db.collection('user_activities').updateOne(
      { userId: req.user.id },
      { $set: { activity_description, updatedAt: new Date() } },
      { upsert: true }
    );

    return res.json({ message: 'Activity description updated successfully', activity_description });
  } catch (err) {
    console.error('Error updating activity description:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Get all friends (only accepted/existing ones)
app.get('/api/friends', requireAuth, async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Find all accepted friendships for current user
    const friendships = await db.collection('friendships').find({
      users: req.user.id,
      status: { $ne: 'pending' }
    }).toArray();

    if (friendships.length === 0) {
      return res.json({ friends: [] });
    }

    // Extract friend IDs
    const friendIds = friendships.map(f => f.users.find(id => id !== req.user.id));

    let users = [];
    // Try fetching with username column first
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, display_name, email, avatar_url, status, username')
        .in('id', friendIds);

      if (!error && data) {
        users = data;
      } else {
        if (error && !error.message.includes('column') && !error.message.includes('does not exist')) {
          throw error;
        }
      }
    } catch (dbErr) {
      // Fall through to fallback
    }

    if (users.length === 0) {
      // Fallback: fetch without username, then merge from auth users
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, display_name, email, avatar_url, status')
        .in('id', friendIds);

      if (error) {
        throw error;
      }

      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      const authUsers = authData?.users || [];

      users = (data || []).map(u => {
        const au = authUsers.find(a => a.id === u.id);
        return {
          ...u,
          username: au?.user_metadata?.username || u.email.split('@')[0]
        };
      });
    }

    // Fetch activity descriptions from MongoDB for all these friends
    const activities = await db.collection('user_activities').find({
      userId: { $in: users.map(u => u.id) }
    }).toArray();

    const friendsWithActivity = users.map(u => {
      const act = activities.find(a => a.userId === u.id);
      return {
        ...u,
        activity_description: act ? act.activity_description : null
      };
    });

    return res.json({ friends: friendsWithActivity });
  } catch (err) {
    console.error('Error getting friends:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Get group rooms
app.get('/api/rooms/groups', requireAuth, async (req, res) => {
  try {
    const { data: rooms, error } = await supabaseAdmin
      .from('rooms')
      .select('id, name, created_by, type, created_at')
      .eq('type', 'group');
    if (error) throw error;
    return res.json({ rooms });
  } catch (err) {
    console.error('Error fetching group rooms:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Create group room
app.post('/api/rooms/groups', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Group name is required' });
  }
  try {
    const roomId = crypto.randomUUID();
    const { data: room, error } = await supabaseAdmin
      .from('rooms')
      .insert({
        id: roomId,
        name: name.trim(),
        created_by: req.user.id,
        type: 'group'
      })
      .select()
      .single();
    if (error) throw error;

    // Also add the creator as a member of the group
    await supabaseAdmin.from('room_members').insert({
      room_id: roomId,
      user_id: req.user.id,
      role: 'admin'
    });

    return res.status(201).json({ room });
  } catch (err) {
    console.error('Error creating group room:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Get or create DM room with a friend
app.post('/api/rooms/dm', requireAuth, async (req, res) => {
  const { friendId } = req.body;
  if (!friendId) {
    return res.status(400).json({ error: 'friendId is required' });
  }

  const userId = req.user.id;

  try {
    // 1. Find if a DM room already exists between userId and friendId
    const { data: myMemberships, error: myError } = await supabaseAdmin
      .from('room_members')
      .select('room_id')
      .eq('user_id', userId);

    if (myError) throw myError;

    const { data: friendMemberships, error: friendError } = await supabaseAdmin
      .from('room_members')
      .select('room_id')
      .eq('user_id', friendId);

    if (friendError) throw friendError;

    const myRoomIds = myMemberships.map(m => m.room_id);
    const friendRoomIds = friendMemberships.map(m => m.room_id);

    const commonRoomIds = myRoomIds.filter(id => friendRoomIds.includes(id));

    if (commonRoomIds.length > 0) {
      const { data: dmRooms, error: dmError } = await supabaseAdmin
        .from('rooms')
        .select('id')
        .in('id', commonRoomIds)
        .eq('type', 'dm')
        .limit(1);

      if (dmError) throw dmError;

      if (dmRooms && dmRooms.length > 0) {
        return res.json({ room_id: dmRooms[0].id });
      }
    }

    // 2. If no DM room exists, create one
    const { data: friendUser } = await supabaseAdmin
      .from('users')
      .select('display_name')
      .eq('id', friendId)
      .single();

    const { data: meUser } = await supabaseAdmin
      .from('users')
      .select('display_name')
      .eq('id', userId)
      .single();

    const friendName = friendUser?.display_name || 'User';
    const myName = meUser?.display_name || 'User';
    const roomName = `${myName} & ${friendName} DM`;

    const roomId = crypto.randomUUID();

    const { error: roomError } = await supabaseAdmin
      .from('rooms')
      .insert({
        id: roomId,
        name: roomName,
        created_by: userId,
        type: 'dm'
      });

    if (roomError) throw roomError;

    const { error: memberError } = await supabaseAdmin
      .from('room_members')
      .insert([
        { room_id: roomId, user_id: userId, role: 'member' },
        { room_id: roomId, user_id: friendId, role: 'member' }
      ]);

    if (memberError) throw memberError;

    return res.json({ room_id: roomId });
  } catch (err) {
    console.error('Error getting/creating DM room:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Get room details by ID (resolving DM names dynamically)
app.get('/api/rooms/:roomId', requireAuth, async (req, res) => {
  const { roomId } = req.params;
  try {
    const { data: room, error } = await supabaseAdmin
      .from('rooms')
      .select('id, name, type, created_by')
      .eq('id', roomId)
      .single();

    if (error || !room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.type === 'dm') {
      const { data: members, error: memberError } = await supabaseAdmin
        .from('room_members')
        .select('user_id')
        .eq('room_id', roomId);

      if (!memberError && members) {
        const otherMember = members.find(m => m.user_id !== req.user.id);
        if (otherMember) {
          const { data: otherUser } = await supabaseAdmin
            .from('users')
            .select('display_name')
            .eq('id', otherMember.user_id)
            .single();
          if (otherUser) {
            room.name = otherUser.display_name;
          }
        }
      }
    }

    return res.json({ room });
  } catch (err) {
    console.error('Error fetching room details:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

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

let ioInstance = null;

async function checkDatabaseSize() {
  try {
    const { db } = await connectToDatabase();
    const stats = await db.command({ dbStats: 1 });
    const storageSize = stats.storageSize || stats.dataSize || 0; // bytes
    const storageSizeMB = storageSize / (1024 * 1024);
    console.log(`ðŸ“Š [MongoDB Monitor] Current database size: ${storageSizeMB.toFixed(2)} MB`);
    if (storageSizeMB >= 400) {
      console.warn(`âš ï¸ [MongoDB Monitor] WARNING: MongoDB database storage has reached ${storageSizeMB.toFixed(2)} MB, which is >= 80% of the 512 MB free tier limit!`);
    }
  } catch (err) {
    console.error('âŒ Failed to check MongoDB storage size:', err.message);
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
  console.log("ðŸ”— Verifying external service connections...");
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
    console.log("âœ… Core Cloud services connected and validated.");
  } catch (err) {
    console.warn("âš ï¸ Service Startup Check Warning: " + err.message + " - Proceeding to allow partial boot.");
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
        console.log(`ðŸ§¹ Sweeping stale raw WebSocket connection for user: ${ws.userId}`);
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
    console.log(`ðŸš€ Unified Node Server Running on Port: ${server.address().port}`);
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

export default app;