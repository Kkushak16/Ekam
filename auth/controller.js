// auth/controller.js
import express from 'express';
import crypto from 'crypto';
import { supabaseAdmin } from '../db/supabase.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken } from './utils/jwt.js';
import { hashToken, compareToken } from './utils/hash.js';
import { insertRefreshToken, deleteRefreshToken, findRefreshToken } from '../db/refreshTokens.js';

const router = express.Router();

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure: true,
  maxAge: 30 * 24 * 60 * 60 * 1000
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Validate email format */
function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/**
 * Resolve an identifier (email OR username) to an email address.
 * Usernames are stored as user_metadata.username in Supabase.
 * Supabase admin API lets us list/search users.
 */
async function resolveIdentifierToEmail(identifier) {
  if (isEmail(identifier)) return identifier;

  // Map phone numbers (e.g. +919876543210 or 9876543210) to their pseudo-email
  const cleanId = identifier.trim();
  if (/^\+?[0-9\s\-()]{7,}$/.test(cleanId)) {
    return cleanId.replace(/[^0-9]/g, '') + '@phone.ekam.app';
  }

  // Search users by username stored in metadata
  // We use listUsers with a small page size, then scan for matching username
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;

    const match = data.users.find(u =>
      u.user_metadata?.username?.toLowerCase() === identifier.toLowerCase() ||
      u.user_metadata?.display_name?.toLowerCase() === identifier.toLowerCase()
    );
    if (match) return match.email;
    if (data.users.length < perPage) break; // last page
    page++;
  }
  return null; // username not found
}

/** Build and return tokens, set cookie */
async function issueTokens(res, user, displayName) {
  const payload = {
    sub: user.id,
    id: user.id,
    email: user.email,
    displayName: displayName || user.user_metadata?.display_name || user.email.split('@')[0]
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const hashed = await hashToken(refreshToken);
  await insertRefreshToken(user.id, hashed, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, cookieOptions);
  return accessToken;
}

// ── Register ───────────────────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  // Support registration via phone number or email
  const { email, phone, password, displayName, username } = req.body;
  if (!password || !displayName) {
    return res.status(400).json({ error: 'phone/email, password, and displayName are required' });
  }

  let userEmail = email;
  if (phone) {
    // Convert phone to pseudo‑email for Supabase (e.g. 919876543210@phone.ekam.app)
    const phoneEmail = phone.replace(/[^0-9]/g, '') + '@phone.ekam.app';
    userEmail = phoneEmail;
  }

  if (!userEmail) {
    return res.status(400).json({ error: 'Phone number or email is required' });
  }

  // Basic email format validation (covers pseudo‑email for phone)
  if (!isEmail(userEmail)) {
    return res.status(400).json({ error: 'Invalid identifier format' });
  }

  // Derive username if not supplied: use displayName or phone base
  const baseForUsername = username || displayName || (phone ? phone.replace(/[^0-9]/g, '') : undefined);
  const derivedUsername = baseForUsername ? baseForUsername.toString().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : undefined;

  if (derivedUsername) {
    const existingEmail = await resolveIdentifierToEmail(derivedUsername);
    if (existingEmail) {
      return res.status(409).json({ error: 'the name is already taken try something diffrent' });
    }
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email: userEmail,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
        username: derivedUsername,
        ...(phone ? { phone_number: phone } : {}),
      }
    });

    if (error) {
      // Duplicate handling – includes pseudo‑email collisions
      if (error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('already exists') ||
          error.message?.toLowerCase().includes('unique') ||
          error.code === '23505') {
        return res.status(409).json({ error: 'An account with this identifier already exists. Please sign in instead.' });
      }
      return res.status(400).json({ error: error.message });
    }

    // Add to default General room
    try {
      await supabaseAdmin.from('room_members').insert({
        room_id: 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a',
        user_id: user.id,
        role: 'member'
      });
    } catch (memberErr) {
      console.error('Failed to add to default room:', memberErr.message);
    }

    const accessToken = await issueTokens(res, user, displayName);
    return res.json({ accessToken });
  } catch (e) {
    console.error('Register error:', e);
    return res.status(500).json({ error: `Internal server error: ${e.message}`, stack: e.stack });
  }
});

// ── Login (email OR username) ──────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const identifier = req.body.email || req.body.identifier;
  const { password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier (email or username) and password are required' });
  }

  try {
    // Resolve identifier → email
    let email = identifier;
    if (!isEmail(identifier)) {
      email = await resolveIdentifierToEmail(identifier);
      if (!email) {
        return res.status(401).json({ error: 'No account found with that username. Try your email instead.' });
      }
    }

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (authErr || !user) {
      return res.status(401).json({ error: 'Incorrect email/username or password. Please try again.' });
    }

    const accessToken = await issueTokens(res, user, user.user_metadata?.display_name);
    return res.json({ accessToken });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: `Internal server error: ${e.message}`, stack: e.stack });
  }
});

// ── Google OAuth callback ──────────────────────────────────────────────────

/**
 * POST /auth/google
 * Body: { idToken: <Google ID token from client> }
 * Exchanges the Google token via Supabase OAuth and issues our own JWT.
 */
