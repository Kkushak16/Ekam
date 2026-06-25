// auth/controller.js
import express from 'express';
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
  const { email, password, displayName, username } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'email, password, and displayName are required' });
  }

  // Basic email format check
  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address (e.g. you@gmail.com)' });
  }

  // Derive username from displayName if not provided (lowercase, no spaces)
  const derivedUsername = (username || displayName).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
        username: derivedUsername,
      }
    });

    if (error) {
      // Friendly duplicate-email message
      if (error.message?.toLowerCase().includes('already registered') ||
          error.message?.toLowerCase().includes('already exists') ||
          error.message?.toLowerCase().includes('unique') ||
          error.code === '23505') {
        return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
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
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Login (email OR username) ──────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email: identifier, password } = req.body;   // field named "email" in body but may be username
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
    return res.status(500).json({ error: 'Internal server error' });
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
