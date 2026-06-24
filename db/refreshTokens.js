// db/refreshTokens.js
import { connectToDatabase } from './mongodb.js';
import { ulid } from 'ulid';

/** Insert a refresh token record (hashed) */
export async function insertRefreshToken(userId, tokenHash, expiresAt) {
  const { db } = await connectToDatabase();
  const doc = {
    _id: ulid(),
    userId,
    tokenHash,
    expiresAt,
    createdAt: new Date()
  };
  await db.collection('refreshTokens').insertOne(doc);
  return doc;
}

/** Find a valid refresh token for a user */
export async function findRefreshToken(userId) {
  const { db } = await connectToDatabase();
  const now = new Date();
  const doc = await db.collection('refreshTokens').findOne({
    userId,
    expiresAt: { $gt: now }
  });
  return doc;
}

/** Delete refresh token(s) for a user – used on logout */
export async function deleteRefreshToken(userId) {
  const { db } = await connectToDatabase();
  await db.collection('refreshTokens').deleteMany({ userId });
}
