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

export const typingSchema = z.object({
  roomId: z.string().min(1),
  isTyping: z.boolean()
});

export const socketSendMessageSchema = z.object({
  roomId: z.string().min(1),
  body: z.string().min(1),
  clientMessageId: z.string().optional(),
  mediaUrl: z.string().url().or(z.literal('')).nullable().optional(),
  mediaType: z.string().nullable().optional()
});

export const rawWsMessageSchema = z.object({
  type: z.string().min(1)
});