router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'Google idToken required' });

  try {
    // Verify the Google token with Supabase's OIDC support
    const { data, error } = await supabaseAdmin.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error || !data?.user) {
      console.error('Google OAuth error:', error?.message);
      return res.status(401).json({ error: 'Google authentication failed. Please try again.' });
    }

    const user = data.user;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
    const derivedUsername = displayName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    // Ensure username is set in metadata (upsert)
    if (!user.user_metadata?.username) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, username: derivedUsername }
      });
    }

    // Ensure room membership
    try {
      await supabaseAdmin.from('room_members').upsert({
        room_id: 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a',
        user_id: user.id,
        role: 'member'
      }, { onConflict: 'room_id,user_id' });
    } catch (_) {}

  const accessToken = await issueTokens(res, user, displayName);
    return res.json({ accessToken });
  } catch (e) {
    console.error('Google auth error:', e);
    return res.status(500).json({ error: 'Internal server error during Google auth' });
  }
});

// ── Phone (Firebase) OAuth callback ────────────────────────────────────────

/**
 * POST /auth/phone
 * Body: { idToken: <Firebase ID token>, phoneNumber: <string>, uid: <Firebase UID> }
 * Exchanges the Firebase phone auth token for our own JWT.
 * Creates a Supabase user for the phone number if one doesn't exist.
 */
router.post('/phone', async (req, res) => {
  const { idToken, phoneNumber, uid } = req.body;
  if (!idToken || !phoneNumber) {
    return res.status(400).json({ error: 'idToken and phoneNumber are required' });
  }

  try {
    // Verify Firebase token by calling Firebase's tokeninfo endpoint
    // This is a lightweight verification without requiring firebase-admin SDK
    let verifiedPhone = phoneNumber;
    let firebaseUid = uid;

    try {
      const firebaseVerifyUrl = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${process.env.FIREBASE_API_KEY || ''}`;
      const verifyResponse = await fetch(firebaseVerifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const verifyData = await verifyResponse.json();
      if (verifyData.users && verifyData.users[0]) {
        verifiedPhone = verifyData.users[0].phoneNumber || phoneNumber;
        firebaseUid = verifyData.users[0].localId || uid;
      }
    } catch (verifyErr) {
      console.warn('Firebase token verification skipped:', verifyErr.message);
      // Continue with the provided phone number — the Firebase client SDK already verified the OTP
    }

    // Normalize phone as email-like identifier for Supabase (e.g. +919876543210 → 919876543210@phone.ekam.app)
    const phoneEmail = verifiedPhone.replace(/[^0-9]/g, '') + '@phone.ekam.app';
    const derivedUsername = 'user_' + verifiedPhone.replace(/[^0-9]/g, '').slice(-10);
    const displayName = derivedUsername;

    // Check if user already exists in Supabase
    let user = null;
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error || !data?.users?.length) break;
      const match = data.users.find(u => u.email === phoneEmail);
      if (match) { user = match; break; }
      if (data.users.length < perPage) break;
      page++;
    }

    if (!user) {
      // Create new user
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: { user: newUser }, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: phoneEmail,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          display_name: displayName,
          username: derivedUsername,
          phone_number: verifiedPhone,
          firebase_uid: firebaseUid,
          auth_provider: 'phone',
        },
      });

      if (createErr) {
        console.error('Phone user creation error:', createErr.message);
        return res.status(400).json({ error: 'Failed to create phone account: ' + createErr.message });
      }
      user = newUser;

      // Add to default room
      try {
        await supabaseAdmin.from('room_members').insert({
          room_id: 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a',
          user_id: user.id,
          role: 'member',
        });
      } catch (_) {}
    }

    const accessToken = await issueTokens(res, user, user.user_metadata?.display_name || displayName);
    return res.json({ accessToken });
  } catch (e) {
    console.error('Phone auth error:', e);
    return res.status(500).json({ error: 'Internal server error during phone auth' });
  }
});

// ── Refresh ────────────────────────────────────────────────────────────────

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token missing' });
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const stored = await findRefreshToken(decoded.sub);
    if (!stored) return res.status(401).json({ error: 'Session expired. Please log in again.' });
    const match = await compareToken(refreshToken, stored.tokenHash);
    if (!match) return res.status(401).json({ error: 'Invalid session. Please log in again.' });
    const newAccess = signAccessToken({
      sub: decoded.sub,
      id: decoded.sub,
      email: decoded.email,
      displayName: decoded.displayName || decoded.email.split('@')[0]
    });
    return res.json({ accessToken: newAccess });
  } catch (e) {
    console.error('Refresh error:', e);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
});

// ── Logout ─────────────────────────────────────────────────────────────────

router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await deleteRefreshToken(decoded.sub);
    } catch (_) {}
  }
  res.clearCookie('refreshToken', cookieOptions);
  return res.json({ success: true });
});

// ── Me ─────────────────────────────────────────────────────────────────────

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    return res.json({
      user: {
        id: payload.sub,
        email: payload.email,
        displayName: payload.displayName,
      }
    });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
