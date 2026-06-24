// auth/controller.js
import express from 'express';
import { supabaseAdmin, createSupabaseUserClient } from '../db/supabase.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './utils/jwt.js';
import { hashToken, compareToken } from './utils/hash.js';
import { insertRefreshToken, deleteRefreshToken, findRefreshToken } from '../db/refreshTokens.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'email, password, and displayName required' });
  }
  try {
    const { data: user, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (error) return res.status(400).json({ error: error.message });
    // Auto‑login after registration
    const payload = { sub: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const hashed = await hashToken(refreshToken);
    await insertRefreshToken(user.id, hashed, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30d
    // Set HttpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
    return res.json({ accessToken });
  } catch (e) {
    console.error('Register error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  try {
    const { data: user, error: authErr } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (authErr || !user) return res.status(401).json({ error: authErr?.message || 'Invalid credentials' });
    const payload = { sub: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const hashed = await hashToken(refreshToken);
    await insertRefreshToken(user.id, hashed, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
    return res.json({ accessToken });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token missing' });
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const stored = await findRefreshToken(decoded.sub);
    if (!stored) return res.status(401).json({ error: 'Refresh token not recognized' });
    const match = await compareToken(refreshToken, stored.tokenHash);
    if (!match) return res.status(401).json({ error: 'Invalid refresh token' });
    // Issue new access token (keep same payload)
    const newAccess = signAccessToken({ sub: decoded.sub, email: decoded.email });
    return res.json({ accessToken: newAccess });
  } catch (e) {
    console.error('Refresh error:', e);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// Logout – invalidate refresh token
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      await deleteRefreshToken(decoded.sub);
    } catch (_) {}
  }
  res.clearCookie('refreshToken');
  return res.json({ success: true });
});

// Me – returns current user (protected)
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyRefreshToken(token); // using access token verify would also work
    const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('id', payload.sub).single();
    if (error) throw error;
    return res.json({ user });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
