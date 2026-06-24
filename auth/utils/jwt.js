// auth/utils/jwt.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const accessSecret = process.env.JWT_ACCESS_SECRET || jwtSecret;
const refreshSecret = process.env.JWT_REFRESH_SECRET || jwtSecret;

if (!accessSecret || !refreshSecret) {
  console.error('❌ Missing JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET, or a single fallback JWT_SECRET.');
  process.exit(1);
}

/**
 * Sign an access token (short‑lived).
 * Payload should contain at least `sub` (user id) and optional claims.
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, accessSecret, { expiresIn: '15m' });
}

/**
 * Sign a refresh token (long‑lived).
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, refreshSecret, { expiresIn: '30d' });
}

/** Verify access token */
export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret);
}

/** Verify refresh token */
export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret);
}
