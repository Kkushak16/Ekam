// auth/jwt.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not set in environment');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const jwtAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // assuming token contains user payload
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token: ' + err.message });
  }
};
