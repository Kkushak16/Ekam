// validation.js
import { z } from 'zod';

export const joinRoomSchema = z.object({
  roomId: z.string()
});

export const sendMessageSchema = z.object({
  roomId: z.string(),
  body: z.string(),
  media_url: z.string().url().optional(),
  media_type: z.string().optional()
});

export const ackSchema = z.object({
  messageId: z.string()
});

export const readSchema = z.object({
  messageId: z.string()
});
