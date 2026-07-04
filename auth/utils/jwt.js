// auth/utils/jwt.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Resolve secrets lazily — read env vars at module load but don't crash the process.
const jwtSecret = process.env.JWT_SECRET;
const accessSecret = process.env.JWT_ACCESS_SECRET || jwtSecret;
const refreshSecret = process.env.JWT_REFRESH_SECRET || jwtSecret;

if (!accessSecret || !refreshSecret) {
  console.warn('⚠️ Missing JWT secrets. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET, or a single fallback JWT_SECRET.');
  console.warn('   Auth endpoints will return 500 until secrets are configured.');
  // Do NOT process.exit — let the app boot so non-auth routes (e.g. /health) still work.
}

/** Helper: throw at call-time if a secret is missing */
function requireSecret(secret, name) {
  if (!secret) {
    throw new Error(`JWT ${name} is not configured. Set the corresponding environment variable.`);
  }
  return secret;
}

/**
 * Sign an access token (short‑lived).
 * Payload should contain at least `sub` (user id) and optional claims.
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, requireSecret(accessSecret, 'ACCESS_SECRET'), { expiresIn: '30d' });
}

/**
 * Sign a refresh token (long‑lived).
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, requireSecret(refreshSecret, 'REFRESH_SECRET'), { expiresIn: '30d' });
}

/** Verify access token */
export function verifyAccessToken(token) {
  return jwt.verify(token, requireSecret(accessSecret, 'ACCESS_SECRET'));
}

/** Verify refresh token */
export function verifyRefreshToken(token) {
  return jwt.verify(token, requireSecret(refreshSecret, 'REFRESH_SECRET'));
}
