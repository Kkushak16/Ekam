// auth/utils/hash.js
import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 12;

export async function hashToken(token) {
  return bcrypt.hash(token, SALT_ROUNDS);
}

export async function compareToken(token, hash) {
  return bcrypt.compare(token, hash);
}
